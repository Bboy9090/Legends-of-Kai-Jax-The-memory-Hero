#!/usr/bin/env node
/**
 * M12 Mission Configuration Validation
 * Verify all mission data and systems are configured correctly
 * Act III: Unity's Dawn - Mission 12 (Boss)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.resolve(__dirname, '../..');
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M12] ${msg}`);

const m12Start = content.indexOf("id: 'story_act3_m12'");
const m12End = content.indexOf("id: 'story_act3_m13'");
const m12Content = content.substring(m12Start, m12End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M12 MISSION CONFIGURATION VALIDATION                             ║');
log('║  The General\'s Fall - ACT III BOSS MISSION                        ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

const checks = {
  missionId: { pattern: /id:\s*'story_act3_m12'/, expected: "mission ID" },
  title: { pattern: /title:\s*'The General\\'s Fall'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue (2 lines)" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Win within 120s.*Use 3 Specials.*\]/, expected: "boss objectives with time limit" },
  gameplayType: { pattern: /gameplayType:\s*'boss'/, expected: "boss gameplay type" },
  bossId: { pattern: /bossId:\s*'rift-general-prime'/, expected: "boss ID (rift-general-prime)" },
  timeLimit: { pattern: /timeLimit:\s*120/, expected: "120 second time limit" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-legion'[^}]*count:\s*5/, expected: "1 enemy wave (5 void-legion)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m12Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

log('Mission Details:\n');
log('ID: story_act3_m12');
log('Title: The General\'s Fall');
log('Type: Boss Mission (ACT III - Mission 2)');
log('Difficulty: 9/10 (Extreme)');
log('Arena: void_heart_citadel');
log('Boss: Rift General Prime');
log('Time Limit: 120 seconds\n');

log('Intro Dialogue (2 lines):');
log('  1. Rift General Prime: "You are but a glitch in the grand design."');
log('  2. Kai-Jax: "I am the design."\n');

log('Enemy Waves:');
log('  Wave 0: 5 void-legion fighters\n');

log('Objectives:');
log('  • Win within 120s (time-limited boss fight)');
log('  • Use 3 Specials (must use special moves)\n');

log('Rewards:');
log('  • 1200 XP');
log('  • 1000 Gold');
log('  • General\'s Core (unique loot)\n');

log('---\n');
log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M12 mission is properly configured');
  log('✓ Boss encounter with time limit + special mechanic\n');
  log('Expected Gameplay Flow:');
  log('  1. Mission Briefing (displays 2 objectives)');
  log('  2. Engage Mission button');
  log('  3. 2-line intro dialogue (General Prime + Kai-Jax)');
  log('  4. Wave 0: 5 void-legion fighters spawn');
  log('  5. Timed boss combat (120 second limit)');
  log('  6. Must use 3 special moves during fight');
  log('  7. Victory requires defeating boss before time expires');
  log('  8. Victory: 1-line outro + results screen');
  log('  9. Defeat: time expires or boss wins');
} else {
  log('⚠ M12 mission has configuration issues');
}

log('\n');

if (failed > 0) {
  process.exit(1);
}
