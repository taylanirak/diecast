import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Get all active categories (hierarchical)
   */
  async findAll() {
    const cacheKey = 'categories:all';

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const categories = await this.prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: {
                products: { where: { status: 'active' } },
              },
            },
          },
        });

        // Build hierarchy
        const rootCategories = categories.filter((c) => !c.parentId);
        const childrenMap = new Map<string, typeof categories>();

        categories.forEach((c) => {
          if (c.parentId) {
            if (!childrenMap.has(c.parentId)) {
              childrenMap.set(c.parentId, []);
            }
            childrenMap.get(c.parentId)!.push(c);
          }
        });

        return rootCategories.map((root) => this.buildCategoryTree(root, childrenMap));
      },
      { ttl: 3600 }, // 1 hour cache for categories
    );
  }

  /**
   * Get category by ID with product count
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            products: { where: { status: 'active' } },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent: category.parent,
      children: category.children,
      productCount: category._count.products,
    };
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            products: { where: { status: 'active' } },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent: category.parent,
      children: category.children,
      productCount: category._count.products,
    };
  }

  /**
   * Build category tree recursively
   */
  private buildCategoryTree(
    category: any,
    childrenMap: Map<string, any[]>,
  ): any {
    const children = childrenMap.get(category.id) || [];

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category._count.products,
      children: children.map((child) => this.buildCategoryTree(child, childrenMap)),
    };
  }
}
