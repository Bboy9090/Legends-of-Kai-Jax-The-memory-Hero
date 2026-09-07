/**
 * WALL CLIMB SYSTEM
 * Kai's vertical traversal mechanic - UPDATE-DRIVEN (no independent useFrame)
 *
 * Mechanics:
 * - Forward raycast detection for climbable surfaces
 * - Attach to wall when detected with forward input
 * - W = climb UP, S = climb DOWN
 * - Detach on jump, edge detection, loss of wall, or release
 *
 * ARCHITECTURE: This is now a state container with update() method.
 * KaiController calls update() each frame with live input.
 */

import * as THREE from 'three';

interface WallClimbState {
  isOnWall: boolean;
  wallNormal: THREE.Vector3;
  climbSurface: THREE.Object3D | null;
  wallPlanePoint: THREE.Vector3;
  climbVelocity: THREE.Vector3;
}

interface WallClimbInput {
  moveX: number;
  moveY: number;
  jump: boolean;
  traversalModifier: boolean;
}

const WALL_CLIMB_CONFIG = {
  detectionDistance: 1.5,
  climbSpeed: 3.0,
  perpendiculardistanceThreshold: 1.0,
  edgeDetectionDistance: 0.5,
};

/**
 * WallClimbController - state container for wall climbing
 * NOT a React hook. KaiController calls update() each frame.
 */
export class WallClimbController {
  private state: WallClimbState;
  private raycaster: THREE.Raycaster;
  private prevJump: boolean = false;

  constructor(private scene: THREE.Scene) {
    this.state = {
      isOnWall: false,
      wallNormal: new THREE.Vector3(0, 0, 1),
      climbSurface: null,
      wallPlanePoint: new THREE.Vector3(),
      climbVelocity: new THREE.Vector3(),
    };
    this.raycaster = new THREE.Raycaster();
  }

  private detectWall(position: THREE.Vector3, direction: THREE.Vector3): THREE.Intersection<THREE.Object3D> | null {
    this.raycaster.set(position, direction);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

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
  }

  private getPerpendiculardistanceToWall(point: THREE.Vector3, planePoint: THREE.Vector3, normal: THREE.Vector3): number {
    const toPoint = point.clone().sub(planePoint);
    return Math.abs(toPoint.dot(normal));
  }

  private attachToWall(position: THREE.Vector3, direction: THREE.Vector3): void {
    const hit = this.detectWall(position, direction);

    if (hit && hit.face) {
      this.state.isOnWall = true;
      this.state.climbSurface = hit.object;
      this.state.wallPlanePoint.copy(hit.point);

      const normal = new THREE.Vector3();
      hit.face.normal.copy(normal);
      normal.transformDirection(hit.object.matrixWorld);
      this.state.wallNormal.copy(normal);
      this.state.wallNormal.normalize();
    }
  }

  private detachFromWall(): void {
    this.state.isOnWall = false;
    this.state.climbSurface = null;
    this.state.climbVelocity.set(0, 0, 0);
  }

  /**
   * Update wall climb state each frame.
   * Called by KaiController with live input.
   * Returns the constrained position when climbing, or null if not climbing.
   */
  update(
    delta: number,
    input: WallClimbInput,
    currentPosition: THREE.Vector3,
    currentDirection: THREE.Vector3
  ): THREE.Vector3 | null {
    const jumpPressed = input.jump && !this.prevJump;
    this.prevJump = input.jump;

    if (!this.state.isOnWall) {
      // Try to attach: must have forward input (W = moveY < -0.2)
      const wallHit = this.detectWall(currentPosition, currentDirection);
      if (wallHit && input.moveY < -0.2) {
        this.attachToWall(currentPosition, currentDirection);
      }
      return null; // Not climbing, no position override
    }

    // On wall: check detachment conditions

    // 1. Jump pressed: detach immediately
    if (jumpPressed) {
      this.detachFromWall();
      return null;
    }

    // 2. Release traversal modifier: detach (manual drop)
    if (!input.traversalModifier) {
      this.detachFromWall();
      return null;
    }

    // 3. Loss of wall: detach
    const wallHit = this.detectWall(currentPosition, currentDirection);
    if (!wallHit) {
      this.detachFromWall();
      return null;
    }

    // 4. Too far perpendicular to wall: detach
    const perpDist = this.getPerpendiculardistanceToWall(currentPosition, this.state.wallPlanePoint, this.state.wallNormal);
    if (perpDist > WALL_CLIMB_CONFIG.perpendiculardistanceThreshold) {
      this.detachFromWall();
      return null;
    }

    // Climbing movement: W = up, S = down
    const climbDir = new THREE.Vector3(0, 1, 0);

    if (input.moveY < -0.2) {
      // W key: climbing up
      this.state.climbVelocity.copy(climbDir).multiplyScalar(WALL_CLIMB_CONFIG.climbSpeed);
    } else if (input.moveY > 0.2) {
      // S key: climbing down
      this.state.climbVelocity.copy(climbDir).multiplyScalar(-WALL_CLIMB_CONFIG.climbSpeed * 0.6);
    } else {
      // No vertical input: maintain position (friction)
      this.state.climbVelocity.multiplyScalar(0.8);
    }

    // Apply climbing velocity
    const newPos = currentPosition.clone().add(this.state.climbVelocity.clone().multiplyScalar(delta));

    // Constrain perpendicular distance to wall (0.15 units away from surface)
    const toWall = this.state.wallNormal.clone().multiplyScalar(
      this.getPerpendiculardistanceToWall(newPos, this.state.wallPlanePoint, this.state.wallNormal)
    );
    const constrainedPos = newPos.clone().sub(toWall).add(
      this.state.wallNormal.clone().multiplyScalar(0.15)
    );

    return constrainedPos; // Return constrained position for KaiController to apply
  }

  isClimbing(): boolean {
    return this.state.isOnWall;
  }

  getState(): WallClimbState {
    return this.state;
  }
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
