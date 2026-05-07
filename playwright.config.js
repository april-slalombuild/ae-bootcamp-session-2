// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_PORT = process.env.PORT || 3030;
const BASE_URL = process.env.BASE_URL || `http://localhost:${FRONTEND_PORT}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.js$/,
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd packages/backend && npm start',
      url: `http://localhost:${BACKEND_PORT}/healthz`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        PORT: String(BACKEND_PORT),
        DATABASE_PATH: ':memory:',
      },
    },
    {
      command: 'cd packages/frontend && npm start',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: String(FRONTEND_PORT),
        BROWSER: 'none',
      },
    },
  ],
});
