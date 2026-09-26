import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const MISSIONS = [
  {
    id: 'vertical_slice_ironvein_wards',
    interactionBeats: [2, 5],
    layout: 'ironvein-pressure',
    location: 'IRONVEIN WARDS',
    districtId: 'ironvein-wards',
  },
  {
    id: 'vertical_slice_skyfall_spines',
    interactionBeats: [2, 4],
    layout: 'skyfall-vertical',
    location: 'SKYFALL SPINES',
    districtId: 'skyfall-spines',
  },
  {
    id: 'vertical_slice_storm_ronin_sanctum',
    interactionBeats: [1, 2, 4],
    layout: 'sanctum-archive',
    location: 'STORM RONIN SANCTUM',
    districtId: 'storm-ronin-sanctum',
  },
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

async function readBeatIndex(page: Page): Promise<number> {
  const text = await page.getByTestId('field-beat-index').innerText();
  const match = text.match(/Beat\s+(\d+)\s*\//i);
  if (!match) throw new Error(`Invalid field beat label: ${text}`);
  return Number(match[1]) - 1;
}

async function missionCompleteState(page: Page, missionId: string): Promise<boolean> {
  return page.evaluate((id) => {
    const s = (window as any).runnerStore?.getState?.();
    return s?.gameState === 'mission-complete'
      && Array.isArray(s?.completedStoryMissionIds)
      && s.completedStoryMissionIds.includes(id);
  }, missionId);
}

for (const mission of MISSIONS) {
  test(`${mission.id} launches, traverses, interacts, and records completion`, async ({ page }) => {
    const errors = collectErrors(page);
    await bootField(page, mission.id);
    await expect(page.getByTestId('field-layout-profile')).toHaveText(mission.layout);

    const deadline = Date.now() + 35_000;
    let interactionCursor = 0;
    let firstGateProved = false;

    await page.keyboard.down('w');
    try {
      while (Date.now() < deadline && !(await missionCompleteState(page, mission.id))) {
        if (await page.getByTestId('field-interact-ready').isVisible().catch(() => false)) {
          const beatIndex = await readBeatIndex(page);
          expect(beatIndex).toBe(mission.interactionBeats[interactionCursor]);

          if (!firstGateProved) {
            firstGateProved = true;
            // Movement and traversal bursts must not bypass an authored USE gate.
            await page.keyboard.press('e');
            await page.waitForTimeout(800);
            expect(await readBeatIndex(page)).toBe(beatIndex);
          }

          await page.keyboard.press('f');
          interactionCursor += 1;
          await page.waitForTimeout(250);
          continue;
        }

        await page.keyboard.press('e');
        await page.waitForTimeout(300);
      }
    } finally {
      await page.keyboard.up('w');
    }

    expect(firstGateProved).toBe(true);
    expect(interactionCursor).toBe(mission.interactionBeats.length);

    await expect.poll(async () => page.evaluate((id) => {
      const state = (window as any).runnerStore?.getState?.();
      return {
        gameState: state?.gameState,
        completed: state?.completedStoryMissionIds ?? [],
        expected: id,
      };
    }, mission.id), {
      timeout: 8_000,
      intervals: [75, 100, 150, 250],
    }).toEqual({
      gameState: 'mission-complete',
      completed: [mission.id],
      expected: mission.id,
    });

    await expect(page.getByTestId('mission-complete-location')).toContainText(mission.location);
    await page.getByTestId('mission-complete-return').click();
    await expect(page.getByTestId(`story-hub-completed-${mission.districtId}`)).toBeVisible({
      timeout: 8_000,
    });

    expect(errors).toEqual([]);
  });
}


test.describe('Raging City shared field touch completion', () => {
  test.use({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });

  test('Ironvein completes through touch joystick, traversal, and USE', async ({ page }) => {
    const errors = collectErrors(page);
    const missionId = 'vertical_slice_ironvein_wards';
    const interactionBeats = [2, 5] as const;
    await bootField(page, missionId);

    await expect(page.getByTestId('field-layout-profile')).toHaveText('ironvein-pressure');
    await expect(page.getByTestId('vertical-slice-touch-controls')).toBeVisible();

    const joystick = page.getByTestId('slice-touch-joystick');
    const box = await joystick.boundingBox();
    if (!box) throw new Error('Field touch joystick has no bounding box');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await joystick.dispatchEvent('pointerdown', {
      pointerId: 71,
      pointerType: 'touch',
      isPrimary: true,
      clientX: centerX,
      clientY: centerY,
      buttons: 1,
    });
    await joystick.dispatchEvent('pointermove', {
      pointerId: 71,
      pointerType: 'touch',
      isPrimary: true,
      clientX: centerX,
      clientY: centerY - 40,
      buttons: 1,
    });

    let interactionCursor = 0;
    try {
      const deadline = Date.now() + 35_000;
      while (Date.now() < deadline && !(await missionCompleteState(page, missionId))) {
        if (await page.getByTestId('field-interact-ready').isVisible().catch(() => false)) {
          expect(await readBeatIndex(page)).toBe(interactionBeats[interactionCursor]);
          await page.getByTestId('slice-touch-interact').tap();
          interactionCursor += 1;
          await page.waitForTimeout(250);
          continue;
        }

        await page.getByTestId('slice-touch-traversal').tap();
        await page.waitForTimeout(300);
      }
    } finally {
      await joystick.dispatchEvent('pointerup', {
        pointerId: 71,
        pointerType: 'touch',
        isPrimary: true,
        clientX: centerX,
        clientY: centerY - 40,
        buttons: 0,
      });
    }

    expect(interactionCursor).toBe(interactionBeats.length);

    await expect.poll(async () => page.evaluate(() => {
      const state = (window as any).runnerStore?.getState?.();
      return {
        gameState: state?.gameState,
        completed: state?.completedStoryMissionIds ?? [],
      };
    }), {
      timeout: 8_000,
      intervals: [75, 100, 150, 250],
    }).toEqual({
      gameState: 'mission-complete',
      completed: [missionId],
    });

    expect(errors, `Unexpected Ironvein touch runtime errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
