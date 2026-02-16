import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface GLBModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const CHARACTER_MODELS: Record<string, GLBModelConfig> = {
  "kai-jax": {
    path: "/models/blazing-fox-vanguard.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "jaxon": {
    path: "/models/neon-wraiths.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "kaison": {
    path: "/models/stylized-beast.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
};

interface GLBCharacterModelProps {
  fighterId: string;
  animTime?: number;
  isAttacking?: boolean;
  isMoving?: boolean;
  emotionIntensity?: number;
  accentColor?: string;
}

export default function GLBCharacterModel({
  fighterId,
  animTime = 0,
  isAttacking = false,
  isMoving = false,
  emotionIntensity = 0.5,
  accentColor = "#00f2ff",
}: GLBCharacterModelProps) {
  const config = CHARACTER_MODELS[fighterId];
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  if (!config) return null;

  return (
    <GLBModelInner
      config={config}
      groupRef={groupRef}
      mixerRef={mixerRef}
      animTime={animTime}
      isAttacking={isAttacking}
      isMoving={isMoving}
      emotionIntensity={emotionIntensity}
      accentColor={accentColor}
    />
  );
}

function GLBModelInner({
  config,
  groupRef,
  mixerRef,
  animTime,
  isAttacking,
  isMoving,
  emotionIntensity,
  accentColor,
}: {
  config: GLBModelConfig;
  groupRef: React.RefObject<THREE.Group>;
  mixerRef: React.MutableRefObject<THREE.AnimationMixer | null>;
  animTime: number;
  isAttacking: boolean;
  isMoving: boolean;
  emotionIntensity: number;
  accentColor: string;
}) {
  const { scene, animations } = useGLTF(config.path);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    if (animations && animations.length > 0 && clonedScene) {
      const mixer = new THREE.AnimationMixer(clonedScene);
      mixerRef.current = mixer;
      const action = mixer.clipAction(animations[0]);
      action.play();
      return () => {
        mixer.stopAllAction();
      };
    }
  }, [animations, clonedScene, mixerRef]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (groupRef.current) {
      const breathe = Math.sin(animTime * 1.5) * 0.005;
      groupRef.current.position.y = config.position[1] + breathe;

      if (isMoving) {
        const bob = Math.sin(animTime * 8) * 0.015;
        groupRef.current.position.y += bob;
      }

      if (isAttacking) {
        groupRef.current.rotation.y += delta * 2;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation ? [config.rotation[0], config.rotation[1], config.rotation[2]] : undefined}
      scale={config.scale}
    >
      <primitive object={clonedScene} />
      <pointLight
        position={[0, 1.5, 0.5]}
        color={accentColor}
        intensity={emotionIntensity * 2}
        distance={3}
        decay={2}
      />
    </group>
  );
}

Object.values(CHARACTER_MODELS).forEach((config) => {
  try {
    useGLTF.preload(config.path);
  } catch (e) {
    // silently skip preload errors
  }
});
