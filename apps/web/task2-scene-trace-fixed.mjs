#!/usr/bin/env node
/**
 * TASK 2 (Revised): Three.js Scene Trace - Simplified diagnostics
 * Focus: Console logs, model load attempts, scene readiness indicators
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';

async function traceTrainingMode() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 TASK 2: Training Mode Scene Diagnostics`);
  console.log(`${'='.repeat(80)}\n`);

  let browser;

  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    const consoleLogs = {
      errors: [],
      warnings: [],
      logs: [],
      modelLogs: []
    };

    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (type === 'error') {
        consoleLogs.errors.push(text);
      } else if (type === 'warning') {
        consoleLogs.warnings.push(text);
      } else if (type === 'log') {
        consoleLogs.logs.push(text);
      }

      if (text.toLowerCase().includes('model') ||
          text.toLowerCase().includes('load') ||
          text.toLowerCase().includes('404') ||
          text.toLowerCase().includes('fail') ||
          text.toLowerCase().includes('player') ||
          text.toLowerCase().includes('character')) {
        consoleLogs.modelLogs.push(`[${type}] ${text}`);
      }
    });

    // Navigate
    console.log(`[1/4] Navigate to game...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log(`  ✓ Landed`);

    // PLAY GAME
    console.log(`[2/4] Click PLAY GAME...`);
    await page.locator('button').filter({ hasText: /PLAY|Play/i }).first().click();
    await page.waitForTimeout(7000);
    console.log(`  ✓ Menu loaded`);

    // Training Mode
    console.log(`[3/4] Click Training Mode...`);
    await page.locator('button').filter({ hasText: /Training|training/i }).first().click();
    await page.waitForTimeout(4000);
    console.log(`  ✓ Training Mode scene mounted`);

    // Inspect scene
    console.log(`[4/4] Inspect scene state...`);

    const sceneState = await page.evaluate(() => {
      const state = {
        canvases: document.querySelectorAll('canvas').length,
        hud_bars: {
          hp: document.querySelector('[class*="hp"]') ? 'found' : 'not found',
          sp: document.querySelector('[class*="sp"]') ? 'found' : 'not found'
        },
        has_gradient: !!document.querySelector('[class*="gradient"]'),
        has_controls: {
          wasd: document.body.innerText.includes('WASD') || document.body.innerText.includes('W A S D'),
          space: document.body.innerText.includes('Space'),
          j_attack: document.body.innerText.includes('J'),
          k_skill: document.body.innerText.includes('K')
        },
        html_length: document.documentElement.outerHTML.length,
        body_text_sample: document.body.innerText.substring(0, 200)
      };
      return state;
    });

    console.log(`  Canvases: ${sceneState.canvases}`);
    console.log(`  HP bar visible: ${sceneState.hud_bars.hp}`);
    console.log(`  SP bar visible: ${sceneState.hud_bars.sp}`);
    console.log(`  Control labels found: ${Object.values(sceneState.has_controls).filter(v => v).length}/4`);
    console.log(`  HTML size: ${sceneState.html_length} bytes`);

    // Network monitor
    console.log(`\n📡 Checking for model loading attempts...`);
    const resourcesChecked = { glb: 0, json: 0, notFound: 0 };

    await page.on('response', (response) => {
      const url = response.url();
      if (url.includes('.glb')) resourcesChecked.glb++;
      if (url.includes('.json')) resourcesChecked.json++;
      if (response.status() === 404) resourcesChecked.notFound++;
    });

    await page.waitForTimeout(2000);

    console.log(`  GLB files loaded: ${resourcesChecked.glb}`);
    console.log(`  JSON files: ${resourcesChecked.json}`);
    console.log(`  404 errors: ${resourcesChecked.notFound}`);

    // Report console
    console.log(`\n📋 Console Messages:`);
    console.log(`  Errors: ${consoleLogs.errors.length}`);
    console.log(`  Warnings: ${consoleLogs.warnings.length}`);
    console.log(`  Model-related logs: ${consoleLogs.modelLogs.length}`);

    if (consoleLogs.errors.length > 0) {
      console.log(`\n  Error details:`);
      consoleLogs.errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
    }

    if (consoleLogs.modelLogs.length > 0) {
      console.log(`\n  Model-related logs:`);
      consoleLogs.modelLogs.slice(0, 10).forEach(log => console.log(`    ${log}`));
    }

    console.log(`\n✅ Training Mode diagnostics complete`);

    return {
      training_mode: {
        scene_state: sceneState,
        console: consoleLogs,
        resources: resourcesChecked
      }
    };

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return { error: err.message };
  } finally {
    if (browser) await browser.close();
  }
}

async function traceVersusArena() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 TASK 2: Versus Mode Arena Diagnostics`);
  console.log(`${'='.repeat(80)}\n`);

  let browser;

  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    const consoleLogs = {
      errors: [],
      warnings: [],
      logs: [],
      modelLogs: []
    };

    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (type === 'error') {
        consoleLogs.errors.push(text);
      } else if (type === 'warning') {
        consoleLogs.warnings.push(text);
      }

      if (text.toLowerCase().includes('model') || text.toLowerCase().includes('fighter') || text.toLowerCase().includes('load')) {
        consoleLogs.modelLogs.push(`[${type}] ${text}`);
      }
    });

    // Navigate
    console.log(`[1/5] Navigate...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log(`  ✓ Landed`);

    // PLAY GAME
    console.log(`[2/5] Click PLAY GAME...`);
    await page.locator('button').filter({ hasText: /PLAY|Play/i }).first().click();
    await page.waitForTimeout(7000);

    // Versus Mode
    console.log(`[3/5] Click Versus Mode...`);
    await page.locator('button').filter({ hasText: /Versus|Battle/i }).first().click();
    await page.waitForTimeout(3000);
    console.log(`  ✓ Character select loaded`);

    // Check state before FIGHT
    const beforeFight = await page.evaluate(() => ({
      on_select: document.body.innerText.includes('CHOOSE YOUR FIGHTER'),
      canvases: document.querySelectorAll('canvas').length
    }));

    console.log(`  Character select visible: ${beforeFight.on_select}, Canvases: ${beforeFight.canvases}`);

    // FIGHT
    console.log(`[4/5] Click FIGHT...`);
    const fightBtn = await page.locator('button').filter({ hasText: /FIGHT/i }).first();
    await fightBtn.click();
    await page.waitForTimeout(5000);
    console.log(`  ✓ Waiting for arena...`);

    // Check if arena loaded
    const afterFight = await page.evaluate(() => {
      return {
        still_on_select: document.body.innerText.includes('CHOOSE YOUR FIGHTER'),
        canvases: document.querySelectorAll('canvas').length,
        has_battle: document.body.innerText.includes('WAVE') || document.body.innerText.includes('ATTACK'),
        fighters_text: {
          p1: document.body.innerText.includes('PLAYER 1'),
          p2: document.body.innerText.includes('PLAYER 2'),
          opponent: document.body.innerText.includes('OPPONENT')
        }
      };
    });

    console.log(`\n⚠️  Arena Navigation Status:`);
    console.log(`  Still on character select: ${afterFight.still_on_select}`);
    console.log(`  Canvases mounted: ${afterFight.canvases}`);
    console.log(`  Battle indicators: ${afterFight.has_battle}`);
    console.log(`  Fighter text (P1/P2/OPP): ${afterFight.fighters_text.p1}/${afterFight.fighters_text.p2}/${afterFight.fighters_text.opponent}`);

    // [5/5] Console analysis
    console.log(`[5/5] Analyze console...`);
    console.log(`  Errors: ${consoleLogs.errors.length}`);
    console.log(`  Model-related logs: ${consoleLogs.modelLogs.length}`);

    if (consoleLogs.modelLogs.length > 0) {
      console.log(`  Model logs:`);
      consoleLogs.modelLogs.slice(0, 5).forEach(log => console.log(`    ${log}`));
    }

    console.log(`\n✅ Versus arena diagnostics complete`);

    return {
      versus_arena: {
        before_fight: beforeFight,
        after_fight: afterFight,
        console: consoleLogs,
        arena_loaded: !afterFight.still_on_select
      }
    };

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return { error: err.message };
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  console.log('🔧 TASK 2: Scene Trace Diagnostics (Revised)\n');

  const trainingResults = await traceTrainingMode();
  const versusResults = await traceVersusArena();

  const allResults = {
    timestamp: new Date().toISOString(),
    training: trainingResults,
    versus: versusResults
  };

  fs.writeFileSync('/tmp/task2-diagnostics.json', JSON.stringify(allResults, null, 2));

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Diagnostics saved to /tmp/task2-diagnostics.json');
}

main().catch(console.error);
