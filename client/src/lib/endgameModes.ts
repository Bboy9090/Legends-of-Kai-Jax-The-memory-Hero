// SUPER SMASH GRAND SAGA - 8 ENDGAME MODES

export interface EndgameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockRequirement: string;
  difficulty: 'hard' | 'extreme' | 'godlike';
  rewards: {
    xpPerRun: number;
    currencyPerRun: number;
    specialDrops: string[];
  };
  mechanics: string[];
  maxFloors?: number; // For gauntlet-style modes
  timeLimit?: number; // In seconds
}

export const ENDGAME_MODES: EndgameMode[] = [
  {
    id: 'rift_gauntlet',
    name: 'Rift Gauntlet',
    description: 'An endless tower of 100 floors filled with increasingly difficult Echo bosses.',
    icon: '🗼',
    unlockRequirement: 'Complete Act III',
    difficulty: 'extreme',
    rewards: {
      xpPerRun: 5000,
      currencyPerRun: 3000,
      specialDrops: ['Rift Shards', 'Echo Cores', 'Infinity Stones']
    },
    mechanics: [
      'Floor escalation: every 10 floors, enemies get stronger',
      'Random bosses: each floor has randomized boss from game roster',
      'Transformation locks: some floors prevent transformations',
      'Zero-heal floors: health cannot be recovered on certain floors',
      'Rift anomalies: random environmental hazards'
    ],
    maxFloors: 100
  },
  {
    id: 'harmonarch_trials',
    name: 'Harmonarch Trials',
    description: 'Battle five cosmic deities who judge your worthiness as a hero.',
    icon: '⚡',
    unlockRequirement: 'Complete Act VI',
    difficulty: 'godlike',
    rewards: {
      xpPerRun: 10000,
      currencyPerRun: 5000,
      specialDrops: ['Harmonarch Seal', 'Celestial Essence', 'God Tier Loot']
    },
    mechanics: [
      'Eldron the Gravity Keeper: Controls gravity during fight',
      'Lumaera the Light Weaver: Blinds and light-based attacks',
      'Tharos the Flame Eternal: Constant fire damage environment',
      'Sythren the Whispered Shadow: Shadow clones and dark attacks',
      'The All High: Uses ALL elements combined (hardest)',
      'Each deity has unique phase patterns'
    ]
  },
  {
    id: 'legacy_echo',
    name: 'Legacy Echo Mode',
    description: 'Battle alternate timeline versions of heroes with different movesets and personalities.',
    icon: '👥',
    unlockRequirement: 'Unlock first legacy kid',
    difficulty: 'hard',
    rewards: {
      xpPerRun: 4000,
      currencyPerRun: 2500,
      specialDrops: ['Legacy Shards', 'Echo Memory', 'Timeline Fragment']
    },
    mechanics: [
      'Fight Echo versions of all 50 characters',
      'Each echo has slightly different abilities',
      'Team synergies are reversed (what helps you hurts them)',
      'Random modifiers change each run',
      'Unlocks alternate skins for beating echo versions'
    ]
  },
  {
    id: 'omega_boss_raids',
    name: 'OmegaBoss Raids',
    description: '4-player co-op raids against ultimate versions of story bosses.',
    icon: '👹',
    unlockRequirement: 'Complete Act V',
    difficulty: 'extreme',
    rewards: {
      xpPerRun: 8000,
      currencyPerRun: 4000,
      specialDrops: ['Raid Seal', 'Ancient Relic', 'Legendary Gear']
    },
    mechanics: [
      '4 heroes vs 1 ultimate boss',
      'Boss has 4x health of normal version',
      'Phase coordination: all 4 heroes must attack specific phases',
      'Support role critical: healing/buffs needed',
      'Raids require good team composition'
    ]
  },
  {
    id: 'time_paradox',
    name: 'Time Paradox Missions',
    description: 'Replay story fights with alternate rules and outcomes that change the timeline.',
    icon: '⏰',
    unlockRequirement: 'Complete Act VII',
    difficulty: 'hard',
    rewards: {
      xpPerRun: 3000,
      currencyPerRun: 2000,
      specialDrops: ['Timeline Shard', 'Paradox Key', 'History Book']
    },
    mechanics: [
      'Reverse boss patterns: patterns play backwards',
      'Alternate victory conditions: win in specific way',
      'Hero swaps: mid-fight character switches change outcome',
      'Time loops: fight gets harder each replay',
      'Unlocks secret character interactions and dialogue'
    ]
  },
  {
    id: 'zenith_form',
    name: 'Zenith Form Challenges',
    description: 'Master transformation evolution challenges. Push heroes to their absolute limits.',
    icon: '✨',
    unlockRequirement: 'Max transformation on 1 hero',
    difficulty: 'extreme',
    rewards: {
      xpPerRun: 6000,
      currencyPerRun: 3500,
      specialDrops: ['Zenith Crystal', 'Transformation Core', 'Power Essence']
    },
    mechanics: [
      'Hero locked to 1 form: pick form before battle',
      'Damage scales with form mastery',
      'Enemies weak to that specific form',
      'Complete all forms to unlock ultimate form',
      'Zenith form: 10x power multiplier when maxed'
    ]
  },
  {
    id: 'celestial_trials',
    name: 'Celestial Trials',
    description: 'Battle the original celestial beings in their true forms. For expert players only.',
    icon: '🌟',
    unlockRequirement: 'Beat Void King 5 times',
    difficulty: 'godlike',
    rewards: {
      xpPerRun: 15000,
      currencyPerRun: 7000,
      specialDrops: ['Celestial Essence', 'Infinity Stone', 'Game-Changing Artifacts']
    },
    mechanics: [
      'Celestial beings from other games appear',
      'Each trial is unique multi-phase fight',
      'True form transformations cannot be used',
      'Puzzle elements mixed with combat',
      'Completing all unlocks secret ending'
    ]
  },
  {
    id: 'void_king_rematch',
    name: 'Void King Rematch (Ultra)',
    description: 'Face the Void King again with enhanced power. Hardest challenge in the game.',
    icon: '⚫',
    unlockRequirement: 'Beat Void King on godlike difficulty',
    difficulty: 'godlike',
    rewards: {
      xpPerRun: 20000,
      currencyPerRun: 10000,
      specialDrops: ['Void Core Prime', 'Reality Fragment', 'Ultimate Power']
    },
    mechanics: [
      'Void King has 6 phases instead of 4',
      'Uses attacks from all previous bosses',
      'Terrain constantly shifts',
      'Requires perfect team composition',
      'Beating on ultimate unlocks post-game ending'
    ]
  }
];

export function getEndgameModeById(id: string): EndgameMode | undefined {
  return ENDGAME_MODES.find(m => m.id === id);
}

export function getUnlockedModes(progressLevel: number): EndgameMode[] {
  const progressionMap: { [key: number]: string[] } = {
    3: ['rift_gauntlet'],
    5: ['rift_gauntlet', 'omega_boss_raids'],
    6: ['rift_gauntlet', 'omega_boss_raids', 'harmonarch_trials'],
    7: ['rift_gauntlet', 'omega_boss_raids', 'harmonarch_trials', 'legacy_echo', 'time_paradox'],
    9: ENDGAME_MODES.map(m => m.id)
  };

  const unlockedIds = progressionMap[progressLevel] || [];
  return ENDGAME_MODES.filter(m => unlockedIds.includes(m.id));
}
