import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import {
  findLimbs,
  captureBaseRotations,
  createAnimState,
  animateIdle,
  animateWalk,
  animatePunch,
  animateKick,
  animateSpecial,
  animateUltimate,
  hasAnyLimb,
  type LimbRefs,
  type LimbBaseRotations,
  type AnimState,
} from "../../../lib/animationUtils";

export interface GLBModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const CHARACTER_MODELS: Record<string, GLBModelConfig> = {
  "kai-jax": {
    path: "/models/emberwolf_warlord.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  jax: {
    path: "/models/Meshy_AI_Jax_Kai_icey_fox_0219223329_texture.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  kai: {
    path: "/models/Meshy_AI_Blazing_Fox_Warrior_0219223318_texture.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  jaxon: {
    path: "/models/jaxon_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  kaison: {
    path: "/models/kaison_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  kaxon: {
    path: "/models/kaxon_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "voltage-fang": {
    path: "/models/Meshy_AI_Voltage_Fang_0219222028_texture.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  steelwolf: {
    path: "/models/Meshy_AI_Steelwolf_Exosuit_0219223344_texture.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "ashen-tiger": {
    path: "/models/Meshy_AI_Ashen_Tiger_Warrior_0219222741_texture.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "blazing-fox": {
    path: "/models/blazing-fox-vanguard.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  velocity: {
    path: "/models/velocity_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  sparky: {
    path: "/models/sparky_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  sentinel: {
    path: "/models/sentinel_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  lunara: {
    path: "/models/lunara_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  solaro: {
    path: "/models/solaro_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  blaze: {
    path: "/models/blaze_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  abyss: {
    path: "/models/abyss_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "marble-gladiator": {
    path: "/models/marble_gladiator.glb",
    scale: 3.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "granite-colossus": {
    path: "/models/granite_colossus.glb",
    scale: 3.2,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  "sandstone-sentinel": {
    path: "/models/sandstone_sentinel.glb",
    scale: 2.8,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  apex: {
    path: "/models/apex_hero.glb",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  silver: {
    path: "/models/silver_hero.glb",
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
  attackType?: "punch" | "kick" | "special" | "ultimate" | null;
  velocityX?: number;
  velocityY?: number;
  isGrounded?: boolean;
  isJumping?: boolean;
  emotionIntensity?: number;
  accentColor?: string;
  isInvulnerable?: boolean;
  hitAnim?: number;
}

function GLBModelFallback() {
  return null;
}

const TARGET_HEIGHT = 2.8;

function GLBModelInner({
  config,
  animTime,
  isAttacking,
  isMoving,
  attackType,
  velocityX = 0,
  velocityY: _velocityY = 0,
  isGrounded = true,
  isJumping = false,
  emotionIntensity,
  accentColor,
  isInvulnerable = false,
  hitAnim = 0,
}: {
  config: GLBModelConfig;
  animTime: number;
  isAttacking: boolean;
  isMoving: boolean;
  attackType?: "punch" | "kick" | "special" | "ultimate" | null;
  velocityX?: number;
  velocityY?: number;
  isGrounded?: boolean;
  isJumping?: boolean;
  emotionIntensity: number;
  accentColor: string;
  isInvulnerable?: boolean;
  hitAnim?: number;
}) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(config.path);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const landSquash = useRef(0);
  const wasGrounded = useRef(true);

  const cloneRef = useRef<THREE.Group>(null);
  const mixerInitialized = useRef(false);
  const setupDone = useRef(false);
  const frameCount = useRef(0);
  const normalizedScale = useRef(config.scale);

  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const animStateRef = useRef<AnimState>(createAnimState());
  const wasAttacking = useRef(false);

  useFrame((state, delta) => {
    if (!innerRef.current || !cloneRef.current) return;
    const t = animTime || state.clock.elapsedTime;

    if (cloneRef.current && animations.length > 0 && !mixerInitialized.current) {
      mixerInitialized.current = true;
      const mixer = new THREE.AnimationMixer(cloneRef.current);
      mixerRef.current = mixer;
      const action = mixer.clipAction(animations[0]);
      action.play();
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    frameCount.current++;
    if (!setupDone.current && frameCount.current > 3) {
      setupDone.current = true;

      const bbox = new THREE.Box3().setFromObject(cloneRef.current);
      const modelHeight = bbox.max.y - bbox.min.y;
      if (modelHeight > 0.01) {
        normalizedScale.current = (TARGET_HEIGHT / modelHeight) * config.scale;
      }
      if (bbox.min.y < -0.05 && outerRef.current) {
        outerRef.current.position.y = -bbox.min.y * (normalizedScale.current / config.scale);
      }

      const limbs = findLimbs(cloneRef.current);
      limbsRef.current = hasAnyLimb(limbs) ? limbs : null;
      if (limbsRef.current) {
        basesRef.current = captureBaseRotations(limbsRef.current);
      }
    }

    const sc = normalizedScale.current;

    if (!wasGrounded.current && isGrounded) {
      landSquash.current = 1;
    }
    wasGrounded.current = isGrounded;
    landSquash.current = THREE.MathUtils.lerp(landSquash.current, 0, delta * 8);

    const squashY = 1 - landSquash.current * 0.2;
    const squashXZ = 1 + landSquash.current * 0.1;

    innerRef.current.scale.set(sc * squashXZ, sc * squashY, sc * squashXZ);

    if (hitAnim > 0) {
      innerRef.current.rotation.z = Math.sin(t * 22) * 0.08 * hitAnim;
    }

    if (isInvulnerable) {
      innerRef.current.visible = Math.sin(t * 30) > 0;
    } else {
      innerRef.current.visible = true;
    }

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const anim = animStateRef.current;

    if (isAttacking) {
      if (!wasAttacking.current) {
        anim.attackPhase = 0;
        anim.comboStep = (anim.comboStep + 1) % 8;
      }
      wasAttacking.current = true;
      if (attackType === "punch") {
        animatePunch(innerRef.current, limbs, bases, anim, delta, t);
      } else if (attackType === "kick") {
        animateKick(innerRef.current, limbs, bases, anim, delta);
      } else if (attackType === "special") {
        animateSpecial(innerRef.current, limbs, bases, anim, delta);
      } else if (attackType === "ultimate") {
        animateUltimate(innerRef.current, limbs, bases, anim, delta);
      } else {
        animatePunch(innerRef.current, limbs, bases, anim, delta, t);
      }
    } else if (isMoving) {
      wasAttacking.current = false;
      animateWalk(innerRef.current, limbs, bases, anim, delta, false);
    } else {
      wasAttacking.current = false;
      animateIdle(innerRef.current, limbs, bases, t, delta);
    }

    if (!isGrounded) {
      if (isJumping) {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, -0.15, delta * 6);
      } else {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, 0.1, delta * 6);
      }
    }
  });

  return (
    <group ref={outerRef}>
      <group
        ref={innerRef}
        position={config.position}
        rotation={
          config.rotation
            ? [config.rotation[0], config.rotation[1], config.rotation[2]]
            : undefined
        }
        scale={normalizedScale.current}
      >
        <group ref={cloneRef}>
          <Clone object={scene} castShadow receiveShadow />
        </group>
        <pointLight
          position={[0, 1.5, 0.5]}
          color={accentColor}
          intensity={emotionIntensity * 0.5}
          distance={3}
          decay={2}
        />
      </group>
    </group>
  );
}

export default function GLBCharacterModel(props: GLBCharacterModelProps) {
  const {
    fighterId,
    animTime = 0,
    isAttacking = false,
    isMoving = false,
    attackType = null,
    velocityX = 0,
    velocityY = 0,
    isGrounded = true,
    isJumping = false,
    emotionIntensity = 0.5,
    accentColor = "#00f2ff",
    isInvulnerable = false,
    hitAnim = 0,
  } = props;

  const config = CHARACTER_MODELS[fighterId];
  if (!config) return null;

  return (
    <Suspense fallback={<GLBModelFallback />}>
      <GLBModelInner
        config={config}
        animTime={animTime}
        isAttacking={isAttacking}
        isMoving={isMoving}
        attackType={attackType}
        velocityX={velocityX}
        velocityY={velocityY}
        isGrounded={isGrounded}
        isJumping={isJumping}
        emotionIntensity={emotionIntensity}
        accentColor={accentColor}
        isInvulnerable={isInvulnerable}
        hitAnim={hitAnim}
      />
    </Suspense>
  );
}

const PRELOAD_IDS = ["kai-jax", "jax", "kai"];
PRELOAD_IDS.forEach((id) => {
  const cfg = CHARACTER_MODELS[id];
  if (cfg) {
    try { useGLTF.preload(cfg.path); } catch (_e) {}
  }
});
