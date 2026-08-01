#!/usr/bin/env node
/**
 * BLOCKER B TRACE: Character Model Rendering
 * Verifies model loads and renders correctly in Training mode
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const resultsDir = '/tmp/trace-blocker-b-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

async function runTrace() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║ BLOCKER B TRACE: Character Model Rendering                    ║');
  console.log('║ Localhost Preview Server (http://localhost:4174/)             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium'
  });

  const page = await browser.newPage();
  const logs = [];
  let modelRenderingData = null;

  page.on('console', msg => {
    const text = msg.text();
    logs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });

    if (text.includes('[OptimizedBeastModel]') || text.includes('[Blocker B Trace]')) {
      console.log(`[CONSOLE] ${text}`);
      
      if (text.includes('opacity') || text.includes('visible') || text.includes('scale') || text.includes('meshesFound')) {
        modelRenderingData = text;
      }
    }
  });

  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.toString()}`);
    logs.push({
      type: 'error',
      text: err.toString(),
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('[Step 1/6] Navigate to app...');
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('  ✓ App loaded\n');

    console.log('[Step 2/6] Navigate to main menu (click Play Game)...');
    const playGameBtn = page.locator('button').filter({ hasText: /Play Game/i }).first();
    if (await playGameBtn.isVisible()) {
      await playGameBtn.click();
      await page.waitForTimeout(1000);
      console.log('  ✓ Clicked Play Game\n');
    } else {
      console.log('  ❌ Play Game button not found\n');
      await browser.close();
      return;
    }

    console.log('[Step 3/6] Wait for menu to render...');
    let buttonsFound = false;
    for (let i = 0; i < 15; i++) {
      const count = await page.locator('button').count();
      if (count > 0) {
        buttonsFound = true;
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!buttonsFound) {
      console.log('  ❌ Menu buttons never appeared\n');
      await browser.close();
      return;
    }
    console.log('  ✓ Menu rendered\n');

    console.log('[Step 4/6] Click TRAINING button...');
    const trainingBtn = page.locator('button').filter({ hasText: 'TRAINING' }).first();
    const isTrainingVisible = await trainingBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isTrainingVisible) {
      // Use JavaScript to ensure the click reaches the handler
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const trainingBtn = buttons.find(b => b.textContent.includes('TRAINING'));
        if (trainingBtn) {
          trainingBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
      });
      await page.waitForTimeout(2000);
      console.log('  ✓ Clicked TRAINING\n');
    } else {
      console.log('  ❌ TRAINING button not found\n');
      await browser.close();
      return;
    }

    console.log('[Step 5/6] Wait for Training arena to load (watching for model logs)...');
    await page.waitForTimeout(4000);
    console.log('  ✓ Arena loaded\n');

    console.log('[Step 6/6] Capturing final state...\n');

    // Get page content to determine what's visible
    const pageContent = await page.content();
    const hasCanvas = pageContent.includes('<canvas') || pageContent.includes('Canvas');
    const hasAdventureUI = pageContent.includes('AdventureHUD') || pageContent.includes('adventure');
    const hasFallbackMarker = pageContent.includes('fallback') || pageContent.includes('green circle');

    // Take screenshot
    const screenshotPath = path.join(resultsDir, 'blocker-b-training-arena.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

    // Save logs
    const logsPath = path.join(resultsDir, 'blocker-b-console-logs.json');
    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
    console.log(`📄 Console logs saved: ${logsPath}\n`);

  } catch (err) {
    console.error(`❌ Trace failed: ${err.message}`);
    logs.push({ type: 'error', text: err.message, timestamp: new Date().toISOString() });
  } finally {
    await browser.close();
  }

  // Analyze results
  console.log('═'.repeat(80));
  console.log('📊 BLOCKER B TRACE RESULTS');
  console.log('═'.repeat(80) + '\n');

  // Check for model loading logs
  const modelLogs = logs.filter(l => l.text.includes('[OptimizedBeastModel]'));
  const propertyLogs = logs.filter(l =>
    l.text.includes('opacity') || l.text.includes('visible') ||
    l.text.includes('scale') || l.text.includes('meshesFound')
  );

  console.log('🔍 Model Loading Logs:');
  if (modelLogs.length > 0) {
    console.log(`  ✅ Model logs captured: ${modelLogs.length} events`);
    modelLogs.slice(0, 5).forEach(log => {
      console.log(`     ${log.text.substring(0, 80)}`);
    });
  } else {
    console.log(`  ⚠️  No model loading logs found`);
  }

  console.log('\n🔍 Critical Property Values:');
  if (propertyLogs.length > 0) {
    console.log(`  ✅ Property logs found: ${propertyLogs.length}`);
    propertyLogs.forEach(log => {
      console.log(`     ${log.text}`);
      
      // Extract specific values
      if (log.text.includes('opacity')) {
        const opacityMatch = log.text.match(/opacity[:\s]+([0-9.]+)/i);
        if (opacityMatch && opacityMatch[1] === '0') {
          console.log(`     ❌ PROBLEM: opacity is 0 (material invisible)`);
        }
      }
      if (log.text.includes('visible')) {
        const visibleMatch = log.text.match(/visible[:\s]+(true|false)/i);
        if (visibleMatch && visibleMatch[1] === 'false') {
          console.log(`     ❌ PROBLEM: visible is false (mesh hidden)`);
        }
      }
      if (log.text.includes('meshesFound: 0')) {
        console.log(`     ❌ PROBLEM: No meshes found in scene`);
      }
    });
  } else {
    console.log(`  ⚠️  No property value logs found`);
  }

  console.log('\n🔍 Scene Health Check:');
  const cloneLog = logs.find(l => l.text.includes('Cloned scene'));
  const sceneLoadLog = logs.find(l => l.text.includes('Scene loaded'));
  const scalingLog = logs.find(l => l.text.includes('Scaling applied'));

  if (cloneLog) console.log(`  ✅ Scene cloned: YES`);
  else console.log(`  ⚠️  Scene cloned: NOT FOUND`);

  if (sceneLoadLog) console.log(`  ✅ Scene loaded: YES`);
  else console.log(`  ⚠️  Scene loaded: NOT FOUND`);

  if (scalingLog) console.log(`  ✅ Scaling applied: YES`);
  else console.log(`  ⚠️  Scaling applied: NOT FOUND`);

  // Root cause analysis
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 ROOT CAUSE ANALYSIS');
  console.log('═'.repeat(80) + '\n');

  if (modelLogs.length === 0) {
    console.log('❌ FAILURE: No model loading logs');
    console.log('   Root cause: Model loading not instrumented or arena not initialized');
  } else if (propertyLogs.some(l => l.text.includes('meshesFound: 0'))) {
    console.log('❌ FAILURE: No meshes found in scene');
    console.log('   Root cause: Scene tree doesn\'t contain expected mesh');
  } else if (propertyLogs.some(l => l.text.includes('opacity') && l.text.includes(': 0'))) {
    console.log('❌ FAILURE: Material opacity is 0');
    console.log('   Root cause: Material opacity not set or set to 0');
  } else if (propertyLogs.length > 0) {
    console.log('✅ SUCCESS: Model properties look correct');
    console.log('   Model should be visible and rendered');
  } else {
    console.log('⚠️  INCONCLUSIVE: Model logs present but property values not captured');
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📁 EVIDENCE SAVED');
  console.log('═'.repeat(80));
  console.log(`\nScreenshot: ${path.join(resultsDir, 'blocker-b-training-arena.png')}`);
  console.log(`Console logs: ${path.join(resultsDir, 'blocker-b-console-logs.json')}`);
  console.log(`\nTotal console messages: ${logs.length}`);
  console.log(`Model logs: ${modelLogs.length}`);
  console.log(`Property logs: ${propertyLogs.length}`);
}

runTrace().catch(err => {
  console.error('\n❌ Trace execution failed:', err.message);
  process.exit(1);
});
