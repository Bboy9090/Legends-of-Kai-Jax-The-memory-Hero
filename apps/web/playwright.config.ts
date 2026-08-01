import { defineConfig, devices } from '@playwright/test';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium/chrome-linux/chrome';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chromium'],
        headless: true,
        launchArgs: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
