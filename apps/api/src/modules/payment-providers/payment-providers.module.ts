import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IyzicoService } from './iyzico.service';
import { PayTRService } from './paytr.service';
import { ArasKargoService } from './aras-kargo.service';
import { YurticiKargoService } from './yurtici-kargo.service';

@Module({
  imports: [ConfigModule],
  providers: [IyzicoService, PayTRService, ArasKargoService, YurticiKargoService],
  exports: [IyzicoService, PayTRService, ArasKargoService, YurticiKargoService],
})
export class PaymentProvidersModule {}
