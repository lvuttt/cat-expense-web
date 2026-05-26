import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import path from 'path';

/**
 * Vitest configuration.
 * Configured to scan only unit tests in the src directory and ignore Playwright specs in the e2e-tests directory.
 */
export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
  resolve: {
    conditions: ['browser'],
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      '$app/paths': path.resolve(__dirname, './src/lib/mocks/appPaths.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e-tests/**/*', 'node_modules/**/*'],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
