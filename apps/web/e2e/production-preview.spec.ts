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

async function expectBuiltRoute(page: Page, path: string, errors: string[]) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), `Unexpected HTTP status for ${path}`).toBe(200);
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors, `Unexpected runtime errors on ${path}:\n${errors.join('\n')}`).toEqual([]);
}

test('production preview mounts the normal application shell from built assets', async ({ page }) => {
  const errors = collectErrors(page);
  await expectBuiltRoute(page, '/', errors);
  await expect(page).toHaveTitle(/Legends of Kai-Jax/i);
});

test('production preview preserves the isolated Kai runtime harness', async ({ page }) => {
  const errors = collectErrors(page);
  await expectBuiltRoute(page, '/?mode=kai-test', errors);
  await expect(page.getByTestId('kai-debug-hud')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('production preview preserves the isolated Jax runtime harness', async ({ page }) => {
  const errors = collectErrors(page);
  await expectBuiltRoute(page, '/?mode=jax-test', errors);
  await expect(page.getByTestId('jax-debug-hud')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('story hero select renders separate production Kai and Jax GLTF previews', async ({ page }) => {
  const errors = collectErrors(page);
  await expectBuiltRoute(page, '/', errors);

  await page.evaluate(() => {
    const runnerStore = (window as Window & {
      runnerStore?: {
        getState: () => {
          setCharacter: (id: string) => void;
          setGameState: (state: string) => void;
        };
      };
    }).runnerStore;

    if (!runnerStore) throw new Error('runnerStore is not available for production preview proof');
    const state = runnerStore.getState();
    state.setCharacter('kai');
    state.setGameState('character-select');
  });

  const preview = page.getByTestId('character-preview-3d');
  await expect(preview).toHaveAttribute('data-model-source', 'production-gltf', { timeout: 15_000 });
  await expect(preview).toHaveAttribute('data-model-fighter', 'kai');
  await expect(preview).toHaveAttribute('data-model-path', /Merged_Animations4KAI\.glb/);
  await expect(preview).toHaveAttribute('data-model-status', 'ready', { timeout: 45_000 });

  await page.locator('[data-story-hero-id="jax"]').click({ force: true });
  await expect(preview).toHaveAttribute('data-model-fighter', 'jax', { timeout: 15_000 });
  await expect(preview).toHaveAttribute('data-model-path', /Merged_AnimationsSHADOWSONIC JAX\.glb/);
  await expect(preview).toHaveAttribute('data-model-status', 'ready', { timeout: 45_000 });

  expect(errors, `Unexpected runtime errors while loading story hero production models:\n${errors.join('\n')}`).toEqual([]);
});
