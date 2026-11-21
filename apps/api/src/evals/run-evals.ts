// Runs the labeled datasets in evals/ against the real Gemini models. Spends API quota: not part of CI.
// Usage: npm run eval -- [--business <id>] [--models <model-a>,<model-b>]
import { readFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { createGoogle } from '@ai-sdk/google';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import type { BusinessConfig } from '../businesses/business-config.schema.js';
import { BusinessesService } from '../businesses/businesses.service.js';
import { ClassifierService } from '../classifier/classifier.service.js';
import type { Env } from '../config/env.js';
import { parseEvalCases, summarize, type EvalOutcome } from './metrics.js';

const { values: args } = parseArgs({
  options: {
    business: { type: 'string' },
    models: { type: 'string' },
  },
});

// shortcut: a fixed 15 calls/minute fits the free tier; derive it from the plan's quota on a paid key.
const MIN_CALL_INTERVAL_MS = 4_000;

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});
try {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const businessesService = app.get(BusinessesService);
  const classifier = app.get(ClassifierService);
  const google = createGoogle({
    apiKey: config.get('GEMINI_API_KEY', { infer: true }),
  });

  const modelIds = args.models
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean) ?? [config.get('GEMINI_MODEL', { infer: true })];

  let businesses: BusinessConfig[] = businessesService.findAll();
  if (args.business) {
    const business = businessesService.findOne(args.business);
    if (!business) {
      throw new Error(
        `Unknown business "${args.business}". Available: ${businesses.map((b) => b.id).join(', ')}`,
      );
    }
    businesses = [business];
  }

  // Loaded up front, so a missing or invalid dataset fails before any quota is spent.
  const datasets = await Promise.all(
    businesses.map(async (business) => ({
      business,
      cases: parseEvalCases(
        await readFile(
          new URL(`../../evals/${business.id}.jsonl`, import.meta.url),
          'utf8',
        ),
        business,
      ),
    })),
  );

  for (const { business, cases } of datasets) {
    for (const modelId of modelIds) {
      console.log(`\n${business.id} · ${modelId} · ${cases.length} cases`);
      const outcomes: EvalOutcome[] = [];
      for (const expected of cases) {
        // Sequential and paced on purpose: unpaced, the free tier failed every call after ~30 in a minute.
        const [result] = await Promise.all([
          classifier.classify(expected.text, business, {
            model: google(modelId),
          }),
          sleep(MIN_CALL_INTERVAL_MS),
        ]);
        outcomes.push({ expected, result });
      }

      const report = summarize(outcomes);
      console.table({
        accuracy: percent(report.accuracy),
        'accuracy (answered)':
          report.answeredAccuracy === null
            ? 'n/a'
            : percent(report.answeredAccuracy),
        needsHuman: percent(report.needsHumanAccuracy),
        fallbacks: report.fallbacks,
        'avg latency (ms)': report.avgLatencyMs,
        'p95 latency (ms)': report.p95LatencyMs,
      });
      console.table(
        Object.entries(report.byCategory).map(([category, hits]) => ({
          category,
          hits: `${hits.correct}/${hits.total}`,
        })),
      );
      const misses = outcomes.filter(
        ({ expected, result }) =>
          result.category !== expected.category ||
          result.needsHuman !== expected.needsHuman,
      );
      if (misses.length > 0) {
        console.table(
          misses.map(({ expected, result }) => ({
            text: expected.text.slice(0, 60),
            expected: `${expected.category} / human=${expected.needsHuman}`,
            got: `${result.category ?? 'fallback'} / human=${result.needsHuman}`,
          })),
        );
      }
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await app.close();
}
