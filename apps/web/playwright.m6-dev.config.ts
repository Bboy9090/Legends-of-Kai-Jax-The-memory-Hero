import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.devtest.ts",
  workers: 1,
  retries: 0,
  timeout: 240000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5187",
    trace: "retain-on-failure",
  },
  projects: [{
    name: "chromium",
    use: {
      ...devices["Desktop Chromium"],
      headless: true,
      launchArgs: [
        "--no-sandbox", "--disable-dev-shm-usage",
        ...(process.env.CI
          ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
          : []),
      ],
    },
  }],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5187 --strictPort",
    url: "http://127.0.0.1:5187",
    reuseExistingServer: true,
    timeout: 90000,
  },
});
