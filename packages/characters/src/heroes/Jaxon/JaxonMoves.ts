import { AttackData, HitboxType } from '@smash-heroes/shared';

/**
 * Jaxon (Hedgehog) Move Set
 * A speed-focused fighter with spin attacks and momentum mechanics
 */

export function createJaxonMoveSet() {
  const attacks = new Map<string, AttackData>();
  const specialMoves = new Map<string, AttackData>();
  const aerialMoves = new Map<string, AttackData>();

  // ========== LIGHT ATTACKS ==========
  attacks.set('jab', {
    name: 'Spin Jab',
    damage: 4,
    knockback: 2,
    angle: 45,
    hitstun: 7,
    startup: 2, // Very fast
    active: 3,
    recovery: 5,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_2', {
    name: 'Spin Jab 2',
    damage: 5,
    knockback: 3,
    angle: 50,
    hitstun: 9,
    startup: 2,
    active: 3,
    recovery: 6,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_3', {
    name: 'Spin Uppercut',
    damage: 7,
    knockback: 10,
    angle: 75,
    hitstun: 16,
    startup: 3,
    active: 5,
    recovery: 10,
    hitboxType: HitboxType.GROUND,
  });

  // ========== HEAVY ATTACKS ==========
  attacks.set('heavy_forward', {
    name: 'Spin Dash Strike',
    damage: 15,
    knockback: 18,
    angle: 40,
    hitstun: 22,
    startup: 10,
    active: 8,
    recovery: 16,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_up', {
    name: 'Rising Spin',
    damage: 13,
    knockback: 20,
    angle: 85,
    hitstun: 20,
    startup: 9,
    active: 7,
    recovery: 15,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_down', {
    name: 'Spin Sweep',
    damage: 11,
    knockback: 14,
    angle: 25,
    hitstun: 18,
    startup: 7,
    active: 6,
    recovery: 13,
    hitboxType: HitboxType.GROUND,
  });

  // ========== AERIAL ATTACKS ==========
  aerialMoves.set('nair', {
    name: 'Air Spin',
    damage: 9,
    knockback: 7,
    angle: 45,
    hitstun: 13,
    startup: 3, // Very fast aerial
    active: 8, // Multi-hit
    recovery: 9,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('fair', {
    name: 'Forward Spin Kick',
    damage: 11,
    knockback: 11,
    angle: 35,
    hitstun: 15,
    startup: 5,
    active: 5,
    recovery: 11,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('bair', {
    name: 'Back Spin',
    damage: 12,
    knockback: 13,
    angle: 140,
    hitstun: 17,
    startup: 6,
    active: 6,
    recovery: 13,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('dair', {
    name: 'Drill Spin',
    damage: 10,
    knockback: 8,
    angle: 270, // Meteor
    hitstun: 14,
    startup: 8,
    active: 12, // Multi-hit
    recovery: 15,
    hitboxType: HitboxType.AERIAL,
  });

  // ========== SPECIAL MOVES ==========
  specialMoves.set('neutral_special', {
    name: 'Homing Attack',
    damage: 16,
    knockback: 14,
    angle: 45,
    hitstun: 18,
    startup: 15,
    active: 10,
    recovery: 18,
    hitboxType: HitboxType.PROJECTILE,
  });

  specialMoves.set('side_special', {
    name: 'Spin Dash',
    damage: 18,
    knockback: 20,
    angle: 35,
    hitstun: 22,
    startup: 20, // Chargeable
    active: 15,
    recovery: 12,
    hitboxType: HitboxType.GROUND,
  });

  specialMoves.set('up_special', {
    name: 'Spring Jump',
    damage: 8,
    knockback: 10,
    angle: 90,
    hitstun: 12,
    startup: 4,
    active: 6,
    recovery: 20,
    hitboxType: HitboxType.AERIAL,
  });

  specialMoves.set('down_special', {
    name: 'Spin Attack',
    damage: 12,
    knockback: 12,
    angle: 60,
    hitstun: 16,
    startup: 8,
    active: 20, // Multi-hit
    recovery: 14,
    hitboxType: HitboxType.GROUND,
  });

  return {
    attacks,
    specialMoves,
    aerialMoves,
    grabs: new Map(),
  };
}
