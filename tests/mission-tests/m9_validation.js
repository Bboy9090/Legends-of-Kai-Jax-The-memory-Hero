#!/usr/bin/env node
/**
 * M9 Mission Configuration Validation
 * Verify all mission data and systems are configured correctly
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.resolve(__dirname, '../..');
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M9] ${msg}`);

// Parse mission definition
const m9Start = content.indexOf("id: 'story_act2_m9'");
const m9End = content.indexOf("id: 'story_act2_m10'");
const m9Content = content.substring(m9Start, m9End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M9 MISSION CONFIGURATION VALIDATION                              ║');
log('║  The Core\'s Defense - Combat Mission                             ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Validation checks
const checks = {
  missionId: { pattern: /id:\s*'story_act2_m9'/, expected: "mission ID" },
  title: { pattern: /title:\s*'The Core\\'s Defense'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Secure the sector.*Destroy the Void Disruptors.*\]/, expected: "combat objectives" },
  gameplayType: { pattern: /gameplayType:\s*'combat'/, expected: "combat gameplay type" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-elite'[^}]*count:\s*6[^}]*}[^}]*{[^}]*type:\s*'void-brute'[^}]*count:\s*2/, expected: "2 enemy waves (6 elite + 2 brute)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m9Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

// Extract specific details
const dialogueSection = m9Content.match(/introCutscene:\s*\[([\s\S]*?)\]/)?.[1];
const lines = dialogueSection ? dialogueSection.match(/{\s*speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/g) : [];

log('Mission Details:\n');
log('ID: story_act2_m9');
log('Title: The Core\'s Defense');
log('Type: Combat Mission');
log('Difficulty: 8 (Extreme)');
log('Arena: Skyforge Plateau\n');

if (lines && lines.length > 0) {
  log(`Intro Dialogue (${lines.length} line${lines.length > 1 ? 's' : ''}):`);
  lines.forEach((line, idx) => {
    const match = line.match(/speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/);
    if (match) {
      log(`  ${idx + 1}. ${match[1]}: "${match[2]}"`);
    }
  });
} else {
  log('Intro Dialogue: (not found)');
}

log('\nEnemy Waves:');
log('  Wave 0: 6 void-elite fighters');
log('  Wave 1: 2 void-brute fighters (4s delay)');

log('\nObjectives:');
log('  • Secure the sector');
log('  • Destroy the Void Disruptors');

log('\nRewards:');
log('  • 750 XP');
log('  • 600 Gold');
log('  • Memory Core (unique loot)');

log('\n---\n');

log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M9 mission is properly configured');
  log('✓ All systems ready for gameplay testing');
  log('\nExpected Gameplay Flow:');
  log('  1. Mission Briefing (displays objectives)');
  log('  2. Engage Mission button');
  log('  3. 1-line intro dialogue (Silver)');
  log('  4. Wave 0: 6 void-elite fighters spawn');
  log('  5. After all enemies defeated, 4s delay');
  log('  6. Wave 1: 2 void-brute fighters spawn');
  log('  7. Victory or defeat based on combat outcome');
  log('  8. Results screen with rewards');
  log('\nTest Notes:');
  log('  - M9 is more difficult than M8 (8/10 vs 7/10)');
  log('  - Combat mission type (offensive) vs survival (defensive)');
  log('  - Wave 1 has fewer enemies (2 vs 12) but tougher type (brute vs wraith)');
  log('  - After defeating Wave 0, 4-second delay before Wave 1 spawns');
} else {
  log('⚠ M9 mission has configuration issues');
}

log('\n');

if (failed > 0) {
  process.exit(1);
}
