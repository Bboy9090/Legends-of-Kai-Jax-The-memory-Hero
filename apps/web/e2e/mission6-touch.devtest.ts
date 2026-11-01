import { test, expect, devices } from "@playwright/test";

/**
 * M6-E emulated-touch checks. Browser touch emulation is NOT a physical handset.
 * Runtime uses actual touchstart/end input listeners and the real M6 rescue UI.
 */
const TARGETS = [
  { name: "iPhone SE compact", width: 375, height: 667, scale: 2 },
  { name: "iPad portrait", width: 768, height: 1024, scale: 2 },
  { name: "iPhone landscape", width: 844, height: 390, scale: 3 },
];

for (const target of TARGETS) {
  test(`M6-E ${target.name}: tap, touch HUD bounds, pause/resume, and actual rescue`, async ({ browser }) => {
    test.setTimeout(240_000);
    const context = await browser.newContext({
      ...devices[target.name === "iPad portrait" ? "iPad Mini" : "iPhone 13"],
      viewport: { width: target.width, height: target.height },
      screen: { width: target.width, height: target.height },
      deviceScaleFactor: target.scale,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const exceptions: string[] = [];
    page.on("pageerror", e => exceptions.push(e.message));
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(
        () => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()), null, { timeout: 25000 },
      );
      // Resolve GLB authority before entering the heavy Three.js scene, so
      // a development-server reload cannot invalidate the late results read.
      // These exact registered rigs, never stand-in illustrations, are tested.
      const modelEvidence = await page.evaluate(async () => {
        const { getModelConfig } = await import("/src/assets/modelRegistry.ts");
        return ["kai-jax", "rift-drone", "hyena-scout"].map(id => ({
          id, path: getModelConfig(id)?.path ?? null,
        }));
      });
      for (const entry of modelEvidence) expect(entry.path).toMatch(/\.glb$/);
      await page.evaluate(() => {
        const runner = (window as any).runnerStore.getState();
        runner.resetProfile(0);
        runner.switchProfile(0);
        runner.setCharacter("kai-jax");
        runner.setActiveStoryMission("story_act2_m6");
        runner.setGameState("story-mode");
      });
      await expect(page.getByRole("heading", { name: "Shadows of the Ashblock" })).toBeVisible({ timeout: 35000 });
      await page.getByRole("button", { name: "Engage Mission" }).tap();
      await expect(page.getByText("Transmission Active", { exact: true })).toBeVisible({ timeout: 25000 });
      // Actual touch dialogue handler, two beats: the M5 retreat and the
      // Ashblock recovery order. A tap finishes typing; the next advances.
      for (let beat = 0; beat < 2; beat++) {
        await page.getByText("Transmission Active", { exact: true }).tap();
        await page.getByText(beat === 0 ? "Ready for next phase" : "Click to engage", { exact: true }).tap({ timeout: 30000 });
      }
      await expect(page.getByTestId("mission6-memory-hud")).toBeVisible({ timeout: 50000 });

      const controls = ["touch-joystick", "touch-attack", "touch-heavy", "touch-skill", "touch-dodge", "touch-pause"];
      const geometry = await page.evaluate((names) => {
        return names.map(name => {
          const el = document.querySelector<HTMLElement>(`[data-testid="${name}"]`);
          if (!el) return { name, found: false };
          const b = el.getBoundingClientRect();
          return { name, found: true, x: b.x, y: b.y, width: b.width, height: b.height,
            visible: b.width > 0 && b.height > 0 && b.x >= 0 && b.y >= 0 &&
              b.right <= window.innerWidth && b.bottom <= window.innerHeight };
        });
      }, controls);
      console.log("M6_TOUCH_CONTROLS", JSON.stringify({ device: target.name, geometry }));
      expect(geometry.every(x => x.found && x.visible)).toBe(true);

      // Real touchstart handler for Pause, real touch button to Resume.
      await page.getByTestId("touch-pause").tap({ timeout: 25000 });
      await expect(page.getByRole("heading", { name: "PAUSED" })).toBeVisible({ timeout: 15000 });
      await page.getByRole("button", { name: "Resume" }).tap({ timeout: 25000 });
      await expect(page.getByRole("heading", { name: "PAUSED" })).not.toBeVisible({ timeout: 15000 });

      // Two enemy defeats via existing store API unlock the first memory, but
      // do not count as a recovery. Tap the actual on-screen Rescue button.
      const beforeRescue = await page.evaluate(async () => {
        const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
        const s = useAdventure.getState();
        const first = s.enemies.filter(e => e.id.startsWith("w0-")).slice(0, 2);
        if (first.length !== 2) throw new Error("M6 first wave did not spawn");
        for (const e of first) useAdventure.getState().damageEnemy(e.id, 100000);
        const node = useAdventure.getState().objectives.memoryRescues[0];
        useAdventure.getState().setPlayerPos(node.posX, 0, node.posZ);
        return { defeated: useAdventure.getState().enemiesDefeated,
          rescued: useAdventure.getState().objectives.memoryRescues.filter(n => n.rescued).length };
      });
      expect(beforeRescue).toEqual({ defeated: 2, rescued: 0 });
      const rescue = page.getByTestId("rescue-ashblock_memory_1");
      await expect(rescue).toBeVisible({ timeout: 15000 });
      const rescueRect = await rescue.boundingBox();
      expect(rescueRect).not.toBeNull();
      expect(rescueRect!.x).toBeGreaterThanOrEqual(0);
      expect(rescueRect!.x + rescueRect!.width).toBeLessThanOrEqual(target.width);
      await rescue.tap({ timeout: 30000 });
      await expect.poll(async () => page.evaluate(async () => {
        const { useAdventure } = await import("/src/lib/stores/useAdventure.ts");
        return useAdventure.getState().objectives.memoryRescues.filter(n => n.rescued).length;
      }), { timeout: 25000 }).toBe(1);

      console.log("M6_TOUCH_PASS", JSON.stringify({ device: target.name, rescued: 1,
        models: modelEvidence, viewport: [target.width, target.height] }));
      expect(exceptions).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
