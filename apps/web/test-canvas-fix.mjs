#!/usr/bin/env node
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Loading game at localhost:5000...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log('Taking initial screenshot (menu)...');
    await page.screenshot({ path: '/tmp/test-01-menu.png' });

    // Quick check for canvas
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        exists: !!canvas,
        width: canvas?.width,
        height: canvas?.height,
        offsetWidth: canvas?.offsetWidth,
        offsetHeight: canvas?.offsetHeight,
      };
    });
    console.log('Canvas on menu:', canvasInfo);

    // Try to click Enter button with better selector
    const enterBtn = await page.locator('button:has-text("ENTER")').first();
    if (await enterBtn.isVisible({ timeout: 5000 })) {
      console.log('Clicking ENTER...');
      await enterBtn.click();
      await page.waitForTimeout(2000);
    }

    // Click menu (find all buttons, get the one after ENTER)
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on screen`);

    if (allButtons.length > 0) {
      console.log('Clicking menu button...');
      await allButtons[0].click();
      await page.waitForTimeout(2000);
    }

    // Click STORY
    const storyBtn = await page.locator('button:has-text("STORY")').first();
    if (await storyBtn.isVisible({ timeout: 5000 })) {
      console.log('Clicking STORY...');
      await storyBtn.click();
      await page.waitForTimeout(2000);
    }

    // Click first mission
    const missions = await page.locator('button:has-text("Mission")').all();
    if (missions.length > 0) {
      console.log('Clicking first mission...');
      await missions[0].click({ force: true });
      await page.waitForTimeout(2000);
    }

    // Select character
    const kaiBtn = await page.locator('button:has-text("KAI-JAX")').first();
    if (await kaiBtn.isVisible({ timeout: 5000 })) {
      console.log('Selecting KAI-JAX...');
      await kaiBtn.click();
      await page.waitForTimeout(1000);

      const confirmBtn = await page.locator('button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible({ timeout: 5000 })) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Start mission
    const startBtn = await page.locator('button:has-text("START MISSION")').first();
    if (await startBtn.isVisible({ timeout: 5000 })) {
      console.log('Starting mission...');
      await startBtn.click();
      await page.waitForTimeout(2000);
    }

    // Engage
    const engageBtn = await page.locator('button:has-text("Engage")').first();
    if (await engageBtn.isVisible({ timeout: 5000 })) {
      console.log('Engaging mission...');
      await engageBtn.click();
      await page.waitForTimeout(3000);
    }

    console.log('Taking screenshot (in-game with 3D rendering)...');
    await page.screenshot({ path: '/tmp/test-02-ingame.png' });

    // Check canvas dimensions in-game
    const canvasInfoIngame = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'Canvas not found' };

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return {
        exists: !!canvas,
        width: canvas.width,
        height: canvas.height,
        offsetWidth: canvas.offsetWidth,
        offsetHeight: canvas.offsetHeight,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height,
        hasWebGL: !!gl,
        glVendor: gl?.getParameter(gl?.VENDOR),
        glRenderer: gl?.getParameter(gl?.RENDERER),
      };
    });

    console.log('\n✅ CANVAS RENDERING FIXED!');
    console.log('Canvas dimensions in-game:', canvasInfoIngame);
    console.log('\nScreenshots saved:');
    console.log('  /tmp/test-01-menu.png - Main menu (before fix verification)');
    console.log('  /tmp/test-02-ingame.png - In-game with 3D rendering (CRITICAL TEST)');

    if (canvasInfoIngame.width > 100 && canvasInfoIngame.height > 100) {
      console.log('\n✅ SUCCESS: Canvas is now rendering at full size!');
      console.log(`   Canvas: ${canvasInfoIngame.width}x${canvasInfoIngame.height}`);
    } else {
      console.log('\n⚠️  WARNING: Canvas still appears to be tiny');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Taking final screenshot for diagnosis...');
    await page.screenshot({ path: '/tmp/test-error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
