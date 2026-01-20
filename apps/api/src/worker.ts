/**
 * Worker Entry Point
 * Standalone worker process for background job processing
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './workers';

async function bootstrap() {
  const logger = new Logger('Worker');

  logger.log('Starting Tarodan Worker...');

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });

  logger.log('Worker started successfully');
  logger.log('Listening for jobs on queues: email, push, image, payment, shipping, search');

  // Graceful shutdown
  const shutdown = async () => {
    logger.log('Shutting down worker...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap();
