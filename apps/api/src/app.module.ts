import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BusinessesModule } from './businesses/businesses.module.js';
import { ClassifierModule } from './classifier/classifier.module.js';
import { envSchema } from './config/env.js';

@Module({
  imports: [
    // The workspace scripts run from apps/api, and the .env file lives at the repo root.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validationSchema: envSchema,
    }),
    BusinessesModule,
    ClassifierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
