import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/** Companion AI in the real game at 390x844: Jax fights beside Kai; hidden while fused or when playing Kai-Jax. */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
  companionStore: { getState: () => any };
  fusionStore: { getState: () => any; setState: (s: object) => void };
};

const shot = async (page: Page, name: string) => {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}${name}.png` });
};

async function boot(page: Page, hero: string) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate((hero) => {
    const w = window as Win;
    const r = w.runnerStore.getState();
    w.runnerStore.setState({ profiles: r.profiles.map((p: any, i: number) => (i === r.activeProfileIndex ? { ...p, fusionUnlocked: true } : p)), completedStoryMissionIds: [] });
    const s = w.runnerStore.getState();
    s.setCharacter(hero);
    s.setActiveStoryMission('story_act1_m1');
    s.setGameState('story-mode');
  }, hero);
  await page.getByRole('button', { name: 'Engage Mission' }).click({ timeout: 30_000 });
  const dialogue = page.getByTestId('dialogue-overlay');
  for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.length), { timeout: 30_000 }).toBeGreaterThan(0);
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, health: 99999, maxHealth: 99999 } })));
}

const comp = (page: Page) => page.evaluate(() => { const c = (window as Win).companionStore.getState(); return { hero: c.hero as string | null, x: c.state.x as number, z: c.state.z as number, mode: c.state.mode as string, strikes: c.strikes as number, damage: c.damageDealt as number }; });
const playerPos = (page: Page) => page.evaluate(() => { const p = (window as Win).adventureStore.getState().player; return { x: p.posX as number, z: p.posZ as number }; });
const isolateEnemies = (page: Page, keepId: string, at: { dx: number; dz: number }, hp: number) =>
  page.evaluate(({ keepId, at, hp }) => {
    (window as Win).adventureStore.setState((st) => ({
      enemies: st.enemies.map((e: any) =>
        e.id === keepId
          ? { ...e, posX: st.player.posX + at.dx, posZ: st.player.posZ + at.dz, health: hp, maxHealth: hp, isAggro: false, aiState: 'idle' }
          : { ...e, posX: 28, posZ: 28, isAggro: false, aiState: 'idle' },
      ),
    }));
  }, { keepId, at, hp });

test('Jax fights beside Kai: appears, follows, engages, strikes for support damage, and earns kills', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai');

  await expect.poll(async () => (await comp(page)).hero).toBe('jax');
  // The wave's grunts are already inside engage range, so the partner may be mid-fight. Park them far away
  // and confirm it comes back to the player's side.
  await isolateEnemies(page, '', { dx: 0, dz: 0 }, 1);
  let c = await comp(page);
  let p = await playerPos(page);
  await expect.poll(async () => { const k = await comp(page); return Math.hypot(k.x - p.x, k.z - p.z); }, { timeout: 8000 }).toBeLessThanOrEqual(3.5);

  // Follow: the player walks 8 units away; the partner catches up to the flank without teleporting.
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, posX: s.player.posX + 8 } })));
  p = await playerPos(page);
  // It stops within 1.4 of the flank point, which sits 2.1 from the player, so at most 3.5 away.
  await expect.poll(async () => { const k = await comp(page); return Math.hypot(k.x - p.x, k.z - p.z); }, { timeout: 8000 }).toBeLessThanOrEqual(3.5);
  expect((await comp(page)).mode).toBe('follow');
  expect((await comp(page)).strikes).toBe(0);

  // Engage: one sturdy enemy near the player, everyone else parked far away.
  const target = await page.evaluate(() => (window as Win).adventureStore.getState().enemies.find((e: any) => !e.isDead).id as string);
  // Nine units ahead keeps the fight in front of the camera, where the partner is visible.
  await isolateEnemies(page, target, { dx: 0, dz: -9 }, 500);
  await expect.poll(async () => (await comp(page)).strikes, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
  c = await comp(page);
  expect(c.mode).toBe('engage');
  const hp = await page.evaluate((id) => (window as Win).adventureStore.getState().enemies.find((e: any) => e.id === id).health as number, target);
  expect(500 - hp).toBe(c.damage); // every point came from the companion, 14 per strike
  expect(c.damage % 14).toBe(0);
  await page.waitForTimeout(600);
  await shot(page, '13-companion-engaged');

  // The companion's strikes count toward kills.
  const before = await page.evaluate(() => (window as Win).adventureStore.getState().enemiesDefeated as number);
  await page.evaluate((id) => (window as Win).adventureStore.getState().damageEnemy(id, (window as Win).adventureStore.getState().enemies.find((e: any) => e.id === id).health - 20), target);
  await isolateEnemies(page, target, { dx: 4, dz: 1 }, 20);
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemiesDefeated as number), { timeout: 10_000 }).toBe(before + 1);

  // Pausing freezes the partner.
  await page.evaluate(() => (window as Win).adventureStore.setState(() => ({ isPaused: true })));
  const frozen = await comp(page);
  await page.waitForTimeout(800);
  expect(await comp(page)).toEqual(frozen);
  await page.evaluate(() => (window as Win).adventureStore.setState(() => ({ isPaused: false })));
  expect(errors).toEqual([]);
});

test('the partner steps aside while fused and returns at the player\'s side afterwards', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'jax');
  await expect.poll(async () => (await comp(page)).hero).toBe('kai'); // Jax is joined by Kai

  await page.evaluate(() => (window as Win).fusionStore.getState().fillCharge());
  await page.keyboard.down('KeyF');
  await page.waitForTimeout(120);
  await page.keyboard.up('KeyF');
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().player.fighterId)).toBe('kai-jax');
  await expect.poll(async () => (await comp(page)).hero).toBeNull();

  // Fusion ends; the partner returns next to the player even if the player moved meanwhile.
  await page.evaluate(() => { (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, posX: s.player.posX - 10 } })); (window as Win).fusionStore.setState({ timeLeft: 0.2 }); });
  await expect.poll(async () => (await comp(page)).hero, { timeout: 5000 }).toBe('kai');
  await page.waitForTimeout(400);
  const c = await comp(page);
  const p = await playerPos(page);
  expect(Math.hypot(c.x - p.x, c.z - p.z)).toBeLessThan(3.5);
  expect(errors).toEqual([]);
});

test('Kai-Jax fights alone', async ({ page }) => {
  await boot(page, 'kai-jax');
  await page.waitForTimeout(1000);
  expect((await comp(page)).hero).toBeNull();
});
