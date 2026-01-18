import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    enum: ProductStatus,
    example: 'active',
    description: 'Product status (seller can only set to active or inactive)',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Geçerli bir durum seçiniz' })
  status?: ProductStatus;
}
