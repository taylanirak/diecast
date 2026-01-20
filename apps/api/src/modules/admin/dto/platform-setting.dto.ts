import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlatformSettingDto {
  @ApiProperty({
    example: 'site_maintenance',
    description: 'Setting key',
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: 'false',
    description: 'Setting value',
  })
  @IsString()
  value: string;

  @ApiPropertyOptional({
    example: 'string',
    description: 'Setting type (string, boolean, number, json)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 'Site bakım modu',
    description: 'Setting description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PlatformSettingResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'site_maintenance' })
  key: string;

  @ApiProperty({ example: 'false' })
  value: string;

  @ApiPropertyOptional({ example: 'Site bakım modu' })
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class BulkSettingsUpdateDto {
  @ApiProperty({
    type: [UpdatePlatformSettingDto],
    description: 'Array of settings to update',
  })
  settings: UpdatePlatformSettingDto[];
}
