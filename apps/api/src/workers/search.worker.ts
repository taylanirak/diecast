/**
 * Search Indexing Worker
 * Handles Elasticsearch indexing for products and full-text search
 */
import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';

export interface SearchJobData {
  type: 'index' | 'update' | 'delete' | 'bulk-index' | 'reindex-all';
  entityType: 'product' | 'user' | 'category';
  entityId?: string;
  entityIds?: string[];
  data?: Record<string, any>;
}

@Processor('search')
export class SearchWorker {
  private readonly logger = new Logger(SearchWorker.name);
  private readonly elasticsearchUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.elasticsearchUrl = this.configService.get(
      'ELASTICSEARCH_URL',
      'http://localhost:9200',
    );
  }

  @Process('index')
  async handleIndex(job: Job<SearchJobData>) {
    this.logger.log(`Processing index job ${job.id} for ${job.data.entityType}:${job.data.entityId}`);

    const { entityType, entityId, data } = job.data;

    if (!entityId) {
      throw new Error('entityId is required for indexing');
    }

    try {
      let document: Record<string, any> | null;

      if (data) {
        document = data;
      } else {
        document = await this.fetchDocument(entityType, entityId);
      }

      if (!document) {
        throw new Error(`Document not found: ${entityType}:${entityId}`);
      }

      // Index to Elasticsearch
      const response = await fetch(
        `${this.elasticsearchUrl}/${entityType}s/_doc/${entityId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(document),
        },
      );

      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.status}`);
      }

      this.logger.log(`Indexed ${entityType}:${entityId}`);
      return { success: true, entityType, entityId };
    } catch (error) {
      this.logger.error(`Failed to index ${entityType}:${entityId}: ${error.message}`);
      throw error;
    }
  }

  @Process('update')
  async handleUpdate(job: Job<SearchJobData>) {
    this.logger.log(`Processing update job ${job.id} for ${job.data.entityType}:${job.data.entityId}`);

    const { entityType, entityId, data } = job.data;

    try {
      // Update document in Elasticsearch
      const response = await fetch(
        `${this.elasticsearchUrl}/${entityType}s/_update/${entityId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: data }),
        },
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Elasticsearch error: ${response.status}`);
      }

      // If not found, create new
      if (response.status === 404) {
        return this.handleIndex(job);
      }

      this.logger.log(`Updated ${entityType}:${entityId}`);
      return { success: true, entityType, entityId };
    } catch (error) {
      this.logger.error(`Failed to update ${entityType}:${entityId}: ${error.message}`);
      throw error;
    }
  }

  @Process('delete')
  async handleDelete(job: Job<SearchJobData>) {
    this.logger.log(`Processing delete job ${job.id} for ${job.data.entityType}:${job.data.entityId}`);

    const { entityType, entityId } = job.data;

    try {
      const response = await fetch(
        `${this.elasticsearchUrl}/${entityType}s/_doc/${entityId}`,
        { method: 'DELETE' },
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Elasticsearch error: ${response.status}`);
      }

      this.logger.log(`Deleted ${entityType}:${entityId} from index`);
      return { success: true, entityType, entityId };
    } catch (error) {
      this.logger.error(`Failed to delete ${entityType}:${entityId}: ${error.message}`);
      throw error;
    }
  }

  @Process('bulk-index')
  async handleBulkIndex(job: Job<SearchJobData>) {
    this.logger.log(`Processing bulk index job ${job.id} for ${job.data.entityType}`);

    const { entityType, entityIds } = job.data;

    if (!entityIds || entityIds.length === 0) {
      return { success: true, indexed: 0 };
    }

    try {
      const documents = await Promise.all(
        entityIds.map((id) => this.fetchDocument(entityType, id)),
      );

      // Build bulk request body
      const bulkBody = documents
        .filter(Boolean)
        .flatMap((doc, index) => [
          { index: { _index: `${entityType}s`, _id: entityIds![index] } },
          doc,
        ]);

      if (bulkBody.length === 0) {
        return { success: true, indexed: 0 };
      }

      const response = await fetch(`${this.elasticsearchUrl}/_bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-ndjson' },
        body: bulkBody.map((item) => JSON.stringify(item)).join('\n') + '\n',
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch bulk error: ${response.status}`);
      }

      const result = await response.json();
      const indexed = result.items?.filter((i: any) => !i.index?.error).length || 0;

      this.logger.log(`Bulk indexed ${indexed} ${entityType}s`);
      return { success: true, indexed };
    } catch (error) {
      this.logger.error(`Failed to bulk index ${entityType}s: ${error.message}`);
      throw error;
    }
  }

  @Process('reindex-all')
  async handleReindexAll(job: Job<SearchJobData>) {
    this.logger.log(`Processing reindex-all job ${job.id} for ${job.data.entityType}`);

    const { entityType } = job.data;

    try {
      // Delete existing index
      await fetch(`${this.elasticsearchUrl}/${entityType}s`, { method: 'DELETE' });

      // Create index with mappings
      await this.createIndex(entityType);

      // Fetch all entities and index
      let totalIndexed = 0;
      const batchSize = 100;
      let skip = 0;

      while (true) {
        const entities = await this.fetchEntities(entityType, skip, batchSize);

        if (entities.length === 0) break;

        const bulkBody = entities.flatMap((entity: any) => [
          { index: { _index: `${entityType}s`, _id: entity.id } },
          this.mapEntityToDocument(entityType, entity),
        ]);

        await fetch(`${this.elasticsearchUrl}/_bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-ndjson' },
          body: bulkBody.map((item) => JSON.stringify(item)).join('\n') + '\n',
        });

        totalIndexed += entities.length;
        skip += batchSize;

        this.logger.log(`Reindexed ${totalIndexed} ${entityType}s so far...`);
      }

      this.logger.log(`Reindex complete: ${totalIndexed} ${entityType}s`);
      return { success: true, totalIndexed };
    } catch (error) {
      this.logger.error(`Failed to reindex ${entityType}s: ${error.message}`);
      throw error;
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Search job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Search job ${job.id} failed: ${error.message}`);
  }

  private async fetchDocument(entityType: string, entityId: string): Promise<Record<string, any> | null> {
    if (entityType === 'product') {
      const product = await this.prisma.product.findUnique({
        where: { id: entityId },
        include: {
          category: true,
          seller: { select: { id: true, displayName: true } },
          images: true,
        },
      });
      return product ? this.mapEntityToDocument('product', product) : null;
    }

    if (entityType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: entityId },
        select: { id: true, displayName: true, bio: true, createdAt: true },
      });
      return user ? this.mapEntityToDocument('user', user) : null;
    }

    if (entityType === 'category') {
      const category = await this.prisma.category.findUnique({
        where: { id: entityId },
      });
      return category ? this.mapEntityToDocument('category', category) : null;
    }

    return null;
  }

  private async fetchEntities(entityType: string, skip: number, take: number): Promise<any[]> {
    if (entityType === 'product') {
      return this.prisma.product.findMany({
        skip,
        take,
        include: {
          category: true,
          seller: { select: { id: true, displayName: true } },
          images: true,
        },
      });
    }

    if (entityType === 'user') {
      return this.prisma.user.findMany({
        skip,
        take,
        select: { id: true, displayName: true, bio: true, createdAt: true },
      });
    }

    if (entityType === 'category') {
      return this.prisma.category.findMany({ skip, take });
    }

    return [];
  }

  private mapEntityToDocument(entityType: string, entity: any): Record<string, any> {
    if (entityType === 'product') {
      return {
        id: entity.id,
        title: entity.title,
        description: entity.description,
        price: entity.price,
        condition: entity.condition,
        brand: entity.brand,
        model: entity.model,
        scale: entity.scale,
        year: entity.year,
        categoryId: entity.categoryId,
        categoryName: entity.category?.name,
        categorySlug: entity.category?.slug,
        sellerId: entity.sellerId,
        sellerName: entity.seller?.displayName,
        status: entity.status,
        images: entity.images?.map((i: any) => i.url),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };
    }

    if (entityType === 'user') {
      return {
        id: entity.id,
        displayName: entity.displayName,
        bio: entity.bio,
        createdAt: entity.createdAt,
      };
    }

    if (entityType === 'category') {
      return {
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        parentId: entity.parentId,
      };
    }

    return entity;
  }

  private async createIndex(entityType: string): Promise<void> {
    const mappings: Record<string, any> = {
      product: {
        properties: {
          id: { type: 'keyword' },
          title: { type: 'text', analyzer: 'turkish' },
          description: { type: 'text', analyzer: 'turkish' },
          price: { type: 'float' },
          condition: { type: 'keyword' },
          brand: { type: 'keyword' },
          model: { type: 'text' },
          scale: { type: 'keyword' },
          year: { type: 'integer' },
          categoryId: { type: 'keyword' },
          categoryName: { type: 'text' },
          categorySlug: { type: 'keyword' },
          sellerId: { type: 'keyword' },
          sellerName: { type: 'text' },
          status: { type: 'keyword' },
          images: { type: 'keyword' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
      user: {
        properties: {
          id: { type: 'keyword' },
          displayName: { type: 'text' },
          bio: { type: 'text' },
          createdAt: { type: 'date' },
        },
      },
      category: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text', analyzer: 'turkish' },
          slug: { type: 'keyword' },
          description: { type: 'text' },
          parentId: { type: 'keyword' },
        },
      },
    };

    await fetch(`${this.elasticsearchUrl}/${entityType}s`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              turkish: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'turkish_stop', 'turkish_stemmer'],
              },
            },
            filter: {
              turkish_stop: { type: 'stop', stopwords: '_turkish_' },
              turkish_stemmer: { type: 'stemmer', language: 'turkish' },
            },
          },
        },
        mappings: mappings[entityType] || {},
      }),
    });
  }
}
