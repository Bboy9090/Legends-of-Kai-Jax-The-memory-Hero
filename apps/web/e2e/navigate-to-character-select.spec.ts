import { test } from '@playwright/test';

test('navigate to character select via correct button sequence', async ({ page }) => {
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('ProductionCharacterVisual') || text.includes('[')) {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });
  
  // LoreHub - start
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  let buttons = await page.locator('button').allTextContents();
  console.log('LoreHub buttons:', buttons.slice(0, 5));
  
  // Click "Enter Game" to go to menu
  const enterGameBtn = page.locator('button').filter({ hasText: /Enter Game/i }).first();
  await enterGameBtn.click();
  await page.waitForTimeout(2000);
  buttons = await page.locator('button').allTextContents();
  console.log('\nAfter "Enter Game" buttons:', buttons.slice(0, 10));
  
  // From LegendaryMainMenu, look for first story-related button
  const storyBtn = page.locator('button').filter({ hasText: /story|CONTINUE/i }).nth(1); // Try second one
  const btnText = await storyBtn.textContent();
  if (btnText) {
    console.log(`\nClicking button: "${btnText.trim()}"`);
    await storyBtn.click();
    await page.waitForTimeout(3000);
    buttons = await page.locator('button').allTextContents();
    console.log('After story button:', buttons.slice(0, 10));
  }
  
  // Look for CHANGE HERO
  const changeHeroBtn = page.locator('button').filter({ hasText: /CHANGE HERO/i }).first();
  if (await changeHeroBtn.isVisible()) {
    console.log('\nFound "CHANGE HERO", clicking...');
    await changeHeroBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('\n"CHANGE HERO" not found');
  }
  
  // Check for character preview
  const previewCount = await page.locator('[data-testid="character-preview-3d"]').count();
  console.log(`Character preview elements: ${previewCount}`);
  
  // Check console for ProductionCharacterVisual logs
  if (consoleLogs.length > 0) {
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
  }
  
  // Screenshot
  await page.screenshot({ path: '/tmp/navigate-to-select.png', fullPage: true });
});
