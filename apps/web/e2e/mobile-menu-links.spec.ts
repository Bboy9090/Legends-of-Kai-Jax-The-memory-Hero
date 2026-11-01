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
      completedStoryMissionIds: [],
      campaignCompletedNodes: [],
      totalScore: 0,
    });
  });
  await expect(page.getByRole('button', { name: /CONTINUE/i })).toBeVisible();
}

async function resetMenu(page: Page) {
  await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'menu', trainingSession: false }));
  await expect(page.getByRole('button', { name: /CONTINUE/i })).toBeVisible();
}

test('portrait main menu routes every advertised entry to a real screen', async ({ page }) => {
  test.setTimeout(120_000);
  await bootToMenu(page);

  const routes = [
    [/^CONTINUE\b/i, 'story-hub', /Story Hub/i],
    [/^STORY\b/i, 'story-hub', /Story Hub/i],
    [/^MISSIONS\b/i, 'campaign-map', /Legends of Kai-Jax Campaign/i],
    [/^COMBAT ARENA\b/i, 'versus-select', /Character Select/i],
    [/^LEGENDS ARCHIVE\b/i, 'lore-hub', /Legends of Kai-Jax/i],
    [/^CUSTOMIZE\b/i, 'customization', /Fighters/i],
    [/^OPTIONS\b/i, 'settings', /Settings/i],
    [/^EXTRAS\b/i, 'abilities', /Character Abilities/i],
    [/^CREDITS\b/i, 'credits', /^Credits$/i],
    [/^EXIT GAME\b/i, 'title', /Legends of Kai-Jax/i],
  ] as const;

  for (const [label, state, visibleText] of routes) {
    await page.getByRole('button', { name: label }).click();
    await page.waitForFunction(
      (expected) => (window as any).runnerStore?.getState?.().gameState === expected,
      state,
    );
    expect(await page.evaluate(() => (window as any).runnerStore.getState().gameState)).toBe(state);
    if (state === 'title') {
      await expect(page.getByTestId('title-screen')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId('title-begin-button')).toBeVisible({ timeout: 10_000 });
      await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'menu' }));
      await expect(page.getByRole('button', { name: /CONTINUE/i })).toBeVisible();
    } else {
      await expect(page.getByText(visibleText).first()).toBeVisible({ timeout: 10_000 });
      await resetMenu(page);
    }
  }

  await page.evaluate(() => {
    const runner = (window as any).runnerStore;
    runner.setState({
      gameState: 'menu',
      completedStoryMissionIds: ['story_act1_m1'],
      totalScore: 100,
    });
  });
  await page.getByRole('button', { name: /^CONTINUE\b/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'campaign-map');
  await expect(page.getByText(/Legends of Kai-Jax Campaign/i)).toBeVisible();

  await resetMenu(page);
  await page.getByRole('button', { name: /^TRAINING\b/i }).click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'adventure');
  const training = await page.evaluate(() => (window as any).runnerStore.getState().trainingSession);
  expect(training).toBe(true);
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
});

test('portrait legend select keeps Confirm Legend tappable above Android navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  await page.evaluate(() => {
    const runner = (window as any).runnerStore;
    const game = (window as any).gameStore;
    game?.getState?.().reset?.();
    runner.setState({ gameState: 'character-select', selectedCharacter: 'kai-jax' });
  });

  const confirm = page.getByTestId('legend-select-confirm');
  await expect(confirm).toBeVisible();
  await expect(confirm).toBeEnabled();
  const box = await confirm.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? 9999) + (box?.height ?? 0)).toBeLessThanOrEqual(832);

  await page.getByRole('button', { name: /JAX/i }).filter({ hasNotText: /KAI-JAX/i }).first().click();
  await confirm.click();
  await page.waitForFunction(() => (window as any).runnerStore?.getState?.().gameState === 'mission-select');
});
