import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CommissionRuleType, SellerType } from '@prisma/client';

export class CreateCommissionRuleDto {
  @ApiProperty({
    example: 'Standart Komisyon',
    description: 'Rule name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 5.0,
    description: 'Commission percentage',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(50)
  percentage: number;

  @ApiProperty({
    enum: CommissionRuleType,
    example: 'seller',
    description: 'Who pays the commission',
  })
  @IsEnum(CommissionRuleType)
  type: CommissionRuleType;

  @ApiPropertyOptional({
    enum: SellerType,
    example: 'individual',
    description: 'Applicable seller type (null for all)',
  })
  @IsOptional()
  @IsEnum(SellerType)
  sellerType?: SellerType;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum order amount for this rule',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the rule is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCommissionRuleDto {
  @ApiPropertyOptional({ example: 'Premium Komisyon' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(50)
  percentage?: number;

  @ApiPropertyOptional({ enum: CommissionRuleType })
  @IsOptional()
  @IsEnum(CommissionRuleType)
  type?: CommissionRuleType;

  @ApiPropertyOptional({ enum: SellerType })
  @IsOptional()
  @IsEnum(SellerType)
  sellerType?: SellerType;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CommissionRuleResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Standart Komisyon' })
  name: string;

  @ApiProperty({ example: 5.0 })
  percentage: number;

  @ApiProperty({ example: 'seller' })
  type: string;

  @ApiPropertyOptional({ example: 'individual' })
  sellerType?: string;

  @ApiPropertyOptional({ example: 100 })
  minAmount?: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
