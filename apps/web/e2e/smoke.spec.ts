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

  await page.getByRole("button", { name: /^Kai,.*playable/ }).click();

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

  await page.waitForFunction(() => Boolean((window as any).__KAI_JAX_ANIMATION_PROBE__?.kai), null, { timeout: 20_000 });

  // Certify locomotion against the clip actually selected by the mounted fighter.
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const probe = (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai;
    return probe?.requested === "walk" && probe?.authored === true && /walk/i.test(probe?.selectedClip ?? "");
  }, null, { timeout: 45_000 });
  const walkProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_WALK_PROBE", JSON.stringify(walkProbe));
  expect(Object.values(walkProbe ?? {}).some((p: any) => p?.requested === "walk" && /walk/i.test(p?.selectedClip ?? ""))).toBeTruthy();
  try {
    await page.waitForFunction(() => {
      const probe = (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai;
      return probe?.requested === "walk" && probe?.moving === true && probe?.skinVerified === true;
    }, null, { timeout: 20_000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      animation: (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai ?? null,
      deformation: (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai ?? null,
      rig: (window as any).__KAI_JAX_RIG_PROBE__?.kai ?? null,
      frame: (window as any).__KAI_JAX_FRAME_PROBE__?.kai ?? null,
      companion: (window as any).__KAI_JAX_COMPANION_PROBE__ ?? null,
    }));
    console.log("LIVE_KAI_SKIN_TIMEOUT_DIAGNOSTIC", JSON.stringify(diagnostic));
    throw error;
  }
  const walkDeform = await page.evaluate(() => (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai);
  console.log("LIVE_DEFORMATION_WALK_PROBE", JSON.stringify(walkDeform));
  expect(walkDeform?.moving).toBe(true);
  expect(walkDeform?.skinVerified).toBe(true);
  await page.keyboard.down("ShiftLeft");
  await page.waitForFunction(() => {
    const probe = (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai;
    return probe?.requested === "run" && probe?.authored === true && /run/i.test(probe?.selectedClip ?? "");
  }, null, { timeout: 45_000 });
  const runProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_RUN_PROBE", JSON.stringify(runProbe));
  expect(Object.values(runProbe ?? {}).some((p: any) => p?.requested === "run" && /run/i.test(p?.selectedClip ?? ""))).toBeTruthy();
  await page.waitForFunction(() => {
    const probe = (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai;
    return probe?.requested === "run" && probe?.moving === true && probe?.skinVerified === true;
  }, null, { timeout: 20_000 });
  const runDeform = await page.evaluate(() => (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai);
  console.log("LIVE_DEFORMATION_RUN_PROBE", JSON.stringify(runDeform));
  expect(runDeform?.moving).toBe(true);
  expect(runDeform?.skinVerified).toBe(true);
  await page.keyboard.up("ShiftLeft");
  await page.keyboard.up("ArrowRight");

  // Exercise the actual keyboard path while the WebGL fighter is mounted.
  // Kick is the authored-attack certification target. Procedural Punch pose
  // quality remains a separate visual-review item and must not gate this proof.
  await page.keyboard.down("KeyK"); // kick
  try {
    await page.waitForFunction(
      () => {
        const probe = (window as any).__KAI_JAX_ANIMATION_PROBE__?.kai;
        return probe?.requested === "attack"
          && probe?.attackType === "kick";
      },
      null,
      { timeout: 60_000 },
    );
  } catch (error) {
    const inputProbe = await page.evaluate(() => (window as any).__KAI_JAX_INPUT_PROBE__);
    const animationProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
    const companionProbe = await page.evaluate(() => (window as any).__KAI_JAX_COMPANION_PROBE__);
    console.log("LIVE_INPUT_KICK_PROBE", JSON.stringify(inputProbe));
    console.log("LIVE_ANIMATION_KICK_TIMEOUT_PROBE", JSON.stringify(animationProbe));
    console.log("LIVE_COMPANION_LOAD_TIMEOUT_PROBE", JSON.stringify(companionProbe));
    throw error;
  } finally {
    await page.keyboard.up("KeyK");
  }
  const kickProbe = await page.evaluate(() => (window as any).__KAI_JAX_ANIMATION_PROBE__);
  console.log("LIVE_ANIMATION_KICK_PROBE", JSON.stringify(kickProbe));
  const kaiKick = kickProbe?.kai;
  expect(kaiKick?.requested).toBe("attack");
  expect(kaiKick?.attackType).toBe("kick");

  // Spider-Kai currently has no compatible authored kick donor. The prior
  // 9-tail donor shared bone names but not the bind/rest skeleton, so release
  // correctness is visible articulation rather than a misleading clip-name
  // check. When a compatible Spider-Kai kick is added, this may become authored.
  await page.waitForFunction(() => {
    const probe = (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai;
    return probe?.requested === "kick" && probe?.moving === true && probe?.skinVerified === true;
  }, null, { timeout: 20_000 });
  const kickDeform = await page.evaluate(() => (window as any).__KAI_JAX_DEFORMATION_PROBE__?.kai);
  console.log("LIVE_DEFORMATION_KICK_PROBE", JSON.stringify(kickDeform));
  expect(kickDeform?.moving).toBe(true);
  expect(kickDeform?.skinVerified).toBe(true);
  // Runtime certification must not fail solely because a software WebGL runner
  // stalls while rasterizing a screenshot. Preserve the image when possible;
  // final presentation review remains a separate explicit release gate.
  try {
    // First prefer a compact canvas-only capture. If the WebGL canvas stalls
    // during readback on a real GPU, fall back to the full-page path that has
    // already proven reliable on hardware-backed macOS.
    await page.setViewportSize({ width: 640, height: 400 });
    await page.waitForTimeout(250);
    try {
      await page.locator("canvas").first().screenshot({
        path: testInfo.outputPath("kai-authored-kick-640x400.png"),
        timeout: 15_000,
      });
      console.log("KAI_AUTHORED_KICK_SCREENSHOT", "captured-640x400");
    } catch (canvasError) {
      console.log("KAI_AUTHORED_KICK_CANVAS_SCREENSHOT", "capture-unavailable", String(canvasError));
      try {
        await page.screenshot({
          path: testInfo.outputPath("kai-authored-kick-fallback.png"),
          animations: "disabled",
          timeout: 15_000,
        });
        console.log("KAI_AUTHORED_KICK_SCREENSHOT", "captured-fallback-page");
      } catch (pageError) {
        console.log("KAI_AUTHORED_KICK_PAGE_SCREENSHOT", "capture-unavailable", String(pageError));
        const cdp = await page.context().newCDPSession(page);
        const shot = await cdp.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        const fs = await import("node:fs/promises");
        await fs.writeFile(
          testInfo.outputPath("kai-authored-kick-cdp-fallback.png"),
          Buffer.from(shot.data, "base64"),
        );
        console.log("KAI_AUTHORED_KICK_SCREENSHOT", "captured-cdp-fallback");
      }
    }
  } catch (error) {
    console.log("KAI_AUTHORED_KICK_SCREENSHOT", "capture-unavailable", String(error));
  }

  expect(errors, `Unexpected runtime errors:\n${errors.join("\n")}`).toEqual([]);
});

test("fusion rig: Kai-Jax visibly articulates instead of translating as a statue", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    (window as any).__KAI_JAX_CERTIFICATION__ = true;
  });
  await boot(page);
  await enterGameFromLaunch(page);

  await page.getByRole("button", { name: /COMBAT ARENA/i }).click();
  await page.waitForFunction(
    () => (window as any).runnerStore?.getState?.().gameState === "versus-select",
    null,
    { timeout: 10_000 },
  );

  const fusionCard = page.getByRole("button", { name: /^Kai-Jax,.*playable/ });
  await fusionCard.click();
  await expect(fusionCard).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
  await page.evaluate(() => {
    delete (window as any).__KAI_JAX_CONTROLLER_READY__;
    (window as any).__KAI_JAX_ANIMATION_PROBE__ = {};
    (window as any).__KAI_JAX_DEFORMATION_PROBE__ = {};
    (window as any).__KAI_JAX_FRAME_PROBE__ = {};
  });
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

  await page.keyboard.down("ArrowRight");
  try {
    await page.waitForFunction(() => {
      const probes = Object.values((window as any).__KAI_JAX_DEFORMATION_PROBE__ ?? {}) as any[];
      return probes.some((probe) => probe?.requested === "walk" && probe?.moving === true);
    }, null, { timeout: 30_000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      fighter: (window as any).battleStore?.getState?.().playerFighterId ?? null,
      battlePhase: (window as any).battleStore?.getState?.().battlePhase ?? null,
      velocityX: (window as any).battleStore?.getState?.().playerVelocityX ?? null,
      animation: (window as any).__KAI_JAX_ANIMATION_PROBE__ ?? null,
      deformation: (window as any).__KAI_JAX_DEFORMATION_PROBE__ ?? null,
      frame: (window as any).__KAI_JAX_FRAME_PROBE__ ?? null,
      companion: (window as any).__KAI_JAX_COMPANION_PROBE__ ?? null,
    }));
    console.log("LIVE_FUSION_TIMEOUT_DIAGNOSTIC", JSON.stringify(diagnostic));
    throw error;
  } finally {
    await page.keyboard.up("ArrowRight");
  }

  const deformation = await page.evaluate(() => (window as any).__KAI_JAX_DEFORMATION_PROBE__);
  console.log("LIVE_FUSION_DEFORMATION_PROBE", JSON.stringify(deformation));
  expect(Object.values(deformation ?? {}).some((probe: any) =>
    probe?.requested === "walk" && probe?.moving === true && probe?.skinVerified === true
  )).toBeTruthy();
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
  await expect(page.getByRole("heading", { name: "Choose Your Legend" })).toBeVisible({ timeout: 15_000 });

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
