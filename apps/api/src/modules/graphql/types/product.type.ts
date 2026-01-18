// =============================================================================
// GAP-L02: GRAPHQL PRODUCT TYPES
// =============================================================================

import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ProductStatus, ProductCondition } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(ProductStatus, {
  name: 'ProductStatus',
  description: 'Product status in the marketplace',
});

registerEnumType(ProductCondition, {
  name: 'ProductCondition',
  description: 'Condition of the product',
});

@ObjectType({ description: 'Product image' })
export class ProductImageType {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => Int)
  sortOrder: number;
}

@ObjectType({ description: 'Product seller information' })
export class ProductSellerType {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  isVerified: boolean;

  @Field(() => Float, { nullable: true })
  rating?: number;
}

@ObjectType({ description: 'Product category' })
export class ProductCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

@ObjectType({ description: 'Product listing in the marketplace' })
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => ProductCondition)
  condition: ProductCondition;

  @Field(() => ProductStatus)
  status: ProductStatus;

  @Field()
  isTradeEnabled: boolean;

  @Field(() => Int)
  viewCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ProductSellerType)
  seller: ProductSellerType;

  @Field(() => ProductCategoryType)
  category: ProductCategoryType;

  @Field(() => [ProductImageType])
  images: ProductImageType[];
}

@ObjectType({ description: 'Paginated products response' })
export class PaginatedProductsType {
  @Field(() => [ProductType])
  items: ProductType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNext: boolean;

  @Field()
  hasPrev: boolean;
}
