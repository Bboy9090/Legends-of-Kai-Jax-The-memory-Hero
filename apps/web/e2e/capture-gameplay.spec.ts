import { test } from '@playwright/test';

test('capture kai in ashblock gameplay', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click Enter Game
  await page.locator('button:has-text("Enter Game")').click();
  await page.waitForTimeout(3000);
  
  // Click on Kai (first hero option)
  const heroes = page.locator('button, div[role="button"]').filter({ hasText: /kai|jax/i });
  if (await heroes.first().isVisible()) {
    await heroes.first().click();
    await page.waitForTimeout(3000);
    
    // Start the mission
    const startBtn = page.locator('button').filter({ hasText: /start|play|enter/i }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(4000);
      
      // Wait for game to render
      await page.waitForSelector('canvas', { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      // Capture Kai in action
      await page.screenshot({ path: '/tmp/03-kai-gameplay.png', fullPage: true });
      console.log('✓ Kai gameplay screenshot captured');
    }
  }
});
