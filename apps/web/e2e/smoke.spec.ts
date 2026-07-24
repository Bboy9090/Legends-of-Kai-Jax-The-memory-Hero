import { test, expect, type ConsoleMessage } from "@playwright/test";

/**
 * Release smoke test — critical path only.
 *
 * Boots the production bundle, walks Lore Hub → Main Menu → Versus select →
 * Battle, and asserts the app renders each screen and mounts the battle canvas
 * without uncaught runtime errors. Navigation is driven through the exposed
 * runner store to stay robust against menu animations.
 *
 * Known-benign console noise (missing optional audio, autoplay policy, WebGL
 * software-rendering notices) is filtered so only real crashes fail the run.
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
  // Network-dependent external assets (drei HDR environment maps, etc.) that
  // load from a CDN in real browsers but are unreachable in this sandbox.
  // Local 404s surface as DOCTYPE/JSON parse errors instead, so these do not
  // mask app-logic bugs like a wrong model path.
  /\.hdr/i,
  /Failed to fetch/i,
  /net::ERR_/i,
  // Generic resource-load failures (CDN HDR maps, optional media). A wrong
  // *local* model path instead throws a specific "Could not load /models/…:
  // Unexpected token" parse error, which is NOT filtered here.
  /Failed to load resource/i,
];

function isBenign(text: string): boolean {
  return BENIGN_ERROR_PATTERNS.some((re) => re.test(text));
}

test("boots, navigates menus, and starts a battle without crashing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => {
    if (!isBenign(e.message)) errors.push(`pageerror: ${e.message}`);
  });
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && !isBenign(msg.text())) {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  // 1) Boot — Lore Hub is the initial screen.
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
    timeout: 15_000,
  });

  // 2) Main menu — the intro sequence auto-completes on first non-lore screen.
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("menu"));
  await page.waitForTimeout(5_000); // let the ~4s GameIntro run and clear

  // 3) Versus select renders.
  await page.evaluate(() => (window as any).runnerStore.getState().setGameState("versus-select"));
  await expect(page.getByText("Choose Your Fighter")).toBeVisible();

  // 4) Start a fight and confirm the battle canvas mounts.
  // Exact match so we don't collide with the fighter cards' "Fighter" role label.
  await page.getByRole("button", { name: "FIGHT", exact: true }).click();
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  // Let several frames run so update loops surface any runtime error.
  await page.waitForTimeout(4_000);

  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});
