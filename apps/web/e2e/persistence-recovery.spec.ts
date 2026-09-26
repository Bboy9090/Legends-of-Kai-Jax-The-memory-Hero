import { expect, test, type Page } from '@playwright/test';

async function bootClean(page: Page) {
  // Clear persistent state exactly once. Do not install a navigation-time hook:
  // these tests intentionally reload the page to prove the save survives.
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.evaluate(() => localStorage.removeItem('kai-jax-save'));
  await page.reload();
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState), null, {
    timeout: 15_000,
  });
}

test.describe('runner persistence and interruption recovery', () => {
  test('mission completion de-duplicates and survives reload', async ({ page }) => {
    await bootClean(page);

    await page.evaluate(() => {
      const store = (window as any).runnerStore;
      store.getState().setMissionCompleted('vertical_slice_ashblock_heights');
      store.getState().setMissionCompleted('vertical_slice_ashblock_heights');
    });

    await page.reload();
    await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState));

    const state = await page.evaluate(() => {
      const s = (window as any).runnerStore.getState();
      return {
        completed: s.completedStoryMissionIds,
        profileCompleted: s.profiles[0].completedStoryMissionIds,
      };
    });

    expect(state.completed).toEqual(['vertical_slice_ashblock_heights']);
    expect(state.profileCompleted).toEqual(['vertical_slice_ashblock_heights']);
  });

  test('profile progress remains isolated across reload and profile switching', async ({ page }) => {
    await bootClean(page);

    await page.evaluate(() => {
      const s = (window as any).runnerStore.getState();
      s.setMissionCompleted('profile-zero-mission');
      s.switchProfile(1);
      (window as any).runnerStore.getState().setMissionCompleted('profile-one-mission');
    });

    await page.reload();
    await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState));

    const afterReload = await page.evaluate(() => {
      const s = (window as any).runnerStore.getState();
      return {
        activeProfileIndex: s.activeProfileIndex,
        activeCompleted: s.completedStoryMissionIds,
        p0: s.profiles[0].completedStoryMissionIds,
        p1: s.profiles[1].completedStoryMissionIds,
      };
    });

    expect(afterReload.activeProfileIndex).toBe(1);
    expect(afterReload.activeCompleted).toEqual(['profile-one-mission']);
    expect(afterReload.p0).toEqual(['profile-zero-mission']);
    expect(afterReload.p1).toEqual(['profile-one-mission']);

    const switched = await page.evaluate(() => {
      const store = (window as any).runnerStore;
      store.getState().switchProfile(0);
      const s = store.getState();
      return { activeProfileIndex: s.activeProfileIndex, completed: s.completedStoryMissionIds };
    });

    expect(switched).toEqual({
      activeProfileIndex: 0,
      completed: ['profile-zero-mission'],
    });
  });

  test('transient mission state resets across reload while durable preference and progress survive', async ({ page }) => {
    await bootClean(page);

    await page.evaluate(() => {
      const store = (window as any).runnerStore;
      store.getState().setCharacter('jax');
      store.getState().setActiveStoryMission('vertical_slice_ashblock_heights');
      store.getState().setTrainingSession(true);
      store.getState().setGameState('vertical-slice');
      store.getState().setMissionCompleted('vertical_slice_ashblock_heights');
    });

    await page.reload();
    await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState));

    const state = await page.evaluate(() => {
      const s = (window as any).runnerStore.getState();
      return {
        gameState: s.gameState,
        selectedCharacter: s.selectedCharacter,
        activeStoryMissionId: s.activeStoryMissionId,
        trainingSession: s.trainingSession,
        campaignCurrentNode: s.campaignCurrentNode,
        completed: s.completedStoryMissionIds,
      };
    });

    expect(state).toEqual({
      gameState: 'lore-hub',
      selectedCharacter: 'jax',
      activeStoryMissionId: null,
      trainingSession: false,
      campaignCurrentNode: null,
      completed: ['vertical_slice_ashblock_heights'],
    });
  });

  test('legacy save migration normalizes Kai-Jax and quarantines stale campaign pointer', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('kai-jax-save', JSON.stringify({
        version: 2,
        state: {
          gameState: 'campaign-map',
          selectedCharacter: 'kaijax',
          activeStoryMissionId: null,
          trainingSession: false,
          campaignCurrentNode: 'district-4',
          activeProfileIndex: 0,
          profiles: [
            {
              totalScore: 99,
              campaignCompletedNodes: ['start', 'district-1'],
              completedStoryMissionIds: ['vertical_slice_ashblock_heights'],
              completedRoamDistrictIds: [],
              unlockedUpgrades: [],
              kaiJaxFusionUnlocked: true,
              lastPlayedTitle: null,
            },
            {},
            {},
          ],
        },
      }));
    });

    await page.goto('/');
    await page.waitForFunction(() => Boolean((window as any).runnerStore?.getState));

    const migrated = await page.evaluate(() => {
      const s = (window as any).runnerStore.getState();
      return {
        selectedCharacter: s.selectedCharacter,
        campaignCurrentNode: s.campaignCurrentNode,
        completed: s.completedStoryMissionIds,
        fusion: s.kaiJaxFusionUnlocked,
        score: s.totalScore,
      };
    });

    expect(migrated).toEqual({
      selectedCharacter: 'kai-jax',
      campaignCurrentNode: null,
      completed: ['vertical_slice_ashblock_heights'],
      fusion: true,
      score: 99,
    });
  });
});
