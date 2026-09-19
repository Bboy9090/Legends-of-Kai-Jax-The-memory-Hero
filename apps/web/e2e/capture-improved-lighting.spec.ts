import { test, expect } from '@playwright/test';

test('capture improved character lighting in story hero select', async ({ page, context }) => {
  // Set up console logging
  const logs: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log' && msg.text().includes('[ProductionCharacterVisual]')) {
      logs.push(msg.text());
    }
  });

  await page.goto('http://localhost:3000');

  // Navigate: LoreHub → Menu → Story Hub → Character Select
  await page.waitForLoadState('networkidle');

  // Click "Enter Game" button
  const enterGameBtn = page.locator('button').filter({ hasText: /Enter Game/i });
  await enterGameBtn.click();

  // Wait for menu to load
  await page.waitForTimeout(1500);

  // Click "STORY HUB" button in the menu (more specific selector)
  await page.locator('button:has-text("STORY HUB")').first().click();

  // Wait for story hub to load
  await page.waitForTimeout(1500);

  // Click "CHANGE HERO" button to reach character select
  const changeHeroBtn = page.locator('button').filter({ hasText: /CHANGE HERO/i });
  await changeHeroBtn.click();

  // Wait for character select and 3D models to load
  await page.waitForTimeout(2000);

  // Wait for console logs to appear
  await page.waitForTimeout(500);

  // Capture viewport screenshot showing improved lighting
  await page.screenshot({
    path: '/tmp/kai-character-improved-lighting.png',
    maxWidth: 1920,
    maxHeight: 1440
  });

  console.log('✓ Screenshot captured: /tmp/kai-character-improved-lighting.png');
  console.log('Console logs received:', logs.length);
  logs.forEach(log => console.log('  ' + log));
});
