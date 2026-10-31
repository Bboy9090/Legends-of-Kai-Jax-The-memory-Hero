import { ALL_STORY_MISSIONS, type StoryMission } from './story_missions';

export interface MissionAccess {
  isUnlocked: boolean;
  mission?: StoryMission;
  reason?: string;
}

export function validateMissionUnlockState(id: string | null, completedIds: readonly string[]): MissionAccess {
  if (!id) return { isUnlocked: false, reason: 'No mission selected.' };
  const index = ALL_STORY_MISSIONS.findIndex((mission) => mission.id === id);
  if (index < 0) return { isUnlocked: false, reason: `Unknown mission: ${id}` };
  const mission = ALL_STORY_MISSIONS[index];
  if (index === 0 || completedIds.includes(ALL_STORY_MISSIONS[index - 1].id)) {
    return { isUnlocked: true, mission };
  }
  return { isUnlocked: false, mission, reason: `Complete ${ALL_STORY_MISSIONS[index - 1].title} first.` };
}
