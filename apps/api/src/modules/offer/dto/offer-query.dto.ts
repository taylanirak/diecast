import { IsOptional, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OfferStatus } from '@prisma/client';

export class OfferQueryDto {
  @ApiPropertyOptional({
    example: 'uuid-product-id',
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsUUID('4')
  productId?: string;

  @ApiPropertyOptional({
    enum: OfferStatus,
    example: 'pending',
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiPropertyOptional({
    example: 'sent',
    description: 'Filter by type (sent = offers I made, received = offers on my products)',
    enum: ['sent', 'received'],
  })
  @IsOptional()
  type?: 'sent' | 'received';

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
