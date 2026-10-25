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
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chromium'],
        headless: true,
        launchArgs: ['--no-sandbox', '--disable-dev-shm-usage'],
        executablePath: CHROMIUM_PATH,
      },
    },
  ],
  webServer: {
    command: 'true',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
