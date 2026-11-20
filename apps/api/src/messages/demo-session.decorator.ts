import {
  BadRequestException,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';

const sessionIdSchema = z.uuid();

/** The anonymous demo session: a UUID the web generates and sends in the `X-Demo-Session` header. */
export const DemoSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const header = context
      .switchToHttp()
      .getRequest<Request>()
      .header('x-demo-session');
    const result = sessionIdSchema.safeParse(header);
    if (!result.success) {
      throw new BadRequestException('The X-Demo-Session header must be a UUID');
    }
    return result.data;
  },
);
