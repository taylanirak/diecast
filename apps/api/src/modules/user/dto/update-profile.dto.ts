import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Display name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'İsim en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'İsim en fazla 100 karakter olabilir' })
  displayName?: string;

  @ApiPropertyOptional({
    example: '+905551234567',
    description: 'Phone number',
  })
  @IsOptional()
  @Matches(/^\+90[0-9]{10}$/, {
    message: 'Geçerli bir Türkiye telefon numarası giriniz (+905XXXXXXXXX)',
  })
  phone?: string;
}
