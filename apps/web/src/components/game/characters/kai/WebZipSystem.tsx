/**
 * WEB ZIP SYSTEM
 * Kai's web-swing traversal mechanic
 *
 * Simple implementation:
 * - Detect nearby web anchors
 * - Initiate zip toward anchor
 * - Preserve partial momentum on release
 * - Mobile-friendly steering
 *
 * NOT a full rope physics system - simplified for mobile performance
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WebZipState {
  isZipping: boolean;
  targetAnchor: THREE.Vector3 | null;
  zipStartPos: THREE.Vector3;
  zipProgress: number; // 0 to 1
  zipVelocity: THREE.Vector3;
}

interface WebAnchor {
  position: THREE.Vector3;
  id: string;
}

const WEB_ZIP_CONFIG = {
  detectionRange: 15.0,
  zipDuration: 0.8, // Seconds to complete zip
  zipSpeed: 20.0,
  momentumRetention: 0.4, // How much momentum to keep after release
};

export function useWebZipSystem(kaiRef: React.RefObject<THREE.Group>, scene: THREE.Scene) {
  const stateRef = useRef<WebZipState>({
    isZipping: false,
    targetAnchor: null,
    zipStartPos: new THREE.Vector3(),
    zipProgress: 0,
    zipVelocity: new THREE.Vector3(),
  });

  const anchorsRef = useRef<WebAnchor[]>([]);

  // Register web anchors in scene
  const registerAnchorsFromScene = (): void => {
    anchorsRef.current = [];
    scene.traverse((obj) => {
      if (obj.userData?.webAnchor) {
        anchorsRef.current.push({
          position: obj.getWorldPosition(new THREE.Vector3()),
          id: obj.uuid,
        });
      }
    });
  };

  // Find nearest anchor within range
  const findNearestAnchor = (pos: THREE.Vector3): WebAnchor | null => {
    let nearest: WebAnchor | null = null;
    let nearestDist = WEB_ZIP_CONFIG.detectionRange;

    for (const anchor of anchorsRef.current) {
      const dist = pos.distanceTo(anchor.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = anchor;
      }
    }

    return nearest;
  };

  // Initiate zip to target
  const startZip = (target: WebAnchor): void => {
    if (!kaiRef.current) return;

    const state = stateRef.current;
    state.isZipping = true;
    state.targetAnchor = target.position.clone();
    state.zipStartPos.copy(kaiRef.current.position);
    state.zipProgress = 0;
  };

  // Complete zip and release
  const completeZip = (): void => {
    const state = stateRef.current;
    if (!kaiRef.current || !state.targetAnchor) return;

    // Calculate momentum for release
    const direction = state.targetAnchor.clone().sub(state.zipStartPos).normalize();
    state.zipVelocity.copy(direction).multiplyScalar(WEB_ZIP_CONFIG.zipSpeed * WEB_ZIP_CONFIG.momentumRetention);

    state.isZipping = false;
    state.targetAnchor = null;
  };

  // Main update loop
  useFrame((_, delta) => {
    if (!kaiRef.current) return;

    const state = stateRef.current;

    if (!state.isZipping) {
      // Look for nearby anchor to zip to
      const kai = kaiRef.current;
      const nearestAnchor = findNearestAnchor(kai.position);

      // Visual feedback: show available anchor
      if (nearestAnchor) {
        // In production, display HUD indicator for nearby anchor
        // For now, could emit event or set userData
        kai.userData.nearbyWebAnchor = nearestAnchor;
      } else {
        kai.userData.nearbyWebAnchor = null;
      }

      // Apply residual momentum from previous zip
      if (state.zipVelocity.lengthSq() > 0.01) {
        kai.position.addScaledVector(state.zipVelocity, delta);
        state.zipVelocity.multiplyScalar(0.85); // Friction
      }
    } else if (state.targetAnchor) {
      // Active zip to anchor
      state.zipProgress += delta / WEB_ZIP_CONFIG.zipDuration;

      if (state.zipProgress >= 1.0) {
        // Reached anchor
        kaiRef.current.position.copy(state.targetAnchor);
        completeZip();
      } else {
        // Interpolate toward anchor using eased curve
        const eased = state.zipProgress < 0.5
          ? 2 * state.zipProgress * state.zipProgress
          : -1 + (4 - 2 * state.zipProgress) * state.zipProgress;

        const newPos = state.zipStartPos.clone();
        newPos.lerp(state.targetAnchor, eased);
        kaiRef.current.position.copy(newPos);
      }
    }
  });

  return {
    state: stateRef.current,
    isZipping: () => stateRef.current.isZipping,
    findNearestAnchor,
    startZip,
    registerAnchorsFromScene,
    getWebVelocity: () => stateRef.current.zipVelocity.clone(),
  };
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
