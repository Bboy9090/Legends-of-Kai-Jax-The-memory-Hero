#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = '/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/7d32b628-cc02-56f6-bb6d-0a77b7d91ed7/scratchpad/screenshots';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    // Ensure screenshots directory exists
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // Collect errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      errors.push(`Page Error: ${err.message}`);
    });

    console.log('[VERIFICATION] Loading game at', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for game to initialize
    await page.waitForTimeout(3000);
    console.log('[VERIFICATION] Game loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-game-loaded.png` });
    console.log('[SCREENSHOT] 01-game-loaded.png');

    // Check if runner store is available
    const storeReady = await page.evaluate(() => {
      return Boolean((window).runnerStore);
    });
    console.log(`[VERIFICATION] Runner store available: ${storeReady}`);

    if (!storeReady) {
      console.error('[ERROR] Runner store not initialized!');
      process.exit(1);
    }

    // Navigate to adventure mode (Mission 4)
    console.log('[VERIFICATION] Navigating to adventure mode...');
    await page.evaluate(() => {
      (window).runnerStore.getState().setGameState('adventure');
    });

    await page.waitForTimeout(5000);

    // Wait for canvas to be visible
    const canvasVisible = await page.waitForSelector('canvas', { timeout: 20000 });
    console.log('[VERIFICATION] Canvas mounted for adventure mode');

    // Take screenshot of mission 4
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-mission-4-arena.png` });
    console.log('[SCREENSHOT] 02-mission-4-arena.png');

    // Go back to main menu
    await page.evaluate(() => {
      (window).runnerStore.getState().setGameState('menu');
    });
    await page.waitForTimeout(3000);

    // Navigate to versus mode (Mission 5)
    console.log('[VERIFICATION] Navigating to versus mode...');
    await page.evaluate(() => {
      (window).runnerStore.getState().setGameState('versus-select');
    });

    // Wait for UI to render
    const fighterSelect = await page.waitForSelector('text=Choose', { timeout: 15000 });
    console.log('[VERIFICATION] Fighter select screen ready');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-versus-select.png` });
    console.log('[SCREENSHOT] 03-versus-select.png');

    // Click fight button
    await page.click('button:has-text("FIGHT")', { timeout: 5000 });
    console.log('[VERIFICATION] Fight button clicked');

    // Wait for battle canvas
    await page.waitForSelector('canvas', { timeout: 20000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-battle-arena.png` });
    console.log('[SCREENSHOT] 04-battle-arena.png');

    // Summary
    console.log('\n[VERIFICATION SUMMARY]');
    console.log(`✓ Game loaded successfully`);
    console.log(`✓ Adventure mode mounted`);
    console.log(`✓ Versus mode mounted`);
    console.log(`✓ Battle arena rendered`);

    if (errors.length === 0) {
      console.log(`✓ No critical errors detected`);
    } else {
      console.log(`⚠ Errors detected:`);
      errors.forEach(e => console.log(`  - ${e}`));
    }

    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
