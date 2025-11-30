import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import * as THREE from 'three';

interface GLBCharacterModelProps {
  characterId: string;
  bodyRef: React.RefObject<Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
}

const CHARACTER_GLB_MAP: Record<string, string> = {
  'mario': 'mario_hero.glb',
  'luigi': 'luigi_hero.glb',
  'sonic': 'hedgehog_hero.glb',
  'link': 'ren_hero.glb',
  'zelda': 'zelda_hero.glb',
  'peach': 'peach_hero.glb',
  'yoshi': 'yoshi_hero.glb',
  'donkeykong': 'kong_hero.glb',
  'tails': 'tails_hero.glb',
  'kirby': 'puffy_hero.glb',
  'bowser': 'bowser_hero.glb',
  'megaman': 'blaze_hero.glb',
  'samus': 'sentinel_hero.glb',
  'fox': 'fox_hero.glb',
  'pikachu': 'sparky_hero.glb',
  'shadow': 'abyss_hero.glb',
};

export default function GLBCharacterModel({
  characterId,
  bodyRef,
  emotionIntensity,
  hitAnim,
  animTime,
  isAttacking,
  isInvulnerable,
}: GLBCharacterModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  const glbFileName = CHARACTER_GLB_MAP[characterId];

  let gltf = null;
  try {
    if (glbFileName) {
      gltf = useGLTF(`/models/${glbFileName}`);
    }
  } catch (err) {
    console.warn(`Could not load model for ${characterId}`);
  }

  useFrame(() => {
    if (modelRef.current && isAttacking) {
      modelRef.current.rotation.z += 0.05;
    }
  });

  return (
    <group ref={bodyRef}>
      {gltf ? (
        <group ref={modelRef} scale={[2.5, 2.5, 2.5]}>
          <primitive object={gltf.scene} />
        </group>
      ) : (
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 1, 16, 32]} />
          <meshToonMaterial color="#888888" />
        </mesh>
      )}
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.8}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
