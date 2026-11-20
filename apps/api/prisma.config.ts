import { defineConfig } from 'prisma/config';

// Prisma 7 does not load .env files; the shared one lives at the repo root. It may be missing (CI, deploy).
try {
  process.loadEnvFile(new URL('../../.env', import.meta.url));
} catch {
  // Fall back to the variables already in the environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Optional so `prisma generate` (postinstall) works without a database.
  datasource: { url: process.env.DATABASE_URL },
});
