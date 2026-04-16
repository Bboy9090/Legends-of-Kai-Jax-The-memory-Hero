/**
 * Fighter Entity
 * Simplified fighter with combat integration
 */

import { MoveInterpreter } from './MoveInterpreter';
import { Hurtbox } from './Hurtbox';
import { CollisionResolver } from './CollisionResolver';
import type { MoveSpec } from '../types/MoveSpec';

export interface FighterState {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHP: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
  inHitstop: boolean;
  hitstopFrames: number;
}

export class FighterEntity {
  public state: FighterState;
  private moveInterpreter: MoveInterpreter;
  private hurtbox: Hurtbox;
  private moveLibrary: Map<string, MoveSpec> = new Map();

  constructor(id: string, x: number, y: number, hp: number) {
    this.state = {
      id,
      x,
      y,
      hp,
      maxHP: hp,
      velocityX: 0,
      velocityY: 0,
      facingRight: true,
      inHitstop: false,
      hitstopFrames: 0,
    };

    this.moveInterpreter = new MoveInterpreter();
    this.hurtbox = new Hurtbox(x, y, 0.4, 0.9); // Default hurtbox size

    // Register hit callback
    this.moveInterpreter.onHit((hitbox) => {
      console.log(`[Fighter ${id}] Hitbox active, ready for collision check`);
    });
  }

  /**
   * Load move spec into library
   */
  public async loadMove(moveId: string): Promise<void> {
    const spec = await this.moveInterpreter.loadMove(moveId);
    this.moveLibrary.set(moveId, spec);
    console.log(`[Fighter ${this.state.id}] Loaded move: ${moveId}`);
  }

  /**
   * Execute a loaded move
   */
  public executeMove(moveId: string): boolean {
    const spec = this.moveLibrary.get(moveId);
    if (!spec) {
      console.warn(`[Fighter ${this.state.id}] Move not loaded: ${moveId}`);
      return false;
    }

    if (this.moveInterpreter.isActive()) {
      console.warn(`[Fighter ${this.state.id}] Cannot execute, move in progress`);
      return false;
    }

    this.moveInterpreter.executeMove(spec, this.state.x, this.state.y);
    console.log(`[Fighter ${this.state.id}] Executing ${moveId}`);
    return true;
  }

  /**
   * Update fighter each frame
   */
  public update(deltaTime: number): void {
    // Update hitstop
    if (this.state.inHitstop) {
      this.state.hitstopFrames--;
      if (this.state.hitstopFrames <= 0) {
        this.state.inHitstop = false;
      }
      return; // Frozen during hitstop
    }

    // Update move interpreter
    this.moveInterpreter.update(this.state.x, this.state.y);

    // Update hurtbox position
    this.hurtbox.setPosition(this.state.x, this.state.y);

    // Apply velocity
    this.state.x += this.state.velocityX * deltaTime;
    this.state.y += this.state.velocityY * deltaTime;

    // Simple ground clamp
    if (this.state.y < 0) {
      this.state.y = 0;
      this.state.velocityY = 0;
    }

    // Friction
    this.state.velocityX *= 0.9;
    this.state.velocityY *= 0.98;
  }

  /**
   * Check if this fighter's attacks hit target
   */
  public checkHitAgainst(target: FighterEntity): boolean {
    const activeHitboxes = this.moveInterpreter.getActiveHitboxes();
    const currentMove = this.moveInterpreter.getCurrentMove();

    if (activeHitboxes.length === 0 || !currentMove) {
      return false;
    }

    const collision = CollisionResolver.checkAllHitboxes(
      activeHitboxes,
      target.hurtbox,
      currentMove.hitstopOnHit
    );

    if (collision) {
      // Apply damage
      target.takeDamage(collision.damage);

      // Apply knockback
      target.applyKnockback(collision.knockbackX, collision.knockbackY);

      // Apply hitstop to both fighters
      this.enterHitstop(collision.hitstop);
      target.enterHitstop(collision.hitstop);

      // Mark hitbox as connected
      activeHitboxes.forEach((hitbox) => {
        this.moveInterpreter.markHitConnected(hitbox);
      });

      console.log(
        `[Fighter ${this.state.id}] HIT ${target.state.id} for ${collision.damage} damage!`
      );
      console.log(
        `[Fighter ${this.state.id}] Knockback applied: (${collision.knockbackX}, ${collision.knockbackY})`
      );

      return true;
    }

    return false;
  }

  /**
   * Take damage
   */
  public takeDamage(damage: number): void {
    this.state.hp = Math.max(0, this.state.hp - damage);
    console.log(
      `[Fighter ${this.state.id}] Took ${damage} damage. HP: ${this.state.hp}/${this.state.maxHP}`
    );
  }

  /**
   * Apply knockback velocity
   */
  public applyKnockback(kbX: number, kbY: number): void {
    const direction = this.state.facingRight ? 1 : -1;
    this.state.velocityX = kbX * direction;
    this.state.velocityY = kbY;
  }

  /**
   * Enter hitstop freeze
   */
  public enterHitstop(frames: number): void {
    this.state.inHitstop = true;
    this.state.hitstopFrames = frames;
  }

  /**
   * Get hurtbox for external access
   */
  public getHurtbox(): Hurtbox {
    return this.hurtbox;
  }

  /**
   * Get move interpreter for debug
   */
  public getMoveInterpreter(): MoveInterpreter {
    return this.moveInterpreter;
  }

  /**
   * Check if fighter is executing move
   */
  public isBusy(): boolean {
    return this.moveInterpreter.isActive() || this.state.inHitstop;
  }

  /**
   * Get current state snapshot
   */
  public getState(): FighterState {
    return { ...this.state };
  }
}
