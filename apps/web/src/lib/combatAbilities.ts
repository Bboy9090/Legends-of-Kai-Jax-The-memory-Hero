/**
 * Combat Abilities Expansion System
 * Enhanced move sets, ultimate abilities, and combo mechanics for Wave 2
 */

export type AbilityType =
  | 'basic_attack'
  | 'special_attack'
  | 'dash'
  | 'throw'
  | 'counter'
  | 'ultimate'
  | 'transformation';

export interface ComboMove {
  id: string;
  inputSequence: string[]; // e.g., ["light", "light", "heavy"]
  name: string;
  description: string;
  damage: number;
  knockback: number;
  hitFrames: [number, number]; // [start, end] frames
  recovery: number; // frames of recovery after
  comboBonus: number; // damage % bonus when part of combo
}

export interface UltimateAbility {
  id: string;
  name: string;
  description: string;
  maxCharge: number; // 0-100
  chargeRate: number; // charge per hit landed
  damage: number;
  hitRadius: number;
  invulnerabilityFrames: number;
  cooldown: number; // seconds
  animation: string;
  vfxKey: string;
}

export interface MoveSet {
  fighterId: string;
  basicAttacks: ComboMove[];
  specialMoves: ComboMove[];
  dash: ComboMove;
  throws: ComboMove[];
  counters: ComboMove[];
  ultimate: UltimateAbility;
  combos: ComboMove[]; // advanced multi-hit combos
}

// KAI-JAX EXPANDED MOVE SET
export const KAI_JAX_MOVESET: MoveSet = {
  fighterId: 'kai-jax',
  basicAttacks: [
    {
      id: 'kj_light_1',
      inputSequence: ['light'],
      name: 'Memory Slice',
      description: 'Quick slash that archives the hit',
      damage: 12,
      knockback: 1.5,
      hitFrames: [4, 6],
      recovery: 8,
      comboBonus: 0,
    },
    {
      id: 'kj_light_2',
      inputSequence: ['light', 'light'],
      name: 'Archive Cascade',
      description: 'Two-hit quick combo',
      damage: 20,
      knockback: 2,
      hitFrames: [4, 8],
      recovery: 10,
      comboBonus: 5,
    },
    {
      id: 'kj_heavy_1',
      inputSequence: ['heavy'],
      name: 'Void Crush',
      description: 'Heavy strike with knockdown potential',
      damage: 28,
      knockback: 4,
      hitFrames: [6, 9],
      recovery: 16,
      comboBonus: 0,
    },
  ],

  specialMoves: [
    {
      id: 'kj_special_1',
      inputSequence: ['special', 'forward'],
      name: 'Nine-Tail Whip',
      description: 'Extended range attack using all tails',
      damage: 22,
      knockback: 3,
      hitFrames: [8, 14],
      recovery: 14,
      comboBonus: 8,
    },
    {
      id: 'kj_special_2',
      inputSequence: ['special', 'up'],
      name: 'Memory Ascent',
      description: 'Rise while striking, gains air advantage',
      damage: 18,
      knockback: 2.5,
      hitFrames: [6, 12],
      recovery: 12,
      comboBonus: 6,
    },
    {
      id: 'kj_special_3',
      inputSequence: ['special', 'down'],
      name: 'Archive Lock',
      description: 'Ground slam that slows opponent',
      damage: 20,
      knockback: 3.5,
      hitFrames: [8, 11],
      recovery: 18,
      comboBonus: 10,
    },
  ],

  dash: {
    id: 'kj_dash',
    inputSequence: ['dash'],
    name: 'Void Phase',
    description: 'Quick dash with invulnerability frames',
    damage: 0,
    knockback: 0,
    hitFrames: [0, 0],
    recovery: 6,
    comboBonus: 0,
  },

  throws: [
    {
      id: 'kj_throw_1',
      inputSequence: ['grab'],
      name: 'Memory Toss',
      description: 'Grab and throw opponent',
      damage: 16,
      knockback: 5,
      hitFrames: [5, 8],
      recovery: 12,
      comboBonus: 0,
    },
  ],

  counters: [
    {
      id: 'kj_counter_1',
      inputSequence: ['counter'],
      name: 'Archive Rewind',
      description: 'Counter incoming attack and strike back',
      damage: 24,
      knockback: 3,
      hitFrames: [8, 11],
      recovery: 10,
      comboBonus: 15,
    },
  ],

  ultimate: {
    id: 'kj_ultimate',
    name: 'Memory Convergence',
    description: 'All nine tails converge for massive damage',
    maxCharge: 100,
    chargeRate: 15, // 15% per hit landed
    damage: 60,
    hitRadius: 12,
    invulnerabilityFrames: 30,
    cooldown: 20,
    animation: 'kj_ultimate_convergence',
    vfxKey: 'memory_convergence_nova',
  },

  combos: [
    {
      id: 'kj_combo_1',
      inputSequence: ['light', 'light', 'heavy'],
      name: '3-Hit Memory Barrage',
      description: 'Archive cascade into void crush',
      damage: 60,
      knockback: 4,
      hitFrames: [4, 23],
      recovery: 18,
      comboBonus: 20,
    },
    {
      id: 'kj_combo_2',
      inputSequence: ['heavy', 'special'],
      name: 'Void Execution',
      description: 'Crushing blow followed by nine-tail sweep',
      damage: 50,
      knockback: 5,
      hitFrames: [6, 20],
      recovery: 20,
      comboBonus: 25,
    },
  ],
};

// KAISON EXPANDED MOVE SET
export const KAISON_MOVESET: MoveSet = {
  fighterId: 'kaison',
  basicAttacks: [
    {
      id: 'kai_light_1',
      inputSequence: ['light'],
      name: 'Quick Strike',
      description: 'Fast tactical strike',
      damage: 11,
      knockback: 1.2,
      hitFrames: [3, 5],
      recovery: 7,
      comboBonus: 0,
    },
    {
      id: 'kai_heavy_1',
      inputSequence: ['heavy'],
      name: 'Ember Blast',
      description: 'Powerful fire-infused strike',
      damage: 26,
      knockback: 3.5,
      hitFrames: [6, 9],
      recovery: 15,
      comboBonus: 0,
    },
  ],

  specialMoves: [
    {
      id: 'kai_special_1',
      inputSequence: ['special', 'forward'],
      name: 'Star Web Net',
      description: 'Launch web to trap and damage',
      damage: 20,
      knockback: 2,
      hitFrames: [8, 12],
      recovery: 12,
      comboBonus: 7,
    },
    {
      id: 'kai_special_2',
      inputSequence: ['special', 'up'],
      name: 'Aerial Escape',
      description: 'Dash upward with fire trails',
      damage: 15,
      knockback: 2,
      hitFrames: [5, 10],
      recovery: 10,
      comboBonus: 5,
    },
  ],

  dash: {
    id: 'kai_dash',
    inputSequence: ['dash'],
    name: 'Fox Dash',
    description: 'Quick dash with fire effect',
    damage: 0,
    knockback: 0,
    hitFrames: [0, 0],
    recovery: 5,
    comboBonus: 0,
  },

  throws: [
    {
      id: 'kai_throw_1',
      inputSequence: ['grab'],
      name: 'Ember Throw',
      description: 'Grab and throw with flame damage',
      damage: 18,
      knockback: 4.5,
      hitFrames: [5, 8],
      recovery: 11,
      comboBonus: 0,
    },
  ],

  counters: [
    {
      id: 'kai_counter_1',
      inputSequence: ['counter'],
      name: 'Ember Guard',
      description: 'Counter with protective fire shield',
      damage: 22,
      knockback: 2.5,
      hitFrames: [7, 10],
      recovery: 9,
      comboBonus: 12,
    },
  ],

  ultimate: {
    id: 'kai_ultimate',
    name: 'Star Force Eruption',
    description: 'Massive star-powered explosion',
    maxCharge: 100,
    chargeRate: 12,
    damage: 55,
    hitRadius: 10,
    invulnerabilityFrames: 25,
    cooldown: 18,
    animation: 'kai_ultimate_eruption',
    vfxKey: 'star_force_explosion',
  },

  combos: [
    {
      id: 'kai_combo_1',
      inputSequence: ['light', 'heavy'],
      name: 'Star Strike Chain',
      description: 'Quick strike into heavy blow',
      damage: 37,
      knockback: 3,
      hitFrames: [3, 15],
      recovery: 14,
      comboBonus: 15,
    },
  ],
};

// JAXON EXPANDED MOVE SET
export const JAXON_MOVESET: MoveSet = {
  fighterId: 'jaxon',
  basicAttacks: [
    {
      id: 'jax_light_1',
      inputSequence: ['light'],
      name: 'Quill Strike',
      description: 'Fast quill-based attack',
      damage: 13,
      knockback: 1.3,
      hitFrames: [3, 6],
      recovery: 8,
      comboBonus: 0,
    },
    {
      id: 'jax_heavy_1',
      inputSequence: ['heavy'],
      name: 'Thunder Crush',
      description: 'Powerful electrified strike',
      damage: 27,
      knockback: 3.8,
      hitFrames: [6, 9],
      recovery: 16,
      comboBonus: 0,
    },
  ],

  specialMoves: [
    {
      id: 'jax_special_1',
      inputSequence: ['special', 'forward'],
      name: 'Speed Blitz',
      description: 'Rapid dashing strikes',
      damage: 24,
      knockback: 2.2,
      hitFrames: [4, 14],
      recovery: 11,
      comboBonus: 8,
    },
    {
      id: 'jax_special_2',
      inputSequence: ['special', 'down'],
      name: 'Ground Quake',
      description: 'Slam the ground with electric shockwave',
      damage: 19,
      knockback: 3.2,
      hitFrames: [8, 11],
      recovery: 15,
      comboBonus: 9,
    },
  ],

  dash: {
    id: 'jax_dash',
    inputSequence: ['dash'],
    name: 'Thunder Dash',
    description: 'Quick dash with electrified trail',
    damage: 0,
    knockback: 0,
    hitFrames: [0, 0],
    recovery: 6,
    comboBonus: 0,
  },

  throws: [
    {
      id: 'jax_throw_1',
      inputSequence: ['grab'],
      name: 'Thunder Toss',
      description: 'Grab and throw with electricity',
      damage: 17,
      knockback: 4.2,
      hitFrames: [5, 8],
      recovery: 12,
      comboBonus: 0,
    },
  ],

  counters: [
    {
      id: 'jax_counter_1',
      inputSequence: ['counter'],
      name: 'Electric Rebound',
      description: 'Counter with stunning retaliation',
      damage: 23,
      knockback: 2.8,
      hitFrames: [7, 10],
      recovery: 10,
      comboBonus: 13,
    },
  ],

  ultimate: {
    id: 'jax_ultimate',
    name: 'Thunder Torrent',
    description: 'Unleash a storm of lightning strikes',
    maxCharge: 100,
    chargeRate: 14,
    damage: 58,
    hitRadius: 11,
    invulnerabilityFrames: 28,
    cooldown: 19,
    animation: 'jax_ultimate_torrent',
    vfxKey: 'thunder_storm',
  },

  combos: [
    {
      id: 'jax_combo_1',
      inputSequence: ['light', 'light', 'heavy'],
      name: 'Quill Burst',
      description: 'Triple quill strike ending in thunder crush',
      damage: 53,
      knockback: 3.5,
      hitFrames: [3, 21],
      recovery: 16,
      comboBonus: 18,
    },
  ],
};

// Exported move sets indexed by fighter ID
export const MOVESET_INDEX: Record<string, MoveSet> = {
  'kai-jax': KAI_JAX_MOVESET,
  kaison: KAISON_MOVESET,
  jaxon: JAXON_MOVESET,
};

/**
 * Get move set for a fighter
 */
export function getMoveSet(fighterId: string): MoveSet | null {
  return MOVESET_INDEX[fighterId] || null;
}

/**
 * Get all moves for a fighter (flattened)
 */
export function getAllMoves(fighterId: string) {
  const moveSet = getMoveSet(fighterId);
  if (!moveSet) return [];

  return [
    moveSet.dash,
    ...moveSet.basicAttacks,
    ...moveSet.specialMoves,
    ...moveSet.throws,
    ...moveSet.counters,
    ...moveSet.combos,
  ];
}

/**
 * Calculate combo damage multiplier based on hit count
 */
export function getComboMultiplier(hitCount: number): number {
  if (hitCount < 2) return 1.0;
  if (hitCount < 5) return 1.1 + hitCount * 0.05; // 1.15 at 2 hits, 1.3 at 5 hits
  return 1.4 + (hitCount - 5) * 0.02; // caps at ~1.5 at 10 hits
}
