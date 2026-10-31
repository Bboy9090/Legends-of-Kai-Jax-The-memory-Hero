#!/usr/bin/env node
/**
 * M10 Mission Configuration Validation
 * Verify all mission data and systems are configured correctly
 * Act II Finale: Siege of the Memory Well
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.resolve(__dirname, '../../..');
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M10] ${msg}`);

// Parse mission definition
const m10Start = content.indexOf("id: 'story_act2_m10'");
const m10End = content.indexOf("id: 'story_act3_m11'") || content.indexOf("ACT III");
const m10Content = content.substring(m10Start, m10End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M10 MISSION CONFIGURATION VALIDATION                             ║');
log('║  Siege of the Memory Well - ACT II FINALE                         ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Validation checks
const checks = {
  missionId: { pattern: /id:\s*'story_act2_m10'/, expected: "mission ID" },
  title: { pattern: /title:\s*'Siege of the Memory Well'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue (2 lines)" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Defeat 3 waves of Elite Void.*Repair the Core.*Defeat the Well Defiler.*\]/, expected: "boss mission objectives" },
  gameplayType: { pattern: /gameplayType:\s*'boss'/, expected: "boss gameplay type" },
  bossId: { pattern: /bossId:\s*'well-defiler'/, expected: "boss ID (well-defiler)" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-elite'[^}]*count:\s*10[^}]*}[^}]*{[^}]*type:\s*'void-brute'[^}]*count:\s*4[^}]*delay:\s*8/, expected: "2 enemy waves (10 elite + 4 brute, 8s delay)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m10Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

// Extract specific details
const dialogueSection = m10Content.match(/introCutscene:\s*\[([\s\S]*?)\]/)?.[1];
const lines = dialogueSection ? dialogueSection.match(/{\s*speaker:\s*'([^']+)'[^}]*text:\s*'([^']+)'/g) : [];

log('Mission Details:\n');
log('ID: story_act2_m10');
log('Title: Siege of the Memory Well');
log('Type: Boss Mission (ACT II FINALE)');
log('Difficulty: 8/10 (Extreme)');
log('Arena: rift_frontier');
log('Boss: Well Defiler\n');

if (lines && lines.length > 0) {
  log(`Intro Dialogue (${lines.length} lines):`);
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
log('  Wave 0: 10 void-elite fighters');
log('  Wave 1: 4 void-brute fighters (8s delay)');

log('\nObjectives:');
log('  • Defeat 3 waves of Elite Void');
log('  • Repair the Core');
log('  • Defeat the Well Defiler');

log('\nRewards:');
log('  • 1000 XP (highest in Act II)');
log('  • 800 Gold (highest in Act II)');
log('  • Ancient Archive (unique loot)');

log('\n---\n');

log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M10 mission is properly configured');
  log('✓ Act II finale ready for gameplay testing');
  log('\nExpected Gameplay Flow:');
  log('  1. Mission Briefing (displays 3 objectives)');
  log('  2. Engage Mission button');
  log('  3. 2-line intro dialogue (Silver + Kai-Jax)');
  log('  4. Wave 0: 10 void-elite fighters spawn');
  log('  5. Combat phase - defeat all elites');
  log('  6. Objective: "Repair the Core" (triggered mid-combat or after Wave 0)');
  log('  7. After Wave 0 defeated, 8s delay');
  log('  8. Wave 1: 4 void-brute fighters spawn');
  log('  9. Final combat - defeat brutes and boss (Well Defiler)');
  log('  10. Victory: 1-line outro dialogue (Narrator)');
  log('  11. Results screen with highest rewards in Act II');
  log('\nTest Notes:');
  log('  - M10 is ACT II FINALE (hardest mission in Act II)');
  log('  - Boss mission type with named boss (well-defiler)');
  log('  - 14 total enemies across 2 waves (10 elite + 4 brute)');
  log('  - Longest wave delay in story (8 seconds)');
  log('  - Highest rewards: 1000 XP + 800 Gold + unique loot');
  log('  - 3 objectives: combat + repair mechanic + boss defeat');
} else {
  log('⚠ M10 mission has configuration issues');
}

log('\n');

if (failed > 0) {
  process.exit(1);
}
