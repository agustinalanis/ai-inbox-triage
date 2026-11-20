import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../src/config/env.js';
import { UsageService } from '../src/messages/usage.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// Days far in the past, so the test never touches the real counter of today.
const DAY_ONE = new Date('2000-01-01T12:00:00Z');
const DAY_TWO = new Date('2000-01-02T00:30:00Z');
const LIMIT = 3;

describe('UsageService (Postgres)', () => {
  let prisma: PrismaService;
  let usage: UsageService;

  beforeAll(() => {
    process.loadEnvFile(new URL('../../../.env', import.meta.url));
    const config = new ConfigService<Env, true>({
      DATABASE_URL: process.env.DATABASE_URL,
      DAILY_MESSAGE_LIMIT: LIMIT,
    });
    prisma = new PrismaService(config);
    usage = new UsageService(prisma, config);
  });

  // Safe in parallel: the counter is atomic (see the concurrency test).
  const consumeLimit = () =>
    Promise.all(Array.from({ length: LIMIT }, () => usage.consume()));

  const cleanUp = () =>
    prisma.dailyUsage.deleteMany({
      where: { day: { in: [new Date('2000-01-01'), new Date('2000-01-02')] } },
    });

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await cleanUp();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await cleanUp();
    await prisma.$disconnect();
  });

  it('allows messages up to the daily limit', async () => {
    vi.setSystemTime(DAY_ONE);
    await expect(consumeLimit()).resolves.toHaveLength(LIMIT);
  });

  it('answers 429 once the limit is passed', async () => {
    vi.setSystemTime(DAY_ONE);
    await consumeLimit();
    await expect(usage.consume()).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('counts concurrent requests without losing any', async () => {
    vi.setSystemTime(DAY_ONE);
    const results = await Promise.allSettled(
      Array.from({ length: LIMIT + 2 }, () => usage.consume()),
    );
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(rejected).toHaveLength(2);
    // Only limit errors: a non-atomic upsert would fail with a unique constraint error instead.
    for (const { reason } of rejected) {
      expect(reason).toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
    }
  });

  it('starts from zero on a new UTC day', async () => {
    vi.setSystemTime(DAY_ONE);
    await consumeLimit();
    vi.setSystemTime(DAY_TWO);
    await expect(usage.consume()).resolves.toBeUndefined();
  });
});
