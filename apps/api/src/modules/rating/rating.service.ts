import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { OrderStatus, TradeStatus } from '@prisma/client';
import {
  CreateUserRatingDto,
  CreateProductRatingDto,
  UserRatingResponseDto,
  ProductRatingResponseDto,
  UserRatingStatsDto,
  ProductRatingStatsDto,
} from './dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // CREATE USER RATING
  // ==========================================================================
  async createUserRating(
    giverId: string,
    dto: CreateUserRatingDto,
  ): Promise<UserRatingResponseDto> {
    // Cannot rate yourself
    if (giverId === dto.receiverId) {
      throw new BadRequestException('Kendinizi puanlayamazsınız');
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Must have either orderId or tradeId
    if (!dto.orderId && !dto.tradeId) {
      throw new BadRequestException('Sipariş veya takas ID gerekli');
    }

    // Verify transaction
    if (dto.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });

      if (!order) {
        throw new NotFoundException('Sipariş bulunamadı');
      }

      if (order.status !== OrderStatus.completed) {
        throw new BadRequestException('Sadece tamamlanmış siparişler puanlanabilir');
      }

      // Giver must be buyer or seller
      if (order.buyerId !== giverId && order.sellerId !== giverId) {
        throw new ForbiddenException('Bu siparişi puanlama yetkiniz yok');
      }

      // Receiver must be the other party
      if (
        (order.buyerId === giverId && order.sellerId !== dto.receiverId) ||
        (order.sellerId === giverId && order.buyerId !== dto.receiverId)
      ) {
        throw new BadRequestException('Geçersiz alıcı');
      }

      // Check if already rated
      const existingRating = await this.prisma.rating.findUnique({
        where: { giverId_orderId: { giverId, orderId: dto.orderId } },
      });

      if (existingRating) {
        throw new BadRequestException('Bu sipariş için zaten puan verdiniz');
      }
    }

    if (dto.tradeId) {
      const trade = await this.prisma.trade.findUnique({
        where: { id: dto.tradeId },
      });

      if (!trade) {
        throw new NotFoundException('Takas bulunamadı');
      }

      if (trade.status !== TradeStatus.completed) {
        throw new BadRequestException('Sadece tamamlanmış takaslar puanlanabilir');
      }

      // Giver must be initiator or receiver
      if (trade.initiatorId !== giverId && trade.receiverId !== giverId) {
        throw new ForbiddenException('Bu takası puanlama yetkiniz yok');
      }

      // Receiver must be the other party
      if (
        (trade.initiatorId === giverId && trade.receiverId !== dto.receiverId) ||
        (trade.receiverId === giverId && trade.initiatorId !== dto.receiverId)
      ) {
        throw new BadRequestException('Geçersiz alıcı');
      }

      // Check if already rated
      const existingRating = await this.prisma.rating.findUnique({
        where: { giverId_tradeId: { giverId, tradeId: dto.tradeId } },
      });

      if (existingRating) {
        throw new BadRequestException('Bu takas için zaten puan verdiniz');
      }
    }

    const rating = await this.prisma.rating.create({
      data: {
        giverId,
        receiverId: dto.receiverId,
        orderId: dto.orderId,
        tradeId: dto.tradeId,
        score: dto.score,
        comment: dto.comment,
      },
      include: {
        giver: { select: { id: true, displayName: true } },
        receiver: { select: { id: true, displayName: true } },
      },
    });

    return this.mapUserRatingToDto(rating);
  }

  // ==========================================================================
  // CREATE PRODUCT RATING
  // ==========================================================================
  async createProductRating(
    userId: string,
    dto: CreateProductRatingDto,
  ): Promise<ProductRatingResponseDto> {
    // Verify order and ownership
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { product: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('Sadece alıcı ürünü puanlayabilir');
    }

    if (order.productId !== dto.productId) {
      throw new BadRequestException('Siparişteki ürün eşleşmiyor');
    }

    // Allow rating for completed, delivered, or paid orders (for testing with payment bypass)
    const allowedStatuses: OrderStatus[] = [OrderStatus.completed, OrderStatus.delivered, OrderStatus.paid];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('Sadece tamamlanmış veya teslim edilmiş siparişler puanlanabilir');
    }

    // Check if already rated
    const existingRating = await this.prisma.productRating.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingRating) {
      throw new BadRequestException('Bu sipariş için zaten ürün puanı verdiniz');
    }

    const rating = await this.prisma.productRating.create({
      data: {
        productId: dto.productId,
        userId,
        orderId: dto.orderId,
        score: dto.score,
        title: dto.title,
        review: dto.review,
        images: dto.images || [],
        isVerifiedPurchase: true,
      },
      include: {
        product: { select: { id: true, title: true } },
        user: { select: { id: true, displayName: true } },
      },
    });

    return this.mapProductRatingToDto(rating);
  }

  // ==========================================================================
  // GET USER RATINGS
  // ==========================================================================
  async getUserRatings(
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<{ ratings: UserRatingResponseDto[]; total: number; page: number; pageSize: number }> {
    // Ensure valid pagination values
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: { receiverId: userId },
        include: {
          giver: { select: { id: true, displayName: true } },
          receiver: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      this.prisma.rating.count({ where: { receiverId: userId } }),
    ]);

    return {
      ratings: ratings.map((r) => this.mapUserRatingToDto(r)),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  // ==========================================================================
  // GET PRODUCT RATINGS
  // ==========================================================================
  async getProductRatings(
    productId: string,
    page?: number,
    pageSize?: number,
  ): Promise<{ ratings: ProductRatingResponseDto[]; total: number; page: number; pageSize: number }> {
    // Ensure valid pagination values
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    
    const [ratings, total] = await Promise.all([
      this.prisma.productRating.findMany({
        where: { productId },
        include: {
          product: { select: { id: true, title: true } },
          user: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      this.prisma.productRating.count({ where: { productId } }),
    ]);

    return {
      ratings: ratings.map((r) => this.mapProductRatingToDto(r)),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  // ==========================================================================
  // GET USER RATING STATS
  // ==========================================================================
  async getUserRatingStats(userId: string): Promise<UserRatingStatsDto> {
    const ratings = await this.prisma.rating.findMany({
      where: { receiverId: userId },
      select: { score: true },
    });

    const totalRatings = ratings.length;
    const averageScore =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0;

    const scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      scoreDistribution[r.score as keyof typeof scoreDistribution]++;
    });

    return {
      userId,
      totalRatings,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution,
    };
  }

  // ==========================================================================
  // GET PRODUCT RATING STATS
  // ==========================================================================
  async getProductRatingStats(productId: string): Promise<ProductRatingStatsDto> {
    const ratings = await this.prisma.productRating.findMany({
      where: { productId },
      select: { score: true },
    });

    const totalRatings = ratings.length;
    const averageScore =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0;

    const scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      scoreDistribution[r.score as keyof typeof scoreDistribution]++;
    });

    return {
      productId,
      totalRatings,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution,
    };
  }

  // ==========================================================================
  // MARK HELPFUL
  // ==========================================================================
  async markProductRatingHelpful(ratingId: string): Promise<ProductRatingResponseDto> {
    const rating = await this.prisma.productRating.update({
      where: { id: ratingId },
      data: { helpfulCount: { increment: 1 } },
      include: {
        product: { select: { id: true, title: true } },
        user: { select: { id: true, displayName: true } },
      },
    });

    return this.mapProductRatingToDto(rating);
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  private mapUserRatingToDto(rating: any): UserRatingResponseDto {
    return {
      id: rating.id,
      giverId: rating.giverId,
      giverName: rating.giver?.displayName || '',
      receiverId: rating.receiverId,
      receiverName: rating.receiver?.displayName || '',
      orderId: rating.orderId || undefined,
      tradeId: rating.tradeId || undefined,
      score: rating.score,
      comment: rating.comment || undefined,
      createdAt: rating.createdAt,
    };
  }

  private mapProductRatingToDto(rating: any): ProductRatingResponseDto {
    return {
      id: rating.id,
      productId: rating.productId,
      productTitle: rating.product?.title || '',
      userId: rating.userId,
      userName: rating.user?.displayName || '',
      orderId: rating.orderId,
      score: rating.score,
      title: rating.title || undefined,
      review: rating.review || undefined,
      images: rating.images || [],
      isVerifiedPurchase: rating.isVerifiedPurchase,
      helpfulCount: rating.helpfulCount,
      createdAt: rating.createdAt,
    };
  }
}
