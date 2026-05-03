// LEGENDS OF KAI-JAX: THE ZENITH SAGA — STORY STRUCTURE
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

export type ActNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type GameModeType = 'legacy' | 'gauntlet' | 'riftbreak' | 'timeline' | 'toddler' | 'lab' | 'expedition' | 'harmonarch' | 'echo' | 'haven' | 'doublefate' | 'cinematic';

export interface FireMoment {
  id: string;
  name: string;
  description: string;
  cutsceneAsset?: string;
  rewardXP?: number;
  unlocksAbility?: string;
}

export interface StoryAct {
  number: ActNumber;
  title: string;
  bookRef: string;
  description: string;
  playstyles: string[];
  fireMoments: FireMoment[];
  bossEncounters: string[];
  gameplayTwist: string;
  difficultyRange: [number, number];
  estimatedPlaytime: number;
  locked: boolean;
  prerequisiteAct?: ActNumber;
}

export interface GameMode {
  id: GameModeType;
  name: string;
  description: string;
  icon: string;
  unlockCondition?: string;
  isActive: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'godlike';
  reward: {
    xp: number;
    currency: number;
    loot: string[];
  };
}

// ============ STORY ACTS ============

export const STORY_ACTS: Record<ActNumber, StoryAct> = {
  1: {
    number: 1,
    title: 'The Zenith Protocol',
    bookRef: 'Book 1: Convergence',
    description: 'A global meeting of the sectors turns into a desperate struggle for survival as the Rift first breaches reality.',
    playstyles: ['Sector encounters', 'Movement trials', 'Tactical team-ups', 'Awakening quests'],
    fireMoments: [
      {
        id: 'memory_convergence',
        name: 'The Memory Convergence',
        description: 'Jaxon and Kaison witness the first alignment of memory strands.',
        rewardXP: 500
      },
      {
        id: 'rift_emergence',
        name: 'Rift Emergence',
        description: 'The sky tears open over the Bronx sector. Reality begins to bleed.',
        rewardXP: 1000,
        unlocksAbility: 'memory_sight'
      },
      {
        id: 'kai_jax_first_fusion',
        name: 'The First Fusion',
        description: 'Kai-Jax is born from necessity to drive back the first Void wave.',
        rewardXP: 1200,
        unlocksAbility: 'fusion_strike'
      }
    ],
    bossEncounters: ['Void Warden', 'Rift Commander'],
    gameplayTwist: 'The UI shifts from standard military protocol to a distorted "Rift-Vision" as the act progresses.',
    difficultyRange: [1, 3],
    estimatedPlaytime: 120,
    locked: false
  },

  2: {
    number: 2,
    title: 'The Void Eclipse',
    bookRef: 'Book 2: Darkness',
    description: 'The main champions are pulled into the Rift. The secondary protectors must hold the Bronx and Brooklyn sectors.',
    playstyles: ['Wave defense', 'Rescue missions', 'Scrap gathering', 'Civic protection'],
    fireMoments: [
      {
        id: 'volter_unleashed',
        name: 'Volter\'s Overcharge',
        description: 'The beast protects the power grid with 1,000,000 volts.',
        rewardXP: 800
      },
      {
        id: 'korg_earthwall',
        name: 'The Mountain That Stood',
        description: 'Korg blocks the Rift expansion with pure earth memory.',
        rewardXP: 900
      },
      {
        id: 'aria_healing_wind',
        name: 'Aria\'s Breath of Life',
        description: 'Wind magic restores the wounded defenders.',
        rewardXP: 1000,
        unlocksAbility: 'healing_wind'
      }
    ],
    bossEncounters: ['Echo Stalker', 'Void Crawler', 'Grid Destroyer'],
    gameplayTwist: 'You play as the "Beast Heroes" — high power but unstable control.',
    difficultyRange: [2, 5],
    estimatedPlaytime: 180,
    locked: true,
    prerequisiteAct: 1
  },

  3: {
    number: 3,
    title: 'Restoration of the Weave',
    bookRef: 'Book 3: Resonance',
    description: 'Silver Chronos arrives from a dead future to help rescue Jaxon and Kaison from the Void.',
    playstyles: ['Time-loop puzzles', 'Void-space combat', 'Rescue sequences', 'Strand stitching'],
    fireMoments: [
      {
        id: 'silver_arrival',
        name: 'The Time Sage Descends',
        description: 'Silver stops time to prevent the final collapse.',
        rewardXP: 1200,
        unlocksAbility: 'temporal_anchor'
      },
      {
        id: 'kai_jax_full_sync',
        name: 'Perfect Synchronization',
        description: 'Kai-Jax reaches 100% stability. The Memory Hero is fully manifest.',
        rewardXP: 1500,
        unlocksAbility: 'zenith_ascension'
      }
    ],
    bossEncounters: ['Void Echo Solaris', 'Time Eater'],
    gameplayTwist: 'Temporal mechanics allow you to rewind mistakes, but each use costs Memory Energy.',
    difficultyRange: [3, 6],
    estimatedPlaytime: 200,
    locked: true,
    prerequisiteAct: 2
  }
};

// ============ GAME MODES ============

export const GAME_MODES: Record<GameModeType, GameMode> = {
  legacy: {
    id: 'legacy',
    name: 'The Legacy Trials',
    description: 'Play as the next generation of heroes post-saga. Discover the future of the Weave.',
    icon: '👑',
    unlockCondition: 'Complete Act 7',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 5000, currency: 500, loot: ['legacy_shard', 'fusion_core'] }
  },
  gauntlet: {
    id: 'gauntlet',
    name: 'Zenith Gauntlet',
    description: 'One hundred floors of increasingly powerful Void remnants and Echo clones.',
    icon: '🥇',
    unlockCondition: 'Complete Act 5',
    isActive: true,
    difficulty: 'extreme',
    reward: { xp: 10000, currency: 2000, loot: ['zenith_weapon', 'eternal_core'] }
  },
  riftbreak: {
    id: 'riftbreak',
    name: 'Riftbreak Survival',
    description: 'Endless survival mode. Reality tears open wave after wave.',
    icon: '🥈',
    unlockCondition: 'Complete Act 2',
    isActive: true,
    difficulty: 'extreme',
    reward: { xp: 7500, currency: 1500, loot: ['rift_fragment', 'memory_essence'] }
  },
  timeline: {
    id: 'timeline',
    name: 'Paradox Chronicles',
    description: 'Replay iconic fights with new outcomes. Save those who were lost.',
    icon: '🥉',
    unlockCondition: 'Complete Act 3',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 6000, currency: 800, loot: ['paradox_gem'] }
  },
  toddler: {
    id: 'toddler',
    name: 'Little Legends',
    description: 'Comedy mode: Play as tiny, high-pitched versions of the heroes.',
    icon: '🧒',
    unlockCondition: 'Complete Act 4',
    isActive: true,
    difficulty: 'easy',
    reward: { xp: 2000, currency: 300, loot: ['chibi_cosmetic'] }
  },
  lab: {
    id: 'lab',
    name: 'The Weave Lab',
    description: 'Refine your abilities through Chaos Engineering and Memory Synthesis.',
    icon: '🧪',
    unlockCondition: 'Complete Act 1',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 3000, currency: 500, loot: ['synthesis_blueprint'] }
  },
  expedition: {
    id: 'expedition',
    name: 'Sector Expeditions',
    description: 'Explore the open sectors of the Bronx, Brooklyn, and Queens. Collect lore shards.',
    icon: '🗺️',
    unlockCondition: 'Complete Act 2',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 4000, currency: 600, loot: ['lore_tablet'] }
  },
  harmonarch: {
    id: 'harmonarch',
    name: 'Trials of the All-High',
    description: 'Fight the cosmic overseers who first wove the Memory strands.',
    icon: '👑',
    unlockCondition: 'Complete Act 8',
    isActive: true,
    difficulty: 'godlike',
    reward: { xp: 12000, currency: 3000, loot: ['all_high_crown'] }
  },
  echo: {
    id: 'echo',
    name: 'Echo Chamber (AI Simulation)',
    description: 'Train against adaptive AI clones that mimic your unique playstyle.',
    icon: '🤖',
    unlockCondition: 'Complete Act 1',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 3500, currency: 400, loot: ['combat_data'] }
  },
  haven: {
    id: 'haven',
    name: 'Nexus Haven Builder',
    description: 'Base-building mode. Expand the sanctuary for the surviving sectors.',
    icon: '🛡️',
    unlockCondition: 'Complete Act 3',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 5000, currency: 1000, loot: ['haven_module'] }
  },
  doublefate: {
    id: 'doublefate',
    name: 'Dual Destiny',
    description: 'Play through dual storylines: The Hero Path vs The Echo Path.',
    icon: '🌀',
    unlockCondition: 'Complete Act 6',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 8000, currency: 1200, loot: ['destiny_fragment'] }
  },
  cinematic: {
    id: 'cinematic',
    name: 'Memory Archive',
    description: 'Unlock and replay every cinematic moment in high fidelity.',
    icon: '📘',
    unlockCondition: 'Progress through Story',
    isActive: true,
    difficulty: 'easy',
    reward: { xp: 1000, currency: 200, loot: ['archive_art'] }
  }
};
