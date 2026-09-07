/**
 * WALL CLIMB SYSTEM
 * Kai's vertical traversal mechanic
 *
 * Mechanics:
 * - Forward raycast detection for climbable surfaces
 * - Attach to wall when detected with forward input
 * - W = climb UP, S = climb DOWN
 * - Detach on jump, edge detection, loss of wall, or release
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WallClimbState {
  isOnWall: boolean;
  wallNormal: THREE.Vector3;
  climbSurface: THREE.Object3D | null;
  wallPlanePoint: THREE.Vector3;
  climbVelocity: THREE.Vector3;
}

const WALL_CLIMB_CONFIG = {
  detectionDistance: 1.5,
  climbSpeed: 3.0,
  perpendiculardistanceThreshold: 1.0,
  edgeDetectionDistance: 0.5,
};

export function useWallClimbSystem(
  kaiRef: React.RefObject<THREE.Group>,
  scene: THREE.Scene,
  input: { moveX: number; moveY: number; jump: boolean; traversalModifier: boolean }
) {
  const stateRef = useRef<WallClimbState>({
    isOnWall: false,
    wallNormal: new THREE.Vector3(0, 0, 1),
    climbSurface: null,
    wallPlanePoint: new THREE.Vector3(),
    climbVelocity: new THREE.Vector3(),
  });

  const raycasterRef = useRef(new THREE.Raycaster());
  const prevJumpRef = useRef(false);

  // Detect climbable walls and return intersection or null
  const detectWall = (position: THREE.Vector3, direction: THREE.Vector3): THREE.Intersection<THREE.Object3D> | null => {
    const raycaster = raycasterRef.current;
    raycaster.set(position, direction);

    const intersects = raycaster.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      if (hit.distance > WALL_CLIMB_CONFIG.detectionDistance) continue;

      if (hit.object.userData?.climbable || hit.object.name?.includes('wall')) {
        if (hit.face) {
          const normal = new THREE.Vector3();
          hit.face.normal.copy(normal);
          normal.transformDirection(hit.object.matrixWorld);

          const verticalComponent = Math.abs(normal.y);
          if (verticalComponent < 0.8) {
            return hit;
          }
        }
      }
    }

    return null;
  };

  // Measure perpendicular distance from point to wall plane
  const getPerpendiculardistanceToWall = (point: THREE.Vector3, planePoint: THREE.Vector3, normal: THREE.Vector3): number => {
    const toPoint = point.clone().sub(planePoint);
    return Math.abs(toPoint.dot(normal));
  };

  // Attach Kai to wall
  const attachToWall = (position: THREE.Vector3, direction: THREE.Vector3): void => {
    const state = stateRef.current;
    const hit = detectWall(position, direction);

    if (hit && hit.face) {
      state.isOnWall = true;
      state.climbSurface = hit.object;
      state.wallPlanePoint.copy(hit.point);

      const normal = new THREE.Vector3();
      hit.face.normal.copy(normal);
      normal.transformDirection(hit.object.matrixWorld);
      state.wallNormal.copy(normal);
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

    // Detect jump transition (rising edge)
    const jumpPressed = input.jump && !prevJumpRef.current;
    prevJumpRef.current = input.jump;

    if (!state.isOnWall) {
      // Try to attach: must have forward input (W = moveY < -0.2)
      const wallHit = detectWall(pos, dir);
      if (wallHit && input.moveY < -0.2) {
        attachToWall(pos, dir);
      }
    } else {
      // On wall: check detachment conditions

      // 1. Jump pressed: detach immediately
      if (jumpPressed) {
        detachFromWall();
        return;
      }

      // 2. Release traversal modifier: detach (manual drop)
      if (!input.traversalModifier) {
        detachFromWall();
        return;
      }

      // 3. Loss of wall: detach
      const wallHit = detectWall(pos, dir);
      if (!wallHit) {
        detachFromWall();
        return;
      }

      // 4. Too far perpendicular to wall: detach
      const perpDist = getPerpendiculardistanceToWall(pos, state.wallPlanePoint, state.wallNormal);
      if (perpDist > WALL_CLIMB_CONFIG.perpendiculardistanceThreshold) {
        detachFromWall();
        return;
      }

      // Climbing movement: W = up, S = down
      const climbDir = new THREE.Vector3(0, 1, 0);

      if (input.moveY < -0.2) {
        // W key: climbing up
        state.climbVelocity.copy(climbDir).multiplyScalar(WALL_CLIMB_CONFIG.climbSpeed);
      } else if (input.moveY > 0.2) {
        // S key: climbing down
        state.climbVelocity.copy(climbDir).multiplyScalar(-WALL_CLIMB_CONFIG.climbSpeed * 0.6);
      } else {
        // No vertical input: maintain position (friction)
        state.climbVelocity.multiplyScalar(0.8);
      }

      // Apply climbing velocity
      const newPos = pos.clone().add(state.climbVelocity.clone().multiplyScalar(delta));

      // Constrain perpendicular distance to wall (0.15 units away from surface)
      const toWall = state.wallNormal.clone().multiplyScalar(
        getPerpendiculardistanceToWall(newPos, state.wallPlanePoint, state.wallNormal)
      );
      const constrainedPos = newPos.clone().sub(toWall).add(
        state.wallNormal.clone().multiplyScalar(0.15)
      );

      kai.position.copy(constrainedPos);
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
