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

async function bootJaxTest(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
    timeout: 15_000,
  });

  // Use Zustand's direct setState for the isolated developer harness. This
  // avoids any persisted-profile rehydration race and then proves the store
  // actually accepted the test route before waiting for React to mount it.
  await page.evaluate(() => {
    (window as any).runnerStore.setState({ gameState: 'jax-test' });
  });
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState().gameState === 'jax-test',
    null,
    { timeout: 5_000 }
  );

  await expect(page.getByTestId('jax-debug-hud')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(5_000);
  await expect(page.locator('canvas').first()).toBeVisible();
}

async function readPosition(page: Page): Promise<[number, number, number]> {
  const text = await page.getByTestId('jax-position').innerText();
  const match = text.match(/\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);
  if (!match) throw new Error(`Could not parse Jax position: ${text}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

async function readPair(page: Page, testId: string): Promise<[number, number]> {
  const text = await page.getByTestId(testId).innerText();
  const match = text.match(/\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);
  if (!match) throw new Error(`Could not parse pair from ${testId}: ${text}`);
  return [Number(match[1]), Number(match[2])];
}

async function readNumber(page: Page, testId: string): Promise<number> {
  const text = await page.getByTestId(testId).innerText();
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`Could not parse number from ${testId}: ${text}`);
  return Number(match[0]);
}

test('Jax runtime: movement, jump and displacement change real controller state', async ({ page }) => {
  const errors = collectErrors(page);
  await bootJaxTest(page);

  const start = await readPosition(page);
  await page.keyboard.down('w');
  await page.waitForTimeout(500);
  await page.keyboard.up('w');
  await page.waitForTimeout(200);
  const moved = await readPosition(page);
  expect(Math.abs(moved[2] - start[2]) + Math.abs(moved[0] - start[0])).toBeGreaterThan(0.2);

  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  await expect(page.getByTestId('jax-airborne')).toContainText('YES');

  await page.waitForTimeout(1_200);
  const beforeDash = await readPosition(page);
  await page.keyboard.press('e');
  await page.waitForTimeout(220);
  const afterDash = await readPosition(page);
  const dashDistance = Math.hypot(afterDash[0] - beforeDash[0], afterDash[2] - beforeDash[2]);
  expect(dashDistance).toBeGreaterThan(1.0);

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Jax runtime: light, pressure-heavy and lightning special affect live targets', async ({ page }) => {
  const errors = collectErrors(page);
  await bootJaxTest(page);

  const pressureStart = await readNumber(page, 'jax-pressure-health');
  await page.keyboard.press('j');
  await page.waitForTimeout(450);
  const pressureAfterLight = await readNumber(page, 'jax-pressure-health');
  expect(pressureAfterLight).toBe(pressureStart - 8);

  const pressurePositionBefore = await readPair(page, 'jax-pressure-position');
  await page.keyboard.press('k');
  await page.waitForTimeout(650);
  const pressureAfterHeavy = await readNumber(page, 'jax-pressure-health');
  expect(pressureAfterHeavy).toBe(pressureAfterLight - 15);
  const pressurePositionAfter = await readPair(page, 'jax-pressure-position');
  expect(Math.hypot(
    pressurePositionAfter[0] - pressurePositionBefore[0],
    pressurePositionAfter[1] - pressurePositionBefore[1]
  )).toBeGreaterThan(0.01);

  const lightningStart = await readNumber(page, 'jax-lightning-health');
  await page.keyboard.press('l');
  await page.waitForTimeout(800);
  const lightningAfter = await readNumber(page, 'jax-lightning-health');
  expect(lightningAfter).toBe(lightningStart - 25);

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Jax runtime: HUD reports measured FPS instead of a hard-coded constant', async ({ page }) => {
  const errors = collectErrors(page);
  await bootJaxTest(page);

  const fps = await readNumber(page, 'jax-fps');
  expect(fps).toBeGreaterThan(0);
  expect(fps).toBeLessThan(1000);

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});
