#!/usr/bin/env node
/**
 * TASK 3: HUD Trace - Comprehensive Gameplay Screenshots
 * Captures: Mission/Adventure HUD, Training HUD, Versus HUD
 * Evidence: player visible, opponent visible, HUD visible, console errors
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/tmp/task3-hud-trace';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureGameplay(mode, viewport, filename) {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({ viewport });

  const consoleLogs = { errors: [], warnings: [], logs: [] };
  const networkErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleLogs.errors.push(text);
    if (msg.type() === 'warning') consoleLogs.warnings.push(text);
    if (msg.type() === 'log') consoleLogs.logs.push(text);
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log(`  [${mode}] Navigate to game...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log(`  [${mode}] Click PLAY GAME...`);
    await page.locator('button').filter({ hasText: /PLAY|Play/i }).first().click();
    await page.waitForTimeout(5000);

    if (mode === 'mission-gameplay') {
      console.log(`  [mission] Click START SAGA...`);
      await page.locator('button').filter({ hasText: /START|Story/i }).first().click();
      await page.waitForTimeout(3000);

      console.log(`  [mission] Click mission card...`);
      const missionCard = page.locator('button, [role="button"]').filter({ hasText: /Boss|Mission|Chapter/i }).first();
      if (await missionCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await missionCard.click();
        await page.waitForTimeout(2000);
      }

      console.log(`  [mission] Click BEGIN MISSION...`);
      const beginBtn = page.locator('button').filter({ hasText: /BEGIN|ENGAGE|Start/i }).first();
      if (await beginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await beginBtn.click();
        await page.waitForTimeout(3000);
      }

    } else if (mode === 'training-gameplay') {
      console.log(`  [training] Click Training Mode...`);
      await page.locator('button').filter({ hasText: /Training|training/i }).first().click();
      await page.waitForTimeout(4000);

    } else if (mode === 'versus-arena') {
      console.log(`  [versus] Click Versus Mode...`);
      await page.locator('button').filter({ hasText: /Versus|Battle/i }).first().click();
      await page.waitForTimeout(3000);

      console.log(`  [versus] Click character and FIGHT...`);
      const fightBtn = page.locator('button').filter({ hasText: /FIGHT/i }).first();
      if (await fightBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fightBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // Capture screenshot
    const screenshot = await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}` });
    console.log(`  ✓ ${filename} captured (${screenshot.length} bytes)`);

    // Analyze HUD state
    const hudState = await page.evaluate(() => {
      const state = {
        url: window.location.href,
        gameState: document.body.innerText.substring(0, 300),
        canvases: document.querySelectorAll('canvas').length,
        hud_elements: {
          health_bar: !!document.querySelector('[class*="health"], [class*="hp"], [class*="Health"]'),
          stamina_bar: !!document.querySelector('[class*="stamina"], [class*="sp"], [class*="Stamina"]'),
          combo_counter: !!document.querySelector('[class*="combo"], [class*="Combo"]'),
          timer: !!document.querySelector('[class*="timer"], [class*="Timer"], [class*="round"]'),
          controls: !!document.body.innerText.includes('WASD') || document.body.innerText.includes('Space')
        },
        visible_text: {
          player: document.body.innerText.includes('PLAYER'),
          opponent: document.body.innerText.includes('OPPONENT') || document.body.innerText.includes('Enemy'),
          attack: document.body.innerText.includes('ATTACK'),
          wave: document.body.innerText.includes('WAVE'),
          vs: document.body.innerText.includes('VS')
        },
        console_error_count: 0,
        html_size: document.documentElement.outerHTML.length
      };
      return state;
    });

    return {
      mode,
      viewport,
      filename,
      screenshot_size: screenshot.length,
      hud_state: hudState,
      console: {
        errors: consoleLogs.errors.length,
        error_samples: consoleLogs.errors.slice(0, 3),
        warnings: consoleLogs.warnings.length,
        logs: consoleLogs.logs.length
      },
      network_errors: networkErrors.length,
      network_error_samples: networkErrors.slice(0, 3)
    };

  } catch (err) {
    console.error(`  ✗ Error in ${mode}: ${err.message}`);
    return {
      mode,
      viewport,
      filename,
      error: err.message
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🎮 TASK 3: HUD Trace - Gameplay Screenshots\n');

  const tests = [
    ['mission-gameplay', { width: 390, height: 844 }, 'mission-gameplay-390x844.png'],
    ['mission-gameplay', { width: 1280, height: 720 }, 'mission-gameplay-1280x720.png'],
    ['training-gameplay', { width: 390, height: 844 }, 'training-gameplay-390x844.png'],
    ['training-gameplay', { width: 1280, height: 720 }, 'training-gameplay-1280x720.png'],
    ['versus-arena', { width: 390, height: 844 }, 'versus-arena-390x844.png'],
    ['versus-arena', { width: 1280, height: 720 }, 'versus-arena-1280x720.png']
  ];

  const results = [];

  for (const [mode, viewport, filename] of tests) {
    console.log(`\n[${tests.indexOf([mode, viewport, filename]) + 1}/${tests.length}] ${mode} @ ${viewport.width}x${viewport.height}`);
    const result = await captureGameplay(mode, viewport, filename);
    results.push(result);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ All screenshots captured');
  console.log(`📁 Location: ${SCREENSHOT_DIR}`);
  console.log(`${'='.repeat(80)}\n`);

  // Report table
  console.log('HUD STATE SUMMARY:\n');
  console.log('Mode | Viewport | File | Canvases | Health Bar | Stamina Bar | Combo | Timer | Controls | Player Text | Opponent Text | Console Errors | Network Errors');
  console.log('-'.repeat(180));

  for (const result of results) {
    if (result.error) {
      console.log(`${result.mode} | ${result.viewport.width}x${result.viewport.height} | ERROR: ${result.error}`);
      continue;
    }
    const hud = result.hud_state;
    const h = (v) => v ? '✓' : '✗';
    console.log(`${result.mode} | ${result.viewport.width}x${result.viewport.height} | ${result.filename} | ${hud.canvases} | ${h(hud.hud_elements.health_bar)} | ${h(hud.hud_elements.stamina_bar)} | ${h(hud.hud_elements.combo_counter)} | ${h(hud.hud_elements.timer)} | ${h(hud.hud_elements.controls)} | ${h(hud.visible_text.player)} | ${h(hud.visible_text.opponent)} | ${result.console.errors} | ${result.network_errors}`);
  }

  // Write full report
  fs.writeFileSync(`${SCREENSHOT_DIR}/task3-report.json`, JSON.stringify(results, null, 2));
  console.log(`\n📊 Full report: ${SCREENSHOT_DIR}/task3-report.json`);
}

main().catch(console.error);
