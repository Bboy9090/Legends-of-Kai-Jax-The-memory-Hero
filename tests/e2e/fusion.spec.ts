import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * Canon-gated Kai-Jax fusion in the real game at 390x844:
 * locked -> Mission 1 final wave awakening -> unlocked + charged -> fuse (burst, form swap) -> expiry -> cooldown.
 */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
  fusionStore: { getState: () => any; setState: (s: object) => void };
};

const shot = async (page: Page, name: string) => {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}${name}.png` });
};

async function boot(page: Page, hero: string, fusionUnlocked: boolean) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate(({ hero, fusionUnlocked }) => {
    const w = window as Win;
    const r = w.runnerStore.getState();
    const profiles = r.profiles.map((p: any, i: number) => (i === r.activeProfileIndex ? { ...p, fusionUnlocked } : p));
    w.runnerStore.setState({ profiles, completedStoryMissionIds: [] });
    const s = w.runnerStore.getState();
    s.setCharacter(hero);
    s.setActiveStoryMission('story_act1_m1');
    s.setGameState('story-mode');
  }, { hero, fusionUnlocked });
  await page.getByRole('button', { name: 'Engage Mission' }).click({ timeout: 30_000 });
  const dialogue = page.getByTestId('dialogue-overlay');
  for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.length), { timeout: 30_000 }).toBeGreaterThan(0);
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, health: 99999, maxHealth: 99999 } })));
}

const hudName = (page: Page) =>
  page.evaluate(() => {
    const names = ['KAI', 'JAX', 'KAI-JAX'];
    const hit = Array.from(document.querySelectorAll('div,span,h1,h2,h3,p')).find((el) => el.children.length === 0 && names.includes((el.textContent ?? '').trim().toUpperCase()));
    return (hit?.textContent ?? '').trim().toUpperCase();
  });
const fighter = (page: Page) => page.evaluate(() => (window as Win).adventureStore.getState().player.fighterId as string);
const unlocked = (page: Page) => page.evaluate(() => { const r = (window as Win).runnerStore.getState(); return Boolean(r.profiles[r.activeProfileIndex].fusionUnlocked); });
const killAll = (page: Page) =>
  page.evaluate(() => {
    const s = (window as Win).adventureStore.getState();
    s.enemies.filter((e: any) => !e.isDead).forEach((e: any) => s.damageEnemy(e.id, 999999));
  });
const press = async (page: Page, key: string) => { await page.keyboard.down(key); await page.waitForTimeout(120); await page.keyboard.up(key); };

test('fusion is locked, awakens in Mission 1, then fuses, bursts, expires and cools down', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai', false);

  // ---- Locked ----
  const control = page.getByTestId('fusion-control');
  await expect(control).toHaveAttribute('data-status', 'locked');
  await expect(page.getByTestId('touch-fusion')).toHaveText('LOCKED');
  await shot(page, '10-fusion-locked');
  await press(page, 'KeyF');
  await expect.poll(() => page.evaluate(() => (window as Win).fusionStore.getState().notice?.text)).toBe('FUSION LOCKED (STORY)');
  expect(await fighter(page)).toBe('kai');
  // The gauge stays empty while locked, even if the player lands hits.
  await page.evaluate(() => (window as Win).fusionStore.getState().addCharge(50));
  expect(await page.evaluate(() => (window as Win).fusionStore.getState().charge)).toBe(0);

  // ---- Awakening at the final wave of Mission 1 ----
  await killAll(page); // wave 1 cleared -> wave transition -> final wave spawns
  const dialogue = page.getByTestId('dialogue-overlay');
  await expect(dialogue).toBeVisible({ timeout: 30_000 });
  expect(await page.evaluate(() => (window as Win).adventureStore.getState().isPaused)).toBe(true);
  expect(await unlocked(page)).toBe(false); // still locked until the scene is watched
  await shot(page, '11-fusion-awakening');
  for (let i = 0; i < 40 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect(dialogue).toBeHidden();
  expect(await unlocked(page)).toBe(true);
  expect(await page.evaluate(() => (window as Win).adventureStore.getState().isPaused)).toBe(false);
  await expect(control).toHaveAttribute('data-status', 'ready');
  await expect(page.getByTestId('touch-fusion')).toHaveText('FUSE');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kai-jax-save')!).state.profiles.some((p: any) => p.fusionUnlocked))).toBe(true);

  // ---- Fuse: burst hits a nearby enemy, the form swaps ----
  const nearId = await page.evaluate(() => {
    const s = (window as Win).adventureStore.getState();
    const e = s.enemies.find((x: any) => !x.isDead);
    (window as Win).adventureStore.setState((st) => ({ enemies: st.enemies.map((x: any) => (x.id === e.id ? { ...x, posX: st.player.posX + 2, posZ: st.player.posZ, health: 500, maxHealth: 500 } : x)) }));
    return e.id as string;
  });
  await press(page, 'KeyF');
  await expect(control).toHaveAttribute('data-status', 'active');
  expect(await fighter(page)).toBe('kai-jax');
  const after = await page.evaluate((id) => { const e = (window as Win).adventureStore.getState().enemies.find((x: any) => x.id === id); return { hp: e.health, stun: e.stunTimer }; }, nearId);
  await expect.poll(() => hudName(page)).toBe('KAI-JAX'); // HUD follows the fused form
  expect(after.hp).toBe(500 - 65);
  expect(after.stun).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as Win).fusionStore.getState().charge)).toBe(0);
  const remaining = await page.evaluate(() => (window as Win).fusionStore.getState().timeLeft as number);
  expect(remaining).toBeGreaterThan(20);
  expect(remaining).toBeLessThanOrEqual(22);
  await page.waitForTimeout(600);
  await shot(page, '12-fusion-active');

  // ---- Expiry returns to Kai and starts the cooldown ----
  await page.evaluate(() => (window as Win).fusionStore.setState({ timeLeft: 0.3 }));
  await expect.poll(() => fighter(page), { timeout: 5000 }).toBe('kai');
  await expect(control).toHaveAttribute('data-status', 'cooldown');
  await expect.poll(() => hudName(page)).toBe('KAI');
  const cd = await page.evaluate(() => (window as Win).fusionStore.getState().cooldown as number);
  expect(cd).toBeGreaterThan(12);
  expect(cd).toBeLessThanOrEqual(14);

  // A full gauge cannot skip the cooldown.
  await page.evaluate(() => (window as Win).fusionStore.getState().fillCharge());
  await press(page, 'KeyF');
  await expect.poll(() => page.evaluate(() => (window as Win).fusionStore.getState().notice?.text)).toBe('FUSION RECHARGING');
  expect(await fighter(page)).toBe('kai');
  expect(errors).toEqual([]);
});

test('Kai-Jax is already fused: no fusion control; a persisted unlock survives reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai-jax', true);
  await expect(page.getByTestId('fusion-control')).toHaveCount(0);
  expect(await fighter(page)).toBe('kai-jax');
  await press(page, 'KeyF'); // F does nothing for the fused hero
  expect(await fighter(page)).toBe('kai-jax');
  await page.reload();
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  expect(await unlocked(page)).toBe(true);
  expect(errors).toEqual([]);
});
