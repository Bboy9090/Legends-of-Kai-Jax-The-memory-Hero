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
  // The vertical-slice harness renders developer proxy geometry rather than a
  // production GLTF character. Headless Chromium can emit transient failures
  // for blob-backed GLTF textures imported elsewhere in the dev bundle during
  // navigation/reload. Production-preview/model-rendering gates remain
  // responsible for real asset integrity; this runtime lane is scoped to the
  // live Kai/Jax controller and mission-state proof.
  /THREE\.GLTFLoader: Couldn't load texture blob:http:\/\/localhost:3000\//i,
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

test('Ashblock Kai slice uses the real Kai controller for camera-forward movement and Web Zip', async ({ page }) => {
  const errors = collectErrors(page);
  await bootSlice(page, 'kai', errors);

  const start = await readPosition(page);
  await page.keyboard.down('w');
  await page.waitForTimeout(450);
  await page.keyboard.up('w');
  await page.waitForTimeout(150);
  const moved = await readPosition(page);

  expect(moved[2], 'W should move Kai camera-forward along the Ashblock route').toBeGreaterThan(start[2] + 0.2);

  // Fresh start is close enough to the first real Web Zip anchor; reload so the wall approach cannot interfere.
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
  const errors = collectErrors(page);
  await bootSlice(page, 'kai', errors);

  const start = await readPosition(page);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');

  await expect.poll(async () => (await page.getByTestId('slice-wall').innerText()), {
    timeout: 3_000,
    intervals: [100, 150, 200],
  }).toContain('YES');

  // Entering WALL mode occurs one frame before the first constrained climb step.
  // Poll the controller-owned Y position so this proves actual vertical movement
  // instead of racing the attach frame.
  await expect.poll(async () => (await readPosition(page))[1], {
    timeout: 2_000,
    intervals: [75, 100, 150],
  }).toBeGreaterThan(start[1] + 0.05);

  await page.keyboard.up('w');
  await page.keyboard.up('Shift');

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
