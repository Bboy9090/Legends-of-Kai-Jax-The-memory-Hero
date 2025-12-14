import { FighterStats, FighterState } from '@smash-heroes/shared';
import { BaseFighter } from '../../base/BaseFighter';
import { createKaxonMoveSet } from './KaxonMoves';

/**
 * Kaxon - The Fusion
 * Ultimate fusion of Kaison (Fox) and Jaxon (Hedgehog)
 * Features 3 tails, enhanced stats, and devastating power
 * Requires synergy meter to be at 100% to transform
 */
export class Kaxon extends BaseFighter {
  private fusionTimeRemaining: number = 0;
  private maxFusionTime: number = 30000; // 30 seconds in milliseconds

  constructor(id: string) {
    super(id, 'Kaxon');
  }

  protected getDefaultStats(): FighterStats {
    return {
      weight: 95, // Heavier than both Kaison and Jaxon
      walkSpeed: 2.0,
      runSpeed: 3.5, // Fastest runner
      airSpeed: 1.8,
      jumpHeight: 16, // Highest jump
      airJumps: 2, // Double air jump
      fallSpeed: 1.6,
      fastFallSpeed: 2.6,
      maxDamage: 999,
      currentDamage: 0,
      lives: 3,
      ultimateMeter: 100, // Starts at full
      ultimateCost: 100,
    };
  }

  protected createMoveSet() {
    return createKaxonMoveSet();
  }

  protected setupStateMachine(): void {
    // Setup state transitions and callbacks
    this.stateMachine.onEnter(FighterState.IDLE, () => {
      // Triple tail animation
      this.physics.velocity.x *= 0.8;
    });

    this.stateMachine.onEnter(FighterState.JUMP_SQUAT, () => {
      this.currentFrame = 0;
    });

    this.stateMachine.onEnter(FighterState.JUMPING, () => {
      // Enhanced jump with triple tail boost
      this.physics.velocity.y = -this.stats.jumpHeight;
    });

    this.stateMachine.onEnter(FighterState.DASH, () => {
      // Fusion speed - combination of fox and hedgehog
      const dashSpeed = this.stats.runSpeed * 1.4;
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
    });

    // Fusion Blaster Barrage (Neutral Special)
    this.stateMachine.onEnter(FighterState.NEUTRAL_SPECIAL, () => {
      this.performAttack('neutral_special');
      // Rapid-fire projectiles from all 3 tails
    });

    // Hyper Fusion Dash (Side Special)
    this.stateMachine.onEnter(FighterState.SIDE_SPECIAL, () => {
      this.performAttack('side_special');
      const dashSpeed = this.stats.runSpeed * 2.5;
      this.physics.velocity.x = this.facing === 'right' ? dashSpeed : -dashSpeed;
    });

    // Triple Tail Tornado (Up Special / Recovery)
    this.stateMachine.onEnter(FighterState.UP_SPECIAL, () => {
      this.performAttack('up_special');
      // Helicopter-style recovery with 3 tails
      this.physics.velocity.y = -this.stats.jumpHeight * 1.8;
    });

    this.stateMachine.onUpdate(FighterState.UP_SPECIAL, (deltaTime) => {
      // Maintain height with triple tail spin
      if (this.physics.velocity.y > 0) {
        this.physics.velocity.y *= 0.95; // Slow fall
      }
    });

    // Fusion Counter Burst (Down Special)
    this.stateMachine.onEnter(FighterState.DOWN_SPECIAL, () => {
      this.performAttack('down_special');
      // Ultimate counter with massive hitbox
    });

    // Ultimate Attack
    this.stateMachine.onEnter(FighterState.ULTIMATE, () => {
      this.performAttack('ultimate');
      // Chaos Rift - screen-filling ultimate
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
      // Minimal landing lag with triple tail support
      this.physics.velocity.x *= 0.85;
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
   * Update fusion timer
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.fusionTimeRemaining > 0) {
      this.fusionTimeRemaining -= deltaTime;
      
      // Warning when fusion is about to expire
      if (this.fusionTimeRemaining < 5000 && this.fusionTimeRemaining > 0) {
        // Flash effect or warning
      }
      
      // Fusion expired - would trigger de-fusion
      if (this.fusionTimeRemaining <= 0) {
        this.fusionTimeRemaining = 0;
        // Trigger de-fusion event
      }
    }
  }

  /**
   * Start fusion transformation
   */
  public startFusion(duration: number = 30000): void {
    this.fusionTimeRemaining = duration;
    this.stats.ultimateMeter = 100;
  }

  /**
   * Check if fusion is still active
   */
  public isFusionActive(): boolean {
    return this.fusionTimeRemaining > 0;
  }

  /**
   * Get remaining fusion time in seconds
   */
  public getFusionTimeRemaining(): number {
    return this.fusionTimeRemaining / 1000;
  }

  /**
   * Get fusion time percentage
   */
  public getFusionPercentage(): number {
    return (this.fusionTimeRemaining / this.maxFusionTime) * 100;
  }

  /**
   * Kaxon's ultimate attack - Chaos Rift
   */
  public unleashChaosRift(): void {
    if (this.stats.ultimateMeter >= this.stats.ultimateCost && 
        !this.stateMachine.isInState(FighterState.HITSTUN)) {
      this.stateMachine.changeState(FighterState.ULTIMATE);
      this.stats.ultimateMeter = 0;
    }
  }
}
