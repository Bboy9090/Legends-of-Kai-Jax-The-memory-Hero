import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page) {
  await page.setViewportSize({ width: 1024, height: 768 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).runnerStore?.persist?.hasHydrated?.()));
  await page.getByTestId('game-intro').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
  return errors;
}

test('Customization lists fighters grouped by role (it used to render empty)', async ({ page }) => {
  const errors = await boot(page);
  await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'customization' }));
  for (const heading of ['Heroes', 'Rivals', 'Enemies', 'Bosses']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  const cards = page.locator('h3');
  expect(await cards.count()).toBeGreaterThan(10);
  await expect(page.getByText(/POW \d+ · SPD \d+ · DEF \d+/).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('Settings mute button toggles audio without throwing (toggleMute was undefined)', async ({ page }) => {
  const errors = await boot(page);
  await page.evaluate(() => (window as any).runnerStore.setState({ gameState: 'settings' }));
  const toggle = page.getByText('Master Mute').locator('xpath=../..').getByRole('button');
  await expect(toggle).toHaveClass(/bg-blue-600/); // audible by default
  await toggle.click();
  await expect(toggle).toHaveClass(/bg-gray-700/); // muted
  await toggle.click();
  await expect(toggle).toHaveClass(/bg-blue-600/);
  expect(errors).toEqual([]);
});

test('District select launches a district and records the campaign node (setCampaignCurrentNode was undefined)', async ({ page }) => {
  const errors = await boot(page);
  // District 1 unlocks once the campaign 'start' node is complete.
  await page.evaluate(() => (window as any).runnerStore.setState({ campaignCompletedNodes: ['start'], gameState: 'district-select' }));
  const firstDistrict = page.locator('.space-y-3 > button:not([disabled])').first();
  await firstDistrict.click();
  await page.waitForFunction(() => (window as any).runnerStore.getState().gameState === 'adventure', null, { timeout: 15_000 });
  const node = await page.evaluate(() => (window as any).runnerStore.getState().campaignCurrentNode);
  expect(node).toMatch(/^district-\d$/);
  expect(errors).toEqual([]);
});
