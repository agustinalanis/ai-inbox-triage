import { z } from 'zod';

// Validated by ConfigModule at startup; its errors redact the values.
export const envSchema = z.object({
  GEMINI_API_KEY: z.string().trim().min(1),
  GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.5-flash-lite'),
  GEMINI_FALLBACK_MODEL: z
    .string()
    .trim()
    .min(1)
    .default('gemini-3.1-flash-lite'),
  DATABASE_URL: z.url(),
  // The only origin allowed by CORS: the web app.
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
  // Messages classified per UTC day across all sessions, to stay inside the Gemini free tier.
  DAILY_MESSAGE_LIMIT: z.coerce.number().int().positive().default(300),
});

export type Env = z.infer<typeof envSchema>;
