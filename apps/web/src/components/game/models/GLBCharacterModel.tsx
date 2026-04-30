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
import {
  MODEL_REGISTRY,
  getModelConfig,
  PRELOAD_MODEL_IDS,
  type GLBModelConfig,
} from "../../../assets/modelRegistry";

// Re-export for any legacy callers that still import from this module
export type { GLBModelConfig };
export { MODEL_REGISTRY as CHARACTER_MODELS };

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

const TARGET_HEIGHT = 3.5;

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
  /**
   * When the GLB has embedded clips, the mixer drives locomotion/idle.
   * Procedural limbs still run during attacks so punches/kicks read clearly (clips do not cover combat).
   */
  const clipDrivenRef = useRef(false);

  useFrame((state, delta) => {
    if (!innerRef.current || !cloneRef.current) return;
    const t = animTime || state.clock.elapsedTime;

    if (cloneRef.current && animations.length > 0 && !mixerInitialized.current) {
      mixerInitialized.current = true;
      clipDrivenRef.current = true;
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

    const useProceduralLocomotion = !clipDrivenRef.current;
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
    } else if (useProceduralLocomotion) {
      wasAttacking.current = false;
      if (isMoving) {
        animateWalk(innerRef.current, limbs, bases, anim, delta, false);
      } else {
        animateIdle(innerRef.current, limbs, bases, t, delta);
      }
    } else {
      wasAttacking.current = false;
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

  const config = getModelConfig(fighterId);
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

PRELOAD_MODEL_IDS.forEach((id) => {
  const cfg = MODEL_REGISTRY[id];
  if (cfg) {
    try {
      useGLTF.preload(cfg.path);
    } catch (_e) {}
  }
});
