import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { ContentFilterService } from './content-filter.service';
import { PrismaModule } from '../../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [MessagingController],
  providers: [MessagingService, ContentFilterService],
  exports: [MessagingService, ContentFilterService],
})
export class MessagingModule {}
