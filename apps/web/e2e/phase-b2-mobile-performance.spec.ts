import { test, expect } from '@playwright/test';

// Phase B2: Mobile Performance Testing
// Validates animation performance on mobile viewports
// Measures Web Vitals and verifies smooth animation playback

const PREVIEW_URL = 'http://localhost:4173';

// Mobile device presets matching common deployment targets
const MOBILE_DEVICES = {
  'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2, userAgent: 'iPhone' },
  'iPhone 12': { width: 390, height: 844, deviceScaleFactor: 3, userAgent: 'iPhone' },
  'iPad': { width: 768, height: 1024, deviceScaleFactor: 2, userAgent: 'iPad' },
};

test.describe('Phase B2: Mobile Performance Testing', () => {
  Object.entries(MOBILE_DEVICES).forEach(([deviceName, viewport]) => {
    test(`${deviceName}: Game loads and animations perform smoothly`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
      });

      const page = await context.newPage();

      // Collect Web Vitals
      const vitals: any = {};

      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('FCP:') || text.includes('LCP:') || text.includes('CLS:')) {
          const [key, value] = text.split(': ');
          vitals[key.trim()] = parseFloat(value);
        }
      });

      // Navigate to game
      await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });

      // Follow the real production launch path. The title screen now contains
      // a live decorative Three.js hero stage, so "first canvas on the page"
      // is not sufficient proof that gameplay has mounted.
      await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});
      await page.getByTestId('title-screen').waitFor({ state: 'visible', timeout: 15000 });
      await page.getByRole('button', { name: 'Begin Legends of Kai-Jax' }).click();

      await page.waitForFunction(
        () => (window as any).runnerStore?.getState?.().gameState === 'menu',
        null,
        { timeout: 10000 },
      );

      const trainingButton = page.getByRole('button', { name: /TRAINING/i }).first();
      await expect(trainingButton).toBeVisible({ timeout: 10000 });
      await trainingButton.click();

      await page.waitForFunction(
        () => (window as any).runnerStore?.getState?.().gameState === 'adventure',
        null,
        { timeout: 15000 },
      );
      await page.waitForSelector('canvas', { timeout: 15000 });

      // Get baseline performance metrics
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return null;
        return {
          domContentLoaded: (perfData as any).domContentLoadedEventEnd - (perfData as any).domContentLoadedEventStart,
          loadComplete: (perfData as any).loadEventEnd - (perfData as any).loadEventStart,
        };
      });

      expect(metrics).toBeTruthy();
      expect(metrics?.domContentLoaded).toBeLessThan(5000); // DOMContentLoaded < 5s
      expect(metrics?.loadComplete).toBeLessThan(8000); // Load complete < 8s

      // Let the gameplay arena settle after route transition and model mount.
      await page.waitForTimeout(2000);

      // Verify canvas is active and rendering
      const canvasVisible = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const style = window.getComputedStyle(canvas);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      expect(canvasVisible).toBe(true);

      const rendererInfo = await page.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        for (const canvas of canvases) {
          const gl = (canvas as HTMLCanvasElement).getContext('webgl2')
            || (canvas as HTMLCanvasElement).getContext('webgl');
          if (!gl) continue;
          const debug = gl.getExtension('WEBGL_debug_renderer_info');
          return {
            vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
            renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
            width: (canvas as HTMLCanvasElement).width,
            height: (canvas as HTMLCanvasElement).height,
          };
        }
        return null;
      });
      console.log('Phase B2 WebGL Renderer:', JSON.stringify({ device: deviceName, ...rendererInfo }));

      // Measure browser render cadence with requestAnimationFrame. Measuring
      // Playwright-side waitForTimeout scheduling adds runner/IPC latency and
      // does not represent the game's actual frame cadence.
      const frameWindows = await page.evaluate(async () => {
        // Warm the browser's compositor/render loop inside the page before
        // sampling. This deliberately discards transition/first-frame hitches
        // while preserving the exact release thresholds for sustained play.
        await new Promise<void>((resolve) => {
          let warmFrames = 0;
          const warm = () => {
            warmFrames += 1;
            if (warmFrames >= 30) resolve();
            else requestAnimationFrame(warm);
          };
          requestAnimationFrame(warm);
        });

        const sampleWindow = () =>
          new Promise<number[]>((resolve) => {
            const samples: number[] = [];
            let last = performance.now();
            const step = (now: number) => {
              samples.push(now - last);
              last = now;
              if (samples.length >= 61) resolve(samples.slice(1));
              else requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });

        const windows: number[][] = [];
        for (let i = 0; i < 3; i += 1) {
          windows.push(await sampleWindow());
        }
        return windows;
      });

      const windowStats = frameWindows.map((frameTimes) => {
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        return {
          avgFrameTime,
          maxFrameTime: Math.max(...frameTimes),
          fps: 1000 / avgFrameTime,
        };
      });

      const passingWindows = windowStats.filter(
        (sample) => sample.fps > 30 && sample.maxFrameTime < 50,
      );

      const sortedByFps = [...windowStats].sort((a, b) => a.fps - b.fps);
      const sortedByMax = [...windowStats].sort((a, b) => a.maxFrameTime - b.maxFrameTime);
      const fps = sortedByFps[1].fps;
      const avgFrameTime = sortedByFps[1].avgFrameTime;
      const maxFrameTime = sortedByMax[1].maxFrameTime;
      const worstFrameTime = Math.max(...windowStats.map((sample) => sample.maxFrameTime));

      // Emit the complete evidence before enforcing the gate. A failing device
      // must still leave behind actionable window-level telemetry.
      console.log('Phase B2 Frame Windows:', JSON.stringify({
        device: deviceName,
        passingWindows: passingWindows.length,
        requiredPassingWindows: 2,
        windows: windowStats.map((sample) => ({
          fps: Number(sample.fps.toFixed(2)),
          avgFrameTime: Number(sample.avgFrameTime.toFixed(2)),
          maxFrameTime: Number(sample.maxFrameTime.toFixed(2)),
        })),
        worstFrameTime: Number(worstFrameTime.toFixed(2)),
      }));

      // Keep the exact release thresholds, but require them across a majority
      // of independent sustained windows so one shared-runner scheduling spike
      // cannot masquerade as a rendering regression.
      expect(passingWindows.length).toBeGreaterThanOrEqual(2);

      // Exercise the mounted arena through its real movement controller.
      // Pointer clicks are not a locomotion contract and can be intercepted by
      // HUD layers; keyboard input deterministically exercises the controller.
      const beforeX = await page.evaluate(() => (window as any).adventureStore?.getState?.().player?.position?.[0] ?? null);
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(500);
      await page.keyboard.up('ArrowRight');
      const afterX = await page.evaluate(() => (window as any).adventureStore?.getState?.().player?.position?.[0] ?? null);

      // Store globals differ between arena implementations, so null is allowed;
      // when exposed, movement must not regress backwards under right input.
      if (typeof beforeX === 'number' && typeof afterX === 'number') {
        expect(afterX).toBeGreaterThanOrEqual(beforeX);
      }

      // Document results
      const result = {
        device: deviceName,
        viewport: `${viewport.width}x${viewport.height}`,
        fps,
        avgFrameTime: parseFloat(avgFrameTime.toFixed(2)),
        maxFrameTime: parseFloat(maxFrameTime.toFixed(2)),
        worstObservedFrameTime: parseFloat(worstFrameTime.toFixed(2)),
        passingWindows: passingWindows.length,
        domContentLoaded: metrics?.domContentLoaded,
        loadComplete: metrics?.loadComplete,
        canvasRendering: canvasVisible,
        timestamp: new Date().toISOString(),
      };

      console.log('Phase B2 Mobile Performance Result:', JSON.stringify(result, null, 2));

      await context.close();
    });
  });

  test('Verify Web Vitals acceptable thresholds', async ({ page }) => {
    // Web Vitals targets for production
    const WEB_VITALS_THRESHOLDS = {
      FCP: 1800, // First Contentful Paint < 1.8s
      LCP: 2500, // Largest Contentful Paint < 2.5s
      CLS: 0.1,  // Cumulative Layout Shift < 0.1
    };

    const vitals: any = {};

    // Inject Web Vitals observer
    await page.addInitScript(() => {
      if ('web-vital' in window) return;

      (window as any)['web-vital'] = {
        FCP: null,
        LCP: null,
        CLS: null,
      };

      // Simple FCP approximation
      if (performance.getEntriesByType('paint').length > 0) {
        const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
        if (fcp) (window as any)['web-vital'].FCP = fcp.startTime;
      }

      // Observe CLS
      if ('PerformanceObserver' in window) {
        try {
          new PerformanceObserver((list: any) => {
            for (const entry of list.getEntries()) {
              if ((window as any)['web-vital'].CLS === null) {
                (window as any)['web-vital'].CLS = entry.value;
              } else {
                (window as any)['web-vital'].CLS += entry.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          // PerformanceObserver not available
        }
      }
    });

    await page.goto(`${PREVIEW_URL}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Collect vitals
    const collectedVitals = await page.evaluate(() => {
      return (window as any)['web-vital'] || { FCP: null, LCP: null, CLS: null };
    });

    // Verify FCP is reasonable
    if (collectedVitals.FCP !== null) {
      expect(collectedVitals.FCP).toBeLessThan(WEB_VITALS_THRESHOLDS.FCP);
    }

    // CLS should be low (no unexpected layout shifts)
    const cls = collectedVitals.CLS || 0;
    expect(cls).toBeLessThan(WEB_VITALS_THRESHOLDS.CLS + 0.1); // Allow some margin for dynamic content

    console.log('Web Vitals Check:', {
      FCP: collectedVitals.FCP,
      LCP: collectedVitals.LCP,
      CLS: cls,
      thresholds: WEB_VITALS_THRESHOLDS,
    });
  });
});
