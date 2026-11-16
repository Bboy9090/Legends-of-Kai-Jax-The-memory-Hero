import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/** The rigged character masters in the real game: authored clips per action, fusion swap, and the select screen. */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
  fusionStore: { getState: () => any; setState: (s: object) => void };
  heroRosterStore: { getState: () => any };
};
const shot = async (page: Page, name: string) => { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: `${OUT}${name}.png` }); };

async function toBattle(page: Page, hero: string) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate((hero) => {
    const w = window as Win;
    const r = w.runnerStore.getState();
    w.runnerStore.setState({ profiles: r.profiles.map((p: any, i: number) => (i === r.activeProfileIndex ? { ...p, fusionUnlocked: true } : p)), completedStoryMissionIds: [] });
    const s = w.runnerStore.getState();
    s.setCharacter(hero); s.setActiveStoryMission('story_act1_m1'); s.setGameState('story-mode');
  }, hero);
  await page.getByRole('button', { name: 'Engage Mission' }).click({ timeout: 30_000 });
  const dialogue = page.getByTestId('dialogue-overlay');
  for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.length), { timeout: 30_000 }).toBeGreaterThan(0);
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, health: 99999, maxHealth: 99999, stamina: 100 }, enemies: s.enemies.map((e: any) => ({ ...e, posX: 28, posZ: 28, isAggro: false, aiState: 'idle' })) })));
}

const clip = (page: Page, id: string) => page.evaluate((id) => ((window as any).__KAI_JAX_ANIMATION_PROBE__?.[id]?.selectedClip ?? null) as string | null, id);
const hold = async (page: Page, key: string, ms: number) => { await page.keyboard.down(key); await page.waitForTimeout(ms); };

test('Kai plays real authored clips for idle, walk, run, strike, heavy and dodge', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await toBattle(page, 'kai');

  await expect.poll(() => clip(page, 'kai'), { timeout: 15_000 }).toBe('idle'); // the stance, not "breathing"
  await hold(page, 'KeyD', 1200);
  await expect.poll(() => clip(page, 'kai')).toBe('walk');
  await hold(page, 'ShiftLeft', 1200);
  await expect.poll(() => clip(page, 'kai')).toBe('run');
  await shot(page, '23-rigged-kai-run');
  await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyD');

  await hold(page, 'KeyJ', 160);
  await expect.poll(() => clip(page, 'kai'), { timeout: 4000 }).toMatch(/^attack_[123]$/);
  await page.keyboard.up('KeyJ');
  await page.waitForTimeout(900);
  await hold(page, 'KeyK', 160);
  await expect.poll(() => clip(page, 'kai'), { timeout: 4000 }).toBe('heavy_strike');
  await page.keyboard.up('KeyK');
  await page.waitForTimeout(1200);

  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, stamina: 100 } })));
  await hold(page, 'Space', 140);
  await expect.poll(() => clip(page, 'kai'), { timeout: 4000 }).toBe('dodge');
  await page.keyboard.up('Space');
  expect(errors).toEqual([]);
});

test('the partner has its own rig and clips, and fusion swaps to the three-tail Kai-Jax', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await toBattle(page, 'kai');
  await expect.poll(() => clip(page, 'jax'), { timeout: 15_000 }).toBe('idle'); // Jax fights beside Kai with real clips

  await page.evaluate(() => (window as Win).fusionStore.getState().fillCharge());
  await hold(page, 'KeyF', 140); await page.keyboard.up('KeyF');
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().player.fighterId)).toBe('kai-jax');
  await expect.poll(() => clip(page, 'kai-jax'), { timeout: 15_000 }).toBe('idle');
  await page.waitForTimeout(1200);
  await shot(page, '24-rigged-kaijax-fused');
  expect(errors).toEqual([]);
});

test('all five characters render on the select screen without load errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`http ${r.status()} ${r.url()}`); });
  page.on('console', (m) => { if (/No canonical model registered|emergency fallback/i.test(m.text())) problems.push(m.text()); });
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => { (window as Win).heroRosterStore.getState().restoreRoster(['boryn', 'borax']); (window as Win).runnerStore.setState({ gameState: 'character-select' }); });
  for (const id of ['kai', 'jax', 'kai-jax', 'boryn', 'borax']) {
    await page.getByTestId(`legend-card-${id}`).click();
    await expect(page.getByTestId('hero-turntable')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('hero-turntable').locator('canvas')).toBeVisible();
    await page.waitForTimeout(3500);
    if (id === 'kai-jax' || id === 'boryn') await shot(page, `25-select-${id}`);
  }
  expect(problems).toEqual([]);
});
