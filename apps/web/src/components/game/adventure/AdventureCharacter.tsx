import { useRef, Suspense, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { getModelConfig } from "../../../assets/modelRegistry";
import { CombatState } from "../../../game/combat/stateEnums";
import {
  findLimbs, captureBaseRotations, hasAnyLimb, createAnimState,
  animateIdle, animateWalk, animatePunch, animateKick, animateSpecial,
  animateHitReaction, resetAttackPhase,
  type LimbRefs, type LimbBaseRotations, type AnimState,
} from "../../../lib/animationUtils";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

const ANIM_PATHS = {
  walk: "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
  run: "/models/Meshy_AI_Animation_Running_withSkin9TAILSKAIJAX.glb",
  kick: "/models/Meshy_AI_Animation_Step_in_High_Kick_withSkin9TAILSKAIJAX.glb",
  spinKick: "/models/Meshy_AI_Animation_Lunge_Spin_Kick_withSkin9TAILSKAIJAX.glb",
};

const HAS_CLIP_ANIMS = new Set(["kai-jax"]);

const TARGET_PLAYER_HEIGHT = 3.2;

function ClipAnimatedCharacter({ fighterId, accentColor }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentAnimRef = useRef<string>("idle");
  const yOffset = useRef(0);
  const prevHealth = useRef(-1);
  const hitFlashRef = useRef(0);
  const dodgeSpinRef = useRef(0);
  const computedScale = useRef(1);

  const walkGltf = useGLTF(ANIM_PATHS.walk);
  const runGltf = useGLTF(ANIM_PATHS.run);
  const kickGltf = useGLTF(ANIM_PATHS.kick);
  const spinKickGltf = useGLTF(ANIM_PATHS.spinKick);

  const clonedScene = useMemo(() => SkeletonUtils.clone(walkGltf.scene), [walkGltf.scene]);

  const clips = useMemo(() => ({
    walk: walkGltf.animations[0] || null,
    run: runGltf.animations[0] || null,
    kick: kickGltf.animations[0] || null,
    spinKick: spinKickGltf.animations[0] || null,
  }), [walkGltf, runGltf, kickGltf, spinKickGltf]);

  const hasClips = !!(clips.walk || clips.run || clips.kick || clips.spinKick);

  useEffect(() => {
    if (!clonedScene || !hasClips) return;

    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current.uncacheRoot(clonedScene);
    }

    const bbox = new THREE.Box3().setFromObject(clonedScene);
    const modelHeight = bbox.max.y - bbox.min.y;
    if (modelHeight > 0.01) {
      computedScale.current = TARGET_PLAYER_HEIGHT / modelHeight;
    }
    if (bbox.min.y < -0.05) {
      yOffset.current = -bbox.min.y * computedScale.current;
    }

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    const actions: Record<string, THREE.AnimationAction> = {};

    if (clips.walk) {
      const idleClip = clips.walk.clone();
      idleClip.name = "idle_clip";
      const idleAction = mixer.clipAction(idleClip);
      idleAction.timeScale = 0.3;
      idleAction.play();
      actions["idle"] = idleAction;

      const walkAction = mixer.clipAction(clips.walk);
      walkAction.timeScale = 1.0;
      walkAction.setEffectiveWeight(0);
      walkAction.play();
      actions["walk"] = walkAction;
    }

    if (clips.run) {
      const runAction = mixer.clipAction(clips.run);
      runAction.timeScale = 1.2;
      runAction.setEffectiveWeight(0);
      runAction.play();
      actions["run"] = runAction;
    }

    if (clips.kick) {
      const lightAction = mixer.clipAction(clips.kick);
      lightAction.setLoop(THREE.LoopOnce, 1);
      lightAction.clampWhenFinished = false;
      lightAction.timeScale = 1.8;
      lightAction.setEffectiveWeight(0);
      lightAction.play();
      actions["light"] = lightAction;

      const skillClip = clips.kick.clone();
      skillClip.name = "skill_clip";
      const skillAction = mixer.clipAction(skillClip);
      skillAction.setLoop(THREE.LoopOnce, 1);
      skillAction.clampWhenFinished = false;
      skillAction.timeScale = 2.2;
      skillAction.setEffectiveWeight(0);
      skillAction.play();
      actions["skill"] = skillAction;
    }

    if (clips.spinKick) {
      const heavyAction = mixer.clipAction(clips.spinKick);
      heavyAction.setLoop(THREE.LoopOnce, 1);
      heavyAction.clampWhenFinished = false;
      heavyAction.timeScale = 1.5;
      heavyAction.setEffectiveWeight(0);
      heavyAction.play();
      actions["heavy"] = heavyAction;
    }

    mixer.addEventListener("finished", (e: any) => {
      const finishedAction = e.action as THREE.AnimationAction;
      const attackActions = [actions["light"], actions["heavy"], actions["skill"]];
      if (attackActions.includes(finishedAction)) {
        const idleAction = actions["idle"];
        if (idleAction) {
          finishedAction.setEffectiveWeight(0);
          idleAction.setEffectiveWeight(1);
          idleAction.play();
          currentAnimRef.current = "idle";
        }
      }
    });

    actionsRef.current = actions;
    currentAnimRef.current = "idle";

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [clonedScene, hasClips, clips]);

  const crossFadeTo = (name: string, duration: number = 0.15) => {
    const actions = actionsRef.current;
    const current = currentAnimRef.current;
    if (current === name) return;
    if (!actions[name]) return;

    const fromAction = actions[current];
    const toAction = actions[name];

    if (name === "light" || name === "heavy" || name === "skill") {
      toAction.reset();
    }
    toAction.setEffectiveWeight(1);
    toAction.play();
    if (fromAction) {
      fromAction.crossFadeTo(toAction, duration, false);
    }
    currentAnimRef.current = name;
  };

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !innerRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const { player } = useAdventure.getState();

    if (prevHealth.current >= 0 && player.health < prevHealth.current) {
      hitFlashRef.current = 1;
    }
    prevHealth.current = player.health;

    groupRef.current.position.set(player.posX, player.posY + yOffset.current, player.posZ);
    groupRef.current.rotation.y = player.rotY;

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (player.isAttacking) {
      const at = player.attackType || "light1";
      if (at === "heavy") {
        crossFadeTo("heavy", 0.08);
      } else if (at === "skill") {
        crossFadeTo("skill", 0.08);
      } else {
        crossFadeTo("light", 0.08);
      }
      dodgeSpinRef.current = 0;
      innerRef.current.rotation.y = 0;
    } else if (player.combatState === CombatState.DODGING) {
      dodgeSpinRef.current += delta * 20;
      innerRef.current.rotation.y = dodgeSpinRef.current;
      crossFadeTo("run", 0.1);
    } else if (player.isMoving) {
      dodgeSpinRef.current = 0;
      innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, 0, delta * 8);
      if (player.isRunning) {
        crossFadeTo("run", 0.2);
      } else {
        crossFadeTo("walk", 0.2);
      }
    } else {
      dodgeSpinRef.current = 0;
      innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, 0, delta * 8);
      crossFadeTo("idle", 0.25);
    }

    if (hitFlashRef.current > 0) {
      hitFlashRef.current = Math.max(0, hitFlashRef.current - delta * 6);
      innerRef.current.visible = Math.sin(t * 40) > 0;
    } else if (player.invulnTimer > 0) {
      innerRef.current.visible = Math.sin(t * 30) > 0;
    } else {
      innerRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={computedScale.current}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight position={[0, 2, 0.5]} color={accentColor} intensity={0.4} distance={4} decay={2} />
    </group>
  );
}

function ProceduralCharacter({ fighterId, accentColor }: Props) {
  const config = getModelConfig(fighterId);
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const animRef = useRef<AnimState>(createAnimState());
  const initialized = useRef(false);
  const yOffset = useRef(0);
  const prevHealth = useRef(-1);
  const wasAttacking = useRef(false);
  const normalizedScale = useRef(config?.scale || 2.5);

  const modelPath = config?.path || "/models/blazing-fox-vanguard.glb";

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
      const modelHeight = bbox.max.y - bbox.min.y;
      if (modelHeight > 0.01) {
        normalizedScale.current = TARGET_PLAYER_HEIGHT / modelHeight;
      }
      if (bbox.min.y < -0.05) yOffset.current = -bbox.min.y * normalizedScale.current;

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

    if (mixerRef.current) mixerRef.current.update(delta);

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
      <group ref={innerRef} scale={normalizedScale.current}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight position={[0, 2, 0.5]} color={accentColor} intensity={0.4} distance={4} decay={2} />
    </group>
  );
}

export default function AdventureCharacter(props: Props) {
  const useClips = HAS_CLIP_ANIMS.has(props.fighterId);
  return (
    <Suspense fallback={null}>
      {useClips ? (
        <ClipAnimatedCharacter {...props} />
      ) : (
        <ProceduralCharacter {...props} />
      )}
    </Suspense>
  );
}

try {
  useGLTF.preload(ANIM_PATHS.walk);
  useGLTF.preload(ANIM_PATHS.run);
  useGLTF.preload(ANIM_PATHS.kick);
  useGLTF.preload(ANIM_PATHS.spinKick);
} catch (_e) {}
