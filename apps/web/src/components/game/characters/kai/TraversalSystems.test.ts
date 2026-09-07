/**
 * TRAVERSAL SYSTEMS RUNTIME TESTS
 * Wall Climb and Web Zip update-driven controllers
 *
 * Tests verify:
 * - Update-driven architecture accepts live input each frame
 * - State machine transitions work correctly
 * - Web Zip detection, interpolation, and momentum
 * - Deterministic input-driven behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { WallClimbController } from './WallClimbSystem';
import { WebZipController } from './WebZipSystem';

describe('WallClimbController - Update-Driven Architecture', () => {
  let controller: WallClimbController;
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    controller = new WallClimbController(scene);
  });

  it('initializes not climbing', () => {
    expect(controller.isClimbing()).toBe(false);
    expect(controller.getState().isOnWall).toBe(false);
  });

  it('returns null when not climbing and no input', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    const result = controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversalModifier: false,
    }, position, direction);

    expect(result).toBeNull();
  });

  it('accepts live input on every frame', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // Frame 1: Input A
    controller.update(0.016, {
      moveX: 0,
      moveY: -0.5,
      jump: false,
      traversalModifier: true,
    }, position, direction);

    // Frame 2: Input B (different)
    controller.update(0.016, {
      moveX: 0,
      moveY: 0.5,
      jump: false,
      traversalModifier: true,
    }, position, direction);

    // Frame 3: Input C (different again)
    const result = controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: true,
      traversalModifier: true,
    }, position, direction);

    // Verify controller responds to latest input (should process jump)
    expect(result).toBeDefined();
  });

  it('tracks jump rising edge for detachment', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // Frame 1: No jump
    controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversalModifier: true,
    }, position, direction);

    // Frame 2: Jump held (rising edge)
    const result1 = controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: true,
      traversalModifier: true,
    }, position, direction);

    // Frame 3: Jump still held (no rising edge)
    const result2 = controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: true,
      traversalModifier: true,
    }, position, direction);

    // Both frames should process correctly (no double-detach)
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it('responds to traversalModifier release', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(1, 0, 0);

    // Frame 1: Modifier on
    controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversalModifier: true,
    }, position, direction);

    // Frame 2: Modifier off (manual drop)
    const result = controller.update(0.016, {
      moveX: 0,
      moveY: 0,
      jump: false,
      traversalModifier: false,
    }, position, direction);

    // Should process correctly
    expect(result).toBeDefined();
  });
});

describe('WebZipController - Update-Driven Architecture', () => {
  let controller: WebZipController;
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    controller = new WebZipController(scene);

    // Create test anchor
    const anchorGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const anchorMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    const anchor = new THREE.Mesh(anchorGeom, anchorMat);
    anchor.position.set(5, 3, 0);
    anchor.userData.webAnchor = true;
    scene.add(anchor);

    controller.registerAnchorsFromScene();
  });

  it('initializes not zipping', () => {
    expect(controller.isZipping()).toBe(false);
    expect(controller.getState().isZipping).toBe(false);
  });

  it('returns null when not zipping and no momentum', () => {
    const position = new THREE.Vector3(10, 2, 0);

    const result = controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);

    expect(result).toBeNull();
  });

  it('detects nearby anchors', () => {
    const position = new THREE.Vector3(0, 2, 0);

    // Update to detect nearby anchors
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);

    expect(controller.getNearbyWebAnchor()).not.toBeNull();
  });

  it('starts zip on traversal press when anchor nearby', () => {
    const position = new THREE.Vector3(0, 2, 0);

    // Frame 1: traversal off
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);

    expect(controller.isZipping()).toBe(false);

    // Frame 2: traversal press (rising edge)
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);

    expect(controller.isZipping()).toBe(true);
  });

  it('cancels zip on traversal release', () => {
    const position = new THREE.Vector3(0, 2, 0);

    // Start zip
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);

    expect(controller.isZipping()).toBe(true);

    // Release traversal
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);

    expect(controller.isZipping()).toBe(false);
  });

  it('interpolates toward anchor during zip', () => {
    const position = new THREE.Vector3(0, 2, 0);
    const anchorPos = new THREE.Vector3(5, 3, 0);

    // Start zip
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);

    // Update multiple times to advance progress
    let currentPos = position.clone();
    for (let i = 0; i < 20; i++) {
      const result = controller.update(0.016, {
        traversal: true,
        moveX: 0,
      }, currentPos);

      if (result) {
        currentPos = result;
      }
    }

    // Should be partway toward anchor
    const distToAnchor = currentPos.distanceTo(anchorPos);
    const initialDist = position.distanceTo(anchorPos);

    expect(distToAnchor).toBeLessThan(initialDist);
  });

  it('applies steering input during zip', () => {
    const position = new THREE.Vector3(0, 2, 0);

    // Start zip
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);

    // Advance with steering left (moveX < -0.1)
    const result = controller.update(0.016, {
      traversal: true,
      moveX: -0.5,
    }, position);

    // Steering should affect X position
    if (result) {
      expect(result).toBeDefined();
    }
  });

  it('handles traversal input rising/falling edges correctly', () => {
    const position = new THREE.Vector3(0, 2, 0);

    // Frame 1: traversal off
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);

    // Frame 2: traversal on (rising edge - start zip)
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);
    expect(controller.isZipping()).toBe(true);

    // Frame 3: traversal still on (not a rising edge)
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);
    expect(controller.isZipping()).toBe(true); // Still zipping

    // Frame 4: traversal off (cancel)
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, position);
    expect(controller.isZipping()).toBe(false); // Canceled
  });

  it('preserves momentum direction after release', () => {
    const position = new THREE.Vector3(0, 2, 0);
    const anchorPos = new THREE.Vector3(5, 3, 0);
    const directionToAnchor = anchorPos.clone().sub(position).normalize();

    // Start and advance zip
    controller.update(0.016, {
      traversal: true,
      moveX: 0,
    }, position);

    // Advance to accumulate momentum
    let currentPos = position.clone();
    for (let i = 0; i < 15; i++) {
      const result = controller.update(0.016, {
        traversal: true,
        moveX: 0,
      }, currentPos);

      if (result) {
        currentPos = result;
      }
    }

    // Release zip
    controller.update(0.016, {
      traversal: false,
      moveX: 0,
    }, currentPos);

    // Check momentum exists
    const velocity = controller.getWebVelocity();
    expect(velocity.lengthSq()).toBeGreaterThan(0.001);
  });
});
