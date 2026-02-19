import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";

export interface GLBModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const CHARACTER_MODELS: Record<string, GLBModelConfig> = {
  "kai-jax": {
    path: "/models/Meshy_AI_Jax_Stormfang_the_Arm_0219222010_texture.glb",
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
    path: "/models/Meshy_AI_Kai_sabertooth_fox_sp_0219223337_texture.glb",
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
    path: "/models/Meshy_AI_Blazing_Fox_Warrior_0219223318_texture.glb",
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
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(config.path);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const landSquash = useRef(0);
  const wasGrounded = useRef(true);

  const cloneRef = useRef<THREE.Group>(null);
  const mixerInitialized = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
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

    if (!wasGrounded.current && isGrounded) {
      landSquash.current = 1;
    }
    wasGrounded.current = isGrounded;
    landSquash.current = THREE.MathUtils.lerp(landSquash.current, 0, delta * 8);

    const squashY = 1 - landSquash.current * 0.2;
    const squashXZ = 1 + landSquash.current * 0.1;

    const breathe = Math.sin(t * 2.0) * 0.02;
    const speed = Math.abs(velocityX);
    const walkRate = 8 + speed * 2;
    const walkAmp = Math.min(speed / 6, 1);
    const walk = isMoving || speed > 0.5 ? Math.sin(t * walkRate) * walkAmp : 0;

    groupRef.current.position.y = breathe;
    groupRef.current.scale.set(
      config.scale * squashXZ,
      config.scale * squashY,
      config.scale * squashXZ
    );

    if (hitAnim > 0) {
      groupRef.current.rotation.z = Math.sin(t * 22) * 0.08 * hitAnim;
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 10);
    }

    if (isInvulnerable) {
      groupRef.current.visible = Math.sin(t * 30) > 0;
    } else {
      groupRef.current.visible = true;
    }

    if (!isGrounded) {
      if (isJumping) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.15, delta * 6);
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.1, delta * 6);
      }
    } else if (isAttacking) {
      const leanAmount = attackType === "kick" ? -0.2 : attackType === "special" || attackType === "ultimate" ? 0.25 : 0.15;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, leanAmount, delta * 10);
    } else if (isMoving) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.05, delta * 6);
      groupRef.current.position.y += Math.abs(walk) * 0.03;
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 6);
    }

    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.08 + (isMoving ? velocityX * 0.02 : 0);
  });

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={
        config.rotation
          ? [config.rotation[0], config.rotation[1], config.rotation[2]]
          : undefined
      }
      scale={config.scale}
    >
      <group ref={cloneRef}>
        <Clone object={scene} castShadow receiveShadow />
      </group>
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
