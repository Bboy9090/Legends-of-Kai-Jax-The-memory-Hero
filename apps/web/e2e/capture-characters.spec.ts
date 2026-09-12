import { test, expect } from '@playwright/test';

test('capture character models', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Capture main screen
  await page.screenshot({ path: '/tmp/01-main-menu.png', fullPage: true });
  console.log('Main menu captured');
  
  // Click Story button
  const storyBtn = page.locator('button').filter({ hasText: /story|mission/i }).first();
  if (await storyBtn.isVisible({ timeout: 5000 })) {
    await storyBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/02-story-menu.png', fullPage: true });
    console.log('Story menu captured');
    
    // Click first available mission (Ashblock)
    const missions = page.locator('[data-testid*="mission"], button:has-text("Ashblock")');
    const mission = missions.first();
    if (await mission.isVisible({ timeout: 5000 })) {
      await mission.click();
      await page.waitForTimeout(3000);
      
      // Wait for character models to load and render
      await page.waitForSelector('canvas', { timeout: 5000 });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: '/tmp/03-hero-select-kai-jax.png', fullPage: true });
      console.log('Hero select captured (Kai & Jax models)');
    }
  }
});
