/**
 * STORM AIR SYSTEM
 * Jax's air mobility and pressure mechanics.
 *
 * This system owns Jax's airborne velocity calculation. JaxController remains
 * the sole position writer.
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
  gravity: 20.0,
  terminalVelocity: 12.0,
  hoverGravityMultiplier: 0.55,
  hoverTerminalMultiplier: 0.8,
};

const PRESSURE_CONFIG = {
  lightForce: 8.0,
  heavyForce: 15.0,
  specialForce: 20.0,
  baseRadius: 3.0,
  heavyRadius: 4.0,
};

export class StormAirSystem {
  private isHovering = false;
  private hoverTimer = 0;

  updateAirControl(
    delta: number,
    input: StormAirInput,
    currentVelocity: THREE.Vector3,
    isAirborne: boolean
  ): THREE.Vector3 {
    const result = currentVelocity.clone();

    if (!isAirborne) {
      this.isHovering = false;
      this.hoverTimer = 0;
      return result;
    }

    // Horizontal air control is bounded and frame-rate independent.
    const moveDir = new THREE.Vector3(input.moveX, 0, input.moveY);
    if (moveDir.lengthSq() > 0.01) {
      moveDir.normalize().multiplyScalar(AIR_CONTROL_CONFIG.maxAirSpeed);
      const alpha = Math.min(1, AIR_CONTROL_CONFIG.airAccel * delta);
      result.x = THREE.MathUtils.lerp(result.x, moveDir.x, alpha);
      result.z = THREE.MathUtils.lerp(result.z, moveDir.z, alpha);
    } else {
      const damping = Math.pow(AIR_CONTROL_CONFIG.airDamping, delta * 60);
      result.x *= damping;
      result.z *= damping;
    }

    // Storm hover is fall control, not flight. It only engages while already
    // descending and reduces gravity + terminal fall speed.
    this.isHovering = input.jump && result.y < -2.0;
    if (this.isHovering) {
      this.hoverTimer += delta;
    } else {
      this.hoverTimer = 0;
    }

    const gravityMultiplier = this.isHovering
      ? AIR_CONTROL_CONFIG.hoverGravityMultiplier
      : 1.0;
    const terminalMultiplier = this.isHovering
      ? AIR_CONTROL_CONFIG.hoverTerminalMultiplier
      : 1.0;

    result.y -= AIR_CONTROL_CONFIG.gravity * gravityMultiplier * delta;
    result.y = Math.max(
      result.y,
      -AIR_CONTROL_CONFIG.terminalVelocity * terminalMultiplier
    );

    return result;
  }

  calculatePressure(
    intensity: 'light' | 'heavy' | 'special',
    _position: THREE.Vector3,
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

    const normalizedDirection = direction.lengthSq() > 0.0001
      ? direction.clone().normalize()
      : new THREE.Vector3(0, 0, 1);

    return {
      intensity: force,
      direction: normalizedDirection,
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
      return null;
    }

    const falloff = 1.0 - distance / pressure.radius;
    const force = Math.max(0, pressure.intensity * falloff);

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

  getConfig() {
    return {
      air: { ...AIR_CONTROL_CONFIG },
      pressure: { ...PRESSURE_CONFIG },
    };
  }

  reset() {
    this.isHovering = false;
    this.hoverTimer = 0;
  }
}
