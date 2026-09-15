import { test } from '@playwright/test';

test('capture Jax hero selection screen with improved presentation', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Navigate to character select
  await page.locator('button').filter({ hasText: /Enter Game/i }).click();
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("STORY HUB")').first().click();
  await page.waitForTimeout(1200);

  await page.locator('button').filter({ hasText: /CHANGE HERO/i }).click();
  await page.waitForTimeout(2500);

  // Click on Jax hero card to select him
  // Jax is typically the second hero option in the character select
  const heroCards = page.locator('[data-testid="hero-card"], button:has-text("JAX")');
  const jaxCard = heroCards.locator('text=JAX').first();

  // If JAX button exists, click it
  const jaxBtn = page.locator('button').filter({ hasText: /JAX/ }).first();
  if (await jaxBtn.isVisible()) {
    await jaxBtn.click();
    await page.waitForTimeout(800);
  }

  // Capture Jax hero-select screen
  await page.screenshot({
    path: '/tmp/jax-hero-select-screen.png',
    maxWidth: 1920,
    maxHeight: 1440
  });

  console.log('✓ Jax hero-select screen captured');
  console.log('  Location: /tmp/jax-hero-select-screen.png');
});
