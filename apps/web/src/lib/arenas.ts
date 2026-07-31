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
  // STORY CAMPAIGN ARENAS
  {
    id: 'cross_point_arena',
    name: 'Cross Point Arena',
    displayName: 'Cross Point Arena',
    description: 'Urban training facility where champions are forged. High-tech and industrial.',
    groundColor: '#2A2A2A', // Dark gray
    skyColor: '#1A1A2E', // Dark blue-black
    platformColor: '#0F3460', // Steel blue
    accentColor: '#00D4FF', // Cyan neon
    unlocked: true
  },
  {
    id: 'memory_vault',
    name: 'Memory Vault',
    displayName: 'Memory Vault',
    description: 'Ancient underground chamber where lost memories are preserved. Mystical and ethereal.',
    groundColor: '#3D2817', // Deep brown
    skyColor: '#2D1B69', // Deep purple
    platformColor: '#664E27', // Rich brown
    accentColor: '#9D4EDD', // Mystical purple
    unlocked: true
  },
  {
    id: 'rift_frontier',
    name: 'Rift Frontier',
    displayName: 'Rift Frontier',
    description: 'Chaotic dimensional boundary where reality tears. Volatile and dangerous.',
    groundColor: '#1A0033', // Deep purple-black
    skyColor: '#330066', // Cosmic purple
    platformColor: '#4D0099', // Void purple
    accentColor: '#FF00FF', // Magenta rift energy
    unlocked: true
  },
  {
    id: 'void_heart_citadel',
    name: 'Void Heart Citadel',
    displayName: 'Void Heart Citadel',
    description: 'The epicenter of the Void. Dark, corrupted, and apocalyptic. The final battle awaits.',
    groundColor: '#0D0D0D', // Nearly black
    skyColor: '#1A0000', // Deep crimson
    platformColor: '#330000', // Blood red
    accentColor: '#FF3300', // Hellish orange-red
    unlocked: true
  },

  // CLASSIC ARENAS (kept for variety)
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
  }
];

export function getArenaById(id: string): Arena | undefined {
  return ARENAS.find(a => a.id === id);
}

export function getUnlockedArenas(): Arena[] {
  return ARENAS; // all unlocked
}

export function canUnlockArena(arena: Arena, score: number): boolean {
  return true;
}
