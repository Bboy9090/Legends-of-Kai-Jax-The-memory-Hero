/**
 * Player Controller
 * WASD movement with physics
 */

import * as THREE from 'three';

export class PlayerController {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private moveSpeed: number = 4.0;
  private acceleration: number = 20.0;
  private friction: number = 0.85;
  private keys: { [key: string]: boolean } = {};

  // Arena boundaries
  private minX: number = -14;
  private maxX: number = 14;
  private minZ: number = -9;
  private maxZ: number = 9;

  constructor(position: THREE.Vector3) {
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.setupInput();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  /**
   * Update player physics and position
   */
  update(deltaTime: number): void {
    // Get input direction
    const inputDir = new THREE.Vector3();

    if (this.keys['w']) inputDir.z -= 1;
    if (this.keys['s']) inputDir.z += 1;
    if (this.keys['a']) inputDir.x -= 1;
    if (this.keys['d']) inputDir.x += 1;

    // Normalize diagonal movement
    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
    }

    // Apply acceleration
    const targetVelocity = inputDir.multiplyScalar(this.moveSpeed);
    this.velocity.lerp(targetVelocity, this.acceleration * deltaTime);

    // Apply friction when no input
    if (inputDir.lengthSq() === 0) {
      this.velocity.multiplyScalar(this.friction);
    }

    // Update position
    this.position.add(
      new THREE.Vector3()
        .copy(this.velocity)
        .multiplyScalar(deltaTime)
    );

    // Clamp to arena boundaries
    this.position.x = Math.max(this.minX, Math.min(this.maxX, this.position.x));
    this.position.z = Math.max(this.minZ, Math.min(this.maxZ, this.position.z));

    // Keep Y stable (ground level)
    this.position.y = 0.9;
  }

  /**
   * Get current position
   */
  getPosition(): THREE.Vector3 {
    return this.position;
  }

  /**
   * Get current velocity
   */
  getVelocity(): THREE.Vector3 {
    return this.velocity;
  }

  /**
   * Check if player is moving
   */
  isMoving(): boolean {
    return this.velocity.lengthSq() > 0.01;
  }

  /**
   * Get movement direction (for facing)
   */
  getMovementDirection(): THREE.Vector3 {
    return this.velocity.clone().normalize();
  }

  /**
   * Set base move speed (for character-specific tuning)
   */
  setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * Set arena boundaries
   */
  setBoundaries(minX: number, maxX: number, minZ: number, maxZ: number): void {
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
  }

  /**
   * Get speed for stats
   */
  getSpeed(): number {
    return this.velocity.length();
  }
}
