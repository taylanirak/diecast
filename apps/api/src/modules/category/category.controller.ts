import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Public } from '../auth';

@ApiTags('categories')
@Controller('categories')
@Public() // All category endpoints are public
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * GET /categories
   * Get all categories (hierarchical)
   */
  @Get()
  @ApiOperation({ summary: 'Kategori listesi' })
  @ApiResponse({
    status: 200,
    description: 'Kategori listesi (hiyerarşik)',
  })
  async findAll() {
    return this.categoryService.findAll();
  }

  /**
   * GET /categories/:id
   * Get category by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Kategori detayı (ID ile)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Kategori detayı' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * GET /categories/slug/:slug
   * Get category by slug
   */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Kategori detayı (slug ile)' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Kategori detayı' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
}
