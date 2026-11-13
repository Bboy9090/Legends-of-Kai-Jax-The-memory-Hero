import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

/** Prefer an explicit override, then the sandbox's system Chromium, then Playwright's bundled browser. */
const executablePath = [process.env.PW_CHROMIUM_PATH, '/opt/pw-browsers/chromium']
  .filter((p): p is string => Boolean(p))
  .find((p) => {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });

export default defineConfig({
  testDir: '../../tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 240_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: '../../artifacts/verification/test-results',
  use: {
    baseURL: 'http://localhost:5000',
    browserName: 'chromium',
    // iPhone 14 dimensions
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    trace: 'off',
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: 'npx vite --host 0.0.0.0 --port 5000',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
