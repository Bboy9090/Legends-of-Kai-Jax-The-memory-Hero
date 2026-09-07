/**
 * DISPLACEMENT SYSTEM
 * Jax's defining traversal mechanic: rapid, collision-aware displacement.
 *
 * The controller returns candidate positions. JaxController remains the sole
 * position writer.
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
  private state: DisplacementState = this.createInitialState();
  private displacementStartPos: THREE.Vector3 | null = null;
  private displacementElapsed = 0;
  private currentDirection = new THREE.Vector3(0, 0, 1);
  private displacementStartedAirborne = false;

  constructor(private scene: THREE.Scene) {}

  update(
    delta: number,
    input: DisplacementInput,
    position: THREE.Vector3,
    isAirborne: boolean
  ): THREE.Vector3 | null {
    this.state.cooldown = Math.max(0, this.state.cooldown - delta);

    if (!isAirborne) {
      this.onLanded();
      if (
        this.state.groundCharges < DISPLACEMENT_CONFIG.groundCharges &&
        this.state.cooldown <= 0 &&
        !this.state.isDisplacing
      ) {
        this.state.groundCharges = DISPLACEMENT_CONFIG.groundCharges;
      }
    }

    if (this.state.isDisplacing && this.displacementStartPos) {
      this.displacementElapsed += delta;
      const progress = Math.min(1, this.displacementElapsed / DISPLACEMENT_CONFIG.duration);

      if (progress >= 1) {
        this.state.isDisplacing = false;
        this.displacementStartPos = null;
        return null;
      }

      const eased = 1 - Math.pow(1 - progress, 2);
      const targetDistance = this.displacementStartedAirborne
        ? DISPLACEMENT_CONFIG.airDistance
        : DISPLACEMENT_CONFIG.groundDistance;

      const candidate = this.displacementStartPos.clone().add(
        this.currentDirection.clone().multiplyScalar(targetDistance * eased)
      );

      const collision = this.sweepCollision(candidate);
      if (collision.blocked) {
        this.state.isDisplacing = false;
        this.state.blocked = true;
        this.state.lastDisplacementVelocity.set(0, 0, 0);
        this.displacementStartPos = null;
        return collision.safePos;
      }

      this.state.blocked = false;
      this.state.lastDisplacementVelocity.copy(this.currentDirection)
        .multiplyScalar(targetDistance / DISPLACEMENT_CONFIG.duration);
      return collision.safePos;
    }

    if (input.traversal && this.state.cooldown <= 0) {
      const canDisplace = isAirborne
        ? this.state.airCharges > 0
        : this.state.groundCharges > 0;

      if (canDisplace) {
        this.startDisplacement(position, input, isAirborne);
        return position.clone();
      }
    }

    return null;
  }

  private startDisplacement(
    position: THREE.Vector3,
    input: DisplacementInput,
    isAirborne: boolean
  ) {
    const requestedDirection = Math.abs(input.moveX) > 0.1 || Math.abs(input.moveY) > 0.1
      ? new THREE.Vector3(input.moveX, 0, input.moveY)
      : input.aiming.clone();

    if (requestedDirection.lengthSq() < 0.0001) {
      requestedDirection.set(0, 0, 1);
    }

    this.currentDirection.copy(requestedDirection.normalize());
    this.state.isDisplacing = true;
    this.state.blocked = false;
    this.displacementStartPos = position.clone();
    this.displacementElapsed = 0;
    this.displacementStartedAirborne = isAirborne;

    if (isAirborne) {
      this.state.airCharges = Math.max(0, this.state.airCharges - 1);
    } else {
      this.state.groundCharges = Math.max(0, this.state.groundCharges - 1);
      this.state.cooldown = DISPLACEMENT_CONFIG.groundCooldown;
    }
  }

  private sweepCollision(targetPos: THREE.Vector3): { safePos: THREE.Vector3; blocked: boolean } {
    const start = this.displacementStartPos ?? targetPos;
    const segment = targetPos.clone().sub(start);
    const distance = segment.length();

    if (distance < 0.001) {
      return { safePos: targetPos.clone(), blocked: false };
    }

    const direction = segment.normalize();
    const raycaster = new THREE.Raycaster(start, direction, 0, distance);
    const colliders: THREE.Object3D[] = [];

    this.scene.traverse((obj) => {
      if (obj.userData.isWall || obj.userData.isCollider) {
        colliders.push(obj);
      }
    });

    const hits = raycaster.intersectObjects(colliders, false);
    if (hits.length === 0) {
      return { safePos: targetPos.clone(), blocked: false };
    }

    const safeDistance = Math.max(0, hits[0].distance - DISPLACEMENT_CONFIG.collisionRadius);
    return {
      safePos: start.clone().add(direction.multiplyScalar(safeDistance)),
      blocked: true,
    };
  }

  onLanded() {
    this.state.airCharges = DISPLACEMENT_CONFIG.airCharges;
  }

  isDisplacing(): boolean {
    return this.state.isDisplacing;
  }

  getState(): DisplacementState {
    return {
      ...this.state,
      lastDisplacementVelocity: this.state.lastDisplacementVelocity.clone(),
    };
  }

  getDisplacementVelocity(): THREE.Vector3 {
    return this.state.lastDisplacementVelocity.clone();
  }

  getConfig() {
    return { ...DISPLACEMENT_CONFIG };
  }

  reset() {
    this.state = this.createInitialState();
    this.displacementStartPos = null;
    this.displacementElapsed = 0;
    this.currentDirection.set(0, 0, 1);
    this.displacementStartedAirborne = false;
  }

  private createInitialState(): DisplacementState {
    return {
      isDisplacing: false,
      cooldown: 0,
      groundCharges: DISPLACEMENT_CONFIG.groundCharges,
      airCharges: DISPLACEMENT_CONFIG.airCharges,
      lastDisplacementVelocity: new THREE.Vector3(),
      blocked: false,
    };
  }
}
