import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';
import { getMovementProfile, MovementProfile } from '../../lib/stores/useFluidCombat';
import { CharacterRole } from '../../lib/roster';

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
  characterRole?: CharacterRole;
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
  isMoving = false,
  moveSpeed = 0,
  attackPhase,
  characterRole = 'Vanguard',
}: GLBCharacterModelProps) {
  const glbFileName = CHARACTER_GLB_MAP[characterId];
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const sceneRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);
  const legLeftRef = useRef<THREE.Group>(null);
  const legRightRef = useRef<THREE.Group>(null);

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

  // Procedural animation based on movement
  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    const profile = getMovementProfile(characterRole);
    const time = state.clock.elapsedTime;

    // Handle embedded animations if available
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Procedural animation override
    if (isAttacking && attackPhase) {
      // Attack animations
      animateAttack(bodyRef.current, attackPhase, time, profile);
    } else if (isMoving && moveSpeed > 0.1) {
      // Walking/Running animation
      const animSpeed = profile.animationSpeed * (moveSpeed / 4); // Normalize to walk speed
      const t = time * animSpeed;
      
      // Arm swing
      bodyRef.current.children.forEach((child) => {
        if (child.name.includes('arm') || child.name.includes('Arm')) {
          const isLeft = child.name.toLowerCase().includes('left');
          const swing = Math.sin(t) * profile.armSwingIntensity;
          child.rotation.z = isLeft ? swing : -swing;
          child.rotation.x = Math.cos(t) * 0.3 * profile.armSwingIntensity;
        }
        if (child.name.includes('leg') || child.name.includes('Leg')) {
          const isLeft = child.name.toLowerCase().includes('left');
          const swing = Math.sin(t) * profile.legSwingIntensity;
          child.rotation.x = isLeft ? swing : -swing;
        }
      });
      
      // Body bob
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2)) * profile.bounceIntensity;
    } else {
      // Idle animation
      const breathe = Math.sin(time * 2) * 0.02;
      bodyRef.current.position.y = breathe;
    }
  });

  const animateAttack = (body: THREE.Group, phase: string, time: number, profile: MovementProfile) => {
    body.children.forEach((child) => {
      if (phase === 'active') {
        if (child.name.includes('arm') || child.name.includes('Arm')) {
          const isRight = child.name.toLowerCase().includes('right');
          child.position.x = isRight ? 0.5 : -0.5;
          child.rotation.z = isRight ? -Math.PI / 2 : Math.PI / 2;
        }
        if (child.name.includes('leg') || child.name.includes('Leg')) {
          child.rotation.x = 0.3;
        }
      }
    });
  };

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
