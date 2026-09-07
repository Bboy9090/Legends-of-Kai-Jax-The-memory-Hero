/**
 * DISPLACEMENT SYSTEM
 * Jax's defining traversal mechanic: rapid short displacement with collision awareness
 *
 * Behavior:
 * - GROUND: short rapid dash in movement/aim direction
 * - AIR: air displacement with shorter range
 * - Collision-aware (respects world geometry)
 * - Charges system (1 ground + 1 air per lifecycle)
 * - Short cooldown on ground dash
 */

import * as THREE from 'three';

export interface DisplacementInput {
  traversal: boolean;
  moveX: number;
  moveY: number;
  aiming: THREE.Vector3;
}

export interface DisplacementState {
  isDisplacing: boolean;
  cooldown: number;
  groundCharges: number;
  airCharges: number;
  lastDisplacementVelocity: THREE.Vector3;
  blocked: boolean;
}

const DISPLACEMENT_CONFIG = {
  groundDistance: 6.0,
  groundCooldown: 0.3,
  groundCharges: 1,

  airDistance: 5.5,
  airCharges: 1,

  duration: 0.15,
  speed: 40.0,

  collisionRadius: 0.5,
};

export class DisplacementController {
  private state: DisplacementState = {
    isDisplacing: false,
    cooldown: 0,
    groundCharges: DISPLACEMENT_CONFIG.groundCharges,
    airCharges: DISPLACEMENT_CONFIG.airCharges,
    lastDisplacementVelocity: new THREE.Vector3(),
    blocked: false,
  };

  private scene: THREE.Scene;
  private displacementStartPos: THREE.Vector3 | null = null;
  private displacementElapsed: number = 0;
  private currentDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  update(
    delta: number,
    input: DisplacementInput,
    position: THREE.Vector3,
    isAirborne: boolean
  ): THREE.Vector3 | null {
    // Update cooldown
    if (this.state.cooldown > 0) {
      this.state.cooldown -= delta;
    }

    // Recharge on landing
    if (!isAirborne && this.state.airCharges < DISPLACEMENT_CONFIG.airCharges) {
      this.state.airCharges = DISPLACEMENT_CONFIG.airCharges;
    }

    // Continue current displacement if active
    if (this.state.isDisplacing && this.displacementStartPos) {
      this.displacementElapsed += delta;
      const progress = Math.min(1.0, this.displacementElapsed / DISPLACEMENT_CONFIG.duration);

      if (progress < 1.0) {
        // Easing: fast start, ease out
        const eased = 1.0 - Math.pow(1.0 - progress, 2);
        const targetDist = isAirborne
          ? DISPLACEMENT_CONFIG.airDistance
          : DISPLACEMENT_CONFIG.groundDistance;

        const distance = targetDist * eased;
        const newPos = this.displacementStartPos.clone()
          .add(this.currentDirection.clone().multiplyScalar(distance));

        // Check collision
        if (this.checkCollision(newPos)) {
          this.state.isDisplacing = false;
          this.state.blocked = true;
          return position; // Stop at obstruction
        }

        this.state.blocked = false;
        this.state.lastDisplacementVelocity = this.currentDirection.clone()
          .multiplyScalar(targetDist / DISPLACEMENT_CONFIG.duration);

        return newPos;
      } else {
        // Displacement complete
        this.state.isDisplacing = false;
        return null; // Exit displacement mode
      }
    }

    // Start new displacement if input + charges available
    if (input.traversal && this.state.cooldown <= 0) {
      const canDisplace = isAirborne
        ? this.state.airCharges > 0
        : this.state.groundCharges > 0;

      if (canDisplace) {
        this.startDisplacement(position, input, isAirborne);
        return position; // Displacement will handle movement on next frame
      }
    }

    return null;
  }

  private startDisplacement(
    position: THREE.Vector3,
    input: DisplacementInput,
    isAirborne: boolean
  ) {
    // Determine direction
    if (Math.abs(input.moveX) > 0.1 || Math.abs(input.moveY) > 0.1) {
      // Movement direction takes priority
      this.currentDirection = new THREE.Vector3(input.moveX, 0, input.moveY).normalize();
    } else {
      // Fallback to aiming direction
      this.currentDirection = input.aiming.clone().normalize();
    }

    this.state.isDisplacing = true;
    this.displacementStartPos = position.clone();
    this.displacementElapsed = 0;

    if (isAirborne) {
      this.state.airCharges--;
    } else {
      this.state.groundCharges--;
      this.state.cooldown = DISPLACEMENT_CONFIG.groundCooldown;
    }

    this.state.blocked = false;
  }

  private checkCollision(position: THREE.Vector3): boolean {
    // Simple sphere collision check against scene geometry
    const raycaster = new THREE.Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      DISPLACEMENT_CONFIG.collisionRadius
    );

    const intersects = raycaster.intersectObjects(this.scene.children, true);

    // Check for wall collision
    const wallRay = new THREE.Raycaster(
      position,
      this.currentDirection,
      0,
      DISPLACEMENT_CONFIG.collisionRadius * 2
    );

    const wallIntersects = wallRay.intersectObjects(
      this.scene.children.filter(obj =>
        obj.userData.isWall || obj.userData.isCollider
      ),
      true
    );

    return wallIntersects.length > 0;
  }

  isDisplacing(): boolean {
    return this.state.isDisplacing;
  }

  getState(): DisplacementState {
    return { ...this.state };
  }

  getDisplacementVelocity(): THREE.Vector3 {
    return this.state.lastDisplacementVelocity.clone();
  }

  // For testing/debugging
  reset() {
    this.state = {
      isDisplacing: false,
      cooldown: 0,
      groundCharges: DISPLACEMENT_CONFIG.groundCharges,
      airCharges: DISPLACEMENT_CONFIG.airCharges,
      lastDisplacementVelocity: new THREE.Vector3(),
      blocked: false,
    };
  }
}
