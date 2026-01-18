import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  PaginatedProductsDto,
} from './dto';
import { JwtAuthGuard, Public, CurrentUser } from '../auth';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /products
   * List products with filters (public)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Ürün listesi' })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi',
    type: PaginatedProductsDto,
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  /**
   * GET /products/my
   * Get seller's own products (all statuses)
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kendi ürünlerim' })
  @ApiResponse({
    status: 200,
    description: 'Satıcının kendi ürünleri',
    type: PaginatedProductsDto,
  })
  async findMyProducts(
    @CurrentUser('id') sellerId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productService.findSellerProducts(sellerId, query);
  }

  /**
   * GET /products/:id
   * Get single product (public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Ürün detayı' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID format)' })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz ürün ID formatı' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async findOne(
    @Param('id', new ParseUUIDPipe({
      errorHttpStatusCode: 400,
      exceptionFactory: () => new BadRequestException('Geçersiz ürün ID formatı. UUID formatında olmalıdır (örn: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)'),
    })) id: string,
  ) {
    return this.productService.findOne(id);
  }

  /**
   * POST /products
   * Create new product (seller only)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Ürün oluşturuldu',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  @ApiResponse({ status: 403, description: 'Satıcı hesabı gerekli' })
  async create(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(sellerId, dto);
  }

  /**
   * PATCH /products/:id
   * Update product (owner only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün güncelle' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID format)' })
  @ApiResponse({
    status: 200,
    description: 'Ürün güncellendi',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz ürün ID formatı' })
  @ApiResponse({ status: 403, description: 'Yetkiniz yok' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @ApiResponse({ status: 409, description: 'Concurrent update conflict' })
  async update(
    @Param('id', new ParseUUIDPipe({
      errorHttpStatusCode: 400,
      exceptionFactory: () => new BadRequestException('Geçersiz ürün ID formatı'),
    })) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, sellerId, dto);
  }

  /**
   * DELETE /products/:id
   * Delete product (owner only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün sil' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID format)' })
  @ApiResponse({ status: 200, description: 'Ürün silindi' })
  @ApiResponse({ status: 400, description: 'Geçersiz ürün ID formatı' })
  @ApiResponse({ status: 403, description: 'Yetkiniz yok' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async remove(
    @Param('id', new ParseUUIDPipe({
      errorHttpStatusCode: 400,
      exceptionFactory: () => new BadRequestException('Geçersiz ürün ID formatı'),
    })) id: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.productService.remove(id, sellerId);
  }
}
