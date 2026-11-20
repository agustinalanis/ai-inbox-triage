import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Takes precedence over the .env file, so e2e tests never use a real key.
    // They share today's usage counter with local dev, so they get a limit they never reach.
    env: { GEMINI_API_KEY: 'test-key', DAILY_MESSAGE_LIMIT: '1000000' },
  },
});
