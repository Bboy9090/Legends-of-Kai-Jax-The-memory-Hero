#!/usr/bin/env node
/**
 * AUTOMATED ROOT CAUSE TRACE - Playwright
 * Captures console logs, screenshots, and measurements
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const resultsDir = '/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/trace-results';

const results = {
  timestamp: new Date().toISOString(),
  blockersTraced: {
    a: { name: 'Versus FIGHT', logs: [], screenshot: null, battleCanvasActive: null, failure: null },
    b: { name: 'Model Rendering', logs: [], screenshots: [], failure: null },
    c: { name: 'Mobile Performance', fps: null, latency: null, failure: null }
  }
};

async function traceBlockerA() {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 BLOCKER A: Versus FIGHT Transition');
  console.log('═'.repeat(80));

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium'
  });

  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Blocker A Trace]') || text.includes('[VersusCharacterSelect]')) {
      console.log(`[CONSOLE] ${text}`);
      results.blockersTraced.a.logs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.toString()}`);
    results.blockersTraced.a.logs.push({ type: 'error', text: err.toString(), timestamp: new Date().toISOString() });
  });

  try {
    console.log('\n[1/6] Navigate to app...');
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('[2/6] Navigate to Versus mode...');
    const versusBtn = page.locator('button:has-text("VERSUS")').first();
    if (await versusBtn.isVisible()) {
      await versusBtn.click();
      console.log('  ✓ Clicked VERSUS');
    } else {
      console.log('  ⚠ VERSUS button not found');
      results.blockersTraced.a.failure = 'VERSUS button not found';
      await browser.close();
      return;
    }

    console.log('[3/6] Wait for character select...');
    await page.waitForTimeout(2000);

    console.log('[4/6] Verify character select loaded...');
    const fightBtn = page.locator('button:has-text("FIGHT")').first();
    if (await fightBtn.isVisible()) {
      console.log('  ✓ FIGHT button visible');
    } else {
      console.log('  ⚠ FIGHT button not found');
      results.blockersTraced.a.failure = 'FIGHT button not found';
      await browser.close();
      return;
    }

    console.log('[5/6] [CRITICAL] Click FIGHT button...');
    await fightBtn.click();
    console.log('  ✓ FIGHT clicked');

    console.log('[6/6] Wait for state transitions...');
    await page.waitForTimeout(3000);

    // Try to detect battleCanvasActive state from page content
    const pageContent = await page.content();
    const hasBattleUI = pageContent.includes('BattleUI') || pageContent.includes('Canvas');
    const hasCharacterSelect = pageContent.includes('CHOOSE YOUR FIGHTER') || pageContent.includes('Fighter');

    console.log('\n📊 Versus FIGHT Trace Results:');
    console.log(`  Console logs captured: ${results.blockersTraced.a.logs.length}`);
    console.log(`  Page has BattleUI/Canvas: ${hasBattleUI}`);
    console.log(`  Page still showing character select: ${hasCharacterSelect}`);

    if (results.blockersTraced.a.logs.length > 0) {
      console.log('\n  Captured logs:');
      results.blockersTraced.a.logs.forEach(log => {
        console.log(`    [${log.type}] ${log.text.substring(0, 100)}...`);
      });
    }

    // Check for battleCanvasActive in logs
    const battleCanvasLog = results.blockersTraced.a.logs.find(l => l.text.includes('battleCanvasActive'));
    if (battleCanvasLog) {
      const match = battleCanvasLog.text.match(/battleCanvasActive:\s*(true|false)/i);
      if (match) {
        results.blockersTraced.a.battleCanvasActive = match[1] === 'true';
        console.log(`\n  ⚡ battleCanvasActive: ${results.blockersTraced.a.battleCanvasActive}`);
        if (results.blockersTraced.a.battleCanvasActive) {
          console.log('  ✅ STATE TRANSITION WORKING - battle should be visible');
        } else {
          console.log('  ❌ STATE TRANSITION FAILED - battleCanvasActive is false');
          results.blockersTraced.a.failure = 'battleCanvasActive = false';
        }
      }
    }

    // Take screenshot
    const screenshotPath = path.join(resultsDir, 'blocker-a-versus-after-fight.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  📸 Screenshot saved: blocker-a-versus-after-fight.png`);
    results.blockersTraced.a.screenshot = screenshotPath;

  } catch (err) {
    console.error(`❌ Blocker A trace failed: ${err.message}`);
    results.blockersTraced.a.failure = err.message;
  } finally {
    await browser.close();
  }
}

async function traceBlockerB() {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 BLOCKER B: Character Model Rendering');
  console.log('═'.repeat(80));

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium'
  });

  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[OptimizedBeastModel]') || text.includes('Mesh') || text.includes('opacity') || text.includes('visible')) {
      console.log(`[CONSOLE] ${text}`);
      results.blockersTraced.b.logs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
    }
  });

  try {
    console.log('\n[1/4] Navigate to app...');
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('[2/4] Navigate to Training mode...');
    const trainingBtn = page.locator('button:has-text("TRAINING")').first();
    if (await trainingBtn.isVisible()) {
      await trainingBtn.click();
      console.log('  ✓ Clicked TRAINING');
    } else {
      console.log('  ⚠ TRAINING button not found');
      results.blockersTraced.b.failure = 'TRAINING button not found';
      await browser.close();
      return;
    }

    console.log('[3/4] Wait for arena to load...');
    await page.waitForTimeout(3000);

    console.log('[4/4] Capture evidence...');
    await page.waitForTimeout(1000);

    // Take screenshot of arena
    const arenaScreenshotPath = path.join(resultsDir, 'blocker-b-training-arena.png');
    await page.screenshot({ path: arenaScreenshotPath });
    console.log(`  📸 Arena screenshot saved: blocker-b-training-arena.png`);
    results.blockersTraced.b.screenshots.push(arenaScreenshotPath);

    console.log('\n📊 Character Model Rendering Results:');
    console.log(`  Console logs captured: ${results.blockersTraced.b.logs.length}`);

    if (results.blockersTraced.b.logs.length > 0) {
      console.log('\n  Captured logs:');
      results.blockersTraced.b.logs.forEach(log => {
        console.log(`    [${log.type}] ${log.text.substring(0, 100)}...`);
      });

      // Analyze logs for critical properties
      const propertyLogs = results.blockersTraced.b.logs.filter(l =>
        l.text.includes('opacity') || l.text.includes('visible') || l.text.includes('scale') || l.text.includes('position')
      );

      if (propertyLogs.length > 0) {
        console.log('\n  🔍 Property values found:');
        propertyLogs.forEach(log => {
          console.log(`    ${log.text}`);
        });
      } else {
        console.log('\n  ⚠️ No property value logs found (logs may not include actual values)');
        results.blockersTraced.b.failure = 'No property logging found';
      }

      // Check for mesh visibility indicators
      const meshLogs = results.blockersTraced.b.logs.filter(l => l.text.includes('meshesFound'));
      if (meshLogs.length > 0) {
        console.log('\n  Mesh detection:');
        meshLogs.forEach(log => {
          if (log.text.includes('meshesFound: 0')) {
            console.log('    ❌ No meshes found');
            results.blockersTraced.b.failure = 'No meshes found';
          } else {
            console.log(`    ✅ Mesh found: ${log.text}`);
          }
        });
      }
    } else {
      console.log('  ⚠️ No model logs captured (check if model loading is working)');
      results.blockersTraced.b.failure = 'No model logs captured';
    }

  } catch (err) {
    console.error(`❌ Blocker B trace failed: ${err.message}`);
    results.blockersTraced.b.failure = err.message;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║ AUTOMATED ROOT CAUSE TRACE EXECUTION                           ║');
  console.log('║ Using Playwright + Chromium                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  console.log(`\nResults directory: ${resultsDir}`);
  console.log(`Environment: http://localhost:4174/\n`);

  // Execute traces
  await traceBlockerA();
  await traceBlockerB();

  // Blocker C requires mobile testing on live Vercel - skip for now
  console.log('\n' + '═'.repeat(80));
  console.log('⏭️  BLOCKER C: Mobile Performance');
  console.log('═'.repeat(80));
  console.log('\nBlocker C requires live Vercel mobile testing.');
  console.log('Instructions: See MANUAL_TRACE_INSTRUCTIONS.md\n');

  // Save results
  fs.writeFileSync(
    path.join(resultsDir, 'trace-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TRACE SUMMARY');
  console.log('═'.repeat(80));

  console.log('\nBLOCKER A: Versus FIGHT Transition');
  if (results.blockersTraced.a.failure) {
    console.log(`  ❌ FAILURE: ${results.blockersTraced.a.failure}`);
  } else if (results.blockersTraced.a.battleCanvasActive === true) {
    console.log(`  ✅ PASS: battleCanvasActive = true (state transition working)`);
  } else if (results.blockersTraced.a.battleCanvasActive === false) {
    console.log(`  ❌ FAILURE: battleCanvasActive = false (transition blocked)`);
  } else {
    console.log(`  ⚠️  INCONCLUSIVE: Could not determine battleCanvasActive state`);
  }

  console.log('\nBLOCKER B: Character Model Rendering');
  if (results.blockersTraced.b.failure) {
    console.log(`  ❌ FAILURE: ${results.blockersTraced.b.failure}`);
  } else if (results.blockersTraced.b.logs.length > 0) {
    console.log(`  ✅ LOGS CAPTURED: ${results.blockersTraced.b.logs.length} events`);
    console.log(`  📊 Analyze console output in: blocker-b-training-arena.png`);
  } else {
    console.log(`  ⚠️  No model logs captured`);
  }

  console.log('\nBLOCKER C: Mobile Performance');
  console.log('  ⏳ Manual testing required on live Vercel');
  console.log('  📋 Instructions: MANUAL_TRACE_INSTRUCTIONS.md\n');

  console.log('═'.repeat(80));
  console.log('📁 FILES SAVED:');
  console.log(`  - trace-results.json (structured data)`);
  console.log(`  - blocker-a-versus-after-fight.png (screenshot)`);
  console.log(`  - blocker-b-training-arena.png (screenshot)`);
  console.log(`  - MANUAL_TRACE_INSTRUCTIONS.md (Blocker C + manual steps)\n`);

  console.log('Next Action: Review logs and identify exact root cause for each blocker');
}

main().catch(console.error);
