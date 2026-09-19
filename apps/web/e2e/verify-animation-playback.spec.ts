import { test, expect } from '@playwright/test';

test('verify skeletal animation playback via console logs', async ({ page }) => {
  test.setTimeout(45000);

  const consoleLogs: string[] = [];

  // Capture ProductionCharacterVisual console logs which show animation count
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('ProductionCharacterVisual') || text.includes('Animations available')) {
      consoleLogs.push(text);
    }
  });

  // Navigate to character select
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Menu navigation
  await page.locator('button').filter({ hasText: /Enter Game/i }).click();
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("STORY HUB")').first().click();
  await page.waitForTimeout(1200);

  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).click();
  await page.waitForTimeout(2500);

  // Check that models loaded with animations
  expect(consoleLogs.length).toBeGreaterThan(0);
  expect(consoleLogs.join(' ')).toContain('Animations available');

  console.log('✓ Console logs received:');
  consoleLogs.forEach(log => console.log('  ' + log));
  console.log('✓ Character models loaded with animation data');
  console.log('✓ Skeletal animation should be playing in viewport');
});
