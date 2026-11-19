import { createGoogle } from '@ai-sdk/google';
import { AiModule } from '@nestjs/ai';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { ClassifierService } from './classifier.service.js';

@Module({
  imports: [
    AiModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const google = createGoogle({
          apiKey: config.get('GEMINI_API_KEY', { infer: true }),
        });
        return {
          models: {
            default: {
              model: google(config.get('GEMINI_MODEL', { infer: true })),
              fallback: 'backup',
            },
            backup: google(
              config.get('GEMINI_FALLBACK_MODEL', { infer: true }),
            ),
          },
          // Gemini answers 503 under load: fail fast to the backup model instead of waiting on long retries.
          defaults: {
            timeout: '10s',
            retry: { attempts: 2, backoff: { delay: '500ms', maxDelay: '2s' } },
          },
        };
      },
    }),
  ],
  providers: [ClassifierService],
  exports: [ClassifierService],
})
export class ClassifierModule {}
