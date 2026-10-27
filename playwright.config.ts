import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { STORAGE_STATE } from './utils/paths';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'reports/html', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://conduit.bondaracademy.com',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    // Registers a user through the UI, then saves its credentials and signed-in browser state.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // Anonymous tests: registration and login must start logged out. Login needs the registered user.
    {
      name: 'chromium-anonymous',
      testMatch: /(login|register)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },

    // Everything else starts signed in from the saved storage state.
    {
      name: 'chromium',
      testIgnore: [/(login|register)\.spec\.ts/, /auth\.setup\.ts/],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    {
      name: 'firefox',
      testIgnore: [/(login|register)\.spec\.ts/, /auth\.setup\.ts/],
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    },
  ],
});
