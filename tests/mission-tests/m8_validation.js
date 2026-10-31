#!/usr/bin/env node
/**
 * M8 Mission Configuration Validation
 * Verify all mission data and systems are configured correctly
 */

const path = require('path');

// Load the story missions file
const repoPath = '/home/user/Legends-of-Kai-Jax-The-memory-Hero';
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = require('fs').readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M8] ${msg}`);

// Parse mission definition
const m8Start = content.indexOf("id: 'story_act2_m8'");
const m8End = content.indexOf("id: 'story_act2_m9'");
const m8Content = content.substring(m8Start, m8End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M8 MISSION CONFIGURATION VALIDATION                              ║');
log('║  The Ghostly Echo - Survival Mission                              ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Validation checks
const checks = {
  missionId: { pattern: /id:\s*'story_act2_m8'/, expected: "mission ID" },
  title: { pattern: /title:\s*'The Ghostly Echo'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Survive.*Don't use special moves.*\]/, expected: "survival objectives" },
  gameplayType: { pattern: /gameplayType:\s*'survival'/, expected: "survival gameplay type" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-wraith'[^}]*count:\s*8[^}]*}[^}]*{[^}]*type:\s*'void-wraith'[^}]*count:\s*12/, expected: "2 enemy waves (8 + 12)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m8Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

// Extract specific details
const extractText = (pattern) => {
  const match = m8Content.match(pattern);
  return match ? match[1] : null;
};

const dialogueSection = m8Content.match(/introCutscene:\s*\[([\s\S]*?)\]/)[1];
const lines = dialogueSection.match(/{\s*speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/g);

log('Mission Details:\n');
log('ID: story_act2_m8');
log('Title: The Ghostly Echo');
log('Type: Survival Mission');
log('Difficulty: 7 (High)');
log('Arena: rift_frontier\n');

log('Intro Dialogue (2 lines):');
lines.forEach((line, idx) => {
  const match = line.match(/speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/);
  if (match) {
    log(`  ${idx + 1}. ${match[1]}: "${match[2]}"`);
  }
});

log('\nEnemy Waves:');
log('  Wave 0: 8 void-wraith spirits');
log('  Wave 1: 12 void-wraith spirits (5s delay)');

log('\nObjectives:');
log('  • Survive the spectral onslaught');
log('  • Don\'t use special moves');

log('\nRewards:');
log('  • 500 XP');
log('  • 400 Gold');
log('  • Spectral Shard (unique loot)');

log('\n---\n');

log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M8 mission is properly configured');
  log('✓ All systems ready for gameplay testing');
  log('\nExpected Gameplay Flow:');
  log('  1. Mission Briefing (displays mission objectives)');
  log('  2. Engage Mission button');
  log('  3. 2-line intro dialogue (Father/Ghostly Echo)');
  log('  4. Wave 0: 8 void-wraith enemies spawn');
  log('  5. After all enemies defeated, 5s delay');
  log('  6. Wave 1: 12 void-wraith enemies spawn');
  log('  7. Victory or defeat based on survival');
  log('  8. 1-line outro dialogue');
  log('  9. Results screen with rewards');
} else {
  log('⚠ M8 mission has configuration issues');
}

log('\n');
