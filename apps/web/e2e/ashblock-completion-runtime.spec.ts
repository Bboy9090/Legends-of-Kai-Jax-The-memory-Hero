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

async function closeIntoUltimateRange(page: Page) {
  // A resolved Fang hit proves the shared enemy really reached the controller-owned
  // hero. RECOVERY is stable proof the Fang entered its <=1.8 attack envelope,
  // comfortably inside Kai ultimate radius 10 and Jax ultimate radius 5.
  await expect.poll(async () => readNumber(page, 'slice-player-health'), {
    timeout: 7_000,
    intervals: [100, 150, 200, 250],
  }).toBeLessThan(100);

  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('RECOVERY');
}

async function waitForUltimateReady(page: Page, hero: 'kai' | 'jax') {
  const requiredEnergy = hero === 'kai' ? 80 : 75;
  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 12_000,
    intervals: [100, 150, 200, 250],
  }).toBeGreaterThanOrEqual(requiredEnergy);

  // Do not synchronize on the transient 0.35s WINDUP alone: bounded AI catch-up
  // can consume it inside one slow headless frame. Either state below proves the
  // Fang is in the <=1.8 melee envelope before the wide-radius ultimate starts.
  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 12_000,
    intervals: [50, 75, 100, 150],
  }).toMatch(/WINDUP|RECOVERY/);
}

async function ultimateAndWaitForDamage(
  page: Page,
  hero: 'kai' | 'jax',
  beforeHealth: number,
): Promise<number> {
  const beforeEnergy = await readNumber(page, 'slice-energy');
  await page.keyboard.down('i');
  try {
    // KeyI is the canonical keyboard ultimate input. A substantial energy drop is
    // controller-level proof that the real hero controller accepted the attack.
    await expect.poll(async () => readNumber(page, 'slice-energy'), {
      timeout: 3_000,
      intervals: [50, 75, 100, 150],
    }).toBeLessThan(beforeEnergy - 20);

    // Keep the key held across the authored ACTIVE window. Both attack systems
    // independently preserve sparse-frame crossings, so this is not a fake hit.
    await page.waitForTimeout(hero === 'kai' ? 1_650 : 900);
  } finally {
    await page.keyboard.up('i');
  }

  let afterHealth = beforeHealth;
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    afterHealth = await readNumber(page, 'slice-fang-health');
    if (afterHealth < beforeHealth) break;
    await page.waitForTimeout(100);
  }

  await page.waitForTimeout(hero === 'kai' ? 500 : 750);
  return afterHealth;
}

async function defeatFang(page: Page, hero: 'kai' | 'jax') {
  await closeIntoUltimateRange(page);

  // Full-chain responsibility is mission continuity and exactly-once persistence,
  // not repeated narrow-melee stress. Focused runtime lanes already certify Kai
  // heavy, Jax heavy, and Jax lightning-special live hitbox behavior. Here we keep
  // the combat transition real while using each hero's authored wide-radius ultimate.
  const maxAttempts = hero === 'kai' ? 2 : 5;
  const minimumSuccessfulHits = hero === 'kai' ? 1 : 3;

  let successfulHits = 0;
  let health = await readNumber(page, 'slice-fang-health');

  for (let attempt = 0; attempt < maxAttempts && health > 0; attempt += 1) {
    await waitForUltimateReady(page, hero);
    const nextHealth = await ultimateAndWaitForDamage(page, hero, health);
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
