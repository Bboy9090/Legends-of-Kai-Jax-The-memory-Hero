/**
 * OMEGA PROTOCOL: KAI-JAX MOVE SET
 * 
 * The Archive King - Star-Slime Chimera with 3 Memory Strand Tails
 * 
 * Archetype: Memory manipulation, authority-based control
 * Philosophy: "Kai-Jax wins by control and inevitability"
 * 
 * Playstyle:
 * - Slower startup, heavier commitment than speed characters
 * - Wide arcs, space denial, high resonance gain
 * - Memory Strand abilities allow timeline manipulation
 * 
 * Three Tail Strands:
 * - Jax Strand (Velocity/Liquid Ink): Hard-light echoes, after-images
 * - Kai Strand (Shielding/Ink Smoke): Solid-state barriers, web-tethers
 * - Father's Strand (Anchor): Prevents reality collapse, legacy power
 */

import { AttackData, FrameData, HitboxData } from '@beast-kin/shared';

export interface KaiJaxMove extends AttackData {
  strandType?: 'jax' | 'kai' | 'father' | 'combined';
  memoryEcho?: boolean;
  trinityGain?: {
    synergy?: number;
    resonance?: number;
    dread?: number;
  };
  cancelFlags?: {
    dash?: boolean;
    jump?: boolean;
    special?: boolean;
    onHitOnly?: boolean;
    onWhiffOnly?: boolean;
  };
}

export function createKaiJaxMoveSet(): Map<string, KaiJaxMove> {
  const moves = new Map<string, KaiJaxMove>();

  // ========== JAB COMBO ==========
  moves.set('jab', {
    id: 'jab',
    name: 'Memory Strike',
    type: 'normal',
    damage: 3,
    knockbackAngle: 45,
    knockbackBase: 20,
    knockbackGrowth: 5,
    frameData: {
      startup: 5,
      active: 3,
      recovery: 10,
      hitstun: 12,
      hitlag: 4,
      shieldstun: 6,
    },
    hitboxes: [
      { id: 'jab_hit', type: 'hitbox', x: 0.8, y: 0.5, width: 0.6, height: 0.4 },
    ],
    strandType: 'jax',
    trinityGain: { synergy: 2 },
    cancelFlags: { dash: true, jump: true, onHitOnly: true },
  });

  moves.set('jab_2', {
    id: 'jab_2',
    name: 'Echo Strike',
    type: 'normal',
    damage: 4,
    knockbackAngle: 60,
    knockbackBase: 25,
    knockbackGrowth: 6,
    frameData: {
      startup: 4,
      active: 3,
      recovery: 12,
      hitstun: 14,
      hitlag: 4,
      shieldstun: 7,
    },
    hitboxes: [
      { id: 'jab2_hit', type: 'hitbox', x: 0.9, y: 0.5, width: 0.7, height: 0.45 },
    ],
    strandType: 'jax',
    memoryEcho: true,
    trinityGain: { synergy: 3 },
    cancelFlags: { dash: true, jump: true, onHitOnly: true },
  });

  moves.set('jab_3', {
    id: 'jab_3',
    name: 'Archive Seal',
    type: 'normal',
    damage: 8,
    knockbackAngle: 30,
    knockbackBase: 60,
    knockbackGrowth: 15,
    frameData: {
      startup: 8,
      active: 4,
      recovery: 20,
      hitstun: 20,
      hitlag: 8,
      shieldstun: 12,
    },
    hitboxes: [
      { id: 'jab3_hit', type: 'hitbox', x: 1.0, y: 0.5, width: 0.9, height: 0.6 },
    ],
    strandType: 'combined',
    memoryEcho: true,
    trinityGain: { synergy: 5, resonance: 2 },
    cancelFlags: {},
  });

  // ========== TILT ATTACKS ==========
  moves.set('ftilt', {
    id: 'ftilt',
    name: 'Strand Lash',
    type: 'tilt',
    damage: 10,
    knockbackAngle: 40,
    knockbackBase: 50,
    knockbackGrowth: 20,
    frameData: {
      startup: 9,
      active: 5,
      recovery: 18,
      hitstun: 18,
      hitlag: 6,
      shieldstun: 10,
    },
    hitboxes: [
      { id: 'ftilt_hit', type: 'hitbox', x: 1.2, y: 0.4, width: 1.1, height: 0.5 },
    ],
    strandType: 'jax',
    trinityGain: { synergy: 4 },
    cancelFlags: { special: true, onHitOnly: true },
  });

  moves.set('utilt', {
    id: 'utilt',
    name: 'Archive Column',
    type: 'tilt',
    damage: 9,
    knockbackAngle: 85,
    knockbackBase: 45,
    knockbackGrowth: 22,
    frameData: {
      startup: 7,
      active: 6,
      recovery: 16,
      hitstun: 16,
      hitlag: 5,
      shieldstun: 9,
    },
    hitboxes: [
      { id: 'utilt_hit', type: 'hitbox', x: 0.3, y: 1.0, width: 0.8, height: 1.0 },
    ],
    strandType: 'kai',
    trinityGain: { synergy: 3, resonance: 2 },
    cancelFlags: { jump: true, onHitOnly: true },
  });

  moves.set('dtilt', {
    id: 'dtilt',
    name: 'Memory Sweep',
    type: 'tilt',
    damage: 7,
    knockbackAngle: 25,
    knockbackBase: 30,
    knockbackGrowth: 15,
    frameData: {
      startup: 6,
      active: 4,
      recovery: 14,
      hitstun: 14,
      hitlag: 4,
      shieldstun: 7,
    },
    hitboxes: [
      { id: 'dtilt_hit', type: 'hitbox', x: 0.9, y: -0.1, width: 1.0, height: 0.3 },
    ],
    strandType: 'jax',
    trinityGain: { synergy: 3 },
    cancelFlags: { dash: true, onHitOnly: true },
  });

  // ========== SMASH ATTACKS ==========
  moves.set('fsmash', {
    id: 'fsmash',
    name: 'Chronicle Slam',
    type: 'smash',
    damage: 18,
    knockbackAngle: 35,
    knockbackBase: 80,
    knockbackGrowth: 45,
    frameData: {
      startup: 16,
      active: 4,
      recovery: 32,
      hitstun: 28,
      hitlag: 12,
      shieldstun: 18,
    },
    hitboxes: [
      { id: 'fsmash_hit', type: 'hitbox', x: 1.4, y: 0.5, width: 1.2, height: 0.8 },
    ],
    strandType: 'combined',
    memoryEcho: true,
    trinityGain: { synergy: 8, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('usmash', {
    id: 'usmash',
    name: 'Archive Pillar',
    type: 'smash',
    damage: 16,
    knockbackAngle: 88,
    knockbackBase: 70,
    knockbackGrowth: 42,
    frameData: {
      startup: 12,
      active: 6,
      recovery: 28,
      hitstun: 26,
      hitlag: 10,
      shieldstun: 16,
    },
    hitboxes: [
      { id: 'usmash_hit', type: 'hitbox', x: 0.2, y: 1.2, width: 1.0, height: 1.2 },
    ],
    strandType: 'father',
    trinityGain: { synergy: 6, resonance: 4 },
    cancelFlags: {},
  });

  moves.set('dsmash', {
    id: 'dsmash',
    name: 'Memory Quake',
    type: 'smash',
    damage: 15,
    knockbackAngle: 30,
    knockbackBase: 65,
    knockbackGrowth: 40,
    frameData: {
      startup: 14,
      active: 5,
      recovery: 30,
      hitstun: 24,
      hitlag: 10,
      shieldstun: 14,
    },
    hitboxes: [
      { id: 'dsmash_front', type: 'hitbox', x: 1.0, y: 0.1, width: 1.1, height: 0.5 },
      { id: 'dsmash_back', type: 'hitbox', x: -1.0, y: 0.1, width: 1.1, height: 0.5 },
    ],
    strandType: 'combined',
    memoryEcho: true,
    trinityGain: { synergy: 7, resonance: 2 },
    cancelFlags: {},
  });

  // ========== AERIAL ATTACKS ==========
  moves.set('nair', {
    id: 'nair',
    name: 'Strand Spiral',
    type: 'aerial',
    damage: 11,
    knockbackAngle: 50,
    knockbackBase: 40,
    knockbackGrowth: 18,
    frameData: {
      startup: 6,
      active: 12,
      recovery: 14,
      hitstun: 15,
      hitlag: 5,
      shieldstun: 8,
      landingLag: 8,
      autocancel: { early: 5, late: 18 },
    },
    hitboxes: [
      { id: 'nair_hit', type: 'hitbox', x: 0, y: 0.3, width: 1.4, height: 1.4 },
    ],
    strandType: 'jax',
    memoryEcho: true,
    trinityGain: { synergy: 4 },
    cancelFlags: {},
  });

  moves.set('fair', {
    id: 'fair',
    name: 'Chronicle Arc',
    type: 'aerial',
    damage: 13,
    knockbackAngle: 40,
    knockbackBase: 55,
    knockbackGrowth: 25,
    frameData: {
      startup: 10,
      active: 4,
      recovery: 18,
      hitstun: 18,
      hitlag: 7,
      shieldstun: 10,
      landingLag: 12,
      autocancel: { early: 8, late: 22 },
    },
    hitboxes: [
      { id: 'fair_hit', type: 'hitbox', x: 1.3, y: 0.3, width: 1.0, height: 0.8 },
    ],
    strandType: 'kai',
    trinityGain: { synergy: 5, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('bair', {
    id: 'bair',
    name: 'Anchor Kick',
    type: 'aerial',
    damage: 14,
    knockbackAngle: 35,
    knockbackBase: 60,
    knockbackGrowth: 28,
    frameData: {
      startup: 8,
      active: 3,
      recovery: 16,
      hitstun: 20,
      hitlag: 8,
      shieldstun: 12,
      landingLag: 10,
      autocancel: { early: 6, late: 19 },
    },
    hitboxes: [
      { id: 'bair_hit', type: 'hitbox', x: -1.2, y: 0.3, width: 0.9, height: 0.6 },
    ],
    strandType: 'father',
    trinityGain: { synergy: 5, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('uair', {
    id: 'uair',
    name: 'Memory Ascent',
    type: 'aerial',
    damage: 12,
    knockbackAngle: 80,
    knockbackBase: 50,
    knockbackGrowth: 24,
    frameData: {
      startup: 7,
      active: 5,
      recovery: 15,
      hitstun: 16,
      hitlag: 6,
      shieldstun: 9,
      landingLag: 9,
      autocancel: { early: 5, late: 17 },
    },
    hitboxes: [
      { id: 'uair_hit', type: 'hitbox', x: 0.1, y: 1.1, width: 1.0, height: 0.8 },
    ],
    strandType: 'kai',
    trinityGain: { synergy: 4, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('dair', {
    id: 'dair',
    name: 'Archive Meteor',
    type: 'aerial',
    damage: 15,
    knockbackAngle: -80,
    knockbackBase: 55,
    knockbackGrowth: 30,
    frameData: {
      startup: 14,
      active: 4,
      recovery: 22,
      hitstun: 22,
      hitlag: 10,
      shieldstun: 14,
      landingLag: 16,
      autocancel: { early: 10, late: 26 },
    },
    hitboxes: [
      { id: 'dair_hit', type: 'hitbox', x: 0.2, y: -0.8, width: 0.8, height: 0.8 },
    ],
    strandType: 'father',
    trinityGain: { synergy: 6, resonance: 3 },
    cancelFlags: {},
  });

  // ========== SPECIAL MOVES ==========
  moves.set('neutral_special', {
    id: 'neutral_special',
    name: 'Memory Rewind',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 15,
      active: 1,
      recovery: 35,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    strandType: 'combined',
    memoryEcho: true,
    trinityGain: { resonance: -30 }, // Costs 30% resonance
    cancelFlags: {},
    // Special: Rewinds personal timeline 3 seconds
  });

  moves.set('side_special', {
    id: 'side_special',
    name: 'Strand Tether',
    type: 'special',
    damage: 8,
    knockbackAngle: 45,
    knockbackBase: 40,
    knockbackGrowth: 12,
    frameData: {
      startup: 12,
      active: 25,
      recovery: 18,
      hitstun: 15,
      hitlag: 5,
      shieldstun: 8,
    },
    hitboxes: [
      { id: 'tether_hit', type: 'hitbox', x: 2.0, y: 0.3, width: 0.4, height: 0.4 },
    ],
    strandType: 'kai',
    trinityGain: { synergy: 4, resonance: 3 },
    cancelFlags: { jump: true },
    // Special: Web-tether to any point, can pull or swing
  });

  moves.set('up_special', {
    id: 'up_special',
    name: 'Chronicle Burst',
    type: 'special',
    damage: 6,
    knockbackAngle: 75,
    knockbackBase: 35,
    knockbackGrowth: 15,
    frameData: {
      startup: 8,
      active: 20,
      recovery: 30,
      hitstun: 12,
      hitlag: 4,
      shieldstun: 6,
    },
    hitboxes: [
      { id: 'up_b_hit', type: 'hitbox', x: 0, y: 0.5, width: 1.2, height: 1.2 },
    ],
    strandType: 'jax',
    memoryEcho: true,
    trinityGain: { synergy: 3 },
    cancelFlags: {},
    // Recovery move with invincibility
  });

  moves.set('down_special', {
    id: 'down_special',
    name: 'Archive Counter',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 5,
      active: 20,
      recovery: 25,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    strandType: 'father',
    trinityGain: { resonance: 15 }, // Gain 15% resonance on successful counter
    cancelFlags: {},
    // Counter: Reflects 1.3x damage on success
  });

  return moves;
}

export const KAI_JAX_CHARACTER_DATA = {
  id: 'kai-jax',
  name: 'Kai-Jax',
  displayName: 'KAI-JAX, The Memory Hero',
  description: 'The Archive King! Star-Slime Chimera with 3 Memory Strand Tails.',
  
  // Base stats
  weight: 85,
  walkSpeed: 1.2,
  runSpeed: 1.8,
  airSpeed: 1.1,
  jumpHeight: 14,
  airJumps: 1,
  fallSpeed: 1.6,
  fastFallSpeed: 2.4,
  gravity: 0.098,
  
  // Combat identity
  archetype: 'CONTROL_AUTHORITY',
  strengths: ['Space control', 'Combo extension', 'Edge guarding', 'Memory manipulation'],
  weaknesses: ['Slower startup', 'Commitment heavy', 'Linear recovery'],
  
  // Trinity affinity
  trinityAffinity: {
    synergy: 0.8,    // Good synergy gain
    resonance: 1.2,  // Excellent resonance gain (defensive mastery)
    dread: 0.6,      // Low dread accumulation (stays calm)
  },
  
  // Transformation tier
  transformations: ['kai_jax_awakening', 'kai_jax_apex'],
};
