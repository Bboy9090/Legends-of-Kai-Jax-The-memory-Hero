import { expect, test } from "@playwright/test";

/**
 * DEVELOPMENT INTEGRATION CERTIFICATION, NOT PHYSICAL COMBAT SIGN-OFF.
 * It uses the game's real store damage API to speed through encounters and
 * verifies the actual React phase transitions and player-operated rescue UI.
 * Not included in the production/headless physical gameplay smoke lane.
 */
test("M6-C real mission UI: waves, timed transition, rescues, results and persisted reward", async ({ page }) => {
  // Wall-clock budget only. This dev-integration test drives real typewriter dialogue under software WebGL and
  // measured 5.8-5.9 min against the former 6 min cap, so runner jitter alone could fail it. Assertions and
  // per-step timeouts are unchanged.
  test.setTimeout(540_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  await page.goto("/");
  await page.waitForFunction(
    () => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()),
    null, { timeout: 30000 },
  );
  await page.evaluate(() => {
    const runner = (window as any).runnerStore.getState();
    runner.resetProfile(0);
    runner.switchProfile(0);
    runner.setCharacter("kai-jax");
    runner.setActiveStoryMission("story_act2_m6");
    runner.setGameState("story-mode");
  });
  await expect(page.getByRole("heading", { name: "Shadows of the Ashblock" })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Engage Mission" }).click();
  await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 30000 });
  // Progress the same live dialogue contract used by the passing touch
  // certification. This avoids coupling gamepad qualification to text typing
  // frame timing before the controller is even installed.
  for (let beat = 0; beat < 2; beat++) {
    const intro = page.getByTestId("story-dialogue-overlay");
    await expect(intro).toHaveAttribute("data-line-index", String(beat), { timeout: 30000 });
    // The live Space handler skips typewriter animation without WebGL
    // hit-testing; it preserves the original line and completion callbacks.
    if ((await intro.getAttribute("data-typing")) === "true") {
      await page.keyboard.press("Space");
    }
    await expect(intro).toHaveAttribute("data-typing", "false", { timeout: 30000 });
    await expect(
      page.getByText(beat === 0 ? "Ready for next phase" : "Click to engage", { exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await page.keyboard.press("Space");
  }
  await expect(page.getByTestId("mission6-memory-hud")).toBeVisible({ timeout: 45000 });

  const getProgress = () => page.evaluate(async () => {
    const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
    const s = useAdventure.getState();
    return {
      missionId: s.missionId,
      wave: s.waveCount,
      defeated: s.enemiesDefeated,
      first: s.enemies.filter(e => e.id.startsWith("w0-")).length,
      second: s.enemies.filter(e => e.id.startsWith("w1-")).length,
      secondActive: s.enemies.filter(e => e.id.startsWith("w1-") && !e.isDead).length,
      rescued: s.objectives.memoryRescues.filter(n => n.rescued).length,
      firstDead: s.enemies.filter(e => e.id.startsWith("w0-") && e.isDead).length,
    };
  });

  await expect.poll(async () => (await getProgress()).first, { timeout: 30000 }).toBe(6);
  const initial = await getProgress();
  console.log("M6_DEV_CHECKPOINT_START", JSON.stringify(initial));
  expect(initial).toMatchObject({ missionId: "story_act2_m6", wave: 1, first: 6, second: 0 });

  const firstKilledAt = Date.now();
  await page.evaluate(async () => {
    const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
    const state = useAdventure.getState();
    const first = state.enemies.filter(e => e.id.startsWith("w0-"));
    if (first.length !== 6) throw new Error(`Expected 6 wave-1 enemies, found ${first.length}`);
    for (const e of first) useAdventure.getState().damageEnemy(e.id, 100_000);
  });

  await expect.poll(async () => (await getProgress()).defeated, { timeout: 30000 }).toBe(6);
  // Assert the durable wave state. The brief transition overlay may already
  // have disappeared by the time software WebGL unblocks the Playwright loop.
  // Real component timer; no direct spawn of wave 2 from the test.
  await expect.poll(async () => (await getProgress()).secondActive, { timeout: 30000 }).toBe(8);
  const elapsed = Date.now() - firstKilledAt;
  console.log("M6_DEV_CHECKPOINT_WAVE2", JSON.stringify({ elapsed, progress: await getProgress() }));
  expect(elapsed).toBeGreaterThanOrEqual(2600);
  expect(await getProgress()).toMatchObject({ wave: 2, first: 6, second: 8, firstDead: 6 });

  await page.evaluate(async () => {
    const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
    const enemies = useAdventure.getState().enemies.filter(e => e.id.startsWith("w1-"));
    for (const e of enemies) useAdventure.getState().damageEnemy(e.id, 100_000);
  });
  await expect.poll(async () => (await getProgress()).defeated, { timeout: 30000 }).toBe(14);
  expect(await getProgress()).toMatchObject({ rescued: 0, secondActive: 0 });
  console.log("M6_DEV_CHECKPOINT_14_DEFEATED", JSON.stringify(await getProgress()));
  await expect(page.getByRole("heading", { name: "Mission Complete" })).not.toBeVisible();

  for (const id of ["ashblock_memory_1", "ashblock_memory_2", "ashblock_memory_3"] as const) {
    await page.evaluate(async (nodeId) => {
      const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
      const node = useAdventure.getState().objectives.memoryRescues.find(x => x.id === nodeId)!;
      useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
    }, id);
    const action = page.getByTestId("rescue-" + id);
    await expect(action).toBeVisible({ timeout: 10000 });
    // Exercise the real E-key handler; avoid WebGL-slow click scroll checks.
    await page.keyboard.press("e");
    await expect.poll(async () => (await getProgress()).rescued, { timeout: 20000 }).toBe(
      (["ashblock_memory_1", "ashblock_memory_2", "ashblock_memory_3"] as const).indexOf(id) + 1,
    );
    console.log("M6_DEV_CHECKPOINT_RESCUE", id, JSON.stringify(await getProgress()));
  }

  // Each of the three live E-key rescues has already passed an incremental
  // 1/2/3 store assertion above. Do not issue a redundant asynchronous store
  // import here: the outro mounts an expensive WebGL/React transition and
  // could block an otherwise already-certified final rescue poll.
  // The next assertion validates that the actual outro appeared.
  // Text types in character-by-character; assert the stable transmission overlay.
  await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 30000 });
  console.log("M6_DEV_CHECKPOINT_OUTRO", JSON.stringify(await getProgress()));
  // Canonical Act II Mission 6 outro, asserted in order so a fast/slow
  // typewriter cannot accidentally skip or duplicate a narrative beat.
  const missionOutroLines = [
    "The three memories are safe, but Cross Point remains lost. Ashblock becomes the survivors' new defensive line, not a reclaimed victory.",
    "Move the rescued families behind the barricades. Keep a watch on the Rift approach and assign escorts to anyone still arriving from Cross Point. We hold Ashblock until everyone is accounted for.",
    "One step closer to restoring the Weave.",
    "And... I can hear Kai and Jax more clearly now. Those memories warned them of different dangers. I need to listen to both before we face what comes next.",
  ];
  const overlay = page.getByTestId("story-dialogue-overlay");
  for (const [beat, canonicalLine] of missionOutroLines.entries()) {
    await expect(overlay).toHaveAttribute("data-line-index", String(beat), { timeout: 30000 });
    await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 15000 });

    // If the line is still typing, reveal it using the actual React overlay
    // onClick handler. If it has already finished naturally, do not click:
    // an unconditional first Space/click would prematurely advance a beat.
    if ((await overlay.getAttribute("data-typing")) === "true") {
      await page.evaluate(() => {
        const element = document.querySelector<HTMLElement>('[data-testid="story-dialogue-overlay"]');
        if (!element) throw new Error("Mission 6 dialogue overlay missing during reveal");
        element.click();
      });
    }
    await expect(overlay).toHaveAttribute("data-typing", "false", { timeout: 30000 });
    await expect(page.getByText(canonicalLine, { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByText(beat === missionOutroLines.length - 1 ? "Click to engage" : "Ready for next phase", { exact: true }),
    ).toBeVisible({ timeout: 15000 });

    // Advance exactly once through the real UI, without WebGL hit-test
    // delays, store mutation, or bypassing mission-completion callbacks.
    await page.evaluate(() => {
      const element = document.querySelector<HTMLElement>('[data-testid="story-dialogue-overlay"]');
      if (!element) throw new Error("Mission 6 dialogue overlay missing during advance");
      element.click();
    });
  }
  await expect(page.getByRole("heading", { name: "Mission Complete" })).toBeVisible({ timeout: 12000 });
  await expect(page.getByTestId("story-mission-loot-reward")).toContainText("Ashblock Memory");
  await expect(page.getByText("+500 XP", { exact: true })).toBeVisible();
  await expect(page.getByText("+350 Gold", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Use one exact-state poll after Continue, not two separate DevTools
  // roundtrips competing with software WebGL. This preserves the completed
  // mission ID, exact score, loot and persisted-save assertions.
  let finalReceipt = "";
  await expect.poll(async () => {
    const final = await page.evaluate(() => {
      const r = (window as any).runnerStore.getState();
      const raw = window.localStorage.getItem("kai-jax-save");
      const persisted = raw ? JSON.parse(raw) : null;
      return {
        screen: r.gameState,
        loot: r.storyLoot,
        missionCompleted: r.completedStoryMissionIds.includes("story_act2_m6"),
        score: r.totalScore,
        persistedLoot: persisted?.state?.profiles?.[0]?.storyLoot,
      };
    });
    finalReceipt = JSON.stringify({ ...final, elapsed });
    return final;
  }, { timeout: 30000 }).toEqual({
    screen: "campaign-map",
    loot: ["Ashblock Memory"],
    missionCompleted: true,
    score: 850,
    persistedLoot: ["Ashblock Memory"],
  });
  console.log("M6_COMPLETE_UI_CERTIFICATION", finalReceipt);
  expect(pageErrors).toEqual([]);
});


test("M6-D virtual standard gamepad LB/L1 rescues unlocked memory through the live controller", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 30000 });
  await page.evaluate(() => {
    const runner = (window as any).runnerStore.getState();
    runner.setCharacter("kai-jax");
    runner.setActiveStoryMission("story_act2_m6");
    runner.setGameState("story-mode");
  });
  await expect(page.getByRole("heading", { name: "Shadows of the Ashblock" })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Engage Mission" }).click();
  await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 30000 });
  for (let beat = 0; beat < 2; beat++) {
    const intro = page.getByTestId("story-dialogue-overlay");
    await expect(intro).toHaveAttribute("data-line-index", String(beat), { timeout: 30000 });
    // The live Space handler skips typewriter animation without WebGL
    // hit-testing; it preserves the original line and completion callbacks.
    if ((await intro.getAttribute("data-typing")) === "true") {
      await page.keyboard.press("Space");
    }
    await expect(intro).toHaveAttribute("data-typing", "false", { timeout: 30000 });
    await expect(
      page.getByText(beat === 0 ? "Ready for next phase" : "Click to engage", { exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await page.keyboard.press("Space");
  }
  await expect(page.getByTestId("mission6-memory-hud")).toBeVisible({ timeout: 45000 });

  await page.evaluate(async () => {
    const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
    const store = useAdventure.getState();
    const first = store.enemies.filter(e => e.id.startsWith("w0-")).slice(0, 2);
    if (first.length !== 2) throw new Error("Missing first wave");
    for (const e of first) useAdventure.getState().damageEnemy(e.id, 100000);
    const node = useAdventure.getState().objectives.memoryRescues[0];
    useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);

    // Virtual standard gamepad, read through the actual navigator.getGamepads()
    // path by AdventurePlayerController. No production test hooks installed.
    const pad = {
      id: "Playwright virtual standard gamepad",
      connected: true, mapping: "standard",
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
    };
    (window as any).__m6VirtualPad = pad;
    Object.defineProperty(navigator, "getGamepads", { configurable: true, value: () => [pad] });
  });

  await expect(page.getByTestId("rescue-ashblock_memory_1")).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    (window as any).__m6VirtualPad.buttons[4].pressed = true;
  });
  await expect.poll(async () => page.evaluate(async () => {
    const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
    return useAdventure.getState().objectives.memoryRescues.filter(node => node.rescued).length;
  }), { timeout: 45000 }).toBe(1);
  console.log("M6_VIRTUAL_GAMEPAD_LB_RESCUE", "1 rescued through live gamepad polling");
  await page.evaluate(() => { (window as any).__m6VirtualPad.buttons[4].pressed = false; });
});
