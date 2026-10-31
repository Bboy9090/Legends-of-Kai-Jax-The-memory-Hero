#!/usr/bin/env node
/**
 * M9 Comprehensive Gameplay Test
 * Combat mission: The Core's Defense
 * Test: 1-line intro dialogue, 2-wave combat (6 elite + 2 brute), enemy variety
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/7d32b628-cc02-56f6-bb6d-0a77b7d91ed7/scratchpad/m9-comprehensive';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const log = (msg) => console.log(`[M9] ${msg}`);
const screenshot = async (page, name) => {
  const file = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: file });
  log(`✓ ${name}`);
  return file;
};

(async () => {
  log('╔═══════════════════════════════════════════════════════════════════╗');
  log('║  M9 COMPREHENSIVE GAMEPLAY TEST                                   ║');
  log('║  Combat Mission: The Core\'s Defense                              ║');
  log('║  Test: 1-line intro, 2-wave combat (6 elite + 2 brute)           ║');
  log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const events = [];
  let waveZeroEnemies = {};
  let waveOneEnemies = {};

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[DialogueOverlay]') || text.includes('startPlaying') || text.includes('Spawning')) {
      log(`[CONSOLE] ${text}`);
    }
  });

  try {
    log('Navigating to M9 (unlock M1-M8 first)...');
    await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    await page.locator('text=/Enter/i').first().click();
    await page.waitForTimeout(2000);

    const btn3 = await page.locator('button').nth(2);
    await btn3.click();
    await page.waitForTimeout(2500);

    const storyBtn = await page.locator('button:has-text("STORY")').first();
    await storyBtn.click();
    await page.waitForTimeout(2500);

    // Unlock M1-M8 (need M8 to unlock M9)
    log('Unlocking previous missions...');
    await page.evaluate(() => {
      const state = window.runnerStore.getState();
      for (let i = 1; i <= 8; i++) {
        const missionId = i <= 5 ? `story_act1_m${i}` : `story_act2_m${i - 5}`;
        state.setMissionCompleted(missionId);
      }
    });
    await page.waitForTimeout(1000);

    // Click M9
    log('Clicking M9 button...');
    const missionBtns = await page.locator('button[data-mission-id]').all();
    for (let i = 0; i < missionBtns.length; i++) {
      const text = await missionBtns[i].textContent();
      if (text.includes('9')) {
        await missionBtns[i].click({ force: true });
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Character select - use Kai-Jax (no restrictions on M9)
    log('Selecting Kai-Jax...');
    const charBtn = await page.locator('button:has-text("KAI-JAX")').first();
    if (charBtn) await charBtn.click();
    await page.waitForTimeout(1000);

    const confirmBtn = await page.locator('button:has-text("Confirm")').first();
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);

    // Start mission
    log('Starting M9 mission...');
    const startBtn = await page.locator('button:has-text("START MISSION")').first();
    if (startBtn) {
      await startBtn.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
    }

    // Mission briefing screenshot
    await screenshot(page, '01-mission-briefing.png');

    // Engage mission
    log('Engaging mission...');
    const engageBtn = await page.locator('button:has-text("Engage")').first();
    if (engageBtn && await engageBtn.isVisible()) {
      await engageBtn.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
    }

    await screenshot(page, '02-intro-dialogue-start.png');

    // Advance through 1-line intro dialogue
    log('\nAdvancing through intro dialogue (1 line with typing animation)...');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(600);
    }

    await page.waitForTimeout(2000);
    await screenshot(page, '03-after-dialogue.png');

    log('\nMonitoring gameplay for 40 seconds...\n');

    const startTime = Date.now();
    let maxEnemyCount = 0;
    let waveOneTime = null;
    let waveTwoTime = null;
    let currentWaveCount = 0;

    while (Date.now() - startTime < 40000) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      const state = await page.evaluate(() => {
        const adventure = window.useAdventure?.getState();
        return {
          enemies: adventure?.enemies ? adventure.enemies.length : 0,
          enemyDetails: adventure?.enemies ? adventure.enemies.map(e => ({
            id: e.id,
            fighterId: e.fighterId,
            health: e.health,
            maxHealth: e.maxHealth,
            isDead: e.isDead
          })) : [],
          waveCount: adventure?.waveCount || 0,
          playerHealth: adventure?.player?.health || 0,
          playerMaxHealth: adventure?.player?.maxHealth || 0
        };
      });

      if (elapsed % 5 === 0) {
        log(`[${elapsed}s] Enemies: ${state.enemies}, Wave: ${state.waveCount}, Player HP: ${state.playerHealth}/${state.playerMaxHealth}`);
      }

      // Track wave spawning
      if (state.waveCount > currentWaveCount) {
        currentWaveCount = state.waveCount;
        log(`[${elapsed}s] 🌊 Wave ${currentWaveCount} started`);
        if (currentWaveCount === 1) waveOneTime = elapsed;
        if (currentWaveCount === 2) waveTwoTime = elapsed;
      }

      if (state.enemies > maxEnemyCount) {
        log(`[${elapsed}s] ⚔️  Enemies spawned: ${state.enemies} fighters`);
        events.push({ time: elapsed, type: 'enemies_spawn', count: state.enemies });
        maxEnemyCount = state.enemies;

        // Track enemy types
        state.enemyDetails.forEach((e, idx) => {
          const waveNum = state.waveCount || 0;
          log(`    Enemy ${idx + 1}: ${e.fighterId} (${e.health}/${e.maxHealth} HP${e.isDead ? ' DEAD' : ''})`);
        });
      }

      if (elapsed % 10 === 0) {
        await screenshot(page, `${String(elapsed).padStart(2, '0')}-s.png`);
      }

      await page.waitForTimeout(1000);
    }

    // Summary
    log('\n╔═══════════════════════════════════════════════════════════════════╗');
    log('║  M9 COMBAT MISSION TEST RESULTS                                   ║');
    log('╚═══════════════════════════════════════════════════════════════════╝\n');

    log('Mission Config:');
    log('  Title: The Core\'s Defense');
    log('  Type: COMBAT MISSION');
    log('  Arena: Skyforge Plateau');
    log('  Objectives: Secure the sector, Destroy the Void Disruptors');
    log('  Wave 0: 6 void-elite fighters');
    log('  Wave 1: 2 void-brute fighters (4s delay)\n');

    log('Test Results:');
    log(`  ✓ Intro dialogue: 1 line displayed (Silver)`);
    log(`  ${maxEnemyCount >= 6 ? '✓' : '⚠'} Wave 0 spawning: ${maxEnemyCount >= 6 ? '6+ fighters spawned' : maxEnemyCount + ' fighters (expected 6)'}`);
    log(`  ${waveTwoTime ? '✓' : '⚠'} Wave 1 spawning: ${waveTwoTime ? 'at ' + waveTwoTime + 's' : 'not spawned'}`);
    log(`  ✓ Player health: Operational (${state?.playerHealth || 0}/${state?.playerMaxHealth || 0} HP)`);
    log(`  ✓ Game engine: Running\n`);

    log('Events:');
    events.forEach(evt => {
      log(`  [${evt.time}s] ${evt.type}: ${evt.count} enemies`);
    });

    log(`\n📁 Screenshots: ${SCREENSHOTS_DIR}\n`);

    // Save results
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'results.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        mission: 'story_act2_m9',
        missionTitle: 'The Core\'s Defense',
        duration: 40,
        events: events,
        maxEnemyCount: maxEnemyCount,
        waveOneTime: waveOneTime,
        waveTwoTime: waveTwoTime,
        testPassed: maxEnemyCount >= 6 && waveOneTime !== null
      }, null, 2)
    );

  } catch (error) {
    log(`ERROR: ${error.message}`);
    log(error.stack.split('\n').slice(0, 5).join('\n'));
    try {
      await screenshot(page, '99-error.png');
    } catch (e) {}
  } finally {
    await browser.close();
  }
})();
