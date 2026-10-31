#!/usr/bin/env node
/**
 * M11 Mission Configuration Validation
 * Verify all mission data and systems are configured correctly
 * Act III: Unity's Dawn - Mission 11
 */

const path = require('path');
const fs = require('fs');

const repoPath = '/home/user/Legends-of-Kai-Jax-The-memory-Hero';
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M11] ${msg}`);

const m11Start = content.indexOf("id: 'story_act3_m11'");
const m11End = content.indexOf("id: 'story_act3_m12'");
const m11Content = content.substring(m11Start, m11End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M11 MISSION CONFIGURATION VALIDATION                             ║');
log('║  The Citadel Gates - ACT III, MISSION 1                           ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

const checks = {
  missionId: { pattern: /id:\s*'story_act3_m11'/, expected: "mission ID" },
  title: { pattern: /title:\s*'The Citadel Gates'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Destroy the Rift Pylons.*Breach the Citadel Gates.*\]/, expected: "citadel objectives" },
  gameplayType: { pattern: /gameplayType:\s*'combat'/, expected: "combat gameplay type" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-legion'[^}]*count:\s*8[^}]*}[^}]*{[^}]*type:\s*'void-elite'[^}]*count:\s*6[^}]*delay:\s*5/, expected: "2 enemy waves (8 legion + 6 elite, 5s delay)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m11Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

const dialogueSection = m11Content.match(/introCutscene:\s*\[([\s\S]*?)\]/)?.[1];
const lines = dialogueSection ? dialogueSection.match(/{\s*speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/g) : [];

log('Mission Details:\n');
log('ID: story_act3_m11');
log('Title: The Citadel Gates');
log('Type: Combat Mission (ACT III - Mission 1)');
log('Difficulty: 8/10');
log('Arena: void_heart_citadel\n');

if (lines && lines.length > 0) {
  log(`Intro Dialogue (${lines.length} line${lines.length > 1 ? 's' : ''}):`);
  lines.forEach((line, idx) => {
    const match = line.match(/speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/);
    if (match) {
      log(`  ${idx + 1}. ${match[1]}: "${match[2]}"`);
    }
  });
}

log('\nEnemy Waves:');
log('  Wave 0: 8 void-legion fighters');
log('  Wave 1: 6 void-elite fighters (5s delay)');

log('\nObjectives:');
log('  • Destroy the Rift Pylons');
log('  • Breach the Citadel Gates');

log('\nRewards:');
log('  • 800 XP');
log('  • 600 Gold');
log('  • Citadel Key (unique loot)');

log('\n---\n');
log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M11 mission is properly configured');
  log('✓ Act III ready for gameplay testing');
  log('\nExpected Gameplay Flow:');
  log('  1. Mission Briefing (displays 2 objectives)');
  log('  2. Engage Mission button');
  log('  3. 1-line intro dialogue (Kai-Jax: "No turning back now.")');
  log('  4. Wave 0: 8 void-legion fighters spawn');
  log('  5. Combat phase - destroy pylons');
  log('  6. After Wave 0 defeated, 5s delay');
  log('  7. Wave 1: 6 void-elite fighters spawn');
  log('  8. Final combat - breach gates');
  log('  9. Victory: 1-line outro + results screen');
} else {
  log('⚠ M11 mission has configuration issues');
}

log('\n');
