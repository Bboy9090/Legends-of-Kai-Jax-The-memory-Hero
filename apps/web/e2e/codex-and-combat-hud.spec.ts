import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page, viewport = { width: 1024, height: 768 }) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    // Controller shim: tests flip window.__padB to simulate pressing B on a gamepad.
    (window as any).__padB = false;
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [
        {
          connected: true,
          buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === 1 && (window as any).__padB, value: 0 })),
          axes: [0, 0, 0, 0],
        },
      ],
    });
  });
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  await page.evaluate(() => {
    (window as any).gameStore?.getState?.().reset?.();
    (window as any).runnerStore.setState({ gameState: 'menu', selectedCharacter: 'kai-jax', trainingSession: false });
  });
}

const gameState = (page: Page) => page.evaluate(() => (window as any).runnerStore.getState().gameState as string);

test.describe('Game Codex navigation', () => {
  test('desktop: menu → Legends Archive → Game Codex, Back and Escape return to the Lore Hub', async ({ page }) => {
    await boot(page);
    await page.getByRole('button', { name: /^LEGENDS ARCHIVE\b/i }).click();
    await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'lore-hub');

    await page.getByTestId('lore-open-codex').click();
    await expect(page.getByTestId('game-codex')).toBeVisible();
    expect(await gameState(page)).toBe('codex');
    await expect(page.getByTestId('codex-back')).toBeFocused();

    await page.getByTestId('codex-back').click();
    await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'lore-hub');
    await expect(page.getByTestId('game-codex')).toHaveCount(0);

    await page.getByTestId('lore-open-codex').click();
    await expect(page.getByTestId('game-codex')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'lore-hub');
  });

  test('hero button also opens the codex', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'lore-hub' }));
    await page.getByTestId('lore-open-codex-hero').click();
    await expect(page.getByTestId('game-codex')).toBeVisible();
  });

  test('keyboard: arrow keys move between codex tabs with correct ARIA state', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'codex' }));
    await expect(page.getByRole('tablist', { name: /codex sections/i })).toBeVisible();
    const tabs = page.getByRole('tab');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
  });

  test('controller: gamepad B returns to the Lore Hub', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'codex' }));
    await expect(page.getByTestId('game-codex')).toBeVisible();
    await page.evaluate(() => ((window as any).__padB = true));
    await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'lore-hub', null, { timeout: 5000 });
    await page.evaluate(() => ((window as any).__padB = false));
  });

  test('mobile 390x844: reachable from the hamburger menu and fits without horizontal scroll', async ({ page }) => {
    await boot(page, { width: 390, height: 844 });
    await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'lore-hub' }));
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByTestId('lore-open-codex-mobile').click();
    await expect(page.getByTestId('game-codex')).toBeVisible();
    const back = page.getByTestId('codex-back');
    const box = (await back.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: 'test-results/codex-mobile.png' });
    await back.click();
    await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'lore-hub');
  });
});

async function startBattle(page: Page, opponent: string, viewport = { width: 1024, height: 768 }) {
  await boot(page, viewport);
  await page.getByRole('button', { name: /^COMBAT ARENA\b/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'versus-select');
  const fight = page.getByRole('button', { name: /^FIGHT$/i });
  await expect(fight).toBeEnabled();
  await fight.click();
  await page.waitForFunction(
    () => (window as any).runnerStore.getState().gameState === 'playing' && (window as any).battleStore.getState().battlePhase === 'fighting',
    null,
    { timeout: 25_000 },
  );
  // The select screen picks its own opponent on FIGHT; pin the one under test once the fight is live.
  await page.evaluate((id) => (window as any).battleStore.getState().setOpponentFighter(id), opponent);
}

test.describe('Combat HUD reconciliation', () => {
  test('versus fight: single HUD, ability strip and live ultimate readiness (no banner for unverified boss identities)', async ({ page }) => {
    test.setTimeout(300_000);
    await startBattle(page, 'ashen-tiger');

    await expect(page.getByTestId('combat-intel')).toHaveCount(1);
    // No second copy of the readouts BattleUI already owns.
    for (const dup of [/Boss HP/i, /^Combat Abilities$/i, /^Mana$/i, /Boss Encounter/i]) {
      await expect(page.getByText(dup)).toHaveCount(0);
    }

    // Ashen Tiger has no verified link to an encounter definition, so no phase banner may appear.
    await expect(page.getByTestId('combat-intel-boss')).toHaveCount(0);

    const abilityButtons = page.getByTestId('combat-intel-ability');
    expect(await abilityButtons.count()).toBeGreaterThan(0);
    await abilityButtons.first().click();
    await expect(page.getByTestId('combat-intel-ability-detail')).toBeVisible();
    await abilityButtons.first().click();
    await expect(page.getByTestId('combat-intel-ability-detail')).toHaveCount(0);

    const ult = page.getByTestId('combat-intel-ultimate');
    await expect(ult).toHaveAttribute('data-ready', 'false');
    await page.evaluate(() => {
      const s = (window as any).battleStore;
      s.setState({ playerOverdrive: s.getState().maxOverdrive });
    });
    await expect(ult).toHaveAttribute('data-ready', 'true');
    await expect(ult).toContainText(/READY/);

    // Regression guard: the supplemental strip must not cover BattleUI's own readouts.
    const rect = async (loc: ReturnType<Page['locator']>) =>
      loc.first().evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    const hits = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
      a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
    const strip = await rect(page.getByTestId('combat-intel-abilities'));
    for (const label of [/^Overdrive$/i, /^Stamina$/i, /ultimate ready/i]) {
      const target = page.getByText(label).first();
      const box = (await target.count())
        ? await target.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })
        : null;
      if (box) expect(hits(strip, box), String(label)).toBe(false);
    }
    await page.screenshot({ path: 'test-results/combat-hud-boss-desktop.png' });
  });

  test('non-boss fight shows abilities but no boss banner', async ({ page }) => {
    test.setTimeout(120_000);
    await startBattle(page, 'steelwolf');
    await expect(page.getByTestId('combat-intel-boss')).toHaveCount(0);
    await expect(page.getByTestId('combat-intel-abilities')).toBeVisible();
  });

  test('HUD layers disappear outside the fight phase', async ({ page }) => {
    test.setTimeout(120_000);
    await startBattle(page, 'ashen-tiger');
    await expect(page.getByTestId('combat-intel')).toHaveCount(1);
    await page.evaluate(() => (window as any).battleStore.setState({ battlePhase: 'results', winner: 'player' }));
    await expect(page.getByTestId('combat-intel')).toHaveCount(0);
  });

  test('mobile 390x844: no horizontal overflow and the ability strip stays out of the touch controls', async ({ page }) => {
    test.setTimeout(120_000);
    await startBattle(page, 'ashen-tiger', { width: 390, height: 844 });
    await expect(page.getByTestId('combat-intel-abilities')).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
