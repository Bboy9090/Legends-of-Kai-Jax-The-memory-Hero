import { useEffect, useMemo } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getModelConfig } from '../../../assets/modelRegistry';

export type ProductionStoryHeroId = 'kai' | 'jax';

export interface ProductionCharacterReadyInfo {
  fighterId: ProductionStoryHeroId;
  modelPath: string;
  meshCount: number;
  animationCount: number;
}

interface ProductionCharacterVisualProps {
  fighterId: ProductionStoryHeroId;
  targetHeight?: number;
  onReady?: (info: ProductionCharacterReadyInfo) => void;
}

/**
 * Presentation-only production character renderer.
 *
 * This component deliberately owns no locomotion, collision, combat target,
 * controller, or mission state. It is safe to mount in preview/story UI canvases
 * without changing the gameplay scene graph used by the Ashblock runtime harness.
 */
export function ProductionCharacterVisual({
  fighterId,
  targetHeight = 2.35,
  onReady,
}: ProductionCharacterVisualProps) {
  const config = useMemo(() => getModelConfig(fighterId)!, [fighterId]);
  const { scene, animations } = useGLTF(config.path);

  const prepared = useMemo(() => {
    const model = SkeletonUtils.clone(scene) as THREE.Group;
    const [rotationX, rotationY, rotationZ] = config.rotation ?? [0, 0, 0];

    model.position.set(...config.position);
    model.rotation.set(rotationX, rotationY, rotationZ);
    model.scale.setScalar(config.scale);

    let meshCount = 0;
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      meshCount += 1;
      node.castShadow = true;
      node.receiveShadow = true;
      node.userData.presentationOnly = true;
    });

    model.updateMatrixWorld(true);
    const initialBounds = new THREE.Box3().setFromObject(model);
    const initialHeight = initialBounds.max.y - initialBounds.min.y;
    if (Number.isFinite(initialHeight) && initialHeight > 0.001) {
      model.scale.multiplyScalar(
        THREE.MathUtils.clamp(targetHeight / initialHeight, 0.01, 100)
      );
    }

    model.updateMatrixWorld(true);
    const groundedBounds = new THREE.Box3().setFromObject(model);
    if (Number.isFinite(groundedBounds.min.y)) {
      model.position.y += -groundedBounds.min.y;
    }

    model.userData.productionCharacter = fighterId;
    model.userData.productionMeshCount = meshCount;
    return model;
  }, [scene, config, fighterId, targetHeight]);

  const { actions } = useAnimations(animations, prepared);

  useEffect(() => {
    const names = Object.keys(actions);
    if (names.length === 0) return;

    const idleName = names.find((name) => /idle/i.test(name)) ?? names[0];
    const action = idleName ? actions[idleName] : undefined;
    action?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.15);
    };
  }, [actions]);

  useEffect(() => {
    // Log scene graph structure for debugging visibility issues
    const meshCount = Number(prepared.userData.productionMeshCount ?? 0);
    const bounds = new THREE.Box3().setFromObject(prepared);
    const boundsSize = bounds.getSize(new THREE.Vector3());

    console.group(`[ProductionCharacterVisual] ${fighterId}`);
    console.log('Model path:', config.path);
    console.log('Meshes found:', meshCount);
    console.log('Animations:', animations.length);
    console.log('Model scale:', config.scale);
    console.log('Model position:', config.position);
    console.log('Model rotation:', config.rotation);
    console.log('Bounding box:', {
      min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
      max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
      size: { x: boundsSize.x, y: boundsSize.y, z: boundsSize.z },
    });
    if (meshCount === 0) {
      console.warn('⚠️ NO MESHES FOUND - GLB may contain only skeleton/animations');
    }
    console.groupEnd();

    onReady?.({
      fighterId,
      modelPath: config.path,
      meshCount,
      animationCount: animations.length,
    });
  }, [animations.length, config.path, fighterId, onReady, prepared]);

  return <primitive object={prepared} />;
}
