import { z } from 'zod';

const idSchema = z.string().regex(/^[a-z][a-z0-9-]*$/, 'must be kebab-case');

const categorySchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  examples: z.array(z.string().min(1)).default([]),
  extract: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, 'must be camelCase'),
        // Shown to the staff in the inbox, next to the extracted value.
        label: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .default([]),
  // Categories that always need a person (e.g. a crisis): enforced in code, not left to the model.
  escalate: z.boolean().default(false),
});

export const businessConfigSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    priorityRules: z.string().min(1),
    // Sample messages the web offers to visitors; kept apart from the prompt examples on purpose.
    suggestions: z.array(z.string().min(1).max(1000)).default([]),
    categories: z.array(categorySchema).min(1),
  })
  .refine(
    (config) =>
      new Set(config.categories.map((c) => c.id)).size ===
      config.categories.length,
    {
      message: 'category ids must be unique',
      path: ['categories'],
    },
  );

export type BusinessConfig = z.infer<typeof businessConfigSchema>;
