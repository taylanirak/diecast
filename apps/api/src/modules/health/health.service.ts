/**
 * Health Service
 * Checks connectivity to all data services:
 * - PostgreSQL (primary database)
 * - Redis (caching, sessions, queues)
 * - Elasticsearch (search)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface DetailedHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    postgresql: ServiceHealth;
    redis: ServiceHealth;
    elasticsearch: ServiceHealth;
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number[];
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get detailed health status of all services
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    const [postgresql, redis, elasticsearch] = await Promise.all([
      this.checkPostgresql(),
      this.checkRedis(),
      this.checkElasticsearch(),
    ]);

    const services = { postgresql, redis, elasticsearch };
    
    // Determine overall status
    const statuses = Object.values(services).map(s => s.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (statuses.includes('unhealthy')) {
      // If PostgreSQL is unhealthy, overall is unhealthy
      if (postgresql.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else {
        overallStatus = 'degraded';
      }
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    // System metrics
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
      system: {
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(totalMem / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / totalMem) * 100),
        },
        cpu: {
          load: require('os').loadavg(),
        },
      },
    };
  }

  /**
   * Check if service is ready to accept traffic
   */
  async checkReadiness(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const postgresql = await this.checkPostgresql();
    const redis = await this.checkRedis();

    const isReady = postgresql.status === 'healthy' && redis.status !== 'unhealthy';

    if (!isReady) {
      throw new Error('Service not ready');
    }

    return {
      status: 'ready',
      checks: {
        postgresql: postgresql.status === 'healthy',
        redis: redis.status === 'healthy',
      },
    };
  }

  /**
   * Check PostgreSQL connectivity
   */
  private async checkPostgresql(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      // Get connection pool stats if available
      const details: Record<string, any> = {
        connected: true,
      };

      return {
        status: 'healthy',
        latency,
        message: 'PostgreSQL connection successful',
        details,
      };
    } catch (error) {
      this.logger.error('PostgreSQL health check failed', error);
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        message: `PostgreSQL connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const redisHost = this.configService.get('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get('REDIS_PORT', 6379);
      const redisPassword = this.configService.get('REDIS_PASSWORD');

      // Simple TCP connection check
      const net = require('net');
      const connected = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        
        socket.on('error', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.connect(redisPort, redisHost);
      });

      const latency = Date.now() - start;

      if (connected) {
        return {
          status: 'healthy',
          latency,
          message: 'Redis connection successful',
          details: {
            host: redisHost,
            port: redisPort,
          },
        };
      } else {
        return {
          status: 'unhealthy',
          latency,
          message: 'Redis connection failed',
        };
      }
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        message: `Redis connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Check Elasticsearch connectivity
   */
  private async checkElasticsearch(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const esUrl = this.configService.get('ELASTICSEARCH_URL', 'http://localhost:9200');
      
      const response = await fetch(`${esUrl}/_cluster/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - start;

      if (!response.ok) {
        return {
          status: 'unhealthy',
          latency,
          message: `Elasticsearch returned status ${response.status}`,
        };
      }

      const health = await response.json();
      
      // Map ES cluster status to our health status
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (health.status === 'red') {
        status = 'unhealthy';
      } else if (health.status === 'yellow') {
        status = 'degraded';
      }

      return {
        status,
        latency,
        message: `Elasticsearch cluster status: ${health.status}`,
        details: {
          clusterName: health.cluster_name,
          numberOfNodes: health.number_of_nodes,
          activeShards: health.active_shards,
        },
      };
    } catch (error) {
      this.logger.error('Elasticsearch health check failed', error);
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        message: `Elasticsearch connection failed: ${error.message}`,
      };
    }
  }
}
