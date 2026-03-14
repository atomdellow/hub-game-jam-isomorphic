import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for IsoBloom E2E tests.
 * Tests run against the Vite dev server started automatically.
 */
export default defineConfig({
  testDir:    './e2e',
  fullyParallel: false,    // keep sequential for determinism in game flow tests
  forbidOnly: !!process.env.CI,
  retries:    process.env.CI ? 2 : 0,
  reporter:   process.env.CI ? 'dot' : 'list',
  timeout:    15_000,

  use: {
    baseURL:     'http://localhost:5173',
    trace:       'on-first-retry',
    screenshot:  'only-on-failure',
  },

  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Vite dev server before running tests */
  webServer: {
    command:              'npm run dev',
    url:                  'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout:              30_000,
  },
})
