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
  /THREE\.GLTFLoader: Couldn't load texture blob:http:\/\/localhost:\d+\//i,
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
  const [position, beat, health, energy, nearestDistance, enemyCount, enemyHealth, behavior, attacking, dodging] = await Promise.all([
    readPosition(page),
    readBeat(page),
    readNumber(page, 'slice-player-health'),
    readNumber(page, 'slice-energy'),
    readNumber(page, 'slice-nearest-enemy-distance'),
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
    nearestDistance,
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
      timeout: hero === 'kai' ? 20_000 : 14_000,
      intervals: [150, 200, 250, 400],
    }).toBeGreaterThan(-5);

    await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
      timeout: 5_000,
      intervals: [100, 150, 200, 300],
    }).toContain('encounter');
  } finally {
    await page.keyboard.up('w');
  }

  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [100, 150, 200],
  }).toBe('ashblock-first-ambush');

  await expect.poll(async () => readNumber(page, 'slice-enemy-count'), {
    timeout: 3_000,
    intervals: [100, 150, 200],
  }).toBe(2);
}


async function waitForPlayerRecovery(page: Page, hero: 'kai' | 'jax', context: string) {
  const downText = await page.getByTestId('slice-player-down').innerText();
  if (downText.includes('NO')) return;

  await expect.poll(async () => page.getByTestId('slice-player-down').innerText(), {
    timeout: 12_000,
    intervals: [100, 150, 200, 300, 500],
    message: `${hero} did not recover from knockdown during ${context}`,
  }).toContain('NO');

  await expect.poll(async () => readNumber(page, 'slice-player-health'), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBeGreaterThan(0);
}

async function retreatAndRecharge(page: Page, hero: 'kai' | 'jax') {
  const requiredEnergy = hero === 'kai' ? 80 : 75;
  const dodgeCost = hero === 'kai' ? 20 : 18;
  const deadline = Date.now() + 18_000;

  const [initialEnemyCount, initialDistance] = await Promise.all([
    readNumber(page, 'slice-enemy-count'),
    readNumber(page, 'slice-nearest-enemy-distance'),
  ]);

  // Multi-enemy pressure still uses defensive backpedal. Once Jax has reduced
  // the beat to one live Fang, retreating during recharge only creates a costly
  // re-approach loop—especially after storm knockback pushes that target away.
  // Hold ground, let the lone Fang chase back into range, and use the real
  // WINDUP-triggered dodge path for defense.
  const shouldBackpedal = !(
    hero === 'jax'
    && initialEnemyCount === 1
  );

  if (shouldBackpedal) {
    await page.keyboard.down('Shift');
    await page.keyboard.down('s');
  }

  try {
    while (Date.now() < deadline) {
      const [downText, energy, nearestDistance, behaviorText, attackingText, dodgingText] = await Promise.all([
        page.getByTestId('slice-player-down').innerText(),
        readNumber(page, 'slice-energy'),
        readNumber(page, 'slice-nearest-enemy-distance'),
        page.getByTestId('slice-fang-behavior').innerText(),
        page.getByTestId('slice-attacking').innerText(),
        page.getByTestId('slice-dodging').innerText(),
      ]);

      if (!downText.includes('NO')) {
        if (shouldBackpedal) {
          await page.keyboard.up('s');
          await page.keyboard.up('Shift');
        }
        await waitForPlayerRecovery(page, hero, 'recharge');
        if (shouldBackpedal) {
          await page.keyboard.down('Shift');
          await page.keyboard.down('s');
        }
        continue;
      }

      if (energy >= requiredEnergy && attackingText.includes('NO') && dodgingText.includes('NO')) {
        return;
      }

      if (
        nearestDistance <= 4.5
        && behaviorText.includes('WINDUP')
        && energy >= dodgeCost
        && attackingText.includes('NO')
        && dodgingText.includes('NO')
      ) {
        if (shouldBackpedal) {
          await page.keyboard.up('s');
          await page.keyboard.up('Shift');
        }
        await dodgeIncomingVolley(page, hero);
        if (shouldBackpedal) {
          await page.keyboard.down('Shift');
          await page.keyboard.down('s');
        }
      }

      await page.waitForTimeout(100);
    }

    const [finalDown, finalEnergy, finalAttacking, finalDodging] = await Promise.all([
      page.getByTestId('slice-player-down').innerText(),
      readNumber(page, 'slice-energy'),
      page.getByTestId('slice-attacking').innerText(),
      page.getByTestId('slice-dodging').innerText(),
    ]);
    if (
      finalDown.includes('NO')
      && finalEnergy >= requiredEnergy
      && finalAttacking.includes('NO')
      && finalDodging.includes('NO')
    ) {
      return;
    }

    await logCombatSnapshot(page, `${hero}:recharge-deadline`);
    throw new Error(`${hero} did not reach authored ultimate readiness during recharge`);
  } finally {
    if (shouldBackpedal) {
      await page.keyboard.up('s');
      await page.keyboard.up('Shift');
    }
  }
}

async function moveTowardWorldPoint(
  page: Page,
  hero: 'kai' | 'jax',
  targetX: number,
  targetZ: number,
  targetRadius: number,
  timeoutMs: number,
  context: string,
  stopWhenNearestWithin?: number,
) {
  const deadline = Date.now() + timeoutMs;
  const keys = ['w', 'a', 's', 'd'] as const;
  let preferredKey: (typeof keys)[number] | null = null;

  const distanceToTarget = async () => {
    const [x, , z] = await readPosition(page);
    return Math.hypot(x - targetX, z - targetZ);
  };

  while (Date.now() < deadline) {
    await waitForPlayerRecovery(page, hero, context);

    if (
      stopWhenNearestWithin !== undefined
      && (await readNumber(page, 'slice-enemy-count')) > 0
      && (await readNumber(page, 'slice-nearest-enemy-distance')) <= stopWhenNearestWithin
    ) {
      return;
    }

    let distance = await distanceToTarget();
    if (distance <= targetRadius) return;

    const orderedKeys = preferredKey
      ? [preferredKey, ...keys.filter((key) => key !== preferredKey)]
      : [...keys];

    let improved = false;
    for (const key of orderedKeys) {
      const before = await distanceToTarget();

      await page.keyboard.down('Shift');
      await page.keyboard.down(key);
      try {
        await page.waitForTimeout(preferredKey === key ? 420 : 220);
      } finally {
        await page.keyboard.up(key);
        await page.keyboard.up('Shift');
      }

      await waitForPlayerRecovery(page, hero, context);

      if (
        stopWhenNearestWithin !== undefined
        && (await readNumber(page, 'slice-enemy-count')) > 0
        && (await readNumber(page, 'slice-nearest-enemy-distance')) <= stopWhenNearestWithin
      ) {
        return;
      }

      const after = await distanceToTarget();
      if (after <= targetRadius) return;

      if (after < before - 0.1) {
        preferredKey = key;
        improved = true;

        // Jax has a real, collision-aware 6-unit ground displacement. Once a
        // movement direction is empirically proven to reduce world-target
        // distance, use that authored traversal burst to escape long off-axis
        // detours instead of spending many sparse frames walking.
        if (hero === 'jax' && after - targetRadius > 4) {
          await page.keyboard.down(key);
          try {
            await page.keyboard.press('e');
            await page.waitForTimeout(450);
          } finally {
            await page.keyboard.up(key);
          }

          if (
            stopWhenNearestWithin !== undefined
            && (await readNumber(page, 'slice-enemy-count')) > 0
            && (await readNumber(page, 'slice-nearest-enemy-distance')) <= stopWhenNearestWithin
          ) {
            return;
          }
        }
        break;
      }

      if (preferredKey === key) preferredKey = null;
    }

    if (!improved) {
      await page.waitForTimeout(100);
    }
  }

  await logCombatSnapshot(page, `${hero}:${context}-world-target-not-reached`);
  throw new Error(`${hero} could not reach ${context} world target`);
}

function combatBeatAnchor(beat: string): readonly [number, number] {
  switch (beat) {
    case 'ashblock-first-ambush':
      return [0, 2.75] as const;
    case 'ashblock-combination-fight':
      return [0, 5.7] as const;
    case 'ashblock-district-lieutenant':
      return [-2.5, 8] as const;
    default:
      return [0, 5] as const;
  }
}

async function closeIntoUltimateEnvelope(page: Page, hero: 'kai' | 'jax') {
  const maximumAttackRange = hero === 'kai' ? 8.5 : 5.0;
  const beat = await readBeat(page);
  const [targetX, targetZ] = combatBeatAnchor(beat);

  if (await readNumber(page, 'slice-enemy-count') === 0) return;
  await waitForPlayerRecovery(page, hero, 'ultimate spacing');

  let distance = await readNumber(page, 'slice-nearest-enemy-distance');
  if (distance <= maximumAttackRange) return;

  // Navigate toward the authored encounter anchor using measured world-space
  // progress. This avoids assuming camera-forward points toward an enemy and
  // avoids using a moving nearest-enemy distance as the steering signal.
  try {
    await moveTowardWorldPoint(
      page,
      hero,
      targetX,
      targetZ,
      hero === 'kai' ? 7.0 : 4.0,
      18_000,
      'ultimate-approach',
      maximumAttackRange,
    );
  } catch (error) {
    // The encounter anchor is a steering aid, not the attack authority. If
    // moving toward it already brought the actual nearest live Fang inside the
    // authored ultimate radius, the real combat condition has been satisfied.
    if (await readNumber(page, 'slice-nearest-enemy-distance') <= maximumAttackRange) {
      return;
    }
    throw error;
  }

  if (await readNumber(page, 'slice-enemy-count') === 0) return;

  await expect.poll(async () => readNumber(page, 'slice-nearest-enemy-distance'), {
    timeout: 8_000,
    intervals: [75, 100, 150, 200],
  }).toBeLessThanOrEqual(maximumAttackRange);
}

async function dodgeIncomingVolley(page: Page, hero: 'kai' | 'jax', triggerDistance = 4.5) {
  const [nearestDistance, behaviorText] = await Promise.all([
    readNumber(page, 'slice-nearest-enemy-distance'),
    page.getByTestId('slice-fang-behavior').innerText(),
  ]);
  if (nearestDistance > triggerDistance || !behaviorText.includes('WINDUP')) return;

  const dodgeCost = hero === 'kai' ? 20 : 18;

  await waitForPlayerRecovery(page, hero, 'dodge preparation');

  await expect.poll(async () => page.getByTestId('slice-attacking').innerText(), {
    timeout: 4_000,
    intervals: [50, 75, 100, 150],
  }).toContain('NO');

  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 5_000,
    intervals: [50, 75, 100, 150],
  }).toBeGreaterThanOrEqual(dodgeCost);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const beforeEnergy = await readNumber(page, 'slice-energy');
    const beforePosition = await readPosition(page);
    let minimumEnergy = beforeEnergy;

    await page.keyboard.up('q').catch(() => undefined);
    await page.waitForTimeout(60);
    await page.keyboard.down('q');
    try {
      await page.waitForTimeout(180);
    } finally {
      await page.keyboard.up('q');
    }

    try {
      await expect.poll(async () => {
        const [energy, dodgingText, position] = await Promise.all([
          readNumber(page, 'slice-energy'),
          page.getByTestId('slice-dodging').innerText(),
          readPosition(page),
        ]);
        minimumEnergy = Math.min(minimumEnergy, energy);
        const displacement = Math.hypot(
          position[0] - beforePosition[0],
          position[2] - beforePosition[2],
        );
        return dodgingText.includes('YES')
          || minimumEnergy < beforeEnergy
          || displacement >= 2.5;
      }, {
        timeout: 4_000,
        intervals: [50, 75, 100, 150, 200],
      }).toBe(true);

      await expect.poll(async () => page.getByTestId('slice-dodging').innerText(), {
        timeout: 4_000,
        intervals: [50, 75, 100, 150],
      }).toContain('NO');

      await waitForPlayerRecovery(page, hero, 'post-dodge');
      return;
    } catch {
      await waitForPlayerRecovery(page, hero, `dodge attempt ${attempt + 1}`);
    }
  }

  await logCombatSnapshot(page, `${hero}:dodge-not-accepted-after-fresh-edges`);
  throw new Error(`${hero} dodge was not accepted after three real input edges`);
}

async function waitForUltimateReadiness(page: Page, hero: 'kai' | 'jax'): Promise<boolean> {
  const requiredEnergy = hero === 'kai' ? 80 : 75;
  await page.keyboard.up('i').catch(() => undefined);

  await waitForPlayerRecovery(page, hero, 'ultimate readiness');

  if (hero === 'kai') {
    await expect.poll(async () => page.getByTestId('slice-webzip').innerText(), {
      timeout: 2_000,
      intervals: [50, 75, 100],
    }).toContain('NO');
  }

  await expect.poll(async () => page.getByTestId('slice-attacking').innerText(), {
    timeout: 4_000,
    intervals: [50, 75, 100, 150],
  }).toContain('NO');

  await expect.poll(async () => page.getByTestId('slice-dodging').innerText(), {
    timeout: 4_000,
    intervals: [50, 75, 100, 150],
  }).toContain('NO');

  await expect.poll(async () => readNumber(page, 'slice-energy'), {
    timeout: 10_000,
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

  let deadline = Date.now() + (hero === 'kai' ? 2_400 : 1_800);
  while (Date.now() < deadline) {
    const total = await readNumber(page, 'slice-total-enemy-health');
    const count = await readNumber(page, 'slice-enemy-count');
    if (total < beforeTotal || count < beforeCount) {
      await waitForPlayerRecovery(page, hero, 'successful ultimate');
      return true;
    }

    if ((await page.getByTestId('slice-player-down').innerText()).includes('YES')) {
      await logCombatSnapshot(page, `${hero}:player-down-during-ultimate`);
      const recoveryStarted = Date.now();
      await waitForPlayerRecovery(page, hero, 'ultimate resolution');
      deadline += Date.now() - recoveryStarted;
    }

    await page.waitForTimeout(75);
  }

  await logCombatSnapshot(page, `${hero}:legitimate-ultimate-miss`);
  await waitForPlayerRecovery(page, hero, 'ultimate miss');
  return false;
}

async function clearCombatBeat(page: Page, hero: 'kai' | 'jax', expectedBeat: string, maxAttempts: number) {
  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toBe(expectedBeat);

  let attempts = 0;
  let successfulHits = 0;
  while (attempts < maxAttempts) {
    const [beat, enemyCount] = await Promise.all([
      readBeat(page),
      readNumber(page, 'slice-enemy-count'),
    ]);
    // Beat transitions can synchronously spawn the next wave. Never let one
    // clear helper spill into the next encounter just because enemyCount became
    // nonzero again on the transition frame.
    if (beat !== expectedBeat || enemyCount === 0) break;

    attempts += 1;
    await retreatAndRecharge(page, hero);
    if (await readBeat(page) !== expectedBeat) break;
    if (await readNumber(page, 'slice-enemy-count') === 0) break;

    // A Fang can enter melee while energy is recharging. Defend before the
    // readiness poll so the chain never spends that window standing still.
    await dodgeIncomingVolley(page, hero);
    if (await readBeat(page) !== expectedBeat) break;
    if (await readNumber(page, 'slice-enemy-count') === 0) break;

    if (!(await waitForUltimateReadiness(page, hero))) break;
    if (await readBeat(page) !== expectedBeat) break;

    await closeIntoUltimateEnvelope(page, hero);
    if (await readBeat(page) !== expectedBeat) break;
    if (await readNumber(page, 'slice-enemy-count') === 0) break;

    // Spacing may require a real dodge, which spends energy. Revalidate the
    // authored resource/lifecycle contract before firing.
    if (!(await waitForUltimateReadiness(page, hero))) break;

    if (await ultimateAndObserveAggregateDamage(page, hero, true)) successfulHits += 1;
  }

  expect(
    successfulHits,
    `${hero} must land at least one real scene-hitbox attack during ${expectedBeat}`,
  ).toBeGreaterThan(0);
  const [finalBeat, finalEnemyCount] = await Promise.all([
    readBeat(page),
    readNumber(page, 'slice-enemy-count'),
  ]);
  expect(
    finalBeat !== expectedBeat || finalEnemyCount === 0,
    `${hero} must clear ${expectedBeat} through real accepted attacks without spilling into the next beat`,
  ).toBe(true);
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
  await clearCombatBeat(page, hero, 'ashblock-first-ambush', hero === 'kai' ? 15 : 20);
  await advanceRecoveryIntoCombinationFight(page);
  await clearCombatBeat(page, hero, 'ashblock-combination-fight', hero === 'kai' ? 20 : 30);

  await expect.poll(async () => readBeat(page), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-district-lieutenant');
  await expect(page.getByTestId('slice-lieutenant')).toContainText('YES');

  await clearCombatBeat(page, hero, 'ashblock-district-lieutenant', hero === 'kai' ? 20 : 30);

  await expect.poll(async () => page.getByTestId('slice-stage').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('memory-trace');
  await expect.poll(async () => readBeat(page), {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBe('ashblock-memory-trace');
}

async function activateMemoryTrace(page: Page, hero: 'kai' | 'jax') {
  // Memory Trace is fixed at world-space (0, 5). Combat can finish far off-axis,
  // so navigate by measured world distance rather than assuming W is sufficient.
  await moveTowardWorldPoint(
    page,
    hero,
    0,
    5,
    1.75,
    18_000,
    'memory-trace-approach',
  );

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
  await expect(page.getByTestId('memory-echo-overlay')).toBeVisible();
  await expect(page.getByTestId('memory-echo-boryn')).toContainText('Boryn');
  await expect(page.getByTestId('memory-echo-ulgorr')).toContainText('Ulgorr');
}

async function extractAndVerifyPersistence(page: Page, hero: 'kai' | 'jax') {
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
    // Jax can reach the extraction gate with his real collision-aware ground
    // displacement instead of spending the last seconds of the global chain
    // slow-walking under software WebGL. Keep W held so E resolves forward.
    if (hero === 'jax') {
      await page.keyboard.press('e');
    }

    await expect.poll(async () => {
      const z = (await readPosition(page))[2];
      if (hero === 'jax' && z <= 13.5) {
        const mode = await page.getByTestId('slice-mode').innerText();
        if (!mode.includes('DISPLACEMENT')) {
          await page.keyboard.press('e');
        }
      }
      return z;
    }, {
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
  await activateMemoryTrace(page, hero);
  await extractAndVerifyPersistence(page, hero);
  expect(errors, `Unexpected ${hero} full-chain errors:\n${errors.join('\n')}`).toEqual([]);
}

test('Ashblock Phase 5.5 full completion chain persists exactly once for Kai', async ({ page }) => {
  test.setTimeout(300_000);
  await runFullAshblockChain(page, 'kai');
});

test('Ashblock Phase 5.5 full completion chain persists exactly once for Jax', async ({ page }) => {
  // Jax's authored 5-unit ultimate and 75-energy cycle require materially more
  // combat iterations than Kai under software WebGL. The per-step assertions
  // remain bounded; this only prevents the global Playwright budget from
  // terminating a chain that is still making verified forward progress.
  test.setTimeout(720_000);
  await runFullAshblockChain(page, 'jax');
});
