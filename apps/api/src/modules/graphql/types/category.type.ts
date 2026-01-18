// =============================================================================
// GAP-L02: GRAPHQL CATEGORY TYPES
// =============================================================================

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Product category' })
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [CategoryType], { nullable: true })
  children?: CategoryType[];

  @Field(() => CategoryType, { nullable: true })
  parent?: CategoryType;

  @Field(() => Int, { description: 'Number of products in this category' })
  productCount: number;
}

@ObjectType({ description: 'Category tree for navigation' })
export class CategoryTreeType {
  @Field(() => [CategoryType])
  categories: CategoryType[];

  @Field(() => Int)
  total: number;
}
