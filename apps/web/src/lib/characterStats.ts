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
      'Erasure': 10,
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
      'Erasure': 5,
    },
  },
  bio: 'Jax is the incarnation of speed and electricity. His body channels the power of lightning, allowing him to strike with devastating velocity before opponents can react.',
  lore: 'Born in the Voltage District during a lightning storm, Jax grew up with electricity as his constant companion. He became a Storm Ronin to protect others from the Erasure threat.',
  portraitPath: '/images/characters/jax.png',
  visualIdentity: {
    primaryColor: '#5aaeff',
    accentColor: '#ff8c00',
    visualThemes: ['Electric Purple', 'Storm Quills', 'Blur Effects', 'Thunder Trail'],
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
      'Erasure': 5,
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
      'Erasure': 30,
      'Physical': 10,
      'Magic': 35,
    },
  },
  bio: 'Silver is a traveler from a timeline consumed by the Erasure. His mastery of time allows him to see possible futures and prevent catastrophic outcomes.',
  lore: 'From a doomed future where the Erasure consumed everything, Silver was sent back to change fate. He is the oldest soul in this timeline, with memories spanning centuries.',
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
      'Erasure': 10,
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

// ============ ELDER FACTION & MENTORS ============

export const BORYN_DATA: CharacterData = {
  id: 'boryn',
  name: 'Boryn',
  displayName: 'BORYN',
  title: 'The Shield',
  description: 'Father and protector of the legends. A warrior forged in ancient trials.',
  faction: 'BLOODLINE PROTECTORS',
  role: 'Tank',
  tier: 'S',
  rarity: 'Legendary',
  stats: {
    characterId: 'boryn',
    name: 'Boryn',
    health: 380,
    maxHealth: 380,
    mana: 150,
    maxMana: 150,
    attack: 82,
    defense: 120,
    speed: 55,
    critChance: 12,
    critDamage: 100,
    lifesteal: 20,
    elementalResistance: {
      'Physical': 50,
      'Fire': 35,
      'Memory': 25,
      'Lightning': 10,
      'Erasure': 15,
    },
  },
  bio: 'The unbreakable father figure who has protected his bloodline through countless trials. His shield has never fallen.',
  lore: 'Boryn stands as the immovable wall between his family and the chaos of the Raging City. His philosophy: "I am the wall. So others may live."',
  portraitPath: '/images/characters/boryn.png',
  visualIdentity: {
    primaryColor: '#ff8c42',
    accentColor: '#ffd700',
    visualThemes: ['Burnt Orange', 'Stone Armor', 'Guardian Aura', 'Ancestral Marks'],
    silhouette: 'broad-warrior',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'ally',
      description: 'Protects the Memory Hero at any cost',
    },
    {
      characterId: 'borax',
      type: 'ally',
      description: 'Fellow elder and companion in protection',
    },
  ],
};

export const BORAX_DATA: CharacterData = {
  id: 'borax',
  name: 'Borax',
  displayName: 'BORAX',
  title: 'The Law',
  description: 'Mentor and guide who enforces balance with clarity and discipline.',
  faction: 'STORM RONIN ORDER',
  role: 'Support',
  tier: 'S',
  rarity: 'Legendary',
  stats: {
    characterId: 'borax',
    name: 'Borax',
    health: 240,
    maxHealth: 240,
    mana: 380,
    maxMana: 380,
    attack: 65,
    defense: 70,
    speed: 80,
    critChance: 20,
    critDamage: 110,
    lifesteal: 8,
    elementalResistance: {
      'Lightning': 60,
      'Physical': 30,
      'Wind': 40,
      'Memory': 35,
      'Erasure': 20,
    },
  },
  bio: 'A mentor who teaches through discipline and clarity. His guidance has shaped warriors across generations.',
  lore: 'Borax enforces the balance between strength and wisdom. "Without order, power is chaos. Without discipline, chaos consumes the strong."',
  portraitPath: '/images/characters/borax.png',
  visualIdentity: {
    primaryColor: '#4a90e2',
    accentColor: '#7cb9ff',
    visualThemes: ['Storm Blue', 'Order Symbols', 'Lightning Aura', 'Discipline'],
    silhouette: 'sage-mentor',
  },
  relationships: [
    {
      characterId: 'jax',
      type: 'mentor',
      description: 'Trained in the Storm Ronin ways',
    },
    {
      characterId: 'kaison',
      type: 'mentor',
      description: 'Shaped through discipline and strategy',
    },
  ],
};

export const VHARCK_DATA: CharacterData = {
  id: 'vharck',
  name: 'Vharck',
  displayName: 'VHARCK',
  title: 'The Elder Fang',
  description: 'Ancient teacher and prophet who has witnessed ages. Endurance beyond limits.',
  faction: 'CHRONOS ORDER',
  role: 'Mage',
  tier: 'S',
  rarity: 'Legendary',
  stats: {
    characterId: 'vharck',
    name: 'Vharck',
    health: 200,
    maxHealth: 200,
    mana: 450,
    maxMana: 450,
    attack: 55,
    defense: 50,
    speed: 65,
    critChance: 18,
    critDamage: 105,
    lifesteal: 12,
    elementalResistance: {
      'Memory': 70,
      'Time': 60,
      'Erasure': 40,
      'Physical': 15,
      'Magic': 50,
    },
  },
  bio: 'An elder who has transcended normal lifespans through magical endurance. His prophecies reshape fate.',
  lore: 'Vharck has walked the paths of many ages. He teaches: "Survive everything. Transcend limits. Endure until you understand."',
  portraitPath: '/images/characters/vharck.png',
  visualIdentity: {
    primaryColor: '#9d4edd',
    accentColor: '#e0aaff',
    visualThemes: ['Erasure Purple', 'Ancient Runes', 'Ethereal Glow', 'Time Ripples'],
    silhouette: 'elder-prophet',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'mentor',
      description: 'Guides through prophecy and ancient wisdom',
    },
  ],
};

// ============ FRACTURE CIRCLE ALLIES ============

export const AURELION_DATA: CharacterData = {
  id: 'aurelion',
  name: 'Aurelion',
  displayName: 'AURELION',
  title: 'The Time-Bound',
  description: 'Survivor from an erased future. Wields temporal slip energy.',
  faction: 'FRACTURE CIRCLE',
  role: 'Mage',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'aurelion',
    name: 'Aurelion',
    health: 180,
    maxHealth: 180,
    mana: 340,
    maxMana: 340,
    attack: 60,
    defense: 45,
    speed: 95,
    critChance: 25,
    critDamage: 130,
    lifesteal: 6,
    elementalResistance: {
      'Time': 70,
      'Memory': 35,
      'Erasure': 25,
      'Lightning': 20,
      'Physical': 10,
    },
  },
  bio: 'Worn but resilient. Carries memories of a timeline that no longer exists. Temporal magic flows through him.',
  lore: 'From a future where the Erasure consumed everything, Aurelion escaped through fractured time. He remembers what should have been lost.',
  portraitPath: '/images/characters/aurelion.png',
  visualIdentity: {
    primaryColor: '#00d9ff',
    accentColor: '#ffd60a',
    visualThemes: ['Temporal Blue', 'Fractured Time', 'Slip Energy', 'Echoes'],
    silhouette: 'time-touched',
  },
  relationships: [
    {
      characterId: 'silver',
      type: 'ally',
      description: 'Fellow time survivor from alternate timeline',
    },
  ],
};

export const SELENE_DATA: CharacterData = {
  id: 'selene',
  name: 'Selene of the Veil',
  displayName: 'SELENE OF THE VEIL',
  title: 'The Oracle',
  description: 'Mystical seer tied to Myrr\'kai bloodline. Reads the threads others cannot see.',
  faction: 'FRACTURE CIRCLE',
  role: 'Mage',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'selene',
    name: 'Selene',
    health: 160,
    maxHealth: 160,
    mana: 400,
    maxMana: 400,
    attack: 50,
    defense: 40,
    speed: 70,
    critChance: 30,
    critDamage: 120,
    lifesteal: 5,
    elementalResistance: {
      'Memory': 80,
      'Erasure': 35,
      'Magic': 45,
      'Physical': 5,
      'Lightning': 15,
    },
  },
  bio: 'Veiled in mystery, Selene perceives threads of fate and identity invisible to others. Her visions guide those who seek clarity.',
  lore: 'Born of ancient Myrr\'kai bloodlines, Selene exists between worlds. She reads what is hidden and speaks what others dare not hear.',
  portraitPath: '/images/characters/selene.png',
  visualIdentity: {
    primaryColor: '#7c3aed',
    accentColor: '#d8b4fe',
    visualThemes: ['Mystical Purple', 'Veil Threads', 'Oracle Light', 'Hidden Sight'],
    silhouette: 'veil-figure',
  },
  relationships: [
    {
      characterId: 'kai-jax',
      type: 'ally',
      description: 'Reads the threads of his dual nature',
    },
  ],
};

export const MIRI_DATA: CharacterData = {
  id: 'miri',
  name: 'Miri',
  displayName: 'MIRI',
  title: 'The Sealed Name',
  description: 'Survivor centered on identity and consent. Guarded but unbreakable.',
  faction: 'FRACTURE CIRCLE',
  role: 'Support',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'miri',
    name: 'Miri',
    health: 220,
    maxHealth: 220,
    mana: 250,
    maxMana: 250,
    attack: 70,
    defense: 85,
    speed: 60,
    critChance: 16,
    critDamage: 115,
    lifesteal: 10,
    elementalResistance: {
      'Memory': 60,
      'Physical': 40,
      'Erasure': 20,
      'Magic': 35,
      'Lightning': 25,
    },
  },
  bio: 'A survivor centered on the protection of identity and consent. Her guardianship is absolute and unbreakable.',
  lore: 'Miri guards her name and her identity with fierce determination. She teaches: "Your name is yours alone. Your consent cannot be taken."',
  portraitPath: '/images/characters/miri.png',
  visualIdentity: {
    primaryColor: '#06b6d4',
    accentColor: '#a7f3d0',
    visualThemes: ['Guardian Cyan', 'Protection Seal', 'Consent Ward', 'Identity Guard'],
    silhouette: 'protector-guardian',
  },
  relationships: [],
};

export const OLD_MOSS_DATA: CharacterData = {
  id: 'old-moss',
  name: 'Old Moss',
  displayName: 'OLD MOSS',
  title: 'The Wildland Elder',
  description: 'Ancient being tied to living memory ecology. Nature bound and eternal.',
  faction: 'FRACTURE CIRCLE',
  role: 'Tank',
  tier: 'A',
  rarity: 'Epic',
  stats: {
    characterId: 'old-moss',
    name: 'Old Moss',
    health: 340,
    maxHealth: 340,
    mana: 180,
    maxMana: 180,
    attack: 65,
    defense: 110,
    speed: 40,
    critChance: 10,
    critDamage: 95,
    lifesteal: 25,
    elementalResistance: {
      'Nature': 70,
      'Memory': 50,
      'Physical': 35,
      'Erasure': 30,
      'Lightning': 15,
    },
  },
  bio: 'Ancient beast-kin tied to living memory ecology. His roots run deep through generations of the Raging City.',
  lore: 'Old Moss remembers when the city was young. His body is the earth\'s memory, his spirit bound to all life around him.',
  portraitPath: '/images/characters/old-moss.png',
  visualIdentity: {
    primaryColor: '#10b981',
    accentColor: '#a7f3d0',
    visualThemes: ['Forest Green', 'Living Moss', 'Root Network', 'Ancient Earth'],
    silhouette: 'beast-elder',
  },
  relationships: [],
};

export const RIKKA_DATA: CharacterData = {
  id: 'rikka',
  name: 'Rikka the Ember-Tiny',
  displayName: 'RIKKA THE EMBER-TINY',
  title: 'The Little Spark',
  description: 'Small but unstoppable. A fire-line hero with heart full of courage.',
  faction: 'FRACTURE CIRCLE',
  role: 'DPS',
  tier: 'B',
  rarity: 'Rare',
  stats: {
    characterId: 'rikka',
    name: 'Rikka',
    health: 140,
    maxHealth: 140,
    mana: 200,
    maxMana: 200,
    attack: 95,
    defense: 50,
    speed: 120,
    critChance: 40,
    critDamage: 150,
    lifesteal: 8,
    elementalResistance: {
      'Fire': 80,
      'Lightning': 25,
      'Physical': 20,
      'Erasure': 10,
      'Memory': 15,
    },
  },
  bio: 'Small but unstoppable. This fire-line hero carries a heart full of courage that burns brighter than her tiny frame.',
  lore: 'Rikka burns with the spirit of a hero. "Size doesn\'t matter when your heart\'s on fire. I\'ve got more courage than heroes ten times my size."',
  portraitPath: '/images/characters/rikka.png',
  visualIdentity: {
    primaryColor: '#f97316',
    accentColor: '#fbbf24',
    visualThemes: ['Ember Orange', 'Fire Spirit', 'Tiny Fury', 'Spark Trail'],
    silhouette: 'small-hero',
  },
  relationships: [],
};

export const MIREK_DATA: CharacterData = {
  id: 'mirek',
  name: 'Mirek the Burrowed',
  displayName: 'MIREK THE BURROWED',
  title: 'The Underguide',
  description: 'Underground scout and guide. Knows the deep paths and forgotten ways.',
  faction: 'FRACTURE CIRCLE',
  role: 'Assassin',
  tier: 'B',
  rarity: 'Rare',
  stats: {
    characterId: 'mirek',
    name: 'Mirek',
    health: 170,
    maxHealth: 170,
    mana: 160,
    maxMana: 160,
    attack: 85,
    defense: 55,
    speed: 100,
    critChance: 45,
    critDamage: 140,
    lifesteal: 12,
    elementalResistance: {
      'Physical': 50,
      'Earth': 60,
      'Memory': 20,
      'Erasure': 15,
      'Lightning': 10,
    },
  },
  bio: 'Underground scout and forgotten-ways guide. Strikes from shadows and knows the deep paths no one else dares traverse.',
  lore: 'Mirek burrows through the city\'s underbelly, guiding those lost to the surface. He knows routes through the forgotten foundations.',
  portraitPath: '/images/characters/mirek.png',
  visualIdentity: {
    primaryColor: '#92400e',
    accentColor: '#d97706',
    visualThemes: ['Earth Brown', 'Underground', 'Shadow Paths', 'Burrow Trail'],
    silhouette: 'scout-guide',
  },
  relationships: [],
};

export const SABLE_NINE_DATA: CharacterData = {
  id: 'sable-nine',
  name: 'Sable Nine',
  displayName: 'SABLE NINE',
  title: 'The Rival Shade',
  description: 'Ambiguous survivor with dangerous connection to prophecy. Rival to many, friend to few.',
  faction: 'FRACTURE CIRCLE',
  role: 'Assassin',
  tier: 'B',
  rarity: 'Rare',
  stats: {
    characterId: 'sable-nine',
    name: 'Sable Nine',
    health: 190,
    maxHealth: 190,
    mana: 210,
    maxMana: 210,
    attack: 88,
    defense: 60,
    speed: 110,
    critChance: 50,
    critDamage: 155,
    lifesteal: 10,
    elementalResistance: {
      'Erasure': 55,
      'Memory': 45,
      'Physical': 30,
      'Magic': 40,
      'Lightning': 20,
    },
  },
  bio: 'Ambiguous rival-survivor with a dangerous connection to prophecy. Walks the line between ally and enemy.',
  lore: 'Sable Nine exists between worlds. Her prophecies are both warning and threat. "I am the shadow you cast but never see."',
  portraitPath: '/images/characters/sable-nine.png',
  visualIdentity: {
    primaryColor: '#5b21b6',
    accentColor: '#c084fc',
    visualThemes: ['Dark Purple', 'Prophecy Shade', 'Rival Energy', 'Erasure Touch'],
    silhouette: 'shade-rival',
  },
  relationships: [],
};

// ============ CHARACTER DATA REGISTRY ============

export const CHARACTER_DATA_MAP: Record<string, CharacterData> = {
  'kai-jax': KAI_JAX_DATA,
  'jax': JAX_DATA,
  'kaison': KAISON_DATA,
  'silver': SILVER_DATA,
  'volter': VOLTER_DATA,
  'boryn': BORYN_DATA,
  'borax': BORAX_DATA,
  'vharck': VHARCK_DATA,
  'aurelion': AURELION_DATA,
  'selene': SELENE_DATA,
  'miri': MIRI_DATA,
  'old-moss': OLD_MOSS_DATA,
  'rikka': RIKKA_DATA,
  'mirek': MIREK_DATA,
  'sable-nine': SABLE_NINE_DATA,
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
