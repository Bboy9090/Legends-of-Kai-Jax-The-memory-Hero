import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/** The Game Codex must be reachable from the main menu through the Legends Archive, and lead back out. */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & { runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } } };
const state = (page: Page) => page.evaluate(() => (window as Win).runnerStore.getState().gameState as string);

async function toMenu(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'menu' }));
  await page.getByRole('button', { name: /LEGENDS ARCHIVE/i }).click({ timeout: 15_000 });
  await expect.poll(() => state(page)).toBe('lore-hub');
}

test('phone: menu -> Legends Archive -> Game Codex (tabs, portraits) -> back', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await toMenu(page);

  // On a phone the archive's actions live behind its menu button.
  await page.locator('button.md\\:hidden').first().click();
  await page.getByTestId('lore-open-codex-mobile').click();
  await expect.poll(() => state(page)).toBe('codex');
  await expect(page.getByTestId('codex-title')).toHaveText('Game Codex');

  for (const tab of ['Characters', 'Abilities', 'Locations', 'Bosses', 'Mechanics']) await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
  // Character portraits in the roster list really load (not broken images).
  await expect.poll(() => page.evaluate(() => Array.from(document.querySelectorAll('button img')).filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0).length), { timeout: 15_000 }).toBeGreaterThanOrEqual(3);
  await page.getByRole('button', { name: 'Abilities', exact: true }).click();
  await page.getByRole('button', { name: 'Bosses', exact: true }).click();
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}22-game-codex.png` });

  await page.getByTestId('codex-back').click();
  await expect.poll(() => state(page)).toBe('lore-hub');
  expect(errors).toEqual([]);
});

test('Escape leaves the codex too', async ({ page }) => {
  await toMenu(page);
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'codex' }));
  await expect(page.getByTestId('codex-title')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect.poll(() => state(page)).toBe('lore-hub');
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  test('Legends Archive shows a Game Codex button', async ({ page }) => {
    await toMenu(page);
    await page.getByTestId('lore-open-codex').click();
    await expect.poll(() => state(page)).toBe('codex');
  });
});
