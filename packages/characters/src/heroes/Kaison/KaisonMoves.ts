import { AttackData, HitboxType } from '@smash-heroes/shared';

/**
 * Kaison (Fox) Move Set
 * A balanced fighter with quick attacks and momentum-based specials
 */

export function createKaisonMoveSet() {
  const attacks = new Map<string, AttackData>();
  const specialMoves = new Map<string, AttackData>();
  const aerialMoves = new Map<string, AttackData>();

  // ========== LIGHT ATTACKS ==========
  attacks.set('jab', {
    name: 'Fox Jab',
    damage: 3,
    knockback: 2,
    angle: 45,
    hitstun: 8,
    startup: 3,
    active: 2,
    recovery: 6,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_2', {
    name: 'Fox Jab 2',
    damage: 4,
    knockback: 3,
    angle: 50,
    hitstun: 10,
    startup: 2,
    active: 3,
    recovery: 8,
    hitboxType: HitboxType.GROUND,
    canCancel: true,
  });

  attacks.set('jab_3', {
    name: 'Fox Jab 3 Finisher',
    damage: 6,
    knockback: 8,
    angle: 60,
    hitstun: 15,
    startup: 3,
    active: 4,
    recovery: 12,
    hitboxType: HitboxType.GROUND,
  });

  // ========== HEAVY ATTACKS ==========
  attacks.set('heavy_forward', {
    name: 'Fox Tail Swipe',
    damage: 12,
    knockback: 15,
    angle: 45,
    hitstun: 20,
    startup: 8,
    active: 5,
    recovery: 15,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_up', {
    name: 'Fox Upper Kick',
    damage: 14,
    knockback: 18,
    angle: 80,
    hitstun: 22,
    startup: 10,
    active: 6,
    recovery: 18,
    hitboxType: HitboxType.GROUND,
  });

  attacks.set('heavy_down', {
    name: 'Fox Sweep',
    damage: 10,
    knockback: 12,
    angle: 30,
    hitstun: 18,
    startup: 6,
    active: 4,
    recovery: 14,
    hitboxType: HitboxType.GROUND,
  });

  // ========== AERIAL ATTACKS ==========
  aerialMoves.set('nair', {
    name: 'Fox Spin Kick',
    damage: 8,
    knockback: 6,
    angle: 45,
    hitstun: 12,
    startup: 4,
    active: 6,
    recovery: 10,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('fair', {
    name: 'Fox Forward Claw',
    damage: 10,
    knockback: 10,
    angle: 40,
    hitstun: 15,
    startup: 6,
    active: 4,
    recovery: 12,
    hitboxType: HitboxType.AERIAL,
  });

  aerialMoves.set('bair', {
    name: 'Fox Back Kick',
    damage: 11,
    knockback: 12,
    angle: 135,
    hitstun: 16,
    startup: 5,
    active: 5,
    recovery: 14,
    hitboxType: HitboxType.AERIAL,
  });

  // ========== SPECIAL MOVES ==========
  specialMoves.set('neutral_special', {
    name: 'Fox Blaster',
    damage: 5,
    knockback: 1,
    angle: 0,
    hitstun: 6,
    startup: 8,
    active: 20,
    recovery: 12,
    hitboxType: HitboxType.PROJECTILE,
  });

  specialMoves.set('side_special', {
    name: 'Fox Dash',
    damage: 14,
    knockback: 16,
    angle: 45,
    hitstun: 18,
    startup: 12,
    active: 8,
    recovery: 20,
    hitboxType: HitboxType.GROUND,
  });

  specialMoves.set('up_special', {
    name: 'Fox Fire',
    damage: 12,
    knockback: 14,
    angle: 80,
    hitstun: 16,
    startup: 6,
    active: 10,
    recovery: 16,
    hitboxType: HitboxType.AERIAL,
  });

  specialMoves.set('down_special', {
    name: 'Fox Reflector',
    damage: 7,
    knockback: 8,
    angle: 90,
    hitstun: 12,
    startup: 4,
    active: 30,
    recovery: 8,
    hitboxType: HitboxType.COUNTER,
  });

  return {
    attacks,
    specialMoves,
    aerialMoves,
    grabs: new Map(),
  };
}
