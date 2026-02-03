export interface StoryMission {
  id: string;
  title: string;
  description: string;
  act: number;
  requiredCharacters?: string[];
  arenaId?: string;
}

const STORY_MISSIONS: StoryMission[] = [
  { id: "act1-1", title: "First Blood", description: "Win your first fight.", act: 1, arenaId: "mushroom-plains" },
  { id: "act1-2", title: "Rival", description: "Defeat your rival.", act: 1, arenaId: "green-valley" },
];

export function getStoryMissionById(id: string): StoryMission | null {
  return STORY_MISSIONS.find((m) => m.id === id) ?? null;
}

export function getStoryMissionsByAct(act: number): StoryMission[] {
  return STORY_MISSIONS.filter((m) => m.act === act);
}
