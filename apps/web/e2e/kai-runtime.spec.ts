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

async function bootKaiTest(page: Page, errors: string[]) {
  const response = await page.goto('/?mode=kai-test');
  await expect(page.locator('body')).toBeVisible();

  try {
    await expect(page.getByTestId('kai-debug-hud')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('canvas').first()).toBeVisible();
  } catch (error) {
    const rootHtml = await page.locator('#root').innerHTML().catch(() => '<missing #root>');
    throw new Error([
      `Kai harness failed to mount at ${page.url()} (HTTP ${response?.status() ?? 'unknown'}).`,
      `Root HTML: ${rootHtml.slice(0, 2_000) || '<empty>'}`,
      `Browser errors: ${errors.join(' | ') || '<none captured>'}`,
      error instanceof Error ? error.message : String(error),
    ].join('\n'));
  }

  await page.waitForTimeout(1_000);
}

async function readPosition(page: Page): Promise<[number, number, number]> {
  const text = await page.getByTestId('kai-position').innerText();
  const match = text.match(/\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/);
  if (!match) throw new Error(`Could not parse Kai position: ${text}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

async function readNumber(page: Page, testId: string): Promise<number> {
  const text = await page.getByTestId(testId).innerText();
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`Could not parse number from ${testId}: ${text}`);
  return Number(match[0]);
}

test('Kai runtime: ground movement and held Web Zip change real controller state', async ({ page }) => {
  const errors = collectErrors(page);
  await bootKaiTest(page, errors);

  const start = await readPosition(page);
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');
  await page.waitForTimeout(150);
  const moved = await readPosition(page);
  expect(Math.hypot(moved[0] - start[0], moved[2] - start[2])).toBeGreaterThan(0.2);

  const beforeZip = await readPosition(page);
  await page.keyboard.down('e');
  await page.waitForTimeout(350);
  await expect(page.getByTestId('kai-webzip')).toContainText('YES');
  await expect(page.getByTestId('kai-mode')).toContainText('WEB_ZIP');
  const duringZip = await readPosition(page);
  expect(Math.hypot(
    duringZip[0] - beforeZip[0],
    duringZip[1] - beforeZip[1],
    duringZip[2] - beforeZip[2]
  )).toBeGreaterThan(0.2);
  await page.keyboard.up('e');

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Kai runtime: wall climb, attack lifecycle and dodge lifecycle are live', async ({ page }) => {
  const errors = collectErrors(page);
  await bootKaiTest(page, errors);

  const start = await readPosition(page);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForTimeout(400);
  await expect(page.getByTestId('kai-wall')).toContainText('YES');
  await expect(page.getByTestId('kai-mode')).toContainText('WALL');
  const climbed = await readPosition(page);
  expect(climbed[1] - start[1]).toBeGreaterThan(0.15);
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await page.waitForTimeout(150);
  await expect(page.getByTestId('kai-wall')).toContainText('NO');

  const energyBeforeAttack = await readNumber(page, 'kai-energy');
  await page.keyboard.press('j');
  await page.waitForTimeout(100);
  await expect(page.getByTestId('kai-attacking')).toContainText('YES');
  const energyAfterAttack = await readNumber(page, 'kai-energy');
  expect(energyAfterAttack).toBeLessThan(energyBeforeAttack);

  await page.waitForTimeout(450);
  await expect(page.getByTestId('kai-attacking')).toContainText('NO');

  await page.keyboard.press('q');
  await page.waitForTimeout(100);
  await expect(page.getByTestId('kai-dodging')).toContainText('YES');
  expect(await readNumber(page, 'kai-invuln')).toBeGreaterThan(0);

  await page.waitForTimeout(450);
  await expect(page.getByTestId('kai-dodging')).toContainText('NO');

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});

test('Kai runtime: HUD reports measured FPS instead of a hard-coded constant', async ({ page }) => {
  const errors = collectErrors(page);
  await bootKaiTest(page, errors);

  const fps = await readNumber(page, 'kai-fps');
  expect(fps).toBeGreaterThan(0);
  expect(fps).toBeLessThan(1000);

  expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
});
