import { MoveSet } from '@smash-heroes/shared';
import { MoveSetBuilder } from '../../base/MoveSet';

export function createKaxonMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();

  builder
    .addAttack('jab', {
      damage: 6,
      baseKnockback: 15,
      knockbackGrowth: 0.4,
      knockbackAngle: 45,
      hitlag: 4,
      hitstun: 10,
      startupFrames: 2,
      activeFrames: 4,
      recoveryFrames: 5,
      nextMoves: ['jab_2'],
    })
    .addAttack('jab_2', {
      damage: 8,
      baseKnockback: 18,
      knockbackGrowth: 0.6,
      knockbackAngle: 50,
      hitlag: 5,
      hitstun: 12,
      startupFrames: 2,
      activeFrames: 5,
      recoveryFrames: 6,
      nextMoves: ['jab_3'],
    })
    .addAttack('jab_3', {
      damage: 12,
      baseKnockback: 45,
      knockbackGrowth: 1.5,
      knockbackAngle: 65,
      hitlag: 8,
      hitstun: 20,
      startupFrames: 3,
      activeFrames: 6,
      recoveryFrames: 10,
    })
    .addAttack('heavy_forward', {
      damage: 20,
      baseKnockback: 60,
      knockbackGrowth: 2.5,
      knockbackAngle: 40,
      hitlag: 12,
      hitstun: 28,
      startupFrames: 10,
      activeFrames: 8,
      recoveryFrames: 16,
    })
    .addAerialMove('nair', {
      damage: 15,
      baseKnockback: 35,
      knockbackGrowth: 1.2,
      knockbackAngle: 45,
      hitlag: 5,
      hitstun: 18,
      startupFrames: 3,
      activeFrames: 10,
      recoveryFrames: 10,
    })
    .addSpecialMove('neutral_special', {
      damage: 24,
      baseKnockback: 50,
      knockbackGrowth: 1.8,
      knockbackAngle: 45,
      hitlag: 10,
      hitstun: 25,
      startupFrames: 15,
      activeFrames: 30,
      recoveryFrames: 20,
    })
    .addSpecialMove('side_special', {
      damage: 28,
      baseKnockback: 70,
      knockbackGrowth: 3.5,
      knockbackAngle: 40,
      hitlag: 15,
      hitstun: 32,
      startupFrames: 18,
      activeFrames: 12,
      recoveryFrames: 22,
    })
    .addSpecialMove('up_special', {
      damage: 25,
      baseKnockback: 60,
      knockbackGrowth: 2.8,
      knockbackAngle: 80,
      hitlag: 10,
      hitstun: 28,
      startupFrames: 8,
      activeFrames: 20,
      recoveryFrames: 18,
    });

  return builder.build();
}
