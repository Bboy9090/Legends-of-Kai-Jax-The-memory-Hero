import { ALL_STORY_MISSIONS, type StoryMission } from "./story_missions";
import { normalizeHeroId } from "./heroVisualIdentity";

/** The story mission whose completion unlocks a hero, or undefined for heroes unlocked from the start. */
export function unlockSourceFor(heroId: string): StoryMission | undefined {
  const id = normalizeHeroId(heroId);
  return ALL_STORY_MISSIONS.find((m) => m.rewards.unlocks?.some((u) => normalizeHeroId(u) === id));
}

export function unlockHintFor(heroId: string): string {
  const mission = unlockSourceFor(heroId);
  return mission ? `Complete Act ${mission.actNumber} · Mission ${mission.missionNumber}` : "Story reward";
}
