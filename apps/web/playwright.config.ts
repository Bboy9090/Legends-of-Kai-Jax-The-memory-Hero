import { defineConfig, devices } from '@playwright/test';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium/chrome-linux/chrome';

const chromiumLaunchArgs = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  ...(process.env.CI
    ? [
        // GitHub's headless runners do not expose a hardware GPU. Force a
        // deterministic ANGLE/SwiftShader WebGL path so battle frames keep
        // advancing instead of stalling for multi-second software fallbacks.
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
      ]
    : []),
];

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
        launchArgs: chromiumLaunchArgs,
        executablePath: CHROMIUM_PATH,
      },
    },
  ],
  webServer: {
    command: 'npx vite --host 0.0.0.0 --port 5000',
    url: 'http://localhost:5000',
    reuseExistingServer: false,
    timeout: 10000,
  },
});
