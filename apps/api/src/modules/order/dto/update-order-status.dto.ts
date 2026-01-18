import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: 'preparing',
    description: 'New order status',
  })
  @IsEnum(OrderStatus, { message: 'Geçersiz sipariş durumu' })
  status: OrderStatus;

  @ApiPropertyOptional({
    example: 'Ürün hazırlanıyor',
    description: 'Status change note',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CancelOrderDto {
  @ApiProperty({
    example: 'Kullanıcı talebi ile iptal',
    description: 'Cancellation reason',
  })
  @IsString({ message: 'İptal nedeni zorunludur' })
  @MaxLength(500, { message: 'İptal nedeni en fazla 500 karakter olabilir' })
  reason: string;
}
