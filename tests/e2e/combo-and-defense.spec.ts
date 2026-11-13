import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * Combo counter (spring pop, 3.5s decay, instant reset on damage), dodge/parry resolution and the
 * adventure camera's framing, driven through the real game.
 */
const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));
type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any; setState: (fn: (s: any) => object) => void };
  comboStore: { getState: () => any };
  fusionStore: { getState: () => any };
  companionStore: { getState: () => any };
  companionObject?: any;
  adventureCamera?: any;
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

const parkExcept = (page: Page, keepId: string | null, at = { dx: 2, dz: 0 }, hp = 5000) =>
  page.evaluate(({ keepId, at, hp }) => {
    (window as Win).adventureStore.setState((st) => ({
      enemies: st.enemies.map((e: any) =>
        e.id === keepId ? { ...e, posX: st.player.posX + at.dx, posZ: st.player.posZ + at.dz, health: hp, maxHealth: hp, isAggro: false, aiState: 'idle' } : { ...e, posX: 28, posZ: 28, isAggro: false, aiState: 'idle' },
      ),
    }));
  }, { keepId, at, hp });
const firstEnemy = (page: Page) => page.evaluate(() => (window as Win).adventureStore.getState().enemies.find((e: any) => !e.isDead).id as string);
const combo = (page: Page) => page.evaluate(() => { const c = (window as Win).comboStore.getState().state; return { count: c.count as number, timeLeft: c.timeLeft as number, broken: c.broken as number, brokenFrom: c.brokenFrom as number }; });
const playerFlags = (page: Page) => page.evaluate(() => { const p = (window as Win).adventureStore.getState().player; return { health: p.health as number, comboStep: p.comboStep as number, comboTimer: p.comboTimer as number, parry: p.parryTimer as number, dodge: p.dodgeTimer as number, invuln: p.invulnTimer as number }; });
const tap = async (page: Page, key: string) => { await page.keyboard.down(key); await page.waitForTimeout(70); await page.keyboard.up(key); };

/** Keep the hero invulnerable (so only the systems under test move the combo), then land real strikes. */
async function landHits(page: Page, wanted: number) {
  await page.evaluate(() => { (window as any).__guard = setInterval(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, invulnTimer: 5, stamina: 100 } })), 40); });
  for (let i = 0; i < 40 && (await combo(page)).count < wanted; i++) {
    await tap(page, 'KeyJ');
    await page.waitForTimeout(380);
  }
  await page.evaluate(() => clearInterval((window as any).__guard));
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, invulnTimer: 0 } })));
}

test('combo meter: grows on real strikes, decays after 3.5s with an amber warning, hidden when it fades', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai-jax');
  await parkExcept(page, await firstEnemy(page));
  const meter = page.getByTestId('combo-meter');
  await expect(meter).toHaveCount(0); // nothing until the first hit

  await landHits(page, 5);
  const afterHits = await combo(page);
  expect(afterHits.count).toBeGreaterThanOrEqual(5);
  await expect(meter).toBeVisible();
  await expect(page.getByTestId('combo-count')).toHaveText(String(afterHits.count));
  await expect(page.getByTestId('combo-rank')).toHaveText('Memory Rhythm');
  await expect(meter).toHaveAttribute('data-rank', 'memory-rhythm');
  const font = await page.getByTestId('combo-count').evaluate((el) => getComputedStyle(el.closest('.kj-combo')!).fontVariantNumeric);
  expect(font).toContain('tabular-nums');
  await shot(page, '15-combo-memory-rhythm');

  // The decay bar is a compositor-only transform and tracks the timer.
  const bar = page.getByTestId('combo-bar');
  const barState = await bar.evaluate((el) => ({ transform: getComputedStyle(el).transform, width: getComputedStyle(el).width }));
  expect(barState.transform).toMatch(/^matrix\(/); // scaleX via transform, not width animation
  const t0 = Date.now();
  const lastHitAt = Date.now();

  // Amber warning below 28% of the timer (timeLeft < 0.98s).
  await expect.poll(async () => (await combo(page)).timeLeft, { timeout: 5000 }).toBeLessThan(0.98);
  await expect(meter).toHaveAttribute('data-warning', 'true');
  const scaleX = await bar.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(scaleX).toBeLessThan(0.28);
  expect(await bar.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('repeating-linear-gradient');
  await shot(page, '16-combo-warning');

  // Fades away silently (no Combo Broken) once the timer hits zero.
  await expect(meter).toHaveCount(0, { timeout: 4000 });
  const elapsed = (Date.now() - lastHitAt) / 1000;
  expect(elapsed).toBeGreaterThan(2.5);
  expect(elapsed).toBeLessThan(5.5);
  expect(await combo(page)).toMatchObject({ count: 0, broken: 0 });
  await expect(page.getByTestId('combo-broken')).toHaveCount(0);
  void t0;
  expect(errors).toEqual([]);
});

test('taking real damage resets the combo, attack chain and timer at once, then Combo Broken dismisses', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai-jax');
  await parkExcept(page, await firstEnemy(page));
  await landHits(page, 3);
  const before = await combo(page);
  expect(before.count).toBeGreaterThanOrEqual(3);
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, comboStep: 2, comboTimer: 0.8 } })));

  // Damage while invulnerable (dodge i-frames / grace) must NOT break it.
  await page.evaluate(() => { (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, invulnTimer: 1 } })); (window as Win).adventureStore.getState().damagePlayer(20); });
  expect((await combo(page)).count).toBe(before.count);

  // Real damage: instant reset.
  const healthBefore = (await playerFlags(page)).health;
  await page.evaluate(() => { (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, invulnTimer: 0 } })); (window as Win).adventureStore.getState().damagePlayer(20); });
  expect(await combo(page)).toMatchObject({ count: 0, timeLeft: 0, brokenFrom: before.count });
  const flags = await playerFlags(page);
  expect(flags).toMatchObject({ comboStep: 0, comboTimer: 0 });
  expect(flags.health).toBeLessThan(healthBefore);
  await expect(page.getByTestId('combo-broken')).toBeVisible();
  await expect(page.getByTestId('combo-lost')).toHaveText(`${before.count} hits lost`);
  await expect(page.getByTestId('combo-meter')).toHaveAttribute('data-rank', 'broken');
  await shot(page, '17-combo-broken');

  const brokenAt = Date.now();
  await expect(page.getByTestId('combo-meter')).toHaveCount(0, { timeout: 3000 });
  const shownFor = (Date.now() - brokenAt) / 1000;
  expect(shownFor).toBeLessThan(1.2); // brief: ~0.7s
  expect(errors).toEqual([]);
});

test('dodge opens a parry window; strikes inside it parry, later ones evade, the rest hit', async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page, 'kai-jax');
  const id = await firstEnemy(page);

  // 1) A real dodge starts the parry window, and it ends before the dodge's i-frames do.
  await parkExcept(page, null);
  await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, stamina: 100 } })));
  // Sample every rendered frame from inside the page: the window must open at once and close while the
  // dodge's i-frames are still running (so a parry can only happen inside an invulnerable dodge).
  await page.evaluate(() => {
    const log: Array<{ t: number; parry: number; invuln: number }> = [];
    (window as any).__dodgeLog = log;
    const t0 = performance.now();
    const tick = () => {
      const p = (window as Win).adventureStore.getState().player;
      log.push({ t: performance.now() - t0, parry: p.parryTimer, invuln: p.invulnTimer });
      // Run until the window has opened and closed again (simulation time can lag wall time on slow GPUs).
      const opened = log.some((x) => x.parry > 0);
      if (performance.now() - t0 < 6000 && !(opened && p.parryTimer === 0)) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.keyboard.down('Space');
  await page.waitForTimeout(150);
  await page.keyboard.up('Space');
  await page.waitForFunction(() => { const l = (window as any).__dodgeLog as Array<{ parry: number }>; return l.some((x) => x.parry > 0) && l[l.length - 1].parry === 0; }, null, { timeout: 8000 });
  const samples = (await page.evaluate(() => (window as any).__dodgeLog)) as Array<{ t: number; parry: number; invuln: number }>;
  const open = samples.filter((s) => s.parry > 0);
  expect(open.length, JSON.stringify(samples.slice(0, 12))).toBeGreaterThan(0);
  expect(Math.max(...open.map((s) => s.parry))).toBeLessThanOrEqual(0.2);
  expect(open.every((s) => s.invuln > 0)).toBe(true); // parry only exists inside the dodge's i-frames
  expect(samples[samples.length - 1].parry).toBe(0); // and it closes again

  // Popups live ~1s and the page can be slow, so record every one that appears.
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as any).__popupLog = seen;
    new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => { if (n instanceof HTMLElement) n.querySelectorAll?.('[data-testid="damage-popup"]').forEach((el) => seen.push(el.textContent ?? '')); if (n instanceof HTMLElement && n.matches?.('[data-testid="damage-popup"]')) seen.push(n.textContent ?? ''); });
    }).observe(document.body, { childList: true, subtree: true });
  });
  const sawPopup = (text: string) => page.evaluate((t) => ((window as any).__popupLog as string[]).some((x) => x.includes(t)), text);

  // 2) PARRY: enemy strikes while the window is open -> staggered, no damage, fusion +22, combo kept.
  await parkExcept(page, id, { dx: 1.5, dz: 0 }, 5000);
  await page.evaluate(() => {
    const cs = (window as Win).comboStore;
    cs.getState().hit();
    cs.getState().hit();
    // Keep a combo alive while waiting for the enemy to strike, and record every refresh (timer reset with
    // no new hit), which is what a parry does.
    (window as any).__keep = setInterval(() => cs.getState().hit(), 1500);
    const refreshes: Array<{ count: number; timeLeft: number }> = [];
    (window as any).__refreshes = refreshes;
    (cs as any).subscribe((s: any, prev: any) => {
      if (s.state.hitSeq === prev.state.hitSeq && s.state.count > 0 && s.state.timeLeft > prev.state.timeLeft) refreshes.push({ count: s.state.count, timeLeft: s.state.timeLeft });
    });
    (window as any).__arm = setInterval(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, parryTimer: 0.2, dodgeTimer: 0.3, invulnTimer: 0.3 } })), 20);
  });
  const hp0 = (await playerFlags(page)).health;
  const fusion0 = await page.evaluate(() => (window as Win).fusionStore.getState().charge as number);
  await expect.poll(() => sawPopup('PARRY!'), { timeout: 40_000 }).toBe(true);
  await page.evaluate(() => clearInterval((window as any).__arm));
  const parried = await page.evaluate((id) => { const e = (window as Win).adventureStore.getState().enemies.find((x: any) => x.id === id); return { state: e.aiState as string, stun: e.stunTimer as number }; }, id);
  expect(parried.state).toBe('stun');
  expect(parried.stun).toBeGreaterThan(1);
  expect((await playerFlags(page)).health).toBe(hp0);
  expect(await page.evaluate(() => (window as Win).fusionStore.getState().charge as number)).toBeGreaterThanOrEqual(fusion0 + 22);
  const refreshes = (await page.evaluate(() => (window as any).__refreshes)) as Array<{ count: number; timeLeft: number }>;
  expect(refreshes.length).toBeGreaterThanOrEqual(1); // the parry refreshed the timer without adding a hit
  expect(refreshes[0].timeLeft).toBe(3.5);
  expect(refreshes[0].count).toBeGreaterThanOrEqual(2);
  const aliveCount = (await combo(page)).count;
  expect(aliveCount).toBeGreaterThanOrEqual(2); // and the combo survived
  await shot(page, '18-parry');

  // 3) EVADE: i-frames but no parry window -> no damage, smaller reward, a plain "EVADED".
  await page.evaluate((id) => { (window as Win).adventureStore.setState((s) => ({ enemies: s.enemies.map((e: any) => (e.id === id ? { ...e, stunTimer: 0, aiState: 'chase', isAggro: true } : e)) })); (window as any).__arm = setInterval(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, parryTimer: 0, dodgeTimer: 0.3, invulnTimer: 0.3 } })), 20); }, id);
  await expect.poll(() => sawPopup('EVADED'), { timeout: 40_000 }).toBe(true);
  await page.evaluate(() => clearInterval((window as any).__arm));
  expect((await playerFlags(page)).health).toBe(hp0);
  expect((await combo(page)).count).toBeGreaterThanOrEqual(aliveCount); // evading never breaks it

  // 4) HIT: no defence -> the strike lands and breaks the combo.
  await page.evaluate(() => clearInterval((window as any).__keep));
  await page.evaluate((id) => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, parryTimer: 0, dodgeTimer: 0, invulnTimer: 0 }, enemies: s.enemies.map((e: any) => (e.id === id ? { ...e, stunTimer: 0, aiState: 'chase', isAggro: true, posX: s.player.posX + 1.5, posZ: s.player.posZ } : e)) })), id);
  await expect.poll(async () => (await playerFlags(page)).health, { timeout: 20_000 }).toBeLessThan(hp0);
  expect((await combo(page)).count).toBe(0); // the landed strike broke the combo (the HIT outcome)
  expect(errors).toEqual([]);
});

test('parry timing: standard opens a 0.10s window, generous 0.16s, and the setting persists', async ({ page }) => {
  test.setTimeout(180_000);
  await boot(page, 'kai-jax');
  await parkExcept(page, null);

  const dodgeAndMeasure = async () => {
    await page.evaluate(() => (window as Win).adventureStore.setState((s) => ({ player: { ...s.player, stamina: 100, parryTimer: 0, dodgeTimer: 0, invulnTimer: 0 } })));
    await page.evaluate(() => {
      const log: number[] = [];
      (window as any).__parryPeak = log;
      const tick = () => { log.push((window as Win).adventureStore.getState().player.parryTimer); if (log.length < 600 && !(log.some((x) => x > 0) && log[log.length - 1] === 0)) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await tap(page, 'Space');
    await page.waitForFunction(() => { const l = (window as any).__parryPeak as number[]; return l.some((x) => x > 0) && l[l.length - 1] === 0; }, null, { timeout: 15_000 });
    return Math.max(...((await page.evaluate(() => (window as any).__parryPeak)) as number[]));
  };

  const standard = await dodgeAndMeasure();
  expect(standard).toBeGreaterThan(0.05);
  expect(standard).toBeLessThanOrEqual(0.1);

  // Persist the option and relaunch: the controller must pick it up from storage like a real player's next session.
  await page.evaluate(() => localStorage.setItem('kaijax_a11y_v2', JSON.stringify({ parryTiming: 'generous' })));
  await boot(page, 'kai-jax');
  await parkExcept(page, null);
  const generous = await dodgeAndMeasure();
  expect(generous).toBeGreaterThan(0.1);
  expect(generous).toBeLessThanOrEqual(0.16);
  expect(generous).toBeGreaterThan(standard);

  // Persisted for next launch, and shown in Settings.
  await page.evaluate(() => (window as Win).runnerStore.setState({ gameState: 'settings' }));
  await expect(page.getByTestId('a11y-parry-timing')).toHaveValue('generous');
  await page.getByTestId('a11y-parry-timing').selectOption('standard');
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem('kaijax_a11y_v2')!))).toMatchObject({ parryTiming: 'standard' });
});

test('camera: the hero and the partner are both on screen, and the hero is a sensible size (phone portrait)', async ({ page }) => {
  await boot(page, 'kai');
  await expect.poll(async () => page.evaluate(() => (window as Win).companionStore.getState().hero)).toBe('jax');
  await parkExcept(page, null);
  await page.waitForTimeout(4000); // companion walks back to the flank, camera settles

  const m = await page.evaluate(() => {
    const w = window as Win;
    const cam = w.adventureCamera;
    cam.updateMatrixWorld(true);
    const proj = (v: any) => { const p = v.clone().project(cam); return { x: p.x as number, y: p.y as number }; };
    const g = w.companionObject;
    const comp = proj(g.getWorldPosition(g.position.clone()));
    const pl = w.adventureStore.getState().player;
    const base = g.position.clone(); base.set(pl.posX, pl.posY, pl.posZ);
    const head = base.clone(); head.y += 2.45;
    const feet = proj(base);
    const top = proj(head);
    return { comp, heroHeightFraction: (top.y - feet.y) / 2, aspect: cam.aspect as number, fov: cam.fov as number };
  });
  expect(m.aspect).toBeLessThan(0.6);
  expect(Math.abs(m.comp.x)).toBeLessThan(0.9); // partner inside the frame horizontally
  expect(Math.abs(m.comp.y)).toBeLessThan(0.95);
  expect(m.heroHeightFraction).toBeGreaterThan(0.1); // not a speck...
  expect(m.heroHeightFraction).toBeLessThan(0.3); // ...and no longer swallowing the screen (was >0.5)
  expect(m.fov).toBeGreaterThan(52); // tall screens get a wider vertical fov
  await shot(page, '19-camera-framing');
});

test.describe('desktop viewport', () => {
  test.use({ viewport: { width: 1280, height: 720 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

  test('combo meter sits top-right on desktop too, clear of the screen edge', async ({ page }) => {
    await boot(page, 'kai-jax');
    await parkExcept(page, await firstEnemy(page));
    await landHits(page, 2);
    const meter = page.getByTestId('combo-meter');
    await expect(meter).toBeVisible();
    const box = (await meter.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    expect(box.x + box.width).toBeGreaterThan(1280 * 0.85); // anchored to the right
    expect(box.y).toBeLessThan(720 * 0.3); // top region
    await shot(page, '20-combo-desktop');
  });
});
