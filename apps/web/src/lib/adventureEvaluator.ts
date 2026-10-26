import type { AdventureEnemy, ObjectiveState } from "./stores/useAdventure";

export type ProgressionOutcome = "CONTINUE" | "VICTORY" | "FAILED";

export function evaluateCampaignProgressionGating(state: {
  missionId: string | null;
  enemies: AdventureEnemy[];
  objectives: ObjectiveState;
  currentWaveIndex: number;
  totalWavesCount: number;
}): ProgressionOutcome {
  const { missionId, enemies, objectives, currentWaveIndex, totalWavesCount } = state;
  if (objectives.status === "FAILED") return "FAILED";
  if (objectives.status !== "ACTIVE") return "CONTINUE";
  if (missionId === "story_act1_m4" && objectives.milestones.chaseTargetEscaped) return "FAILED";
  if (missionId === "story_act1_m5") {
    if (objectives.civilianRegistry.length === 0) return "CONTINUE";
    if (objectives.civilianRegistry.every(c => c.health <= 0)) return "FAILED";
  }
  if (totalWavesCount <= 0 || currentWaveIndex !== totalWavesCount - 1) return "CONTINUE";
  if (enemies.length === 0 || enemies.some(e => !e.isDead && e.health > 0 && !(missionId === "story_act1_m4" && e.fighterId === "void-stalker" && objectives.milestones.stalkerIntercepted))) return "CONTINUE";
  if (missionId === "story_act1_m4" && !objectives.milestones.stalkerIntercepted) return "CONTINUE";
  if (missionId === "story_act1_m5" && !objectives.milestones.generalDefeated) return "CONTINUE";
  return "VICTORY";
}
