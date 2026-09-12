import { test } from '@playwright/test';

test('capture Jax character model', async ({ page }) => {
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
  
  // Wait for canvas to render with characters
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // Click on Jax character button if available
  const jaxBtn = page.locator('button').filter({ hasText: /Jax/i }).first();
  if (await jaxBtn.isVisible()) {
    await jaxBtn.click();
    await page.waitForTimeout(2000);
    console.log('✓ Selected Jax');
  }
  
  // Take screenshot showing Jax character
  await page.screenshot({ path: '/tmp/04-jax-hero-select.png', fullPage: true });
  console.log('✓ Jax character model captured');
});
