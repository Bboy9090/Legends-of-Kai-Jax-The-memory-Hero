export interface StoryMissionRewards {
  xp: number;
  currency: number;
  loot: string[];
}

export interface StoryMission {
  id: string;
  missionNumber: number;
  name: string;
  title: string;
  description: string;
  act: number;
  difficulty: number;
  gameplayType: string;
  storyBeat: string;
  arena: string;
  arenaId?: string;
  requiredCharacters?: string[];
  objectives: string[];
  rewards: StoryMissionRewards;
}

const STORY_MISSIONS: StoryMission[] = [
  {
    id: "act1-1",
    missionNumber: 1,
    name: "First Blood",
    title: "First Blood",
    description: "Win your first fight.",
    act: 1,
    difficulty: 1,
    gameplayType: "fight",
    storyBeat: "Training grounds – prove yourself.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Win the match", "Land 8 hits"],
    rewards: { xp: 40, currency: 20, loot: [] },
  },
  {
    id: "act1-2",
    missionNumber: 2,
    name: "Rival",
    title: "Rival",
    description: "Defeat your rival.",
    act: 1,
    difficulty: 1,
    gameplayType: "fight",
    storyBeat: "Rival appears at the valley.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Win the match", "Use 1 special"],
    rewards: { xp: 60, currency: 30, loot: [] },
  },
  {
    id: "act1-3",
    missionNumber: 3,
    name: "Hold the Line",
    title: "Hold the Line",
    description: "Survive and build combos.",
    act: 1,
    difficulty: 2,
    gameplayType: "fight",
    storyBeat: "Enemy forces push forward.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Survive 45 seconds", "Reach a 6-hit combo", "Win the match"],
    rewards: { xp: 80, currency: 40, loot: [] },
  },
  {
    id: "act1-4",
    missionNumber: 4,
    name: "Combo Initiate",
    title: "Combo Initiate",
    description: "Land a 5-hit combo and use your special.",
    act: 1,
    difficulty: 2,
    gameplayType: "fight",
    storyBeat: "Master the basics.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Reach a 5-hit combo", "Use 1 special", "Win the match"],
    rewards: { xp: 100, currency: 50, loot: [] },
  },
  {
    id: "act1-5",
    missionNumber: 5,
    name: "Endurance",
    title: "Endurance",
    description: "Survive 60 seconds and land 12 hits.",
    act: 1,
    difficulty: 2,
    gameplayType: "fight",
    storyBeat: "The battle drags on.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Survive 60 seconds", "Land 12 hits", "Win the match"],
    rewards: { xp: 120, currency: 60, loot: [] },
  },
  {
    id: "act1-6",
    missionNumber: 6,
    name: "Rising Combo",
    title: "Rising Combo",
    description: "Survive 45 seconds and reach a 7-hit combo.",
    act: 1,
    difficulty: 2,
    gameplayType: "fight",
    storyBeat: "Chain your attacks.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Survive 45 seconds", "Reach a 7-hit combo", "Win the match"],
    rewards: { xp: 140, currency: 70, loot: [] },
  },
  {
    id: "act1-7",
    missionNumber: 7,
    name: "Specialist",
    title: "Specialist",
    description: "Use your special twice and win.",
    act: 1,
    difficulty: 2,
    gameplayType: "fight",
    storyBeat: "Unleash your power.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Use 2 specials", "Win the match"],
    rewards: { xp: 160, currency: 80, loot: [] },
  },
  {
    id: "act1-8",
    missionNumber: 8,
    name: "Long Fight",
    title: "Long Fight",
    description: "Survive 75 seconds and reach a 10-hit combo.",
    act: 1,
    difficulty: 3,
    gameplayType: "fight",
    storyBeat: "Stamina and skill.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Survive 75 seconds", "Reach a 10-hit combo", "Win the match"],
    rewards: { xp: 180, currency: 90, loot: [] },
  },
  {
    id: "act1-9",
    missionNumber: 9,
    name: "Steady Hand",
    title: "Steady Hand",
    description: "Survive 60 seconds and use your special.",
    act: 1,
    difficulty: 3,
    gameplayType: "fight",
    storyBeat: "Control the pace.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Survive 60 seconds", "Use 1 special", "Win the match"],
    rewards: { xp: 200, currency: 100, loot: [] },
  },
  {
    id: "act1-10",
    missionNumber: 10,
    name: "Act I Climax",
    title: "Act I Climax",
    description: "Use your ultimate and win.",
    act: 1,
    difficulty: 3,
    gameplayType: "fight",
    storyBeat: "All-out finale.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Use 1 ultimate", "Win the match"],
    rewards: { xp: 250, currency: 125, loot: [] },
  },
];

export function getStoryMissionById(id: string): StoryMission | null {
  return STORY_MISSIONS.find((m) => m.id === id) ?? null;
}

export function getStoryMissionsByAct(act: number): StoryMission[] {
  return STORY_MISSIONS.filter((m) => m.act === act);
}
