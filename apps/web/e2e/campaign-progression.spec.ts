import { test, expect } from '@playwright/test';

const missionId = (number: number) => `story_act${number <= 5 ? 1 : number <= 10 ? 2 : 3}_m${number}`;

async function enterHub(page: import('@playwright/test').Page, completed: number[]) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.evaluate((ids) => {
    const runner = (window as any).runnerStore;
    runner.setState({ completedStoryMissionIds: ids, gameState: 'story-hub' });
  }, completed.map(missionId));
  await expect(page.getByTestId('campaign-mission-list')).toBeVisible();
}

for (const [name, completed, unlocked, locked] of [
  ['fresh', [], 1, 2],
  ['mission 1 complete', [1], 2, 3],
  ['act 1 nearing completion', [1,2,3,4], 5, 6],
  ['final mission', Array.from({length: 14}, (_, i) => i + 1), 15, null],
] as const) {
  test(`campaign navigation: ${name}`, async ({page}) => {
    test.setTimeout(60000);
    await enterHub(page, [...completed]);
    const unlockedButton = page.locator(`[data-mission-id="${missionId(unlocked)}"]`);
    await expect(unlockedButton).toBeEnabled();
    if (locked !== null) await expect(page.locator(`[data-mission-id="${missionId(locked)}"]`)).toBeDisabled();
    await unlockedButton.click();
    await expect.poll(() => page.evaluate(() => (window as any).runnerStore.getState().activeStoryMissionId)).toBe(missionId(unlocked));
    await expect.poll(() => page.evaluate(() => (window as any).runnerStore.getState().gameState)).toBe('character-select');
  });
}

test('switching save profiles changes mission availability', async ({page}) => {
  await enterHub(page, []);
  const second = page.locator(`[data-mission-id="${missionId(2)}"]`);
  await expect(second).toBeDisabled();
  await page.evaluate(() => {
    const store = (window as any).runnerStore;
    const state = store.getState();
    const profiles = state.profiles.map((profile: any, i: number) => i === 1 ? {...profile, completedStoryMissionIds: ['story_act1_m1']} : profile);
    store.setState({ profiles });
    store.getState().switchProfile(1);
  });
  await expect(second).toBeEnabled();
  await page.evaluate(() => (window as any).runnerStore.getState().switchProfile(0));
  await expect(second).toBeDisabled();
});
