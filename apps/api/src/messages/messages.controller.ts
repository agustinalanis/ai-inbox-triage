import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { z } from 'zod';
import { DemoSession } from './demo-session.decorator.js';
import { MessagesService } from './messages.service.js';

export const MAX_MESSAGE_LENGTH = 1000;

const businessIdSchema = z.string().min(1).max(50);

const createMessageSchema = z.object({
  businessId: businessIdSchema,
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  senderName: z.string().trim().min(1).max(100).optional(),
  senderEmail: z.email().max(254).optional(),
});

const listMessagesSchema = z.object({ businessId: businessIdSchema });

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Calls Gemini: the tight default limit protects the free-tier quota.
  @Post()
  @UseGuards(ThrottlerGuard)
  create(
    @DemoSession() sessionId: string,
    @Body({ schema: createMessageSchema })
    body: z.infer<typeof createMessageSchema>,
  ) {
    return this.messagesService.create(sessionId, body);
  }

  // Each new session seeds rows, so a loose limit keeps a script from filling the database.
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  list(
    @DemoSession() sessionId: string,
    @Query({ schema: listMessagesSchema })
    { businessId }: z.infer<typeof listMessagesSchema>,
  ) {
    return this.messagesService.list(sessionId, businessId);
  }
}
