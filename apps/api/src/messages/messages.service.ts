import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { BusinessConfig } from '../businesses/business-config.schema.js';
import { BusinessesService } from '../businesses/businesses.service.js';
import { ClassifierService } from '../classifier/classifier.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SEED_MESSAGES } from './seed-messages.js';
import { UsageService } from './usage.service.js';

export interface CreateMessageInput {
  businessId: string;
  text: string;
  senderName?: string;
  senderEmail?: string;
}

// The session id stays out of the responses: the client already knows it.
const omitSession = { sessionId: true } as const;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businesses: BusinessesService,
    private readonly classifier: ClassifierService,
    private readonly usage: UsageService,
  ) {}

  async create(sessionId: string, input: CreateMessageInput) {
    const business = this.findBusiness(input.businessId);
    await this.usage.consume();
    const classification = await this.classifier.classify(input.text, business);
    return this.prisma.message.create({
      data: { sessionId, ...input, ...classification },
      omit: omitSession,
    });
  }

  async list(sessionId: string, businessId: string) {
    this.findBusiness(businessId);
    await this.seed(sessionId, businessId);
    return this.prisma.message.findMany({
      where: { sessionId, businessId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      omit: omitSession,
    });
  }

  private findBusiness(id: string): BusinessConfig {
    const business = this.businesses.findOne(id);
    if (!business) {
      throw new BadRequestException(`Unknown businessId "${id}"`);
    }
    return business;
  }

  // Deterministic ids make the seed idempotent, even for concurrent first visits.
  private async seed(sessionId: string, businessId: string) {
    const now = Date.now();
    await this.prisma.message.createMany({
      data: SEED_MESSAGES.filter((m) => m.businessId === businessId).map(
        ({ key, minutesAgo, ...message }) => ({
          ...message,
          id: seedMessageId(sessionId, key),
          sessionId,
          latencyMs: 0,
          isExample: true,
          createdAt: new Date(now - minutesAgo * 60_000),
        }),
      ),
      skipDuplicates: true,
    });
  }
}

/** A UUID derived from the session and the seed key (v8 layout: custom hash-based). */
export function seedMessageId(sessionId: string, key: string): string {
  const hex = createHash('sha256').update(`${sessionId}:${key}`).digest('hex');
  const variant = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
