/**
 * CHARACTER STATS & DATA SYSTEM
 * Defines character statistics, progression, and combat parameters
 */

export interface CharacterStats {
  characterId: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  lifesteal: number;
  elementalResistance: Record<string, number>;
}

export interface CharacterData {
  id: string;
  name: string;
  displayName: string;
  title?: string;
  description: string;
  faction: string;
  role: 'Speedster' | 'Tank' | 'DPS' | 'Mage' | 'Hybrid' | 'Support' | 'Assassin';
  tier: 'S' | 'A' | 'B' | 'C' | 'Common' | 'Rare' | 'Epic' | 'Legendary';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  stats: CharacterStats;
  bio: string;
  lore: string;
  portraitPath: string;
  visualIdentity: {
    primaryColor: string;
    accentColor: string;
    visualThemes: string[];
    silhouette: string;
  };
  relationships: Array<{
    characterId: string;
    type: 'ally' | 'rival' | 'enemy' | 'mentor' | 'student';
    description: string;
  }>;
}

// ============ KAI-JAX CHARACTER DATA ============

export const KAI_JAX_DATA: CharacterData = {
  id: 'kai-jax',
  name: 'Kai-Jax',
  displayName: 'KAI-JAX',
  title: 'The Memory Hero',
  description: 'A legendary fusion of two heroes. Kai-Jax wields the power of combined memories and storm fury.',
  faction: 'UNIFIED RESISTANCE',
  role: 'Hybrid',
  tier: 'S',
  rarity: 'Legendary',
  stats: {
    characterId: 'kai-jax',
    name: 'Kai-Jax',
    health: 320,
    maxHealth: 320,
    mana: 280,
    maxMana: 280,
    attack: 95,
    defense: 85,
    speed: 90,
    critChance: 25,
    critDamage: 150,
    lifesteal: 15,
    elementalResistance: {
      'Memory': 40,
      'Lightning': 35,
      'Fire': 25,
      'Void': 10,
      'Physical': 20,
    },
  },
  bio: 'Born from the fusion of Kaison and Jaxon, Kai-Jax represents the ultimate convergence of strategic intellect and raw speed. As the Memory Hero, he can perceive and manipulate the threads of reality itself.',
  lore: 'When two heroes become one, the world trembles. Kai-Jax emerged during the darkest hour of the Rift invasion, his existence a beacon of hope that unity could triumph over division.',
  portraitPath: '/images/characters/kai-jax.png',
  visualIdentity: {
    primaryColor: '#00f2ff',
    accentColor: '#efc76d',
    visualThemes: ['Cyan Glow', 'Fusion Shards', 'Prismatic Trails', 'Storm Energy'],
    silhouette: 'fusion-form',
  },
  relationships: [
    {
      characterId: 'kaison',
      type: 'ally',
      description: 'Part of Kai-Jax\'s dual nature; the strategic mind',
    },
    {
      characterId: 'jaxon',
      type: 'ally',
      description: 'Part of Kai-Jax\'s dual nature; the speed incarnate',
    },
    {
      characterId: 'silver',
      type: 'mentor',
      description: 'The Time Sage who helped control the fusion',
    },
  ],
};

// ============ JAX CHARACTER DATA ============

export const JAX_DATA: CharacterData = {
  id: 'jax',
  name: 'Jax',
  displayName: 'JAX',
  title: 'The Storm Fang',
  description: 'A lightning-fast warrior with electrical power flowing through his veins.',
  faction: 'STORM RONIN ORDER',
  role: 'Speedster',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'jax',
    name: 'Jax',
    health: 250,
    maxHealth: 250,
    mana: 220,
    maxMana: 220,
    attack: 88,
    defense: 65,
    speed: 115,
    critChance: 30,
    critDamage: 140,
    lifesteal: 10,
    elementalResistance: {
      'Lightning': 50,
      'Physical': 15,
      'Memory': 20,
      'Fire': 10,
      'Void': 5,
    },
  },
  bio: 'Jax is the incarnation of speed and electricity. His body channels the power of lightning, allowing him to strike with devastating velocity before opponents can react.',
  lore: 'Born in the Voltage District during a lightning storm, Jax grew up with electricity as his constant companion. He became a Storm Ronin to protect others from the Void threat.',
  portraitPath: '/images/characters/jax.png',
  visualIdentity: {
    primaryColor: '#5aaeff',
    accentColor: '#ff8c00',
    visualThemes: ['Electric Purple', 'Sonic Quills', 'Blur Effects', 'Thunder Trail'],
    silhouette: 'feline-hybrid',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'ally',
      description: 'Can merge with Kaison to become Kai-Jax',
    },
    {
      characterId: 'kaison',
      type: 'ally',
      description: 'Twin heroes with complementary powers',
    },
    {
      characterId: 'volter',
      type: 'rival',
      description: 'Another lightning user with different philosophies',
    },
  ],
};

// ============ KAISON CHARACTER DATA ============

export const KAISON_DATA: CharacterData = {
  id: 'kaison',
  name: 'Kaison',
  displayName: 'KAISON',
  title: 'The Swift Guardian',
  description: 'A tactical fighter with spider-like agility and web-weaving abilities.',
  faction: 'STORM RONIN ORDER',
  role: 'Assassin',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'kaison',
    name: 'Kaison',
    health: 260,
    maxHealth: 260,
    mana: 200,
    maxMana: 200,
    attack: 85,
    defense: 75,
    speed: 105,
    critChance: 35,
    critDamage: 160,
    lifesteal: 8,
    elementalResistance: {
      'Wind': 40,
      'Physical': 25,
      'Web': 35,
      'Memory': 15,
      'Void': 5,
    },
  },
  bio: 'Kaison is the strategic counterpart to Jax\'s raw speed. With fox-like reflexes and mastery over webs, he executes precise strikes from the shadows.',
  lore: 'Growing up in the refugee sectors, Kaison learned to survive through cunning and precision. His web-weaving abilities are both a tool and a reflection of his strategic mind.',
  portraitPath: '/images/characters/kaison.png',
  visualIdentity: {
    primaryColor: '#22d3ee',
    accentColor: '#ff6347',
    visualThemes: ['Sage Green', 'Wind Flow', 'Precise Lines', 'Web Silk'],
    silhouette: 'fox-hybrid',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'ally',
      description: 'Can merge with Jax to become Kai-Jax',
    },
    {
      characterId: 'jax',
      type: 'ally',
      description: 'Twin heroes with complementary powers',
    },
    {
      characterId: 'silver',
      type: 'mentor',
      description: 'Trained in tactical combat by Silver',
    },
  ],
};

// ============ SUPPORTING CHARACTERS ============

export const SILVER_DATA: CharacterData = {
  id: 'silver',
  name: 'Silver',
  displayName: 'SILVER',
  title: 'The Time Sage',
  description: 'An ancient sage who manipulates time and protects reality\'s fabric.',
  faction: 'CHRONOS ORDER',
  role: 'Mage',
  tier: 'S',
  rarity: 'Legendary',
  stats: {
    characterId: 'silver',
    name: 'Silver',
    health: 200,
    maxHealth: 200,
    mana: 400,
    maxMana: 400,
    attack: 60,
    defense: 55,
    speed: 70,
    critChance: 15,
    critDamage: 120,
    lifesteal: 5,
    elementalResistance: {
      'Time': 60,
      'Memory': 40,
      'Void': 30,
      'Physical': 10,
      'Magic': 35,
    },
  },
  bio: 'Silver is a traveler from a timeline consumed by the Void. His mastery of time allows him to see possible futures and prevent catastrophic outcomes.',
  lore: 'From a doomed future where the Void consumed everything, Silver was sent back to change fate. He is the oldest soul in this timeline, with memories spanning centuries.',
  portraitPath: '/images/characters/silver.png',
  visualIdentity: {
    primaryColor: '#c0c0c0',
    accentColor: '#ffd700',
    visualThemes: ['Platinum', 'Clockwork Gears', 'Silver Mist', 'Temporal Echoes'],
    silhouette: 'sage-figure',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'ally',
      description: 'Guides the Memory Hero',
    },
    {
      characterId: 'kaison',
      type: 'mentor',
      description: 'Trains Kaison in temporal magic',
    },
  ],
};

export const VOLTER_DATA: CharacterData = {
  id: 'volter',
  name: 'Volter',
  displayName: 'VOLTER',
  title: 'The Lightning Beast',
  description: 'A wild creature infused with pure electrical energy from a ruptured memory shard.',
  faction: 'FERAL COLLECTIVE',
  role: 'DPS',
  tier: 'A',
  rarity: 'Rare',
  stats: {
    characterId: 'volter',
    name: 'Volter',
    health: 290,
    maxHealth: 290,
    mana: 180,
    maxMana: 180,
    attack: 92,
    defense: 70,
    speed: 85,
    critChance: 22,
    critDamage: 130,
    lifesteal: 12,
    elementalResistance: {
      'Lightning': 60,
      'Physical': 30,
      'Fire': 20,
      'Void': 10,
      'Memory': 15,
    },
  },
  bio: 'Volter is pure chaos and energy incarnate. Born from a ruptured memory shard, this lightning beast follows instinct over strategy.',
  lore: 'When a memory crystal shattered in the Thunder Valley, it fused with a wild beast. Volter emerged as a force of nature, neither fully beast nor fully intelligent.',
  portraitPath: '/images/characters/volter.png',
  visualIdentity: {
    primaryColor: '#ffff00',
    accentColor: '#ff6347',
    visualThemes: ['Golden Yellow', 'Lightning Bolts', 'Static Spark', 'Primal Fury'],
    silhouette: 'beast-form',
  },
  relationships: [
    {
      characterId: 'jax',
      type: 'rival',
      description: 'Another lightning user with different methods',
    },
  ],
};

// ============ CHARACTER DATA REGISTRY ============

export const CHARACTER_DATA_MAP: Record<string, CharacterData> = {
  'kai-jax': KAI_JAX_DATA,
  'jax': JAX_DATA,
  'kaison': KAISON_DATA,
  'silver': SILVER_DATA,
  'volter': VOLTER_DATA,
};

export function getCharacterData(characterId: string): CharacterData | undefined {
  return CHARACTER_DATA_MAP[characterId];
}

export function getCharacterStats(characterId: string): CharacterStats | undefined {
  const data = CHARACTER_DATA_MAP[characterId];
  return data?.stats;
}

export function getAllCharacterData(): CharacterData[] {
  return Object.values(CHARACTER_DATA_MAP);
}
