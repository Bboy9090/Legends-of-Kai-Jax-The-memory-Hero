import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/** Save slots + accessibility settings, driven through the real UI at 390x844. */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
const shot = async (page: Page, name: string) => {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}${name}.png` });
};
type Win = typeof window & { runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } }; heroRosterStore: { getState: () => any } };

async function boot(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
}
const go = (page: Page, gameState: string) => page.evaluate((g) => (window as Win).runnerStore.setState({ gameState: g }), gameState);

test('accessibility settings apply to the page and survive a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  await page.evaluate(() => localStorage.removeItem('kaijax_a11y_v2'));
  await go(page, 'settings');
  const panel = page.getByTestId('a11y-settings');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toBeVisible();

  const good = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--kj-good').trim());
  expect(await good()).toBe('#22c55e');

  await page.getByTestId('a11y-colorblind').selectOption('deuteranopia');
  expect(await page.evaluate(() => document.documentElement.dataset.cb)).toBe('deuteranopia');
  expect(await good()).toBe('#38bdf8');

  await page.getByTestId('a11y-subtitles').selectOption('large');
  await page.getByTestId('a11y-reduced-motion').check();
  await page.getByTestId('a11y-haptics').uncheck();
  await page.getByTestId('a11y-hudEdgeOffset').fill('24');
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--kj-hud-edge'))).toBe('24px');
  expect(await page.evaluate(() => document.documentElement.dataset.reducedMotion)).toBe('true');
  await shot(page, '07-accessibility-settings');

  await page.reload();
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  expect(await page.evaluate(() => document.documentElement.dataset.cb)).toBe('deuteranopia');
  expect(await good()).toBe('#38bdf8');
  const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('kaijax_a11y_v2')!));
  expect(saved).toMatchObject({ colorblindMode: 'deuteranopia', subtitleScale: 'large', reducedMotion: true, hapticsEnabled: false, hudEdgeOffset: 24 });
  // legacy key stays in sync for older code paths
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem('MK_A11Y_V1')!))).toEqual({ reduceMotion: true });
  expect(errors).toEqual([]);
});

test('backup slots: save, change progress, load it back; autosave fires; export is valid JSON', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  await page.evaluate(() => {
    Object.keys(localStorage).filter((k) => k.startsWith('kaijax_slot_v2_')).forEach((k) => localStorage.removeItem(k));
    const w = window as Win;
    w.runnerStore.setState({ completedStoryMissionIds: ['story_act1_m1', 'story_act1_m2'], totalScore: 1234 });
    w.heroRosterStore.getState().restoreRoster(['kaison']);
  });

  await go(page, 'save-slots');
  await page.getByTestId('save-backup-panel').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('backup-load-slot-1')).toBeDisabled();
  await page.getByTestId('backup-save-slot-1').click();
  await expect(page.getByTestId('backup-note')).toHaveText('Saved to Slot 1.');
  await expect(page.getByTestId('backup-slot-1')).toContainText('2 missions cleared');
  await shot(page, '08-backup-slots');

  // Lose progress, then restore from the slot.
  await page.evaluate(() => {
    const w = window as Win;
    w.runnerStore.setState({ completedStoryMissionIds: [], totalScore: 0 });
    w.heroRosterStore.getState().resetRoster();
  });
  await page.getByTestId('backup-load-slot-1').click();
  await expect(page.getByTestId('backup-note')).toHaveText('Loaded Slot 1.');
  const state = await page.evaluate(() => {
    const w = window as Win;
    const r = w.runnerStore.getState();
    return { missions: r.completedStoryMissionIds, score: r.totalScore, stored: r.profiles[r.activeProfileIndex].totalScore, heroes: w.heroRosterStore.getState().unlockedHeroIds, pending: w.heroRosterStore.getState().pendingUnlocks };
  });
  expect(state).toMatchObject({ missions: ['story_act1_m1', 'story_act1_m2'], score: 1234, stored: 1234 });
  expect(state.heroes).toContain('kaison');
  expect(state.pending).toEqual([]);

  // Autosave writes after progress changes.
  await page.evaluate(() => (window as Win).runnerStore.getState().setMissionCompleted('story_act1_m3'));
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kaijax_slot_v2_autosave') ?? ''), { timeout: 8000 }).toContain('story_act1_m3');

  // Export produces a parseable, versioned save.
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Slot 1' }).click();
  const file = await (await download).path();
  const exported = JSON.parse(fs.readFileSync(file!, 'utf8'));
  expect(exported).toMatchObject({ version: 2, slotId: 'slot-1', profile: { totalScore: 1234 } });

  // Corrupt slot data is ignored, not loaded.
  await page.evaluate(() => localStorage.setItem('kaijax_slot_v2_slot-2', '{broken'));
  await page.reload();
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await go(page, 'save-slots');
  await expect(page.getByTestId('backup-slot-2')).toContainText('Empty');
  expect(errors).toEqual([]);
});
