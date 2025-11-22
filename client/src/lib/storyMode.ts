// SUPER SMASH GRAND SAGA — STORY MODE STRUCTURE
// 9 Acts + 12 Game Modes with Marvel Ultimate Alliance-style synergy

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
  bookRef: string; // "Book 1: Convergence", etc.
  description: string;
  playstyles: string[];
  fireMoments: FireMoment[];
  bossEncounters: string[];
  gameplayTwist: string;
  difficultyRange: [number, number]; // 1-10 scale
  estimatedPlaytime: number; // minutes
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
    title: 'Cross Point Tournament',
    bookRef: 'Book 1: Convergence',
    description: 'An epic tournament brings legends together, but when the Rift breaches, everything changes.',
    playstyles: ['Tournament matches', 'Movement tests', 'Early team-ups', 'Mini-training quests'],
    fireMoments: [
      {
        id: 'multiversal_arrival',
        name: 'The Multiversal Arrival',
        description: 'Heroes from across dimensions converge for the greatest tournament ever.',
        rewardXP: 500
      },
      {
        id: 'battle_royale_20',
        name: 'Epic 20-Man Battle Royale',
        description: 'Chaos erupts as 20 fighters clash in the arena.',
        rewardXP: 750
      },
      {
        id: 'final_four',
        name: 'Mario/Sonic/Pikachu/Kirby Final Four',
        description: 'The legends reach their moment.',
        rewardXP: 500
      },
      {
        id: 'rift_breach',
        name: 'Rift Breach',
        description: 'Reality tears open. Everything changes.',
        rewardXP: 1000,
        unlocksAbility: 'rift_sense'
      },
      {
        id: 'tournament_collapse',
        name: 'Tournament Collapse',
        description: 'The arena descends into chaos.',
        rewardXP: 500
      },
      {
        id: 'riftspawn_invade',
        name: 'Riftspawn Invade Arena',
        description: 'Corrupted Echo heroes flood the battlefield.',
        rewardXP: 1200,
        unlocksAbility: 'echo_detection'
      }
    ],
    bossEncounters: ['Tournament Champion Clone', 'First Rift General'],
    gameplayTwist: 'Player thinks this is just a tournament. Then the Rift hits and everything flips.',
    difficultyRange: [1, 3],
    estimatedPlaytime: 120,
    locked: false
  },

  2: {
    number: 2,
    title: 'Year of No A-Listers',
    bookRef: 'Book 2',
    description: 'Play as supporting heroes and teams while A-list champions are captured.',
    playstyles: ['Survival', 'Stealth missions', 'Team-based resource runs', 'NPC reinforcement missions'],
    fireMoments: [
      {
        id: 'pikachu_feral_burst',
        name: 'Pikachu\'s Feral Burst',
        description: 'Pikachu unleashes raw power.',
        rewardXP: 800
      },
      {
        id: 'dk_rampage',
        name: 'DK Rampage Sequence',
        description: 'Donkey Kong goes berserk.',
        rewardXP: 900
      },
      {
        id: 'zelda_peach_awakening',
        name: 'Zelda & Peach Bearer Awakening',
        description: 'Two princesses discover their true power.',
        rewardXP: 1000,
        unlocksAbility: 'bearer_bond'
      },
      {
        id: 'rosalina_starlight',
        name: 'Rosalina\'s Starlight Rescue Beams',
        description: 'Cosmic power manifests.',
        rewardXP: 900
      },
      {
        id: 'predator_wing_strike',
        name: 'Predator Wing\'s First Strike',
        description: 'The team reveals itself.',
        rewardXP: 800
      },
      {
        id: 'tails_tech_salvage',
        name: 'Tails\' First Tech Salvage',
        description: 'Innovation in crisis.',
        rewardXP: 750
      }
    ],
    bossEncounters: ['Shadow Corrupted Heroes', 'Void Echo Clones', 'Resource Guardian'],
    gameplayTwist: 'You play as EVERYONE except the main heroes — until you rescue them.',
    difficultyRange: [2, 5],
    estimatedPlaytime: 180,
    locked: true,
    prerequisiteAct: 1
  },

  3: {
    number: 3,
    title: 'Unity\'s Dawn',
    bookRef: 'Book 3',
    description: 'Rescue and reunite heroes. Reality shifts as ancient powers awaken.',
    playstyles: ['Multi-character rescue', 'Psychic battles in illusion realms', 'Fusion sequences', 'Sky battles', 'Rift pocket puzzles'],
    fireMoments: [
      {
        id: 'mario_luigi_awakening',
        name: 'Mario & Luigi Awakening',
        description: 'The brothers' true power emerges.',
        rewardXP: 1200,
        unlocksAbility: 'brother_fusion'
      },
      {
        id: 'sonic_celestial',
        name: 'Sonic\'s Celestial Flicker',
        description: 'Speed transcends reality.',
        rewardXP: 1100
      },
      {
        id: 'fox_samus_prison',
        name: 'Fox + Samus Prison Break',
        description: 'Tactical liberation.',
        rewardXP: 900
      },
      {
        id: 'smash_brother_fusion',
        name: 'Super Smash Brother Fusion vs Solaris',
        description: 'Ultimate combination against cosmic threat.',
        rewardXP: 1500,
        unlocksAbility: 'ultimate_fusion'
      },
      {
        id: 'silver_divine',
        name: 'Silver\'s Divine Creation',
        description: 'Time-warping powers fully unleashed.',
        rewardXP: 1300,
        unlocksAbility: 'temporal_shift'
      },
      {
        id: 'lunara_birth',
        name: 'Lunara\'s Birth',
        description: 'A new legend is born.',
        rewardXP: 1400,
        unlocksAbility: 'lunara_summon'
      }
    ],
    bossEncounters: ['Solaris Phase 1', 'Illusionary Champion', 'Void Echo Solaris'],
    gameplayTwist: 'You control Silver\'s unstable time-pulse, switching timelines mid-fight.',
    difficultyRange: [3, 6],
    estimatedPlaytime: 200,
    locked: true,
    prerequisiteAct: 2
  },

  4: {
    number: 4,
    title: 'The Great Hunt',
    bookRef: 'Book 4',
    description: 'Search for ancient artifacts across corrupted zones. Legacy Kids emerge.',
    playstyles: ['Open-zone exploration', 'Artifact hunting', 'Boss ambushes', 'Dark realm navigation'],
    fireMoments: [
      {
        id: 'mephiles_ambush',
        name: 'Mephiles Ambush',
        description: 'Darkness strikes from the void.',
        rewardXP: 1100
      },
      {
        id: 'zelda_triforce_shatter',
        name: 'Zelda\'s Triforce Shatter Moment',
        description: 'Ancient power fragments.',
        rewardXP: 1200,
        unlocksAbility: 'triforce_echo'
      },
      {
        id: 'legacy_kids_cameo',
        name: 'Early Legacy Kid Cameos',
        description: 'The next generation appears.',
        rewardXP: 800
      },
      {
        id: 'yoshi_prophecy',
        name: 'Yoshi\'s Prophecy Start',
        description: 'Ancient visions of the future.',
        rewardXP: 900,
        unlocksAbility: 'prophecy_vision'
      },
      {
        id: 'dk_redemption',
        name: 'DK Redemption Seeds',
        description: 'Hope blooms in darkness.',
        rewardXP: 850
      }
    ],
    bossEncounters: ['Artifact Guardian', 'Dark Realm Boss', 'Mephiles Echo'],
    gameplayTwist: 'Enemies adapt to your moveset — the beginning of the Anti-Power System.',
    difficultyRange: [4, 7],
    estimatedPlaytime: 220,
    locked: true,
    prerequisiteAct: 3
  },

  5: {
    number: 5,
    title: 'Primordial Gambit',
    bookRef: 'Book 5',
    description: 'Assault the fortress. Transformations reach new heights.',
    playstyles: ['Multi-stage fortress invasions', 'Reality-warping arenas', 'Boss gauntlets', 'Upgrade crafting'],
    fireMoments: [
      {
        id: 'bowser_sacrifice',
        name: 'Bowser Sacrifice',
        description: 'The King makes his choice.',
        rewardXP: 1300,
        unlocksAbility: 'bowser_redemption'
      },
      {
        id: 'jr_rescue',
        name: 'Jr Rescued → Prince Koopa Arc Begins',
        description: 'The heir awakens.',
        rewardXP: 950
      },
      {
        id: 'brotherhood_firestorm',
        name: 'Brotherhood Firestorm Tease',
        description: 'A coming together.',
        rewardXP: 1100
      },
      {
        id: 'sonic_god_state',
        name: 'Sonic\'s Controlled God-State',
        description: 'Speed reaches infinity.',
        rewardXP: 1400,
        unlocksAbility: 'sonic_infinity'
      },
      {
        id: 'mega_tails_techfront',
        name: 'Mega Man + Tails Techfront Evolution',
        description: 'Technology transcends limits.',
        rewardXP: 1200,
        unlocksAbility: 'techfront_fusion'
      }
    ],
    bossEncounters: ['Fortress Guardian', 'Void Echo Commander', 'Anti-Power Champion'],
    gameplayTwist: 'Each hero gets their 2nd-tier transformation or form enhancement.',
    difficultyRange: [5, 8],
    estimatedPlaytime: 240,
    locked: true,
    prerequisiteAct: 4
  },

  6: {
    number: 6,
    title: 'Shadows of the Void',
    bookRef: 'Book 6',
    description: 'Reality warps. Titans awaken. The Void presses closer.',
    playstyles: ['Cosmic storms', 'Titan boss fights', 'Mephiles/Void coordination bosses', 'Ancient trials', 'Realm-rending sequences'],
    fireMoments: [
      {
        id: 'thunder_pikachu',
        name: 'Thunder God Pikachu',
        description: 'Electric divinity unleashed.',
        rewardXP: 1500,
        unlocksAbility: 'thunder_god'
      },
      {
        id: 'diddy_corrupted_dk',
        name: 'Diddy vs Corrupted DK Clone',
        description: 'Family tragedy unfolds.',
        rewardXP: 1200
      },
      {
        id: 'samus_ascension',
        name: 'Samus Ascension Trial',
        description: 'The ultimate warrior rises.',
        rewardXP: 1400,
        unlocksAbility: 'samus_omega'
      },
      {
        id: 'silver_sacrifice',
        name: 'Silver\'s First Sacrifice',
        description: 'Time itself bends.',
        rewardXP: 1300,
        unlocksAbility: 'temporal_anchor'
      },
      {
        id: 'lunara_awakening',
        name: 'Lunara\'s Awakening',
        description: 'The star shines.',
        rewardXP: 1500,
        unlocksAbility: 'lunara_constellation'
      }
    ],
    bossEncounters: ['Titan Void Guardian', 'Mephiles Ascended', 'Cosmic Solaris'],
    gameplayTwist: 'Entire zones shift while fighting — vertical reality breaks.',
    difficultyRange: [6, 9],
    estimatedPlaytime: 260,
    locked: true,
    prerequisiteAct: 5
  },

  7: {
    number: 7,
    title: 'Nexus Legacy',
    bookRef: 'Book 7',
    description: 'Legacy Heroes debut. Generations collide in the final stand.',
    playstyles: ['Multi-generation combat', 'Tag-team combos', 'Fusion synergy', 'Reality maze traversal'],
    fireMoments: [
      {
        id: 'legacy_kids_combat',
        name: 'Legacy Kids\' First Full Combat',
        description: 'The next generation fights.',
        rewardXP: 1400,
        unlocksAbility: 'legacy_bond'
      },
      {
        id: 'triforce_choir',
        name: 'Triforce Choir Moment',
        description: 'Three powers converge.',
        rewardXP: 1500,
        unlocksAbility: 'triforce_ultimate'
      },
      {
        id: 'bash_brothers_debut',
        name: 'Bash Brothers (Redlock + Kiro) Debut',
        description: 'Power couple unleashed.',
        rewardXP: 1300,
        unlocksAbility: 'bash_synchrony'
      },
      {
        id: 'hyper_sonic_apex_shadow',
        name: 'Hyper Sonic / Apex Shadow Surge',
        description: 'Speed and darkness collide.',
        rewardXP: 1600,
        unlocksAbility: 'hyper_apex_fusion'
      },
      {
        id: 'galaxy_reinforcements',
        name: 'Galaxy-Scale Reinforcements',
        description: 'The universe answers.',
        rewardXP: 1500,
        unlocksAbility: 'cosmic_summon'
      }
    ],
    bossEncounters: ['Reality Guardian', 'Void Echo Titan', 'Anti-Legacy Clone'],
    gameplayTwist: 'You switch between adult heroes and legacy heroes mid-combo.',
    difficultyRange: [7, 9],
    estimatedPlaytime: 280,
    locked: true,
    prerequisiteAct: 6
  },

  8: {
    number: 8,
    title: 'War of the Eternals',
    bookRef: 'Book 8',
    description: 'Tournament of titans. Environmental hazards rage. Void King watches.',
    playstyles: ['Tournament arc battle ladders', 'Boss-tier 1v1s', 'Team-vs-Team gauntlets', 'Mid-battle transformation switches'],
    fireMoments: [
      {
        id: 'all_high_descends',
        name: 'The All High Descends',
        description: 'Cosmic overseers arrive.',
        rewardXP: 1600,
        unlocksAbility: 'all_high_blessing'
      },
      {
        id: 'multiverse_gauntlet',
        name: 'Multiverse Gauntlet Begins',
        description: 'The ultimate test starts.',
        rewardXP: 1500
      },
      {
        id: 'hyper_sonic_void_echo',
        name: 'Hyper Sonic vs Void Echo',
        description: 'Speed vs Entropy.',
        rewardXP: 1700,
        unlocksAbility: 'sonic_supremacy'
      },
      {
        id: 'rosalina_palutena_divine',
        name: 'Rosalina + Palutena Divine Clash',
        description: 'Godly forces meet.',
        rewardXP: 1600,
        unlocksAbility: 'divine_harmony'
      },
      {
        id: 'void_king_warning',
        name: 'Void King Interference Warning',
        description: 'The end draws near.',
        rewardXP: 1400,
        unlocksAbility: 'void_sense'
      },
      {
        id: 'last_override_protocol',
        name: 'Last Override Protocol (WilyEgg)',
        description: 'The final failsafe.',
        rewardXP: 1800,
        unlocksAbility: 'override_protocol'
      }
    ],
    bossEncounters: ['Tournament Champion', 'Void Echo Supreme', 'All High Guardian', 'Void King Echo'],
    gameplayTwist: 'Each Gauntlet round has environmental rules: Reversed gravity, Reality stitching, Attacks cost lifespan, Chaos field active.',
    difficultyRange: [8, 10],
    estimatedPlaytime: 300,
    locked: true,
    prerequisiteAct: 7
  },

  9: {
    number: 9,
    title: 'Oblivion\'s End',
    bookRef: 'Book 9',
    description: 'The final battle. Heroes make the ultimate sacrifice. Reality restored.',
    playstyles: ['Open cosmic battlefield', 'Base-defense missions', '3-stage boss sequences', 'Multi-character QTE transformations', 'Final hero moments'],
    fireMoments: [
      {
        id: 'hyper_3tails_kai_xon',
        name: 'Hyper 3-Tails Kai-Xon Jax-Son Debut',
        description: 'The ultimate form rises.',
        rewardXP: 2000,
        unlocksAbility: 'kai_xon_ascension'
      },
      {
        id: 'yoshi_star_army',
        name: 'Yoshi Leading an Army on Star Mounts',
        description: 'Ancient prophecy fulfilled.',
        rewardXP: 1800,
        unlocksAbility: 'star_legion'
      },
      {
        id: 'lunara_silver_choir',
        name: 'Lunara + Silver Reality Choir',
        description: 'Time and space harmonize.',
        rewardXP: 1900,
        unlocksAbility: 'reality_chorus'
      },
      {
        id: 'final_smash_charge',
        name: 'Final Smash Army Charge',
        description: 'Heroes unite for the final blow.',
        rewardXP: 2000,
        unlocksAbility: 'final_smash_array'
      },
      {
        id: 'void_king_last_form',
        name: 'Void King\'s Last Form',
        description: 'The ultimate evil reveals itself.',
        rewardXP: 2200
      },
      {
        id: 'infinite_symphony',
        name: 'The Infinite Symphony',
        description: 'Reality\'s true song.',
        rewardXP: 2000,
        unlocksAbility: 'infinite_melody'
      },
      {
        id: 'ash_pikachu_sacrifice',
        name: 'Ash + Pikachu Final Sacrifice',
        description: 'The price of victory.',
        rewardXP: 1800
      },
      {
        id: 'last_smash',
        name: 'The Last Smash',
        description: 'Everything ends. Everything begins.',
        rewardXP: 2500,
        unlocksAbility: 'smash_eternal'
      }
    ],
    bossEncounters: ['Void King Phase 1', 'Void King Phase 2', 'Void King Ascended', 'Void King Supreme'],
    gameplayTwist: 'The final boss learns from the player — moves get countered in later phases.',
    difficultyRange: [9, 10],
    estimatedPlaytime: 350,
    locked: true,
    prerequisiteAct: 8
  }
};

// ============ GAME MODES ============

export const GAME_MODES: Record<GameModeType, GameMode> = {
  legacy: {
    id: 'legacy',
    name: 'Legacy Mode',
    description: 'Play as the Legacy Kids post-saga with growth quests, fusion trials, and destiny battles.',
    icon: '👑',
    unlockCondition: 'Complete Act 7',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 5000, currency: 500, loot: ['legacy_artifact', 'fusion_core'] }
  },
  gauntlet: {
    id: 'gauntlet',
    name: 'The Gauntlet of Gods',
    description: 'One hundred floors of increasingly powerful villains, clones, and corrupted heroes. Final boss: Solaris Extreme.',
    icon: '🥇',
    unlockCondition: 'Complete Act 5',
    isActive: true,
    difficulty: 'extreme',
    reward: { xp: 10000, currency: 2000, loot: ['godly_weapon', 'eternal_artifact'] }
  },
  riftbreak: {
    id: 'riftbreak',
    name: 'Riftbreak Survival',
    description: 'Endless survival mode. Reality tears open wave after wave. Every 10 rounds = Rift General boss.',
    icon: '🥈',
    unlockCondition: 'Complete Act 2',
    isActive: true,
    difficulty: 'extreme',
    reward: { xp: 7500, currency: 1500, loot: ['rift_shard', 'essence_core'] }
  },
  timeline: {
    id: 'timeline',
    name: 'Timeline Paradox Mode',
    description: 'Replay iconic fights with new outcomes. Save characters, choose different heroes, control villains.',
    icon: '🥉',
    unlockCondition: 'Complete Act 3',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 6000, currency: 800, loot: ['paradox_crystal'] }
  },
  toddler: {
    id: 'toddler',
    name: 'Toddler Mode (Legacy Little Heroes)',
    description: 'Comedy mode: Play as tiny baby versions of heroes. Adorable, chaotic, hilarious.',
    icon: '🧒',
    unlockCondition: 'Complete Act 4',
    isActive: true,
    difficulty: 'easy',
    reward: { xp: 2000, currency: 300, loot: ['cute_cosmetic'] }
  },
  lab: {
    id: 'lab',
    name: 'Lab Mode: Tech, Magic, Chaos',
    description: 'Upgrade room with Chaos Engineering, Tech Fusion, Triforce Spellcraft, and Starborn Awakening.',
    icon: '🧪',
    unlockCondition: 'Complete Act 1',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 3000, currency: 500, loot: ['upgrade_blueprint'] }
  },
  expedition: {
    id: 'expedition',
    name: 'Open Zone Expeditions',
    description: 'Explore Green Hill, Hyrule Field, Mushroom Kingdom, Dreamland. Collect lore and fight random bosses.',
    icon: '🗺️',
    unlockCondition: 'Complete Act 2',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 4000, currency: 600, loot: ['zone_treasure'] }
  },
  harmonarch: {
    id: 'harmonarch',
    name: 'Harmonarch Trials',
    description: 'Fight the cosmic overseers who created the tournament. God-tier content.',
    icon: '👑',
    unlockCondition: 'Complete Act 8',
    isActive: true,
    difficulty: 'godlike',
    reward: { xp: 12000, currency: 3000, loot: ['harmonarch_crown'] }
  },
  echo: {
    id: 'echo',
    name: 'Echo Simulator (AI Fights)',
    description: 'Train against Echo clones that learn your playstyle and adapt to your moves.',
    icon: '🤖',
    unlockCondition: 'Complete Act 1',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 3500, currency: 400, loot: ['training_manual'] }
  },
  haven: {
    id: 'haven',
    name: 'Smash Haven Builder',
    description: 'Base-building mode. Expand Nexus Haven: Medical, Tech Wing, Warp Hub, Legacy Nursery, Training Hall.',
    icon: '🛡️',
    unlockCondition: 'Complete Act 3',
    isActive: true,
    difficulty: 'normal',
    reward: { xp: 5000, currency: 1000, loot: ['haven_blueprint'] }
  },
  doublefate: {
    id: 'doublefate',
    name: 'Double Fate Mode',
    description: 'Play through dual storylines: Light Path vs Void Path. Different choices, different endings.',
    icon: '🌀',
    unlockCondition: 'Complete Act 6',
    isActive: true,
    difficulty: 'hard',
    reward: { xp: 8000, currency: 1200, loot: ['fate_fragment'] }
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic Library Mode',
    description: 'Unlock and replay every cutscene like a collectible anime series.',
    icon: '📘',
    unlockCondition: 'Progress through Story',
    isActive: true,
    difficulty: 'easy',
    reward: { xp: 1000, currency: 200, loot: ['cutscene_art'] }
  }
};
