/**
 * Adventure Mode missions — merges design doc (eliminate, survive, objectives)
 * with current wave-based arena. Same combat kernel, different orchestration.
 */

export type AdventureGoalType = "free" | "eliminate" | "survive";

export interface AdventureMissionRewards {
  xp: number;
  currency: number;
}

export interface AdventureMission {
  id: string;
  name: string;
  title: string;
  description: string;
  arenaId: string;
  goalType: AdventureGoalType;
  /** For eliminate: target KO count. For survive: seconds. Ignored for free. */
  goalValue: number;
  objectives: string[];
  rewards: AdventureMissionRewards;
  /** Enemy IDs for waves (minions then optional boss). */
  enemyPool: string[];
  bossId?: string;
  /** Waves before boss spawns (0 = no boss). */
  wavesBeforeBoss?: number;
}

/** Free Arena — endless waves, no mission goal. */
export const FREE_ARENA_ID = "free-arena";

export const ADVENTURE_MISSIONS: AdventureMission[] = [
  {
    id: FREE_ARENA_ID,
    name: "Free Arena",
    title: "Open Arena",
    description: "Endless waves. No objectives. Prove yourself against the Raging City's worst.",
    arenaId: "open-world",
    goalType: "free",
    goalValue: 0,
    objectives: ["Survive as long as you can", "Defeat all waves"],
    rewards: { xp: 0, currency: 0 },
    enemyPool: ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"],
    bossId: "malakor",
    wavesBeforeBoss: 3,
  },
  {
    id: "raging-city-gauntlet",
    name: "Raging City Gauntlet",
    title: "Gauntlet",
    description: "The city teaches you to bleed. Defeat 15 enemies across 5 waves and face the boss.",
    arenaId: "open-world",
    goalType: "eliminate",
    goalValue: 15,
    objectives: ["Defeat 15 enemies", "Clear 5 waves", "Defeat the boss"],
    rewards: { xp: 80, currency: 40 },
    enemyPool: ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"],
    bossId: "malakor",
    wavesBeforeBoss: 4,
  },
  {
    id: "survival-trial",
    name: "Survival Trial",
    title: "Hold the Line",
    description: "Survive 90 seconds in the arena. Enemies never stop coming.",
    arenaId: "open-world",
    goalType: "survive",
    goalValue: 90,
    objectives: ["Survive 90 seconds", "Don't get knocked out"],
    rewards: { xp: 60, currency: 30 },
    enemyPool: ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"],
    bossId: "behemoth",
    wavesBeforeBoss: 2,
  },
  {
    id: "undercity-rumble",
    name: "Undercity Rumble",
    title: "Undercity Rumble",
    description: "Clear the Undercity Veins. 20 KOs. No mercy.",
    arenaId: "open-world",
    goalType: "eliminate",
    goalValue: 20,
    objectives: ["Defeat 20 enemies", "Survive all waves"],
    rewards: { xp: 120, currency: 60 },
    enemyPool: ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"],
    bossId: "behemoth",
    wavesBeforeBoss: 5,
  },
  {
    id: "null-devourer",
    name: "The Null Devourer",
    title: "Boss Raid",
    description: "A flagship PvE boss. Multi-phase health bar. Weakpoints. Shadow clones. Arena hazards.",
    arenaId: "open-world",
    goalType: "eliminate",
    goalValue: 1,
    objectives: ["Defeat the Null Devourer", "Target the chest core weakpoint", "Survive Phase 2 clones"],
    rewards: { xp: 150, currency: 80 },
    enemyPool: [],
    bossId: "null-devourer",
    wavesBeforeBoss: 0,
  },
];

/** Boss phase config for multi-phase encounters (Null Devourer, Worldbreaker Titan). */
export const BOSS_PHASE_CONFIG: Record<string, { phases: string[]; weakpointId?: string }> = {
  "null-devourer": {
    phases: ["predator", "fracture", "collapse"],
    weakpointId: "chest-core",
  },
  behemoth: { phases: ["awakening", "cataclysm"], weakpointId: undefined },
  malakor: { phases: ["awakening", "rage"], weakpointId: undefined },
};

export function getAdventureMissionById(id: string): AdventureMission | undefined {
  return ADVENTURE_MISSIONS.find((m) => m.id === id);
}

export function getAdventureMissions(): AdventureMission[] {
  return ADVENTURE_MISSIONS;
}
