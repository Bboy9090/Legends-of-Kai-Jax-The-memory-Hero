import { useRef, useEffect, useMemo } from 'react';
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
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  const glbFileName = CHARACTER_GLB_MAP[characterId];

  let gltf = null;
  try {
    if (glbFileName) {
      gltf = useGLTF(`/models/${glbFileName}`);
    }
  } catch (err) {
    console.warn(`Could not load model for ${characterId}`);
  }

  // Initialize animations
  useEffect(() => {
    if (!gltf || !modelRef.current) return;

    const mixer = new THREE.AnimationMixer(modelRef.current);
    mixerRef.current = mixer;

    if (gltf.animations && gltf.animations.length > 0) {
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actionsRef.current.set(clip.name, action);
      });
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [gltf]);

  // Handle animation playback based on state
  useFrame((_, delta) => {
    if (!mixerRef.current) return;

    // Get target animation name
    let targetAnimation = 'Idle';
    if (isAttacking) {
      targetAnimation = 'Attack';
    }

    // Find animation with partial name match
    let action: THREE.AnimationAction | null = null;
    const entries = Array.from(actionsRef.current.entries());
    for (const [name, act] of entries) {
      if (name.includes(targetAnimation) || name.toLowerCase().includes(targetAnimation.toLowerCase())) {
        action = act;
        break;
      }
    }

    // If no matching animation found, try first available
    if (!action && actionsRef.current.size > 0) {
      action = Array.from(actionsRef.current.values())[0];
    }

    // Transition to new action
    if (action && action !== currentActionRef.current) {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.3);
      }
      action.reset().fadeIn(0.3).play();
      currentActionRef.current = action;
    }

    mixerRef.current.update(delta);
  });

  // Procedurally animate arms and legs if no skeleton animations
  useFrame(() => {
    if (!modelRef.current) return;

    // Find and animate arm bones
    modelRef.current.traverse((child: any) => {
      if (!child.name) return;

      const name = child.name.toLowerCase();

      // Animate arms - swing left/right with movement
      if (name.includes('arm') || name.includes('shoulder')) {
        if (name.includes('left')) {
          child.rotation.z = Math.sin(animTime * 4) * 0.5;
          child.rotation.x = Math.cos(animTime * 4) * 0.3;
        } else if (name.includes('right')) {
          child.rotation.z = -Math.sin(animTime * 4) * 0.5;
          child.rotation.x = -Math.cos(animTime * 4) * 0.3;
        }
      }

      // Animate legs - walk cycle
      if (name.includes('leg') || name.includes('foot')) {
        if (name.includes('left')) {
          child.rotation.x = Math.sin(animTime * 3 + Math.PI) * 0.4;
        } else if (name.includes('right')) {
          child.rotation.x = Math.sin(animTime * 3) * 0.4;
        }
      }

      // Torso - slight rotation during attacks
      if ((name.includes('torso') || name.includes('spine') || name.includes('chest')) && isAttacking) {
        child.rotation.z = Math.sin(animTime * 8) * 0.3;
      }
    });
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
