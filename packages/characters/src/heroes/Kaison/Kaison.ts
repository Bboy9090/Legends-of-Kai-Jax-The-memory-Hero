import { FighterStats, FighterState } from '@smash-heroes/shared';
import { BaseFighter } from '../../base/BaseFighter';
import { createKaisonMoveSet } from './KaisonMoves';

/**
 * Kaison - The Fox
 * A nimble fighter with excellent mobility and quick attacks
 * Specializes in momentum-based movement and combo strings
 */
export class Kaison extends BaseFighter {
  constructor(id: string) {
    super(id, 'Kaison');
  }

  protected getDefaultStats(): FighterStats {
    return {
      weight: 80, // Light weight for high mobility
      walkSpeed: 1.5,
      runSpeed: 2.4, // Fast runner
      airSpeed: 1.2,
      jumpHeight: 14,
      airJumps: 1,
      fallSpeed: 1.8, // Fast faller
      fastFallSpeed: 2.8,
      maxDamage: 999,
      currentDamage: 0,
      lives: 3,
      ultimateMeter: 0,
      ultimateCost: 100,
    };
  }

  protected createMoveSet() {
    return createKaisonMoveSet();
  }

  protected setupStateMachine(): void {
    // Setup state transitions and callbacks
    this.stateMachine.onEnter(FighterState.IDLE, () => {
      // Quick deceleration for responsive controls
      this.physics.velocity.x *= 0.85;
    });

    this.stateMachine.onEnter(FighterState.JUMP_SQUAT, () => {
      this.currentFrame = 0;
    });

    this.stateMachine.onEnter(FighterState.JUMPING, () => {
      // Fox-style high jump
      this.physics.velocity.y = -this.stats.jumpHeight;
    });

    this.stateMachine.onEnter(FighterState.DASH, () => {
      // Fast dash with momentum preservation
      const dashSpeed = this.stats.runSpeed * 1.3;
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
    });

    // Fox Blaster (Neutral Special)
    this.stateMachine.onEnter(FighterState.NEUTRAL_SPECIAL, () => {
      this.performAttack('neutral_special');
      // Fox can move while shooting
    });

    // Fox Dash (Side Special)
    this.stateMachine.onEnter(FighterState.SIDE_SPECIAL, () => {
      this.performAttack('side_special');
      const dashSpeed = this.stats.runSpeed * 2;
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
    });

    // Fox Fire (Up Special / Recovery)
    this.stateMachine.onEnter(FighterState.UP_SPECIAL, () => {
      this.performAttack('up_special');
      // Multi-directional recovery
      this.physics.velocity.y = -this.stats.jumpHeight * 1.5;
    });

    // Fox Reflector (Down Special)
    this.stateMachine.onEnter(FighterState.DOWN_SPECIAL, () => {
      this.performAttack('down_special');
      // Reflector stays active
    });

    // Attack states
    this.stateMachine.onEnter(FighterState.JAB, () => {
      this.performAttack('jab');
    });

    this.stateMachine.onEnter(FighterState.JAB_2, () => {
      this.performAttack('jab_2');
    });

    this.stateMachine.onEnter(FighterState.JAB_3, () => {
      this.performAttack('jab_3');
    });

    this.stateMachine.onEnter(FighterState.HITSTUN, () => {
      // Clear all active hitboxes
      this.hitboxes.forEach(h => h.active = false);
    });

    this.stateMachine.onEnter(FighterState.LANDING, () => {
      this.currentFrame = 0;
      // Low landing lag for fast-paced gameplay
      this.physics.velocity.x *= 0.75;
    });
  }

  private performAttack(attackName: string): void {
    const attack = 
      this.moveSet.attacks.get(attackName) || 
      this.moveSet.specialMoves.get(attackName) ||
      this.moveSet.aerialMoves.get(attackName);
    
    if (!attack) return;

    // Activate hitboxes for this attack
    this.currentFrame = 0;
  }

  /**
   * Kaison's signature move - Fox Dash with momentum
   */
  public foxDash(direction: 'left' | 'right'): void {
    if (this.stateMachine.isInState(FighterState.HITSTUN) || this.stateMachine.isInState(FighterState.HITSTUN)) {
      return;
    }

    this.facing = direction;
    this.stateMachine.changeState(FighterState.SIDE_SPECIAL);
  }
}
