/**
 * OMEGA PROTOCOL: UMBRA-FLUX MOVE SET
 * 
 * The Velocity Wraith - Celestial Lupine with 5 Elemental Tails
 * 
 * Archetype: Speed and theft, outruns consequence
 * Philosophy: "Umbra-Flux wins by speed and theft"
 * 
 * Playstyle:
 * - Fastest character in the roster
 * - Glass cannon - high offense, lower defense
 * - After-image attacks and clone mechanics
 * - 3-frame startup on signature moves
 * 
 * Five Tail Strands:
 * - Blue: Sonic velocity - light-speed after-images
 * - Red: Shadow chaos control - teleportation anchors
 * - Cyan: Silver psychokinesis - object manipulation
 * - Violet: Hypersonic distortion - time slow radius
 * - Gold: Celestial authority - reality anchor
 */

import { AttackData, FrameData, HitboxData } from '@beast-kin/shared';

export interface UmbraFluxMove extends AttackData {
  tailElement?: 'blue' | 'red' | 'cyan' | 'violet' | 'gold' | 'all';
  afterImage?: boolean;
  teleportAnchor?: boolean;
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

export function createUmbraFluxMoveSet(): Map<string, UmbraFluxMove> {
  const moves = new Map<string, UmbraFluxMove>();

  // ========== JAB COMBO (LIGHTNING FAST) ==========
  moves.set('jab', {
    id: 'jab',
    name: 'Flicker Strike',
    type: 'normal',
    damage: 2,
    knockbackAngle: 30,
    knockbackBase: 15,
    knockbackGrowth: 3,
    frameData: {
      startup: 3, // Frame 3 startup - the fastest
      active: 2,
      recovery: 6,
      hitstun: 8,
      hitlag: 2,
      shieldstun: 4,
    },
    hitboxes: [
      { id: 'jab_hit', type: 'hitbox', x: 0.7, y: 0.5, width: 0.5, height: 0.3 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 3 },
    cancelFlags: { dash: true, jump: true, special: true },
  });

  moves.set('jab_2', {
    id: 'jab_2',
    name: 'Static Decay',
    type: 'normal',
    damage: 2,
    knockbackAngle: 35,
    knockbackBase: 18,
    knockbackGrowth: 4,
    frameData: {
      startup: 2,
      active: 2,
      recovery: 5,
      hitstun: 8,
      hitlag: 2,
      shieldstun: 4,
    },
    hitboxes: [
      { id: 'jab2_hit', type: 'hitbox', x: 0.8, y: 0.5, width: 0.5, height: 0.3 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 3 },
    cancelFlags: { dash: true, jump: true, special: true },
  });

  moves.set('jab_rapid', {
    id: 'jab_rapid',
    name: 'Velocity Barrage',
    type: 'normal',
    damage: 1, // Per hit, rapid multi-hit
    knockbackAngle: 30,
    knockbackBase: 10,
    knockbackGrowth: 2,
    frameData: {
      startup: 2,
      active: 60, // Long active for rapid hits
      recovery: 8,
      hitstun: 4,
      hitlag: 1,
      shieldstun: 2,
    },
    hitboxes: [
      { id: 'jab_rapid_hit', type: 'hitbox', x: 0.8, y: 0.5, width: 0.6, height: 0.4 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 1 }, // Per hit
    cancelFlags: {},
  });

  // ========== TILT ATTACKS ==========
  moves.set('ftilt', {
    id: 'ftilt',
    name: 'Chaos Slash',
    type: 'tilt',
    damage: 7,
    knockbackAngle: 35,
    knockbackBase: 35,
    knockbackGrowth: 15,
    frameData: {
      startup: 5,
      active: 3,
      recovery: 12,
      hitstun: 14,
      hitlag: 4,
      shieldstun: 7,
    },
    hitboxes: [
      { id: 'ftilt_hit', type: 'hitbox', x: 1.0, y: 0.4, width: 0.9, height: 0.4 },
    ],
    tailElement: 'red',
    afterImage: true,
    trinityGain: { synergy: 4 },
    cancelFlags: { dash: true, onHitOnly: true },
  });

  moves.set('utilt', {
    id: 'utilt',
    name: 'Psycho Lift',
    type: 'tilt',
    damage: 8,
    knockbackAngle: 80,
    knockbackBase: 40,
    knockbackGrowth: 18,
    frameData: {
      startup: 4,
      active: 4,
      recovery: 14,
      hitstun: 15,
      hitlag: 4,
      shieldstun: 8,
    },
    hitboxes: [
      { id: 'utilt_hit', type: 'hitbox', x: 0.2, y: 0.9, width: 0.7, height: 0.9 },
    ],
    tailElement: 'cyan',
    trinityGain: { synergy: 4, resonance: 1 },
    cancelFlags: { jump: true, onHitOnly: true },
  });

  moves.set('dtilt', {
    id: 'dtilt',
    name: 'Shadow Slide',
    type: 'tilt',
    damage: 6,
    knockbackAngle: 20,
    knockbackBase: 25,
    knockbackGrowth: 12,
    frameData: {
      startup: 4,
      active: 3,
      recovery: 10,
      hitstun: 12,
      hitlag: 3,
      shieldstun: 5,
    },
    hitboxes: [
      { id: 'dtilt_hit', type: 'hitbox', x: 0.8, y: -0.1, width: 0.9, height: 0.25 },
    ],
    tailElement: 'red',
    afterImage: true,
    trinityGain: { synergy: 4 },
    cancelFlags: { dash: true, special: true },
  });

  // ========== SMASH ATTACKS ==========
  moves.set('fsmash', {
    id: 'fsmash',
    name: 'Stellar Burst',
    type: 'smash',
    damage: 14,
    knockbackAngle: 38,
    knockbackBase: 70,
    knockbackGrowth: 38,
    frameData: {
      startup: 10,
      active: 3,
      recovery: 26,
      hitstun: 24,
      hitlag: 10,
      shieldstun: 14,
    },
    hitboxes: [
      { id: 'fsmash_hit', type: 'hitbox', x: 1.3, y: 0.4, width: 1.0, height: 0.7 },
    ],
    tailElement: 'gold',
    afterImage: true,
    trinityGain: { synergy: 7, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('usmash', {
    id: 'usmash',
    name: 'Hypersonic Column',
    type: 'smash',
    damage: 13,
    knockbackAngle: 90,
    knockbackBase: 65,
    knockbackGrowth: 36,
    frameData: {
      startup: 8,
      active: 5,
      recovery: 24,
      hitstun: 22,
      hitlag: 8,
      shieldstun: 12,
    },
    hitboxes: [
      { id: 'usmash_hit', type: 'hitbox', x: 0.1, y: 1.0, width: 0.9, height: 1.1 },
    ],
    tailElement: 'violet',
    trinityGain: { synergy: 6, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('dsmash', {
    id: 'dsmash',
    name: 'Chaos Split',
    type: 'smash',
    damage: 12,
    knockbackAngle: 25,
    knockbackBase: 55,
    knockbackGrowth: 32,
    frameData: {
      startup: 6,
      active: 4,
      recovery: 22,
      hitstun: 20,
      hitlag: 8,
      shieldstun: 11,
    },
    hitboxes: [
      { id: 'dsmash_front', type: 'hitbox', x: 0.9, y: 0.1, width: 0.8, height: 0.4 },
      { id: 'dsmash_back', type: 'hitbox', x: -0.9, y: 0.1, width: 0.8, height: 0.4 },
    ],
    tailElement: 'red',
    afterImage: true,
    teleportAnchor: true,
    trinityGain: { synergy: 6, resonance: 1 },
    cancelFlags: {},
  });

  // ========== AERIAL ATTACKS ==========
  moves.set('nair', {
    id: 'nair',
    name: 'Velocity Spin',
    type: 'aerial',
    damage: 9,
    knockbackAngle: 45,
    knockbackBase: 35,
    knockbackGrowth: 14,
    frameData: {
      startup: 4,
      active: 10,
      recovery: 10,
      hitstun: 12,
      hitlag: 4,
      shieldstun: 6,
      landingLag: 6,
      autocancel: { early: 3, late: 14 },
    },
    hitboxes: [
      { id: 'nair_hit', type: 'hitbox', x: 0, y: 0.3, width: 1.2, height: 1.2 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 4 },
    cancelFlags: {},
  });

  moves.set('fair', {
    id: 'fair',
    name: 'Sonic Drill',
    type: 'aerial',
    damage: 3, // Multi-hit
    knockbackAngle: 35,
    knockbackBase: 20,
    knockbackGrowth: 10,
    frameData: {
      startup: 5,
      active: 15, // Multi-hit duration
      recovery: 14,
      hitstun: 10,
      hitlag: 2,
      shieldstun: 4,
      landingLag: 8,
      autocancel: { early: 4, late: 20 },
    },
    hitboxes: [
      { id: 'fair_hit', type: 'hitbox', x: 1.1, y: 0.2, width: 0.7, height: 0.6 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 2 }, // Per hit
    cancelFlags: {},
  });

  moves.set('bair', {
    id: 'bair',
    name: 'Chaos Heel',
    type: 'aerial',
    damage: 12,
    knockbackAngle: 32,
    knockbackBase: 55,
    knockbackGrowth: 25,
    frameData: {
      startup: 6,
      active: 3,
      recovery: 12,
      hitstun: 18,
      hitlag: 7,
      shieldstun: 10,
      landingLag: 8,
      autocancel: { early: 4, late: 15 },
    },
    hitboxes: [
      { id: 'bair_hit', type: 'hitbox', x: -1.1, y: 0.2, width: 0.8, height: 0.5 },
    ],
    tailElement: 'red',
    trinityGain: { synergy: 5, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('uair', {
    id: 'uair',
    name: 'Psychic Flip',
    type: 'aerial',
    damage: 10,
    knockbackAngle: 75,
    knockbackBase: 45,
    knockbackGrowth: 20,
    frameData: {
      startup: 5,
      active: 4,
      recovery: 12,
      hitstun: 14,
      hitlag: 5,
      shieldstun: 8,
      landingLag: 7,
      autocancel: { early: 3, late: 13 },
    },
    hitboxes: [
      { id: 'uair_hit', type: 'hitbox', x: 0.1, y: 1.0, width: 0.9, height: 0.7 },
    ],
    tailElement: 'cyan',
    trinityGain: { synergy: 4, resonance: 1 },
    cancelFlags: {},
  });

  moves.set('dair', {
    id: 'dair',
    name: 'Dive Bomb',
    type: 'aerial',
    damage: 11,
    knockbackAngle: -85,
    knockbackBase: 50,
    knockbackGrowth: 22,
    frameData: {
      startup: 8,
      active: 30, // Stall-then-fall
      recovery: 18,
      hitstun: 18,
      hitlag: 8,
      shieldstun: 12,
      landingLag: 14,
      autocancel: { early: 6, late: 38 },
    },
    hitboxes: [
      { id: 'dair_hit', type: 'hitbox', x: 0.1, y: -0.7, width: 0.7, height: 0.7 },
    ],
    tailElement: 'violet',
    afterImage: true,
    trinityGain: { synergy: 5, resonance: 2 },
    cancelFlags: {},
  });

  // ========== SPECIAL MOVES ==========
  moves.set('neutral_special', {
    id: 'neutral_special',
    name: 'Homing Attack',
    type: 'special',
    damage: 10,
    knockbackAngle: 45,
    knockbackBase: 45,
    knockbackGrowth: 18,
    frameData: {
      startup: 12,
      active: 60, // Homing duration
      recovery: 20,
      hitstun: 16,
      hitlag: 6,
      shieldstun: 10,
    },
    hitboxes: [
      { id: 'homing_hit', type: 'hitbox', x: 0.5, y: 0.3, width: 0.8, height: 0.8 },
    ],
    tailElement: 'blue',
    afterImage: true,
    trinityGain: { synergy: 5 },
    cancelFlags: {},
  });

  moves.set('side_special', {
    id: 'side_special',
    name: 'Chaos Control',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 6,
      active: 1,
      recovery: 15,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailElement: 'red',
    teleportAnchor: true,
    trinityGain: { synergy: 2, resonance: 3 },
    cancelFlags: { special: true },
    // Teleport to anchor or create new anchor
  });

  moves.set('up_special', {
    id: 'up_special',
    name: 'Hypersonic Rise',
    type: 'special',
    damage: 8,
    knockbackAngle: 70,
    knockbackBase: 30,
    knockbackGrowth: 12,
    frameData: {
      startup: 5,
      active: 25,
      recovery: 28,
      hitstun: 12,
      hitlag: 4,
      shieldstun: 6,
    },
    hitboxes: [
      { id: 'up_b_hit', type: 'hitbox', x: 0, y: 0.4, width: 1.0, height: 1.0 },
    ],
    tailElement: 'violet',
    afterImage: true,
    trinityGain: { synergy: 3 },
    cancelFlags: {},
  });

  moves.set('down_special', {
    id: 'down_special',
    name: 'Stellar Cascade',
    type: 'special',
    damage: 5, // Per clone hit
    knockbackAngle: 40,
    knockbackBase: 25,
    knockbackGrowth: 10,
    frameData: {
      startup: 20,
      active: 180, // Clone duration
      recovery: 30,
      hitstun: 12,
      hitlag: 3,
      shieldstun: 5,
    },
    hitboxes: [],
    tailElement: 'all',
    afterImage: true,
    trinityGain: { resonance: -50 }, // Costs 50% resonance
    cancelFlags: {},
    // Creates 7 psychokinetic clones that mirror attacks
  });

  return moves;
}

export const UMBRA_FLUX_CHARACTER_DATA = {
  id: 'umbra-flux',
  name: 'Umbra-Flux',
  displayName: 'UMBRA-FLUX, The Velocity Wraith',
  description: 'The fastest beast in existence. 5 elemental tails channel pure speed.',
  
  // Base stats - SPEED DEMON
  weight: 72,
  walkSpeed: 1.6,
  runSpeed: 2.4, // Fastest in game
  airSpeed: 1.5,
  jumpHeight: 15,
  airJumps: 1,
  fallSpeed: 1.8,
  fastFallSpeed: 2.8,
  gravity: 0.088,
  
  // Combat identity
  archetype: 'SPEED_GLASS_CANNON',
  strengths: ['Frame data', 'Mobility', 'Combo speed', 'Mix-ups'],
  weaknesses: ['Light weight', 'Lower kill power', 'Reads punished hard'],
  
  // Trinity affinity
  trinityAffinity: {
    synergy: 1.4,    // Excellent synergy gain (aggressive)
    resonance: 0.8,  // Lower resonance gain
    dread: 1.1,      // Higher dread (high risk)
  },
  
  // Transformation tier
  transformations: ['umbra_flux_velocity_wraith'],
};
