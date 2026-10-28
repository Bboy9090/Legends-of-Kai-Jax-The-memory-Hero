import { expect, test } from "@playwright/test";

/**
 * DEVELOPMENT INTEGRATION CERTIFICATION, NOT PHYSICAL COMBAT SIGN-OFF.
 * It uses the game's real store damage API to speed through encounters and
 * verifies the actual React phase transitions and player-operated rescue UI.
 * Not included in the production/headless physical gameplay smoke lane.
 */
test("M6-C real mission UI: waves, timed transition, rescues, results and persisted reward", async ({ page }) => {
  test.setTimeout(360_000);
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
  await expect(page.getByText("I can feel another shard nearby.", { exact: false })).toBeVisible({ timeout: 30000 });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
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

  await expect.poll(async () => (await getProgress()).rescued, { timeout: 15000 }).toBe(3);
  // Text types in character-by-character; assert the stable transmission overlay.
  await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 30000 });
  console.log("M6_DEV_CHECKPOINT_OUTRO", JSON.stringify(await getProgress()));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Mission Complete" })).toBeVisible({ timeout: 12000 });
  await expect(page.getByTestId("story-mission-loot-reward")).toContainText("Ashblock Memory");
  await expect(page.getByText("+500 XP", { exact: true })).toBeVisible();
  await expect(page.getByText("+350 Gold", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect.poll(async () => page.evaluate(() => {
    const r = (window as any).runnerStore.getState();
    return r.completedStoryMissionIds.includes("story_act2_m6") ? r.totalScore : -1;
  }), { timeout: 30000 }).toBe(850);

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
  console.log("M6_COMPLETE_UI_CERTIFICATION", JSON.stringify({ ...final, elapsed }));
  expect(final).toEqual({
    screen: "campaign-map",
    loot: ["Ashblock Memory"],
    missionCompleted: true,
    score: 850,
    persistedLoot: ["Ashblock Memory"],
  });
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
  await expect(page.getByText("I can feel another shard nearby.", { exact: false })).toBeVisible({ timeout: 30000 });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
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
