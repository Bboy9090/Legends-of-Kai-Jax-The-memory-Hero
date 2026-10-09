import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const BENIGN_ERROR_PATTERNS = [
  /autoplay/i,
  /the play\(\) request/i,
  /sounds\/.*\.mp3/i,
  /favicon/i,
  /Failed to load resource.*(mp3|ogg|wav)/i,
  /WebGL.*deprecated/i,
  /SwiftShader/i,
  /Software WebGL/i,
  /GPU stall/i,
  /THREE\.WebGLRenderer: Context Lost/i,
  /\.hdr/i,
];

function isBenign(text: string): boolean {
  return BENIGN_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    if (!isBenign(error.message)) errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' && !isBenign(message.text())) {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
    timeout: 15_000,
  });
  await page.waitForFunction(
    () => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()),
    null,
    { timeout: 15_000 },
  );
}

async function enterMainMenuThroughVisibleFirstRun(page: Page): Promise<void> {
  await expect(page.getByTestId('lorehub-play-game-btn')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('lorehub-play-game-btn').click();

  await page.getByTestId('game-intro').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 12_000 }).catch(() => {});

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === 'menu',
    null,
    { timeout: 15_000 },
  );
}

async function waitForWave(page: Page, wave: string): Promise<void> {
  await page.waitForFunction(
    (expected) => (window as any).__KJ_MISSION1_TEST__?.getWave?.() === expected,
    wave,
    { timeout: 20_000 },
  );
}

async function defeatCurrentWaveThroughDirector(page: Page, expectedWave: string): Promise<void> {
  await waitForWave(page, expectedWave);

  const enemyIds = await page.evaluate(() =>
    ((window as any).__KJ_MISSION1_TEST__?.getEnemies?.() ?? [])
      .filter((enemy: any) => !enemy.isDead)
      .map((enemy: any) => enemy.id),
  );

  expect(enemyIds.length, `${expectedWave} should contain at least one live enemy`).toBeGreaterThan(0);

  for (const enemyId of enemyIds) {
    const result = await page.evaluate(
      ({ id }) => (window as any).__KJ_MISSION1_TEST__.applyDamage(id, 10_000, true),
      { id: enemyId },
    );
    expect(result?.triggeredDeath, `${enemyId} should die through EncounterDirector damage`).toBe(true);
  }

  await page.waitForFunction(
    (previousWave) => (window as any).__KJ_MISSION1_TEST__?.getWave?.() !== previousWave,
    expectedWave,
    { timeout: 20_000 },
  );
}

test('E2E-006: Gold Slice real-runtime accelerated player path', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = collectErrors(page);

  await page.addInitScript(() => {
    const clearedKey = '__kj_gold_slice_storage_cleared__';
    if (sessionStorage.getItem(clearedKey) === '1') return;
    localStorage.removeItem('kai-jax-save');
    localStorage.removeItem('kai-jax-save-backup');
    localStorage.removeItem('MK_MISSIONS_V1');
    sessionStorage.setItem(clearedKey, '1');
  });

  await boot(page);
  await enterMainMenuThroughVisibleFirstRun(page);

  // Character selection does not yet have a complete visible campaign route.
  // This setup changes only the selected Gold Slice identity; it does not change
  // game state, encounter state, boss state, victory, or persistence.
  await page.evaluate(() => {
    (window as any).runnerStore.getState().setCharacter('kai-jax');
  });

  await page.getByRole('button', { name: /STORY HUB/i }).click();
  await expect(page.getByRole('heading', { name: /Legends of Kai-Jax Campaign/i }))
    .toBeVisible({ timeout: 15_000 });

  const missionButton = page
    .getByRole('button')
    .filter({ hasText: 'Awakening of the Memory Hero' })
    .first();
  await expect(missionButton).toBeVisible({ timeout: 15_000 });
  await missionButton.click();

  const beginMission = page.getByRole('button', { name: /Begin Mission/i });
  await expect(beginMission).toBeVisible({ timeout: 10_000 });
  await beginMission.click();

  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => Boolean((window as any).__KJ_MISSION1_TEST__), null, {
    timeout: 20_000,
  });

  await defeatCurrentWaveThroughDirector(page, 'WAVE_1');
  await defeatCurrentWaveThroughDirector(page, 'WAVE_2');
  await defeatCurrentWaveThroughDirector(page, 'WAVE_3');
  await defeatCurrentWaveThroughDirector(page, 'WAVE_4');
  await defeatCurrentWaveThroughDirector(page, 'ELITE');

  await waitForWave(page, 'BOSS');
  const boss = await page.evaluate(() =>
    ((window as any).__KJ_MISSION1_TEST__?.getEnemies?.() ?? []).find(
      (enemy: any) => enemy.type === 'VOID_STALKER_PRIME',
    ),
  );
  expect(boss).toBeTruthy();
  expect(boss.bossPhase).toBe(1);

  const phaseTwoDamage = await page.evaluate(
    ({ id }) => (window as any).__KJ_MISSION1_TEST__.applyDamage(id, 90, true),
    { id: boss.id },
  );
  expect(phaseTwoDamage?.triggeredDeath).toBe(false);

  await page.waitForFunction(
    () => (window as any).__KJ_MISSION1_TEST__?.getBossPhase?.() === 2,
    null,
    { timeout: 20_000 },
  );

  const phaseTwoSnapshot = await page.evaluate(() => {
    const api = (window as any).__KJ_MISSION1_TEST__;
    const bossEnemy = (api?.getEnemies?.() ?? []).find(
      (enemy: any) => enemy.type === 'VOID_STALKER_PRIME',
    );
    return {
      phase: api?.getBossPhase?.(),
      state: bossEnemy?.currentState,
      health: bossEnemy?.stats?.currentHealth,
    };
  });
  expect(phaseTwoSnapshot.phase).toBe(2);
  expect(phaseTwoSnapshot.health).toBeGreaterThan(0);

  const bossDeath = await page.evaluate(
    ({ id }) => (window as any).__KJ_MISSION1_TEST__.applyDamage(id, 10_000, true),
    { id: boss.id },
  );
  expect(bossDeath?.triggeredDeath).toBe(true);

  await waitForWave(page, 'VICTORY');
  await page.waitForFunction(
    () => (window as any).__KJ_MISSION1_TEST__?.isMissionCompleted?.() === true,
    null,
    { timeout: 20_000 },
  );

  const directorSave = await page.evaluate(() =>
    (window as any).__KJ_MISSION1_TEST__?.getSaveState?.(),
  );
  expect(directorSave?.completed).toBe(true);

  await page.waitForFunction(
    () => (window as any).runnerStore
      ?.getState?.()
      .completedStoryMissionIds
      ?.includes('story_act1_m1'),
    null,
    { timeout: 20_000 },
  );

  await page.reload();
  await boot(page);

  const persisted = await page.evaluate(() =>
    (window as any).runnerStore
      .getState()
      .completedStoryMissionIds
      .includes('story_act1_m1'),
  );
  expect(persisted).toBe(true);

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});
