import { AttackData, HitboxType } from '@smash-heroes/shared';

/**
 * Kaxon (Fusion) Move Set
 * The ultimate fusion of Kaison and Jaxon
 * Combines fox agility with hedgehog speed
 * Features 3 tails and enhanced power
 */

export function createKaxonMoveSet() {
  const attacks = new Map<string, AttackData>();
  const specialMoves = new Map<string, AttackData>();
  const aerialMoves = new Map<string, AttackData>();

  // ========== FUSION LIGHT ATTACKS ==========
  attacks.set('jab', {
    name: 'Triple Tail Jab',
    damage: 6,
    knockback: 4,
    angle: 45,
    hitstun: 10,
    startup: 2,
    active: 4,
    recovery: 5,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_2', {
    name: 'Fusion Spin Strike',
    damage: 8,
    knockback: 6,
    angle: 50,
    hitstun: 12,
    startup: 2,
    active: 5,
    recovery: 6,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_3', {
    name: 'Triple Tail Finisher',
    damage: 12,
    knockback: 15,
    angle: 65,
    hitstun: 20,
    startup: 3,
    active: 6,
    recovery: 10,
    hitboxType: HitboxType.GROUND,
  });

  // ========== FUSION HEAVY ATTACKS ==========
  attacks.set('heavy_forward', {
    name: 'Fusion Dash Strike',
    damage: 20,
    knockback: 25,
    angle: 40,
    hitstun: 28,
    startup: 10,
    active: 8,
    recovery: 16,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_up', {
    name: 'Spiral Uppercut',
    damage: 22,
    knockback: 30,
    angle: 85,
    hitstun: 30,
    startup: 12,
    active: 10,
    recovery: 18,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_down', {
    name: 'Triple Tail Sweep',
    damage: 18,
    knockback: 22,
    angle: 30,
    hitstun: 25,
    startup: 9,
    active: 7,
    recovery: 15,
    hitboxType: HitboxType.GROUND,
  });

  // ========== FUSION AERIAL ATTACKS ==========
  aerialMoves.set('nair', {
    name: 'Fusion Spin',
    damage: 15,
    knockback: 12,
    angle: 45,
    hitstun: 18,
    startup: 3,
    active: 10, // Multi-hit with 3 tails
    recovery: 10,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('fair', {
    name: 'Triple Tail Slash',
    damage: 18,
    knockback: 18,
    angle: 35,
    hitstun: 22,
    startup: 6,
    active: 6,
    recovery: 12,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('bair', {
    name: 'Reverse Fusion Kick',
    damage: 19,
    knockback: 20,
    angle: 140,
    hitstun: 24,
    startup: 5,
    active: 7,
    recovery: 13,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('dair', {
    name: 'Meteor Spin',
    damage: 17,
    knockback: 16,
    angle: 270, // Meteor smash
    hitstun: 20,
    startup: 9,
    active: 14,
    recovery: 16,
    hitboxType: HitboxType.AERIAL,
  });

  // ========== FUSION SPECIAL MOVES ==========
  specialMoves.set('neutral_special', {
    name: 'Fusion Blaster Barrage',
    damage: 24,
    knockback: 18,
    angle: 45,
    hitstun: 25,
    startup: 15,
    active: 30,
    recovery: 20,
    hitboxType: HitboxType.PROJECTILE,
  });

  specialMoves.set('side_special', {
    name: 'Hyper Fusion Dash',
    damage: 28,
    knockback: 35,
    angle: 40,
    hitstun: 32,
    startup: 18,
    active: 12,
    recovery: 22,
    hitboxType: HitboxType.GROUND,
  });

  specialMoves.set('up_special', {
    name: 'Triple Tail Tornado',
    damage: 25,
    knockback: 28,
    angle: 80,
    hitstun: 28,
    startup: 8,
    active: 20, // Multi-hit
    recovery: 18,
    hitboxType: HitboxType.AERIAL,
  });

  specialMoves.set('down_special', {
    name: 'Fusion Counter Burst',
    damage: 30,
    knockback: 40,
    angle: 90,
    hitstun: 35,
    startup: 6,
    active: 40,
    recovery: 12,
    hitboxType: HitboxType.COUNTER,
  });

  // ========== ULTIMATE ATTACK ==========
  specialMoves.set('ultimate', {
    name: 'FUSION ULTIMATE: Chaos Rift',
    damage: 50,
    knockback: 60,
    angle: 45,
    hitstun: 50,
    startup: 30,
    active: 60,
    recovery: 40,
    hitboxType: HitboxType.GROUND,
  });

  return {
    attacks,
    specialMoves,
    aerialMoves,
    grabs: new Map(),
  };
}
