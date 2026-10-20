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
    const detail = `${msg.text()} (${msg.location().url ?? ''})`;
    if (msg.type() === "error" && !isBenign(detail)) {
      const entry = `console.error: ${detail}`;
      errors.push(entry);
      console.log("RELEASE_CONSOLE_ERROR", entry);
    }
  });
  return errors;
}

// Capture selection and skin evidence from the same successful browser frame.
async function captureAuthoredMotion(page: Page, requested: 'walk' | 'run' | 'kick'): Promise<any> {
  const sample = await page.waitForFunction((move) => {
    const animation = (window as any).__KAI_JAX_ANIMATION_PROBE__?.kaijax;
    const deformation = (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kaijax;
    const matches = move === 'kick'
      ? animation?.requested === 'attack' && animation.attackType === 'kick'
      : animation?.requested === move;
    return matches && animation.authored === true
      && deformation?.requested === move && deformation.moving === true
      && deformation.skinVerified === true && deformation.source === 'authored'
      ? { animation: { ...animation }, deformation: { ...deformation } }
      : false;
  }, requested, { timeout: 60_000 });
  try { return await sample.jsonValue(); }
  finally { await sample.dispose(); }
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
  expect(snapshot.gameState).toBe("title");
  await page.waitForTimeout(250);
  return snapshot;
}

async function enterGameFromLaunch(page: Page): Promise<void> {
  // Production launch authority: cinematic intro -> Memory King title -> menu.
  await page.getByTestId("game-intro").waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  await page.getByTestId("game-intro").waitFor({ state: "detached", timeout: 20_000 }).catch(() => {});

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "title",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByTestId("title-screen")).toBeVisible({ timeout: 20_000 });
  const begin = page.getByRole("button", { name: "Begin Legends of Kai-Jax" });
  await expect(begin).toBeVisible({ timeout: 20_000 });
  await begin.click();

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

test("presentation: title shell exposes release metadata and an accessible begin action", async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await boot(page);
  await enterStableState(page, "title");

  await expect(page.getByTestId("title-screen")).toBeVisible({ timeout: 10_000 });
  const metadata = page.getByTestId("title-release-metadata");
  await expect(metadata).toBeVisible();
  await expect(metadata).toContainText(/VER\.\s+\S+\s+\|\s+BUILD\s+\S+/);
  await expect(metadata).not.toContainText("2026.08.03");

  const begin = page.getByRole("button", { name: "Begin Legends of Kai-Jax" });
  await expect(begin).toBeVisible();
  await begin.focus();
  await expect(begin).toBeFocused();
  await begin.click();

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "menu",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("button", { name: /COMBAT ARENA/i })).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test("versus: boots, navigates menus, and starts a battle without crashing", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    (window as any).__KAI_JAX_CERTIFICATION__ = true;
    (window as any).__KAI_JAX_INPUT_PROBE__ = [];
  });
  await boot(page);

  // Follow the real cinematic/title/menu launch path, then open Combat Arena.
  await enterGameFromLaunch(page);
  await page.getByRole("button", { name: /COMBAT ARENA/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "versus-select",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("heading", { name: "Character Select" })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /^Kai-Jax,.*playable/ }).click();

  // Start the real training battle for deterministic move certification.
  // Clear menu/title preview telemetry first; certification begins only after
  // the actual PlayerController has mounted in the battle scene.
  await page.evaluate(() => {
    delete (window as any).__KAI_JAX_CONTROLLER_READY__;
    (window as any).__KAI_JAX_ANIMATION_PROBE__ = {};
    (window as any).__KAI_JAX_DEFORMATION_PROBE__ = {};
    (window as any).__KAI_JAX_FRAME_PROBE__ = {};
  });
  // Training uses the same battle renderer/controller but keeps the opponent passive,
  // so authored attack proof is not contaminated by random AI hitstun.
  await page.getByRole("button", { name: "Training", exact: true }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "playing",
    null,
    { timeout: 15_000 },
  );
  await page.waitForFunction(
    () => (window as any).battleStore?.getState?.().battlePhase === "fighting",
    null,
    { timeout: 15_000 },
  );
  await page.waitForFunction(
    () => (window as any).__KAI_JAX_CONTROLLER_READY__?.mounted === true,
    null,
    { timeout: 45_000 },
  );
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });

  await page.waitForFunction(() => Boolean((window as any).__KAI_JAX_ANIMATION_PROBE__?.kaijax), null, { timeout: 20_000 });

  // Exercise actual keyboard input, retaining the frame that satisfied the gate.
  await expect(page.locator('.kj-vision-overlay')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.kj-vision-overlay')).toHaveCSS('background-image', 'none');
  await page.keyboard.down("ArrowRight");
  const walk = await captureAuthoredMotion(page, 'walk');
  await page.keyboard.down("ShiftLeft");
  const run = await captureAuthoredMotion(page, 'run');
  await page.keyboard.up("ShiftLeft");
  await page.keyboard.up("ArrowRight");
  let kick;
  await page.keyboard.down("KeyK");
  try { kick = await captureAuthoredMotion(page, 'kick'); }
  catch (error) {
    console.log('KICK_TIMEOUT_DIAGNOSTIC', JSON.stringify(await page.evaluate(() => ({
      animation: (window as any).__KAI_JAX_ANIMATION_PROBE__,
      deformation: (window as any).__KAI_JAX_DEFORMATION_PROBE__,
      input: (window as any).__KAI_JAX_INPUT_PROBE__,
    }))));
    throw error;
  } finally { await page.keyboard.up("KeyK"); }
  const proof = { walk, run, kick };
  for (const [requested, sample] of Object.entries(proof)) {
    expect(sample.animation.authored).toBe(true);
    expect(sample.animation.selectedClip).toMatch(new RegExp(requested, 'i'));
    expect(sample.deformation.requested).toBe(requested);
    expect(sample.deformation.moving).toBe(true);
    expect(sample.deformation.skinVerified).toBe(true);
    expect(sample.deformation.source).toBe('authored');
  }
  expect(kick.animation.requested).toBe('attack');
  expect(kick.animation.attackType).toBe('kick');
  console.log('LIVE_FUSION_DEFORMATION_PROOF', JSON.stringify(proof));
  await testInfo.attach('kai-jax-deformation-proof.json', {
    body: Buffer.from(JSON.stringify(proof, null, 2)), contentType: 'application/json',
  });
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("story shell: Raging City hub routes through playable legend selection", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await boot(page);
  await enterGameFromLaunch(page);

  await page.getByRole("button", { name: /^STORY\b/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "story-hub",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("heading", { name: /Story Hub.*Raging City/i })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /View Quest Details/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "character-select",
    null,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("heading", { name: "Character Select" })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /JAX/i }).filter({ hasNotText: /KAI-JAX/i }).first().click();
  await page.getByTestId("legend-select-confirm").click();

  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "mission-select",
    null,
    { timeout: 10_000 },
  );
  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("story: enters a real story mission and mounts the arena without crashing", async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page);

  // Complete the real cinematic/title/menu launch before selecting a known story mission.
  await enterGameFromLaunch(page);
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
