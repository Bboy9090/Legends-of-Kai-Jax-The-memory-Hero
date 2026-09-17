import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

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
  // The isolated slice renders developer proxy geometry, while the shared
  // fighter registry can still initialize GLTF resources in headless Chromium.
  // Blob-texture decode failures from that non-authoritative model path do not
  // invalidate controller/mission runtime proof. Other GLTF errors stay fatal.
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
      `${hero.toUpperCase()} vertical slice failed to mount at ${page.url()} (HTTP ${response?.status() ?? 'unknown'}).`,
      `Root HTML: ${rootHtml.slice(0, 2_000) || '<empty>'}`,
      `Browser errors: ${errors.join(' | ') || '<none captured>'}`,
      error instanceof Error ? error.message : String(error),
    ].join('\n'));
  }
  await page.waitForTimeout(700);
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
  // Use each hero's real traversal identity to shorten the opening route before
  // walking into the encounter gate. This keeps the proof on controller-owned
  // movement instead of introducing a test-only teleport or forced stage.
  if (hero === 'kai') {
    await page.keyboard.down('e');
    try {
      await expect(page.getByTestId('slice-webzip')).toContainText('YES', { timeout: 1_500 });
      // KaiController intentionally caps per-frame simulation delta. Headless
      // Chromium can therefore take more wall-clock time than the nominal zip.
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

test('Ashblock Kai slice uses the real Kai controller for camera-forward movement and Web Zip', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await bootSlice(page, 'kai', errors);

  const start = await readPosition(page);
  await page.keyboard.down('w');
  await page.waitForTimeout(450);
  await page.keyboard.up('w');
  await page.waitForTimeout(150);
  const moved = await readPosition(page);

  expect(moved[2], 'W should move Kai camera-forward along the Ashblock route').toBeGreaterThan(start[2] + 0.2);

  await page.reload();
  await bootSlice(page, 'kai', errors);
  const beforeZip = await readPosition(page);
  await page.keyboard.down('e');
  await expect(page.getByTestId('slice-webzip')).toContainText('YES', { timeout: 1_500 });
  await expect(page.getByTestId('slice-mode')).toContainText('WEB_ZIP', { timeout: 1_500 });
  await page.waitForTimeout(220);
  const duringZip = await readPosition(page);
  await page.keyboard.up('e');

  expect(Math.hypot(
    duringZip[0] - beforeZip[0],
    duringZip[1] - beforeZip[1],
    duringZip[2] - beforeZip[2],
  )).toBeGreaterThan(0.2);
  expect(errors, `Unexpected Kai slice errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Ashblock Kai slice reaches the real climbable wall with Shift+W', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await bootSlice(page, 'kai', errors);

  const start = await readPosition(page);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  try {
    await expect.poll(async () => page.getByTestId('slice-wall').innerText(), {
      timeout: 8_000,
      intervals: [100, 150, 200, 250],
    }).toContain('YES');

    await expect.poll(async () => (await readPosition(page))[1], {
      timeout: 3_000,
      intervals: [75, 100, 150, 200],
    }).toBeGreaterThan(start[1] + 0.05);
  } finally {
    await page.keyboard.up('w');
    await page.keyboard.up('Shift');
  }

  expect(errors, `Unexpected Kai wall errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Ashblock Jax slice uses the real Jax controller for movement and displacement', async ({ page }) => {
  const errors = collectErrors(page);
  await bootSlice(page, 'jax', errors);

  const start = await readPosition(page);
  await page.keyboard.down('w');
  await page.waitForTimeout(450);
  await page.keyboard.up('w');
  await page.waitForTimeout(150);
  const moved = await readPosition(page);
  expect(moved[2], 'W should move Jax camera-forward along the Ashblock route').toBeGreaterThan(start[2] + 0.2);

  const beforeDash = await readPosition(page);
  await page.keyboard.down('e');
  await expect(page.getByTestId('slice-mode')).toContainText('DISPLACEMENT', { timeout: 1_500 });
  await page.waitForTimeout(100);
  const duringDash = await readPosition(page);
  await page.keyboard.up('e');

  expect(Math.hypot(duringDash[0] - beforeDash[0], duringDash[2] - beforeDash[2])).toBeGreaterThan(0.5);
  expect(await readNumber(page, 'slice-fps')).toBeGreaterThan(0);
  expect(errors, `Unexpected Jax slice errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Ashblock Fang AI chases and damages Jax, while Jax heavy can damage the Fang', async ({ page }) => {
  const errors = collectErrors(page);
  await bootSlice(page, 'jax', errors);
  await enterEncounter(page, 'jax');

  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 4_000,
    intervals: [100, 150, 200],
  }).toMatch(/CHASE|WINDUP|RECOVERY/);

  await expect.poll(async () => readNumber(page, 'slice-player-health'), {
    timeout: 6_000,
    intervals: [150, 200, 250],
  }).toBeLessThan(100);

  const fangHealthBefore = await readNumber(page, 'slice-fang-health');
  await page.keyboard.press('k');
  await expect.poll(async () => readNumber(page, 'slice-fang-health'), {
    timeout: 2_500,
    intervals: [100, 150, 200],
  }).toBeLessThan(fangHealthBefore);

  expect(errors, `Unexpected Jax encounter errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Ashblock Kai accepted heavy resolves through KaiAttackSystem scene hitboxes', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await bootSlice(page, 'kai', errors);
  await enterEncounter(page, 'kai');

  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 4_000,
    intervals: [100, 150, 200],
  }).toMatch(/CHASE|WINDUP|RECOVERY/);

  await expect.poll(async () => readNumber(page, 'slice-player-health'), {
    timeout: 6_000,
    intervals: [100, 150, 200, 250],
  }).toBeLessThan(100);

  await expect.poll(async () => page.getByTestId('slice-fang-behavior').innerText(), {
    timeout: 3_000,
    intervals: [75, 100, 150],
  }).toContain('RECOVERY');

  // KaiAttackSystem's authored heavy radius is 1.2 units. Close farther than the
  // retired slice adapter required, using only KaiController-owned locomotion.
  const closeStart = await readPosition(page);
  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await readPosition(page))[2], {
      timeout: 8_000,
      intervals: [75, 100, 150, 200],
    }).toBeGreaterThan(closeStart[2] + 0.75);
  } finally {
    await page.keyboard.up('w');
  }

  const energyBefore = await readNumber(page, 'slice-energy');
  const fangHealthBefore = await readNumber(page, 'slice-fang-health');
  await page.keyboard.down('k');
  try {
    // Energy consumption proves KaiController accepted the input. With the direct
    // Ashblock adapter removed, subsequent Fang HP loss can only come through the
    // real KaiAttackSystem combat-target hitbox path.
    await expect.poll(async () => readNumber(page, 'slice-energy'), {
      timeout: 2_500,
      intervals: [50, 75, 100, 150],
    }).toBeLessThan(energyBefore);
  } finally {
    await page.keyboard.up('k');
  }

  await expect.poll(async () => readNumber(page, 'slice-fang-health'), {
    timeout: 5_000,
    intervals: [75, 100, 150, 200, 300],
  }).toBeLessThan(fangHealthBefore);

  expect(errors, `Unexpected Kai encounter errors:\n${errors.join('\n')}`).toEqual([]);
});
