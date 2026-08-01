#!/usr/bin/env node
/**
 * TASK 2: Three.js Scene Trace - Instrument active scenes to diagnose model loading
 * Logs scene graph, mesh count, model load status, camera position, visibility state
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';

const results = {
  test_name: 'TASK 2: Three.js Scene Trace',
  timestamp: new Date().toISOString(),
  scenes_analyzed: {}
};

async function traceTrainingModeScene(viewport = '1280x720') {
  let browser, page;
  const sceneTrace = {
    viewport,
    scene_name: 'Training Mode',
    trace_timestamp: new Date().toISOString(),
    scene_graph: null,
    meshes: [],
    models: [],
    camera: null,
    objects: [],
    failure: null
  };

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 TASK 2: Training Mode Scene Trace (${viewport})`);
    console.log(`${'='.repeat(80)}\n`);

    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    page = await browser.newPage({
      viewport: viewport === '1280x720' ? { width: 1280, height: 720 } : { width: 390, height: 844 }
    });

    // Navigate to landing
    console.log(`[1/5] Navigate to landing page...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  ✓ Landed`);

    // Click PLAY GAME
    console.log(`[2/5] Click PLAY GAME...`);
    const playBtn = await page.locator('button').filter({ hasText: /PLAY|Play/i }).first();
    await playBtn.click();
    await page.waitForTimeout(7000);
    console.log(`  ✓ Menu loading...`);

    // Click Training Mode
    console.log(`[3/5] Click Training Mode...`);
    const trainingBtn = await page.locator('button').filter({ hasText: /Training|training|TRAINING/i }).first();
    await trainingBtn.click();
    await page.waitForTimeout(3000);
    console.log(`  ✓ Training Mode loaded`);

    // Instrument Three.js scene
    console.log(`[4/5] Trace Three.js scene graph...`);

    const sceneData = await page.evaluate(() => {
      if (!window.THREE) {
        return { error: 'Three.js not found in window' };
      }

      // Find the scene by looking for Three.js renderer
      let scene = null;
      let camera = null;

      // Try to find scene through common patterns
      // Most apps store it or we can look at canvas
      const canvases = document.querySelectorAll('canvas');

      // Use a heuristic - look for recently created scenes
      // In a real scenario, the app would expose this
      const trace = {
        canvases_found: canvases.length,
        scene_analysis: {
          children_count: 0,
          object_names: [],
          meshes: [],
          lights: [],
          cameras: [],
          groups: [],
          others: []
        },
        diagnostics: {
          three_js_available: true,
          scene_found: false,
          camera_found: false,
          renderer_found: false,
          message: 'Three.js scene graph requires access through renderer/app context'
        }
      };

      // Check for common global patterns
      if (window.__THREE_SCENE__) {
        scene = window.__THREE_SCENE__;
        trace.diagnostics.scene_found = true;
      }

      // Alternative: check for three.js object property
      if (window.threeApp && window.threeApp.scene) {
        scene = window.threeApp.scene;
        trace.diagnostics.scene_found = true;
      }

      // Try to detect objects in the scene DOM
      const allElements = document.querySelectorAll('*');
      trace.dom_elements_count = allElements.length;

      // Look for class names that might indicate Three.js object wrappers
      const threeIndicators = {
        mesh_wrappers: document.querySelectorAll('[class*="mesh"], [class*="model"], [data-object]').length,
        object_containers: document.querySelectorAll('[class*="object"], [class*="actor"]').length,
        animation_elements: document.querySelectorAll('[class*="anim"], [data-animation]').length
      };

      trace.potential_three_objects = threeIndicators;

      return trace;
    });

    console.log(`  Three.js available: ${sceneData.diagnostics.three_js_available}`);
    console.log(`  Canvases found: ${sceneData.canvases_found}`);
    console.log(`  DOM elements: ${sceneData.dom_elements_count}`);
    console.log(`  Mesh wrappers: ${sceneData.potential_three_objects.mesh_wrappers}`);
    console.log(`  Note: ${sceneData.diagnostics.message}`);

    sceneTrace.scene_graph = sceneData;

    // Check browser console for errors/warnings
    console.log(`[5/5] Capture console messages...`);
    const consoleMessages = {
      errors: [],
      warnings: [],
      model_loads: [],
      three_logs: []
    };

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleMessages.errors.push(text);
      } else if (msg.type() === 'warning') {
        consoleMessages.warnings.push(text);
      }
      if (text.includes('model') || text.includes('load') || text.includes('THREE')) {
        consoleMessages.three_logs.push(`[${msg.type()}] ${text}`);
      }
    });

    await page.waitForTimeout(2000);

    console.log(`  Errors: ${consoleMessages.errors.length}`);
    console.log(`  Warnings: ${consoleMessages.warnings.length}`);
    console.log(`  Three.js related logs: ${consoleMessages.three_logs.length}`);

    if (consoleMessages.errors.length > 0) {
      console.log(`  Error samples:`, consoleMessages.errors.slice(0, 3));
    }

    sceneTrace.console_messages = consoleMessages;

    console.log(`\n✅ Training Mode scene trace complete`);

  } catch (err) {
    sceneTrace.failure = {
      message: err.message,
      stack: err.stack
    };
    console.error(`\n❌ Training Mode trace failed: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return sceneTrace;
}

async function traceVersusArenaScene(viewport = '1280x720') {
  let browser, page;
  const sceneTrace = {
    viewport,
    scene_name: 'Versus Mode Arena',
    trace_timestamp: new Date().toISOString(),
    scene_graph: null,
    meshes: [],
    models: [],
    camera: null,
    objects: [],
    failure: null,
    arena_loaded: false,
    fighters_detected: false
  };

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 TASK 2: Versus Mode Arena Scene Trace (${viewport})`);
    console.log(`${'='.repeat(80)}\n`);

    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    page = await browser.newPage({
      viewport: viewport === '1280x720' ? { width: 1280, height: 720 } : { width: 390, height: 844 }
    });

    // Navigate to landing
    console.log(`[1/6] Navigate to landing page...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  ✓ Landed`);

    // Click PLAY GAME
    console.log(`[2/6] Click PLAY GAME...`);
    const playBtn = await page.locator('button').filter({ hasText: /PLAY|Play/i }).first();
    await playBtn.click();
    await page.waitForTimeout(7000);
    console.log(`  ✓ Menu loading...`);

    // Click Versus Mode
    console.log(`[3/6] Click Versus Mode...`);
    const versusBtn = await page.locator('button').filter({ hasText: /Versus|Fight|Battle|VERSUS/i }).first();
    await versusBtn.click();
    await page.waitForTimeout(3000);
    console.log(`  ✓ Character select loaded`);

    // Click FIGHT button
    console.log(`[4/6] Click FIGHT to enter arena...`);
    const fightBtn = await page.locator('button').filter({ hasText: /FIGHT|Fight|Start/i }).first();
    await fightBtn.click();
    await page.waitForTimeout(4000); // Wait longer for arena to load
    console.log(`  ✓ Arena loading...`);

    // Verify arena loaded (check if still on select screen)
    console.log(`[5/6] Verify arena scene loaded...`);
    const stillOnSelect = await page.locator('text=CHOOSE YOUR FIGHTER').isVisible().catch(() => false);

    if (stillOnSelect) {
      console.log(`  ⚠️ WARNING: Still on character select screen (arena may not have loaded)`);
      sceneTrace.arena_loaded = false;
    } else {
      console.log(`  ✓ Left character select screen`);
      sceneTrace.arena_loaded = true;
    }

    // Trace arena scene
    const arenaSceneData = await page.evaluate(() => {
      const trace = {
        canvases_found: document.querySelectorAll('canvas').length,
        fighters_text: {
          player1: document.body.innerText.includes('PLAYER 1') || document.body.innerText.includes('Player 1'),
          player2: document.body.innerText.includes('PLAYER 2') || document.body.innerText.includes('Player 2'),
          opponent: document.body.innerText.includes('OPPONENT') || document.body.innerText.includes('Opponent')
        },
        hud_elements: {
          health_bars: document.querySelectorAll('[class*="health"], [class*="hp"]').length,
          combat_ui: document.querySelectorAll('[class*="combat"], [class*="battle"]').length,
          hud_total: document.querySelectorAll('[class*="hud"], [class*="ui"]').length
        },
        potential_fighters: document.querySelectorAll('[class*="fighter"], [class*="player"], [class*="opponent"]').length,
        scene_indicators: {
          has_battle_text: document.body.innerText.includes('WAVE') || document.body.innerText.includes('Wave'),
          has_combat_controls: document.body.innerText.includes('ATTACK') || document.body.innerText.includes('SKILL')
        }
      };
      return trace;
    });

    console.log(`  Canvases: ${arenaSceneData.canvases_found}`);
    console.log(`  Fighter indicators - P1: ${arenaSceneData.fighters_text.player1}, P2: ${arenaSceneData.fighters_text.player2}`);
    console.log(`  HUD elements found: ${arenaSceneData.hud_elements.hud_total}`);
    console.log(`  Battle in progress: ${arenaSceneData.scene_indicators.has_battle_text}`);

    sceneTrace.scene_graph = arenaSceneData;
    sceneTrace.fighters_detected = arenaSceneData.fighters_text.player1 || arenaSceneData.fighters_text.player2;

    // Capture console
    console.log(`[6/6] Capture console messages...`);
    const consoleMessages = {
      errors: [],
      warnings: [],
      model_logs: []
    };

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleMessages.errors.push(text);
      } else if (msg.type() === 'warning') {
        consoleMessages.warnings.push(text);
      }
      if (text.includes('model') || text.includes('fighter') || text.includes('load')) {
        consoleMessages.model_logs.push(`[${msg.type()}] ${text}`);
      }
    });

    await page.waitForTimeout(2000);

    console.log(`  Errors: ${consoleMessages.errors.length}`);
    console.log(`  Model-related logs: ${consoleMessages.model_logs.length}`);

    sceneTrace.console_messages = consoleMessages;

    console.log(`\n✅ Versus arena scene trace complete`);

  } catch (err) {
    sceneTrace.failure = {
      message: err.message,
      stack: err.stack
    };
    console.error(`\n❌ Versus arena trace failed: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return sceneTrace;
}

async function runTraces() {
  console.log('🔧 TASK 2: Three.js Scene Trace Diagnostic');
  console.log(`⏱️  Started: ${results.timestamp}\n`);

  // Trace Training Mode
  const trainingTrace = await traceTrainingModeScene('1280x720');
  results.scenes_analyzed['training-mode-1280x720'] = trainingTrace;

  // Trace Versus Mode Arena
  const versusTrace = await traceVersusArenaScene('1280x720');
  results.scenes_analyzed['versus-arena-1280x720'] = versusTrace;

  // Save results
  fs.writeFileSync('/tmp/task2-scene-trace-results.json', JSON.stringify(results, null, 2));

  // Print summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TASK 2 - THREE.JS SCENE TRACE SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  Object.entries(results.scenes_analyzed).forEach(([name, trace]) => {
    console.log(`\n${name}:`);
    if (trace.failure) {
      console.log(`  ❌ FAILED: ${trace.failure.message}`);
    } else {
      if (trace.scene_name.includes('Training')) {
        console.log(`  Canvases: ${trace.scene_graph.canvases_found}`);
        console.log(`  Three.js available: ${trace.scene_graph.diagnostics.three_js_available}`);
        console.log(`  Console errors: ${trace.console_messages.errors.length}`);
        console.log(`  Three.js logs: ${trace.console_messages.three_logs.length}`);
      } else {
        console.log(`  Arena loaded: ${trace.arena_loaded}`);
        console.log(`  Canvases: ${trace.scene_graph.canvases_found}`);
        console.log(`  Fighters detected: ${trace.fighters_detected}`);
        console.log(`  HUD elements: ${trace.scene_graph.hud_elements.hud_total}`);
        console.log(`  Console errors: ${trace.console_messages.errors.length}`);
      }
    }
  });

  console.log(`\n📁 Results saved to /tmp/task2-scene-trace-results.json`);
}

runTraces().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
