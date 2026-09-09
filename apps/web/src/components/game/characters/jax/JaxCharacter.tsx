/**
 * JAX CHARACTER
 * Storm Beast-Kin runtime wrapper.
 *
 * Jax is dominated by Kar-Voth (electricity/displacement) and Thryxen
 * (storm/sovereignty). Myrr'Kai's spider inheritance belongs to Kai.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getModelConfig } from '../../../../assets/modelRegistry';
import { useJaxController } from './JaxController';
import { useGLTFCharacter } from '../GLTFCharacterLoader';

interface JaxCharacterProps {
  scene: THREE.Scene;
  onController?: (controller: ReturnType<typeof useJaxController>) => void;
  bodyRef?: React.RefObject<THREE.Group>;
  position?: [number, number, number];
  scale?: number;
}

export function JaxCharacter({
  scene,
  onController,
  bodyRef,
  position = [0, 0, 0],
  scale = 1,
}: JaxCharacterProps) {
  const jaxRef = useRef<THREE.Group>(null);
  const effectiveRef = bodyRef ?? jaxRef;
  const [fallbackReady, setFallbackReady] = useState(false);
  const jaxController = useJaxController(effectiveRef, scene);
  const modelConfig = getModelConfig('jax')!;

  useEffect(() => {
    onController?.(jaxController);
  }, [jaxController, onController]);

  const { groupRef: loaderGroupRef, isLoaded: gltfLoaded } = useGLTFCharacter({
    modelPath: modelConfig.path,
    onLoaded: () => {
      if (!effectiveRef.current) return;
      effectiveRef.current.position.y = 0;
    },
    onError: (error) => {
      console.warn('Failed to load Jax GLTF model, using fallback:', error);
      setFallbackReady(true);
    },
    scale: modelConfig.scale,
  });

  useEffect(() => {
    if (!effectiveRef.current || !loaderGroupRef.current || !gltfLoaded) return;

    while (loaderGroupRef.current.children.length > 0) {
      const child = loaderGroupRef.current.children[0];
      effectiveRef.current.add(child);
    }
  }, [gltfLoaded, loaderGroupRef, effectiveRef]);

  useEffect(() => {
    if (!effectiveRef.current) return;

    if (!gltfLoaded && !fallbackReady) return;

    if (gltfLoaded) {
      const fallbackMeshes = effectiveRef.current.children.filter((child) =>
        child.name?.includes('fallback')
      );
      fallbackMeshes.forEach((mesh) => {
        effectiveRef.current?.remove(mesh);
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => material.dispose());
        }
      });
      return;
    }

    if (fallbackReady && effectiveRef.current.children.length === 0) {
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
      effectiveRef.current.add(body);

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
      effectiveRef.current.add(aura);
    }
  }, [gltfLoaded, fallbackReady, effectiveRef]);

  return (
    <>
      <group ref={loaderGroupRef} visible={false} />
      <group ref={effectiveRef} position={position} scale={scale} />
    </>
  );
}
