/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import * as THREE from 'three';
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
  // Prefer a lightweight battle model for smooth load + framerate, then the
  // registry (single source of truth), then a guaranteed-existing fallback.
  const light = LIGHT_BATTLE_MODELS[beastId];
  if (light) return light;
  const registered = MODEL_REGISTRY[beastId]?.path;
  if (registered) return registered;
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
  const cloneRef = useRef<THREE.Group>(null!);
  const modelPath = getBeastModelPath(beast.id);
  const [loadError, setLoadError] = useState(false);

  // Target on-screen character height in world units (matches the arena scale).
  const TARGET_HEIGHT = 2.2;
  
  // Load GLB model
  const { scene, animations } = useGLTF(modelPath, undefined, undefined, (err) => {
    console.warn(`Failed to load model: ${modelPath}`, err);
    setLoadError(true);
  });
  
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Normalize the model to a consistent height and stand it on the ground.
  // Meshy exports have wildly different native scales, so a fixed scale left
  // characters oversized/off-camera. This mirrors GLBCharacterModel's sizing.
  useEffect(() => {
    const node = cloneRef.current;
    if (!node) return;
    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.visible = true;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        m.visible = true;
        (m as THREE.Material).opacity = 1;
        (m as THREE.Material).transparent = false;
        m.needsUpdate = true;
      });
    });
    node.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(node);
    const height = bbox.max.y - bbox.min.y;
    if (height > 0.001 && Number.isFinite(height)) {
      const s = THREE.MathUtils.clamp(TARGET_HEIGHT / height, 0.01, 100);
      node.scale.setScalar(s);
      node.position.y = -bbox.min.y * s; // feet at y=0
    }
  }, [scene]);

  // Handle animations
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    
    const actionName = isAttacking ? 'attack' : isMoving ? 'run' : 'idle';
    const available = Object.keys(actions);
    
    // Flexible matching: case-insensitive and partial
    const match = available.find(n => n.toLowerCase() === actionName) ||
                  available.find(n => n.toLowerCase().includes(actionName)) ||
                  available[0];
    
    if (match && actions[match]) {
      // Stop all other actions first for a clean transition
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      actions[match].reset().fadeIn(0.2).play();
    }
  }, [actions, isAttacking, isMoving]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (!groupRef.current) return;
    
    if (hitAnim > 0) {
      const shake = Math.sin(state.clock.elapsedTime * 25) * 0.08 * hitAnim;
      groupRef.current.position.x = shake;
    }
    
    // Emotion intensity adds a subtle breathing pulse around 1.0 (the clone is
    // already normalized to the right size — never re-multiply by `scale`).
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
    // Models are authored facing +Z (toward the camera). Rotate them to face
    // along +X so they face their opponent instead of crab-walking sideways.
    // BattlePlayer/Opponent mirror this for left/right facing.
    <group ref={groupRef} rotation={[0, Math.PI / 2, 0]}>
      <Clone
        ref={cloneRef}
        object={scene}
        castShadow
        receiveShadow
        inject={<primitive object={new THREE.Group()} ref={bodyRef} />}
      />
    </group>
  );
}

// Preload common models
// Preload the real registered models for the primary fighters (correct paths).
useGLTF.preload(getBeastModelPath('kai-jax'));
useGLTF.preload(getBeastModelPath('jaxon'));
useGLTF.preload(getBeastModelPath('kaison'));
