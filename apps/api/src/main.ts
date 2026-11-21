import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Behind the host's proxy: without it every visitor shares the proxy's IP and one rate-limit bucket.
  app.set('trust proxy', 1);
  const config = app.get(ConfigService<Env, true>);
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }) });
  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
