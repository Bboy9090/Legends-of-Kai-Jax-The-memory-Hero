import { MoveSet } from '@smash-heroes/shared';
import { MoveSetBuilder } from '../../base/MoveSet';

export function createJaxonMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();

  builder
    .addAttack('jab', {
      damage: 4,
      baseKnockback: 8,
      knockbackGrowth: 0.2,
      knockbackAngle: 45,
      hitlag: 2,
      hitstun: 7,
      startupFrames: 2,
      activeFrames: 3,
      recoveryFrames: 5,
      nextMoves: ['jab_2'],
    })
    .addAttack('jab_2', {
      damage: 5,
      baseKnockback: 10,
      knockbackGrowth: 0.3,
      knockbackAngle: 50,
      hitlag: 2,
      hitstun: 9,
      startupFrames: 2,
      activeFrames: 3,
      recoveryFrames: 6,
      nextMoves: ['jab_3'],
    })
    .addAttack('jab_3', {
      damage: 7,
      baseKnockback: 32,
      knockbackGrowth: 1.0,
      knockbackAngle: 75,
      hitlag: 3,
      hitstun: 16,
      startupFrames: 3,
      activeFrames: 5,
      recoveryFrames: 10,
    })
    .addAttack('heavy_forward', {
      damage: 15,
      baseKnockback: 45,
      knockbackGrowth: 1.8,
      knockbackAngle: 40,
      hitlag: 10,
      hitstun: 22,
      startupFrames: 10,
      activeFrames: 8,
      recoveryFrames: 16,
    })
    .addAerialMove('nair', {
      damage: 9,
      baseKnockback: 22,
      knockbackGrowth: 0.7,
      knockbackAngle: 45,
      hitlag: 3,
      hitstun: 13,
      startupFrames: 3,
      activeFrames: 8,
      recoveryFrames: 9,
    })
    .addSpecialMove('neutral_special', {
      damage: 16,
      baseKnockback: 38,
      knockbackGrowth: 1.4,
      knockbackAngle: 45,
      hitlag: 8,
      hitstun: 18,
      startupFrames: 15,
      activeFrames: 10,
      recoveryFrames: 18,
    })
    .addSpecialMove('side_special', {
      damage: 18,
      baseKnockback: 50,
      knockbackGrowth: 2.0,
      knockbackAngle: 35,
      hitlag: 10,
      hitstun: 22,
      startupFrames: 20,
      activeFrames: 15,
      recoveryFrames: 12,
    })
    .addSpecialMove('up_special', {
      damage: 8,
      baseKnockback: 28,
      knockbackGrowth: 1.0,
      knockbackAngle: 90,
      hitlag: 4,
      hitstun: 12,
      startupFrames: 4,
      activeFrames: 6,
      recoveryFrames: 20,
    });

  return builder.build();
}
