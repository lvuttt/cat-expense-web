import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration.
 * Configured to scan only unit tests in the src directory and ignore Playwright specs in the e2e-tests directory.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e-tests/**/*', 'node_modules/**/*'],
  },
});
