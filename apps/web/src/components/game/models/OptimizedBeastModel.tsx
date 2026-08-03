/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useBattle } from '../../../lib/stores/useBattle';
import { MODEL_REGISTRY } from '../../../assets/modelRegistry';

// Guaranteed-to-exist fallback if a fighter has no registered model.
const FALLBACK_MODEL_PATH = '/models/stylized-beast.glb';

// PERFORMANCE: lightweight battle models (~1.8MB) that replace the very heavy
// 12–25MB registry models during combat. The registry models are gorgeous but
// too large to load/render smoothly, so battles get these lean equivalents.
// Unmapped fighters keep their registry model.
const LIGHT_BATTLE_MODELS: Record<string, string> = {
  'kai-jax': '/models/kai_jax_beast.glb',
  kaijax: '/models/kai_jax_beast.glb',
  kai_jax: '/models/kai_jax_beast.glb',
  kai: '/models/kai_jax_beast.glb',
  silver: '/models/kai_jax_beast.glb',
  jaxon: '/models/jaxon_beast.glb',
  jax: '/models/jaxon_beast.glb',
  velocity: '/models/jaxon_beast.glb',
  kaison: '/models/kaison_beast.glb',
  kaxon: '/models/kaison_beast.glb',
  'voltage-fang': '/models/thunder_lion.glb',
  steelwolf: '/models/frost_wolf.glb',
  'ashen-tiger': '/models/emberwolf_warlord.glb',
  'blazing-fox': '/models/phoenix_warrior.glb',
  sentinel: '/models/sandstone_sentinel.glb',
  apex: '/models/shadow_panther.glb',
  'hyena-scout': '/models/shadow_panther.glb',
  boryn: '/models/boryx_zenith_beast.glb',
  borax: '/models/boryx_zenith_beast.glb',
  malakor: '/models/granite_colossus.glb',
  behemoth: '/models/earth_turtle.glb',
};

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
  // Reverted the light-model swap: the lightweight *_beast.glb models rendered
  // in the headless test env but came up invisible on real devices, so battles
  // showed no fighters. Restore the registry models (visible, if heavier) as the
  // source of truth. LIGHT_BATTLE_MODELS retained below for a future, verified
  // per-device opt-in. Fall back to a guaranteed-existing model if unregistered.
  const registered = MODEL_REGISTRY[beastId]?.path;
  if (registered) return registered;
  return FALLBACK_MODEL_PATH;
}
// Referenced to avoid an unused-symbol warning; not used until re-verified.
void LIGHT_BATTLE_MODELS;

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
  const modelPath = getBeastModelPath(beast.id);
  const [loadError, setLoadError] = useState(false);

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

  // Load GLB model
  const { scene, animations } = useGLTF(modelPath, undefined, undefined, (err) => {
    console.error('[OptimizedBeastModel] Load failed:', {
      modelPath,
      error: err?.message || String(err),
    });
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
      actions[match].reset().fadeIn(0.3).play();
    }
  }, [actions, isAttacking, isMoving, beast.id]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (!groupRef.current) return;
    
    // Emotion intensity adds a subtle breathing pulse around 1.0
    if (emotionIntensity > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.03 * emotionIntensity;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  if (loadError) {
    return (
      <group ref={groupRef as any}>
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[0.6, 1.6, 0.6]} />
          <meshStandardMaterial color={beast.color || "#4488ff"} />
        </mesh>
      </group>
    );
  }

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
