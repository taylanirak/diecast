// =============================================================================
// GAP-L03: INTERNATIONALIZATION CONTROLLER
// =============================================================================

import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { I18nService, SupportedLanguage } from './i18n.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('i18n')
@Controller('i18n')
@Public() // All i18n endpoints should be public
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get supported languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages' })
  getSupportedLanguages() {
    return {
      languages: this.i18nService.getSupportedLanguages(),
      default: this.i18nService.getDefaultLanguage(),
    };
  }

  @Get('translations')
  @ApiOperation({ summary: 'Get all translations for a language' })
  @ApiQuery({ name: 'lang', required: false, enum: ['tr', 'en'] })
  @ApiResponse({ status: 200, description: 'All translations for the specified language' })
  getTranslations(
    @Query('lang') lang?: SupportedLanguage,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const language = lang || this.i18nService.parseAcceptLanguage(acceptLanguage);
    return {
      language,
      translations: this.i18nService.getAllTranslations(language),
    };
  }

  @Get('translate')
  @ApiOperation({ summary: 'Translate a specific key' })
  @ApiQuery({ name: 'key', required: true, description: 'Translation key' })
  @ApiQuery({ name: 'lang', required: false, enum: ['tr', 'en'] })
  @ApiResponse({ status: 200, description: 'Translated string' })
  translate(
    @Query('key') key: string,
    @Query('lang') lang?: SupportedLanguage,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const language = lang || this.i18nService.parseAcceptLanguage(acceptLanguage);
    return {
      key,
      language,
      translation: this.i18nService.translate(key as any, language),
    };
  }
}
