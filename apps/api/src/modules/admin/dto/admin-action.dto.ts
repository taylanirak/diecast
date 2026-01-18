import { IsString, IsEnum, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class ApproveProductDto {
  @ApiPropertyOptional({
    example: 'Ürün onaylandı',
    description: 'Approval note',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RejectProductDto {
  @ApiProperty({
    example: 'Ürün açıklaması yetersiz',
    description: 'Rejection reason',
  })
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class UpdateProductStatusDto {
  @ApiProperty({
    enum: ProductStatus,
    example: 'active',
    description: 'New product status',
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional({
    example: 'Durum güncellendi',
    description: 'Status change note',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class BanUserDto {
  @ApiProperty({
    example: 'Platformkurallarının ihlali',
    description: 'Ban reason',
  })
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class ResolveDisputeDto {
  @ApiProperty({
    example: 'buyer_refund',
    description: 'Resolution type',
    enum: ['buyer_refund', 'seller_favor', 'partial_refund', 'dismissed'],
  })
  @IsString()
  resolution: 'buyer_refund' | 'seller_favor' | 'partial_refund' | 'dismissed';

  @ApiProperty({
    example: 'Alıcıya iade yapılacak',
    description: 'Resolution note',
  })
  @IsString()
  @MaxLength(1000)
  note: string;
}
