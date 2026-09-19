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
    const boundsCenter = bounds.getCenter(new THREE.Vector3());

    console.group(`[ProductionCharacterVisual] ${fighterId}`);
    console.log('✓ Model loaded:', config.path);
    console.log('✓ Meshes found:', meshCount, '(rendereable geometry present)');
    console.log('✓ Animations available:', animations.length);
    console.log('Configuration:');
    console.log('  - Scale:', config.scale);
    console.log('  - Position:', config.position);
    console.log('  - Rotation:', `${config.rotation ? config.rotation[1] + ' radians' : 'default'} (facing direction)`);
    console.log('Scene bounds after scaling:');
    console.log(`  - Min: (${bounds.min.x.toFixed(2)}, ${bounds.min.y.toFixed(2)}, ${bounds.min.z.toFixed(2)})`);
    console.log(`  - Max: (${bounds.max.x.toFixed(2)}, ${bounds.max.y.toFixed(2)}, ${bounds.max.z.toFixed(2)})`);
    console.log(`  - Size: (${boundsSize.x.toFixed(2)}, ${boundsSize.y.toFixed(2)}, ${boundsSize.z.toFixed(2)})`);
    console.log(`  - Center: (${boundsCenter.x.toFixed(2)}, ${boundsCenter.y.toFixed(2)}, ${boundsCenter.z.toFixed(2)})`);
    if (meshCount === 0) {
      console.error('❌ NO MESHES - model will be invisible');
    } else if (boundsSize.y < 0.1) {
      console.warn('⚠️ TINY HEIGHT - model may be outside view');
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
