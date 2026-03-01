/**
 * Sovereignty Animation — Clip-Based Character Model
 * Replaces procedural. One GLB, string clip IDs, strict crossfade durations.
 */

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  resolveBaseClip,
  createActions,
  crossfadeTo,
  getExpectedClipIds,
  getLoopMode,
  shouldClampWhenFinished,
  resolveAdditiveMode,
} from "../../../lib/sovereigntyAnimationController";
import { findClipByName, copyUpperBodyBones } from "../../../lib/animationManifest";
import type { GLBModelConfig } from "./GLBCharacterModel";

const TARGET_HEIGHT = 4.5;

export interface SovereigntyInput {
  isMoving: boolean;
  speed: number;
  isAttacking: boolean;
  attackType: "punch" | "kick" | "special" | "ultimate" | null;
  comboStep: number;
  isGrounded: boolean;
  isJumping: boolean;
  isInvulnerable: boolean;
  isHitHeavy: boolean;
  isBlocking?: boolean;
  isBurstStepping?: boolean;
  isErasureActive?: boolean;
}

interface Props {
  config: GLBModelConfig;
  input: SovereigntyInput;
  accentColor: string;
  emotionIntensity: number;
  animTime?: number;
}

/** Check if this GLB has sovereignty clips (at least idle). */
export function hasSovereigntyClips(animations: THREE.AnimationClip[]): boolean {
  return findClipByName(animations, "idle") !== null;
}

export default function SovereigntyModelInner({
  config,
  input,
  accentColor,
  emotionIntensity,
  animTime = 0,
}: Props) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const cloneRef = useRef<THREE.Group>(null);
  const overlayRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const overlayMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const overlayActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentClipRef = useRef<string | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const additiveModeRef = useRef<{ overlay: string; base: string } | null>(null);
  const overlayActionRef = useRef<THREE.AnimationAction | null>(null);
  const setupDoneRef = useRef(false);
  const normalizedScaleRef = useRef(config.scale);
  const landSquashRef = useRef(0);
  const wasGroundedRef = useRef(true);

  const { scene, animations } = useGLTF(config.path);
  const overlayScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    if (!cloneRef.current || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(cloneRef.current);
    mixerRef.current = mixer;

    const overlayMixer = new THREE.AnimationMixer(overlayScene);
    overlayMixerRef.current = overlayMixer;
    overlayRef.current = overlayScene;

    const clipIds = getExpectedClipIds().filter(
      (id) => findClipByName(animations, id) !== null
    );
    const actions = createActions(mixer, animations, clipIds, findClipByName);
    actionsRef.current = actions;

    const overlayActions = createActions(overlayMixer, animations, clipIds, findClipByName);
    overlayActionsRef.current = overlayActions;

    const idleClip = findClipByName(animations, "idle");
    if (idleClip) {
      const idleAction = mixer.clipAction(idleClip);
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
      idleAction.setEffectiveWeight(1);
      idleAction.play();
      currentClipRef.current = "idle";
      currentActionRef.current = idleAction;
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(cloneRef.current!);
      overlayMixer.stopAllAction();
      overlayMixer.uncacheRoot(overlayScene);
      mixerRef.current = null;
      overlayMixerRef.current = null;
      overlayRef.current = null;
      actionsRef.current = new Map();
      overlayActionsRef.current = new Map();
    };
  }, [config.path, animations, overlayScene]);

  useFrame((state, delta) => {
    if (!innerRef.current || !cloneRef.current || !mixerRef.current) return;

    if (!setupDoneRef.current) {
      setupDoneRef.current = true;
      const bbox = new THREE.Box3().setFromObject(cloneRef.current);
      const modelHeight = bbox.max.y - bbox.min.y;
      if (modelHeight > 0.01) {
        normalizedScaleRef.current = (TARGET_HEIGHT / modelHeight) * config.scale;
      }
      if (bbox.min.y < -0.05 && outerRef.current) {
        outerRef.current.position.y = -bbox.min.y * (normalizedScaleRef.current / config.scale);
      }
    }

    const t = animTime || state.clock.elapsedTime;
    const targetClip = resolveBaseClip(input);
    const additive = resolveAdditiveMode(targetClip, currentClipRef.current, input);

    if (additive && !additiveModeRef.current) {
      const { overlay, base } = additive;
      const baseAction = actionsRef.current.get(base);
      const overlayAction = overlayActionsRef.current.get(overlay);
      if (baseAction && overlayAction) {
        additiveModeRef.current = additive;
        mixerRef.current!.stopAllAction();
        baseAction.setEffectiveWeight(1);
        baseAction.play();
        currentClipRef.current = base;
        currentActionRef.current = baseAction;

        overlayMixerRef.current!.stopAllAction();
        overlayAction.clampWhenFinished = true;
        overlayAction.setLoop(THREE.LoopOnce, 1);
        overlayAction.setEffectiveWeight(1);
        overlayAction.reset();
        overlayAction.play();
        overlayActionRef.current = overlayAction;
      }
    } else if (!additive && additiveModeRef.current) {
      additiveModeRef.current = null;
      overlayActionRef.current = null;
      overlayMixerRef.current?.stopAllAction();
    }

    if (targetClip !== currentClipRef.current && !additiveModeRef.current) {
      const targetAction = actionsRef.current.get(targetClip);
      if (targetAction) {
        crossfadeTo(
          mixerRef.current!,
          currentActionRef.current,
          currentClipRef.current,
          targetAction,
          targetClip
        );
        currentClipRef.current = targetClip;
        currentActionRef.current = targetAction;

        const clip = findClipByName(animations, targetClip);
        if (clip) {
          targetAction.setLoop(getLoopMode(targetClip), getLoopMode(targetClip) === THREE.LoopRepeat ? Infinity : 1);
          targetAction.clampWhenFinished = shouldClampWhenFinished(targetClip);
        }
      }
    }

    const clipId = currentClipRef.current;
    const combatClipIds = [
      "atk_light_1", "atk_light_2", "atk_heavy_finisher",
      "web_launch", "hit_light", "hit_heavy", "burst_step",
    ];
    const isCombatClip = clipId && combatClipIds.includes(clipId);

    if (additiveModeRef.current && overlayActionRef.current) {
      const overlayClip = findClipByName(animations, additiveModeRef.current.overlay);
      if (overlayClip && overlayActionRef.current.time >= overlayClip.duration - 0.001) {
        additiveModeRef.current = null;
        overlayActionRef.current = null;
        overlayMixerRef.current?.stopAllAction();
        const idleAction = actionsRef.current.get("idle");
        if (idleAction) {
          crossfadeTo(
            mixerRef.current!,
            currentActionRef.current,
            currentClipRef.current,
            idleAction,
            "idle"
          );
          currentClipRef.current = "idle";
          currentActionRef.current = idleAction;
        }
      }
    } else if (isCombatClip && currentActionRef.current && !additiveModeRef.current) {
      const clip = findClipByName(animations, clipId!);
      if (clip) {
        const dur = clip.duration;
        if (currentActionRef.current.time >= dur - 0.001) {
          const idleAction = actionsRef.current.get("idle");
          if (idleAction) {
            crossfadeTo(
              mixerRef.current!,
              currentActionRef.current,
              currentClipRef.current,
              idleAction,
              "idle"
            );
            currentClipRef.current = "idle";
            currentActionRef.current = idleAction;
          }
        }
      }
    }

    mixerRef.current!.update(delta);
    if (overlayMixerRef.current) {
      overlayMixerRef.current.update(delta);
      if (additiveModeRef.current && cloneRef.current && overlayRef.current) {
        copyUpperBodyBones(cloneRef.current, overlayRef.current);
      }
    }

    if (wasGroundedRef.current && !input.isGrounded) {
      landSquashRef.current = 1;
    }
    wasGroundedRef.current = input.isGrounded;
    landSquashRef.current = THREE.MathUtils.lerp(landSquashRef.current, 0, delta * 8);

    const sc = normalizedScaleRef.current;
    const squashY = 1 - landSquashRef.current * 0.2;
    const squashXZ = 1 + landSquashRef.current * 0.1;
    innerRef.current.scale.set(sc * squashXZ, sc * squashY, sc * squashXZ);

    if (input.isInvulnerable) {
      innerRef.current.visible = Math.sin(t * 30) > 0;
    } else {
      innerRef.current.visible = true;
    }

    if (!input.isGrounded) {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(
        innerRef.current.rotation.x,
        input.isJumping ? -0.15 : 0.1,
        delta * 6
      );
    } else {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, 0, delta * 6);
    }
  });

  return (
    <group ref={outerRef}>
      <group
        ref={innerRef}
        position={config.position}
        rotation={config.rotation ? [config.rotation[0], config.rotation[1], config.rotation[2]] : undefined}
        scale={normalizedScaleRef.current}
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
