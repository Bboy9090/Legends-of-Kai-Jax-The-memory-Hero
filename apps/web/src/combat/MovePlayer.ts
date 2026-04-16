/**
 * MovePlayer — Runtime Move Interpreter
 * Authoritative implementation from combat kernel spec
 */

import * as THREE from 'three';
import type { MoveSpec, HitSpec } from '../types/MoveSpec';
import { Hurtbox } from './Hurtbox';

export class MovePlayer {
  currentMove: MoveSpec | null = null;
  frame: number = 0;
  hitboxes: THREE.Mesh[] = [];
  scene: THREE.Scene;
  hurtbox: Hurtbox;
  hitstopFrames: number = 0;
  fighterPosition: THREE.Vector3;
  facingRight: boolean = true;
  shieldActive: boolean = false;
  shieldHP: number = 100;
  maxShieldHP: number = 100;
  shieldRegenRate: number = 10; // HP per second
  shieldRegenDelay: number = 2.0; // Seconds before regen starts
  timeSinceShieldHit: number = 0;

  constructor(scene: THREE.Scene, hurtbox: Hurtbox, fighterPosition: THREE.Vector3) {
    this.scene = scene;
    this.hurtbox = hurtbox;
    this.fighterPosition = fighterPosition;
  }

  startMove(move: MoveSpec): void {
    if (this.currentMove) {
      console.warn('[MovePlayer] Move already in progress, cannot start new move');
      return;
    }

    this.currentMove = move;
    this.frame = 0;
    console.log(`[MovePlayer] Starting move: ${move.id}`);
    console.log(`[MovePlayer] Startup: ${move.startup}f | Active: ${move.active}f | Recovery: ${move.recovery}f`);
  }

  /**
   * Update move player each frame
   */
  update(): void {
    if (!this.currentMove) {
      // Shield regeneration when not in move
      if (!this.shieldActive && this.shieldHP < this.maxShieldHP) {
        this.timeSinceShieldHit += 1 / 60; // Assume 60fps
        if (this.timeSinceShieldHit >= this.shieldRegenDelay) {
          this.shieldHP = Math.min(this.maxShieldHP, this.shieldHP + (this.shieldRegenRate / 60));
        }
      }
      return;
    }

    // Hitstop freeze
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      console.log(`[MovePlayer] Hitstop: ${this.hitstopFrames}f remaining`);
      return;
    }

    // Clear previous frame hitboxes
    this.clearHitboxes();

    const move = this.currentMove;
    this.frame++;

    // Spawn hitboxes for active frames
    move.hits.forEach((hit) => {
      if (this.frame >= hit.startF && this.frame <= hit.endF) {
        this.spawnHitbox(hit);
      }
    });

    // End move after total frames
    const totalFrames = move.startup + move.active + move.recovery;
    if (this.frame > totalFrames) {
      console.log(`[MovePlayer] Move ${move.id} complete at frame ${this.frame}`);
      this.currentMove = null;
      this.frame = 0;
    }
  }

  private spawnHitbox(hit: HitSpec): void {
    // Create hitbox visualization
    const geo = new THREE.BoxGeometry(hit.halfW * 2, hit.halfH * 2, 1);
    const mat = new THREE.MeshBasicMaterial({ 
      wireframe: true, 
      color: 0xff0000,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);

    // Position hitbox relative to fighter
    const direction = this.facingRight ? 1 : -1;
    mesh.position.set(
      this.fighterPosition.x + (hit.offX * direction),
      this.fighterPosition.y + hit.offY,
      this.fighterPosition.z
    );

    this.scene.add(mesh);
    this.hitboxes.push(mesh);

    console.log(`[MovePlayer] Hitbox spawned at frame ${this.frame}: pos=(${mesh.position.x.toFixed(2)}, ${mesh.position.y.toFixed(2)})`);

    // Check collision immediately
    this.checkCollision(mesh, hit);
  }

  private checkCollision(hitbox: THREE.Mesh, hit: HitSpec): void {
    const hb = this.hurtbox.mesh;

    // AABB collision detection
    const hitBB = new THREE.Box3().setFromObject(hitbox);
    const hurtBB = new THREE.Box3().setFromObject(hb);

    if (hitBB.intersectsBox(hurtBB)) {
      console.log(`[MovePlayer] COLLISION DETECTED at frame ${this.frame}!`);

      // Grab check - grabs beat shields
      if (hit.isGrab) {
        console.log('[MovePlayer] GRAB landed! Bypassing shield.');
        this.applyHit(hit);
        return;
      }

      // Shield check
      if (this.shieldActive) {
        // Check shield HP
        if (this.shieldHP <= 0) {
          console.log('[MovePlayer] Shield broken!');
          this.shieldActive = false;
          this.applyHit(hit);
          return;
        }

        // Apply shield damage
        const shieldDmg = this.currentMove?.shield_damage ?? hit.dmg * 0.5;
        this.shieldHP = Math.max(0, this.shieldHP - shieldDmg);
        this.timeSinceShieldHit = 0;

        console.log(`[MovePlayer] Hit blocked by shield! Shield HP: ${this.shieldHP.toFixed(1)}/${this.maxShieldHP}`);
        this.hitstopFrames = this.currentMove?.hitstopOnBlock ?? 0;
        return;
      }

      this.applyHit(hit);
    }
  }

  private applyHit(hit: HitSpec): void {
    // Apply damage
    this.hurtbox.takeDamage(hit.dmg);

    // Apply hitstop
    this.hitstopFrames = this.currentMove?.hitstopOnHit ?? 0;

    // Apply knockback (unless grab with 0 knockback for throw animation)
    const hb = this.hurtbox.mesh;
    const direction = this.facingRight ? 1 : -1;
    hb.position.x += hit.kbX * direction;
    hb.position.y += hit.kbY;

    const hitType = hit.isGrab ? 'GRAB' : 'HIT';
    console.log(`[MovePlayer] ${hitType}! Damage: ${hit.dmg} | Knockback: (${hit.kbX}, ${hit.kbY}) | Hitstop: ${this.hitstopFrames}f`);
  }

  /**
   * Get shield HP
   */
  getShieldHP(): number {
    return this.shieldHP;
  }

  /**
   * Check if shield is active
   */
  isShielding(): boolean {
    return this.shieldActive && this.shieldHP > 0;
  }

  private clearHitboxes(): void {
    this.hitboxes.forEach((h) => this.scene.remove(h));
    this.hitboxes = [];
  }

  setFacing(right: boolean): void {
    this.facingRight = right;
  }

  setShield(active: boolean): void {
    this.shieldActive = active;
  }

  isBusy(): boolean {
    return this.currentMove !== null || this.hitstopFrames > 0;
  }

  getCurrentFrame(): number {
    return this.frame;
  }
}
