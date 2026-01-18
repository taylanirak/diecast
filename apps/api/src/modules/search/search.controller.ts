import {
  Controller,
  Get,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { SearchService, SearchOptions, SearchResponse } from './search.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Search products (public)
   * GET /search/products
   */
  @Public()
  @Get('products')
  async searchProducts(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('condition') condition?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest',
  ): Promise<SearchResponse> {
    const options: SearchOptions = {
      query: query || '',
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      condition,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      sortBy,
    };

    return this.searchService.searchProducts(options);
  }

  /**
   * Autocomplete suggestions (public)
   * GET /search/autocomplete
   */
  @Public()
  @Get('autocomplete')
  async autocomplete(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<{ suggestions: string[] }> {
    const suggestions = await this.searchService.autocomplete(
      query,
      limit ? parseInt(limit) : 10,
    );
    return { suggestions };
  }

  /**
   * Reindex all products (Admin)
   * POST /search/admin/reindex
   */
  @Post('admin/reindex')
  @Roles(AdminRole.admin, AdminRole.super_admin)
  async reindexAll(): Promise<{ indexed: number }> {
    const indexed = await this.searchService.reindexAll();
    return { indexed };
  }

  /**
   * Index a single product (Admin)
   * POST /search/admin/index/:productId
   */
  @Post('admin/index/:productId')
  @Roles(AdminRole.admin, AdminRole.super_admin)
  async indexProduct(
    @Param('productId') productId: string,
  ): Promise<{ success: boolean }> {
    await this.searchService.indexProduct(productId);
    return { success: true };
  }
}
