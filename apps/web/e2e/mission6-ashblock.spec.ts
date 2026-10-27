import { test, expect } from "@playwright/test";

test("M6: briefing enters real Ashblock arena with six active Void grunts and three sealed memories", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.waitForFunction(
    () => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()),
    null,
    { timeout: 25_000 },
  );
  await page.getByTestId("game-intro").waitFor({ state: "detached", timeout: 25_000 }).catch(() => {});
  await page.evaluate(() => {
    const store = (window as any).runnerStore.getState();
    store.setCharacter("kai-jax");
    store.setActiveStoryMission("story_act2_m6");
    store.setGameState("story-mode");
  });
  await expect(page.getByRole("heading", { name: "Shadows of the Ashblock" })).toBeVisible({ timeout: 25_000 });
  await page.getByRole("button", { name: "Engage Mission" }).click();
  await expect(page.getByText("I can feel another shard nearby.", { exact: false })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  const hud = page.getByTestId("mission6-memory-hud");
  await expect(hud).toBeVisible({ timeout: 50_000 });
  await expect(hud).toContainText("Trapped Memories 0/3");
  await expect(hud).toContainText("North Memory");
  await expect(hud).toContainText("East Memory");
  await expect(hud).toContainText("South Memory");
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("story-active-enemy-count")).toHaveText("6", { timeout: 30_000 });
  await page.waitForTimeout(1200);
  expect(errors).toEqual([]);
});
