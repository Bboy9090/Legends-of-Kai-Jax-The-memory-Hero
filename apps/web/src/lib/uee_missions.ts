export interface UEEMissionRewards {
  xp: number;
  currency: number;
  loot: string[];
}

export interface UEEMission {
  id: string;
  missionNumber: number;
  name: string;
  title: string;
  description: string;
  difficulty: number;
  arenaId?: string;
  arena?: string;
  objectives: string[];
  rewards: UEEMissionRewards;
}

export const UEE_MISSIONS: UEEMission[] = [
  {
    id: "uee-1",
    missionNumber: 1,
    name: "UEE Trial 1",
    title: "UEE Trial 1",
    description: "Land punches and kicks, then win the match.",
    difficulty: 1,
    arenaId: "mushroom-plains",
    arena: "mushroom-plains",
    objectives: ["Land 10 punches", "Land 5 kicks", "Win the match"],
    rewards: { xp: 50, currency: 25, loot: [] },
  },
  {
    id: "uee-2",
    missionNumber: 2,
    name: "UEE Trial 2",
    title: "UEE Trial 2",
    description: "Reach a 5-hit combo and survive 30 seconds.",
    difficulty: 1,
    arenaId: "green-valley",
    arena: "green-valley",
    objectives: ["Reach a 5-hit combo", "Survive 30 seconds", "Win the match"],
    rewards: { xp: 75, currency: 35, loot: [] },
  },
  {
    id: "uee-3",
    missionNumber: 3,
    name: "Combo & Endure",
    title: "Combo & Endure",
    description: "Survive 40 seconds and reach an 8-hit combo.",
    difficulty: 2,
    arenaId: "mushroom-plains",
    arena: "mushroom-plains",
    objectives: ["Survive 40 seconds", "Reach an 8-hit combo", "Win the match"],
    rewards: { xp: 100, currency: 50, loot: [] },
  },
  {
    id: "uee-4",
    missionNumber: 4,
    name: "Survival & Special",
    title: "Survival & Special",
    description: "Survive 60 seconds and use your special once.",
    difficulty: 2,
    arenaId: "green-valley",
    arena: "green-valley",
    objectives: ["Survive 60 seconds", "Use 1 special", "Win the match"],
    rewards: { xp: 125, currency: 60, loot: [] },
  },
  {
    id: "uee-5",
    missionNumber: 5,
    name: "Combo Master",
    title: "Combo Master",
    description: "Reach a 10-hit combo and use 2 specials.",
    difficulty: 2,
    arenaId: "mushroom-plains",
    arena: "mushroom-plains",
    objectives: ["Reach a 10-hit combo", "Use 2 specials", "Win the match"],
    rewards: { xp: 150, currency: 75, loot: [] },
  },
  {
    id: "uee-6",
    missionNumber: 6,
    name: "Clean Victory",
    title: "Clean Victory",
    description: "Win with a 6-hit combo and one special.",
    difficulty: 2,
    arenaId: "green-valley",
    arena: "green-valley",
    objectives: ["Win the match", "Reach a 6-hit combo", "Use 1 special"],
    rewards: { xp: 175, currency: 85, loot: [] },
  },
  {
    id: "uee-7",
    missionNumber: 7,
    name: "Endurance Trial",
    title: "Endurance Trial",
    description: "Survive 45 seconds and reach a 7-hit combo.",
    difficulty: 3,
    arenaId: "mushroom-plains",
    arena: "mushroom-plains",
    objectives: ["Survive 45 seconds", "Reach a 7-hit combo", "Win the match"],
    rewards: { xp: 200, currency: 100, loot: [] },
  },
  {
    id: "uee-8",
    missionNumber: 8,
    name: "High Combo",
    title: "High Combo",
    description: "Reach a 15-hit combo and use 2 specials.",
    difficulty: 3,
    arenaId: "green-valley",
    arena: "green-valley",
    objectives: ["Reach a 15-hit combo", "Use 2 specials", "Win the match"],
    rewards: { xp: 250, currency: 120, loot: [] },
  },
  {
    id: "uee-9",
    missionNumber: 9,
    name: "Ultimate Trial",
    title: "Ultimate Trial",
    description: "Survive 75 seconds and use your ultimate.",
    difficulty: 3,
    arenaId: "mushroom-plains",
    arena: "mushroom-plains",
    objectives: ["Survive 75 seconds", "Use 1 ultimate", "Win the match"],
    rewards: { xp: 300, currency: 150, loot: [] },
  },
  {
    id: "uee-10",
    missionNumber: 10,
    name: "Champion's Test",
    title: "Champion's Test",
    description: "Reach a 12-hit combo and use your ultimate to win.",
    difficulty: 3,
    arenaId: "green-valley",
    arena: "green-valley",
    objectives: ["Reach a 12-hit combo", "Use 1 ultimate", "Win the match"],
    rewards: { xp: 400, currency: 200, loot: [] },
  },
];

export function getUEEMissionById(id: string): UEEMission | null {
  return UEE_MISSIONS.find((m) => m.id === id) ?? null;
}
