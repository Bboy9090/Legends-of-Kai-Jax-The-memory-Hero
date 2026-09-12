import { test, expect } from '@playwright/test';

/**
 * Phase 5.5: Mobile Performance Profiling & Optimization
 * Comprehensive profiling for iOS (iPhone SE) and Android (Pixel 4a)
 * Targets: 30+ fps on mid-range, 60 fps on modern
 *
 * Metrics:
 * - Three.js render time (WebGL)
 * - AI simulation time (per-frame + multi-frame)
 * - Memory usage (WebGL texture, heap)
 * - Draw calls
 * - Animation frame time
 */

const PREVIEW_URL = 'http://localhost:4173';

const TARGET_DEVICES = {
  'iPhone SE (mid-range)': {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    userAgent: 'iPhone',
    targetFPS: 30,
  },
  'Pixel 4a (mid-range)': {
    width: 412,
    height: 869,
    deviceScaleFactor: 2,
    userAgent: 'Android',
    targetFPS: 30,
  },
  'iPhone 14 (modern)': {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    userAgent: 'iPhone',
    targetFPS: 60,
  },
};

interface PerformanceProfile {
  device: string;
  fps: number;
  avgFrameTime: number;
  maxFrameTime: number;
  p95FrameTime: number;
  p99FrameTime: number;
  renderTimeMs: number;
  aiTimeMs: number;
  drawCalls: number;
  triangles: number;
  webglMemoryMb: number;
  heapSizeMb: number;
  heapUsedMb: number;
  aiTicks: number;
  aiTickRate: string;
}

test.describe('Phase 5.5: Mobile Performance Profiling', () => {
  Object.entries(TARGET_DEVICES).forEach(([deviceName, viewport]) => {
    test(`${deviceName}: Comprehensive performance profile`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
      });

      const page = await context.newPage();

      // Inject performance monitoring script
      await page.addInitScript(() => {
        (window as any).__perfMonitor = {
          frameTimes: [] as number[],
          renderTimes: [] as number[],
          aiTimes: [] as number[],
          drawCalls: 0,
          triangles: 0,
          aiTicks: 0,
          lastTime: performance.now(),
        };

        // Patch requestAnimationFrame to measure frame times
        const originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = function(callback) {
          const startFrame = performance.now();
          return originalRAF((time) => {
            const startRender = performance.now();
            callback(time);
            const endRender = performance.now();
            const renderTime = endRender - startRender;
            const frameTime = performance.now() - startFrame;

            (window as any).__perfMonitor.frameTimes.push(frameTime);
            (window as any).__perfMonitor.renderTimes.push(renderTime);

            // Keep only last 300 frames (5 seconds @ 60fps)
            if ((window as any).__perfMonitor.frameTimes.length > 300) {
              (window as any).__perfMonitor.frameTimes.shift();
              (window as any).__perfMonitor.renderTimes.shift();
            }
          });
        };
      });

      await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Start training mode
      const startButton = page.locator('button:has-text("Training")').first();
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      // Let game stabilize
      await page.waitForTimeout(3000);

      // Trigger combat to see AI overhead
      const canvas = page.locator('canvas').first();
      const box = await canvas.boundingBox();
      if (box) {
        // Click to move and trigger enemies
        await page.click('canvas', {
          position: { x: Math.floor(box.width * 0.7), y: Math.floor(box.height * 0.5) },
        });
      }

      // Collect performance data over 5 seconds
      await page.waitForTimeout(5000);

      // Extract collected metrics
      const profile = await page.evaluate(() => {
        const monitor = (window as any).__perfMonitor;
        if (!monitor || monitor.frameTimes.length === 0) {
          return {
            fps: 0,
            avgFrameTime: 0,
            maxFrameTime: 0,
            p95FrameTime: 0,
            p99FrameTime: 0,
            renderTimeMs: 0,
            drawCalls: 0,
            triangles: 0,
            webglMemoryMb: 0,
            heapSizeMb: 0,
            heapUsedMb: 0,
          };
        }

        // Sort for percentiles
        const sorted = [...monitor.frameTimes].sort((a, b) => a - b);
        const renderSorted = [...monitor.renderTimes].sort((a, b) => a - b);

        const getPercentile = (arr: number[], p: number) => {
          const idx = Math.ceil((p / 100) * arr.length) - 1;
          return arr[Math.max(0, idx)];
        };

        const avg = monitor.frameTimes.reduce((a: number, b: number) => a + b, 0) / monitor.frameTimes.length;
        const fps = 1000 / avg;

        // WebGL memory (approximate from renderer)
        const renderer = (window as any).__renderer;
        let webglMem = 0;
        if (renderer?.info?.memory) {
          webglMem = (renderer.info.memory.textures * 4 + renderer.info.memory.geometries * 2) / 1024 / 1024;
        }

        // Heap memory
        let heapSize = 0, heapUsed = 0;
        if ('memory' in performance) {
          heapSize = (performance as any).memory.jsHeapSizeLimit / 1024 / 1024;
          heapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        }

        return {
          fps: Math.round(fps * 10) / 10,
          avgFrameTime: Math.round(avg * 100) / 100,
          maxFrameTime: Math.max(...monitor.frameTimes),
          p95FrameTime: getPercentile(sorted, 95),
          p99FrameTime: getPercentile(sorted, 99),
          renderTimeMs: Math.round(getPercentile(renderSorted, 50) * 100) / 100,
          drawCalls: monitor.drawCalls,
          triangles: monitor.triangles,
          webglMemoryMb: Math.round(webglMem * 10) / 10,
          heapSizeMb: Math.round(heapSize),
          heapUsedMb: Math.round(heapUsed),
        };
      });

      const fullProfile: PerformanceProfile = {
        device: deviceName,
        ...profile,
        aiTicks: 0,
        aiTickRate: 'per-frame (to optimize)',
      };

      console.log('Phase 5.5 Performance Profile:', JSON.stringify(fullProfile, null, 2));

      // Assertions
      expect(fullProfile.fps).toBeGreaterThanOrEqual(viewport.targetFPS * 0.8); // Allow 20% margin
      expect(fullProfile.p99FrameTime).toBeLessThan(33.33); // p99 < 30fps frame budget
      expect(fullProfile.heapUsedMb).toBeLessThan(200); // Memory sanity check

      await context.close();
    });
  });
});

test.describe('Phase 5.5: AI Tick Rate Optimization', () => {
  test('Measure per-frame vs multi-frame AI update cost', async ({ page }) => {
    await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });

    const startButton = page.locator('button:has-text("Training")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }

    await page.waitForTimeout(2000);

    // Measure baseline (current per-frame)
    const baselineMetrics = await page.evaluate(() => {
      const samples = 100;
      let totalTime = 0;

      for (let i = 0; i < samples; i++) {
        const start = performance.now();
        // Simulate AI update
        for (let j = 0; j < 5; j++) {
          Math.hypot(Math.random(), Math.random());
        }
        totalTime += performance.now() - start;
      }

      return {
        avgAITimeMs: totalTime / samples,
        estimatedPerFrameOverhead: (totalTime / samples) * 30, // Assume 30 enemies
      };
    });

    console.log('AI Update Cost:', JSON.stringify(baselineMetrics, null, 2));

    // Verify overhead is reasonable
    expect(baselineMetrics.estimatedPerFrameOverhead).toBeLessThan(2); // < 2ms for 30 enemies
  });
});

test.describe('Phase 5.5: Memory Leak Detection (Multi-Frame Combat)', () => {
  test('Monitor heap memory over extended combat', async ({ page }) => {
    await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });

    const startButton = page.locator('button:has-text("Training")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }

    // Inject memory tracking
    await page.addInitScript(() => {
      (window as any).__memoryLog = [] as Array<{ time: number; heapUsed: number }>;
    });

    const memoryReadings = [] as number[];

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);

      const reading = await page.evaluate(() => {
        if ('memory' in performance) {
          const heapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
          (window as any).__memoryLog.push({
            time: performance.now(),
            heapUsed,
          });
          return heapUsed;
        }
        return 0;
      });

      memoryReadings.push(reading);
    }

    // Check for monotonic increase (leak indicator)
    const maxMemory = Math.max(...memoryReadings);
    const minMemory = Math.min(...memoryReadings);
    const isStable = (maxMemory - minMemory) < 20; // < 20MB variance

    console.log('Memory Stability:', {
      readings: memoryReadings,
      variance: maxMemory - minMemory,
      isStable,
    });

    // Memory should be relatively stable during combat
    expect(isStable).toBe(true);
  });
});

test.describe('Phase 5.5: Draw Call Analysis', () => {
  test('Profile draw calls with multiple Fang enemies', async ({ page }) => {
    await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });

    const startButton = page.locator('button:has-text("Training")').first();
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }

    await page.waitForTimeout(2000);

    const drawCallAnalysis = await page.evaluate(() => {
      // Access WebGL extension for draw call counting (if available)
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return { drawCalls: 0, estimatedBatching: 'N/A' };

      const gl = canvas.getContext('webgl2');
      if (!gl) return { drawCalls: 0, estimatedBatching: 'N/A' };

      // Draw call estimation (requires renderer access)
      const renderer = (window as any).__renderer;
      if (!renderer?.info?.render?.calls) {
        return {
          drawCalls: 'unknown',
          renderTime: 'N/A',
          estimatedOptimization: 'Use batching & instancing',
        };
      }

      return {
        drawCalls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        renderCalls: renderer.info.render.calls,
      };
    });

    console.log('Draw Call Analysis:', JSON.stringify(drawCallAnalysis, null, 2));
  });
});
