import { FighterStats, FighterState, MoveSet } from '@smash-heroes/shared';
import { BaseFighter } from '../../base/BaseFighter';
import { createStrikerMoveSet } from './StrikerMoves';

export class Striker extends BaseFighter {
  constructor(id: string) {
    super(id, 'Striker');
  }

  protected getDefaultStats(): FighterStats {
    return {
      weight: 100, // Average weight
      walkSpeed: 1.2,
      runSpeed: 2.0,
      airSpeed: 1.0,
      jumpHeight: 12,
      airJumps: 1,
      fallSpeed: 1.5,
      fastFallSpeed: 2.4,
      maxDamage: 999,
      currentDamage: 0,
      lives: 3,
      ultimateMeter: 0,
      ultimateCost: 100,
    };
  }

  protected createMoveSet(): MoveSet {
    return createStrikerMoveSet();
  }

  protected setupStateMachine(): void {
    // Setup state transitions and callbacks
    this.stateMachine.onEnter(FighterState.IDLE, () => {
      // Reset velocity when entering idle
      this.physics.velocity.x *= 0.8;
    });

    this.stateMachine.onEnter(FighterState.JUMP_SQUAT, () => {
      // Jump squat animation
      this.currentFrame = 0;
    });

    this.stateMachine.onEnter(FighterState.JUMPING, () => {
      // Apply jump velocity
      this.physics.velocity.y = -this.stats.jumpHeight;
    });

    this.stateMachine.onUpdate(FighterState.WALK, (deltaTime) => {
      // Walking logic handled by input manager
    });

    this.stateMachine.onUpdate(FighterState.RUN, (deltaTime) => {
      // Running logic handled by input manager
    });

    this.stateMachine.onEnter(FighterState.LANDING, () => {
      this.currentFrame = 0;
      this.physics.velocity.x *= 0.7; // Landing friction
    });

    // Attack states
    this.stateMachine.onEnter(FighterState.JAB, () => {
      this.performAttack('jab');
    });

    this.stateMachine.onEnter(FighterState.HITSTUN, () => {
      // Clear all active hitboxes
      this.hitboxes.forEach(h => h.active = false);
    });
  }

  private performAttack(attackName: string): void {
    const attack = this.moveSet.attacks.get(attackName);
    if (!attack) return;

    // Activate hitboxes for this attack
    // This would be more sophisticated in a real implementation
    this.currentFrame = 0;
  }

  // Striker-specific abilities
  performComboFinisher(): void {
    if (this.stats.ultimateMeter >= 50) {
      // Perform powerful combo finisher
      this.stats.ultimateMeter -= 50;
      // Trigger combo finisher animation and hitboxes
    }
  }

  performUltimate(): void {
    if (this.useUltimate()) {
      this.changeState(FighterState.ULTIMATE);
      // Trigger ultimate animation and effects
    }
  }
}
