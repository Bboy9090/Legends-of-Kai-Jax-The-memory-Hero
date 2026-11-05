import { test, expect, type Page } from '@playwright/test';

async function bootToMenu(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  await page.evaluate(() => {
    const runner = (window as any).runnerStore;
    const game = (window as any).gameStore;
    game?.getState?.().reset?.();
    runner.setState({
      gameState: 'menu',
      selectedCharacter: 'kai-jax',
      trainingSession: false,
    });
  });
  await expect(page.getByRole('button', { name: /^CONTINUE\b/i })).toBeVisible();
}

test('Training performs a live session pause/resume cycle and keeps training authority', async ({ page }) => {
  test.setTimeout(90_000);
  await bootToMenu(page);

  await page.getByRole('button', { name: /^TRAINING\b/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === 'adventure'
      && (window as any).runnerStore?.getState?.().trainingSession === true,
  );

  await expect(page.getByText(/TRAINING MODE - IMMORTAL/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });

  await page.evaluate(() => (window as any).useAdventure?.getState?.().togglePause?.());
  await expect(page.getByRole('heading', { name: /^PAUSED$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Resume$/i })).toBeVisible();

  await page.getByRole('button', { name: /^Resume$/i }).click();
  await expect(page.getByRole('heading', { name: /^PAUSED$/i })).toBeHidden();

  const state = await page.evaluate(() => ({
    gameState: (window as any).runnerStore?.getState?.().gameState,
    trainingSession: (window as any).runnerStore?.getState?.().trainingSession,
    paused: (window as any).useAdventure?.getState?.().isPaused,
  }));
  expect(state).toEqual({ gameState: 'adventure', trainingSession: true, paused: false });
});

test('Combat Arena commits a playable fighter into a live battle and supports results navigation', async ({ page }) => {
  test.setTimeout(120_000);
  await bootToMenu(page);

  await page.getByRole('button', { name: /^COMBAT ARENA\b/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'versus-select');
  await expect(page.getByRole('heading', { name: /Character Select/i })).toBeVisible();

  const fight = page.getByRole('button', { name: /^FIGHT$/i });
  await expect(fight).toBeEnabled();
  await fight.click();

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === 'playing'
      && (window as any).battleStore?.getState?.().battlePhase === 'fighting',
    null,
    { timeout: 20_000 },
  );

  const live = await page.evaluate(() => {
    const battle = (window as any).battleStore?.getState?.();
    return {
      player: battle?.playerFighterId,
      opponent: battle?.opponentFighterId,
      phase: battle?.battlePhase,
      training: (window as any).runnerStore?.getState?.().trainingSession,
    };
  });
  expect(live.player).toBeTruthy();
  expect(live.opponent).toBeTruthy();
  expect(live.phase).toBe('fighting');
  expect(live.training).toBe(false);

  await page.evaluate(() => (window as any).battleStore?.getState?.().endBattle?.('player'));
  await page.waitForFunction(
    () => (window as any).battleStore?.getState?.().battlePhase === 'results',
    null,
    { timeout: 10_000 },
  );

  await expect(page.getByText(/VICTORY!/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /^REMATCH$/i })).toBeVisible();
  await page.getByRole('button', { name: /^MAIN MENU$/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'menu');
  await expect(page.getByRole('button', { name: /^COMBAT ARENA\b/i })).toBeVisible();
});

test('Legends Archive exposes canonical character entries and returns to the main menu', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  await page.evaluate(() => (window as any).runnerStore?.setState?.({ gameState: 'menu' }));

  await page.getByRole('button', { name: /^LEGENDS ARCHIVE\b/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'lore-hub');

  await page.getByRole('button', { name: /^characters$/i }).click();
  await expect(page.getByText('KAI', { exact: true })).toBeVisible();
  await expect(page.getByText('JAX', { exact: true })).toBeVisible();
  await expect(page.getByText('KAI-JAX', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('BORYN', { exact: true })).toBeVisible();
  await expect(page.getByText('BORAX', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Exit to Menu$/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'menu');
  await expect(page.getByRole('button', { name: /^LEGENDS ARCHIVE\b/i })).toBeVisible();
});
