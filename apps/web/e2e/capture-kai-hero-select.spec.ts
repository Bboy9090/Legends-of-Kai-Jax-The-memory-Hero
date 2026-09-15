import { test } from '@playwright/test';

test('capture Kai hero selection screen with improved presentation', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Navigate to character select
  await page.locator('button').filter({ hasText: /Enter Game/i }).click();
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("STORY HUB")').first().click();
  await page.waitForTimeout(1200);

  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).click();
  await page.waitForTimeout(2500);

  // Kai should be selected by default, capture his hero card
  await page.screenshot({
    path: '/tmp/kai-hero-select-screen.png',
    maxWidth: 1920,
    maxHeight: 1440
  });

  console.log('✓ Kai hero-select screen captured');
  console.log('  Location: /tmp/kai-hero-select-screen.png');
});
