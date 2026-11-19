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
});

export type Env = z.infer<typeof envSchema>;
