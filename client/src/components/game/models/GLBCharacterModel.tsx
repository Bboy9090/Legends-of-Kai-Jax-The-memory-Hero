import { useRef, useEffect, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GLBCharacterModelProps {
  modelPath: string;
  bodyRef: React.RefObject<THREE.Group>;
  headRef?: React.RefObject<THREE.Group>;
  leftArmRef?: React.RefObject<THREE.Group>;
  rightArmRef?: React.RefObject<THREE.Group>;
  leftLegRef?: React.RefObject<THREE.Group>;
  rightLegRef?: React.RefObject<THREE.Group>;
  emotionIntensity?: number;
  hitAnim?: number;
  animTime?: number;
  isAttacking?: boolean;
  isInvulnerable?: boolean;
  primaryColor?: string;
  accentColor?: string;
  scale?: number;
}

function GLBModel({ 
  modelPath, 
  scale = 2.5,
  isInvulnerable = false,
  isAttacking = false,
  animTime = 0,
  primaryColor,
  accentColor
}: GLBCharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.emissive && isInvulnerable) {
              material.emissiveIntensity = 0.8;
            }
          }
        }
      });
    }
  }, [scene, isInvulnerable]);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (isAttacking) {
        groupRef.current.rotation.z = Math.sin(animTime * 20) * 0.1;
      } else {
        groupRef.current.rotation.z = Math.sin(animTime * 2) * 0.02;
      }
      
      groupRef.current.position.y = Math.sin(animTime * 3) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.2, 0]}>
      <primitive object={scene.clone()} />
      
      {isInvulnerable && (
        <mesh scale={1.3}>
          <sphereGeometry args={[0.6, 16, 12]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export default function GLBCharacterModel(props: GLBCharacterModelProps) {
  return (
    <Suspense fallback={
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshToonMaterial color={props.primaryColor || "#888888"} />
      </mesh>
    }>
      <GLBModel {...props} />
    </Suspense>
  );
}

export const CHARACTER_MODEL_PATHS: Record<string, string> = {
  'mario': '/models/mario_hero.glb',
  'sonic': '/models/velocity_hero.glb',
  'velocity': '/models/velocity_hero.glb',
  'link': '/models/ren_hero.glb',
  'ren': '/models/ren_hero.glb',
  'kirby': '/models/puffy_hero.glb',
  'puffy': '/models/puffy_hero.glb',
  'megaman': '/models/blaze_hero.glb',
  'blaze': '/models/blaze_hero.glb',
  'samus': '/models/sentinel_hero.glb',
  'sentinel': '/models/sentinel_hero.glb',
  'donkeykong': '/models/kong_hero.glb',
  'kong': '/models/kong_hero.glb',
  'pikachu': '/models/sparky_hero.glb',
  'sparky': '/models/sparky_hero.glb',
  'bowser': '/models/bowser_hero.glb',
  'zelda': '/models/zelda_hero.glb',
  'peach': '/models/peach_hero.glb',
  'fox': '/models/fox_hero.glb',
  'captain_falcon': '/models/apex_hero.glb',
  'apex': '/models/apex_hero.glb',
  'shadow': '/models/abyss_hero.glb',
  'abyss': '/models/abyss_hero.glb',
  'yoshi': '/models/yoshi_hero.glb',
  'luigi': '/models/luigi_hero.glb',
  'tails': '/models/tails_hero.glb',
  'falco': '/models/falco_hero.glb',
  'rosalina': '/models/rosalina_hero.glb',
  'impa': '/models/impa_hero.glb',
  'palutena': '/models/palutena_hero.glb',
  'ash': '/models/ash_hero.glb',
  'greninja': '/models/greninja_hero.glb',
  'snake': '/models/snake_hero.glb',
  'bayonetta': '/models/bayonetta_hero.glb',
  'ryu': '/models/ryu_hero.glb',
  'silver': '/models/silver_hero.glb',
  'solaro': '/models/solaro_hero.glb',
  'lunara': '/models/lunara_hero.glb',
  'diddy': '/models/diddy_hero.glb',
  'terry': '/models/terry_hero.glb'
};

export function hasGLBModel(characterId: string): boolean {
  return characterId in CHARACTER_MODEL_PATHS;
}

export function getModelPath(characterId: string): string | null {
  return CHARACTER_MODEL_PATHS[characterId] || null;
}
