import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../../prisma';
import { PaymentProvidersModule } from '../payment-providers';
import { EventModule } from '../events';

@Module({
  imports: [PrismaModule, ConfigModule, PaymentProvidersModule, EventModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
