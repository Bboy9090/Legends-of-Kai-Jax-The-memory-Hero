import { test } from '@playwright/test';

test('full navigation to character select with detailed logging', async ({ page }) => {
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('ProductionCharacterVisual') || text.includes('gameState')) {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });
  
  // Navigate to menu
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Step 1: Main menu loaded');
  
  // List all buttons to find the right one
  const allButtonTexts = await page.locator('button').allTextContents();
  console.log('Available buttons on menu:', allButtonTexts.slice(0, 15));
  
  // Look for story-hub navigation button
  // From code we saw: "CONTINUE" or "STORY HUB" buttons exist
  let found = false;
  for (const text of ['CONTINUE', 'STORY HUB', 'Story', 'story']) {
    const btn = page.locator('button').filter({ hasText: new RegExp(text, 'i') }).first();
    if (await btn.isVisible()) {
      console.log(`Step 2: Found "${text}" button, clicking...`);
      await btn.click();
      await page.waitForTimeout(3000);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log('Step 2: Could not find story navigation button');
  }
  
  // Now look for CHANGE HERO to go to character-select
  const changeHeroBtn = page.locator('button').filter({ hasText: /CHANGE HERO/i }).first();
  if (await changeHeroBtn.isVisible()) {
    console.log('Step 3: Found "CHANGE HERO" button, clicking...');
    await changeHeroBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Step 3: "CHANGE HERO" not found');
  }
  
  // Check what state we're in now
  const charPreviewCount = await page.locator('[data-testid="character-preview-3d"]').count();
  console.log(`Step 4: Found ${charPreviewCount} character preview elements`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/full-nav-with-logs.png', fullPage: true });
  
  // Output console logs
  console.log('\n=== PRODUCTION CHARACTER VISUAL LOGS ===');
  consoleLogs.forEach(log => console.log(log));
  console.log('=== END LOGS ===');
});
