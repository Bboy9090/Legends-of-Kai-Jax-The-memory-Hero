import React, { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

// Local model paths (served from /public/models)
export const MODELS = {
  crimsonHowl: '/models/crimson_howl.glb',
  blazingFox: '/models/blazing_fox.glb',
  stylized: '/models/stylized.glb',
};

// Preload all models
Object.values(MODELS).forEach((url) => useGLTF.preload(url));

// Cloned GLTF primitive — safely reuses skinned or static GLTF scenes
// Use SkeletonUtils.clone which handles both rigged + static meshes correctly.
export const ClonedModel = ({ url, castShadow = true, receiveShadow = true, ...props }) => {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        if (child.material) {
          child.material.side = 2; // DoubleSide for safety
        }
      }
    });
  }, [cloned, castShadow, receiveShadow]);

  return <primitive object={cloned} {...props} />;
};

export default ClonedModel;
