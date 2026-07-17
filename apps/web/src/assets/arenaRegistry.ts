/**
 * ⚡ LEGENDS OF KAI-JAX: ARENA REGISTRY ⚡
 * 
 * Central registry for all combat environments.
 * Defines visual styles, lighting, and performance tiers for iOS.
 */

export interface ArenaConfig {
  id: string;
  displayName: string;
  biome: 'urban' | 'mystic' | 'fire' | 'void' | 'nature' | 'storm' | 'cosmic' | 'tech';
  lighting: {
    intensity: number;
    color: string;
    ambientColor: string;
    fogColor: string;
    fogDensity: number;
  };
  ground: {
    color: string;
    gridColor: string;
    texture?: string;
  };
  iosPerformanceTier: 'high' | 'medium' | 'low';
  musicMood: string;
}

export const ARENA_REGISTRY: Record<string, ArenaConfig> = {
  cross_point_arena: {
    id: 'cross_point_arena',
    displayName: 'Cross Point Tournament',
    biome: 'tech',
    lighting: {
      intensity: 1.2,
      color: '#ffffff',
      ambientColor: '#404040',
      fogColor: '#1a1a1a',
      fogDensity: 0.01,
    },
    ground: {
      color: '#2a2a2a',
      gridColor: '#00ffff',
    },
    iosPerformanceTier: 'high',
    musicMood: 'high-energy-electronic',
  },
  'open-world': {
    id: 'open-world',
    displayName: 'Open World Training Grounds',
    biome: 'tech',
    lighting: {
      intensity: 1.2,
      color: '#ffffff',
      ambientColor: '#404040',
      fogColor: '#1a1a1a',
      fogDensity: 0.01,
    },
    ground: {
      color: '#2a2a2a',
      gridColor: '#00ffff',
    },
    iosPerformanceTier: 'high',
    musicMood: 'high-energy-electronic',
  },
  bronx_streets: {
    id: 'bronx_streets',
    displayName: 'Ruined Bronx Streets',
    biome: 'urban',
    lighting: {
      intensity: 0.8,
      color: '#ffaa66',
      ambientColor: '#202030',
      fogColor: '#2a2a35',
      fogDensity: 0.03,
    },
    ground: {
      color: '#1a1a1a',
      gridColor: '#ff4400',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'gritty-hip-hop',
  },
  memory_nexus: {
    id: 'memory_nexus',
    displayName: 'The Memory Nexus',
    biome: 'mystic',
    lighting: {
      intensity: 1.5,
      color: '#00d9ff',
      ambientColor: '#1a0033',
      fogColor: '#0d001a',
      fogDensity: 0.05,
    },
    ground: {
      color: '#0a0a2e',
      gridColor: '#fbbf24',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'ethereal-orchestral',
  },
  'lava-fortress': {
    id: 'lava-fortress',
    displayName: 'Molten Sky Fortress',
    biome: 'fire',
    lighting: {
      intensity: 1.8,
      color: '#ff4400',
      ambientColor: '#330000',
      fogColor: '#2a0000',
      fogDensity: 0.08,
    },
    ground: {
      color: '#1a0500',
      gridColor: '#ff0000',
    },
    iosPerformanceTier: 'low',
    musicMood: 'heavy-metal',
  },
  rift_citadel: {
    id: 'rift_citadel',
    displayName: 'The Rift Citadel',
    biome: 'void',
    lighting: {
      intensity: 1.0,
      color: '#a855f7',
      ambientColor: '#100020',
      fogColor: '#05000a',
      fogDensity: 0.1,
    },
    ground: {
      color: '#050005',
      gridColor: '#d8b4fe',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'dark-ambient-industrial',
  },
  jungle_temple: {
    id: 'jungle_temple',
    displayName: 'Elder Beast Temple',
    biome: 'nature',
    lighting: {
      intensity: 1.1,
      color: '#22c55e',
      ambientColor: '#052005',
      fogColor: '#0a1a0a',
      fogDensity: 0.04,
    },
    ground: {
      color: '#0a1a05',
      gridColor: '#86efac',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'tribal-drums',
  },
  skyforge_plateau: {
    id: 'skyforge_plateau',
    displayName: 'Skyforge Plateau',
    biome: 'storm',
    lighting: {
      intensity: 2.0,
      color: '#ffffff',
      ambientColor: '#203040',
      fogColor: '#cbd5e1',
      fogDensity: 0.02,
    },
    ground: {
      color: '#1e293b',
      gridColor: '#38bdf8',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'cinematic-epic',
  },
  'space-station': {
    id: 'space-station',
    displayName: 'Cosmic Glitch Station',
    biome: 'cosmic',
    lighting: {
      intensity: 1.3,
      color: '#00ffff',
      ambientColor: '#000010',
      fogColor: '#000000',
      fogDensity: 0.01,
    },
    ground: {
      color: '#020617',
      gridColor: '#2dd4bf',
    },
    iosPerformanceTier: 'high',
    musicMood: 'synthwave',
  },
  nexus_haven: {
    id: 'nexus_haven',
    displayName: 'Haven of the Last Memory',
    biome: 'tech',
    lighting: {
      intensity: 1.0,
      color: '#eab308',
      ambientColor: '#1c1917',
      fogColor: '#0c0a09',
      fogDensity: 0.03,
    },
    ground: {
      color: '#0c0a09',
      gridColor: '#facc15',
    },
    iosPerformanceTier: 'high',
    musicMood: 'calm-melancholic',
  },
  void_tower: {
    id: 'void_tower',
    displayName: 'Tower of Oblivion',
    biome: 'void',
    lighting: {
      intensity: 0.7,
      color: '#7e22ce',
      ambientColor: '#0a001a',
      fogColor: '#000000',
      fogDensity: 0.15,
    },
    ground: {
      color: '#000000',
      gridColor: '#a855f7',
    },
    iosPerformanceTier: 'low',
    musicMood: 'terrifying-void',
  },
  // Fallbacks for missing IDs
  emerald_frontier: {
    id: 'emerald_frontier',
    displayName: 'Emerald Frontier',
    biome: 'nature',
    lighting: {
      intensity: 1.2,
      color: '#4ade80',
      ambientColor: '#064e3b',
      fogColor: '#064e3b',
      fogDensity: 0.02,
    },
    ground: {
      color: '#064e3b',
      gridColor: '#bbf7d0',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'peaceful-jungle',
  },
  ashen_expanse: {
    id: 'ashen_expanse',
    displayName: 'The Ashen Expanse',
    biome: 'fire',
    lighting: {
      intensity: 0.9,
      color: '#f87171',
      ambientColor: '#450a0a',
      fogColor: '#1c1917',
      fogDensity: 0.08,
    },
    ground: {
      color: '#1c1917',
      gridColor: '#ef4444',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'somber-war',
  },
  'green-valley': {
    id: 'green-valley',
    displayName: 'Green Valley',
    biome: 'nature',
    lighting: {
      intensity: 1.2,
      color: '#4ade80',
      ambientColor: '#064e3b',
      fogColor: '#064e3b',
      fogDensity: 0.02,
    },
    ground: {
      color: '#064e3b',
      gridColor: '#bbf7d0',
    },
    iosPerformanceTier: 'medium',
    musicMood: 'peaceful-jungle',
  }
};

export function getArenaConfig(arenaId: string): ArenaConfig {
  if (ARENA_REGISTRY[arenaId]) {
    return ARENA_REGISTRY[arenaId];
  }
  console.warn(`Arena ID "${arenaId}" not found in registry. Falling back to cross_point_arena.`);
  return ARENA_REGISTRY.cross_point_arena;
}
