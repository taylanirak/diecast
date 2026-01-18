import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma } from '@prisma/client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddCollectionItemDto,
  ReorderCollectionItemsDto,
  CollectionResponseDto,
  CollectionListResponseDto,
  CollectionItemResponseDto,
} from './dto';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // CREATE COLLECTION
  // ==========================================================================
  async createCollection(
    userId: string,
    dto: CreateCollectionDto,
  ): Promise<CollectionResponseDto> {
    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Check if slug already exists for user
    const existing = await this.prisma.collection.findUnique({
      where: { userId_slug: { userId, slug } },
    });

    if (existing) {
      throw new BadRequestException('Bu isimde bir koleksiyonunuz zaten var');
    }

    const collection = await this.prisma.collection.create({
      data: {
        userId,
        name: dto.name,
        slug,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        isPublic: dto.isPublic ?? true,
      },
      include: {
        user: { select: { id: true, displayName: true } },
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapCollectionToDto(collection);
  }

  // ==========================================================================
  // GET COLLECTION BY ID
  // ==========================================================================
  async getCollectionById(
    collectionId: string,
    viewerId?: string,
  ): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        user: { select: { id: true, displayName: true } },
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    // Private collection can only be seen by owner
    if (!collection.isPublic && collection.userId !== viewerId) {
      throw new ForbiddenException('Bu koleksiyon özel');
    }

    // Increment view count if not owner
    if (viewerId !== collection.userId) {
      await this.prisma.collection.update({
        where: { id: collectionId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return this.mapCollectionToDto(collection);
  }

  // ==========================================================================
  // GET COLLECTION BY SLUG
  // ==========================================================================
  async getCollectionBySlug(
    slug: string,
    viewerId?: string,
  ): Promise<CollectionResponseDto> {
    // Try exact slug first, then try stripping "collection-" prefix if present
    const slugsToTry = [slug];
    if (slug.startsWith('collection-')) {
      slugsToTry.push(slug.replace('collection-', ''));
    }

    let collection = null;
    for (const s of slugsToTry) {
      collection = await this.prisma.collection.findFirst({
        where: { slug: s },
        include: {
          user: { select: { id: true, displayName: true } },
          items: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      if (collection) break;
    }

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    // Private collection can only be seen by owner
    if (!collection.isPublic && collection.userId !== viewerId) {
      throw new ForbiddenException('Bu koleksiyon özel');
    }

    // Increment view count if not owner
    if (viewerId !== collection.userId) {
      await this.prisma.collection.update({
        where: { id: collection.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return this.mapCollectionToDto(collection);
  }

  // ==========================================================================
  // GET USER COLLECTIONS
  // ==========================================================================
  async getUserCollections(
    userId: string,
    viewerId?: string,
    page?: number,
    pageSize?: number,
  ): Promise<CollectionListResponseDto> {
    // Ensure valid pagination values
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    
    // If viewing own collections, show all. Otherwise only public.
    const isOwner = userId === viewerId;

    const where: Prisma.CollectionWhereInput = {
      userId,
      ...(isOwner ? {} : { isPublic: true }),
    };

    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      this.prisma.collection.count({ where }),
    ]);

    return {
      collections: collections.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.user.displayName,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
        coverImageUrl: c.coverImageUrl || undefined,
        isPublic: c.isPublic,
        viewCount: c.viewCount,
        likeCount: c.likeCount,
        itemCount: c._count.items,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  // ==========================================================================
  // BROWSE PUBLIC COLLECTIONS
  // ==========================================================================
  async browsePublicCollections(
    page?: number,
    pageSize?: number,
    sortBy: 'popular' | 'recent' = 'popular',
  ): Promise<CollectionListResponseDto> {
    // Ensure valid pagination values
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    
    const orderBy: Prisma.CollectionOrderByWithRelationInput =
      sortBy === 'popular'
        ? { viewCount: 'desc' }
        : { createdAt: 'desc' };

    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where: { isPublic: true },
        include: {
          user: { select: { id: true, displayName: true } },
          _count: { select: { items: true } },
        },
        orderBy,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      this.prisma.collection.count({ where: { isPublic: true } }),
    ]);

    return {
      collections: collections.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.user.displayName,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
        coverImageUrl: c.coverImageUrl || undefined,
        isPublic: c.isPublic,
        viewCount: c.viewCount,
        likeCount: c.likeCount,
        itemCount: c._count.items,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  // ==========================================================================
  // UPDATE COLLECTION
  // ==========================================================================
  async updateCollection(
    collectionId: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Bu koleksiyonu düzenleme yetkiniz yok');
    }

    let newSlug = collection.slug;
    if (dto.name && dto.name !== collection.name) {
      newSlug = this.generateSlug(dto.name);

      // Check if new slug already exists
      const existing = await this.prisma.collection.findFirst({
        where: {
          userId,
          slug: newSlug,
          id: { not: collectionId },
        },
      });

      if (existing) {
        throw new BadRequestException('Bu isimde bir koleksiyonunuz zaten var');
      }
    }

    const updated = await this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        ...(dto.name && { name: dto.name, slug: newSlug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      include: {
        user: { select: { id: true, displayName: true } },
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapCollectionToDto(updated);
  }

  // ==========================================================================
  // DELETE COLLECTION
  // ==========================================================================
  async deleteCollection(collectionId: string, userId: string): Promise<void> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Bu koleksiyonu silme yetkiniz yok');
    }

    await this.prisma.collection.delete({
      where: { id: collectionId },
    });
  }

  // ==========================================================================
  // ADD ITEM TO COLLECTION
  // ==========================================================================
  async addItemToCollection(
    collectionId: string,
    userId: string,
    dto: AddCollectionItemDto,
  ): Promise<CollectionItemResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Bu koleksiyona ekleme yetkiniz yok');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { images: { take: 1 } },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Check if already in collection
    const existing = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Ürün zaten koleksiyonda');
    }

    // Get max sort order
    const maxSort = await this.prisma.collectionItem.aggregate({
      where: { collectionId },
      _max: { sortOrder: true },
    });

    const item = await this.prisma.collectionItem.create({
      data: {
        collectionId,
        productId: dto.productId,
        sortOrder: dto.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
        isFeatured: dto.isFeatured ?? false,
      },
      include: {
        product: {
          include: { images: { take: 1 } },
        },
      },
    });

    return this.mapItemToDto(item);
  }

  // ==========================================================================
  // REMOVE ITEM FROM COLLECTION
  // ==========================================================================
  async removeItemFromCollection(
    collectionId: string,
    itemId: string,
    userId: string,
  ): Promise<void> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Bu koleksiyondan silme yetkiniz yok');
    }

    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, collectionId },
    });

    if (!item) {
      throw new NotFoundException('Koleksiyon öğesi bulunamadı');
    }

    await this.prisma.collectionItem.delete({
      where: { id: itemId },
    });
  }

  // ==========================================================================
  // REORDER ITEMS
  // ==========================================================================
  async reorderItems(
    collectionId: string,
    userId: string,
    dto: ReorderCollectionItemsDto,
  ): Promise<void> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Bu koleksiyonu düzenleme yetkiniz yok');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.collectionItem.update({
          where: { id: item.itemId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }

  // ==========================================================================
  // LIKE COLLECTION
  // ==========================================================================
  async likeCollection(collectionId: string): Promise<void> {
    await this.prisma.collection.update({
      where: { id: collectionId },
      data: { likeCount: { increment: 1 } },
    });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9çğıöşü]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private mapCollectionToDto(collection: any): CollectionResponseDto {
    return {
      id: collection.id,
      userId: collection.userId,
      userName: collection.user?.displayName || '',
      name: collection.name,
      slug: collection.slug,
      description: collection.description || undefined,
      coverImageUrl: collection.coverImageUrl || undefined,
      isPublic: collection.isPublic,
      viewCount: collection.viewCount,
      likeCount: collection.likeCount,
      itemCount: collection.items?.length ?? 0,
      items: collection.items?.map((item: any) => this.mapItemToDto(item)),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  private mapItemToDto(item: any): CollectionItemResponseDto {
    return {
      id: item.id,
      productId: item.product.id,
      productTitle: item.product.title,
      productImage: item.product.images?.[0]?.url,
      productPrice: parseFloat(item.product.price),
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      addedAt: item.addedAt,
    };
  }
}
