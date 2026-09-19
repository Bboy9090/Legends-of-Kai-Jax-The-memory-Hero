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

async function readBeat(page: Page): Promise<string> {
  const text = await page.getByTestId('slice-beat').innerText();
  return text.replace(/^Beat:\s*/, '').trim();
}

async function logCombatSnapshot(page: Page, label: string) {
  const [position, beat, health, energy, enemyCount, enemyHealth, behavior, attacking, dodging] = await Promise.all([
    readPosition(page),
    readBeat(page),
    readNumber(page, 'slice-player-health'),
    readNumber(page, 'slice-energy'),
    readNumber(page, 'slice-enemy-count'),
    readNumber(page, 'slice-total-enemy-health'),
    page.getByTestId('slice-fang-behavior').innerText(),
    page.getByTestId('slice-attacking').innerText(),
    page.getByTestId('slice-dodging').innerText(),
  ]);
  console.log('[combat-proof]', JSON.stringify({
    label,
    beat,
    position,
    health,
    energy,
    enemyCount,
    enemyHealth,
    behavior,
    attacking,
    dodging,
  }));
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

  await expect.poll(async () => readBeat(page), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-first-ambush');

  await expect.poll(async () => readNumber(page, 'slice-enemy-count'), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBe(2);
}

async function retreatAndRecharge(page: Page, hero: 'kai' | 'jax') {
  // Full energy funds one real defensive dodge followed by the authored ultimate.
  const requiredEnergy = 100;
  await page.keyboard.down('s');
  try {
    await expect.poll(async () => readNumber(page, 'slice-energy'), {
      timeout: 12_000,
      intervals: [100, 150, 200, 250],
    }).toBeGreaterThanOrEqual(requiredEnergy);
  } finally {
    await page.keyboard.up('s');
  }
}

async function closeIntoUltimateEnvelope(page: Page, hero: 'kai' | 'jax') {
  const ultimateRadiusMargin = hero === 'kai' ? 9 : 4.5;

  // Kai's authored ultimate already has a broad 10-unit scene radius, so letting
  // the encounter close naturally avoids unnecessary traversal churn.
  if (hero === 'kai') {
    await expect.poll(async () => {
      const downStatus = await page.getByTestId('slice-player-down').innerText();
      if (!downStatus.includes('NO')) {
        await logCombatSnapshot(page, `${hero}:player-down-before-ultimate-envelope`);
        throw new Error('Player was knocked down before the ultimate envelope opened');
      }
      return readNumber(page, 'slice-nearest-enemy-distance');
    }, {
      timeout: 10_000,
      intervals: [40, 60, 80, 100],
    }).toBeLessThanOrEqual(ultimateRadiusMargin);

    return;
  }

  // Jax cannot safely idle outside his tighter 5-unit storm radius while Fang
  // wall-clock attack cadence continues under software WebGL. Close the gap with
  // his real movement/displacement controller instead of waiting to be hit.
  if (await readNumber(page, 'slice-nearest-enemy-distance') > ultimateRadiusMargin) {
    await page.keyboard.down('w');
    try {
      const initialDistance = await readNumber(page, 'slice-nearest-enemy-distance');
      if (initialDistance > ultimateRadiusMargin + 1.25) {
        await page.keyboard.press('e');
      }

      await expect.poll(async () => {
        const downStatus = await page.getByTestId('slice-player-down').innerText();
        if (!downStatus.includes('NO')) {
          await logCombatSnapshot(page, `${hero}:player-down-during-active-close`);
          throw new Error('Player was knocked down during the active ultimate close');
        }
        return readNumber(page, 'slice-nearest-enemy-distance');
      }, {
        timeout: 4_000,
        intervals: [40, 60, 80, 100],
      }).toBeLessThanOrEqual(ultimateRadiusMargin);
    } finally {
      await page.keyboard.up('w');
    }
  }

  await expect(page.getByTestId('slice-player-down')).toContainText('NO');
}

async function dodgeIncomingVolley(page: Page, hero: 'kai' | 'jax') {
  // Primary-Fang behavior is not aggregate encounter state. Use measured scene
  // geometry and dodge when the nearest living Fang enters a real melee envelope.
  await expect.poll(async () => {
    const downStatus = await page.getByTestId('slice-player-down').innerText();
    if (!downStatus.includes('NO')) {
      await logCombatSnapshot(page, `${hero}:player-down-before-dodge`);
      throw new Error('Player was knocked down before the defensive dodge');
    }
    return readNumber(page, 'slice-nearest-enemy-distance');
  }, {
    timeout: 10_000,
    intervals: [40, 60, 80, 100],
  // The debug HUD is rounded to hundredths while scene/controller updates occur
  // between Playwright samples. Trigger one sample early rather than fail on a
  // harmless 1.50/1.52 boundary oscillation.
  }).toBeLessThanOrEqual(1.6);

  const beforeDodgeEnergy = await readNumber(page, 'slice-energy');
  await page.keyboard.press('q');

  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 2_000,
    intervals: [40, 60, 80, 100],
  }).toBeLessThan(beforeDodgeEnergy - 5);

  await expect.poll(async () => page.getByTestId('slice-dodging').innerText(), {
    timeout: 3_000,
    intervals: [40, 60, 80, 100],
  }).toContain('NO');

  // Do not wait for another primary-Fang label: a different living Fang may
  // already be winding up. Prove the controller can fund the immediate ultimate.
  expect(await page.getByTestId('slice-player-down').innerText()).toContain('NO');
  expect(await page.getByTestId('slice-attacking').innerText()).toContain('NO');
  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 1_500,
    intervals: [40, 60, 80],
  }).toBeGreaterThanOrEqual(hero === 'kai' ? 80 : 75);
}

async function waitForUltimateReadiness(page: Page, hero: 'kai' | 'jax'): Promise<boolean> {
  const requiredEnergy = hero === 'kai' ? 80 : 75;
  await page.keyboard.up('i').catch(() => undefined);

  if (hero === 'kai') {
    await expect.poll(async () => page.getByTestId('slice-webzip').innerText(), {
      timeout: 2_000,
      intervals: [50, 75, 100],
    }).toContain('NO');
  }

  await expect.poll(async () => page.getByTestId('slice-attacking').innerText(), {
    timeout: 3_000,
    intervals: [50, 75, 100],
  }).toContain('NO');

  await expect.poll(async () => page.getByTestId('slice-dodging').innerText(), {
    timeout: 2_000,
    intervals: [50, 75, 100],
  }).toContain('NO');

  await expect.poll(async () => page.getByTestId('slice-player-down').innerText(), {
    timeout: 2_000,
    intervals: [50, 75, 100],
  }).toContain('NO');

  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 8_000,
    intervals: [75, 100, 150, 200],
  }).toBeGreaterThanOrEqual(requiredEnergy);

  return (await readNumber(page, 'slice-enemy-count')) > 0;
}

async function pulseUltimateAndObserveAcceptance(page: Page, beforeEnergy: number): Promise<boolean> {
  let minimumEnergy = beforeEnergy;

  await page.keyboard.up('i').catch(() => undefined);
  await page.waitForTimeout(75);
  await page.keyboard.down('i');
  try {
    await page.waitForTimeout(140);
  } finally {
    await page.keyboard.up('i');
  }

  try {
    await expect.poll(async () => {
      const [energy, attackingText] = await Promise.all([
        readNumber(page, 'slice-energy'),
        page.getByTestId('slice-attacking').innerText(),
      ]);
      minimumEnergy = Math.min(minimumEnergy, energy);
      return attackingText.includes('YES') || minimumEnergy <= beforeEnergy - 20;
    }, {
      timeout: 1_800,
      intervals: [40, 60, 80, 100],
    }).toBe(true);
    return true;
  } catch {
    return false;
  }
}

async function ultimateAndObserveAggregateDamage(
  page: Page,
  hero: 'kai' | 'jax',
  readinessAlreadyProven = false,
): Promise<boolean> {
  if (!readinessAlreadyProven && !(await waitForUltimateReadiness(page, hero))) return false;

  let beforeTotal = await readNumber(page, 'slice-total-enemy-health');
  let beforeCount = await readNumber(page, 'slice-enemy-count');
  let accepted = false;

  for (let attempt = 0; attempt < 3 && !accepted; attempt += 1) {
    if (!(readinessAlreadyProven && attempt === 0) &&
        !(await waitForUltimateReadiness(page, hero))) return false;

    beforeTotal = await readNumber(page, 'slice-total-enemy-health');
    beforeCount = await readNumber(page, 'slice-enemy-count');
    if (beforeCount === 0) return false;

    const beforeEnergy = await readNumber(page, 'slice-energy');
    accepted = await pulseUltimateAndObserveAcceptance(page, beforeEnergy);
    if (!accepted && attempt < 2) await page.waitForTimeout(125);
  }

  if (!accepted) {
    await logCombatSnapshot(page, `${hero}:ultimate-not-accepted-after-fresh-edges`);
    throw new Error(`${hero} ultimate was not accepted after three readiness-validated real input edges`);
  }

  const deadline = Date.now() + (hero === 'kai' ? 2_400 : 1_800);
  while (Date.now() < deadline) {
    const total = await readNumber(page, 'slice-total-enemy-health');
    const count = await readNumber(page, 'slice-enemy-count');
    if (total < beforeTotal || count < beforeCount) {
      await expect(page.getByTestId('slice-player-down')).toContainText('NO');
      return true;
    }
    if ((await page.getByTestId('slice-player-down').innerText()).includes('YES')) {
      await logCombatSnapshot(page, `${hero}:player-down-during-ultimate`);
      await expect(page.getByTestId('slice-player-down')).toContainText('NO');
    }
    await page.waitForTimeout(75);
  }

  await logCombatSnapshot(page, `${hero}:legitimate-ultimate-miss`);
  await expect(page.getByTestId('slice-player-down')).toContainText('NO');
  return false;
}

async function clearCombatBeat(page: Page, hero: 'kai' | 'jax', expectedBeat: string, maxAttempts: number) {
  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toBe(expectedBeat);

  let attempts = 0;
  let successfulHits = 0;
  while (await readNumber(page, 'slice-enemy-count') > 0 && attempts < maxAttempts) {
    attempts += 1;
    await retreatAndRecharge(page, hero);
    if (await readNumber(page, 'slice-enemy-count') === 0) break;

    await closeIntoUltimateEnvelope(page, hero);
    if (await readNumber(page, 'slice-enemy-count') === 0) break;

    // Enter the attack from a real dodge and dispatch while the controller's
    // invulnerability window is still active. Waiting for dodge animation/timer
    // completion let multiple Fangs resolve attacks during ultimate startup.
    const beforeDodgeEnergy = await readNumber(page, 'slice-energy');
    await page.keyboard.press('q');
    await expect.poll(async () => readNumber(page, 'slice-energy'), {
      timeout: 2_000,
      intervals: [40, 60, 80, 100],
    }).toBeLessThan(beforeDodgeEnergy - 5);
    await expect(page.getByTestId('slice-player-down')).toContainText('NO');

    // Dodge itself can shift the range sample. Re-prove the authored envelope,
    // then use the same controller-readiness authority as every fresh ultimate
    // edge. Do not impose a second, shorter animation timeout here: under slow
    // software-WebGL a legitimate dodge/attack lifecycle can outlive one second.
    await closeIntoUltimateEnvelope(page, hero);
    if (!(await waitForUltimateReadiness(page, hero))) break;

    if (await ultimateAndObserveAggregateDamage(page, hero, true)) successfulHits += 1;
  }

  expect(
    successfulHits,
    `${hero} must land at least one real scene-hitbox attack during ${expectedBeat}`,
  ).toBeGreaterThan(0);
  expect(
    await readNumber(page, 'slice-enemy-count'),
    `${hero} must clear ${expectedBeat} through real accepted attacks`,
  ).toBe(0);
}

async function advanceRecoveryIntoCombinationFight(page: Page) {
  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-recovery-corridor');

  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await readPosition(page))[2], {
      timeout: 15_000,
      intervals: [100, 150, 200, 250],
    }).toBeGreaterThan(3.5);

    await expect.poll(async () => readBeat(page), {
      timeout: 3_000,
      intervals: [75, 100, 150],
    }).toBe('ashblock-combination-fight');
  } finally {
    await page.keyboard.up('w');
  }

  await expect.poll(async () => readNumber(page, 'slice-enemy-count'), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBe(3);
}

async function defeatPhase55FangSequence(page: Page, hero: 'kai' | 'jax') {
  await clearCombatBeat(page, hero, 'ashblock-first-ambush', hero === 'kai' ? 6 : 8);
  await advanceRecoveryIntoCombinationFight(page);
  await clearCombatBeat(page, hero, 'ashblock-combination-fight', hero === 'kai' ? 8 : 14);

  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-district-lieutenant');
  await expect(page.getByTestId('slice-lieutenant')).toContainText('YES');

  await clearCombatBeat(page, hero, 'ashblock-district-lieutenant', hero === 'kai' ? 9 : 16);

  await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('memory-trace');
  await expect.poll(async () => readBeat(page), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-memory-trace');
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
    timeout: 3_000,
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
  await defeatPhase55FangSequence(page, hero);
  await activateMemoryTrace(page);
  await extractAndVerifyPersistence(page);
  expect(errors, `Unexpected ${hero} full-chain errors:\n${errors.join('\n')}`).toEqual([]);
}

test('Ashblock Phase 5.5 full completion chain persists exactly once for Kai', async ({ page }) => {
  test.setTimeout(300_000);
  await runFullAshblockChain(page, 'kai');
});

test('Ashblock Phase 5.5 full completion chain persists exactly once for Jax', async ({ page }) => {
  test.setTimeout(360_000);
  await runFullAshblockChain(page, 'jax');
});
