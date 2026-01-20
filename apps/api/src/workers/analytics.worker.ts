import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface AnalyticsJobData {
  type:
    | 'aggregate_daily'
    | 'aggregate_weekly'
    | 'aggregate_monthly'
    | 'user_activity'
    | 'product_views'
    | 'search_analytics'
    | 'commission_summary';
  date?: string;
  userId?: string;
  productId?: string;
  searchTerm?: string;
}

@Processor('analytics')
export class AnalyticsWorker {
  private readonly logger = new Logger(AnalyticsWorker.name);

  constructor(private prisma: PrismaService) {}

  @Process('aggregate_daily')
  async handleDailyAggregation(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing daily aggregation: ${JSON.stringify(job.data)}`);

    try {
      const date = job.data.date ? new Date(job.data.date) : new Date();
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      // Aggregate orders
      const orderStats = await this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: { not: OrderStatus.cancelled },
        },
        _sum: { totalAmount: true },
        _count: true,
      });

      // Aggregate new users
      const newUsers = await this.prisma.user.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      });

      // Aggregate new products
      const newProducts = await this.prisma.product.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      });

      const revenue = orderStats._sum?.totalAmount?.toNumber() || 0;

      this.logger.log(
        `Daily stats: Orders=${orderStats._count}, Revenue=${revenue}, NewUsers=${newUsers}, NewProducts=${newProducts}`
      );

      return {
        date: startOfDay.toISOString(),
        orders: orderStats._count,
        revenue,
        newUsers,
        newProducts,
      };
    } catch (error: any) {
      this.logger.error(`Daily aggregation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('aggregate_weekly')
  async handleWeeklyAggregation(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing weekly aggregation: ${JSON.stringify(job.data)}`);

    try {
      const date = job.data.date ? new Date(job.data.date) : new Date();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const orderStats = await this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfWeek, lte: endOfWeek },
          status: { not: OrderStatus.cancelled },
        },
        _sum: { totalAmount: true },
        _count: true,
      });

      const revenue = orderStats._sum?.totalAmount?.toNumber() || 0;

      this.logger.log(`Weekly stats: Orders=${orderStats._count}, Revenue=${revenue}`);

      return {
        weekStart: startOfWeek.toISOString(),
        weekEnd: endOfWeek.toISOString(),
        orders: orderStats._count,
        revenue,
      };
    } catch (error: any) {
      this.logger.error(`Weekly aggregation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('aggregate_monthly')
  async handleMonthlyAggregation(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing monthly aggregation: ${JSON.stringify(job.data)}`);

    try {
      const date = job.data.date ? new Date(job.data.date) : new Date();
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const orderStats = await this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { not: OrderStatus.cancelled },
        },
        _sum: { totalAmount: true },
        _count: true,
      });

      const commissionStats = await this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: OrderStatus.completed,
        },
        _sum: { commissionAmount: true },
      });

      const revenue = orderStats._sum?.totalAmount?.toNumber() || 0;
      const commission = commissionStats._sum?.commissionAmount?.toNumber() || 0;

      this.logger.log(
        `Monthly stats: Orders=${orderStats._count}, Revenue=${revenue}, Commission=${commission}`
      );

      return {
        month: startOfMonth.toISOString(),
        orders: orderStats._count,
        revenue,
        commission,
      };
    } catch (error: any) {
      this.logger.error(`Monthly aggregation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('user_activity')
  async handleUserActivity(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing user activity: ${JSON.stringify(job.data)}`);

    try {
      const { userId } = job.data;

      if (userId) {
        // We don't have lastActiveAt field, so just log for now
        this.logger.log(`User activity recorded for ${userId}`);
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(`User activity tracking failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('product_views')
  async handleProductViews(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing product views: ${JSON.stringify(job.data)}`);

    try {
      const { productId } = job.data;

      if (productId) {
        await this.prisma.product.update({
          where: { id: productId },
          data: { viewCount: { increment: 1 } },
        });
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Product view tracking failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('search_analytics')
  async handleSearchAnalytics(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing search analytics: ${JSON.stringify(job.data)}`);

    // Store search terms for analytics (could be stored in a separate table)
    return { success: true };
  }

  @Process('commission_summary')
  async handleCommissionSummary(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing commission summary: ${JSON.stringify(job.data)}`);

    try {
      const date = job.data.date ? new Date(job.data.date) : new Date();
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const commissionByCategory = await this.prisma.order.groupBy({
        by: ['id'],
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: OrderStatus.completed,
        },
        _sum: { commissionAmount: true },
      });

      this.logger.log(`Commission summary calculated for ${commissionByCategory.length} orders`);

      return { success: true, count: commissionByCategory.length };
    } catch (error: any) {
      this.logger.error(`Commission summary failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

export default AnalyticsWorker;
