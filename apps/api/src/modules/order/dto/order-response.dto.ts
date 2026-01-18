import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderProductDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Vintage Star Wars Figure' })
  title: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/image.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 'active' })
  status: string;
}

export class OrderUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ example: true })
  isVerified: boolean;
}

export class OrderAddressDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ev Adresi' })
  title: string;

  @ApiProperty({ example: 'Atatürk Cad. No: 123' })
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Daire 5' })
  addressLine2?: string;

  @ApiProperty({ example: 'Kadıköy' })
  district: string;

  @ApiProperty({ example: 'İstanbul' })
  city: string;

  @ApiProperty({ example: '34700' })
  postalCode: string;
}

export class OrderShipmentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'aras' })
  provider: string;

  @ApiPropertyOptional({ example: '123456789' })
  trackingNumber?: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiPropertyOptional({ example: 25.50 })
  cost?: number | null;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'ORD-2024-000001' })
  orderNumber: string;

  @ApiProperty({ example: 250.0 })
  amount: number;

  @ApiProperty({ example: 12.5 })
  commissionAmount: number;

  @ApiProperty({ example: 'pending_payment' })
  status: string;

  @ApiProperty({ type: OrderProductDto })
  product: OrderProductDto;

  @ApiProperty({ type: OrderUserDto })
  buyer: OrderUserDto;

  @ApiProperty({ type: OrderUserDto })
  seller: OrderUserDto;

  @ApiPropertyOptional({ type: OrderAddressDto })
  shippingAddress?: OrderAddressDto | null;

  @ApiPropertyOptional({ type: OrderAddressDto })
  billingAddress?: OrderAddressDto | null;

  @ApiPropertyOptional({ type: OrderShipmentDto })
  shipment?: OrderShipmentDto | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this user is the buyer',
  })
  isBuyer?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this user is the seller',
  })
  isSeller?: boolean;
}

export class PaginatedOrdersDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({
    example: {
      total: 10,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
