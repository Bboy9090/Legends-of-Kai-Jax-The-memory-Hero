import { useRef, Suspense, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import {
  findLimbs, captureBaseRotations, hasAnyLimb, createAnimState,
  animateIdle, animateWalk, animatePunch, animateKick, animateSpecial,
  animateUltimate, animateHitReaction, resetAttackPhase,
  type LimbRefs, type LimbBaseRotations, type AnimState,
} from "../../../lib/animationUtils";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

const COOLDOWN_MAP: Record<string, number> = {
  punch: 0.3,
  kick: 0.35,
  special: 0.6,
  ultimate: 1.0,
};

function CharacterInner({ fighterId, accentColor }: Props) {
  const config = CHARACTER_MODELS[fighterId];
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const animRef = useRef<AnimState>(createAnimState());
  const initialized = useRef(false);
  const prevHealth = useRef(-1);
  const yOffset = useRef(0);
  const wasAttacking = useRef(false);

  const modelPath = config?.path || "/models/blazing-fox-vanguard.glb";
  const modelScale = config?.scale || 2.5;

  const { scene, animations } = useGLTF(modelPath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !innerRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const { player } = useAdventure.getState();
    const anim = animRef.current;

    if (!initialized.current && innerRef.current) {
      initialized.current = true;

      const bbox = new THREE.Box3().setFromObject(innerRef.current);
      const minY = bbox.min.y;
      if (minY < -0.05) {
        yOffset.current = -minY;
      }

      limbsRef.current = findLimbs(clonedScene);
      basesRef.current = captureBaseRotations(limbsRef.current);

      const hasProceduralLimbs = hasAnyLimb(limbsRef.current);
      if (animations.length > 0 && !hasProceduralLimbs) {
        const mixer = new THREE.AnimationMixer(clonedScene);
        mixerRef.current = mixer;
        const action = mixer.clipAction(animations[0]);
        action.play();
      }
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (prevHealth.current >= 0 && player.health < prevHealth.current) {
      anim.hitFlash = 1;
    }
    prevHealth.current = player.health;

    groupRef.current.position.set(player.posX, player.posY + yOffset.current, player.posZ);
    groupRef.current.rotation.y = player.rotY;

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const hasL = hasAnyLimb(limbs);

    if (player.isAttacking) {
      if (!wasAttacking.current) {
        anim.attackPhase = 0;
        anim.comboStep = (anim.comboStep + 1) % 8;
      }
      wasAttacking.current = true;
      const attackType = player.attackType || "light1";

      if (attackType === "light1" || attackType === "light2" || attackType === "light3" || attackType === "punch") {
        animatePunch(innerRef.current, hasL ? limbs : null, bases, anim, delta, t);
      } else if (attackType === "heavy" || attackType === "kick") {
        animateKick(innerRef.current, hasL ? limbs : null, bases, anim, delta);
      } else if (attackType === "skill" || attackType === "special") {
        animateSpecial(innerRef.current, hasL ? limbs : null, bases, anim, delta);
      } else if (attackType === "ultimate") {
        animateUltimate(innerRef.current, hasL ? limbs : null, bases, anim, delta);
      }
    } else {
      wasAttacking.current = false;
      resetAttackPhase(anim, innerRef.current, delta);

      if (player.isMoving) {
        animateWalk(innerRef.current, hasL ? limbs : null, bases, anim, delta, player.isRunning);
      } else {
        anim.walkCycle = 0;
        animateIdle(innerRef.current, hasL ? limbs : null, bases, t, delta);
      }
    }

    animateHitReaction(innerRef.current, anim, delta, t);
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={modelScale}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight
        position={[0, 2, 0.5]}
        color={accentColor}
        intensity={0.4}
        distance={4}
        decay={2}
      />
    </group>
  );
}

export default function AdventureCharacter(props: Props) {
  return (
    <Suspense fallback={null}>
      <CharacterInner {...props} />
    </Suspense>
  );
}
