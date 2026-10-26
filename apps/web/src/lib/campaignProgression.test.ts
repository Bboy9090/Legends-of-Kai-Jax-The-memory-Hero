import { describe, expect, it } from 'vitest';
import { ALL_STORY_MISSIONS } from './story_missions';
import { validateMissionUnlockState } from './campaignProgression';

describe('campaign progression', () => {
  it('uses exactly fifteen ordered canonical missions across three acts', () => {
    expect(ALL_STORY_MISSIONS).toHaveLength(15);
    expect(ALL_STORY_MISSIONS.map(m => m.missionNumber)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(new Set(ALL_STORY_MISSIONS.map(m => m.id)).size).toBe(15);
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
