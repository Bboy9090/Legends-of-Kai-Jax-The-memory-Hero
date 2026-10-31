#!/usr/bin/env node
/**
 * M13 Mission Configuration Validation
 * Act III: Unity's Dawn - Mission 13
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.resolve(__dirname, '../..');
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M13] ${msg}`);

const m13Start = content.indexOf("id: 'story_act3_m13'");
const m13End = content.indexOf("id: 'story_act3_m14'");
const m13Content = content.substring(m13Start, m13End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M13 MISSION CONFIGURATION VALIDATION                             ║');
log('║  Ascension to the Ashen Expanse - ACT III SURVIVAL                ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

const checks = {
  missionId: { pattern: /id:\s*'story_act3_m13'/, expected: "mission ID" },
  title: { pattern: /title:\s*'Ascension to the Ashen Expanse'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Survive the Ashen Ascent.*Defeat the God-Guard.*\]/, expected: "survival objectives" },
  gameplayType: { pattern: /gameplayType:\s*'survival'/, expected: "survival gameplay type" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-god-guard'[^}]*count:\s*6[^}]*}[^}]*{[^}]*type:\s*'void-god-guard'[^}]*count:\s*8[^}]*delay:\s*6/, expected: "2 enemy waves (6 god-guard + 8 god-guard, 6s delay)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m13Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

log('Mission Details:\n');
log('ID: story_act3_m13');
log('Title: Ascension to the Ashen Expanse');
log('Type: Survival Mission (ACT III - Mission 3)');
log('Difficulty: 9/10 (Extreme)');
log('Arena: void_heart_citadel\n');

log('Intro Dialogue (1 line):');
log('  1. Kaison: "The air is thick with pure dark matter. Keep your guard up!"\n');

log('Enemy Waves:');
log('  Wave 0: 6 void-god-guard fighters');
log('  Wave 1: 8 void-god-guard fighters (6s delay)\n');

log('Objectives:');
log('  • Survive the Ashen Ascent');
log('  • Defeat the God-Guard\n');

log('Rewards:');
log('  • 900 XP');
log('  • 800 Gold');
log('  • Ashen Relic (unique loot)\n');

log('---\n');
log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M13 mission is properly configured');
  log('✓ Survival mission with god-guard enemies\n');
  log('Expected Gameplay Flow:');
  log('  1. Mission Briefing (displays 2 objectives)');
  log('  2. Engage Mission button');
  log('  3. 1-line intro dialogue (Kaison)');
  log('  4. Wave 0: 6 void-god-guard fighters spawn');
  log('  5. Survival combat phase');
  log('  6. After Wave 0 defeated, 6s delay');
  log('  7. Wave 1: 8 void-god-guard fighters spawn');
  log('  8. Final survival phase - defeat all guards');
  log('  9. Victory: 1-line outro + results screen');
} else {
  log('⚠ M13 mission has configuration issues');
}

log('\n');

if (failed > 0) {
  process.exit(1);
}
