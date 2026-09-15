/**
 * LAYER ASSIGNMENT HELPER
 * Sets THREE.Layers on objects for raycasting separation.
 * Layer 0: Physics/collision geometry (proxy meshes)
 * Layer 1: Visual-only geometry (character models)
 */

import { useEffect } from 'react';
import * as THREE from 'three';

interface LayerAssignmentHelperProps {
  targetRef: React.RefObject<THREE.Object3D>;
  layer: number;
}

export function LayerAssignmentHelper({ targetRef, layer }: LayerAssignmentHelperProps) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    target.traverse((obj) => {
      obj.layers.set(layer);
    });
  }, [targetRef, layer]);

  return null;
}
