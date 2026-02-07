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
    unlocked: true
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
    unlocked: true
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
    unlocked: true
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
    unlocked: true
  },

  // ===== Mission arenas (UEE + Story Act I) =====
  {
    id: 'bronx_streets',
    name: 'Bronx Streets',
    displayName: 'Bronx Streets',
    description: 'Neon grit, wet asphalt, and undefeated swagger.',
    groundColor: '#2a2a2f',
    skyColor: '#0b0b18',
    platformColor: '#3a3a44',
    accentColor: '#FFD700',
    unlocked: true,
  },
  {
    id: 'memory_nexus',
    name: 'Memory Nexus',
    displayName: 'Memory Nexus',
    description: 'Where echoes and futures collide in electric blue.',
    groundColor: '#0b1020',
    skyColor: '#070814',
    platformColor: '#1a2442',
    accentColor: '#00f2ff',
    unlocked: true,
  },
  {
    id: 'beast_colosseum',
    name: 'Beast Colosseum',
    displayName: 'Beast Colosseum',
    description: 'Stone, roar, and spotlight—pure arena pressure.',
    groundColor: '#4a3f35',
    skyColor: '#141018',
    platformColor: '#6b5b4a',
    accentColor: '#FF6B6B',
    unlocked: true,
  },
  {
    id: 'rift_arena',
    name: 'Rift Arena',
    displayName: 'Rift Arena',
    description: 'Reality tears at the edges. Don’t blink.',
    groundColor: '#24132b',
    skyColor: '#08030a',
    platformColor: '#3a1d44',
    accentColor: '#A855F7',
    unlocked: true,
  },
  {
    id: 'rooftop_battlefield',
    name: 'Rooftop Battlefield',
    displayName: 'Rooftop Battlefield',
    description: 'Wind, skyline, and a fight you can hear for miles.',
    groundColor: '#2c2f36',
    skyColor: '#0a0a1a',
    platformColor: '#4b5563',
    accentColor: '#FFA500',
    unlocked: true,
  },
  {
    id: 'cross_point_arena',
    name: 'Cross Point Arena',
    displayName: 'Cross Point Arena',
    description: 'A tournament stage stitched across dimensions.',
    groundColor: '#0f2a2a',
    skyColor: '#07121a',
    platformColor: '#17424a',
    accentColor: '#00FFFF',
    unlocked: true,
  },
  {
    id: 'emerald_frontier',
    name: 'Emerald Frontier',
    displayName: 'Emerald Frontier',
    description: 'Momentum lanes and impossible geometry at full speed.',
    groundColor: '#0f2a16',
    skyColor: '#06110b',
    platformColor: '#1c4a2a',
    accentColor: '#FFD700',
    unlocked: true,
  }
];

export function getArenaById(id: string): Arena | undefined {
  return ARENAS.find(a => a.id === id);
}

export function getUnlockedArenas(): Arena[] {
  return ARENAS; // all unlocked
}

export function canUnlockArena(_arena: Arena, _score: number): boolean {
  return true;
}
