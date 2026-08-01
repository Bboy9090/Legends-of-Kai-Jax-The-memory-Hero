#!/usr/bin/env node
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/tmp/game-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureGameReady() {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    // Desktop viewport
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    console.log('🎮 Capturing game ready state...\n');

    // 1. Landing page
    console.log('[1/3] Navigating to landing page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    let screenshot = await page.screenshot({ path: `${SCREENSHOT_DIR}/01-landing.png` });
    console.log(`✓ Landing page captured (${screenshot.length} bytes)`);

    // 2. Main menu - click PLAY GAME
    console.log('[2/3] Entering main menu...');
    const playBtn = page.locator('button').filter({ hasText: /PLAY|Play/i }).first();
    await playBtn.click();
    await page.waitForTimeout(3000);

    screenshot = await page.screenshot({ path: `${SCREENSHOT_DIR}/02-main-menu.png` });
    console.log(`✓ Main menu captured (${screenshot.length} bytes)`);

    // 3. Game mode selection
    console.log('[3/3] Game mode selection screen...');
    // Wait for menu options to be visible
    await page.waitForTimeout(2000);

    screenshot = await page.screenshot({ path: `${SCREENSHOT_DIR}/03-game-modes.png` });
    console.log(`✓ Game modes captured (${screenshot.length} bytes)`);

    // Analyze page state
    const gameState = await page.evaluate(() => {
      const state = {
        title: document.title,
        canvases: document.querySelectorAll('canvas').length,
        buttons: Array.from(document.querySelectorAll('button')).slice(0, 5).map(b => b.textContent.trim()),
        has_heading: !!document.querySelector('h1, h2'),
        page_text: document.body.innerText.substring(0, 300)
      };
      return state;
    });

    console.log('\n📊 Game State Analysis:');
    console.log(`  Title: ${gameState.title}`);
    console.log(`  Canvases mounted: ${gameState.canvases}`);
    console.log(`  Visible buttons: ${gameState.buttons.length}`);
    console.log(`  First buttons: ${gameState.buttons.slice(0, 3).join(' | ')}`);

    console.log('\n✅ Game screenshot capture complete');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

    return {
      status: 'success',
      screenshots: [
        `${SCREENSHOT_DIR}/01-landing.png`,
        `${SCREENSHOT_DIR}/02-main-menu.png`,
        `${SCREENSHOT_DIR}/03-game-modes.png`
      ],
      game_state: gameState
    };

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return { status: 'error', error: err.message };
  } finally {
    if (browser) await browser.close();
  }
}

captureGameReady().then(result => {
  console.log('\n' + '='.repeat(80));
  console.log(JSON.stringify(result, null, 2));
});
