// =============================================================================
// GAP-L02: GRAPHQL ORDER RESOLVER
// =============================================================================

import { Resolver, Query, Args, Int, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderType, PaginatedOrdersType } from '../types/order.type';
import { PrismaService } from '../../../prisma';
import { OrderStatus } from '@prisma/client';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => OrderType, { name: 'order', nullable: true })
  async getOrder(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<OrderType | null> {
    // In a real implementation, you'd check if the user owns this order
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: true,
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
        buyer: true,
        seller: true,
        payment: true,
        shipment: {
          include: {
            events: { orderBy: { occurredAt: 'desc' } },
          },
        },
      },
    });

    if (!order) return null;

    return this.mapOrder(order);
  }

  @Query(() => PaginatedOrdersType, { name: 'orders' })
  async getOrders(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('role', { type: () => String, defaultValue: 'buyer' }) role: 'buyer' | 'seller',
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20,
  ): Promise<PaginatedOrdersType> {
    const skip = (page - 1) * limit;

    const where: any = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              seller: true,
              category: true,
              images: { orderBy: { sortOrder: 'asc' } },
            },
          },
          buyer: true,
          seller: true,
          payment: true,
          shipment: {
            include: {
              events: { orderBy: { occurredAt: 'desc' } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: orders.map((o) => this.mapOrder(o)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Query(() => Int, { name: 'orderCount' })
  async getOrderCount(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('role', { type: () => String, defaultValue: 'buyer' }) role: 'buyer' | 'seller',
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus,
  ): Promise<number> {
    const where: any = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };
    if (status) where.status = status;

    return this.prisma.order.count({ where });
  }

  private mapOrder(order: any): OrderType {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount.toNumber(),
      commissionAmount: order.commissionAmount.toNumber(),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      product: {
        id: order.product.id,
        title: order.product.title,
        description: order.product.description,
        price: order.product.price.toNumber(),
        condition: order.product.condition,
        status: order.product.status,
        isTradeEnabled: order.product.isTradeEnabled,
        viewCount: order.product.viewCount,
        createdAt: order.product.createdAt,
        updatedAt: order.product.updatedAt,
        seller: {
          id: order.product.seller.id,
          displayName: order.product.seller.displayName,
          avatarUrl: order.product.seller.avatarUrl,
          isVerified: order.product.seller.isVerified,
          rating: undefined,
        },
        category: {
          id: order.product.category.id,
          name: order.product.category.name,
          slug: order.product.category.slug,
        },
        images: order.product.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          sortOrder: img.sortOrder,
        })),
      },
      buyer: {
        id: order.buyer.id,
        displayName: order.buyer.displayName,
        avatarUrl: order.buyer.avatarUrl || undefined,
        bio: order.buyer.bio || undefined,
        isVerified: order.buyer.isVerified,
        isSeller: order.buyer.isSeller,
        createdAt: order.buyer.createdAt,
        rating: undefined,
        totalRatings: 0,
        activeListings: 0,
      },
      seller: {
        id: order.seller.id,
        displayName: order.seller.displayName,
        avatarUrl: order.seller.avatarUrl || undefined,
        bio: order.seller.bio || undefined,
        isVerified: order.seller.isVerified,
        isSeller: order.seller.isSeller,
        createdAt: order.seller.createdAt,
        rating: undefined,
        totalRatings: 0,
        activeListings: 0,
      },
      payment: order.payment ? {
        id: order.payment.id,
        provider: order.payment.provider,
        amount: order.payment.amount.toNumber(),
        currency: order.payment.currency,
        status: order.payment.status,
        installmentCount: order.payment.installmentCount,
        paidAt: order.payment.paidAt,
        createdAt: order.payment.createdAt,
      } : undefined,
      shipment: order.shipment ? {
        id: order.shipment.id,
        provider: order.shipment.provider,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl,
        cost: order.shipment.cost?.toNumber(),
        status: order.shipment.status,
        estimatedDelivery: order.shipment.estimatedDelivery,
        shippedAt: order.shipment.shippedAt,
        deliveredAt: order.shipment.deliveredAt,
        events: order.shipment.events.map((e: any) => ({
          id: e.id,
          status: e.status,
          description: e.description,
          location: e.location,
          occurredAt: e.occurredAt,
        })),
      } : undefined,
    };
  }
}
