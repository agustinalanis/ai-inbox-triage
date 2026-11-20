import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Counts one classification for today (UTC), and throws 429 once the daily limit is passed. */
  async consume(): Promise<void> {
    const day = new Date(new Date().toISOString().slice(0, 10));
    // A single-field upsert runs as INSERT ... ON CONFLICT, so concurrent requests never lose a count.
    const { count } = await this.prisma.dailyUsage.upsert({
      where: { day },
      create: { day, count: 1 },
      update: { count: { increment: 1 } },
    });
    if (count > this.config.get('DAILY_MESSAGE_LIMIT', { infer: true })) {
      throw new HttpException(
        'Se alcanzó el límite diario de mensajes de la demo. Probá de nuevo mañana.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
