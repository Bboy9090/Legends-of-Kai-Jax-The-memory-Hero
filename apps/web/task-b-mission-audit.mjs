#!/usr/bin/env node
/**
 * TASK B: Mission State Contradiction Audit
 * Investigate why mission cards show disabled vs selectable in different runs
 */

import { chromium } from 'playwright';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';

async function auditMissionState() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const findings = {
    commit_sha: null,
    profile_id: null,
    gamestate: null,
    act_selected: null,
    missions: []
  };

  try {
    console.log('🔍 TASK B: Mission State Contradiction Audit\n');

    // Navigate
    console.log('[1/5] Navigate to game...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Capture git state
    console.log('[2/5] Capture git state...');
    const gitState = await page.evaluate(() => {
      return {
        commit_sha: document.body.getAttribute('data-commit') || 'not available',
        built_at: document.body.getAttribute('data-built') || 'not available'
      };
    });
    findings.commit_sha = gitState.commit_sha;

    // PLAY GAME
    console.log('[3/5] Navigate to game menu...');
    await page.locator('button').filter({ hasText: /PLAY|Play/i }).first().click();
    await page.waitForTimeout(5000);

    // START SAGA / Story Mode
    console.log('[4/5] Enter Story Mode...');
    await page.locator('button').filter({ hasText: /START|Story/i }).first().click();
    await page.waitForTimeout(3000);

    // Inspect mission state
    console.log('[5/5] Audit mission state...');

    const missionState = await page.evaluate(() => {
      const state = {
        // Storage
        localStorage_keys: Object.keys(localStorage),
        sessionStorage_keys: Object.keys(sessionStorage),

        // Current route/screen
        screen_heading: document.body.innerText.split('\n')[0],
        current_url: window.location.href,

        // Game state
        gamestate_text: document.body.innerText.includes('CampaignMap') ? 'campaign-map' : 'unknown',

        // Act/Chapter indicators
        visible_text_sample: document.body.innerText.substring(0, 500),

        // Mission buttons
        missions: []
      };

      // Find all mission buttons/cards
      const missionElements = document.querySelectorAll('button, [role="button"], div[class*="mission"], div[class*="card"]');

      missionElements.forEach((el, idx) => {
        const isButton = el.tagName === 'BUTTON';
        const text = el.textContent?.trim().substring(0, 100) || '';

        if (text && (text.includes('Boss') || text.includes('Chapter') || text.includes('Mission') || text.includes('vs') || /^\d+/.test(text))) {
          state.missions.push({
            index: idx,
            tag: el.tagName,
            text: text,
            disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
            classes: el.className,
            role: el.getAttribute('role'),
            aria_label: el.getAttribute('aria-label'),
            opacity: window.getComputedStyle(el).opacity,
            pointer_events: window.getComputedStyle(el).pointerEvents,
            cursor: window.getComputedStyle(el).cursor
          });
        }
      });

      return state;
    });

    findings.gamestate = missionState.gamestate_text;
    findings.missions = missionState.missions;

    // Check storage for progression
    console.log('\n📊 MISSION STATE AUDIT:\n');
    console.log(`Commit SHA: ${findings.commit_sha}`);
    console.log(`Current URL: ${missionState.current_url}`);
    console.log(`Screen Heading: ${missionState.screen_heading}`);
    console.log(`Game State: ${findings.gamestate}`);

    console.log(`\n📦 Storage Keys:`);
    console.log(`  localStorage: ${missionState.localStorage_keys.length} keys`);
    missionState.localStorage_keys.slice(0, 10).forEach(k => console.log(`    - ${k}`));

    console.log(`\n🎮 Mission Buttons Found: ${missionState.missions.length}`);
    if (missionState.missions.length > 0) {
      console.log(`\n| # | Text | Disabled | Classes | Cursor | Opacity |`);
      console.log(`|---|------|----------|---------|--------|---------|`);
      missionState.missions.slice(0, 10).forEach(m => {
        console.log(`| ${m.index} | ${m.text.substring(0, 20)} | ${m.disabled ? '✓' : '-'} | ${m.classes.substring(0, 20)} | ${m.cursor} | ${m.opacity} |`);
      });
    } else {
      console.log('  ⚠️ No mission buttons found - may not be on campaign map');
    }

    // Try to enable first mission if disabled
    console.log(`\n🔧 Attempting to interact with first mission...`);
    const firstMissionClickable = missionState.missions.filter(m => !m.disabled).length > 0;

    if (firstMissionClickable) {
      console.log('  ✓ Enabled missions found - clickable');
      const enabledMission = missionState.missions.find(m => !m.disabled);
      console.log(`  First enabled: "${enabledMission.text.substring(0, 50)}"`);
    } else if (missionState.missions.length > 0) {
      console.log('  ✗ All missions disabled - cannot click');
    } else {
      console.log('  ? No missions found on screen');
    }

    // Check localStorage for progression state
    console.log(`\n💾 Checking localStorage for progression indicators...`);
    const progressionKeys = missionState.localStorage_keys.filter(k =>
      k.toLowerCase().includes('progress') ||
      k.toLowerCase().includes('mission') ||
      k.toLowerCase().includes('act') ||
      k.toLowerCase().includes('completed') ||
      k.toLowerCase().includes('story')
    );

    if (progressionKeys.length > 0) {
      console.log(`  Found ${progressionKeys.length} progression-related keys:`);
      for (const key of progressionKeys.slice(0, 5)) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          console.log(`  - ${key}: ${JSON.stringify(value).substring(0, 100)}`);
        } catch {
          console.log(`  - ${key}: (unparseable)`);
        }
      }
    } else {
      console.log('  No obvious progression keys found');
    }

    return findings;

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    findings.error = err.message;
    return findings;
  } finally {
    await browser.close();
  }
}

auditMissionState().then(findings => {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📋 Full audit data:');
  console.log(JSON.stringify(findings, null, 2));
});
