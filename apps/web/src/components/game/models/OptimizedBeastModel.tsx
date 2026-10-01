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
  scale = 2.5,
}: OptimizedBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const proceduralStateRef = useRef(createAnimState());
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const modelPath = getBeastModelPath(beast.id);

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
    console.warn(`Failed to load model: ${modelPath}`, err);
    setLoadError(true);
  });

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
  const { actions, mixer } = useAnimations(animations, cloned);

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
      targetAction = 'walk';
    }

    const available = Object.keys(actions);

    // Enhanced animation matching: prioritize walk over run for moving state
    let match: string | undefined;
    if (targetAction === 'walk') {
      // Look for walk-specific animation first, fall back to run
      match = available.find(n => {
        const lower = n.toLowerCase();
        return lower.includes('walk') || lower === 'walk';
      }) ||
      available.find(n => n.toLowerCase().includes('run')) ||
      available.find(n => n.toLowerCase() === 'run') ||
      available[0];
    } else {
      // For attack/idle, use standard matching
      match = available.find(n => n.toLowerCase() === targetAction) ||
              available.find(n => n.toLowerCase().includes(targetAction)) ||
              available[0];
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
  }, [actions, isAttacking, isMoving, beast.id]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (!groupRef.current) return;

    // Baked clips are preferred, but many roster GLBs do not carry a complete
    // idle/walk/attack set. Drive their real bones procedurally so locomotion
    // and combat still articulate arms, legs, hips and spine.
    const available = actions ? Object.keys(actions) : [];
    const hasStateClip = isAttacking
      ? available.some(n => /attack|punch|kick|slash|hit/i.test(n))
      : isMoving
        ? available.some(n => /walk|run|locomotion/i.test(n))
        : available.some(n => /idle|breath|stand/i.test(n));
    if (!hasStateClip && limbsRef.current && basesRef.current) {
      const t = animTime || state.clock.elapsedTime;
      if (isAttacking) {
        animatePunch(cloned, limbsRef.current, basesRef.current, proceduralStateRef.current, delta, t);
      } else if (isMoving) {
        animateWalk(cloned, limbsRef.current, basesRef.current, proceduralStateRef.current, delta, false);
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
