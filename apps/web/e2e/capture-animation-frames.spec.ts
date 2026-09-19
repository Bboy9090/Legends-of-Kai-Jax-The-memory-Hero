import { test } from '@playwright/test';

test('capture animation frames to prove skeletal animation is advancing', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Navigate to character select
  await page.locator('button').filter({ hasText: /Enter Game/i }).click();
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("STORY HUB")').first().click();
  await page.waitForTimeout(1200);

  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).click();
  await page.waitForTimeout(2500);

  // Capture frame sequence to show animation progression
  console.log('Capturing animation frame sequence...');

  // Frame 1 - initial state
  await page.screenshot({
    path: '/tmp/animation-frame-0000ms.png',
    maxWidth: 1920,
    maxHeight: 1440
  });
  console.log('✓ Frame 0 (0ms) captured');

  // Wait for animation to progress
  await page.waitForTimeout(200);

  // Frame 2 - animation progressed
  await page.screenshot({
    path: '/tmp/animation-frame-0200ms.png',
    maxWidth: 1920,
    maxHeight: 1440
  });
  console.log('✓ Frame 1 (200ms) captured');

  // Wait more
  await page.waitForTimeout(200);

  // Frame 3 - further progression
  await page.screenshot({
    path: '/tmp/animation-frame-0400ms.png',
    maxWidth: 1920,
    maxHeight: 1440
  });
  console.log('✓ Frame 2 (400ms) captured');

  // Wait more
  await page.waitForTimeout(200);

  // Frame 4 - even further
  await page.screenshot({
    path: '/tmp/animation-frame-0600ms.png',
    maxWidth: 1920,
    maxHeight: 1440
  });
  console.log('✓ Frame 3 (600ms) captured');

  console.log('✓ Animation frame sequence complete');
  console.log('  /tmp/animation-frame-0000ms.png');
  console.log('  /tmp/animation-frame-0200ms.png');
  console.log('  /tmp/animation-frame-0400ms.png');
  console.log('  /tmp/animation-frame-0600ms.png');
  console.log('✓ If character pose changes across frames, idle animation is advancing');
});
