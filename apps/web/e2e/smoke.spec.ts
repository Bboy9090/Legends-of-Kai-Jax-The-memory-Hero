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
  /Failed to load resource.*(mp3|ogg|wav)/i,
  /WebGL.*deprecated/i,
  /SwiftShader/i,
  /Software WebGL/i,
  /GPU stall/i,
  /THREE\.WebGLRenderer: Context Lost/i,
  /\.hdr/i,
];

function isBenign(text: string): boolean {
  return BENIGN_ERROR_PATTERNS.some((re) => re.test(text));
}

/** Attach error collectors and return the (mutating) error list. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => {
    if (!isBenign(e.message)) {
      const entry = `pageerror: ${e.message}`;
      errors.push(entry);
      console.log("RELEASE_PAGE_ERROR", entry);
    }
  });
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && !isBenign(msg.text())) {
      const entry = `console.error: ${msg.text()}`;
      errors.push(entry);
      console.log("RELEASE_CONSOLE_ERROR", entry);
    }
  });
  return errors;
}

type BootSnapshot = {
  gameState: string | null;
  phase: string | null;
  hydrated: boolean;
  persisted: string | null;
  canvasCount: number;
  bodyText: string;
};

/** Boot and wait for the runner store to be available. */
async function boot(page: Page): Promise<BootSnapshot> {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await page.waitForFunction(() => Boolean((window as any).runnerStore), null, {
    timeout: 15_000,
  });
  await page.waitForFunction(
    () => {
      const runner = (window as any).runnerStore;
      return Boolean(runner?.persist?.hasHydrated?.());
    },
    null,
    { timeout: 15_000 },
  );

  const snapshot = await page.evaluate(() => ({
    gameState: (window as any).runnerStore?.getState?.().gameState ?? null,
    phase: (window as any).gameStore?.getState?.().phase ?? null,
    hydrated: Boolean((window as any).runnerStore?.persist?.hasHydrated?.()),
    persisted: window.localStorage.getItem("kai-jax-save"),
    canvasCount: document.querySelectorAll("canvas").length,
    bodyText: (document.body.innerText || "").slice(0, 1200),
  }));
  console.log("RELEASE_BOOT_SNAPSHOT", JSON.stringify(snapshot, null, 2));
  await page.waitForTimeout(250);
  return snapshot;
}

async function enterGameFromLoreHub(page: Page): Promise<void> {
  await expect(page.getByTestId("lorehub-play-game-btn")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("lorehub-play-game-btn").click();

  // Entering the game from Lore Hub intentionally triggers the first-run intro.
  await page.getByTestId("game-intro").waitFor({ state: "visible", timeout: 5_000 });
  await page.getByTestId("game-intro").waitFor({ state: "detached", timeout: 10_000 });

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "menu",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("button", { name: /COMBAT ARENA/i })).toBeVisible({ timeout: 10_000 });
}

async function enterStableState(page: Page, gameState: string): Promise<void> {
  await page.evaluate((nextState) => {
    const runner = (window as any).runnerStore;
    const game = (window as any).gameStore;
    game?.getState?.().reset?.();
    runner.getState().setGameState(nextState);
  }, gameState);

  await page.waitForFunction(
    (expected) => (window as any).runnerStore?.getState?.().gameState === expected,
    gameState,
    { timeout: 10_000 },
  );

  // The first-run cinematic is intentionally global. Wait for it to finish
  // rather than racing a fixed timeout against React/store hydration.
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 10_000 }).catch(() => {});
}

test("versus: boots, navigates menus, and starts a battle without crashing", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await boot(page);

  // Follow the same first-run path a player uses, then open Combat Arena.
  await enterGameFromLoreHub(page);
  await page.getByRole("button", { name: /COMBAT ARENA/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "versus-select",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("heading", { name: "Choose Your Fighter" })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /^Kai,.*playable/ }).click();

  // Start the real training battle for deterministic move certification.
  // Training uses the same battle renderer/controller but keeps the opponent passive,
  // so authored attack proof is not contaminated by random AI hitstun.
  await page.getByRole("button", { name: "Training", exact: true }).click();
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  await page.waitForFunction(() => Boolean((window as any).__KAI_JAX_ANIMATION_PROBE__?.kai), null, { timeout: 20_000 });

  // Certify locomotion against the clip actually selected by the mounted fighter.
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai?.requested === "walk", null, { timeout: 15_000 });
  const walkProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_WALK_PROBE", JSON.stringify(walkProbe));
  expect(Object.values(walkProbe ?? {}).some((p: any) => p?.requested === "walk" && /walk/i.test(p?.selectedClip ?? ""))).toBeTruthy();
  await page.keyboard.down("ShiftLeft");
  await page.waitForFunction(() => (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai?.requested === "run", null, { timeout: 15_000 });
  const runProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_RUN_PROBE", JSON.stringify(runProbe));
  expect(Object.values(runProbe ?? {}).some((p: any) => p?.requested === "run" && /run/i.test(p?.selectedClip ?? ""))).toBeTruthy();
  await page.keyboard.up("ShiftLeft");
  await page.keyboard.up("ArrowRight");

  // Exercise the actual keyboard path while the WebGL fighter is mounted.
  // Kick is the authored-attack certification target. Procedural Punch pose
  // quality remains a separate visual-review item and must not gate this proof.
  await page.keyboard.down("KeyK"); // kick
  await page.waitForFunction(
    () => {
      const probe = (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai;
      return probe?.requested === "attack"
        && probe?.attackType === "kick"
        && /kick/i.test(probe?.selectedClip ?? "");
    },
    null,
    { timeout: 5_000 },
  );
  await page.keyboard.up("KeyK");
  const kickProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_KICK_PROBE", JSON.stringify(kickProbe));
  const kaiJaxKick = kickProbe?.kai;
  expect(kaiJaxKick?.requested).toBe("attack");
  expect(kaiJaxKick?.attackType).toBe("kick");
  expect(kaiJaxKick?.authored).toBe(true);
  expect(kaiJaxKick?.selectedClip).toMatch(/kick/i);
  await page.screenshot({
    path: testInfo.outputPath("kai-authored-kick.png"),
    animations: "disabled",
  });
  await page.waitForTimeout(520);
  await page.keyboard.press("KeyE"); // dodge
  await page.waitForTimeout(450);
  await page.keyboard.down("AltLeft"); // block / parry window
  await page.waitForTimeout(180);
  await page.keyboard.up("AltLeft");
  await page.keyboard.press("Space"); // airborne pose
  await page.waitForTimeout(650);

  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("story: enters a real story mission and mounts the arena without crashing", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Complete the real first-run launch sequence before selecting a known story mission.
  await enterGameFromLoreHub(page);
  await page.evaluate(() => {
    const s = (window as any).runnerStore.getState();
    s.setCharacter("kai-jax");
    s.setActiveStoryMission("story_act1_m1");
    s.setGameState("story-mode");
  });
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "story-mode",
    null,
    { timeout: 10_000 },
  );

  // Mission briefing renders the real mission title (proves the id resolved).
  await expect(page.getByText("Awakening of the Memory Hero", { exact: true })).toBeVisible({ timeout: 20_000 });

  // The adventure arena canvas mounts.
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  await page.waitForTimeout(3_000);
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});
