import { test } from '@playwright/test';

test('capture characters and log console output', async ({ page }) => {
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
  });
  
  // Navigate
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click first button (Enter Game)
  const btn = page.locator('button').first();
  await btn.click();
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/capture-with-logs.png', fullPage: true });
  
  // Output all console logs
  console.log('\n=== CONSOLE OUTPUT ===');
  consoleLogs.forEach(log => console.log(log));
  console.log('=== END CONSOLE OUTPUT ===\n');
});
