import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * PWA + adaptive audio against the production build.
 *   cd apps/web && npx playwright test -c playwright.pwa.config.ts
 */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & { runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } } };

async function boot(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
}

test('manifest is installable: PNG icons resolve, maskable present, id/scope set', async ({ page, request }) => {
  await boot(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ id: '/', start_url: '/', scope: '/', display: 'standalone' });
  const purposes = manifest.icons.map((i: any) => `${i.sizes}:${i.purpose}`);
  expect(purposes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']));
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src);
    expect(res.status(), icon.src).toBe(200);
    expect(res.headers()['content-type'], icon.src).toContain(icon.type);
  }
  expect(await page.locator('link[rel="apple-touch-icon"]').count()).toBe(1);
});

test('service worker precaches the shell and the game reloads offline', async ({ page, context }) => {
  await boot(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  // Controlled page + shell cache filled.
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 20_000 });
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys.find((k) => k.startsWith('kai-jax-shell'))!);
    return { keys, urls: (await cache.keys()).map((r) => new URL(r.url).pathname) };
  });
  expect(cached.keys).toEqual(['kai-jax-shell-v4']);
  expect(cached.urls).toEqual(expect.arrayContaining(['/', '/index.html', '/manifest.json', '/pwa-192x192.png']));
  expect(cached.urls.some((u) => u.startsWith('/assets/') && u.endsWith('.js'))).toBe(true);
  expect(cached.urls.some((u) => u.endsWith('.glb'))).toBe(false); // models are never duplicated into Cache Storage

  await context.setOffline(true);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.reload();
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'story-hub' }));
  await expect(page.locator('#root')).not.toBeEmpty();
  await page.screenshot({ path: `${OUT}09-offline-reload.png` });
  expect(errors).toEqual([]);
  await context.setOffline(false);
});

test('install button appears on beforeinstallprompt and calls the browser prompt', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'settings' }));
  await expect(page.getByTestId('install-app')).toHaveCount(0);
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true }) as any;
    (window as any).__prompted = 0;
    e.prompt = async () => { (window as any).__prompted++; };
    e.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    window.dispatchEvent(e);
  });
  const btn = page.getByTestId('install-app-button');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect.poll(() => page.evaluate(() => (window as any).__prompted)).toBe(1);
  await expect(page.getByTestId('install-app')).toHaveCount(0);
});

test('adaptive music: unlocks on gesture, combat is busier than the title, and the toggle silences it', async ({ page }) => {
  // Count oscillators the engine starts; every note/kick/hat is one.
  await page.addInitScript(() => {
    (window as any).__osc = 0;
    const Orig = window.AudioContext;
    (window as any).AudioContext = class extends Orig {
      createOscillator() { (window as any).__osc++; return super.createOscillator(); }
    };
  });
  await boot(page);
  const oscs = () => page.evaluate(() => (window as any).__osc as number);
  const rate = async (ms: number) => { const a = await oscs(); await page.waitForTimeout(ms); return (await oscs()) - a; };
  expect(await oscs()).toBe(0); // nothing plays before a user gesture

  await page.mouse.click(200, 400);
  await expect.poll(oscs, { timeout: 8000 }).toBeGreaterThan(3);

  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'title' }));
  await page.waitForTimeout(500);
  const calm = await rate(3000);
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'adventure' }));
  await page.waitForTimeout(500);
  const combat = await rate(3000);
  expect(calm).toBeGreaterThan(0);
  expect(combat).toBeGreaterThan(calm * 1.5);

  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'settings' }));
  await page.getByTestId('music-adaptive').uncheck();
  await page.waitForTimeout(400);
  expect(await rate(2000)).toBe(0);
  await page.getByTestId('music-adaptive').check();
  await expect.poll(() => rate(1500), { timeout: 6000 }).toBeGreaterThan(0);
});
