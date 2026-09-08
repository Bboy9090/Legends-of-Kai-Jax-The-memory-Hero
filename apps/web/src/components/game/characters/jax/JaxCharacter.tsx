/**
 * JAX CHARACTER
 * Storm Beast-Kin model and animation presentation.
 *
 * Jax is dominated by Kar-Voth (electricity/displacement) and Thryxen
 * (storm/sovereignty). Myrr'Kai's spider inheritance belongs to Kai.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useJaxController } from './JaxController';
import { useGLTFCharacter } from '../GLTFCharacterLoader';

interface JaxCharacterProps {
  scene: THREE.Scene;
  onController?: (controller: ReturnType<typeof useJaxController>) => void;
}

export function JaxCharacter({ scene, onController }: JaxCharacterProps) {
  const jaxRef = useRef<THREE.Group>(null);
  const [fallbackReady, setFallbackReady] = useState(false);
  const jaxController = useJaxController(jaxRef, scene);

  useEffect(() => {
    onController?.(jaxController);
  }, [jaxController, onController]);

  // Load production GLTF model
  const { isLoaded: gltfLoaded } = useGLTFCharacter({
    modelPath: '/models/Meshy_AI_Character_output9TAILSKAIJAX.glb',
    onLoaded: (model) => {
      if (!jaxRef.current) return;
      jaxRef.current.position.y = 0;
    },
    onError: (error) => {
      console.warn('Failed to load Jax GLTF model, using fallback:', error);
      setFallbackReady(true);
    },
    scale: 1,
  });

  // Show GLTF model if loaded, otherwise use fallback
  useEffect(() => {
    if (!jaxRef.current) return;

    if (!gltfLoaded && !fallbackReady) {
      // Model is loading, show nothing or loading state
      return;
    }

    if (gltfLoaded) {
      // GLTF loaded successfully, remove any fallback geometry
      const fallbackMeshes = jaxRef.current.children.filter((child) => child.name?.includes('fallback'));
      fallbackMeshes.forEach((mesh) => {
        jaxRef.current?.remove(mesh);
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((m) => m.dispose());
        }
      });
      return;
    }

    // Fallback: use capsule geometry if GLTF failed to load
    if (fallbackReady && jaxRef.current.children.length === 0) {
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
      jaxRef.current.add(body);

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
      jaxRef.current.add(aura);
    }
  }, [gltfLoaded, fallbackReady]);

  return <group ref={jaxRef} position={[0, 0, 0]} />;
}
