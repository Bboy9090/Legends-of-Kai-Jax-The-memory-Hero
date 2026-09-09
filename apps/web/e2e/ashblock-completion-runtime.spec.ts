import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const MISSION_ID = 'vertical_slice_ashblock_heights';

const BENIGN_ERROR_PATTERNS = [
  /autoplay/i,
  /the play\(\) request/i,
  /sounds\/.*\.mp3/i,
  /favicon/i,
  /Failed to load resource.*(mp3|ogg|wav|png|jpg)/i,
  /WebGL.*deprecated/i,
  /SwiftShader/i,
  /Software WebGL/i,
  /THREE\.WebGLRenderer: Context Lost/i,
  /Failed to fetch/i,
  /net::ERR_/i,
  // The isolated slice renders developer proxy geometry. Shared registry GLTF
  // blob-texture decode failures do not invalidate controller/mission proof.
  /THREE\.GLTFLoader: Couldn't load texture blob:http:\/\/localhost:3000\//i,
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

async function bootSlice(page: Page, hero: 'kai' | 'jax', errors: string[]) {
  const response = await page.goto(`/?mode=vertical-slice-${hero}`);
  await expect(page.locator('body')).toBeVisible();
  try {
    await expect(page.getByTestId('vertical-slice-debug-hud')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('slice-hero')).toContainText(hero.toUpperCase());
    await expect(page.locator('canvas').first()).toBeVisible();
  } catch (error) {
    const rootHtml = await page.locator('#root').innerHTML().catch(() => '<missing #root>');
    throw new Error([
      `${hero.toUpperCase()} completion slice failed to mount at ${page.url()} (HTTP ${response?.status() ?? 'unknown'}).`,
      `Root HTML: ${rootHtml.slice(0, 2_000) || '<empty>'}`,
      `Browser errors: ${errors.join(' | ') || '<none captured>'}`,
      error instanceof Error ? error.message : String(error),
    ].join('\n'));
  }

  await page.evaluate((missionId) => {
    const runnerStore = (window as any).runnerStore;
    if (!runnerStore?.getState) throw new Error('runnerStore debug bridge is unavailable');
    runnerStore.getState().setActiveStoryMission(missionId);
  }, MISSION_ID);

  await expect.poll(async () => page.evaluate(() => {
    return (window as any).runnerStore?.getState?.().activeStoryMissionId ?? null;
  }), {
    timeout: 2_000,
    intervals: [50, 75, 100],
  }).toBe(MISSION_ID);

  await page.waitForTimeout(500);
}

async function readPosition(page: Page): Promise<[number, number, number]> {
  const text = await page.getByTestId('slice-position').innerText();
  const match = text.match(/\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);
  if (!match) throw new Error(`Could not parse vertical-slice position: ${text}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

async function readNumber(page: Page, testId: string): Promise<number> {
  const text = await page.getByTestId(testId).innerText();
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`Could not parse number from ${testId}: ${text}`);
  return Number(match[0]);
}

async function enterEncounter(page: Page, hero: 'kai' | 'jax') {
  if (hero === 'kai') {
    await page.keyboard.down('e');
    try {
      await expect(page.getByTestId('slice-webzip')).toContainText('YES', { timeout: 1_500 });
      await expect.poll(async () => (await readPosition(page))[2], {
        timeout: 8_000,
        intervals: [100, 150, 200, 250],
      }).toBeGreaterThan(-12);
    } finally {
      await page.keyboard.up('e');
    }

    await expect.poll(async () => page.getByTestId('slice-webzip').innerText(), {
      timeout: 2_000,
      intervals: [75, 100, 150],
    }).toContain('NO');
  } else {
    await page.keyboard.press('e');
    await expect(page.getByTestId('slice-mode')).toContainText('DISPLACEMENT', { timeout: 1_500 });
    await page.waitForTimeout(160);
  }

  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await readPosition(page))[2], {
      timeout: hero === 'kai' ? 20_000 : 8_000,
      intervals: [150, 200, 250, 400],
    }).toBeGreaterThan(-5);

    await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
      timeout: 2_000,
      intervals: [75, 100, 150],
    }).toContain('encounter');
  } finally {
    await page.keyboard.up('w');
  }
}

async function closeIntoMeleeRange(page: Page) {
  // A resolved Fang hit proves the shared enemy actually reached the player.
  await expect.poll(async () => readNumber(page, 'slice-player-health'), {
    timeout: 7_000,
    intervals: [100, 150, 200, 250],
  }).toBeLessThan(100);

  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('RECOVERY');

  // Fang recovery owns its spacing inside attackRange. The hero closes the final
  // gap using the real controller instead of any test-only position mutation.
  const start = await readPosition(page);
  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await readPosition(page))[2], {
      timeout: 8_000,
      intervals: [75, 100, 150, 200],
    }).toBeGreaterThan(start[2] + 0.55);
  } finally {
    await page.keyboard.up('w');
  }
}

async function attackAndWaitForDamage(
  page: Page,
  hero: 'kai' | 'jax',
  key: 'k' | 'l',
  beforeHealth: number,
  settleMs: number,
): Promise<number> {
  if (hero === 'jax') {
    // The full-chain path uses Jax's real lightning special (L): 45 authored
    // energy, 25 JaxAttackSystem damage, 3.5-unit radius, moderate knockback.
    // Pressure-heavy remains independently proven by vertical-slice-runtime.
    // Hold until the controller's real energy spend proves attack acceptance.
    const beforeEnergy = await readNumber(page, 'slice-energy');
    await page.keyboard.down(key);
    try {
      await expect.poll(async () => readNumber(page, 'slice-energy'), {
        timeout: 3_000,
        intervals: [50, 75, 100, 150],
      }).toBeLessThan(beforeEnergy - 10);

      // Maintain controller-owned forward pressure through the special's ACTIVE
      // window so residual Fang knockback cannot turn a valid melee start into a
      // stale-range sample. No target movement or health is changed by the test.
      await page.keyboard.down('w');
      try {
        await page.waitForTimeout(420);
      } finally {
        await page.keyboard.up('w');
      }
    } finally {
      await page.keyboard.up(key);
    }
  } else {
    await page.keyboard.down(key);
    await page.waitForTimeout(140);
    await page.keyboard.up(key);
  }

  let afterHealth = beforeHealth;
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    afterHealth = await readNumber(page, 'slice-fang-health');
    if (afterHealth < beforeHealth) break;
    await page.waitForTimeout(100);
  }

  await page.waitForTimeout(settleMs);
  return afterHealth;
}

async function waitForJaxSpecialReady(page: Page) {
  // Lightning special costs 45 energy. Readiness comes from the real controller
  // state; no test-side energy grant or fixed regeneration assumption.
  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 10_000,
    intervals: [100, 150, 200, 250],
  }).toBeGreaterThanOrEqual(45);

  // WINDUP/RECOVERY both confirm the deterministic Fang is within its authored
  // 1.8-unit melee range, safely inside the 3.5-unit special radius.
  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 8_000,
    intervals: [75, 100, 150, 200],
  }).toMatch(/WINDUP|RECOVERY/);
}

async function defeatFang(page: Page, hero: 'kai' | 'jax') {
  await closeIntoMeleeRange(page);

  // Kai keeps its accepted heavy path. Jax pressure-heavy is stress-proven by
  // the dedicated runtime smoke; the mission chain uses the real lightning
  // special so persistence is not coupled to seven narrow repeated heavy samples.
  const attackKey: 'k' | 'l' = hero === 'jax' ? 'l' : 'k';
  const maxAttempts = hero === 'kai' ? 6 : 8;
  const minimumSuccessfulHits = hero === 'kai' ? 3 : 4;
  const settleMs = hero === 'kai' ? 1_000 : 750;

  let successfulHits = 0;
  let health = await readNumber(page, 'slice-fang-health');

  for (let attempt = 0; attempt < maxAttempts && health > 0; attempt += 1) {
    if (hero === 'jax') {
      await waitForJaxSpecialReady(page);
    }

    const nextHealth = await attackAndWaitForDamage(page, hero, attackKey, health, settleMs);
    if (nextHealth < health) successfulHits += 1;
    health = nextHealth;
  }

  expect(successfulHits, `${hero} must defeat the Fang through real accepted attacks`).toBeGreaterThanOrEqual(minimumSuccessfulHits);
  expect(health, `${hero} must reduce the Fang to zero HP`).toBe(0);

  await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('memory-trace');
}

async function activateMemoryTrace(page: Page) {
  // Move to the neutral Memory Trace using controller-owned locomotion.
  const current = await readPosition(page);
  if (current[2] < 4.1) {
    await page.keyboard.down('w');
    try {
      await expect.poll(async () => (await readPosition(page))[2], {
        timeout: 15_000,
        intervals: [100, 150, 200, 250],
      }).toBeGreaterThan(4.1);
    } finally {
      await page.keyboard.up('w');
    }
  }

  await expect.poll(async () => {
    const [x, , z] = await readPosition(page);
    return Math.hypot(x, z - 5);
  }, {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBeLessThan(2);

  // F is the canonical interact input; use a held edge so slow headless frames
  // cannot miss the interaction.
  await page.keyboard.down('f');
  try {
    await expect.poll(async () => page.getByTestId('slice-memory').innerText(), {
      timeout: 2_500,
      intervals: [75, 100, 150],
    }).toContain('COMPLETE');
  } finally {
    await page.keyboard.up('f');
  }

  await expect(page.getByTestId('slice-extraction')).toContainText('OPEN');
  await expect(page.getByTestId('slice-stage')).toContainText('extraction');
}

async function extractAndVerifyPersistence(page: Page) {
  const before = await page.evaluate((missionId) => {
    const state = (window as any).runnerStore.getState();
    return {
      completionCount: state.completedStoryMissionIds.filter((id: string) => id === missionId).length,
      totalScore: state.totalScore,
      fusionUnlocked: state.kaiJaxFusionUnlocked,
    };
  }, MISSION_ID);

  expect(before.completionCount).toBe(0);
  expect(before.totalScore).toBe(0);
  expect(before.fusionUnlocked).toBe(false);

  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await readPosition(page))[2], {
      timeout: 20_000,
      intervals: [100, 150, 200, 300],
    }).toBeGreaterThan(15);

    await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
      timeout: 2_000,
      intervals: [75, 100, 150],
    }).toContain('complete');
  } finally {
    await page.keyboard.up('w');
  }

  await expect.poll(async () => page.evaluate((missionId) => {
    const ids = (window as any).runnerStore.getState().completedStoryMissionIds as string[];
    return ids.filter((id) => id === missionId).length;
  }, MISSION_ID), {
    timeout: 2_000,
    intervals: [50, 75, 100],
  }).toBe(1);

  const persisted = await page.evaluate((missionId) => {
    const raw = localStorage.getItem('kai-jax-save');
    if (!raw) return { count: 0, score: -1, fusion: true };
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? {};
    const ids = Array.isArray(state.completedStoryMissionIds) ? state.completedStoryMissionIds : [];
    return {
      count: ids.filter((id: string) => id === missionId).length,
      score: state.totalScore,
      fusion: state.kaiJaxFusionUnlocked,
    };
  }, MISSION_ID);

  expect(persisted.count).toBe(1);
  expect(persisted.score).toBe(0);
  expect(persisted.fusion).toBe(false);

  // Completion is frame-idempotent: remaining in the completed scene must not
  // append duplicate mission records.
  await page.waitForTimeout(600);
  const stableCount = await page.evaluate((missionId) => {
    const ids = (window as any).runnerStore.getState().completedStoryMissionIds as string[];
    return ids.filter((id) => id === missionId).length;
  }, MISSION_ID);
  expect(stableCount).toBe(1);
}

async function runFullAshblockChain(page: Page, hero: 'kai' | 'jax') {
  const errors = collectErrors(page);
  await bootSlice(page, hero, errors);
  await enterEncounter(page, hero);
  await defeatFang(page, hero);
  await activateMemoryTrace(page);
  await extractAndVerifyPersistence(page);
  expect(errors, `Unexpected ${hero} full-chain errors:\n${errors.join('\n')}`).toEqual([]);
}

test('Ashblock full completion chain persists exactly once for Kai', async ({ page }) => {
  test.setTimeout(120_000);
  await runFullAshblockChain(page, 'kai');
});

test('Ashblock full completion chain persists exactly once for Jax', async ({ page }) => {
  test.setTimeout(120_000);
  await runFullAshblockChain(page, 'jax');
});