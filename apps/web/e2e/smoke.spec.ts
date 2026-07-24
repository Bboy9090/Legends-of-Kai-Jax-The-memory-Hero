import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Release smoke tests — critical paths.
 *
 * Boots the production bundle and walks the two main gameplay entries:
 *   1. Versus:  Lore Hub → Menu → Versus select → Battle
 *   2. Story:   Lore Hub → a real story mission (briefing → arena)
 *
 * Each asserts the relevant canvas mounts and that no app-logic runtime error
 * occurs. Navigation is driven through the exposed runner store to stay robust
 * against menu animations.
 *
 * Known-benign console noise (missing optional audio, autoplay policy, WebGL
 * software-rendering notices, CDN-only assets unreachable in this sandbox) is
 * filtered so only real crashes fail the run. A wrong *local* path instead
 * surfaces as a specific "Could not load /…: Unexpected token" parse error,
 * which is NOT filtered.
 */

const BENIGN_ERROR_PATTERNS = [
  /autoplay/i,
  /the play\(\) request/i,
  /sounds\/.*\.mp3/i,
  /favicon/i,
  /Failed to load resource.*(mp3|ogg|wav|png|jpg)/i,
  /WebGL.*deprecated/i,
  /SwiftShader/i,
  /Software WebGL/i,
  /GPU stall/i,
  /THREE\.WebGLRenderer: Context Lost/i,
  /\.hdr/i,
  /Failed to fetch/i,
  /net::ERR_/i,
  /Failed to load resource/i,
];

function isBenign(text: string): boolean {
  return BENIGN_ERROR_PATTERNS.some((re) => re.test(text));
}

/** Attach error collectors and return the (mutating) error list. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => {
    if (!isBenign(e.message)) errors.push(`pageerror: ${e.message}`);
  });
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && !isBenign(msg.text())) {
      errors.push(`console.error: ${msg.text()}`);
    }
  });
  return errors;
}

/** Boot and wait for the runner store to be available. */
async function boot(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
    timeout: 15_000,
  });
}

test("versus: boots, navigates menus, and starts a battle without crashing", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Main menu — the intro sequence auto-completes on first non-lore screen.
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("menu"));
  await page.waitForTimeout(5_000); // let the ~4s GameIntro run and clear

  // Versus select renders.
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("versus-select"));
  await expect(page.getByText("Choose Your Fighter")).toBeVisible();

  // Start a fight and confirm the battle canvas mounts.
  // Exact match so we don't collide with the fighter cards' "Fighter" role label.
  await page.getByRole("button", { name: "FIGHT", exact: true }).click();
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  await page.waitForTimeout(4_000); // let several frames run
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("story: enters a real story mission and mounts the arena without crashing", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Enter Act I, Mission 1 directly through the store with a real mission id.
  await page.evaluate(() => {
    const s = (window as any).runnerStore.getState();
    s.setCharacter("kai-jax");
    s.setActiveStoryMission("story_act1_m1");
    s.setGameState("story-mode");
  });
  await page.waitForTimeout(5_000); // let the ~4s GameIntro run and clear

  // Mission briefing renders the real mission title (proves the id resolved).
  await expect(page.getByText("Awakening of the Memory Hero")).toBeVisible({ timeout: 15_000 });

  // The adventure arena canvas mounts.
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  await page.waitForTimeout(3_000);
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});
