import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { PrismaModule } from '../../prisma';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
