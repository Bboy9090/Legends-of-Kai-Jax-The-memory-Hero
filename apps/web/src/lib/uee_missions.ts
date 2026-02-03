export interface UEEMission {
  id: string;
  title: string;
  description: string;
  arenaId?: string;
}

export const UEE_MISSIONS: UEEMission[] = [
  { id: "uee-1", title: "UEE Trial 1", description: "Complete the first trial.", arenaId: "mushroom-plains" },
  { id: "uee-2", title: "UEE Trial 2", description: "Complete the second trial.", arenaId: "green-valley" },
];

export function getUEEMissionById(id: string): UEEMission | null {
  return UEE_MISSIONS.find((m) => m.id === id) ?? null;
}
