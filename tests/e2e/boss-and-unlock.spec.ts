import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * Phase 4 verification in the real game at 390x844:
 *  - a two-phase boss fight (50% HP roar, 1.2s telegraphed heavy attack, counter window)
 *  - completing a mission unlocks a hero and shows the "NEW HERO UNLOCKED" modal with a 3D turntable
 */

const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));

type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
  heroRosterStore: { getState: () => any };
};

async function shot(page: Page, name: string) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}${name}.png` });
}

async function bootToBattle(page: Page, missionId: string) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.evaluate((id) => {
    const w = window as Win;
    w.heroRosterStore.getState().resetRoster();
    w.runnerStore.setState({ completedStoryMissionIds: [] });
    const s = w.runnerStore.getState();
    s.setCharacter('kai-jax');
    s.setActiveStoryMission(id);
    s.setGameState('story-mode');
  }, missionId);
  await page.getByRole('button', { name: 'Engage Mission' }).click({ timeout: 30_000 });
  const dialogue = page.getByTestId('dialogue-overlay');
  for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.length), { timeout: 30_000 }).toBeGreaterThan(0);
  // Keep the hero alive so combat outcomes come from the systems under test, not from dying.
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, health: 99999, maxHealth: 99999 } })));
}

const killAll = (page: Page) =>
  page.evaluate(() => {
    const s = (window as Win).adventureStore.getState();
    s.enemies.filter((e: any) => !e.isDead).forEach((e: any) => s.damageEnemy(e.id, 999999));
  });

const findBoss = (page: Page) =>
  page.evaluate(() => {
    const b = (window as Win).adventureStore.getState().enemies.find((e: any) => e.bossKey && !e.isDead);
    return b ? { id: b.id, hp: b.health, maxHp: b.maxHealth, phase: b.bossPhase, stage: b.bossStage, visual: b.visual, tier: b.tier } : null;
  });

test('two-phase boss: roar at 50% HP, 1.2s telegraphed heavy attack, then a counter window', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));

  await bootToBattle(page, 'story_act4_m20'); // Rift Warden, 2,900 HP

  // Wave 1 is escorts; the boss arrives with the final wave.
  await killAll(page);
  await expect.poll(() => findBoss(page), { timeout: 45_000, message: 'boss should spawn with the final wave' }).not.toBeNull();
  const boss = (await findBoss(page))!;
  expect(boss.maxHp).toBe(2900);
  expect(boss.hp).toBe(2900);
  expect(boss.phase).toBe(1);
  expect(boss.tier).toBe('boss2'); // 2,900 HP is in the heavyweight tier
  expect(boss.visual).toMatchObject({ scale: 1.25, tint: '#38bdf8', weapon: { kind: 'mace' } });

  const hud = page.getByTestId('boss-hud');
  await expect(hud).toBeVisible();
  await expect(page.getByTestId('boss-name')).toHaveText('Rift Warden');
  await expect(page.getByTestId('boss-hp-text')).toContainText('2900 / 2900');
  await expect(hud).toHaveAttribute('data-phase', '1');
  await expect(page.getByTestId('boss-heavy-warning')).toHaveCount(0); // heavy attack is locked in phase 1

  // Record every heavy-attack stage change with a timestamp from inside the page.
  await page.evaluate(() => {
    const log: Array<{ heavy: string; t: number }> = [];
    (window as any).__bossLog = log;
    const el = document.querySelector('[data-testid="boss-hud"]')!;
    new MutationObserver(() => log.push({ heavy: el.getAttribute('data-heavy')!, t: performance.now() })).observe(el, { attributes: true, attributeFilter: ['data-heavy'] });
  });

  // Take the boss to 49% HP (phase threshold is 50%).
  await page.evaluate(({ id, maxHp }) => {
    const s = (window as Win).adventureStore.getState();
    const e = s.enemies.find((x: any) => x.id === id);
    s.damageEnemy(id, e.health - Math.floor(maxHp * 0.49));
  }, boss);

  await expect(page.getByTestId('boss-roar')).toBeVisible({ timeout: 3_000 });
  await expect(hud).toHaveAttribute('data-phase', '2');
  expect((await findBoss(page))!.phase).toBe(2);

  // Phase 2: a 1.2s warning, shown before the heavy attack lands.
  await expect(page.getByTestId('boss-heavy-warning')).toBeVisible({ timeout: 12_000 });
  await shot(page, '05-boss-heavy-telegraph');
  await expect(page.getByTestId('boss-counter-window')).toBeVisible({ timeout: 4_000 });

  const log = await page.evaluate(() => (window as any).__bossLog as Array<{ heavy: string; t: number }>);
  const start = log.find((l) => l.heavy === 'telegraph')!;
  const end = log.find((l) => l.heavy === 'counter')!;
  expect(start && end, JSON.stringify(log)).toBeTruthy();
  const warningSeconds = (end.t - start.t) / 1000;
  expect(warningSeconds).toBeGreaterThanOrEqual(1.0);
  expect(warningSeconds).toBeLessThanOrEqual(1.5);

  // Counter window: the boss is held still and takes +50% damage.
  expect((await findBoss(page))!.stage).toBe('counter');
  const before = (await findBoss(page))!.hp;
  await page.evaluate((id) => (window as Win).adventureStore.getState().damageEnemy(id, 100), boss.id);
  await page.waitForTimeout(250);
  const dropped = before - (await findBoss(page))!.hp;
  expect(dropped, 'counter window should add 50% damage on top of the 100 dealt').toBeGreaterThanOrEqual(145);

  // The window closes and the cycle returns to a cooldown.
  await expect(page.getByTestId('boss-counter-window')).toBeHidden({ timeout: 5_000 });
  await expect(hud).toHaveAttribute('data-heavy', 'cooldown');

  fs.writeFileSync(`${OUT}boss-summary.json`, JSON.stringify({ boss: 'Rift Warden', maxHp: 2900, warningSeconds: Number(warningSeconds.toFixed(2)), counterDamageDealt100Got: dropped, phaseAfterRoar: 2 }, null, 2));
  expect(problems, problems.join('\n')).toEqual([]);
});

test('completing a mission unlocks a hero: "NEW HERO UNLOCKED" modal with a 3D turntable', async ({ page }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));

  await bootToBattle(page, 'story_act1_m1'); // unlocks Kaison

  // Clear both waves.
  await killAll(page);
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().waveCount), { timeout: 30_000 }).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.some((e: any) => !e.isDead)), { timeout: 15_000 }).toBe(true);

  // Mission 1's final wave opens with the fusion awakening scene; watch it before finishing the fight.
  const dialogue = page.getByTestId('dialogue-overlay');
  await expect(dialogue).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 40 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect(dialogue).toBeHidden();
  await killAll(page);

  // Victory outro, then the results screen.
  await expect(dialogue).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < 40 && (await dialogue.isVisible().catch(() => false)); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  await expect(page.getByText('Mission Complete')).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(() => (window as Win).heroRosterStore.getState().unlockedHeroIds)).not.toContain('kaison');
  await page.getByRole('button', { name: 'Continue' }).click();

  // The reward fires: modal, turntable, then the roster is updated.
  const modal = page.getByTestId('hero-unlock-modal');
  await expect(modal).toBeVisible({ timeout: 10_000 });
  await expect(modal).toHaveAttribute('data-hero', 'kaison');
  await expect(modal).toContainText('NEW HERO UNLOCKED');
  await expect(modal).toContainText('KAISON');
  await expect(page.getByTestId('hero-turntable')).toHaveAttribute('data-source', 'model');
  await expect(page.getByTestId('hero-turntable').locator('canvas')).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(2500);
  await shot(page, '06-hero-unlocked');

  await page.getByTestId('hero-unlock-continue').click();
  await expect(modal).toBeHidden();
  expect(await page.evaluate(() => (window as Win).heroRosterStore.getState().unlockedHeroIds)).toContain('kaison');

  // Kaison is now selectable on the Character Select screen.
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'character-select' }));
  await expect(page.getByTestId('legend-card-kaison')).toHaveAttribute('data-locked', 'false');
  await expect(page.getByTestId('legend-card-silver')).toHaveAttribute('data-locked', 'true');
  expect(problems, problems.join('\n')).toEqual([]);
});
