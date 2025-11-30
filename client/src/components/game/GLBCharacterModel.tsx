import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const sceneRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Load model once
  useEffect(() => {
    if (!glbFileName) return;

    const loader = new THREE.GLTFLoader();
    loader.load(
      `/models/${glbFileName}`,
      (gltf) => {
        setScene(gltf.scene);
        setAnimations(gltf.animations || []);
      },
      undefined,
      () => console.warn(`Failed to load ${characterId}`)
    );
  }, [glbFileName, characterId]);

  // Setup mixer when scene loads
  useEffect(() => {
    if (!scene || !sceneRef.current || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(sceneRef.current);
    mixerRef.current = mixer;

    const action = mixer.clipAction(animations[0]);
    action.play();
    actionRef.current = action;
  }, [scene, animations]);

  // Update animations
  useFrame(() => {
    if (!mixerRef.current) return;

    const delta = clockRef.current.getDelta();
    mixerRef.current.update(delta);

    if (animations.length > 0 && actionRef.current) {
      let targetClip = animations[0];

      if (isAttacking && animations.length > 1) {
        const attackClip = animations.find((clip) =>
          clip.name.toLowerCase().includes('attack')
        );
        if (attackClip) targetClip = attackClip;
      } else if (animations.length > 2) {
        const walkClip = animations.find((clip) =>
          clip.name.toLowerCase().includes('walk')
        );
        if (walkClip) targetClip = walkClip;
      }

      const current = actionRef.current.getClip();
      if (current !== targetClip) {
        actionRef.current.fadeOut(0.2);
        const newAction = mixerRef.current.clipAction(targetClip);
        newAction.fadeIn(0.2).play();
        actionRef.current = newAction;
      }
    }
  });

  if (!scene) {
    return (
      <group ref={bodyRef}>
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 1, 16, 32]} />
          <meshToonMaterial color="#888888" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={bodyRef}>
      <group ref={sceneRef} scale={[2.5, 2.5, 2.5]}>
        <primitive object={scene} />
      </group>

      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.8}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
