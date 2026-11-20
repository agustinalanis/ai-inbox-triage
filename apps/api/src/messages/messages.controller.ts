import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { z } from 'zod';
import { DemoSession } from './demo-session.decorator.js';
import { MessagesService } from './messages.service.js';

export const MAX_MESSAGE_LENGTH = 1000;

const createMessageSchema = z.object({
  businessId: z.string().min(1),
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  senderName: z.string().trim().min(1).max(100).optional(),
  senderEmail: z.email().max(254).optional(),
});

const listMessagesSchema = z.object({ businessId: z.string().min(1) });

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Only this route calls Gemini, so only this one is rate limited per IP.
  @Post()
  @UseGuards(ThrottlerGuard)
  create(
    @DemoSession() sessionId: string,
    @Body({ schema: createMessageSchema })
    body: z.infer<typeof createMessageSchema>,
  ) {
    return this.messagesService.create(sessionId, body);
  }

  @Get()
  list(
    @DemoSession() sessionId: string,
    @Query({ schema: listMessagesSchema })
    { businessId }: z.infer<typeof listMessagesSchema>,
  ) {
    return this.messagesService.list(sessionId, businessId);
  }
}
