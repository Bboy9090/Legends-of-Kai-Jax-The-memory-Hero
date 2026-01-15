// Combat Testing Utilities
// Path: packages/game/src/debug/CombatDebugger.ts

import * as THREE from 'three';
import { CombatSystem } from '@game/systems/CombatSystem';

/**
 * Debug visualization for combat system
 * Shows hitboxes, hurtboxes, and collision debug data
 */
export class CombatDebugger {
  private scene: THREE.Scene;
  private combatSystem: CombatSystem;
  private debugObjects: THREE.Object3D[] = [];
  private enabled = false;

  constructor(scene: THREE.Scene, combatSystem: CombatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
  }

  /**
   * Enable/disable debug visualization
   */
  public toggle(): void {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.clearDebugObjects();
    }
  }

  /**
   * Visualize hitboxes and hurtboxes
   */
  public visualize(characterId: string): void {
    if (!this.enabled) return;

    this.clearDebugObjects();

    // Visualize hitboxes (green spheres)
    const hitBoxes = this.combatSystem.getActiveHitBoxes(characterId);
    for (const box of hitBoxes) {
      const geometry = new THREE.SphereGeometry(box.radius, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(box.position);
      this.scene.add(mesh);
      this.debugObjects.push(mesh);
    }

    // Visualize hurtbox (red sphere)
    const hurtBox = this.combatSystem.getHurtBox(characterId);
    if (hurtBox) {
      const geometry = new THREE.SphereGeometry(hurtBox.radius, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(hurtBox.position);
      this.scene.add(mesh);
      this.debugObjects.push(mesh);
    }
  }

  /**
   * Clear all debug objects
   */
  private clearDebugObjects(): void {
    for (const obj of this.debugObjects) {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    }
    this.debugObjects = [];
  }
}

/**
 * Animation state machine debugger
 */
export class AnimationDebugger {
  private stats: any = {};
  private targetElement: HTMLElement | null = null;

  constructor(elementId: string) {
    this.targetElement = document.getElementById(elementId);
  }

  /**
   * Update animation stats display
   */
  public updateStats(state: string, progress: number, isFinished: boolean): void {
    this.stats = { state, progress: progress.toFixed(2), isFinished };
    this.render();
  }

  /**
   * Render stats to DOM
   */
  private render(): void {
    if (!this.targetElement) return;
    this.targetElement.innerHTML = `
      <div style="font-family: monospace; color: #0f0; background: #000; padding: 10px;">
        <p>Animation State: ${this.stats.state}</p>
        <p>Progress: ${this.stats.progress}</p>
        <p>Finished: ${this.stats.isFinished}</p>
      </div>
    `;
  }
}

/**
 * Combat metrics tracker
 */
export class CombatMetrics {
  private totalDamageDealt = 0;
  private totalDamageTaken = 0;
  private hitCount = 0;
  private missCount = 0;
  private startTime = Date.now();

  /**
   * Record a hit
   */
  public recordHit(damage: number): void {
    this.totalDamageDealt += damage;
    this.hitCount++;
  }

  /**
   * Record damage taken
   */
  public recordDamageTaken(damage: number): void {
    this.totalDamageTaken += damage;
  }

  /**
   * Record a miss
   */
  public recordMiss(): void {
    this.missCount++;
  }

  /**
   * Get metrics summary
   */
  public getMetrics() {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    const accuracy = this.hitCount / (this.hitCount + this.missCount) || 0;
    const dps = this.totalDamageDealt / elapsedSeconds;

    return {
      totalDamageDealt: this.totalDamageDealt.toFixed(1),
      totalDamageTaken: this.totalDamageTaken.toFixed(1),
      hitCount: this.hitCount,
      missCount: this.missCount,
      accuracy: (accuracy * 100).toFixed(1) + '%',
      dps: dps.toFixed(1),
      timeElapsed: elapsedSeconds.toFixed(1) + 's',
    };
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.startTime = Date.now();
  }
}
