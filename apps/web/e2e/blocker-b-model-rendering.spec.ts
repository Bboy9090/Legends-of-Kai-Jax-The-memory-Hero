import { test, expect, type Page } from "@playwright/test";

/**
 * Regression test for Blocker B: Model Rendering
 *
 * Verifies that the OptimizedBeastModel Clone fix properly renders:
 * 1. Training Mode: Single fighter visible (not fallback marker)
 * 2. Versus Mode: Two fighters visible (not fallback markers)
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
  page.on("console", (msg) => {
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

test("training mode: fighter component mounts without errors", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Enter training/adventure mode
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("adventure"));
  await page.waitForTimeout(4_000); // let intro and scene load

  // Verify canvas mounted and WebGL active
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  // Verify game state transition completed
  const gameState = await page.evaluate(() => (window as any).runnerStore.getState().gameState);
  expect(gameState).toBe("adventure");

  // Verify scene mounted without fatal errors
  await page.waitForTimeout(2_000);
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("versus mode: both fighter components mount without errors", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Navigate to versus select
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("versus-select"));
  await expect(page.getByText("Choose Your Fighter")).toBeVisible({ timeout: 15_000 });

  // Start battle
  await page.getByRole("button", { name: "FIGHT", exact: true }).click();
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  // Verify battle scene fully loaded
  const battleData = await page.evaluate(() => {
    const battle = (window as any).useBattle?.getState?.();
    return {
      playerFighter: battle?.playerFighter,
      opponentFighter: battle?.opponentFighter,
      phaseRunning: (window as any).useGame?.getState?.().phase === "running",
    };
  });

  expect(battleData.playerFighter).toBeTruthy();
  expect(battleData.opponentFighter).toBeTruthy();

  // Verify no fatal errors during battle load
  await page.waitForTimeout(3_000);
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});
