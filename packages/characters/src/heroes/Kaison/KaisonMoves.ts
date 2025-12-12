import { MoveSet } from '@smash-heroes/shared';
import { MoveSetBuilder } from '../../base/MoveSet';

/**
 * Kaison (Fox) Move Set
 * A balanced fighter with quick attacks and momentum-based specials
 */
export function createKaisonMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();

  // JAB COMBO
  builder
    .addAttack('jab', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.3,
      knockbackAngle: 45,
      hitlag: 3,
      hitstun: 8,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 6,
      nextMoves: ['jab_2'],
    })
    .addAttack('jab_2', {
      damage: 4,
      baseKnockback: 12,
      knockbackGrowth: 0.4,
      knockbackAngle: 50,
      hitlag: 4,
      hitstun: 10,
      startupFrames: 2,
      activeFrames: 3,
      recoveryFrames: 8,
      nextMoves: ['jab_3'],
    })
    .addAttack('jab_3', {
      damage: 6,
      baseKnockback: 30,
      knockbackGrowth: 1.0,
      knockbackAngle: 60,
      hitlag: 6,
      hitstun: 15,
      startupFrames: 3,
      activeFrames: 4,
      recoveryFrames: 12,
    });

  // HEAVY ATTACKS
  builder
    .addAttack('heavy_forward', {
      damage: 12,
      baseKnockback: 40,
      knockbackGrowth: 1.5,
      knockbackAngle: 45,
      hitlag: 8,
      hitstun: 20,
      startupFrames: 8,
      activeFrames: 5,
      recoveryFrames: 15,
    })
    .addAttack('heavy_up', {
      damage: 14,
      baseKnockback: 45,
      knockbackGrowth: 1.8,
      knockbackAngle: 80,
      hitlag: 10,
      hitstun: 22,
      startupFrames: 10,
      activeFrames: 6,
      recoveryFrames: 18,
    })
    .addAttack('heavy_down', {
      damage: 10,
      baseKnockback: 35,
      knockbackGrowth: 1.2,
      knockbackAngle: 30,
      hitlag: 6,
      hitstun: 18,
      startupFrames: 6,
      activeFrames: 4,
      recoveryFrames: 14,
    });

  // AERIALS
  builder
    .addAerialMove('nair', {
      damage: 8,
      baseKnockback: 25,
      knockbackGrowth: 0.6,
      knockbackAngle: 45,
      hitlag: 4,
      hitstun: 12,
      startupFrames: 4,
      activeFrames: 6,
      recoveryFrames: 10,
    })
    .addAerialMove('fair', {
      damage: 10,
      baseKnockback: 30,
      knockbackGrowth: 1.0,
      knockbackAngle: 40,
      hitlag: 6,
      hitstun: 15,
      startupFrames: 6,
      activeFrames: 4,
      recoveryFrames: 12,
    })
    .addAerialMove('bair', {
      damage: 11,
      baseKnockback: 35,
      knockbackGrowth: 1.2,
      knockbackAngle: 135,
      hitlag: 5,
      hitstun: 16,
      startupFrames: 5,
      activeFrames: 5,
      recoveryFrames: 14,
    });

  // SPECIALS
  builder
    .addSpecialMove('neutral_special', {
      damage: 5,
      baseKnockback: 5,
      knockbackGrowth: 0.1,
      knockbackAngle: 0,
      hitlag: 2,
      hitstun: 6,
      startupFrames: 8,
      activeFrames: 20,
      recoveryFrames: 12,
    })
    .addSpecialMove('side_special', {
      damage: 14,
      baseKnockback: 40,
      knockbackGrowth: 1.6,
      knockbackAngle: 45,
      hitlag: 8,
      hitstun: 18,
      startupFrames: 12,
      activeFrames: 8,
      recoveryFrames: 20,
    })
    .addSpecialMove('up_special', {
      damage: 12,
      baseKnockback: 35,
      knockbackGrowth: 1.4,
      knockbackAngle: 80,
      hitlag: 6,
      hitstun: 16,
      startupFrames: 6,
      activeFrames: 10,
      recoveryFrames: 16,
    })
    .addSpecialMove('down_special', {
      damage: 7,
      baseKnockback: 20,
      knockbackGrowth: 0.8,
      knockbackAngle: 90,
      hitlag: 4,
      hitstun: 12,
      startupFrames: 4,
      activeFrames: 30,
      recoveryFrames: 8,
    });

  return builder.build();
}
