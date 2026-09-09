import { test } from '@playwright/test';

test('final character model capture', async ({ page }) => {
  // Navigate sequence: LoreHub → menu → story-hub → character-select
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Enter Game
  await page.locator('button').filter({ hasText: /Enter Game/i }).first().click();
  await page.waitForTimeout(1500);
  
  // STORY HUB
  await page.locator('button').filter({ hasText: /story/i }).nth(1).click();
  await page.waitForTimeout(2000);
  
  // CHANGE HERO
  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).first().click();
  await page.waitForTimeout(2000);
  
  // Take simple screenshot (no fullPage, no wait)
  await page.screenshot({ path: '/tmp/kai-character-render.png', maxWidth: 1280, maxHeight: 720 });
  console.log('✓ Screenshot saved: /tmp/kai-character-render.png');
});
