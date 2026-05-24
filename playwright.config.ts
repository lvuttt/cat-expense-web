import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 * Launches a separate test server on port 5175 to avoid interfering with the running dev server.
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['e2e-tests/**/*.spec.ts', 'visual-tests/**/*.spec.ts'],
  fullyParallel: false, // Run sequentially to avoid localStorage state pollution
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5182',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev --port 5182',
    url: 'http://localhost:5182',
    reuseExistingServer: false,
    timeout: 15 * 1000,
  },
});
