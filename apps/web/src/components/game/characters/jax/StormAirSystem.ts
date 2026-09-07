/**
 * STORM AIR SYSTEM
 * Jax's air mobility and pressure mechanics
 *
 * Features:
 * - Air control: influence fall direction and speed
 * - Pressure bursts: knock enemies back
 * - Storm-assisted hover reduction (cheap fall slowdown)
 */

import * as THREE from 'three';

export interface StormAirInput {
  moveX: number;
  moveY: number;
  jump: boolean;
  traversal: boolean;
}

export interface PressureState {
  intensity: number;
  direction: THREE.Vector3;
  radius: number;
}

const AIR_CONTROL_CONFIG = {
  airAccel: 25.0,
  airDamping: 0.85,
  maxAirSpeed: 6.0,
  fallAccel: 15.0,
  fallMaxSpeed: 12.0,
  hoverMultiplier: 0.8,
};

const PRESSURE_CONFIG = {
  lightForce: 8.0,
  heavyForce: 15.0,
  specialForce: 20.0,
  baseRadius: 3.0,
  heavyRadius: 4.0,
};

export class StormAirSystem {
  private fallVelocity: number = 0;
  private airVelocity: THREE.Vector3 = new THREE.Vector3();
  private isHovering: boolean = false;
  private hoverTimer: number = 0;

  constructor() {}

  updateAirControl(
    delta: number,
    input: StormAirInput,
    currentVelocity: THREE.Vector3,
    isAirborne: boolean
  ): THREE.Vector3 {
    if (!isAirborne) {
      this.fallVelocity = 0;
      this.airVelocity.set(0, 0, 0);
      return currentVelocity;
    }

    // Horizontal air control
    const moveDir = new THREE.Vector3(input.moveX, 0, input.moveY);
    if (moveDir.length() > 0.1) {
      moveDir.normalize();
      this.airVelocity.add(moveDir.multiplyScalar(AIR_CONTROL_CONFIG.airAccel * delta));

      const airSpeed = this.airVelocity.length();
      if (airSpeed > AIR_CONTROL_CONFIG.maxAirSpeed) {
        this.airVelocity.normalize().multiplyScalar(AIR_CONTROL_CONFIG.maxAirSpeed);
      }
    }

    // Air damping
    this.airVelocity.multiplyScalar(AIR_CONTROL_CONFIG.airDamping);

    // Vertical (fall) control
    this.fallVelocity = Math.min(
      this.fallVelocity + AIR_CONTROL_CONFIG.fallAccel * delta,
      AIR_CONTROL_CONFIG.fallMaxSpeed
    );

    // Storm hover: hold jump to reduce fall (light effect, not true flight)
    if (input.jump && this.fallVelocity > 2.0) {
      this.isHovering = true;
      this.hoverTimer += delta;
      this.fallVelocity *= AIR_CONTROL_CONFIG.hoverMultiplier;
    } else {
      this.isHovering = false;
      this.hoverTimer = 0;
    }

    // Combine velocities
    const result = currentVelocity.clone();
    result.x += this.airVelocity.x;
    result.z += this.airVelocity.z;
    result.y -= this.fallVelocity * delta;

    return result;
  }

  calculatePressure(
    intensity: 'light' | 'heavy' | 'special',
    position: THREE.Vector3,
    direction: THREE.Vector3
  ): PressureState {
    const force = intensity === 'light'
      ? PRESSURE_CONFIG.lightForce
      : intensity === 'heavy'
        ? PRESSURE_CONFIG.heavyForce
        : PRESSURE_CONFIG.specialForce;

    const radius = intensity === 'heavy' || intensity === 'special'
      ? PRESSURE_CONFIG.heavyRadius
      : PRESSURE_CONFIG.baseRadius;

    return {
      intensity: force,
      direction: direction.normalize(),
      radius,
    };
  }

  applyPressureForce(
    targetPos: THREE.Vector3,
    pressureOrigin: THREE.Vector3,
    pressure: PressureState
  ): THREE.Vector3 | null {
    const distance = targetPos.distanceTo(pressureOrigin);

    if (distance > pressure.radius || distance < 0.01) {
      return null; // Out of range or zero distance
    }

    // Radial force falloff
    const falloff = 1.0 - (distance / pressure.radius);
    const force = pressure.intensity * falloff;

    const direction = targetPos.clone()
      .sub(pressureOrigin)
      .normalize();

    return direction.multiplyScalar(force);
  }

  isHoveringNow(): boolean {
    return this.isHovering;
  }

  getHoverTime(): number {
    return this.hoverTimer;
  }

  reset() {
    this.fallVelocity = 0;
    this.airVelocity.set(0, 0, 0);
    this.isHovering = false;
    this.hoverTimer = 0;
  }
}
