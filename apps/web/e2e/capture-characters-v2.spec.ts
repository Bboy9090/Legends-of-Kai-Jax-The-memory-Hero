import { test } from '@playwright/test';

test('navigate to hero select and capture character models', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('✓ Main menu loaded');
  
  // Find and click story/mission button - try multiple selectors
  const buttons = await page.locator('button').allTextContents();
  console.log('Available buttons:', buttons.slice(0, 10));
  
  // Try clicking by text
  const storyOrMission = page.locator('button').filter({ hasText: /story|Mission|mission/i });
  const count = await storyOrMission.count();
  console.log(`Found ${count} story/mission buttons`);
  
  if (count > 0) {
    await storyOrMission.first().click();
    await page.waitForTimeout(3000);
    console.log('✓ Clicked story/mission button');
  } else {
    // Try clicking any button that might lead to story
    const firstBtn = page.locator('button').first();
    if (await firstBtn.isVisible()) {
      const text = await firstBtn.textContent();
      console.log('Clicking first button:', text);
      await firstBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  
  // Look for canvas and wait for THREE.js to render
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/02-story-hero-select.png', fullPage: true });
  console.log('✓ Hero select with character models captured');
});
