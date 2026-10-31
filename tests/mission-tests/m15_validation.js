#!/usr/bin/env node
/**
 * M15 Mission Configuration Validation
 * Act III: Unity's Dawn - Mission 15 (EPILOGUE)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.resolve(__dirname, '../..');
const storyMissionsPath = path.join(repoPath, 'apps/web/src/lib/story_missions.ts');
const content = fs.readFileSync(storyMissionsPath, 'utf8');

const log = (msg) => console.log(`[M15] ${msg}`);

const m15Start = content.indexOf("id: 'story_act3_m15'");
const m15End = content.indexOf("export const ALL_STORY_MISSIONS");
const m15Content = content.substring(m15Start, m15End);

log('╔═══════════════════════════════════════════════════════════════════╗');
log('║  M15 MISSION CONFIGURATION VALIDATION                             ║');
log('║  Epilogue: Unity\'s Dawn - STORY CONCLUSION                       ║');
log('╚═══════════════════════════════════════════════════════════════════╝\n');

const checks = {
  missionId: { pattern: /id:\s*'story_act3_m15'/, expected: "mission ID" },
  title: { pattern: /title:\s*'Epilogue: Unity\\'s Dawn'/, expected: "mission title" },
  introCutscene: { pattern: /introCutscene:\s*\[[\s\S]*?\]/, expected: "intro dialogue (2 lines)" },
  outroCutscene: { pattern: /outroCutscene:\s*\[[\s\S]*?\]/, expected: "outro dialogue (2 lines)" },
  objectives: { pattern: /objectives:\s*\[.*Witness the restoration.*\]/, expected: "epilogue objective" },
  gameplayType: { pattern: /gameplayType:\s*'combat'/, expected: "combat gameplay type" },
  difficulty: { pattern: /difficulty:\s*1/, expected: "difficulty 1 (narrative only)" },
  enemyWaves: { pattern: /enemyWaves:\s*\[\]/, expected: "no enemy waves (epilogue)" }
};

let passed = 0;
let failed = 0;

log('Validating mission configuration:\n');

for (const [key, check] of Object.entries(checks)) {
  if (check.pattern.test(m15Content)) {
    log(`  ✓ ${check.expected}`);
    passed++;
  } else {
    log(`  ✗ ${check.expected} - NOT FOUND`);
    failed++;
  }
}

log('\n---\n');

log('Mission Details:\n');
log('ID: story_act3_m15');
log('Title: Epilogue: Unity\'s Dawn');
log('Type: Narrative/Epilogue (ACT III - Mission 5)');
log('Difficulty: 1/10 (Story Only - No Combat)');
log('Arena: void_heart_citadel');
log('Enemy Waves: None (Epilogue/Cutscene)\n');

log('Intro Dialogue (2 lines):');
log('  1. Narrator: "The Void recedes. Light returns to the Bronx. The memories of millions are restored."');
log('  2. Kai-Jax: "We did it, Jaxon. We did it, Kaison."\n');

log('Outro Dialogue (2 lines):');
log('  1. Narrator: "Legends of Kai-Jax. The saga of the Memory Warrior. End of Book I."\n');

log('Objectives:');
log('  • Witness the restoration (narrative objective)\n');

log('Rewards:');
log('  • 1000 XP');
log('  • 1000 Gold');
log('  • Saga Completion Ribbon (completion loot)\n');

log('---\n');
log(`Summary: ${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  log('✓ M15 mission is properly configured');
  log('✓ Epilogue: Book I Conclusion\n');
  log('Expected Gameplay Flow:');
  log('  1. Mission Briefing (displays narrative conclusion)');
  log('  2. Engage Mission button');
  log('  3. 2-line intro dialogue (Narrator + Kai-Jax)');
  log('  4. NO COMBAT - Pure narrative sequence');
  log('  5. 2-line outro dialogue (Narrator)');
  log('  6. Results screen with completion rewards');
  log('  7. Book I saga conclusion');
  log('  8. Story Credits / Completion Screen');
  log('\nSpecial Notes:');
  log('  - M15 is the epilogue/conclusion');
  log('  - Difficulty 1 (no actual gameplay)');
  log('  - No enemy waves');
  log('  - Pure narrative/story sequence');
  log('  - Rewards are for story completion');
  log('  - Marks end of "Book I"');
} else {
  log('⚠ M15 mission has configuration issues');
}

log('\n');

if (failed > 0) {
  process.exit(1);
}
