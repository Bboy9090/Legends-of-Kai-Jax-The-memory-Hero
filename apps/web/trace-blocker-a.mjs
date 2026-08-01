#!/usr/bin/env node
/**
 * BLOCKER A TRACE: Versus FIGHT Transition
 * Captures console logs and identifies state transition failure
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const resultsDir = '/tmp/trace-blocker-a-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

async function runTrace() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║ BLOCKER A TRACE: Versus FIGHT Transition                        ║');
  console.log('║ Localhost Preview Server (http://localhost:4174/)               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium'
  });

  const page = await browser.newPage();
  const logs = [];
  let battleCanvasActive = null;
  let pageState = '';

  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    logs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });

    // Print to console for real-time monitoring
    if (text.includes('[Blocker A Trace]') || text.includes('[VersusCharacterSelect]') || text.includes('[App render]')) {
      console.log(`[CONSOLE] ${text}`);

      // Extract battleCanvasActive value
      if (text.includes('battleCanvasActive')) {
        const match = text.match(/battleCanvasActive:\s*(true|false)/);
        if (match) {
          battleCanvasActive = match[1] === 'true';
          console.log(`\n⚡ CRITICAL: battleCanvasActive = ${battleCanvasActive}\n`);
        }
      }
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.toString()}`);
    logs.push({
      type: 'error',
      text: err.toString(),
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('[Step 1/7] Navigate to app...');
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('  ✓ App loaded\n');

    console.log('[Step 2/7] Navigate to main menu (click Play Game)...');
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

    console.log('[Step 2.5/7] Wait for menu to render...');
    let buttonsFound = false;
    let waitAttempts = 0;
    while (!buttonsFound && waitAttempts < 15) {
      const count = await page.locator('button').count();
      if (count > 0) {
        buttonsFound = true;
        break;
      }
      await page.waitForTimeout(500);
      waitAttempts++;
    }

    if (!buttonsFound) {
      console.log('  ❌ Menu buttons never appeared\n');
      await browser.close();
      return;
    }
    console.log('  ✓ Menu rendered\n');

    console.log('[Step 3/7] Click VERSUS button...');
    const versusBtn = page.locator('button').filter({ hasText: 'VERSUS' }).first();
    const isVersusVisible = await versusBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isVersusVisible) {
      await versusBtn.click();
      await page.waitForTimeout(1500);
      console.log('  ✓ Clicked VERSUS\n');
    } else {
      console.log('  ❌ VERSUS button not found\n');
      await browser.close();
      return;
    }

    console.log('[Step 3/7] Wait for character select to load...');
    await page.waitForTimeout(3000);
    console.log('  ✓ Character select loaded\n');

    console.log('[Step 4/7] Verify FIGHT button is visible...');
    const fightBtn = page.locator('button').filter({ hasText: /FIGHT/i }).first();
    const isFightVisible = await fightBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isFightVisible) {
      console.log('  ✓ FIGHT button found\n');
    } else {
      console.log('  ❌ FIGHT button not found\n');
      console.log('  Debugging: checking page content for FIGHT...');
      const content = await page.content();
      if (content.includes('FIGHT')) {
        console.log('  FIGHT text is in page HTML but button element not found');
      } else {
        console.log('  FIGHT text not in page at all');
      }
      // List all buttons for debugging
      const allBtns = await page.locator('button').all();
      console.log(`  Total buttons: ${allBtns.length}`);
      for (let i = 0; i < Math.min(allBtns.length, 5); i++) {
        const text = await allBtns[i].textContent();
        console.log(`    [${i}] "${text?.substring(0, 30)}"`);
      }
      await browser.close();
      return;
    }

    console.log('[Step 5/7] ⚡ [CRITICAL] Click FIGHT button...');
    console.log('  → Watching console for [Blocker A Trace] messages...\n');

    // Use JavaScript dispatchEvent to ensure the click reaches the handler
    // (Playwright's click() was being intercepted by Canvas or other elements)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fightBtn = buttons.find(b =>
        b.textContent.trim().includes('FIGHT') &&
        b.textContent.length < 20
      );
      if (fightBtn) {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        fightBtn.dispatchEvent(clickEvent);
      }
    });

    console.log('[Step 6/7] Waiting for state transitions (3 seconds)...\n');
    await page.waitForTimeout(3000);

    console.log('[Step 7/7] Capturing final state...\n');

    // Get page content to determine what's visible
    const pageContent = await page.content();
    const hasCanvas = pageContent.includes('<canvas') || pageContent.includes('Canvas');
    const hasBattleUI = pageContent.includes('BattleUI') || pageContent.includes('battle');
    const hasCharacterSelect = pageContent.includes('CHOOSE YOUR FIGHTER') || pageContent.includes('fighter');

    pageState = {
      hasCanvas: hasCanvas,
      hasBattleUI: hasBattleUI,
      hasCharacterSelect: hasCharacterSelect
    };

    // Take screenshot
    const screenshotPath = path.join(resultsDir, 'blocker-a-after-fight-click.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

    // Save logs
    const logsPath = path.join(resultsDir, 'blocker-a-console-logs.json');
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
  console.log('📊 BLOCKER A TRACE RESULTS');
  console.log('═'.repeat(80) + '\n');

  // Check for critical logs
  const beginMatchLog = logs.find(l => l.text.includes('[Blocker A Trace] beginMatch invoked'));
  const startLog = logs.find(l => l.text.includes('[Blocker A Trace] After start()'));
  const setGameStateLog = logs.find(l => l.text.includes('[Blocker A Trace] After setGameState'));
  const appRenderLog = logs.find(l => l.text.includes('[Blocker A Trace] App render'));

  console.log('🔍 Handler Execution:');
  if (beginMatchLog) {
    console.log(`  ✅ Handler invoked: YES`);
    console.log(`     Log: ${beginMatchLog.text}`);
  } else {
    console.log(`  ❌ Handler invoked: NO`);
  }

  console.log('\n🔍 State Transitions:');
  if (startLog) {
    console.log(`  ✅ start() called: YES`);
  } else {
    console.log(`  ⚠️  start() log: NOT FOUND`);
  }

  if (setGameStateLog) {
    console.log(`  ✅ setGameState() called: YES`);
  } else {
    console.log(`  ⚠️  setGameState() log: NOT FOUND`);
  }

  console.log('\n🔍 App Condition Evaluation:');
  if (appRenderLog) {
    console.log(`  ✅ App render log found`);
    console.log(`     Log: ${appRenderLog.text}`);

    if (battleCanvasActive === true) {
      console.log(`\n  ✅ battleCanvasActive: TRUE`);
      console.log(`     → BattleUI should mount`);
      console.log(`     → Canvas should render`);
    } else if (battleCanvasActive === false) {
      console.log(`\n  ❌ battleCanvasActive: FALSE`);
      console.log(`     → BattleUI will NOT mount`);
      console.log(`     → Character select remains visible`);
    }
  } else {
    console.log(`  ⚠️  App render log: NOT FOUND`);
  }

  console.log('\n🔍 Page State After Click:');
  console.log(`  Canvas visible: ${pageState.hasCanvas}`);
  console.log(`  BattleUI element: ${pageState.hasBattleUI}`);
  console.log(`  Character select visible: ${pageState.hasCharacterSelect}`);

  // Root cause analysis
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 ROOT CAUSE ANALYSIS');
  console.log('═'.repeat(80) + '\n');

  if (!beginMatchLog) {
    console.log('❌ FAILURE: Handler never invoked');
    console.log('   Root cause: onClick event not firing or handler not bound');
  } else if (!startLog || !setGameStateLog) {
    console.log('❌ FAILURE: State write blocked or exception thrown');
    console.log('   Root cause: Exception during state transitions');
  } else if (battleCanvasActive === false) {
    console.log('❌ FAILURE: battleCanvasActive condition returned false');
    console.log('   Root cause: phase or gameState value incorrect');
    console.log('   Evidence: App rendered but condition was false');
  } else if (battleCanvasActive === true && !pageState.hasCanvas) {
    console.log('⚠️  POSSIBLE ISSUE: State correct but canvas not rendering');
    console.log('   Root cause: BattleUI mounted but scene rendering failed');
  } else if (battleCanvasActive === true && pageState.hasCanvas) {
    console.log('✅ SUCCESS: Versus FIGHT transition working');
    console.log('   battleCanvasActive = true');
    console.log('   Canvas is rendering');
  } else {
    console.log('❓ INCONCLUSIVE: battleCanvasActive value not found in logs');
    console.log('   Root cause: Trace logging incomplete');
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📁 EVIDENCE SAVED');
  console.log('═'.repeat(80));
  console.log(`\nScreenshot: ${path.join(resultsDir, 'blocker-a-after-fight-click.png')}`);
  console.log(`Console logs: ${path.join(resultsDir, 'blocker-a-console-logs.json')}`);
  console.log(`\nTotal console messages: ${logs.length}`);
  console.log(`Trace logs: ${logs.filter(l => l.text.includes('[Blocker A Trace]')).length}`);
}

runTrace().catch(err => {
  console.error('\n❌ Trace execution failed:', err.message);
  process.exit(1);
});
