import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Takes precedence over the .env file, so e2e tests never use a real key.
    env: { GEMINI_API_KEY: 'test-key' },
  },
});
