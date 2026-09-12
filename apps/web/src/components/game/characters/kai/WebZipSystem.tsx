/**
 * WEB ZIP SYSTEM
 * Kai's web-swing traversal mechanic - UPDATE-DRIVEN (no independent useFrame)
 *
 * Mechanics:
 * - Detect nearby web anchors
 * - Initiate zip on traversal input (E key)
 * - Preserve partial momentum on release
 * - Mobile-friendly steering via moveX input
 *
 * ARCHITECTURE: This is now a state container with update() method.
 * KaiController calls update() each frame with live input.
 */

import * as THREE from 'three';

interface WebZipState {
  isZipping: boolean;
  targetAnchor: THREE.Vector3 | null;
  zipStartPos: THREE.Vector3;
  zipProgress: number;
  zipVelocity: THREE.Vector3;
}

interface WebAnchor {
  position: THREE.Vector3;
  id: string;
}

interface WebZipInput {
  traversal: boolean;
  moveX: number;
}

const WEB_ZIP_CONFIG = {
  detectionRange: 15.0,
  zipDuration: 0.8,
  zipSpeed: 20.0,
  momentumRetention: 0.4,
};

export class WebZipController {
  private state: WebZipState;
  private anchors: WebAnchor[] = [];
  private prevTraversal: boolean = false;
  private nearbyWebAnchor: WebAnchor | null = null;

  constructor(private scene: THREE.Scene) {
    this.state = {
      isZipping: false,
      targetAnchor: null,
      zipStartPos: new THREE.Vector3(),
      zipProgress: 0,
      zipVelocity: new THREE.Vector3(),
    };
  }

  private findNearestAnchor(pos: THREE.Vector3): WebAnchor | null {
    let nearest: WebAnchor | null = null;
    let nearestDist = WEB_ZIP_CONFIG.detectionRange;

    for (const anchor of this.anchors) {
      const dist = pos.distanceTo(anchor.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = anchor;
      }
    }

    return nearest;
  }

  private startZip(position: THREE.Vector3, target: WebAnchor): void {
    this.state.isZipping = true;
    this.state.targetAnchor = target.position.clone();
    this.state.zipStartPos.copy(position);
    this.state.zipProgress = 0;
  }

  private completeZip(): void {
    if (!this.state.targetAnchor) return;

    const direction = this.state.targetAnchor.clone().sub(this.state.zipStartPos).normalize();
    this.state.zipVelocity.copy(direction).multiplyScalar(WEB_ZIP_CONFIG.zipSpeed * WEB_ZIP_CONFIG.momentumRetention);

    this.state.isZipping = false;
    this.state.targetAnchor = null;
  }

  registerAnchorsFromScene(): void {
    this.anchors = [];
    this.scene.traverse((obj) => {
      if (obj.userData?.webAnchor) {
        this.anchors.push({
          position: obj.getWorldPosition(new THREE.Vector3()),
          id: obj.uuid,
        });
      }
    });
  }

  /**
   * Update web zip state each frame.
   * Called by KaiController with live input.
   * Returns the constrained position when zipping/momentum active, or null.
   */
  update(delta: number, input: WebZipInput, currentPosition: THREE.Vector3): THREE.Vector3 | null {
    const traversalPressed = input.traversal && !this.prevTraversal;
    this.prevTraversal = input.traversal;

    if (!this.state.isZipping) {
      // Look for nearby anchor
      const nearestAnchor = this.findNearestAnchor(currentPosition);
      this.nearbyWebAnchor = nearestAnchor || null;

      // Start zip on traversal press
      if (nearestAnchor && traversalPressed) {
        this.startZip(currentPosition, nearestAnchor);
        return null;
      }

      // Apply residual momentum from previous zip
      if (this.state.zipVelocity.lengthSq() > 0.01) {
        const newPos = currentPosition.clone().addScaledVector(this.state.zipVelocity, delta);
        this.state.zipVelocity.multiplyScalar(0.85);
        return newPos;
      }

      return null;
    }

    if (!this.state.targetAnchor) return null;

    // Active zip to anchor
    this.state.zipProgress += delta / WEB_ZIP_CONFIG.zipDuration;

    // Allow cancel on traversal release
    if (!input.traversal) {
      this.completeZip();
      return currentPosition.clone();
    }

    if (this.state.zipProgress >= 1.0) {
      // Reached anchor
      const finalPos = this.state.targetAnchor.clone();
      this.completeZip();
      return finalPos;
    }

    // Interpolate toward anchor using eased curve
    const eased = this.state.zipProgress < 0.5
      ? 2 * this.state.zipProgress * this.state.zipProgress
      : -1 + (4 - 2 * this.state.zipProgress) * this.state.zipProgress;

    const newPos = this.state.zipStartPos.clone();
    newPos.lerp(this.state.targetAnchor, eased);

    // Apply steering using moveX input
    if (Math.abs(input.moveX) > 0.1) {
      const steerAmount = input.moveX * 0.5;
      newPos.x += steerAmount * delta;
    }

    return newPos;
  }

  isZipping(): boolean {
    return this.state.isZipping;
  }

  getState(): WebZipState {
    return this.state;
  }

  getNearbyWebAnchor(): WebAnchor | null {
    return this.nearbyWebAnchor;
  }

  getWebVelocity(): THREE.Vector3 {
    return this.state.zipVelocity.clone();
  }
}

/**
 * Create test web anchors for zip testing
 */
export function createTestWebAnchors(scene: THREE.Scene): THREE.Group {
  const anchorsGroup = new THREE.Group();
  anchorsGroup.name = 'web_anchors';

  // Create several anchor points
  const anchorPositions = [
    new THREE.Vector3(0, 5, -8),
    new THREE.Vector3(6, 4, -5),
    new THREE.Vector3(-6, 3, -2),
    new THREE.Vector3(8, 6, -10),
    new THREE.Vector3(-8, 5, -7),
  ];

  for (const pos of anchorPositions) {
    // Invisible anchor point with visual marker
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff6600,
        emissiveIntensity: 0.3,
      })
    );
    sphere.position.copy(pos);
    sphere.userData.webAnchor = true;

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(pos);

    anchorsGroup.add(sphere);
    anchorsGroup.add(glow);
  }

  scene.add(anchorsGroup);
  return anchorsGroup;
}
