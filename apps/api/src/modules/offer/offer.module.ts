import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { PrismaModule } from '../../prisma';
import { EventModule } from '../events';

@Module({
  imports: [PrismaModule, ConfigModule, EventModule],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
