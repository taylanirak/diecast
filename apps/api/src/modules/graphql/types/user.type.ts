// =============================================================================
// GAP-L02: GRAPHQL USER TYPES
// =============================================================================

import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { SellerType, MembershipTierType } from '@prisma/client';

// Register enums
registerEnumType(SellerType, {
  name: 'SellerType',
  description: 'Type of seller account',
});

registerEnumType(MembershipTierType, {
  name: 'MembershipTierType',
  description: 'Membership tier level',
});

@ObjectType({ description: 'User address' })
export class UserAddressType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  fullName: string;

  @Field()
  phone: string;

  @Field()
  city: string;

  @Field()
  district: string;

  @Field()
  address: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field()
  isDefault: boolean;
}

@ObjectType({ description: 'User membership information' })
export class UserMembershipType {
  @Field(() => ID)
  id: string;

  @Field(() => MembershipTierType)
  tierType: MembershipTierType;

  @Field()
  tierName: string;

  @Field()
  status: string;

  @Field()
  currentPeriodStart: Date;

  @Field()
  currentPeriodEnd: Date;
}

@ObjectType({ description: 'User statistics' })
export class UserStatsType {
  @Field(() => Int)
  totalListings: number;

  @Field(() => Int)
  activeListings: number;

  @Field(() => Int)
  totalSales: number;

  @Field(() => Int)
  totalPurchases: number;

  @Field(() => Int)
  totalTrades: number;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int)
  totalRatings: number;
}

@ObjectType({ description: 'User profile' })
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  isVerified: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field()
  isSeller: boolean;

  @Field(() => SellerType, { nullable: true })
  sellerType?: SellerType;

  @Field()
  createdAt: Date;

  @Field(() => UserMembershipType, { nullable: true })
  membership?: UserMembershipType;

  @Field(() => UserStatsType)
  stats: UserStatsType;

  @Field(() => [UserAddressType])
  addresses: UserAddressType[];
}

@ObjectType({ description: 'Public user profile (limited info)' })
export class PublicUserType {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  isVerified: boolean;

  @Field()
  isSeller: boolean;

  @Field()
  createdAt: Date;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int)
  totalRatings: number;

  @Field(() => Int)
  activeListings: number;
}
