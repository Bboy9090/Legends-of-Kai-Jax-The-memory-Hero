import { MoveSet, AttackData } from '@smash-heroes/shared';
import { MoveSetBuilder } from '../../base/MoveSet';

export function createStrikerMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();

  // Ground attacks
  builder
    // Jab combo
    .addAttack('jab', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.5,
      knockbackAngle: 361,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 8,
      nextMoves: ['jab2'],
    })
    .addAttack('jab2', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.5,
      knockbackAngle: 361,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 8,
      nextMoves: ['jab3'],
    })
    .addAttack('jab3', {
      damage: 5,
      baseKnockback: 30,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 4,
      activeFrames: 3,
      recoveryFrames: 15,
    })
    // Tilts
    .addAttack('forward_tilt', {
      damage: 8,
      baseKnockback: 40,
      knockbackGrowth: 1.2,
      knockbackAngle: 45,
      startupFrames: 6,
      activeFrames: 3,
      recoveryFrames: 12,
    })
    .addAttack('up_tilt', {
      damage: 7,
      baseKnockback: 35,
      knockbackGrowth: 1.1,
      knockbackAngle: 85,
      startupFrames: 5,
      activeFrames: 4,
      recoveryFrames: 12,
    })
    .addAttack('down_tilt', {
      damage: 6,
      baseKnockback: 25,
      knockbackGrowth: 0.9,
      knockbackAngle: 30,
      startupFrames: 4,
      activeFrames: 3,
      recoveryFrames: 10,
    })
    // Smash attacks
    .addAttack('forward_smash', {
      damage: 18,
      baseKnockback: 80,
      knockbackGrowth: 1.8,
      knockbackAngle: 45,
      startupFrames: 15,
      activeFrames: 4,
      recoveryFrames: 25,
    })
    .addAttack('up_smash', {
      damage: 16,
      baseKnockback: 75,
      knockbackGrowth: 1.7,
      knockbackAngle: 90,
      startupFrames: 12,
      activeFrames: 5,
      recoveryFrames: 22,
    })
    .addAttack('down_smash', {
      damage: 14,
      baseKnockback: 70,
      knockbackGrowth: 1.6,
      knockbackAngle: 30,
      startupFrames: 10,
      activeFrames: 4,
      recoveryFrames: 20,
    });

  // Aerial attacks
  builder
    .addAerialMove('nair', {
      damage: 10,
      baseKnockback: 45,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 5,
      activeFrames: 12,
      recoveryFrames: 10,
    })
    .addAerialMove('fair', {
      damage: 12,
      baseKnockback: 55,
      knockbackGrowth: 1.3,
      knockbackAngle: 45,
      startupFrames: 8,
      activeFrames: 4,
      recoveryFrames: 15,
    })
    .addAerialMove('bair', {
      damage: 13,
      baseKnockback: 60,
      knockbackGrowth: 1.4,
      knockbackAngle: 45,
      startupFrames: 7,
      activeFrames: 5,
      recoveryFrames: 14,
    })
    .addAerialMove('uair', {
      damage: 11,
      baseKnockback: 50,
      knockbackGrowth: 1.2,
      knockbackAngle: 85,
      startupFrames: 6,
      activeFrames: 6,
      recoveryFrames: 12,
    })
    .addAerialMove('dair', {
      damage: 14,
      baseKnockback: 65,
      knockbackGrowth: 1.5,
      knockbackAngle: 270, // Spike
      startupFrames: 10,
      activeFrames: 3,
      recoveryFrames: 18,
    });

  // Special moves
  builder
    .addSpecialMove('neutral_special', {
      name: 'Power Shot',
      damage: 15,
      baseKnockback: 65,
      knockbackGrowth: 1.4,
      knockbackAngle: 45,
      startupFrames: 20,
      activeFrames: 5,
      recoveryFrames: 30,
    })
    .addSpecialMove('side_special', {
      name: 'Dash Strike',
      damage: 12,
      baseKnockback: 60,
      knockbackGrowth: 1.3,
      knockbackAngle: 50,
      startupFrames: 10,
      activeFrames: 8,
      recoveryFrames: 20,
    })
    .addSpecialMove('up_special', {
      name: 'Rising Uppercut',
      damage: 10,
      baseKnockback: 70,
      knockbackGrowth: 1.2,
      knockbackAngle: 90,
      startupFrames: 5,
      activeFrames: 15,
      recoveryFrames: 25,
    })
    .addSpecialMove('down_special', {
      name: 'Counter',
      damage: 0, // Counter multiplies incoming damage
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 5,
      activeFrames: 25,
      recoveryFrames: 15,
    });

  // Grab and throws
  builder
    .addGrab('grab', {
      damage: 0,
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 6,
      activeFrames: 2,
      recoveryFrames: 30,
    })
    .addGrab('pummel', {
      damage: 1.2,
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 1,
      activeFrames: 1,
      recoveryFrames: 20,
    })
    .addGrab('forward_throw', {
      damage: 7,
      baseKnockback: 60,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 10,
      activeFrames: 1,
      recoveryFrames: 20,
    })
    .addGrab('back_throw', {
      damage: 9,
      baseKnockback: 70,
      knockbackGrowth: 1.1,
      knockbackAngle: 135,
      startupFrames: 12,
      activeFrames: 1,
      recoveryFrames: 20,
    })
    .addGrab('up_throw', {
      damage: 8,
      baseKnockback: 65,
      knockbackGrowth: 1.0,
      knockbackAngle: 90,
      startupFrames: 15,
      activeFrames: 1,
      recoveryFrames: 20,
    })
    .addGrab('down_throw', {
      damage: 6,
      baseKnockback: 50,
      knockbackGrowth: 0.8,
      knockbackAngle: 80,
      startupFrames: 10,
      activeFrames: 1,
      recoveryFrames: 20,
    });

  return builder.build();
}
