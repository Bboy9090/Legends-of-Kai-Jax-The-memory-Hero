import { FighterStats, FighterState } from '@beast-kin/shared';
import { BaseFighter } from '../../base/BaseFighter';
import { createJaxonMoveSet } from './JaxonMoves';

/**
 * Jaxon - The Storm Fang
 * The fastest character with spin-based attacks
 * Specializes in speed, momentum, and multi-hit combos
 */
export class Jaxon extends BaseFighter {
  private stormSpinCharge: number = 0;
  private maxSpinCharge: number = 100;

  constructor(id: string) {
    super(id, 'Jaxon');
  }

  protected getDefaultStats(): FighterStats {
    return {
      id: this.id,
      weight: 75, // Very light for maximum speed
      walkSpeed: 1.8,
      runSpeed: 3.2, // Fastest runner
      airSpeed: 1.5,
      jumpHeight: 13,
      airJumps: 1,
      fallSpeed: 2.0, // Fast faller
      fastFallSpeed: 3.2,
      maxDamage: 999,
      currentDamage: 0,
      damage: 0,
      hitstun: 0,
      lives: 3,
      ultimateMeter: 0,
      ultimateCost: 100,
      velocity: { x: 0, y: 0 }, // Will be synced with physics in BaseFighter
    };
  }

  protected createMoveSet() {
    return createJaxonMoveSet();
  }

  protected setupStateMachine(): void {
    // Setup state transitions and callbacks
    this.stateMachine.onEnter(FighterState.IDLE, () => {
      // Quick stop with slight drift
      this.physics.velocity.x *= 0.7;
      this.stormSpinCharge = 0;
    });

    this.stateMachine.onEnter(FighterState.JUMP_SQUAT, () => {
      this.currentFrame = 0;
    });

    this.stateMachine.onEnter(FighterState.JUMPING, () => {
      // Standard jump
      this.physics.velocity.y = -this.stats.jumpHeight;
    });

    this.stateMachine.onEnter(FighterState.DASH, () => {
      // Sonic-style super speed dash
      const dashSpeed = this.stats.runSpeed * 1.5;
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
    });

    this.stateMachine.onEnter(FighterState.RUN, () => {
      // Maintain high speed while running
    });

    // Homing Attack (Neutral Special)
    this.stateMachine.onEnter(FighterState.NEUTRAL_SPECIAL, () => {
      this.performAttack('neutral_special');
      // Lock onto nearest target and dash towards them
    });

    // Storm Spin (Side Special)
    this.stateMachine.onEnter(FighterState.SIDE_SPECIAL, () => {
      // Start charging storm spin
      this.stormSpinCharge = 0;
    });

    this.stateMachine.onUpdate(FighterState.SIDE_SPECIAL, (deltaTime) => {
      // Charge storm spin
      this.stormSpinCharge = Math.min(this.stormSpinCharge + deltaTime * 50, this.maxSpinCharge);
    });

    this.stateMachine.onExit(FighterState.SIDE_SPECIAL, () => {
      // Release storm spin
      this.performAttack('side_special');
      const dashSpeed = (this.stats.runSpeed * 2) * (this.stormSpinCharge / this.maxSpinCharge);
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
      this.stormSpinCharge = 0;
    });

    // Spring Jump (Up Special / Recovery)
    this.stateMachine.onEnter(FighterState.UP_SPECIAL, () => {
      this.performAttack('up_special');
      // Super high jump for recovery
      this.physics.velocity.y = -this.stats.jumpHeight * 2;
      this.physics.velocity.x *= 0.5; // Reduce horizontal momentum
    });

    // Spin Attack (Down Special)
    this.stateMachine.onEnter(FighterState.DOWN_SPECIAL, () => {
      this.performAttack('down_special');
      // Spin in place with multi-hit
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
      this.stormSpinCharge = 0;
    });

    this.stateMachine.onEnter(FighterState.LANDING, () => {
      this.currentFrame = 0;
      // Very low landing lag - Jaxon keeps momentum
      this.physics.velocity.x *= 0.9;
    });
  }

  private performAttack(attackName: string): void {
    const attack = 
      this.moveSet.attacks.get(attackName) || 
      this.moveSet.specialMoves.get(attackName) ||
      this.moveSet.aerialMoves.get(attackName);
    
    if (!attack) return;

    this.currentFrame = 0;
  }

  /**
   * Jaxon's signature move - Charged Storm Spin
   */
  public startStormSpin(): void {
    if (this.stateMachine.isInState(FighterState.HITSTUN) || this.stateMachine.isInState(FighterState.HITSTUN)) {
      return;
    }

    this.stateMachine.changeState(FighterState.SIDE_SPECIAL);
  }

  public releaseStormSpin(): void {
    if (this.state === FighterState.SIDE_SPECIAL) {
      this.stateMachine.changeState(FighterState.DASH);
    }
  }

  /**
   * Get current storm spin charge percentage
   */
  public getStormSpinCharge(): number {
    return (this.stormSpinCharge / this.maxSpinCharge) * 100;
  }
}
