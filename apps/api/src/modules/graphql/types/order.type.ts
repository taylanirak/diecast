// =============================================================================
// GAP-L02: GRAPHQL ORDER TYPES
// =============================================================================

import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
import { ProductType } from './product.type';
import { PublicUserType } from './user.type';

// Register enums
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Order status',
});

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status',
});

registerEnumType(ShipmentStatus, {
  name: 'ShipmentStatus',
  description: 'Shipment status',
});

@ObjectType({ description: 'Payment information' })
export class PaymentType {
  @Field(() => ID)
  id: string;

  @Field()
  provider: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => Int)
  installmentCount: number;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType({ description: 'Shipment event' })
export class ShipmentEventType {
  @Field(() => ID)
  id: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  occurredAt: Date;
}

@ObjectType({ description: 'Shipment information' })
export class ShipmentType {
  @Field(() => ID)
  id: string;

  @Field()
  provider: string;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  trackingUrl?: string;

  @Field(() => Float, { nullable: true })
  cost?: number;

  @Field(() => ShipmentStatus)
  status: ShipmentStatus;

  @Field({ nullable: true })
  estimatedDelivery?: Date;

  @Field({ nullable: true })
  shippedAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field(() => [ShipmentEventType])
  events: ShipmentEventType[];
}

@ObjectType({ description: 'Order' })
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  commissionAmount: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ProductType)
  product: ProductType;

  @Field(() => PublicUserType)
  buyer: PublicUserType;

  @Field(() => PublicUserType)
  seller: PublicUserType;

  @Field(() => PaymentType, { nullable: true })
  payment?: PaymentType;

  @Field(() => ShipmentType, { nullable: true })
  shipment?: ShipmentType;
}

@ObjectType({ description: 'Paginated orders response' })
export class PaginatedOrdersType {
  @Field(() => [OrderType])
  items: OrderType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
