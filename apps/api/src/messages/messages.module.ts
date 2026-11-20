import { Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module.js';
import { ClassifierModule } from '../classifier/classifier.module.js';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';
import { UsageService } from './usage.service.js';

@Module({
  imports: [BusinessesModule, ClassifierModule],
  controllers: [MessagesController],
  providers: [MessagesService, UsageService],
})
export class MessagesModule {}
