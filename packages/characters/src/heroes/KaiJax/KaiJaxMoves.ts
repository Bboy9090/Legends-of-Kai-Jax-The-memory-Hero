/**
 * AUTHORITATIVE: KAI-JAX MOVE SET
 * 
 * Based on kai_jax.character.json (LOCKFILE)
 * 
 * The Memory Hero - Wolf/Fox/Hedgehog/Spider Hybrid with 9 Tails
 * 
 * Archetype: Stance-shifting battlefield controller
 * Philosophy: "Mass, inertia, and recovery matter"
 * 
 * Combat Identity:
 * - Scales from 1v1 to 1v20+ without rule changes
 * - Strengths: Crowd control, posture break, zone dominance
 * - Weaknesses: Overextension, corruption overuse
 * 
 * Nine Tails:
 * 1. Bond: Parry/Counter/Revive
 * 2. Hunter: Dash/Pursuit/Execute
 * 3. Thread: Web/Pull/Group
 * 4. Quill: Retaliation/Posture Damage
 * 5. Shade: Stealth/Threat Reset
 * 6. Anchor: Anti-Knockback/Root
 * 7. Echo: After-Image/Repeat
 * 8. Rift: Reality Tear/AOE
 * 9. Crown: Aura/Command
 * 
 * Animation Rules:
 * - Minimum 12 frames per action
 * - Cancel rules: Hit confirm or perfect parry only
 * - No floaty motion
 */

import { AttackData } from '@beast-kin/shared';

// Extended frame data for detailed move properties
export interface FrameData {
  startup: number;
  active: number;
  recovery: number;
  hitstun: number;
  hitlag: number;
  shieldstun: number;
  landingLag?: number;
  autocancel?: { early: number; late: number };
}

// Hitbox data for attack collision
export interface HitboxData {
  id: string;
  type: 'hitbox' | 'hurtbox' | 'grabbox';
  x: number;
  y: number;
  width: number;
  height: number;
}

// Kai-Jax specific move data
export interface KaiJaxMove {
  id: string;
  name: string;
  type: 'normal' | 'tilt' | 'smash' | 'aerial' | 'special';
  damage: number;
  knockbackAngle: number;
  knockbackBase: number;
  knockbackGrowth: number;
  frameData: FrameData;
  hitboxes: HitboxData[];
  tailRole?: 'bond' | 'hunter' | 'thread' | 'quill' | 'shade' | 'anchor' | 'echo' | 'rift' | 'crown';
  combatProperty?: 'crowd_control' | 'posture_break' | 'zone_dominance';
  postureBreak?: number; // Amount of posture damage dealt
  corruptionCost?: number; // Corruption gained from using ability
  zoneRadius?: number; // Area of effect in meters
  scalesWithEnemies?: boolean; // Scales from 1v1 to 1v20+
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
      startup: 6,
      active: 3,
      recovery: 12, // Min 12 frames per action
      hitstun: 12,
      hitlag: 4,
      shieldstun: 6,
    },
    hitboxes: [
      { id: 'jab_hit', type: 'hitbox', x: 0.8, y: 0.5, width: 0.6, height: 0.4 },
    ],
    tailRole: 'bond',
    cancelFlags: { dash: true, jump: true, onHitOnly: true }, // Hit confirm only
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
      startup: 5,
      active: 3,
      recovery: 12,
      hitstun: 14,
      hitlag: 4,
      shieldstun: 7,
    },
    hitboxes: [
      { id: 'jab2_hit', type: 'hitbox', x: 0.9, y: 0.5, width: 0.7, height: 0.45 },
    ],
    tailRole: 'echo',
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
    tailRole: 'crown',
    postureBreak: 15,
    combatProperty: 'posture_break',
    cancelFlags: {},
  });

  // ========== TILT ATTACKS ==========
  moves.set('ftilt', {
    id: 'ftilt',
    name: 'Thread Lash',
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
    tailRole: 'thread',
    combatProperty: 'zone_dominance',
    zoneRadius: 2.5,
    cancelFlags: { special: true, onHitOnly: true },
  });

  moves.set('utilt', {
    id: 'utilt',
    name: 'Crown Ascent',
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
    tailRole: 'crown',
    combatProperty: 'crowd_control',
    cancelFlags: { jump: true, onHitOnly: true },
  });

  moves.set('dtilt', {
    id: 'dtilt',
    name: 'Hunter Sweep',
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
    tailRole: 'hunter',
    cancelFlags: { dash: true, onHitOnly: true },
  });

  // ========== SMASH ATTACKS ==========
  moves.set('fsmash', {
    id: 'fsmash',
    name: 'Quill Barrage',
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
    tailRole: 'quill',
    combatProperty: 'posture_break',
    postureBreak: 30,
    cancelFlags: {},
  });

  moves.set('usmash', {
    id: 'usmash',
    name: 'Rift Pillar',
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
    tailRole: 'rift',
    combatProperty: 'zone_dominance',
    zoneRadius: 3.0,
    cancelFlags: {},
  });

  moves.set('dsmash', {
    id: 'dsmash',
    name: 'Anchor Quake',
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
    tailRole: 'anchor',
    combatProperty: 'crowd_control',
    scalesWithEnemies: true,
    cancelFlags: {},
  });

  // ========== AERIAL ATTACKS ==========
  moves.set('nair', {
    id: 'nair',
    name: 'Echo Spiral',
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
    tailRole: 'echo',
    combatProperty: 'zone_dominance',
    cancelFlags: {},
  });

  moves.set('fair', {
    id: 'fair',
    name: 'Thread Arc',
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
    tailRole: 'thread',
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
    tailRole: 'anchor',
    cancelFlags: {},
  });

  moves.set('uair', {
    id: 'uair',
    name: 'Crown Ascent',
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
    tailRole: 'crown',
    cancelFlags: {},
  });

  moves.set('dair', {
    id: 'dair',
    name: 'Rift Meteor',
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
    tailRole: 'rift',
    combatProperty: 'zone_dominance',
    cancelFlags: {},
  });

  // ========== SPECIAL MOVES - 9 TAIL SYSTEM ==========
  
  // Neutral Special: Bond Tail - Parry/Counter/Revive
  moves.set('neutral_special', {
    id: 'neutral_special',
    name: 'Bond Parry',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 12,
      active: 24, // Parry window
      recovery: 28,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailRole: 'bond',
    combatProperty: 'posture_break',
    cancelFlags: {},
    // Special: Successful parry leads to counter with 1.5x damage
  });

  // Side Special: Thread Tail - Web/Pull/Group
  moves.set('side_special', {
    id: 'side_special',
    name: 'Thread Web',
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
      { id: 'thread_hit', type: 'hitbox', x: 2.0, y: 0.3, width: 0.4, height: 0.4 },
    ],
    tailRole: 'thread',
    combatProperty: 'crowd_control',
    scalesWithEnemies: true, // Can pull multiple enemies
    zoneRadius: 4.0,
    cancelFlags: { jump: true },
    // Special: Web-tether to enemies, can pull or group them
  });

  // Up Special: Hunter Tail - Dash/Pursuit/Execute
  moves.set('up_special', {
    id: 'up_special',
    name: 'Hunter Dash',
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
      { id: 'hunter_hit', type: 'hitbox', x: 0, y: 0.5, width: 1.2, height: 1.2 },
    ],
    tailRole: 'hunter',
    cancelFlags: {},
    // Recovery move with pursuit capability
  });

  // Down Special: Shade Tail - Stealth/Threat Reset
  moves.set('down_special', {
    id: 'down_special',
    name: 'Shade Cloak',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 12,
      active: 30, // Stealth duration
      recovery: 20,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailRole: 'shade',
    corruptionCost: 10, // Corruption gained from use
    cancelFlags: {},
    // Special: Stealth mode, resets enemy threat
  });

  return moves;
}

// ========== TAIL-SPECIFIC ABILITIES ==========
// Additional functions for the remaining tails

/**
 * Quill Tail: Retaliation/Posture Damage
 * Passive retaliation when hit
 */
export function createQuillRetaliation(): KaiJaxMove {
  return {
    id: 'quill_retaliation',
    name: 'Quill Retaliation',
    type: 'special',
    damage: 5,
    knockbackAngle: 90,
    knockbackBase: 30,
    knockbackGrowth: 10,
    frameData: {
      startup: 3, // Very fast retaliation
      active: 2,
      recovery: 8,
      hitstun: 10,
      hitlag: 3,
      shieldstun: 5,
    },
    hitboxes: [
      { id: 'quill_hit', type: 'hitbox', x: 0, y: 0.5, width: 1.5, height: 1.5 },
    ],
    tailRole: 'quill',
    combatProperty: 'posture_break',
    postureBreak: 20,
  };
}

/**
 * Anchor Tail: Anti-Knockback/Root
 * Prevents knockback when active
 */
export function createAnchorRoot(): KaiJaxMove {
  return {
    id: 'anchor_root',
    name: 'Anchor Root',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 8,
      active: 60, // Long duration
      recovery: 15,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailRole: 'anchor',
    corruptionCost: 5,
    // Special: Prevents all knockback, roots in place
  };
}

/**
 * Echo Tail: After-Image/Repeat
 * Creates after-images that repeat last action
 */
export function createEchoImage(): KaiJaxMove {
  return {
    id: 'echo_image',
    name: 'Echo After-Image',
    type: 'special',
    damage: 0, // Echo deals damage of repeated move
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 10,
      active: 1,
      recovery: 20,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailRole: 'echo',
    corruptionCost: 15,
    // Special: Creates after-image that repeats last attack
  };
}

/**
 * Rift Tail: Reality Tear/AOE
 * Creates AOE zone that damages over time
 */
export function createRiftTear(): KaiJaxMove {
  return {
    id: 'rift_tear',
    name: 'Reality Rift',
    type: 'special',
    damage: 20, // Total damage over duration
    knockbackAngle: 90,
    knockbackBase: 60,
    knockbackGrowth: 30,
    frameData: {
      startup: 20, // Slow startup
      active: 60, // Long lasting AOE
      recovery: 40,
      hitstun: 25,
      hitlag: 12,
      shieldstun: 15,
    },
    hitboxes: [
      { id: 'rift_zone', type: 'hitbox', x: 0, y: 0, width: 4.0, height: 4.0 },
    ],
    tailRole: 'rift',
    combatProperty: 'zone_dominance',
    zoneRadius: 4.0,
    scalesWithEnemies: true,
    corruptionCost: 25, // High corruption cost
  };
}

/**
 * Crown Tail: Aura/Command
 * Buffs allies and debuffs enemies in radius
 */
export function createCrownAura(): KaiJaxMove {
  return {
    id: 'crown_aura',
    name: 'Crown Command',
    type: 'special',
    damage: 0,
    knockbackAngle: 0,
    knockbackBase: 0,
    knockbackGrowth: 0,
    frameData: {
      startup: 15,
      active: 120, // Long lasting aura
      recovery: 25,
      hitstun: 0,
      hitlag: 0,
      shieldstun: 0,
    },
    hitboxes: [],
    tailRole: 'crown',
    combatProperty: 'crowd_control',
    zoneRadius: 6.0, // Large aura radius
    scalesWithEnemies: true,
    corruptionCost: 20,
  };
}

export const KAI_JAX_CHARACTER_DATA = {
  id: 'kai_jax',
  name: 'Kai-Jax',
  displayName: 'Kai-Jax, The Memory Hero',
  description: 'Wolf/Fox/Hedgehog/Spider hybrid with 9 independent tails. Stance-shifting battlefield controller.',
  
  // Base stats aligned with JSON spec
  weight: 95, // Medium-heavy for crowd control
  walkSpeed: 1.15,
  runSpeed: 1.75,
  airSpeed: 1.05,
  jumpHeight: 13.5,
  airJumps: 1,
  fallSpeed: 1.65,
  fastFallSpeed: 2.5,
  gravity: 0.098,
  
  // Combat identity from JSON
  archetype: 'STANCE_SHIFTING_BATTLEFIELD_CONTROLLER',
  strengths: ['Crowd control', 'Posture break', 'Zone dominance'],
  weaknesses: ['Overextension', 'Corruption overuse'],
  
  // Scales from 1v1 to 1v20+
  scalesFrom: '1v1',
  scalesTo: '1v20_plus',
  
  // 9 Tail System
  tailCount: 9,
  tails: [
    { index: 1, name: 'Bond', function: 'parry_counter_revive' },
    { index: 2, name: 'Hunter', function: 'dash_pursuit_execute' },
    { index: 3, name: 'Thread', function: 'web_pull_group' },
    { index: 4, name: 'Quill', function: 'retaliation_posture_damage' },
    { index: 5, name: 'Shade', function: 'stealth_threat_reset' },
    { index: 6, name: 'Anchor', function: 'anti_knockback_root' },
    { index: 7, name: 'Echo', function: 'after_image_repeat' },
    { index: 8, name: 'Rift', function: 'reality_tear_aoe' },
    { index: 9, name: 'Crown', function: 'aura_command' },
  ],
  
  // Anatomy from JSON
  anatomy: {
    speciesComposite: ['wolf', 'fox', 'hedgehog', 'spider'],
    bodyType: 'humanoid_beast',
    heightMultiplier: 1.15,
    build: 'athletic_sinewy_predator',
    legs: 'digitigrade',
  },
  
  // Animation philosophy from JSON
  animationPhilosophy: 'mass_and_inertia',
  noFloatyMotion: true,
  minFramesPerAction: 12,
  cancelRules: 'hit_confirm_or_perfect_parry_only',
};
