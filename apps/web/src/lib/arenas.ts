// Battle arenas for the fighting game

export interface Arena {
  id: string;
  name: string;
  displayName: string;
  description: string;
  groundColor: string;
  skyColor: string;
  platformColor: string;
  accentColor: string;
  unlocked: boolean;
  unlockRequirement?: number;
}

export const ARENAS: Arena[] = [
  {
    id: 'mushroom-plains',
    name: 'Mushroom Plains',
    displayName: 'Mushroom Plains',
    description: 'A grassy field full of colorful mushrooms!',
    groundColor: '#90EE90', // Light green
    skyColor: '#87CEEB', // Sky blue
    platformColor: '#8B4513', // Brown
    accentColor: '#FF6347', // Red mushrooms
    unlocked: true
  },
  {
    id: 'green-valley',
    name: 'Green Valley Zone',
    displayName: 'Green Valley Zone',
    description: 'Speed through this loop-de-loop zone!',
    groundColor: '#228B22', // Forest green
    skyColor: '#4A90E2', // Bright blue
    platformColor: '#8B7355', // Tan
    accentColor: '#FFD700', // Gold rings
    unlocked: true
  },
  {
    id: 'rainbow-castle',
    name: 'Rainbow Castle',
    displayName: 'Rainbow Castle',
    description: 'A magical castle in the clouds!',
    groundColor: '#DDA0DD', // Plum
    skyColor: '#B0E0E6', // Powder blue
    platformColor: '#FFB6C1', // Light pink
    accentColor: '#FFD700', // Gold
    unlocked: false,
    unlockRequirement: 1000
  },
  {
    id: 'lava-fortress',
    name: 'Lava Fortress',
    displayName: 'Lava Fortress',
    description: 'Watch out for the hot lava below!',
    groundColor: '#8B4513', // Saddle brown
    skyColor: '#FF4500', // Orange-red
    platformColor: '#696969', // Dim gray
    accentColor: '#FF6347', // Tomato red
    unlocked: false,
    unlockRequirement: 2000
  },
  {
    id: 'space-station',
    name: 'Space Station',
    displayName: 'Space Station',
    description: 'Battle among the stars!',
    groundColor: '#2F4F4F', // Dark slate gray
    skyColor: '#191970', // Midnight blue
    platformColor: '#778899', // Light slate gray
    accentColor: '#00FFFF', // Cyan
    unlocked: false,
    unlockRequirement: 3000
  },
  {
    id: 'jungle-ruins',
    name: 'Jungle Ruins',
    displayName: 'Jungle Ruins',
    description: 'Ancient temple deep in the jungle!',
    groundColor: '#556B2F', // Dark olive green
    skyColor: '#20B2AA', // Light sea green
    platformColor: '#8B7355', // Burlywood
    accentColor: '#FFD700', // Gold
    unlocked: false,
    unlockRequirement: 4000
  }
];

export function getArenaById(id: string): Arena | undefined {
  return ARENAS.find(a => a.id === id);
}

export function getUnlockedArenas(): Arena[] {
  return ARENAS.filter(a => a.unlocked);
}

export function canUnlockArena(arena: Arena, score: number): boolean {
  if (arena.unlocked) return false;
  if (!arena.unlockRequirement) return true;
  return score >= arena.unlockRequirement;
}
