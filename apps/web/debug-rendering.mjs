#!/usr/bin/env node
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Loading game at localhost:5000...');
    await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('Taking initial screenshot...');
    await page.screenshot({ path: '/tmp/debug-01-initial.png' });

    // Check for console errors
    page.on('console', msg => {
      console.log(`[CONSOLE] ${msg.text()}`);
    });

    page.on('error', err => {
      console.log(`[PAGE ERROR] ${err}`);
    });

    // Click Enter
    console.log('Clicking Enter...');
    const enterBtn = await page.locator('text=/Enter/i').first();
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
      await page.waitForTimeout(2000);
    }

    // Take screenshot after enter
    console.log('Taking screenshot after Enter...');
    await page.screenshot({ path: '/tmp/debug-02-after-enter.png' });

    // Click menu button
    console.log('Clicking menu...');
    const btn3 = await page.locator('button').nth(2);
    if (btn3) {
      await btn3.click();
      await page.waitForTimeout(2500);
    }

    console.log('Taking screenshot after menu...');
    await page.screenshot({ path: '/tmp/debug-03-menu.png' });

    // Click Story
    console.log('Clicking Story...');
    const storyBtn = await page.locator('button:has-text("STORY")').first();
    if (storyBtn && await storyBtn.isVisible()) {
      await storyBtn.click();
      await page.waitForTimeout(2500);
    }

    console.log('Taking screenshot after Story...');
    await page.screenshot({ path: '/tmp/debug-04-story.png' });

    // Click first mission
    console.log('Clicking first mission...');
    const missionBtns = await page.locator('button[data-mission-id]').all();
    if (missionBtns.length > 0) {
      await missionBtns[0].click({ force: true });
      await page.waitForTimeout(3000);
    }

    console.log('Taking screenshot after mission select...');
    await page.screenshot({ path: '/tmp/debug-05-mission.png' });

    // Select character
    console.log('Selecting Kai-Jax...');
    const kaiBtn = await page.locator('button:has-text("KAI-JAX")').first();
    if (kaiBtn && await kaiBtn.isVisible()) {
      await kaiBtn.click();
      await page.waitForTimeout(1000);

      const confirmBtn = await page.locator('button:has-text("Confirm")').first();
      if (confirmBtn && await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log('Taking screenshot after character select...');
    await page.screenshot({ path: '/tmp/debug-06-character.png' });

    // Start mission
    console.log('Starting mission...');
    const startBtn = await page.locator('button:has-text("START MISSION")').first();
    if (startBtn && await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('Taking screenshot after start mission...');
    await page.screenshot({ path: '/tmp/debug-07-briefing.png' });

    // Engage mission
    console.log('Engaging mission...');
    const engageBtn = await page.locator('button:has-text("Engage")').first();
    if (engageBtn && await engageBtn.isVisible()) {
      await engageBtn.click();
      await page.waitForTimeout(3000);
    }

    console.log('Taking screenshot after engage...');
    await page.screenshot({ path: '/tmp/debug-08-ingame.png' });

    // Check canvas and parent
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const parent = canvas?.parentElement;
      return {
        canvas: {
          exists: !!canvas,
          visible: canvas ? window.getComputedStyle(canvas).display !== 'none' : false,
          width: canvas?.width,
          height: canvas?.height,
          offsetWidth: canvas?.offsetWidth,
          offsetHeight: canvas?.offsetHeight,
          opacity: canvas ? window.getComputedStyle(canvas).opacity : null,
          display: canvas ? window.getComputedStyle(canvas).display : null,
          styleWidth: canvas?.style.width,
          styleHeight: canvas?.style.height,
        },
        parent: {
          exists: !!parent,
          clientWidth: parent?.clientWidth,
          clientHeight: parent?.clientHeight,
          offsetWidth: parent?.offsetWidth,
          offsetHeight: parent?.offsetHeight,
          display: parent ? window.getComputedStyle(parent).display : null,
          position: parent ? window.getComputedStyle(parent).position : null,
        },
        windowSize: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      };
    });

    console.log('Canvas & Parent info:', canvasInfo);

    // Try to get WebGL context info
    const glInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'Canvas not found' };

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'WebGL context not available' };

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
      };
    });

    console.log('WebGL info:', glInfo);

    console.log('Screenshots saved:');
    console.log('  /tmp/debug-01-initial.png - Main menu');
    console.log('  /tmp/debug-02-after-enter.png - After Enter click');
    console.log('  /tmp/debug-03-menu.png - Menu screen');
    console.log('  /tmp/debug-04-story.png - Story selection');
    console.log('  /tmp/debug-05-mission.png - Mission selected');
    console.log('  /tmp/debug-06-character.png - Character selected');
    console.log('  /tmp/debug-07-briefing.png - Mission briefing');
    console.log('  /tmp/debug-08-ingame.png - In-game (CRITICAL - 3D rendering here)');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
