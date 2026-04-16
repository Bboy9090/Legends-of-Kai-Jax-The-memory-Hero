/**
 * Enemy Entity
 * Complete enemy with combat + AI + visual
 */

import * as THREE from 'three';
import { Hurtbox } from '../combat/Hurtbox';
import { MovePlayer } from '../combat/MovePlayer';
import { SimpleAI } from '../ai/SimpleAI';
import type { MoveSpec } from '../types/MoveSpec';
import type { AITarget } from '../ai/SimpleAI';

export class EnemyEntity {
  public id: string;
  public mesh: THREE.Mesh;
  public hurtbox: Hurtbox;
  private movePlayer: MovePlayer;
  private ai: SimpleAI;
  private scene: THREE.Scene;
  private hp: number;
  private maxHP: number;
  private isDead: boolean = false;

  constructor(
    scene: THREE.Scene,
    id: string,
    x: number,
    y: number,
    hp: number,
    color: number = 0xff5555
  ) {
    this.scene = scene;
    this.id = id;
    this.hp = hp;
    this.maxHP = hp;

    // Create visual mesh
    const geo = new THREE.BoxGeometry(0.8, 1.6, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, y, 0);
    scene.add(this.mesh);

    // Create hurtbox
    this.hurtbox = new Hurtbox(scene, 0.8, 1.6);
    this.hurtbox.setPosition(x, y, 0);
    this.hurtbox.health = hp;
    this.hurtbox.maxHealth = hp;

    // Create combat system
    this.movePlayer = new MovePlayer(scene, this.hurtbox, this.mesh.position);

    // Create AI
    this.ai = new SimpleAI(this.movePlayer, this.mesh.position);

    console.log(`[EnemyEntity] Created ${id} at (${x}, ${y}) with ${hp} HP`);
  }

  /**
   * Load move for AI to use
   */
  async loadMove(moveId: string): Promise<void> {
    try {
      const response = await fetch(`/moves/${moveId}.json`);
      const move: MoveSpec = await response.json();
      this.ai.loadMove(move);
      console.log(`[EnemyEntity ${this.id}] Loaded move: ${moveId}`);
    } catch (error) {
      console.error(`[EnemyEntity ${this.id}] Failed to load move:`, error);
    }
  }

  /**
   * Set AI target (player)
   */
  setTarget(target: AITarget): void {
    this.ai.setTarget(target);
  }

  /**
   * Update enemy each frame
   */
  update(deltaTime: number): void {
    if (this.isDead) return;

    // Update AI
    this.ai.update(deltaTime);

    // Update combat
    this.movePlayer.update();

    // Sync mesh position with AI
    const aiPos = this.ai.getPosition();
    this.mesh.position.copy(aiPos);
    this.hurtbox.setPosition(aiPos.x, aiPos.y, aiPos.z);

    // Check HP
    if (this.hurtbox.getHealth() <= 0 && !this.isDead) {
      this.die();
    }
  }

  /**
   * Take damage from player attack
   */
  takeDamage(damage: number, knockback: THREE.Vector2): void {
    this.hurtbox.takeDamage(damage);
    this.ai.takeDamage(damage, knockback);

    // Visual feedback
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.color.setHex(0xff0000);
    setTimeout(() => {
      mat.color.setHex(0xff5555);
    }, 100);

    console.log(`[EnemyEntity ${this.id}] Took ${damage} damage. HP: ${this.hurtbox.getHealth()}/${this.maxHP}`);
  }

  /**
   * Check if enemy's attacks hit target
   */
  checkAttackHit(targetHurtbox: Hurtbox): boolean {
    const activeHitboxes = this.movePlayer['hitboxes']; // Access private for collision check
    if (activeHitboxes.length === 0) return false;

    // Simple AABB collision
    for (const hitbox of activeHitboxes) {
      const hitBB = new THREE.Box3().setFromObject(hitbox);
      const hurtBB = new THREE.Box3().setFromObject(targetHurtbox.mesh);

      if (hitBB.intersectsBox(hurtBB)) {
        console.log(`[EnemyEntity ${this.id}] Attack hit target!`);
        return true;
      }
    }

    return false;
  }

  /**
   * Handle death
   */
  private die(): void {
    this.isDead = true;
    console.log(`[EnemyEntity ${this.id}] DEFEATED`);

    // Visual: fade out
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    mat.opacity = 0.3;

    // Remove after delay
    setTimeout(() => {
      this.destroy();
    }, 1000);
  }

  /**
   * Destroy entity
   */
  destroy(): void {
    this.scene.remove(this.mesh);
    this.hurtbox.destroy(this.scene);
    console.log(`[EnemyEntity ${this.id}] Destroyed`);
  }

  /**
   * Check if dead
   */
  isDefeated(): boolean {
    return this.isDead;
  }

  /**
   * Get current HP
   */
  getHP(): number {
    return this.hurtbox.getHealth();
  }

  /**
   * Get position
   */
  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  /**
   * Get AI state for debugging
   */
  getAIState(): string {
    return this.ai.getState();
  }
}
