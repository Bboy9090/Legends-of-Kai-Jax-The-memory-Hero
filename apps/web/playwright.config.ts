import { defineConfig, devices } from "@playwright/test";

/**
 * Release smoke-test config.
 * Builds and serves the production bundle, then drives it in Chromium with
 * software WebGL (SwiftShader) so the Three.js battle canvas can initialize
 * headlessly. Pre-installed Chromium is found via PLAYWRIGHT_BROWSERS_PATH.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: {
      // Use the pre-installed Chromium (browser download is disabled in this
      // environment). Falls back to Playwright's own resolution if unset.
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
        "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
      args: [
        "--enable-unsafe-swiftshader",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--ignore-gpu-blocklist",
      ],
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm build && pnpm preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    timeout: 180_000,
    reuseExistingServer: true,
  },
});
