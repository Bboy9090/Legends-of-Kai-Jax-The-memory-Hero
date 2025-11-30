import { useRef, useEffect } from 'react';
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
  isMoving?: boolean;
  moveSpeed?: number;
  attackPhase?: 'windup' | 'active' | 'recovery';
  characterRole?: string;
}

const CHARACTER_GLB_MAP: Record<string, string> = {
  'mario': 'mario_hero.glb', 'luigi': 'luigi_hero.glb', 'sonic': 'hedgehog_hero.glb',
  'link': 'ren_hero.glb', 'zelda': 'zelda_hero.glb', 'peach': 'peach_hero.glb',
  'yoshi': 'yoshi_hero.glb', 'donkeykong': 'kong_hero.glb', 'tails': 'tails_hero.glb',
  'kirby': 'puffy_hero.glb', 'bowser': 'bowser_hero.glb', 'megaman': 'blaze_hero.glb',
  'samus': 'sentinel_hero.glb', 'fox': 'fox_hero.glb', 'pikachu': 'sparky_hero.glb',
  'shadow': 'abyss_hero.glb', 'captain_falcon': 'apex_hero.glb', 'rosalina': 'rosalina_hero.glb',
  'palutena': 'palutena_hero.glb', 'ash': 'ash_hero.glb', 'bayonetta': 'bayonetta_hero.glb',
  'snake': 'snake_hero.glb', 'ryu': 'ryu_hero.glb', 'greninja': 'greninja_hero.glb',
  'solaro': 'solaro_hero.glb', 'silver': 'silver_hero.glb', 'lunara': 'lunara_hero.glb',
  'impa': 'impa_hero.glb', 'cloud': 'cloud_hero.glb', 'sephiroth': 'sephiroth_hero.glb',
  'sora': 'sora_hero.glb', 'steve': 'steve_hero.glb', 'kazuya': 'kazuya_hero.glb',
  'terry': 'terry_hero.glb', 'hero': 'hero_hero.glb', 'ridley': 'ridley_hero.glb',
  'inkling': 'inkling_hero.glb', 'pacman': 'pacman_hero.glb', 'ken': 'ken_hero.glb',
  'joker': 'joker_hero.glb', 'banjo': 'banjo_hero.glb', 'falco': 'falco_hero.glb',
  'marth': 'marth_hero.glb', 'pit': 'pit_hero.glb', 'mewtwo': 'mewtwo_hero.glb',
  'lucario': 'lucario_hero.glb', 'ness': 'ness_hero.glb', 'metaknight': 'metaknight_hero.glb',
  'dedede': 'dedede_hero.glb', 'wario': 'wario_hero.glb', 'waluigi': 'waluigi_hero.glb',
  'littlemac': 'littlemac_hero.glb', 'shulk': 'shulk_hero.glb', 'pyra': 'pyra_hero.glb',
  'minmin': 'minmin_hero.glb', 'chunli': 'chunli_hero.glb', 'simon': 'simon_hero.glb',
  'diddy': 'diddy_hero.glb', 'iceclimbers': 'iceclimbers_hero.glb',
};

export default function GLBCharacterModel({
  characterId,
  bodyRef,
  isAttacking,
  isInvulnerable,
  isMoving = false,
  moveSpeed = 0,
  attackPhase,
  characterRole = 'Vanguard',
}: GLBCharacterModelProps) {
  const glbFileName = CHARACTER_GLB_MAP[characterId];
  const modelPath = glbFileName ? `/models/${glbFileName}` : null;
  const sceneRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  let gltf: any = null;
  try {
    if (modelPath) gltf = useGLTF(modelPath);
  } catch (e) {
    // Model not found
  }

  useEffect(() => {
    if (!gltf?.scene || !sceneRef.current) return;
    const mixer = new THREE.AnimationMixer(sceneRef.current);
    mixerRef.current = mixer;
    if (gltf.animations?.length > 0) {
      mixer.clipAction(gltf.animations[0]).play();
    }
  }, [gltf?.scene, gltf?.animations]);

  // Animate the model with VERY VISIBLE movements
  useFrame((state, delta) => {
    if (!sceneRef.current) return;
    
    if (mixerRef.current) mixerRef.current.update(delta);

    const time = state.clock.elapsedTime;

    if (isAttacking && attackPhase === 'active') {
      // ATTACK: Strong forward lean and squash
      sceneRef.current.position.set(0.3, 0, 0.4);
      sceneRef.current.rotation.set(0.15, 0, 0);
      sceneRef.current.scale.set(1.1, 0.85, 1.2);
      console.log('ATTACKING - lean forward');
    } else if (isMoving && moveSpeed > 0.05) {
      // MOVEMENT: BIG bob up/down, rotation, scale pulse
      const t = time * 10 * Math.min(moveSpeed, 1);
      const bobHeight = Math.abs(Math.sin(t)) * 0.5; // HUGE bob
      
      sceneRef.current.position.y = bobHeight;
      sceneRef.current.position.z = Math.sin(t * 0.5) * 0.1;
      
      // Rotation for dynamic feel
      sceneRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
      sceneRef.current.rotation.z = Math.sin(t) * 0.08;
      
      // Scale pulse for running effect
      const scaleFactor = 1 + Math.sin(t * 2) * 0.15;
      sceneRef.current.scale.set(scaleFactor, scaleFactor * 0.95, scaleFactor);
      
      console.log(`Moving animation - bob=${bobHeight.toFixed(2)}, speed=${moveSpeed.toFixed(2)}`);
    } else {
      // IDLE: subtle breathing
      const breathe = Math.sin(time * 2) * 0.02;
      sceneRef.current.position.set(0, breathe, 0);
      sceneRef.current.rotation.set(0, 0, 0);
      sceneRef.current.scale.set(1, 1, 1);
    }
  });

  // Fallback
  if (!gltf?.scene) {
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
        <primitive object={gltf.scene} />
      </group>
      {isInvulnerable && (
        <mesh scale={1.8}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
