/**
 * MovePlayer — Runtime Move Interpreter
 * Authoritative implementation from combat kernel spec
 */

import * as THREE from 'three';
import type { MoveSpec, HitSpec } from '../types/MoveSpec';
import { Hurtbox } from './Hurtbox';
import type { CharacterRig } from '../characters/GLBCharacterLoader';

export interface MovePlayerCallbacks {
  onMoveStart?: (move: MoveSpec) => void;
  onHit?: (hit: HitSpec, hitboxPosition: THREE.Vector3) => void;
  onBlock?: (hit: HitSpec, hitboxPosition: THREE.Vector3) => void;
  onShieldBreak?: (hitboxPosition: THREE.Vector3) => void;
  onActiveFrame?: (hit: HitSpec, hitboxPosition: THREE.Vector3) => void;
}

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
  callbacks: MovePlayerCallbacks = {};
  /** Optional rig (real GLB) for bone-socket hitbox attachment.
   *  When null OR a requested socket is missing, MovePlayer falls back
   *  to fighter root + facing math. */
  private rig: CharacterRig | null = null;
  /** Reusable scratch vector for socket world-position lookups */
  private _socketWorldPos: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, hurtbox: Hurtbox, fighterPosition: THREE.Vector3) {
    this.scene = scene;
    this.hurtbox = hurtbox;
    this.fighterPosition = fighterPosition;
  }

  /**
   * Register feedback callbacks (VFX/audio hooks).
   */
  setCallbacks(cb: MovePlayerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...cb };
  }

  /**
   * Attach (or detach) a CharacterRig for bone-socket hitbox math.
   * Pass null to revert to root+facing fallback. Idempotent.
   */
  setRig(rig: CharacterRig | null): void {
    this.rig = rig;
    if (rig?.loaded) {
      const tails = rig.tails.filter((t) => t).length;
      console.log(`[MovePlayer] Rig attached. Anchors: root=${!!rig.root} spine=${!!rig.spine} head=${!!rig.head} tails=${tails}/9`);
    }
  }

  /**
   * Resolve a HitSpec.socket name to a Three.Object3D from the active rig.
   * Returns null if the rig is missing or the socket isn't present —
   * caller is expected to fall back to root+facing math.
   */
  private resolveSocket(name: string): THREE.Object3D | null {
    if (!this.rig || !this.rig.loaded) return null;
    switch (name) {
      case 'root':
        return this.rig.root;
      case 'spine':
        return this.rig.spine;
      case 'head':
        return this.rig.head;
      default: {
        const m = name.match(/^tail_(\d{2})$/);
        if (m) {
          const idx = parseInt(m[1], 10) - 1;
          if (idx >= 0 && idx < 9) return this.rig.tails[idx] ?? null;
        }
        return null;
      }
    }
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
    this.callbacks.onMoveStart?.(move);
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

    const direction = this.facingRight ? 1 : -1;

    // ── Socket-aware attachment with graceful degradation ───────────
    // If the move authored a socket name AND the active rig exposes that
    // anchor, position relative to the socket's world transform.
    // Otherwise, fall back to root + facing math (legacy behavior).
    let attachedToSocket = false;
    if (hit.socket) {
      const socket = this.resolveSocket(hit.socket);
      if (socket) {
        socket.updateMatrixWorld();
        socket.getWorldPosition(this._socketWorldPos);
        mesh.position.set(
          this._socketWorldPos.x + hit.offX * direction,
          this._socketWorldPos.y + hit.offY,
          this._socketWorldPos.z
        );
        attachedToSocket = true;
      }
    }

    if (!attachedToSocket) {
      // Position hitbox relative to fighter root.
      // offY is authored as "height above feet", but fighterPosition.y is
      // the mesh-CENTER (meshes are 1.8 tall, centered at y=0.9). Subtract
      // half-height so offY behaves like ground-relative chest/head anchor.
      const FOOT_OFFSET = 0.9;
      mesh.position.set(
        this.fighterPosition.x + hit.offX * direction,
        this.fighterPosition.y + hit.offY - FOOT_OFFSET,
        this.fighterPosition.z
      );
    }

    this.scene.add(mesh);
    this.hitboxes.push(mesh);

    const attachLog = attachedToSocket
      ? `socket='${hit.socket}'`
      : hit.socket
      ? `fallback(root+facing) [socket='${hit.socket}' missing on rig]`
      : 'root+facing';
    console.log(`[MovePlayer] Hitbox @ frame ${this.frame} pos=(${mesh.position.x.toFixed(2)}, ${mesh.position.y.toFixed(2)}) attach=${attachLog}`);

    // Emit active-frame callback (for attack trails)
    this.callbacks.onActiveFrame?.(hit, mesh.position.clone());

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
        this.applyHit(hit, hitbox.position.clone());
        return;
      }

      // Shield check
      if (this.shieldActive) {
        // Check shield HP
        if (this.shieldHP <= 0) {
          console.log('[MovePlayer] Shield broken!');
          this.shieldActive = false;
          this.callbacks.onShieldBreak?.(hitbox.position.clone());
          this.applyHit(hit, hitbox.position.clone());
          return;
        }

        // Apply shield damage
        const shieldDmg = this.currentMove?.shield_damage ?? hit.dmg * 0.5;
        this.shieldHP = Math.max(0, this.shieldHP - shieldDmg);
        this.timeSinceShieldHit = 0;

        console.log(`[MovePlayer] Hit blocked by shield! Shield HP: ${this.shieldHP.toFixed(1)}/${this.maxShieldHP}`);
        this.hitstopFrames = this.currentMove?.hitstopOnBlock ?? 0;
        this.callbacks.onBlock?.(hit, hitbox.position.clone());
        return;
      }

      this.applyHit(hit, hitbox.position.clone());
    }
  }

  private applyHit(hit: HitSpec, hitPos?: THREE.Vector3): void {
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

    // Emit hit feedback callback with hitbox position (fallback to hurtbox pos)
    const fxPos = hitPos ?? hb.position.clone();
    this.callbacks.onHit?.(hit, fxPos);
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
