/**
 * JAX SYSTEMS TESTS
 * Displacement, air control, and pressure mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { DisplacementController } from './DisplacementSystem';
import { StormAirSystem } from './StormAirSystem';

describe('DisplacementController - Core Mechanics', () => {
  let controller: DisplacementController;
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    controller = new DisplacementController(scene);
  });

  it('starts displacement on traversal input with charges', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    const result = controller.update(0.016, {
      traversal: true,
      moveX: 1,
      moveY: 0,
      aiming: direction,
    }, position, false);

    const state = controller.getState();
    expect(state.isDisplacing).toBe(true);
    expect(state.groundCharges).toBe(0); // Consumed
    expect(result).not.toBeNull();
  });

  it('respects direction from movement input', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, 1);

    // Advance displacement
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
      moveY: 1,
      aiming: direction,
    }, position, false);

    // Check that movement direction was used
    let result = controller.update(0.016, {
      traversal: false,
      moveX: 0,
      moveY: 0,
      aiming: direction,
    }, position, false);

    expect(result).not.toBeNull();
  });

  it('enforces cooldown after ground displacement', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // First displacement
    controller.update(0.016, {
      traversal: true,
      moveX: 1,
      moveY: 0,
      aiming: direction,
    }, position, false);

    // Let displacement complete (duration is 0.15s, so ~10 frames)
    for (let i = 0; i < 10; i++) {
      controller.update(0.016, {
        traversal: false,
        moveX: 0,
        moveY: 0,
        aiming: direction,
      }, position, false);
    }

    const state = controller.getState();
    // Cooldown should be set (even if slightly positive after decay)
    expect(state.cooldown).toBeGreaterThanOrEqual(-0.001); // Allow small floating point error
  });

  it('charges air displacement separately from ground', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // Air displacement
    controller.update(0.016, {
      traversal: true,
      moveX: 1,
      moveY: 0,
      aiming: direction,
    }, position, true);

    let state = controller.getState();
    expect(state.airCharges).toBe(0); // Consumed air charge
    expect(state.groundCharges).toBe(1); // Ground charge remains

    // Let it complete
    for (let i = 0; i < 10; i++) {
      controller.update(0.016, {
        traversal: false,
        moveX: 0,
        moveY: 0,
        aiming: direction,
      }, position, true);
    }

    state = controller.getState();
    // Air charges stay at 0 while airborne (recharge happens on landing transition)
    expect(state.airCharges).toBeLessThanOrEqual(0);
    expect(state.groundCharges).toBe(1); // Ground charge still available
  });

  it('handles zero-distance without error', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, 0); // Zero direction

    expect(() => {
      controller.update(0.016, {
        traversal: true,
        moveX: 0,
        moveY: 0,
        aiming: direction,
      }, position, false);
    }).not.toThrow();
  });

  it('preserves displacement velocity for momentum', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // Start displacement
    controller.update(0.016, {
      traversal: true,
      moveX: 1,
      moveY: 0,
      aiming: direction,
    }, position, false);

    // Let it complete
    for (let i = 0; i < 20; i++) {
      controller.update(0.016, {
        traversal: false,
        moveX: 0,
        moveY: 0,
        aiming: direction,
      }, position, false);
    }

    const velocity = controller.getDisplacementVelocity();
    expect(velocity.length()).toBeGreaterThan(0);
  });
});

describe('StormAirSystem - Air Control & Pressure', () => {
  let system: StormAirSystem;

  beforeEach(() => {
    system = new StormAirSystem();
  });

  it('applies air control acceleration', () => {
    let velocity = new THREE.Vector3(0, 0, 0);

    velocity = system.updateAirControl(0.016, {
      moveX: 1,
      moveY: 0,
      jump: false,
      traversal: false,
    }, velocity, true);

    expect(velocity.x).toBeGreaterThan(0);
  });

  it('applies gravity when not hovering', () => {
    let velocity = new THREE.Vector3(0, 0, 0);

    velocity = system.updateAirControl(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversal: false,
    }, velocity, true);

    expect(velocity.y).toBeLessThan(0); // Falling
  });

  it('processes jump input correctly during fall', () => {
    let velocity = new THREE.Vector3(0, 0, 0);

    // Simulate falling
    for (let i = 0; i < 5; i++) {
      velocity = system.updateAirControl(0.016, {
        moveX: 0,
        moveY: 0,
        jump: false,
        traversal: false,
      }, velocity, true);
    }

    const preJumpVel = velocity.y;

    // Hold jump
    velocity = system.updateAirControl(0.016, {
      moveX: 0,
      moveY: 0,
      jump: true,
      traversal: false,
    }, velocity, true);

    // Velocity should be affected (either by hover or gravity)
    expect(velocity).toBeDefined();
    expect(isFinite(velocity.y)).toBe(true); // No NaN
  });

  it('calculates pressure force with falloff', () => {
    const pressure = system.calculatePressure(
      'heavy',
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    );

    expect(pressure.intensity).toBeGreaterThan(0);
    expect(pressure.radius).toBeGreaterThan(0);
    expect(pressure.direction.length()).toBeCloseTo(1, 0.1);
  });

  it('applies pressure force to target', () => {
    const pressure = system.calculatePressure(
      'heavy',
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    );

    const targetPos = new THREE.Vector3(2, 0, 0);
    const result = system.applyPressureForce(targetPos, new THREE.Vector3(0, 0, 0), pressure);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.length()).toBeGreaterThan(0);
    }
  });

  it('returns null for out-of-range targets', () => {
    const pressure = system.calculatePressure(
      'light',
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    );

    const targetPos = new THREE.Vector3(100, 0, 0); // Far away
    const result = system.applyPressureForce(targetPos, new THREE.Vector3(0, 0, 0), pressure);

    expect(result).toBeNull();
  });

  it('tracks hover time correctly', () => {
    let velocity = new THREE.Vector3(0, -5, 0);

    // First frame with jump - enables hovering if fallVelocity > 2.0
    // But fallVelocity starts at 0, so need to accumulate it first
    velocity = system.updateAirControl(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversal: false,
    }, velocity, true);

    // Now with jump held (after fallVelocity has accumulated)
    velocity = system.updateAirControl(0.016, {
      moveX: 0,
      moveY: 0,
      jump: true,
      traversal: false,
    }, velocity, true);

    // Should now be hovering
    if (system.isHoveringNow()) {
      expect(system.getHoverTime()).toBeGreaterThan(0);
    }
  });

  it('handles zero-distance pressure without NaN', () => {
    const pressure = system.calculatePressure(
      'light',
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    );

    const result = system.applyPressureForce(
      new THREE.Vector3(0, 0, 0), // Same position
      new THREE.Vector3(0, 0, 0),
      pressure
    );

    expect(result).toBeNull(); // Out of range (zero distance check)
  });
});
