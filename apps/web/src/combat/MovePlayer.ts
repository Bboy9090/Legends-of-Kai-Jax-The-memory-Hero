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
  onCombo?: (count: number, totalDamage: number) => void;
  onHitstun?: (frames: number) => void;
  onDodge?: (active: boolean) => void;
}

export class MovePlayer {
  currentMove: MoveSpec | null = null;
  frame = 0;
  hitboxes: THREE.Mesh[] = [];
  scene: THREE.Scene;
  hurtbox: Hurtbox;
  hitstopFrames = 0;
  fighterPosition: THREE.Vector3;
  facingRight = true;
  shieldActive = false;
  shieldHP = 100;
  maxShieldHP = 100;
  shieldRegenRate = 10;
  shieldRegenDelay = 2.0;
  timeSinceShieldHit = 0;
  callbacks: MovePlayerCallbacks = {};

  /** Defender feel-state. */
  hitstunFrames = 0;
  dodgeInvulnerabilityFrames = 0;
  directionalInfluence = 0;
  comboCount = 0;
  comboDamage = 0;
  comboWindowFrames = 0;
  maxComboWindowFrames = 90;

  /** Prevents the same authored hit from connecting more than once per move execution. */
  private connectedHitIndexes = new Set<number>();

  private rig: CharacterRig | null = null;
  private _socketWorldPos = new THREE.Vector3();

  constructor(scene: THREE.Scene, hurtbox: Hurtbox, fighterPosition: THREE.Vector3) {
    this.scene = scene;
    this.hurtbox = hurtbox;
    this.fighterPosition = fighterPosition;
  }

  setCallbacks(cb: MovePlayerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...cb };
  }

  setRig(rig: CharacterRig | null): void {
    this.rig = rig;
  }

  private resolveSocket(name: string): THREE.Object3D | null {
    if (!this.rig || !this.rig.loaded) return null;
    switch (name) {
      case 'root': return this.rig.root;
      case 'spine': return this.rig.spine;
      case 'head': return this.rig.head;
      default: {
        const m = name.match(/^tail_(\d{2})$/);
        if (!m) return null;
        const idx = parseInt(m[1], 10) - 1;
        return idx >= 0 && idx < 9 ? this.rig.tails[idx] ?? null : null;
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
    this.connectedHitIndexes.clear();
    this.callbacks.onMoveStart?.(move);
  }

  update(): void {
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return;
    }

    if (this.hitstunFrames > 0) this.hitstunFrames--;
    if (this.dodgeInvulnerabilityFrames > 0) {
      this.dodgeInvulnerabilityFrames--;
      if (this.dodgeInvulnerabilityFrames === 0) this.callbacks.onDodge?.(false);
    }
    if (this.comboWindowFrames > 0) {
      this.comboWindowFrames--;
      if (this.comboWindowFrames === 0) this.resetCombo();
    }

    if (!this.currentMove) {
      if (!this.shieldActive && this.shieldHP < this.maxShieldHP) {
        this.timeSinceShieldHit += 1 / 60;
        if (this.timeSinceShieldHit >= this.shieldRegenDelay) {
          this.shieldHP = Math.min(this.maxShieldHP, this.shieldHP + this.shieldRegenRate / 60);
        }
      }
      return;
    }

    this.clearHitboxes();
    const move = this.currentMove;
    this.frame++;

    move.hits.forEach((hit, index) => {
      if (this.frame >= hit.startF && this.frame <= hit.endF) this.spawnHitbox(hit, index);
    });

    const totalFrames = move.startup + move.active + move.recovery;
    if (this.frame > totalFrames) {
      this.currentMove = null;
      this.frame = 0;
      this.connectedHitIndexes.clear();
    }
  }

  private spawnHitbox(hit: HitSpec, hitIndex: number): void {
    const geo = new THREE.BoxGeometry(hit.halfW * 2, hit.halfH * 2, 1);
    const mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xff0000, transparent: true, opacity: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    const direction = this.facingRight ? 1 : -1;

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
      const FOOT_OFFSET = 0.9;
      mesh.position.set(
        this.fighterPosition.x + hit.offX * direction,
        this.fighterPosition.y + hit.offY - FOOT_OFFSET,
        this.fighterPosition.z
      );
    }

    this.scene.add(mesh);
    this.hitboxes.push(mesh);
    this.callbacks.onActiveFrame?.(hit, mesh.position.clone());
    this.checkCollision(mesh, hit, hitIndex);
  }

  private checkCollision(hitbox: THREE.Mesh, hit: HitSpec, hitIndex: number): void {
    if (this.connectedHitIndexes.has(hitIndex)) return;
    if (this.dodgeInvulnerabilityFrames > 0) return;

    const hitBB = new THREE.Box3().setFromObject(hitbox);
    const hurtBB = new THREE.Box3().setFromObject(this.hurtbox.mesh);
    if (!hitBB.intersectsBox(hurtBB)) return;

    if (hit.isGrab) {
      this.connectedHitIndexes.add(hitIndex);
      this.applyHit(hit, hitbox.position.clone());
      return;
    }

    if (this.shieldActive) {
      if (this.shieldHP <= 0) {
        this.shieldActive = false;
        this.callbacks.onShieldBreak?.(hitbox.position.clone());
        this.connectedHitIndexes.add(hitIndex);
        this.applyHit(hit, hitbox.position.clone());
        return;
      }

      const shieldDmg = this.currentMove?.shield_damage ?? hit.dmg * 0.5;
      this.shieldHP = Math.max(0, this.shieldHP - shieldDmg);
      this.timeSinceShieldHit = 0;
      this.hitstopFrames = this.currentMove?.hitstopOnBlock ?? 0;
      this.connectedHitIndexes.add(hitIndex);
      this.callbacks.onBlock?.(hit, hitbox.position.clone());
      return;
    }

    this.connectedHitIndexes.add(hitIndex);
    this.applyHit(hit, hitbox.position.clone());
  }

  private applyHit(hit: HitSpec, hitPos?: THREE.Vector3): void {
    this.hurtbox.takeDamage(hit.dmg);
    this.hitstopFrames = this.currentMove?.hitstopOnHit ?? 0;

    const damageTaken = Math.max(0, this.hurtbox.maxHealth - this.hurtbox.health);
    const launchScale = 1 + Math.min(0.75, damageTaken / 200);
    const diResist = THREE.MathUtils.clamp(this.currentMove?.di_resist ?? 0, 0, 1);
    const diInfluence = this.directionalInfluence * (1 - diResist) * 0.35;
    const direction = this.facingRight ? 1 : -1;
    const horizontalLaunch = (hit.kbX + diInfluence) * direction * launchScale;
    const verticalLaunch = hit.kbY * launchScale;

    this.hurtbox.mesh.position.x += horizontalLaunch;
    this.hurtbox.mesh.position.y += verticalLaunch;

    const knockbackMagnitude = Math.abs(horizontalLaunch) + Math.abs(verticalLaunch);
    this.hitstunFrames = Math.max(6, Math.round(6 + hit.dmg * 0.8 + knockbackMagnitude * 2));
    this.callbacks.onHitstun?.(this.hitstunFrames);

    this.comboCount += 1;
    this.comboDamage += hit.dmg;
    this.comboWindowFrames = this.maxComboWindowFrames;
    this.callbacks.onCombo?.(this.comboCount, this.comboDamage);

    const fxPos = hitPos ?? this.hurtbox.mesh.position.clone();
    this.callbacks.onHit?.(hit, fxPos);
  }

  setDirectionalInfluence(value: number): void {
    this.directionalInfluence = THREE.MathUtils.clamp(value, -1, 1);
  }

  startDodge(invulnerabilityFrames = 12): boolean {
    if (this.hitstunFrames > 0 || this.currentMove || this.shieldActive) return false;
    this.dodgeInvulnerabilityFrames = Math.max(1, Math.floor(invulnerabilityFrames));
    this.callbacks.onDodge?.(true);
    return true;
  }

  isDodging(): boolean {
    return this.dodgeInvulnerabilityFrames > 0;
  }

  isInHitstun(): boolean {
    return this.hitstunFrames > 0;
  }

  getComboState(): { count: number; damage: number; windowFrames: number } {
    return { count: this.comboCount, damage: this.comboDamage, windowFrames: this.comboWindowFrames };
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.comboDamage = 0;
    this.comboWindowFrames = 0;
  }

  getShieldHP(): number { return this.shieldHP; }
  isShielding(): boolean { return this.shieldActive && this.shieldHP > 0; }

  private clearHitboxes(): void {
    this.hitboxes.forEach((h) => {
      this.scene.remove(h);
      h.geometry.dispose();
      if (Array.isArray(h.material)) h.material.forEach((m) => m.dispose());
      else h.material.dispose();
    });
    this.hitboxes = [];
  }

  setFacing(right: boolean): void { this.facingRight = right; }
  setShield(active: boolean): void { this.shieldActive = active; }
  isBusy(): boolean { return this.currentMove !== null || this.hitstopFrames > 0 || this.hitstunFrames > 0; }
  getCurrentFrame(): number { return this.frame; }
}
