import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page) {
  await page.setViewportSize({ width: 1024, height: 768 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  return errors;
}

test('Customization lists fighters grouped by role (it used to render empty)', async ({ page }) => {
  const errors = await boot(page);
  await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'customization' }));
  for (const heading of ['Heroes', 'Rivals', 'Enemies', 'Bosses']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  const cards = page.locator('h3');
  expect(await cards.count()).toBeGreaterThan(10);
  await expect(page.getByText(/POW \d+ · SPD \d+ · DEF \d+/).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('Settings mute button toggles audio without throwing (toggleMute was undefined)', async ({ page }) => {
  const errors = await boot(page);
  await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'settings' }));
  const toggle = page.getByText('Master Mute').locator('xpath=../..').getByRole('button');
  await expect(toggle).toHaveClass(/bg-blue-600/); // audible by default
  await toggle.click();
  await expect(toggle).toHaveClass(/bg-gray-700/); // muted
  await toggle.click();
  await expect(toggle).toHaveClass(/bg-blue-600/);
  expect(errors).toEqual([]);
});

test('District select launches a district and records the campaign node (setCampaignCurrentNode was undefined)', async ({ page }) => {
  const errors = await boot(page);
  // District 1 unlocks once the campaign 'start' node is complete.
  await page.evaluate(() => (window as any).runnerStore.setState({ campaignCompletedNodes: ['start'], gameState: 'district-select' }));
  const firstDistrict = page.locator('.space-y-3 > button:not([disabled])').first();
  await firstDistrict.click();
  await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'adventure', null, { timeout: 15_000 });
  const node = await page.evaluate(() => (window as any).runnerStore.getState().campaignCurrentNode);
  expect(node).toMatch(/^district-\d$/);
  expect(errors).toEqual([]);
});

async function startAdventure(page: Page, missionId: string, viewport = { width: 844, height: 390 }) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    // Touch-capable device so the on-screen ability buttons render.
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
    (window as any).ontouchstart = null;
  });
  const errors = await boot(page);
  await page.evaluate((id) => {
    (window as any).useAdventure.getState().initAdventure('kai-jax', id, 'arena');
    (window as any).runnerStore.setState({ gameState: 'adventure', activeStoryMissionId: id });
  }, missionId);
  return errors;
}

test.describe('Adventure HUD: boss banner and ability buttons', () => {
  test('verified boss (Void Stalker) shows a phase banner driven by its real health; others do not', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await startAdventure(page, 'story_act1_m4');
    // Put a live boss with the verified identity into the store (same shape the mission spawner produces).
    const setBoss = (fighterId: string, healthPct: number) =>
      page.evaluate(({ fighterId, healthPct }) => {
        (window as any).useAdventure.setState((st: any) => {
          const template = st.enemies[0] ?? {};
          return { enemies: [{ ...template, id: 'w8-boss', fighterId, tier: 'boss1', maxHealth: 400, health: (400 * healthPct) / 100, isDead: false, aiState: 'idle' }] };
        });
      }, { fighterId, healthPct });
    const banner = page.getByTestId('combat-intel-boss');
    await setBoss('void-stalker', 100);
    await expect(banner).toContainText(/VOID STALKER · Phase 1\/\d/);
    await setBoss('void-stalker', 30);
    await expect(banner).toContainText(/Phase [23]\/\d/);
    await setBoss('ashen-tiger', 100); // a boss-tier enemy without a verified encounter identity
    await expect(banner).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ability buttons are operable by keyboard and report real readiness', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await startAdventure(page, 'story_act1_m1');
    const heavy = page.getByTestId('touch-heavy');
    await expect(heavy).toBeVisible();
    await expect(heavy).toHaveAttribute('data-ready', 'true');
    await expect(heavy).toHaveAttribute('aria-label', /HEAVY, ready/);
    // Drain stamina below the move cost: the button must say so, dim, and show a progress meter.
    await page.evaluate(() => (window as any).useAdventure.setState((st: any) => ({ player: { ...st.player, stamina: 3 } })));
    await expect(heavy).toHaveAttribute('data-ready', 'false');
    await expect(heavy).toHaveAttribute('aria-disabled', 'true');
    await expect(heavy).toHaveAttribute('aria-label', /HEAVY, (exhausted|not enough stamina)/);
    await expect(page.getByTestId('touch-heavy-meter')).toBeVisible();
    // Busy state while attacking.
    await page.evaluate(() => (window as any).useAdventure.setState((st: any) => ({ player: { ...st.player, stamina: 100, combatState: 'ATTACKING' } })));
    await expect(heavy).toHaveAttribute('aria-label', /HEAVY, recovering/);
    await page.evaluate(() => (window as any).useAdventure.setState((st: any) => ({ player: { ...st.player, stamina: 100, combatState: 'FREE' } })));
    await expect(heavy).toHaveAttribute('data-ready', 'true');
    // Keyboard activation queues the action exactly like a tap (record every queued attack).
    await page.evaluate(() => {
      (window as any).__queued = [];
      (window as any).useTouchInput.subscribe((st: any) => {
        const last = st.pendingAttacks[st.pendingAttacks.length - 1];
        if (last) (window as any).__queued.push(last);
      });
    });
    await heavy.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => (window as any).__queued)).toContain('heavy');
    expect(errors).toEqual([]);
  });
});
