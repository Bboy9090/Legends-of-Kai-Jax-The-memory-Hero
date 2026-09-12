import { test } from '@playwright/test';

test('capture Kai gameplay action', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('✓ Main menu loaded');
  
  // Click Enter Game button to go to hero select
  const enterGameBtn = page.locator('button').filter({ hasText: /Enter Game/i });
  if (await enterGameBtn.isVisible()) {
    await enterGameBtn.click();
    await page.waitForTimeout(3000);
    console.log('✓ Navigated to hero select');
  }
  
  // Wait for canvas to render
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // Click on Kai character to select
  const kaiBtn = page.locator('button').filter({ hasText: /Kai/i }).first();
  if (await kaiBtn.isVisible()) {
    await kaiBtn.click();
    await page.waitForTimeout(3000);
    console.log('✓ Selected Kai');
  }
  
  // Look for mission/start button
  await page.waitForTimeout(2000);
  
  // Try to find and click Ashblock mission
  const ashblockBtn = page.locator('button').filter({ hasText: /Ashblock|ashblock/i }).first();
  if (await ashblockBtn.isVisible()) {
    await ashblockBtn.click();
    await page.waitForTimeout(5000);
    console.log('✓ Started Ashblock mission');
    
    // Wait for gameplay canvas to render
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Move Kai around to show the character in action
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    
    // Take screenshot of Kai in gameplay
    await page.screenshot({ path: '/tmp/03-kai-gameplay-action.png', fullPage: true });
    console.log('✓ Kai gameplay action captured');
  } else {
    console.log('Could not find Ashblock button, taking screenshot of current state');
    await page.screenshot({ path: '/tmp/03-kai-gameplay-action.png', fullPage: true });
  }
});
