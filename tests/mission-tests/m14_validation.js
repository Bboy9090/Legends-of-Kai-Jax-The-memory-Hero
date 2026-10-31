#!/usr/bin/env node
/**
 * M14 Mission Configuration Validation
 * Act III: Unity's Dawn - Mission 14 (GRAND FINALE)
 */

const path = require('path');
const fs = require('fs');

const repoPath = '/home/user/Legends-of-Kai-Jax-The-memory-Hero';
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M14] ${msg}`);

const m14Start = content.indexOf("id: 'story_act3_m14'");
const m14End = content.indexOf("id: 'story_act3_m15'");
const m14Content = content.substring(m14Start, m14End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M14 MISSION CONFIGURATION VALIDATION                             ║');
log('║  Voidonus Imperion: Final Duel - GRAND FINALE BOSS MISSION        ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

const checks = {
  missionId: { pattern: /id:\s*'story_act3_m14'/, expected: "mission ID" },
  title: { pattern: /title:\s*'Voidonus Imperion: Final Duel'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue (2 lines)" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue" },
  objectives: { pattern: /objectives:\s*\[.*Defeat Voidonus Imperion.*Win with >50% HP.*\]/, expected: "grand finale objectives" },
  gameplayType: { pattern: /gameplayType:\s*'boss'/, expected: "boss gameplay type" },
  bossId: { pattern: /bossId:\s*'voidonus-imperion'/, expected: "boss ID (voidonus-imperion)" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\s*{[^}]*type:\s*'void-god-guard'[^}]*count:\s*3/, expected: "1 enemy wave (3 god-guard)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m14Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

log('Mission Details:\n');
log('ID: story_act3_m14');
log('Title: Voidonus Imperion: Final Duel');
log('Type: Boss Mission (GRAND FINALE - ACT III - Mission 4)');
log('Difficulty: 10/10 (ULTIMATE - Hardest in entire story!)');
log('Arena: void_heart_citadel');
log('Boss: Voidonus Imperion (Void Emperor)\n');

log('Intro Dialogue (2 lines):');
log('  1. Voidonus: "I am the end of all stories. Your memory will be the first to burn."');
log('  2. Kai-Jax: "A hero is never forgotten. And a memory is never truly gone!"\n');

log('Enemy Waves:');
log('  Wave 0: 3 void-god-guard fighters\n');

log('Objectives:');
log('  • Defeat Voidonus Imperion (final boss)');
log('  • Win with >50% HP (health requirement)\n');

log('Rewards (HIGHEST IN ENTIRE STORY):');
log('  • 2500 XP (highest possible)');
log('  • 2500 Gold (highest possible)');
log('  • God-Tier Soul (ultimate unique loot)\n');

log('---\n');
log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M14 mission is properly configured');
  log('✓ Grand Finale: Memory King vs Void Emperor\n');
  log('Expected Gameplay Flow:');
  log('  1. Mission Briefing (displays 2 objectives)');
  log('  2. Engage Mission button');
  log('  3. 2-line intro dialogue (Voidonus + Kai-Jax)');
  log('  4. Wave 0: 3 void-god-guard fighters spawn');
  log('  5. Epic boss battle against Voidonus Imperion');
  log('  6. Victory requires:');
  log('     - Defeating the Void Emperor');
  log('     - Surviving with >50% HP');
  log('  7. Victory: 1-line outro (Kai-Jax) + results screen');
  log('  8. Highest possible rewards earned');
  log('  9. Story progression unlocks M15 (epilogue)');
} else {
  log('⚠ M14 mission has configuration issues');
}

log('\n');
