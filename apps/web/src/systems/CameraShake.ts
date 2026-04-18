/**
 * Camera Shake
 * Offset-based trauma model. Call `add(amount)` to accumulate shake,
 * then `update(dt)` each frame to apply decay + offset to camera.
 */

import * as THREE from 'three';

export class CameraShake {
  private trauma: number = 0;
  private basePosition: THREE.Vector3 = new THREE.Vector3();
  private decayRate: number = 2.5;
  private maxOffset: number = 0.35;

  /**
   * Capture the camera's resting position. Must be called after camera is positioned.
   */
  setBasePosition(pos: THREE.Vector3): void {
    this.basePosition.copy(pos);
  }

  /**
   * Add trauma amount (0..1). Quadratic falloff makes small values subtle
   * and big ones jarring.
   */
  add(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /**
   * Apply shake to a camera.
   */
  update(deltaTime: number, camera: THREE.Camera): void {
    this.trauma = Math.max(0, this.trauma - this.decayRate * deltaTime);

    if (this.trauma <= 0) {
      camera.position.copy(this.basePosition);
      return;
    }

    const t2 = this.trauma * this.trauma;
    const ox = (Math.random() - 0.5) * this.maxOffset * t2;
    const oy = (Math.random() - 0.5) * this.maxOffset * t2;
    const oz = (Math.random() - 0.5) * this.maxOffset * 0.5 * t2;

    camera.position.set(
      this.basePosition.x + ox,
      this.basePosition.y + oy,
      this.basePosition.z + oz
    );
  }
}
