/**
 * JAX CHARACTER
 * Storm Beast-Kin model and animation controller
 *
 * Jax is dominated by Kar-Voth (electricity/displacement) and Thryxen (storm/sovereignty)
 * NOT part of the Myrr'Kai (spider) line - that's Kai's domain
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useJaxController } from './JaxController';

interface JaxCharacterProps {
  scene: THREE.Scene;
  onController?: (controller: any) => void;
}

export function JaxCharacter({ scene, onController }: JaxCharacterProps) {
  const jaxRef = useRef<THREE.Group>(null);
  const jaxController = useJaxController(jaxRef, scene);

  useEffect(() => {
    onController?.(jaxController);
  }, [jaxController, onController]);

  useEffect(() => {
    if (!jaxRef.current) return;

    // Create fallback geometry if model not loaded
    const group = jaxRef.current;
    if (group.children.length === 0) {
      // Fallback: simple capsule shape for Jax
      const geom = new THREE.CapsuleGeometry(0.3, 1.2, 8, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        emissive: 0x2244ff,
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.y = 0.6;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Add visual indicator for storm effect
      const stormGeom = new THREE.SphereGeometry(0.5, 8, 8);
      const stormMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2,
      });
      const stormMesh = new THREE.Mesh(stormGeom, stormMat);
      stormMesh.position.y = 0.6;
      stormMesh.scale.set(1.2, 1.2, 1.2);
      group.add(stormMesh);
    }

    group.position.y = 0;
  }, [scene]);

  return (
    <group
      ref={jaxRef}
      position={[0, 0, 0]}
    />
  );
}
