/**
 * GLTF CHARACTER LOADER
 * Loads and manages production character models from GLTF/GLB files.
 * Replaces procedural capsule/cylinder fallbacks with rigged character meshes.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface GLTFCharacterLoaderProps {
  modelPath: string;
  onLoaded?: (gltf: THREE.Group) => void;
  onError?: (error: Error) => void;
  scale?: number;
  position?: [number, number, number];
}

/**
 * Load and return a GLTF character model
 * Handles resource cleanup and error states
 */
export function useGLTFCharacter({
  modelPath,
  onLoaded,
  onError,
  scale = 1,
  position = [0, 0, 0],
}: GLTFCharacterLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loaderRef = useRef(new GLTFLoader());

  useEffect(() => {
    if (!groupRef.current || !modelPath) return;

    const group = groupRef.current;
    let isMounted = true;

    const loader = loaderRef.current;

    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted || !groupRef.current) return;

        const scene = gltf.scene;
        scene.scale.setScalar(scale);
        scene.position.set(...position);

        // Configure materials and shadows for production models
        scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              const material = Array.isArray(node.material) ? node.material : [node.material];
              material.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhongMaterial) {
                  m.side = THREE.FrontSide;
                }
              });
            }
          }
        });

        group.add(scene);
        setIsLoaded(true);
        onLoaded?.(scene);
      },
      (progress) => {
        // Optional: handle loading progress
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`Loading ${modelPath}: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        }
      },
      (error) => {
        if (!isMounted) return;

        const err = new Error(`Failed to load character model: ${modelPath}`);
        console.error(err, error);
        setError(err);
        onError?.(err);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [modelPath, scale, position, onLoaded, onError]);

  return { groupRef, isLoaded, error };
}

/**
 * GLTF Character Loader Component
 * Use this as a direct replacement for procedural character geometry
 */
export function GLTFCharacter({
  modelPath,
  onLoaded,
  onError,
  scale = 1,
  position = [0, 0, 0],
  fallback,
}: GLTFCharacterLoaderProps & {
  fallback?: React.ReactNode;
}) {
  const { groupRef, isLoaded, error } = useGLTFCharacter({
    modelPath,
    onLoaded,
    onError,
    scale,
    position,
  });

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return <group ref={groupRef} />;
}
