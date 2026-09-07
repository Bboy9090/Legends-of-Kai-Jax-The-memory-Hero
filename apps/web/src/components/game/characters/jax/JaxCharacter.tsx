/**
 * JAX CHARACTER
 * Storm Beast-Kin model and animation presentation.
 *
 * Jax is dominated by Kar-Voth (electricity/displacement) and Thryxen
 * (storm/sovereignty). Myrr'Kai's spider inheritance belongs to Kai.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useJaxController } from './JaxController';

interface JaxCharacterProps {
  scene: THREE.Scene;
  onController?: (controller: ReturnType<typeof useJaxController>) => void;
}

export function JaxCharacter({ scene, onController }: JaxCharacterProps) {
  const jaxRef = useRef<THREE.Group>(null);
  const jaxController = useJaxController(jaxRef, scene);

  useEffect(() => {
    onController?.(jaxController);
  }, [jaxController, onController]);

  useEffect(() => {
    if (!jaxRef.current) return;

    const group = jaxRef.current;
    const fallbackObjects: THREE.Mesh[] = [];

    if (group.children.length === 0) {
      const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 8, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        emissive: 0x2244ff,
        emissiveIntensity: 0.3,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.name = 'jax-fallback-body';
      body.position.y = 0.6;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      fallbackObjects.push(body);

      const auraGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2,
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      aura.name = 'jax-fallback-storm-aura';
      aura.position.y = 0.6;
      aura.scale.setScalar(1.2);
      group.add(aura);
      fallbackObjects.push(aura);
    }

    group.position.y = 0;

    return () => {
      for (const mesh of fallbackObjects) {
        group.remove(mesh);
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
      }
    };
  }, []);

  return <group ref={jaxRef} position={[0, 0, 0]} />;
}
