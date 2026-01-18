import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShipmentEventDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'picked_up' })
  status: string;

  @ApiProperty({ example: 'İstanbul Dağıtım Merkezi' })
  location: string;

  @ApiPropertyOptional({ example: 'Kargo teslim alındı' })
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  occurredAt: Date;
}

export class ShipmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid-order-id' })
  orderId: string;

  @ApiProperty({ example: 'aras' })
  provider: string;

  @ApiPropertyOptional({ example: '1234567890' })
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'https://aras.com.tr/track/1234567890' })
  trackingUrl?: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiPropertyOptional({ example: 25.50 })
  cost?: number;

  @ApiPropertyOptional({ example: '2024-01-18T10:30:00.000Z' })
  estimatedDelivery?: Date;

  @ApiProperty({ type: [ShipmentEventDto] })
  events: ShipmentEventDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class ShippingRateDto {
  @ApiProperty({ example: 'aras' })
  provider: string;

  @ApiProperty({ example: 'Aras Kargo' })
  providerName: string;

  @ApiProperty({ example: 25.50 })
  cost: number;

  @ApiProperty({ example: 'TRY' })
  currency: string;

  @ApiProperty({ example: '2-3 iş günü' })
  estimatedDelivery: string;
}

export class ShippingRatesResponseDto {
  @ApiProperty({ type: [ShippingRateDto] })
  rates: ShippingRateDto[];
}
