import { test } from '@playwright/test';

test('capture full debug logs and screenshot', async ({ page }) => {
  const allLogs: string[] = [];
  
  page.on('console', msg => {
    allLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Navigate to character-select
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('button').filter({ hasText: /Enter Game/i }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('button').filter({ hasText: /story/i }).nth(1).click();
  await page.waitForTimeout(2000);
  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).first().click();
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/capture-full-debug.png', maxWidth: 1280, maxHeight: 720 });
  
  // Print ALL console logs
  console.log('\n========== FULL CONSOLE OUTPUT ==========');
  allLogs.forEach((log, i) => {
    console.log(`${i + 1}. ${log}`);
  });
  console.log('========== END CONSOLE OUTPUT ==========\n');
});
