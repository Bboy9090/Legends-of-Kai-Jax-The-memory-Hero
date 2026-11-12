import { describe, expect, it } from 'vitest';
import { ALL_STORY_MISSIONS, getStoryMissionsByAct } from './story_missions';
import { validateMissionUnlockState } from './campaignProgression';
import { normalizeWaveEnemies } from './storyWaveRuntime';

const TOTAL_MISSIONS = 45;

describe('campaign progression', () => {
  it('uses exactly forty-five ordered canonical missions across nine acts', () => {
    expect(ALL_STORY_MISSIONS).toHaveLength(TOTAL_MISSIONS);
    expect(ALL_STORY_MISSIONS.map(m => m.missionNumber)).toEqual(Array.from({ length: TOTAL_MISSIONS }, (_, i) => i + 1));
    expect(new Set(ALL_STORY_MISSIONS.map(m => m.id)).size).toBe(TOTAL_MISSIONS);
  });
  it('gives each of the nine acts five missions, in act order', () => {
    for (let act = 1; act <= 9; act++) {
      expect(getStoryMissionsByAct(act)).toHaveLength(5);
    }
    expect(ALL_STORY_MISSIONS.map(m => m.actNumber)).toEqual(
      Array.from({ length: TOTAL_MISSIONS }, (_, i) => Math.floor(i / 5) + 1)
    );
  });
  it('gives every mission cutscenes, objectives, and a consistent id', () => {
    for (const m of ALL_STORY_MISSIONS) {
      expect(m.id).toBe(`story_act${m.actNumber}_m${m.missionNumber}`);
      expect(m.introCutscene.length).toBeGreaterThan(0);
      expect(m.outroCutscene.length).toBeGreaterThan(0);
      expect(m.objectives.length).toBeGreaterThan(0);
    }
  });
  it('ends each act on a boss mission, except the two epilogues', () => {
    for (let act = 1; act <= 9; act++) {
      const actMissions = getStoryMissionsByAct(act);
      const last = actMissions[actMissions.length - 1];
      if (last.id === 'story_act3_m15' || last.id === 'story_act9_m45') continue;
      expect(last.gameplayType, last.id).toBe('boss');
      expect(last.bossId, last.id).toBeTruthy();
    }
  });
  it('spawns at least one enemy for every non-epilogue wave', () => {
    for (const m of ALL_STORY_MISSIONS) {
      m.enemyWaves.forEach((_, waveIndex) => {
        expect(normalizeWaveEnemies(m, waveIndex).length, `${m.id} wave ${waveIndex}`).toBeGreaterThan(0);
      });
    }
  });
  it('allows the opening mission and rejects invalid identities', () => {
    expect(validateMissionUnlockState('story_act1_m1', []).isUnlocked).toBe(true);
    expect(validateMissionUnlockState('story_act1_m2', []).isUnlocked).toBe(false);
    expect(validateMissionUnlockState('missing', []).isUnlocked).toBe(false);
    expect(validateMissionUnlockState(null, []).isUnlocked).toBe(false);
  });
  it('unlocks each mission only after its canonical predecessor', () => {
    for (let i = 1; i < ALL_STORY_MISSIONS.length; i++) {
      const mission = ALL_STORY_MISSIONS[i];
      expect(validateMissionUnlockState(mission.id, []).isUnlocked).toBe(false);
      expect(validateMissionUnlockState(mission.id, [ALL_STORY_MISSIONS[i - 1].id]).isUnlocked).toBe(true);
    }
  });
});
