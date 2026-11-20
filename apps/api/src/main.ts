import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: app
      .get(ConfigService<Env, true>)
      .get('WEB_ORIGIN', { infer: true }),
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
