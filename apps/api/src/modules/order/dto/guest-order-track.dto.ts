import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuestOrderTrackDto {
  @ApiProperty({
    description: 'Order number to track',
    example: 'ORD-20250116-ABC123',
  })
  @IsString()
  orderNumber: string;

  @ApiProperty({
    description: 'Email address used for the order',
    example: 'guest@example.com',
  })
  @IsEmail()
  email: string;
}
