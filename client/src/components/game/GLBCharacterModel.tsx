import { useRef } from 'react';
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
  'captain_falcon': 'apex_hero.glb',
  'rosalina': 'rosalina_hero.glb',
  'palutena': 'palutena_hero.glb',
  'ash': 'ash_hero.glb',
  'bayonetta': 'bayonetta_hero.glb',
  'snake': 'snake_hero.glb',
  'ryu': 'ryu_hero.glb',
  'greninja': 'greninja_hero.glb',
  'solaro': 'solaro_hero.glb',
  'silver': 'silver_hero.glb',
  'lunara': 'lunara_hero.glb',
  'impa': 'impa_hero.glb',
  'cloud': 'cloud_hero.glb',
  'sephiroth': 'sephiroth_hero.glb',
  'sora': 'sora_hero.glb',
  'steve': 'steve_hero.glb',
  'kazuya': 'kazuya_hero.glb',
  'terry': 'terry_hero.glb',
  'hero': 'hero_hero.glb',
  'ridley': 'ridley_hero.glb',
  'inkling': 'inkling_hero.glb',
  'pacman': 'pacman_hero.glb',
  'ken': 'ken_hero.glb',
  'joker': 'joker_hero.glb',
  'banjo': 'banjo_hero.glb',
  'falco': 'falco_hero.glb',
  'marth': 'marth_hero.glb',
  'pit': 'pit_hero.glb',
  'mewtwo': 'mewtwo_hero.glb',
  'lucario': 'lucario_hero.glb',
  'ness': 'ness_hero.glb',
  'metaknight': 'metaknight_hero.glb',
  'dedede': 'dedede_hero.glb',
  'wario': 'wario_hero.glb',
  'waluigi': 'waluigi_hero.glb',
  'littlemac': 'littlemac_hero.glb',
  'shulk': 'shulk_hero.glb',
  'pyra': 'pyra_hero.glb',
  'minmin': 'minmin_hero.glb',
  'chunli': 'chunli_hero.glb',
  'simon': 'simon_hero.glb',
  'diddy': 'diddy_hero.glb',
  'iceclimbers': 'iceclimbers_hero.glb',
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
  const glbFileName = CHARACTER_GLB_MAP[characterId];

  if (!glbFileName) {
    return (
      <group ref={bodyRef}>
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 1, 16, 32]} />
          <meshToonMaterial color="#888888" />
        </mesh>
      </group>
    );
  }

  try {
    const gltf = useGLTF(`/models/${glbFileName}`);

    return (
      <group ref={bodyRef}>
        <group scale={[2.5, 2.5, 2.5]}>
          <primitive object={gltf.scene} />
        </group>

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
  } catch (err) {
    return (
      <group ref={bodyRef}>
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 1, 16, 32]} />
          <meshToonMaterial color="#888888" />
        </mesh>
      </group>
    );
  }
}
