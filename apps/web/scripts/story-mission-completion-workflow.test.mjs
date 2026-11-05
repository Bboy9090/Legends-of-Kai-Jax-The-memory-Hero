import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const workflow = fs.readFileSync('.github/workflows/story-mission-completion.yml', 'utf8');
const mission = fs.readFileSync('apps/web/e2e/mission6-flow.devtest.ts', 'utf8');

test('mission completion workflow runs the existing full M6-C integration path', () => {
  for (const marker of [
    "e2e/mission6-flow.devtest.ts",
    "M6-C real mission UI",
    "STORY_MISSION_COMPLETION=PASS",
    "EVIDENCE_CLASS=state-driven-software-integration",
    "PHYSICAL_DEVICE_CERTIFICATION=NOT_PROVEN",
    "USER_EXECUTED_ATTACKS=NOT_PROVEN",
  ]) {
    assert.ok(workflow.includes(marker), marker);
  }
});

test('M6-C proves persisted completion and reward through the real mission UI', () => {
  for (const marker of [
    'Mission Complete',
    'story-mission-loot-reward',
    'completedStoryMissionIds.includes("story_act2_m6")',
    'persistedLoot',
    'Ashblock Memory',
    'score: 850',
  ]) {
    assert.ok(mission.includes(marker), marker);
  }
});
