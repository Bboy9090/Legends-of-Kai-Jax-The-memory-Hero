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
  },

  4: {
    number: 4,
    title: 'The Hollow Dawn',
    bookRef: 'Book 4: Aftermath',
    description: 'The Void is gone but the restored memories fit badly. Hollows scavenge the gaps while a hidden buyer feeds stolen shards to the Rift Warden.',
    playstyles: ['Stealth', 'Base defense', 'Consent-based rescue', 'Boss duel'],
    fireMoments: [
      { id: 'mirek_tunnels', name: 'The Underguide', description: 'Mirek leads the team through the black-market tunnels.', rewardXP: 750 },
      { id: 'rikka_spark', name: 'The Little Spark', description: 'Rikka joins the defense of Nexus Haven.', rewardXP: 800 },
      { id: 'miri_consent', name: 'The Sealed Name', description: 'Miri opens her own relic, on her own terms.', rewardXP: 850 }
    ],
    bossEncounters: ['Rift Warden'],
    gameplayTwist: 'Memories must be returned with consent; forcing one open fails the objective.',
    difficultyRange: [5, 7],
    estimatedPlaytime: 150,
    locked: true,
    prerequisiteAct: 3
  },

  5: {
    number: 5,
    title: 'The Hundred Floors',
    bookRef: 'Book 5: Ascent',
    description: 'A black tower rises in the Ashen Expanse. Each floor builds copies of the heroes and asks whether they can be spared.',
    playstyles: ['Wave survival', 'Mercy mechanics', 'Platforming', 'Guardian bosses'],
    fireMoments: [
      { id: 'selene_omen', name: 'The Oracle\'s Omen', description: 'Selene recognizes the tower from her visions.', rewardXP: 900 },
      { id: 'moss_wound', name: 'A Wound, Not a Monster', description: 'Old Moss reveals that the Void began as an untended memory.', rewardXP: 1000 },
      { id: 'mirror_door', name: 'The Mirror Door', description: 'The Hundredth Floor opens on an Echo that knows the team.', rewardXP: 1800 }
    ],
    bossEncounters: ['Marble Gladiator', 'Granite Colossus'],
    gameplayTwist: 'Sparing a lowered-guard Echo copy grants bonus XP; defeating it does not.',
    difficultyRange: [6, 8],
    estimatedPlaytime: 180,
    locked: true,
    prerequisiteAct: 4
  },

  6: {
    number: 6,
    title: 'Dual Destiny',
    bookRef: 'Book 6: The Mirror',
    description: 'Beyond the mirror door the roads split: the Hero Path with every ally, and the Echo Path, a silent world with one voice.',
    playstyles: ['Chase', 'Team combat', 'Stealth', 'Rival duel'],
    fireMoments: [
      { id: 'sable_betrayal', name: 'The Fastest Betrayal', description: 'Sable Nine takes the mirror key and runs.', rewardXP: 1100 },
      { id: 'two_roads', name: 'Two Roads', description: 'The team walks both the Hero and Echo paths.', rewardXP: 1250 },
      { id: 'echo_falls', name: 'The Echo Falls', description: 'Three voices agreeing to disagree beat one certain voice.', rewardXP: 2200 }
    ],
    bossEncounters: ['Sable\'s Shade', 'Echo of Kai-Jax'],
    gameplayTwist: 'Both paths must be played; each shows the same fight from a different philosophy.',
    difficultyRange: [7, 9],
    estimatedPlaytime: 200,
    locked: true,
    prerequisiteAct: 5
  },

  7: {
    number: 7,
    title: 'The Weave Unbound',
    bookRef: 'Book 7: Reckoning',
    description: 'The Weave unravels. The elders return, Aurelion shows the throne-ruled future, and the war ends by giving the power away.',
    playstyles: ['Node defense', 'Team combat', 'Time-slip combat', 'Boss duel'],
    fireMoments: [
      { id: 'elders_return', name: 'The Elders Gather', description: 'Boryn and Borax hold Cross Point once more.', rewardXP: 1500 },
      { id: 'erased_future', name: 'The Erased Future', description: 'Aurelion shows the timeline where Kai-Jax rules.', rewardXP: 1600 },
      { id: 'throne_refused', name: 'The Throne Refused', description: 'Kai-Jax scatters the Weave into the people instead of taking it.', rewardXP: 3000 }
    ],
    bossEncounters: ['Rift General Prime'],
    gameplayTwist: 'The final choice is not to win more, but to share the power.',
    difficultyRange: [8, 10],
    estimatedPlaytime: 220,
    locked: true,
    prerequisiteAct: 6
  },

  8: {
    number: 8,
    title: 'The All-High',
    bookRef: 'Book 8: The Overseers',
    description: 'The cosmic overseers who first wove the strands return and set four Trials, one for each strand and the question beneath it.',
    playstyles: ['Boss gauntlet', 'Chase', 'Chain combat', 'Consent trial'],
    fireMoments: [
      { id: 'sky_opens', name: 'The Sky Opens', description: 'Four colossal overseers look down on the city.', rewardXP: 1800 },
      { id: 'storm_shared', name: 'Small Lightning', description: 'Jax chains the storm through every ally.', rewardXP: 2200 },
      { id: 'we_should_have_asked', name: 'We Should Have Asked', description: 'Kai-Jax admits the Weave was given without consent.', rewardXP: 3200 }
    ],
    bossEncounters: ['Jade Serpent', 'Frost Wolf', 'Thunder Lion', 'Earth Turtle'],
    gameplayTwist: 'Each Trial is won by an answer as well as a fight.',
    difficultyRange: [9, 10],
    estimatedPlaytime: 220,
    locked: true,
    prerequisiteAct: 7
  },

  9: {
    number: 9,
    title: 'The Last Memory',
    bookRef: 'Book 9: The Last Gate',
    description: 'The full Circle marches to the Last Gate and finds the origin of the Void: a forgotten memory that only wanted not to be alone.',
    playstyles: ['Full-roster team combat', 'Long-form survival', 'Final boss', 'Epilogue'],
    fireMoments: [
      { id: 'circle_gathers', name: 'Gathering the Circle', description: 'Every ally answers the call at Nexus Haven.', rewardXP: 2200 },
      { id: 'first_wound', name: 'Where the Void Was Born', description: 'The Well-Defiler reveals the origin of the Void.', rewardXP: 2600 },
      { id: 'last_memory', name: 'The Last Memory', description: 'Hollow Architect is remembered instead of destroyed.', rewardXP: 5000 }
    ],
    bossEncounters: ['Well-Defiler', 'Hollow Architect'],
    gameplayTwist: 'The final boss ends by being remembered, not defeated.',
    difficultyRange: [9, 10],
    estimatedPlaytime: 240,
    locked: true,
    prerequisiteAct: 8
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
