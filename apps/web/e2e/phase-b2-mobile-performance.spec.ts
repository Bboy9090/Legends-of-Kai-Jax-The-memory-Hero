import { test, expect } from '@playwright/test';

const PREVIEW_URL = 'http://127.0.0.1:4173';

const MOBILE_DEVICES = {
  'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2 },
  'iPhone 12': { width: 390, height: 844, deviceScaleFactor: 3 },
  'iPad': { width: 768, height: 1024, deviceScaleFactor: 2 },
};

type FrameEvidence = {
  frameCount: number;
  elapsedMs: number;
  avgFrameMs: number;
  p95FrameMs: number;
  maxFrameMs: number;
  fps: number;
};

async function sampleAnimationFrames(page: import('@playwright/test').Page, durationMs = 2000): Promise<FrameEvidence> {
  return page.evaluate((duration) => new Promise<FrameEvidence>((resolve) => {
    const samples: number[] = [];
    const startedAt = performance.now();
    let last = startedAt;

    const frame = (now: number) => {
      if (now !== last) samples.push(now - last);
      last = now;

      if (now - startedAt < duration) {
        requestAnimationFrame(frame);
        return;
      }

      const sorted = [...samples].sort((a, b) => a - b);
      const elapsedMs = now - startedAt;
      const avgFrameMs = samples.length
        ? samples.reduce((sum, value) => sum + value, 0) / samples.length
        : elapsedMs;
      const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
      const p95FrameMs = sorted.length ? sorted[Math.max(0, p95Index)] : elapsedMs;
      const maxFrameMs = sorted.length ? Math.max(...sorted) : elapsedMs;

      resolve({
        frameCount: samples.length,
        elapsedMs,
        avgFrameMs,
        p95FrameMs,
        maxFrameMs,
        fps: elapsedMs > 0 ? (samples.length * 1000) / elapsedMs : 0,
      });
    };

    requestAnimationFrame(frame);
  }), durationMs);
}

test.describe('Built-preview mobile performance evidence', () => {
  for (const [deviceName, viewport] of Object.entries(MOBILE_DEVICES)) {
    test(`${deviceName}: records real browser animation cadence`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
      });
      const page = await context.newPage();

      const response = await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });

      const navigation = await page.evaluate(() => {
        const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        return entry ? {
          domContentLoadedMs: entry.domContentLoadedEventEnd,
          loadEventMs: entry.loadEventEnd,
        } : null;
      });

      const cadence = await sampleAnimationFrames(page, 2000);

      // This is a hosted-runner sanity gate, not a claim of target-device FPS.
      // Require a live animation clock and record the real cadence for evidence.
      expect(cadence.elapsedMs).toBeGreaterThanOrEqual(1900);
      expect(cadence.frameCount).toBeGreaterThan(10);
      expect(cadence.fps).toBeGreaterThan(5);

      console.log('MOBILE_PERFORMANCE_EVIDENCE', JSON.stringify({
        device: deviceName,
        viewport,
        navigation,
        cadence,
      }));

      await context.close();
    });
  }

  test('records paint and layout-shift evidence from the built preview', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__kjPerfEvidence = { cls: 0 };
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput && typeof entry.value === 'number') {
              (window as any).__kjPerfEvidence.cls += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // Older engines may not expose layout-shift. Evidence will record null.
        (window as any).__kjPerfEvidence.cls = null;
      }
    });

    const response = await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });
    await page.waitForTimeout(500);

    const evidence = await page.evaluate(() => {
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find((entry) => entry.name === 'first-contentful-paint');
      return {
        fcpMs: fcp?.startTime ?? null,
        cls: (window as any).__kjPerfEvidence?.cls ?? null,
      };
    });

    if (evidence.fcpMs !== null) expect(evidence.fcpMs).toBeGreaterThan(0);
    if (evidence.cls !== null) expect(evidence.cls).toBeGreaterThanOrEqual(0);

    console.log('WEB_VITALS_EVIDENCE', JSON.stringify(evidence));
  });
});
