// =============================================================================
// GAP-L02: GRAPHQL TRADE TYPES
// =============================================================================

import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { TradeStatus } from '@prisma/client';
import { ProductType } from './product.type';
import { PublicUserType } from './user.type';

// Register enum
registerEnumType(TradeStatus, {
  name: 'TradeStatus',
  description: 'Trade/swap status',
});

@ObjectType({ description: 'Trade item' })
export class TradeItemType {
  @Field(() => ID)
  id: string;

  @Field()
  side: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  valueAtTrade: number;

  @Field(() => ProductType)
  product: ProductType;
}

@ObjectType({ description: 'Trade shipment' })
export class TradeShipmentType {
  @Field(() => ID)
  id: string;

  @Field()
  shipperId: string;

  @Field()
  carrier: string;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  shippedAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  confirmedAt?: Date;
}

@ObjectType({ description: 'Trade cash payment' })
export class TradeCashPaymentType {
  @Field(() => ID)
  id: string;

  @Field()
  payerId: string;

  @Field()
  recipientId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  commission: number;

  @Field(() => Float)
  totalAmount: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  paidAt?: Date;
}

@ObjectType({ description: 'Trade dispute' })
export class TradeDisputeType {
  @Field(() => ID)
  id: string;

  @Field()
  raisedById: string;

  @Field()
  reason: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType({ description: 'Trade/Swap' })
export class TradeType {
  @Field(() => ID)
  id: string;

  @Field()
  tradeNumber: string;

  @Field(() => TradeStatus)
  status: TradeStatus;

  @Field(() => Float, { nullable: true })
  cashAmount?: number;

  @Field({ nullable: true })
  cashPayerId?: string;

  @Field({ nullable: true })
  initiatorMessage?: string;

  @Field({ nullable: true })
  receiverMessage?: string;

  @Field()
  responseDeadline: Date;

  @Field({ nullable: true })
  paymentDeadline?: Date;

  @Field({ nullable: true })
  shippingDeadline?: Date;

  @Field({ nullable: true })
  confirmationDeadline?: Date;

  @Field({ nullable: true })
  acceptedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  createdAt: Date;

  @Field(() => PublicUserType)
  initiator: PublicUserType;

  @Field(() => PublicUserType)
  receiver: PublicUserType;

  @Field(() => [TradeItemType])
  initiatorItems: TradeItemType[];

  @Field(() => [TradeItemType])
  receiverItems: TradeItemType[];

  @Field(() => [TradeShipmentType])
  shipments: TradeShipmentType[];

  @Field(() => TradeCashPaymentType, { nullable: true })
  cashPayment?: TradeCashPaymentType;

  @Field(() => TradeDisputeType, { nullable: true })
  dispute?: TradeDisputeType;
}

@ObjectType({ description: 'Paginated trades response' })
export class PaginatedTradesType {
  @Field(() => [TradeType])
  items: TradeType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
