/**
 * MoveSpec Interpreter
 * Runtime execution engine for frame-data driven combat moves
 */

import type { MoveSpec, HitSpec, ActiveHitbox } from '../types/MoveSpec';

export class MoveInterpreter {
  private currentMove: MoveSpec | null = null;
  private frameCounter: number = 0;
  private activeHitboxes: ActiveHitbox[] = [];
  private isExecuting: boolean = false;
  private onHitCallback: ((hitbox: ActiveHitbox) => void) | null = null;

  /**
   * Load move specification from JSON
   */
  public async loadMove(moveId: string): Promise<MoveSpec> {
    const response = await fetch(`${import.meta.env.BASE_URL}moves/${moveId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load move: ${moveId}`);
    }
    const moveSpec: MoveSpec = await response.json();
    return moveSpec;
  }

  /**
   * Execute a move from loaded spec
   */
  public executeMove(moveSpec: MoveSpec, fighterX: number, fighterY: number): void {
    this.currentMove = moveSpec;
    this.frameCounter = 0;
    this.isExecuting = true;
    this.activeHitboxes = [];

    console.log(`[MoveInterpreter] Executing: ${moveSpec.id}`);
    console.log(`[MoveInterpreter] Startup: ${moveSpec.startup}f | Active: ${moveSpec.active}f | Recovery: ${moveSpec.recovery}f`);

    // Initialize hitboxes in inactive state
    moveSpec.hits.forEach((hitSpec) => {
      this.activeHitboxes.push({
        spec: hitSpec,
        worldX: fighterX + hitSpec.offX,
        worldY: fighterY + hitSpec.offY,
        active: false,
        hasConnected: false,
      });
    });
  }

  /**
   * Update interpreter each frame
   * Must be called every frame during move execution
   */
  public update(fighterX: number, fighterY: number): void {
    if (!this.isExecuting || !this.currentMove) return;

    this.frameCounter++;

    // Update hitbox positions to follow fighter
    this.activeHitboxes.forEach((hitbox) => {
      hitbox.worldX = fighterX + hitbox.spec.offX;
      hitbox.worldY = fighterY + hitbox.spec.offY;

      // Activate hitbox if in active window
      const inActiveWindow =
        this.frameCounter >= hitbox.spec.startF &&
        this.frameCounter <= hitbox.spec.endF;

      if (inActiveWindow && !hitbox.active) {
        hitbox.active = true;
        console.log(`[MoveInterpreter] Hitbox active at frame ${this.frameCounter}`);
      } else if (!inActiveWindow && hitbox.active) {
        hitbox.active = false;
        console.log(`[MoveInterpreter] Hitbox deactivated at frame ${this.frameCounter}`);
      }

      // Check for hit detection
      if (hitbox.active && !hitbox.hasConnected) {
        if (this.onHitCallback) {
          this.onHitCallback(hitbox);
        }
      }
    });

    // Check if move execution complete
    const totalFrames =
      this.currentMove.startup + this.currentMove.active + this.currentMove.recovery;
    
    if (this.frameCounter >= totalFrames) {
      this.endMove();
    }
  }

  /**
   * Register callback for hit detection
   */
  public onHit(callback: (hitbox: ActiveHitbox) => void): void {
    this.onHitCallback = callback;
  }

  /**
   * Mark hitbox as having connected with target
   */
  public markHitConnected(hitbox: ActiveHitbox): void {
    if (hitbox.spec.usedOnce) {
      hitbox.hasConnected = true;
      hitbox.active = false;
      console.log(`[MoveInterpreter] Hitbox connected, marked inactive (usedOnce)`);
    }
  }

  /**
   * Get all currently active hitboxes
   */
  public getActiveHitboxes(): ActiveHitbox[] {
    return this.activeHitboxes.filter((h) => h.active && !h.hasConnected);
  }

  /**
   * Check if move is currently executing
   */
  public isActive(): boolean {
    return this.isExecuting;
  }

  /**
   * Get current frame of execution
   */
  public getCurrentFrame(): number {
    return this.frameCounter;
  }

  /**
   * Get current move spec
   */
  public getCurrentMove(): MoveSpec | null {
    return this.currentMove;
  }

  /**
   * Force end move execution
   */
  public endMove(): void {
    if (!this.currentMove) return;

    console.log(`[MoveInterpreter] Move ${this.currentMove.id} completed at frame ${this.frameCounter}`);
    
    this.isExecuting = false;
    this.activeHitboxes = [];
    this.currentMove = null;
    this.frameCounter = 0;
  }

  /**
   * Apply hitstop freeze
   */
  public getHitstop(didHit: boolean): number {
    if (!this.currentMove) return 0;
    return didHit ? this.currentMove.hitstopOnHit : this.currentMove.hitstopOnBlock;
  }

  /**
   * Get knockback vector from hitbox
   */
  public getKnockback(hitbox: ActiveHitbox): { x: number; y: number } {
    return {
      x: hitbox.spec.kbX,
      y: hitbox.spec.kbY,
    };
  }

  /**
   * Get damage from hitbox
   */
  public getDamage(hitbox: ActiveHitbox): number {
    return hitbox.spec.dmg;
  }
}
