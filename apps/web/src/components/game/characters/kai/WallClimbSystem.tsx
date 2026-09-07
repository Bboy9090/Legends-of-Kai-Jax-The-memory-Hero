/**
 * WALL CLIMB SYSTEM
 * Kai's vertical traversal mechanic
 *
 * Mechanics:
 * - Forward raycast detection for climbable surfaces
 * - Attach to wall when detected
 * - Vertical/horizontal movement while climbing
 * - Detach on jump or edge detection
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WallClimbState {
  isOnWall: boolean;
  wallNormal: THREE.Vector3;
  climbSurface: THREE.Object3D | null;
  attachPoint: THREE.Vector3;
  climbVelocity: THREE.Vector3;
}

const WALL_CLIMB_CONFIG = {
  detectionDistance: 1.5,
  detectionAngle: Math.PI / 4, // 45 degrees
  climbSpeed: 3.0,
  detachThreshold: 2.0, // Distance to detach from wall
  edgeDetectionDistance: 0.5,
};

export function useWallClimbSystem(
  kaiRef: React.RefObject<THREE.Group>,
  scene: THREE.Scene,
  input: { moveX: number; moveY: number }
) {
  const stateRef = useRef<WallClimbState>({
    isOnWall: false,
    wallNormal: new THREE.Vector3(0, 0, 1),
    climbSurface: null,
    attachPoint: new THREE.Vector3(),
    climbVelocity: new THREE.Vector3(),
  });

  const raycasterRef = useRef(new THREE.Raycaster());

  // Detect climbable walls
  const detectWall = (position: THREE.Vector3, direction: THREE.Vector3): boolean => {
    const raycaster = raycasterRef.current;
    raycaster.set(position, direction);

    // Query collision objects in scene
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      // Check if surface is climbable (angle check)
      const normal = new THREE.Vector3();

      // For now, accept any vertical surface (walls, not floors/ceilings)
      // In production, check custom climbability flag
      if (hit.object.userData?.climbable ||
          (hit.distance < WALL_CLIMB_CONFIG.detectionDistance && hit.object.name?.includes('wall'))) {

        // Validate surface angle (must be steep enough)
        if (hit.face) {
          hit.face.normal.copy(normal);
          normal.transformDirection(hit.object.matrixWorld);

          // If surface normal points mostly sideways (not up/down), it's climbable
          const verticalComponent = Math.abs(normal.y);
          if (verticalComponent < 0.8) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Attach Kai to wall
  const attachToWall = (position: THREE.Vector3, direction: THREE.Vector3): void => {
    const state = stateRef.current;
    const raycaster = raycasterRef.current;
    raycaster.set(position, direction);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      state.isOnWall = true;
      state.climbSurface = hit.object;
      state.attachPoint.copy(hit.point);
      state.wallNormal.copy(hit.face?.normal || new THREE.Vector3(0, 0, 1));
      state.wallNormal.normalize();
    }
  };

  // Detach from wall
  const detachFromWall = (): void => {
    const state = stateRef.current;
    state.isOnWall = false;
    state.climbSurface = null;
    state.climbVelocity.set(0, 0, 0);
  };

  useFrame((frameState, delta) => {
    if (!kaiRef.current) return;

    const state = stateRef.current;
    const kai = kaiRef.current;
    const pos = kai.position;
    const dir = new THREE.Vector3(0, 0, 1);
    kai.getWorldDirection(dir);

    // Check for nearby wall
    const wallDetected = detectWall(pos, dir);

    if (!state.isOnWall && wallDetected && input.moveY < 0.5) {
      // Attach to wall (moving forward into wall)
      attachToWall(pos, dir);
    } else if (state.isOnWall) {
      // Check detachment conditions
      const distanceFromWall = state.attachPoint.distanceTo(pos);

      if (distanceFromWall > WALL_CLIMB_CONFIG.detachThreshold || !wallDetected) {
        // Detach if too far or wall disappeared
        detachFromWall();
      } else {
        // Climbing movement
        const climbDir = new THREE.Vector3(0, 1, 0); // Up

        // Vertical input (W/S controls up/down)
        if (input.moveY > 0.2) {
          // Climbing up
          state.climbVelocity.copy(climbDir).multiplyScalar(WALL_CLIMB_CONFIG.climbSpeed);
        } else if (input.moveY < -0.2) {
          // Climbing down
          state.climbVelocity.copy(climbDir).multiplyScalar(-WALL_CLIMB_CONFIG.climbSpeed * 0.6);
        } else {
          // No vertical input - maintain position
          state.climbVelocity.multiplyScalar(0.8);
        }

        // Apply climbing velocity
        const newPos = pos.clone().add(state.climbVelocity.clone().multiplyScalar(delta));

        // Keep on wall surface (constrain to wall distance)
        const toWall = state.attachPoint.clone().sub(newPos);
        const distToWall = toWall.length();
        if (distToWall > 0.1) {
          const normalized = toWall.normalize();
          newPos.addScaledVector(normalized, 0.1 - distToWall);
        }

        kai.position.copy(newPos);
      }
    }
  });

  return {
    state: stateRef.current,
    isClimbing: () => stateRef.current.isOnWall,
  };
}

/**
 * Create a test wall for wall climbing
 * Call this in scene setup to add a climbable surface
 */
export function createTestClimbableWall(scene: THREE.Scene): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(2, 4, 0.3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.7,
    metalness: 0.1,
  });

  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(8, 2, 0);
  wall.name = 'wall_climbable';
  wall.userData.climbable = true;

  // Add visual indicator
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const wireframe = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
  );
  wall.add(wireframe);

  scene.add(wall);
  return wall;
}
