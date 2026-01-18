/**
 * OMEGA PROTOCOL: BORYX ZENITH MOVE SET
 * 
 * The Guardian King - Draconic Ursine (Dragon-Bear)
 * 
 * Archetype: Anchor / Terrain Authority
 * Philosophy: "Boryx does not win by speed or tricks. Boryx wins by deciding 
 *              where the fight is allowed to exist."
 * 
 * Playstyle:
 * - Heaviest character in roster
 * - Reality Pin Zones reduce knockback and slow movement
 * - Wide arcs, massive damage, deliberate pace
 * - Super armor on key moves
 * 
 * Core Mechanic: Reality Pin
 * - Certain moves "pin" space, reducing knockback and movement variance inside a radius
 * - Opponents feel heavier, slower, less certain
 * - Pin zones decay aggressively and cannot overlap
 */

import { AttackData, FrameData, HitboxData } from '@beast-kin/shared';

export interface BoryxMove extends AttackData {
  realityPin?: {
    radius: number;
    strength: number;
    duration: number;
  };
  superArmor?: {
    startFrame: number;
    endFrame: number;
    damageReduction: number;
  };
  groundShake?: boolean;
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

export function createBoryxZenithMoveSet(): Map<string, BoryxMove> {
  const moves = new Map<string, BoryxMove>();

  // ========== JAB COMBO (SLOW BUT POWERFUL) ==========
  moves.set('jab', {
    id: 'jab',
    name: 'Guardian Strike',
    type: 'normal',
    damage: 5,
    knockbackAngle: 40,
    knockbackBase: 30,
    knockbackGrowth: 8,
    frameData: {
      startup: 8,
      active: 4,
      recovery: 14,
      hitstun: 16,
      hitlag: 6,
      shieldstun: 8,
    },
    hitboxes: [
      { id: 'jab_hit', type: 'hitbox', x: 1.0, y: 0.5, width: 0.8, height: 0.6 },
    ],
    trinityGain: { synergy: 2, resonance: 1 },
    cancelFlags: {},
  });

  moves.set('jab_2', {
    id: 'jab_2',
    name: 'Warden Fist',
    type: 'normal',
    damage: 6,
    knockbackAngle: 45,
    knockbackBase: 35,
    knockbackGrowth: 10,
    frameData: {
      startup: 7,
      active: 4,
      recovery: 16,
      hitstun: 18,
      hitlag: 7,
      shieldstun: 9,
    },
    hitboxes: [
      { id: 'jab2_hit', type: 'hitbox', x: 1.1, y: 0.5, width: 0.9, height: 0.7 },
    ],
    trinityGain: { synergy: 3, resonance: 1 },
    cancelFlags: {},
  });

  moves.set('jab_3', {
    id: 'jab_3',
    name: 'Earth Breaker',
    type: 'normal',
    damage: 12,
    knockbackAngle: 35,
    knockbackBase: 70,
    knockbackGrowth: 20,
    frameData: {
      startup: 12,
      active: 5,
      recovery: 26,
      hitstun: 24,
      hitlag: 12,
      shieldstun: 16,
    },
    hitboxes: [
      { id: 'jab3_hit', type: 'hitbox', x: 1.2, y: 0.4, width: 1.2, height: 0.9 },
    ],
    groundShake: true,
    trinityGain: { synergy: 5, resonance: 3 },
    cancelFlags: {},
  });

  // ========== TILT ATTACKS ==========
  moves.set('ftilt', {
    id: 'ftilt',
    name: 'Anchor Swipe',
    type: 'tilt',
    damage: 13,
    knockbackAngle: 38,
    knockbackBase: 55,
    knockbackGrowth: 25,
    frameData: {
      startup: 12,
      active: 6,
      recovery: 22,
      hitstun: 20,
      hitlag: 8,
      shieldstun: 12,
    },
    hitboxes: [
      { id: 'ftilt_hit', type: 'hitbox', x: 1.4, y: 0.4, width: 1.4, height: 0.7 },
    ],
    realityPin: {
      radius: 2.0,
      strength: 0.3,
      duration: 90, // 1.5 seconds
    },
    trinityGain: { synergy: 4, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('utilt', {
    id: 'utilt',
    name: 'Sky Anchor',
    type: 'tilt',
    damage: 11,
    knockbackAngle: 85,
    knockbackBase: 50,
    knockbackGrowth: 24,
    frameData: {
      startup: 10,
      active: 7,
      recovery: 20,
      hitstun: 18,
      hitlag: 7,
      shieldstun: 10,
    },
    hitboxes: [
      { id: 'utilt_hit', type: 'hitbox', x: 0.3, y: 1.2, width: 1.2, height: 1.3 },
    ],
    trinityGain: { synergy: 3, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('dtilt', {
    id: 'dtilt',
    name: 'Stone Sweep',
    type: 'tilt',
    damage: 10,
    knockbackAngle: 20,
    knockbackBase: 40,
    knockbackGrowth: 18,
    frameData: {
      startup: 9,
      active: 5,
      recovery: 18,
      hitstun: 16,
      hitlag: 6,
      shieldstun: 9,
    },
    hitboxes: [
      { id: 'dtilt_hit', type: 'hitbox', x: 1.1, y: -0.1, width: 1.3, height: 0.4 },
    ],
    groundShake: true,
    trinityGain: { synergy: 3, resonance: 2 },
    cancelFlags: {},
  });

  // ========== SMASH ATTACKS (DEVASTATING) ==========
  moves.set('fsmash', {
    id: 'fsmash',
    name: 'Tectonic Slam',
    type: 'smash',
    damage: 24,
    knockbackAngle: 40,
    knockbackBase: 90,
    knockbackGrowth: 55,
    frameData: {
      startup: 22,
      active: 5,
      recovery: 38,
      hitstun: 32,
      hitlag: 18,
      shieldstun: 24,
    },
    hitboxes: [
      { id: 'fsmash_hit', type: 'hitbox', x: 1.6, y: 0.3, width: 1.5, height: 1.0 },
    ],
    superArmor: {
      startFrame: 8,
      endFrame: 18,
      damageReduction: 0.5,
    },
    groundShake: true,
    realityPin: {
      radius: 3.0,
      strength: 0.5,
      duration: 120,
    },
    trinityGain: { synergy: 8, resonance: 5 },
    cancelFlags: {},
  });

  moves.set('usmash', {
    id: 'usmash',
    name: 'Chaos Pillar',
    type: 'smash',
    damage: 20,
    knockbackAngle: 90,
    knockbackBase: 80,
    knockbackGrowth: 50,
    frameData: {
      startup: 16,
      active: 8,
      recovery: 34,
      hitstun: 30,
      hitlag: 15,
      shieldstun: 20,
    },
    hitboxes: [
      { id: 'usmash_hit', type: 'hitbox', x: 0.2, y: 1.4, width: 1.4, height: 1.6 },
    ],
    superArmor: {
      startFrame: 6,
      endFrame: 14,
      damageReduction: 0.4,
    },
    groundShake: true,
    trinityGain: { synergy: 7, resonance: 5 },
    cancelFlags: {},
  });

  moves.set('dsmash', {
    id: 'dsmash',
    name: 'Seismic Divide',
    type: 'smash',
    damage: 18,
    knockbackAngle: 30,
    knockbackBase: 75,
    knockbackGrowth: 45,
    frameData: {
      startup: 18,
      active: 6,
      recovery: 36,
      hitstun: 28,
      hitlag: 14,
      shieldstun: 18,
    },
    hitboxes: [
      { id: 'dsmash_front', type: 'hitbox', x: 1.3, y: 0.1, width: 1.4, height: 0.6 },
      { id: 'dsmash_back', type: 'hitbox', x: -1.3, y: 0.1, width: 1.4, height: 0.6 },
    ],
    groundShake: true,
    realityPin: {
      radius: 4.0,
      strength: 0.4,
      duration: 100,
    },
    trinityGain: { synergy: 7, resonance: 4 },
    cancelFlags: {},
  });

  // ========== AERIAL ATTACKS ==========
  moves.set('nair', {
    id: 'nair',
    name: 'Guardian Barrier',
    type: 'aerial',
    damage: 12,
    knockbackAngle: 50,
    knockbackBase: 45,
    knockbackGrowth: 18,
    frameData: {
      startup: 9,
      active: 14,
      recovery: 16,
      hitstun: 17,
      hitlag: 6,
      shieldstun: 10,
      landingLag: 12,
      autocancel: { early: 7, late: 23 },
    },
    hitboxes: [
      { id: 'nair_hit', type: 'hitbox', x: 0, y: 0.3, width: 1.6, height: 1.5 },
    ],
    trinityGain: { synergy: 4, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('fair', {
    id: 'fair',
    name: 'Draconic Claw',
    type: 'aerial',
    damage: 15,
    knockbackAngle: 38,
    knockbackBase: 60,
    knockbackGrowth: 28,
    frameData: {
      startup: 14,
      active: 5,
      recovery: 22,
      hitstun: 22,
      hitlag: 10,
      shieldstun: 14,
      landingLag: 16,
      autocancel: { early: 10, late: 31 },
    },
    hitboxes: [
      { id: 'fair_hit', type: 'hitbox', x: 1.5, y: 0.2, width: 1.2, height: 0.9 },
    ],
    trinityGain: { synergy: 5, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('bair', {
    id: 'bair',
    name: 'Ursine Crush',
    type: 'aerial',
    damage: 17,
    knockbackAngle: 35,
    knockbackBase: 70,
    knockbackGrowth: 32,
    frameData: {
      startup: 12,
      active: 4,
      recovery: 20,
      hitstun: 24,
      hitlag: 12,
      shieldstun: 16,
      landingLag: 14,
      autocancel: { early: 8, late: 26 },
    },
    hitboxes: [
      { id: 'bair_hit', type: 'hitbox', x: -1.4, y: 0.2, width: 1.1, height: 0.8 },
    ],
    trinityGain: { synergy: 6, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('uair', {
    id: 'uair',
    name: 'Zenith Strike',
    type: 'aerial',
    damage: 14,
    knockbackAngle: 80,
    knockbackBase: 55,
    knockbackGrowth: 26,
    frameData: {
      startup: 10,
      active: 6,
      recovery: 18,
      hitstun: 20,
      hitlag: 8,
      shieldstun: 12,
      landingLag: 12,
      autocancel: { early: 6, late: 24 },
    },
    hitboxes: [
      { id: 'uair_hit', type: 'hitbox', x: 0.1, y: 1.3, width: 1.3, height: 1.0 },
    ],
    trinityGain: { synergy: 5, resonance: 3 },
    cancelFlags: {},
  });

  moves.set('dair', {
    id: 'dair',
    name: 'Earth Dive',
    type: 'aerial',
    damage: 18,
    knockbackAngle: -90,
    knockbackBase: 60,
    knockbackGrowth: 35,
    frameData: {
      startup: 18,
      active: 5,
      recovery: 28,
      hitstun: 26,
      hitlag: 15,
      shieldstun: 18,
      landingLag: 22,
      autocancel: { early: 14, late: 43 },
    },
    hitboxes: [
      { id: 'dair_hit', type: 'hitbox', x: 0.2, y: -1.0, width: 1.0, height: 1.0 },
    ],
    groundShake: true,
    superArmor: {
      startFrame: 10,
      endFrame: 18,
      damageReduction: 0.3,
    },
    trinityGain: { synergy: 6, resonance: 4 },
    cancelFlags: {},
  });

  // ========== SPECIAL MOVES ==========
  moves.set('neutral_special', {
    id: 'neutral_special',
    name: 'Chaos Star',
    type: 'special',
    damage: 12,
    knockbackAngle: 45,
    knockbackBase: 50,
    knockbackGrowth: 20,
    frameData: {
      startup: 20,
      active: 30, // Projectile duration
      recovery: 28,
      hitstun: 18,
      hitlag: 8,
      shieldstun: 12,
    },
    hitboxes: [
      { id: 'chaos_star', type: 'hitbox', x: 2.0, y: 0.4, width: 0.6, height: 0.6 },
    ],
    trinityGain: { synergy: 4, resonance: 2 },
    cancelFlags: {},
    // Throws chaos-infused source star projectile
  });

  moves.set('side_special', {
    id: 'side_special',
    name: 'Aero Rush',
    type: 'special',
    damage: 14,
    knockbackAngle: 40,
    knockbackBase: 60,
    knockbackGrowth: 22,
    frameData: {
      startup: 16,
      active: 20,
      recovery: 24,
      hitstun: 20,
      hitlag: 10,
      shieldstun: 14,
    },
    hitboxes: [
      { id: 'aero_rush', type: 'hitbox', x: 1.0, y: 0.4, width: 1.2, height: 1.0 },
    ],
    superArmor: {
      startFrame: 8,
      endFrame: 28,
      damageReduction: 0.4,
    },
    trinityGain: { synergy: 5, resonance: 3 },
    cancelFlags: {},
    // Cape-assisted rush with super armor
  });

  moves.set('up_special', {
    id: 'up_special',
    name: 'Draconic Rise',
    type: 'special',
    damage: 10,
    knockbackAngle: 75,
    knockbackBase: 40,
    knockbackGrowth: 15,
    frameData: {
      startup: 10,
      active: 25,
      recovery: 35,
      hitstun: 15,
      hitlag: 6,
      shieldstun: 8,
    },
    hitboxes: [
      { id: 'rise_hit', type: 'hitbox', x: 0, y: 0.5, width: 1.4, height: 1.4 },
    ],
    superArmor: {
      startFrame: 4,
      endFrame: 12,
      damageReduction: 0.6,
    },
    trinityGain: { synergy: 3, resonance: 2 },
    cancelFlags: {},
  });

  moves.set('down_special', {
    id: 'down_special',
    name: "Guardian's Wrath",
    type: 'special',
    damage: 20,
    knockbackAngle: 70,
    knockbackBase: 50,
    knockbackGrowth: 25,
    frameData: {
      startup: 25,
      active: 8,
      recovery: 40,
      hitstun: 28,
      hitlag: 20,
      shieldstun: 22,
    },
    hitboxes: [
      { id: 'wrath_hit', type: 'hitbox', x: 0, y: 0.2, width: 3.0, height: 0.6 },
    ],
    groundShake: true,
    superArmor: {
      startFrame: 10,
      endFrame: 30,
      damageReduction: 0.7,
    },
    realityPin: {
      radius: 5.0,
      strength: 0.6,
      duration: 180,
    },
    trinityGain: { synergy: 10, resonance: 8, dread: 5 },
    cancelFlags: {},
    // Ground pound creates 15m shockwave (20% damage + stun)
  });

  return moves;
}

export const BORYX_ZENITH_CHARACTER_DATA = {
  id: 'boryx-zenith',
  name: 'Boryx Zenith',
  displayName: 'BORYX ZENITH, The Guardian King',
  description: 'The heaviest hitter. Draconic Ursine with chaos-infused source star.',
  
  // Base stats - SUPER HEAVYWEIGHT
  weight: 120,
  walkSpeed: 0.9,
  runSpeed: 1.4,
  airSpeed: 0.85,
  jumpHeight: 11,
  airJumps: 1,
  fallSpeed: 1.8,
  fastFallSpeed: 2.6,
  gravity: 0.11,
  
  // Combat identity
  archetype: 'ANCHOR_CONTROLLER',
  strengths: ['Kill power', 'Super armor', 'Reality control', 'Survivability'],
  weaknesses: ['Slow', 'Easy to combo', 'Limited recovery', 'Gets camped'],
  
  // Trinity affinity
  trinityAffinity: {
    synergy: 0.7,    // Lower synergy gain (slow pace)
    resonance: 1.3,  // High resonance (control mastery)
    dread: 0.5,      // Very low dread (unshakeable)
  },
  
  // Transformation tier
  transformations: ['boryx_guardian_king'],
};
