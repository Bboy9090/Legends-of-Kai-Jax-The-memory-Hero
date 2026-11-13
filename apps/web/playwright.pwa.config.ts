import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

const executablePath = [process.env.PW_CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter((p): p is string => Boolean(p)).find((p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
});

/** PWA checks run against the production build (service workers + hashed assets), not the dev server. */
export default defineConfig({
  testDir: '../../tests/e2e',
  testMatch: '**/pwa.pwaspec.ts',
  timeout: 120_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: '../../artifacts/verification/test-results',
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    trace: 'off',
    launchOptions: { ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] },
  },
  webServer: {
    command: 'npx vite build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
