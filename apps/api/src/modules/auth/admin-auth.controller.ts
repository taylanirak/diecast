import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, AdminAuthResponseDto } from './dto';
import { AdminAuthGuard } from './guards';
import { CurrentUser, Public } from './decorators';
import { RequestUser } from './interfaces';

@ApiTags('admin')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/admin/login
   * Admin login (separate authentication as defined in project.md)
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin girişi' })
  @ApiResponse({
    status: 200,
    description: 'Admin giriş başarılı',
    type: AdminAuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Email veya şifre hatalı' })
  async adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  /**
   * GET /auth/admin/profile
   * Get admin profile
   */
  @Get('profile')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin profili' })
  @ApiResponse({ status: 200, description: 'Admin profil bilgileri' })
  @ApiResponse({ status: 401, description: 'Admin yetkisi gerekiyor' })
  async getAdminProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  /**
   * POST /auth/admin/logout
   * Admin logout
   */
  @Post('logout')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin çıkış' })
  @ApiResponse({ status: 200, description: 'Çıkış yapıldı' })
  async adminLogout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
