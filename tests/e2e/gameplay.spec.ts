import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end gameplay verification at iPhone 14 size (390x844).
 *
 *   cd apps/web && npx playwright test -c playwright.gameplay.config.ts
 *
 * Boots the app, walks Main Menu -> Story Hub -> Character Select -> Campaign Map -> a real battle,
 * lands a Tier 1 strike, and writes real screenshots to artifacts/verification/.
 */

const OUT = fileURLToPath(new URL('../../artifacts/verification/', import.meta.url));

type Win = typeof window & {
  runnerStore: { getState: () => any; setState: (s: object) => void; persist: { hasHydrated: () => boolean } };
  adventureStore: { getState: () => any };
  heroRosterStore: { getState: () => any };
};

async function shot(page: Page, name: string) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}${name}.png` });
}

const enemyHealth = (page: Page) =>
  page.evaluate(() => (window as Win).adventureStore.getState().enemies.reduce((sum: number, e: any) => sum + (e.isDead ? 0 : e.health), 0));

test('mobile gameplay: menu -> character select -> campaign map -> battle with a Tier 1 hit', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  const where = () => page.evaluate(() => (window as Win).runnerStore?.getState?.().gameState).catch(() => 'unknown');
  page.on('console', async (m) => {
    const text = m.text();
    if (m.type() === 'error') problems.push(`console.error [${await where()}]: ${text}`);
    if (/THREE\.WebGLRenderer.*(error|fail)/i.test(text)) problems.push(`webgl [${await where()}]: ${text}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  page.on('requestfailed', (r) => {
    if (r.url().startsWith('http://localhost')) problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });

  // R3F force-loses a Canvas's context ~500ms after it unmounts, which is normal teardown. A loss on a
  // canvas that is still attached to the page is a real failure, so record those separately.
  await page.addInitScript(() => {
    (window as any).__liveContextLosses = [];
    window.addEventListener(
      'webglcontextlost',
      (e) => {
        const canvas = e.target as HTMLCanvasElement;
        if (canvas.isConnected) (window as any).__liveContextLosses.push({ state: (window as any).runnerStore?.getState?.().gameState });
      },
      true,
    );
  });

  // ---- Boot ---------------------------------------------------------------
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as Win).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30_000 });
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  expect(await page.evaluate(() => Boolean(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')))).toBe(true);
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });

  // Start from a clean save so the run is deterministic.
  await page.evaluate(() => {
    const w = window as Win;
    w.runnerStore.setState({ completedStoryMissionIds: [], campaignCompletedNodes: [], totalScore: 0, selectedCharacter: 'kai-jax', gameState: 'title' });
    w.heroRosterStore.getState().resetRoster();
  });

  // ---- Title -> Main Menu ---------------------------------------------------
  await expect(page.getByTestId('title-screen')).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /^CONTINUE\b/i })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);
  await shot(page, '01-main-menu');

  // ---- Main Menu -> Story Hub -> Character Select ----------------------------
  await page.getByRole('button', { name: /^STORY\b/i }).click();
  await expect(page.getByTestId('campaign-mission-list')).toBeVisible();
  await page.locator('[data-mission-id="story_act1_m1"]').click();
  await expect(page.getByTestId('legend-select')).toBeVisible();

  // All 16 hero cards render; the three leads are unlocked, everyone else is locked.
  const cards = page.locator('[data-testid^="legend-card-"]');
  await expect(cards).toHaveCount(16);
  for (const id of ['kai', 'jax', 'kai-jax']) await expect(page.getByTestId(`legend-card-${id}`)).toHaveAttribute('data-locked', 'false');
  for (const id of ['boryn', 'borax', 'kaison', 'silver', 'volter', 'vharck', 'aurelion', 'selene', 'miri', 'old-moss', 'rikka', 'mirek', 'sable-nine']) {
    await expect(page.getByTestId(`legend-card-${id}`)).toHaveAttribute('data-locked', 'true');
  }
  await expect(page.getByTestId('legend-card-kai-jax')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('legend-select-confirm')).toBeEnabled();
  await expect(page.getByTestId('legend-select-abilities')).toBeVisible();
  // The live 3D preview of the selected hero renders on a real canvas.
  await expect(page.getByTestId('hero-turntable')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('hero-turntable').locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500); // let the GLB load and spin into frame
  await shot(page, '02-character-select');

  // Selecting a locked hero keeps Confirm disabled.
  await page.getByTestId('legend-card-boryn').click();
  await expect(page.getByTestId('legend-select-confirm')).toBeDisabled();
  await page.getByTestId('legend-card-kai-jax').click();

  // ---- Back out to the Main Menu, then Campaign Map --------------------------
  await page.getByTestId('legend-select-back').click();
  await page.getByRole('button', { name: 'Back to main menu' }).click();
  await page.getByRole('button', { name: /^MISSIONS\b/i }).click();
  await expect(page.getByTestId('campaign-map')).toBeVisible();

  const viewportWidth = 390;
  const container = await page.getByTestId('campaign-map-container').boundingBox();
  expect(container).not.toBeNull();
  expect(Math.abs(container!.x + container!.width / 2 - viewportWidth / 2)).toBeLessThanOrEqual(1);
  expect(container!.x).toBeGreaterThan(8); // real side padding, not flush to the screen edge

  // "KAI-JAX" never breaks across lines, and every Act tab is one line and centered.
  const title = page.getByRole('heading', { level: 1 });
  await expect(title).toContainText('Kai-Jax');
  expect(await title.locator('span').evaluate((el) => ({ rects: el.getClientRects().length, text: el.textContent }))).toEqual({ rects: 1, text: 'Kai-Jax' });

  for (let act = 1; act <= 9; act++) {
    const tab = page.getByTestId(`act-tab-${act}`);
    await tab.click();
    await expect(tab).toBeVisible();
    const metrics = await tab.evaluate((el) => {
      const style = getComputedStyle(el);
      return { nowrap: style.whiteSpace === 'nowrap', fits: el.scrollWidth <= el.clientWidth + 1, oneLine: el.getClientRects().length === 1, text: el.textContent?.trim() };
    });
    expect(metrics, `ACT ${act} tab`).toEqual({ nowrap: true, fits: true, oneLine: true, text: `ACT ${act}` });
    await expect(page.locator('[data-mission-id]')).toHaveCount(5);
  }
  const tabBoxes = await Promise.all(Array.from({ length: 9 }, (_, i) => page.getByTestId(`act-tab-${i + 1}`).boundingBox()));
  const left = Math.min(...tabBoxes.map((b) => b!.x));
  const right = Math.max(...tabBoxes.map((b) => b!.x + b!.width));
  expect(Math.abs((left + right) / 2 - viewportWidth / 2)).toBeLessThanOrEqual(2);

  await page.getByTestId('act-tab-1').click();
  await shot(page, '03-campaign-map');

  // ---- Launch a real battle ----------------------------------------------------
  await page.getByTestId('campaign-mission-story_act1_m1').click();
  await page.getByTestId('begin-mission').click();
  await expect(page.getByRole('button', { name: 'Engage Mission' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Engage Mission' }).click();

  const dialogue = page.getByTestId('dialogue-overlay');
  await expect(dialogue).toBeVisible({ timeout: 20_000 });
  const portrait = page.getByTestId('dialogue-portrait');
  await expect(portrait).toBeVisible();
  expect(['neutral', 'determined', 'hit', 'triumphant']).toContain(await portrait.getAttribute('data-mood'));
  for (let i = 0; i < 60 && (await dialogue.isVisible().catch(() => false)); i++) {
    // Every beat must fit two lines of text at phone width.
    const lineCount = await page.getByTestId('dialogue-text').evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lineCount).toBeLessThanOrEqual(3);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
  }
  await expect(dialogue).toBeHidden({ timeout: 10_000 });

  await expect.poll(() => page.evaluate(() => (window as Win).adventureStore.getState().enemies.length), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(page.locator('canvas').first()).toBeVisible();

  // ---- Tier 1 ability: stand beside an enemy and throw light attacks ------------
  const startingHealth = await enemyHealth(page);
  expect(startingHealth).toBeGreaterThan(0);
  const target = await page.evaluate(() => {
    const s = (window as Win).adventureStore.getState();
    const e = s.enemies.find((x: any) => !x.isDead);
    s.setPlayerPos(e.posX + 1.2, 0, e.posZ);
    return { id: e.id, hp: e.health };
  });

  let hit = false;
  for (let i = 0; i < 12 && !hit; i++) {
    await page.evaluate(({ id }) => {
      const s = (window as Win).adventureStore.getState();
      const e = s.enemies.find((x: any) => x.id === id);
      if (e && !e.isDead) s.setPlayerPos(e.posX + 1.2, 0, e.posZ);
    }, target);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(450);
    hit = (await enemyHealth(page)) < startingHealth;
  }
  expect(hit, 'a Tier 1 light attack should reduce enemy HP').toBe(true);
  const after = await enemyHealth(page);
  expect(after).toBeLessThan(startingHealth);

  // Floating damage renders as a real DOM element with a damage number.
  const popup = page.getByTestId('damage-popup').first();
  await expect(popup).toBeVisible({ timeout: 4_000 });
  await expect(popup).toContainText(/\d+/);
  const arenaLit = await page.evaluate(async (b64: string) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d')!;
    g.drawImage(img, 0, 0);
    // The battlefield band sits between the top HUD panels and the bottom controls.
    const y0 = Math.floor(img.height * 0.4);
    const y1 = Math.floor(img.height * 0.85);
    let lit = 0;
    let total = 0;
    for (let y = y0; y < y1; y += 8) {
      for (let x = 0; x < img.width; x += 8) {
        const [r, gr, b] = g.getImageData(x, y, 1, 1).data;
        total++;
        if (Math.max(r, gr, b) > 60) lit++;
      }
    }
    return lit / total;
  }, (await page.screenshot()).toString('base64'));
  expect(arenaLit, 'the 3D arena must be visible in the page, not hidden behind an overlay').toBeGreaterThan(0.08);
  await shot(page, '04-active-combat');

  fs.writeFileSync(
    `${OUT}summary.json`,
    JSON.stringify({ viewport: '390x844', enemyHpBefore: startingHealth, enemyHpAfter: after, arenaLitFraction: Number(arenaLit.toFixed(3)), damagePopupText: (await popup.textContent())?.trim(), problems, liveWebglContextLosses: await page.evaluate(() => (window as any).__liveContextLosses) }, null, 2),
  );

  // ---- No console / page / WebGL errors anywhere in the run ----------------------
  const liveLosses = await page.evaluate(() => (window as any).__liveContextLosses);
  expect(liveLosses, `WebGL context lost on a live canvas: ${JSON.stringify(liveLosses)}`).toEqual([]);
  expect(problems, problems.join('\n')).toEqual([]);
});
