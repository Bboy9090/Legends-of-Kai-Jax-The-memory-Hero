/**
 * Boss Entity
 * Boss-tier enemy: uses BossAI (multi-phase), larger mesh, bigger hurtbox
 */

import * as THREE from 'three';
import { Hurtbox } from '../combat/Hurtbox';
import { MovePlayer } from '../combat/MovePlayer';
import { BossAI } from '../ai/BossAI';
import { loadCharacterRig, CHARACTER_GLB, type CharacterRig } from '../characters/GLBCharacterLoader';
import type { MoveSpec } from '../types/MoveSpec';
import type { AITarget } from '../ai/SimpleAI';

export class BossEntity {
  public id: string;
  public mesh: THREE.Mesh;
  public hurtbox: Hurtbox;
  private movePlayer: MovePlayer;
  private ai: BossAI;
  private scene: THREE.Scene;
  private maxHP: number;
  private isDead: boolean = false;
  private rig: CharacterRig | null = null;

  constructor(
    scene: THREE.Scene,
    id: string,
    x: number,
    y: number,
    hp: number = 100
  ) {
    this.scene = scene;
    this.id = id;
    this.maxHP = hp;

    // Larger visual mesh (boss)
    const geo = new THREE.BoxGeometry(1.3, 2.4, 0.7);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, y + 0.4, 0);
    scene.add(this.mesh);

    // Bigger hurtbox
    this.hurtbox = new Hurtbox(scene, 1.2, 2.2);
    this.hurtbox.setPosition(x, y + 0.4, 0);
    this.hurtbox.health = hp;
    this.hurtbox.maxHealth = hp;

    // Combat + AI
    this.movePlayer = new MovePlayer(scene, this.hurtbox, this.mesh.position);
    this.ai = new BossAI(this.movePlayer, this.mesh.position, hp);

    console.log(`[BossEntity] Spawned ${id} at (${x}, ${y}) with ${hp} HP`);

    // Async GLB swap (boss = KaiJax fusion form)
    this.loadBossGLB();
  }

  private async loadBossGLB(): Promise<void> {
    const base = import.meta.env.BASE_URL;
    const path = CHARACTER_GLB.kaijax;
    if (!path) return;
    const rig = await loadCharacterRig(`${base}${path}`, {
      color: 0xff0000,
      targetHeight: 2.4,
      debug: true,
    });
    if (!rig.loaded) return;
    this.mesh.visible = false;
    rig.group.position.copy(this.mesh.position);
    rig.group.position.y = 0;
    this.scene.add(rig.group);
    this.rig = rig;
    // Hand rig to the boss's MovePlayer so socket-authored hits work
    this.movePlayer.setRig(rig);
    console.log(`[BossEntity ${this.id}] Real GLB visual loaded`);
  }

  async loadMove(moveId: string): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}moves/${moveId}.json`);
      const move: MoveSpec = await response.json();
      this.ai.loadMove(move);
      console.log(`[BossEntity ${this.id}] Loaded move: ${moveId}`);
    } catch (error) {
      console.error(`[BossEntity ${this.id}] Failed to load move:`, error);
    }
  }

  setTarget(target: AITarget): void {
    this.ai.setTarget(target);
  }

  /**
   * Access the underlying MovePlayer for feedback callback wiring.
   */
  getMovePlayer(): MovePlayer {
    return this.movePlayer;
  }

  update(deltaTime: number): void {
    if (this.isDead) return;

    this.ai.update(deltaTime);
    this.movePlayer.update();

    const aiPos = this.ai.getPosition();
    this.mesh.position.copy(aiPos);
    this.hurtbox.setPosition(aiPos.x, aiPos.y, aiPos.z);
    if (this.rig?.loaded) {
      this.rig.group.position.set(aiPos.x, 0, aiPos.z);
    }
    if (this.rig?.loaded) {
      this.rig.group.position.set(aiPos.x, 0, aiPos.z);
    }

    if (this.hurtbox.getHealth() <= 0 && !this.isDead) {
      this.die();
    }
  }

  takeDamage(damage: number, knockback: THREE.Vector2): void {
    this.hurtbox.takeDamage(damage);
    this.ai.takeDamage(damage, knockback);

    // Phase-based tint flash
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    const phase = this.ai.getPhase();
    const flashColor = phase === 'phase3' ? 0xffff00 : phase === 'phase2' ? 0xff8800 : 0xffffff;
    mat.color.setHex(flashColor);
    setTimeout(() => {
      const base = phase === 'phase3' ? 0xff5500 : phase === 'phase2' ? 0xcc2222 : 0xff0000;
      mat.color.setHex(base);
    }, 120);
  }

  checkAttackHit(targetHurtbox: Hurtbox): boolean {
    const activeHitboxes = this.movePlayer['hitboxes'];
    if (activeHitboxes.length === 0) return false;

    for (const hitbox of activeHitboxes) {
      const hitBB = new THREE.Box3().setFromObject(hitbox);
      const hurtBB = new THREE.Box3().setFromObject(targetHurtbox.mesh);
      if (hitBB.intersectsBox(hurtBB)) {
        return true;
      }
    }
    return false;
  }

  private die(): void {
    this.isDead = true;
    console.log(`[BossEntity ${this.id}] DEFEATED — ${this.maxHP} HP cleared`);

    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    mat.opacity = 0.3;

    setTimeout(() => this.destroy(), 1500);
  }

  destroy(): void {
    this.scene.remove(this.mesh);
    this.hurtbox.destroy(this.scene);
  }

  isDefeated(): boolean {
    return this.isDead;
  }

  getHP(): number {
    return this.hurtbox.getHealth();
  }

  getMaxHP(): number {
    return this.maxHP;
  }

  getPhase(): string {
    return this.ai.getPhase();
  }

  getState(): string {
    return this.ai.getState();
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}

