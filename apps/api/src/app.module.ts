import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { BusinessesModule } from './businesses/businesses.module.js';
import { envSchema } from './config/env.js';
import { MessagesModule } from './messages/messages.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // The workspace scripts run from apps/api, and the .env file lives at the repo root.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validationSchema: envSchema,
    }),
    // Applied only where a route opts in with ThrottlerGuard.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    PrismaModule,
    BusinessesModule,
    MessagesModule,
  ],
  // Validates every parameter declared with a `schema` (zod).
  providers: [{ provide: APP_PIPE, useClass: StandardSchemaValidationPipe }],
})
export class AppModule {}
