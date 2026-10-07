/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useBattle } from '../../../lib/stores/useBattle';
import { MODEL_REGISTRY } from '../../../assets/modelRegistry';
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
  animateHitReaction,
  triggerHit,
  resetAttackPhase,
  type LimbRefs,
  type LimbBaseRotations,
} from '../../../lib/animationUtils';

// Guaranteed-to-exist fallback if a fighter has no registered model.
const FALLBACK_MODEL_PATH = '/models/kai_jax_beast.glb';

// Production combat uses each fighter's canonical registry asset. Performance
// optimization must happen through real per-character LODs, texture/mesh
// compression, and animation optimization — never by silently substituting a
// different fighter's body/rig.

interface OptimizedBeastModelProps {
  beast: any;
  bodyRef?: React.RefObject<THREE.Group>;
  headRef?: React.RefObject<THREE.Group>;
  emotionIntensity?: number;
  hitAnim?: number;
  animTime?: number;
  isAttacking?: boolean;
  isInvulnerable?: boolean;
  isMoving?: boolean;
  isRunning?: boolean;
  attackType?: 'light1' | 'light2' | 'light3' | 'heavy' | 'skill' | 'punch' | 'kick' | 'special' | 'ultimate' | null;
  locomotionState?: 'neutral' | 'dodge' | 'block' | 'parry' | 'hitstun' | 'airborne';
  scale?: number;
}

/**
 * Get GLB model path for beast
 */
function getBeastModelPath(beastId: string): string {
  const registered = MODEL_REGISTRY[beastId]?.path;
  if (registered) return registered;
  console.warn(
    `[OptimizedBeastModel] No canonical model registered for "${beastId}". Using emergency fallback.`
  );
  return FALLBACK_MODEL_PATH;
}

/**
 * OPTIMIZED BEAST MODEL - Real GLB with animations
 */
export default function OptimizedBeastModel({
  beast,
  bodyRef,
  headRef,
  emotionIntensity = 0,
  hitAnim = 0,
  animTime = 0,
  isAttacking = false,
  isInvulnerable = false,
  isMoving = false,
  isRunning = false,
  attackType = null,
  locomotionState = 'neutral',
  scale = 2.5,
}: OptimizedBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const proceduralStateRef = useRef(createAnimState());
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const previousHitAnimRef = useRef(0);
  const previousAttackRef = useRef(false);
  const modelPath = getBeastModelPath(beast.id);
  const animationPaths = MODEL_REGISTRY[beast.id]?.animationPaths;
  const companionPaths = useMemo(() => [animationPaths?.walk, animationPaths?.run, ...(animationPaths?.kick ?? []), ...(animationPaths?.punch ?? [])].filter(Boolean) as string[], [animationPaths]);

  // DIAGNOSTIC: log model path resolution
  useEffect(() => {
    console.log('[OptimizedBeastModel] Trace:', {
      beastId: beast.id,
      resolvedPath: modelPath,
      beastData: { id: beast.id, color: beast.color },
    });
  }, [modelPath, beast.id, beast.color]);

  // Target on-screen character height in world units (matches the arena scale).
  const TARGET_HEIGHT = 2.2;

  // Load GLB model. Note: useGLTF's fourth argument is extendLoader, NOT an
  // onError callback. The previous code mislabeled successful loader setup as
  // a model load failure in release smoke tests.
  const { scene, animations } = useGLTF(modelPath);
  const companionGLTFs = useGLTF(companionPaths) as any[];
  const authoredAnimations = useMemo(() => {
    const clips: THREE.AnimationClip[] = [...animations];
    companionGLTFs.forEach((gltf, index) => {
      const path = companionPaths[index] ?? '';
      (gltf?.animations ?? []).forEach((clip: THREE.AnimationClip) => {
        const semantic = /Running/i.test(path) ? 'Run' : /Walking/i.test(path) ? 'Walk' : /Kick/i.test(path) ? 'Kick' : /Punch|Jab/i.test(path) ? 'Punch' : clip.name;
        const clone = clip.clone();
        clone.name = `${semantic}:${clip.name || index}`;
        clips.push(clone);
      });
    });
    return clips;
  }, [animations, companionGLTFs, companionPaths]);
  // DIAGNOSTIC: log scene load success
  useEffect(() => {
    if (scene) {
      console.log('[OptimizedBeastModel] Scene loaded:', {
        beastId: beast.id,
        childrenCount: scene.children.length,
        animationCount: animations?.length || 0,
      });
    }
  }, [scene, beast.id, animations]);

  // Clone with SkeletonUtils so the skinned mesh keeps its rig — a plain clone
  // (or drei <Clone>) leaves the SkinnedMesh bound to the ORIGINAL bones, so
  // the animation mixer moves bones that drive nothing and the model looks
  // stiff/unrigged (no arm swing). Binding the mixer to this clone fixes it.
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    console.log('[OptimizedBeastModel] Cloned scene:', {
      beastId: beast.id,
      childrenCount: c.children.length,
    });
    // Never zero imported bone rotations here. Meshy/glTF bind transforms are
    // part of the rig and must remain intact for skin deformation.
    c.updateMatrixWorld(true);
    return c;
  }, [scene, beast.id]);
  const { actions } = useAnimations(authoredAnimations, cloned);

  // Normalize the model to a consistent height and stand it on the ground.
  // Meshy exports have wildly different native scales, so a fixed scale left
  // characters oversized/off-camera. This mirrors GLBCharacterModel's sizing.
  useEffect(() => {
    const node = cloned;
    if (!node) return;

    node.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(node);
    const height = bbox.max.y - bbox.min.y;

    if (height > 0.001 && Number.isFinite(height)) {
      const s = THREE.MathUtils.clamp(TARGET_HEIGHT / height, 0.01, 100);
      node.scale.setScalar(s);
      node.position.y = -bbox.min.y * s; // feet at y=0
    }
  }, [scene, beast.id, cloned]);

  // Discover the actual cloned skeleton once. This gives models without a
  // useful baked clip a real articulated fallback instead of statue sliding.
  useEffect(() => {
    const limbs = findLimbs(cloned);
    limbsRef.current = limbs;
    basesRef.current = captureBaseRotations(limbs);
  }, [cloned, beast.id]);

  // Handle animations
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    // Determine desired animation based on state
    let targetAction = 'idle';
    if (isAttacking) {
      targetAction = 'attack';
    } else if (isMoving) {
      // Prefer 'walk' over 'run' for natural arm movement
      targetAction = isRunning ? 'run' : 'walk';
    }

    const available = Object.keys(actions);

    // Only play a baked clip when it semantically matches the requested
    // state. Never use available[0]: a random idle/root-motion clip would hide
    // the articulated procedural fallback and recreate the skating-statue bug.
    let match: string | undefined;
    if (targetAction === 'walk') {
      match = available.find(n => /walk|locomotion/i.test(n));
    } else if (targetAction === 'run') {
      match = available.find(n => /run|sprint/i.test(n));
    } else if (targetAction === 'attack') {
      const attackPattern =
        attackType === 'kick' || attackType === 'heavy'
          ? /kick|heavy/i
          : attackType === 'special' || attackType === 'skill'
            ? /special|skill|slash|strike/i
            : attackType === 'ultimate'
              ? /ultimate|super|finisher/i
              : /punch|jab|light|attack/i;
      match =
        available.find(n => attackPattern.test(n)) ||
        available.find(n => /attack|punch|kick|slash|strike|hit/i.test(n));
    } else {
      match = available.find(n => /idle|breath|stand/i.test(n));
    }

    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__KAI_JAX_ANIMATION_PROBE__ ??= {};
      w.__KAI_JAX_ANIMATION_PROBE__[beast.id] = {
        requested: targetAction,
        attackType: isAttacking ? attackType : null,
        selectedClip: match ?? null,
        authored: Boolean(match),
        availableClips: available,
        timestamp: performance.now(),
      };
    }

    if (match && actions[match]) {
      // Stop all other actions with smooth crossfade
      Object.values(actions).forEach(a => {
        if (a && a !== actions[match]) {
          a.fadeOut(0.3);
        }
      });
      // Play selected animation with smooth fade-in
      const next = actions[match];
      if (activeActionRef.current !== next) {
        activeActionRef.current?.fadeOut(0.18);
        next.reset().fadeIn(0.18).play();
        activeActionRef.current = next;
      }
    }
  }, [actions, isAttacking, isMoving, isRunning, attackType, beast.id]);

  // Hit animation and effects
  useFrame((state, delta) => {
    // useAnimations advances its mixer once per frame.
    if (!groupRef.current) return;

    const procedural = proceduralStateRef.current;
    const t = animTime || state.clock.elapsedTime;

    if (hitAnim > 0 && previousHitAnimRef.current <= 0) {
      triggerHit(procedural);
    }
    previousHitAnimRef.current = hitAnim;

    if (previousAttackRef.current && !isAttacking) {
      resetAttackPhase(procedural, cloned, delta);
      procedural.comboStep = (procedural.comboStep + 1) % 4;
    }
    if (!previousAttackRef.current && isAttacking) {
      procedural.attackPhase = 0;
    }
    previousAttackRef.current = isAttacking;

    // Defensive/mobility states must visibly deform the rendered character,
    // not exist only in the combat store.
    if (limbsRef.current && basesRef.current && !isAttacking) {
      const limbs = limbsRef.current;
      const bases = basesRef.current;
      if (locomotionState === 'dodge') {
        cloned.rotation.z = THREE.MathUtils.lerp(cloned.rotation.z, -0.45, Math.min(1, delta * 18));
        if (limbs.spine) limbs.spine.rotation.z = (bases.spine?.z ?? 0) - 0.3;
      } else if (locomotionState === 'block' || locomotionState === 'parry') {
        const guard = locomotionState === 'parry' ? 1.0 : 0.72;
        if (limbs.leftUpperArm) limbs.leftUpperArm.rotation.x = (bases.leftUpperArm?.x ?? 0) - guard;
        if (limbs.rightUpperArm) limbs.rightUpperArm.rotation.x = (bases.rightUpperArm?.x ?? 0) - guard;
        if (limbs.spine) limbs.spine.rotation.x = (bases.spine?.x ?? 0) + 0.16;
      } else if (locomotionState === 'airborne') {
        if (limbs.leftUpperArm) limbs.leftUpperArm.rotation.z = (bases.leftUpperArm?.z ?? 0) + 0.65;
        if (limbs.rightUpperArm) limbs.rightUpperArm.rotation.z = (bases.rightUpperArm?.z ?? 0) - 0.65;
        if (limbs.leftUpperLeg) limbs.leftUpperLeg.rotation.x = (bases.leftUpperLeg?.x ?? 0) - 0.35;
        if (limbs.rightUpperLeg) limbs.rightUpperLeg.rotation.x = (bases.rightUpperLeg?.x ?? 0) - 0.35;
      }
    }

    // Hit reaction has visual priority over ordinary locomotion.
    if (hitAnim > 0 || procedural.hitFlash > 0 || locomotionState === 'hitstun') {
      if (locomotionState === 'hitstun' && procedural.hitFlash <= 0) triggerHit(procedural);
      animateHitReaction(cloned, procedural, delta, t);
    }

    // Baked clips are preferred, but many roster GLBs do not carry a complete
    // idle/walk/attack set. Drive their real bones procedurally so locomotion
    // and combat still articulate arms, legs, hips and spine.
    const available = actions ? Object.keys(actions) : [];
    const hasStateClip = isAttacking
      ? available.some(n => /attack|punch|kick|slash|hit/i.test(n))
      : isMoving
        ? (isRunning ? available.some(n => /run|sprint/i.test(n)) : available.some(n => /walk|locomotion/i.test(n)))
        : available.some(n => /idle|breath|stand/i.test(n));
    if (!hasStateClip && limbsRef.current && basesRef.current) {
      if (isAttacking) {
        if (attackType === 'kick' || attackType === 'heavy') {
          animateKick(cloned, limbsRef.current, basesRef.current, procedural, delta);
        } else if (attackType === 'special' || attackType === 'skill') {
          animateSpecial(cloned, limbsRef.current, basesRef.current, procedural, delta);
        } else if (attackType === 'ultimate') {
          animateUltimate(cloned, limbsRef.current, basesRef.current, procedural, delta);
        } else {
          animatePunch(cloned, limbsRef.current, basesRef.current, procedural, delta, t);
        }
      } else if (isMoving) {
        animateWalk(cloned, limbsRef.current, basesRef.current, procedural, delta, isRunning);
      } else {
        animateIdle(cloned, limbsRef.current, basesRef.current, t, delta);
      }
      cloned.updateMatrixWorld(true);
    }
    
    // Emotion intensity adds a subtle breathing pulse around 1.0
    if (emotionIntensity > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.03 * emotionIntensity;
      groupRef.current.scale.setScalar(pulse);
    }
  });


  return (
    <group ref={groupRef} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

// Preload common models
// Preload the real registered models for the primary fighters (correct paths).
useGLTF.preload(getBeastModelPath('kai-jax'));
useGLTF.preload(getBeastModelPath('jaxon'));
useGLTF.preload(getBeastModelPath('kaison'));
