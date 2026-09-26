import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const MISSIONS = [
  { id: 'vertical_slice_ironvein_wards', interactionZ: 41 },
  { id: 'vertical_slice_skyfall_spines', interactionZ: 32 },
  { id: 'vertical_slice_storm_ronin_sanctum', interactionZ: 32 },
] as const;

const BENIGN_ERROR_PATTERNS = [
  /autoplay/i,
  /the play\(\) request/i,
  /sounds\/.*\.mp3/i,
  /favicon/i,
  /Failed to load resource.*(mp3|ogg|wav|png|jpg|glb)/i,
  /WebGL.*deprecated/i,
  /SwiftShader/i,
  /Software WebGL/i,
  /THREE\.WebGLRenderer: Context Lost/i,
  /Failed to fetch/i,
  /net::ERR_/i,
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

async function bootField(page: Page, missionId: string) {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState), null, {
    timeout: 15_000,
  });

  await page.evaluate(() => localStorage.removeItem('kai-jax-save'));
  await page.reload();
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState), null, {
    timeout: 15_000,
  });

  await page.evaluate((id) => {
    const store = (window as any).runnerStore;
    store.getState().setCharacter('jax');
    store.getState().setActiveStoryMission(id);
    store.getState().setGameState('vertical-slice');
  }, missionId);

  await expect(page.getByTestId('field-mission-id')).toHaveText(missionId, { timeout: 15_000 });
  await expect(page.locator('canvas').first()).toBeVisible();
}

async function readZ(page: Page): Promise<number> {
  const text = await page.getByTestId('field-position').innerText();
  const parts = text.split(',').map(Number);
  if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) {
    throw new Error(`Invalid field position: ${text}`);
  }
  return parts[2]!;
}

for (const mission of MISSIONS) {
  test(`${mission.id} launches, traverses, interacts, and records completion`, async ({ page }) => {
    const errors = collectErrors(page);
    await bootField(page, mission.id);

    const deadline = Date.now() + 30_000;
    const burstCutoffZ = mission.interactionZ - 10;

    await page.keyboard.down('w');
    try {
      while (Date.now() < deadline && (await readZ(page)) < burstCutoffZ) {
        // Jax's authored ground displacement accelerates only the long approach.
        // Stop bursting near the target so sparse CI frames cannot jump clean
        // through the interaction radius.
        await page.keyboard.press('e');
        await page.waitForTimeout(350);
      }

      await expect(page.getByTestId('field-interact-ready')).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await page.keyboard.up('w');
    }
    await page.keyboard.press('f');

    await expect.poll(async () => page.evaluate(() => {
      const s = (window as any).runnerStore?.getState?.();
      return {
        gameState: s?.gameState,
        completed: s?.completedStoryMissionIds ?? [],
      };
    }), {
      timeout: 8_000,
      intervals: [75, 100, 150, 250],
    }).toEqual({
      gameState: 'mission-complete',
      completed: [mission.id],
    });

    expect(errors).toEqual([]);
  });
}
