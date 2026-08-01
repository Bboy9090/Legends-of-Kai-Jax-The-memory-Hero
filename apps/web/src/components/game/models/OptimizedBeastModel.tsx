/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
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
  const outerGroupRef = useRef<THREE.Group>(null!);
  const innerGroupRef = useRef<THREE.Group>(null!);
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

    let meshCount = 0;
    const mats: THREE.Material[] = [];

    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      meshCount++;
      mesh.visible = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const matArray = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      matArray.forEach((m) => {
        if (!m) return;
        mats.push(m);
        (m as THREE.Material).opacity = 1;
        (m as THREE.Material).transparent = false;
        (m as THREE.Material).depthWrite = true;
        (m as THREE.Material).depthTest = true;
        (m as THREE.Material).side = THREE.DoubleSide;
        m.needsUpdate = true;
      });
    });

    console.log('[OptimizedBeastModel] Mesh visibility update:', {
      beastId: beast.id,
      meshesFound: meshCount,
      materialsUpdated: mats.length,
    });

    node.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(node);
    const height = bbox.max.y - bbox.min.y;

    console.log('[OptimizedBeastModel] Bounding box:', {
      beastId: beast.id,
      height,
      min: bbox.min,
      max: bbox.max,
      isFinite: Number.isFinite(height),
    });

    if (height > 0.001 && Number.isFinite(height)) {
      const s = THREE.MathUtils.clamp(TARGET_HEIGHT / height, 0.01, 100);
      node.scale.setScalar(s);
      node.position.y = -bbox.min.y * s; // feet at y=0

      console.log('[OptimizedBeastModel] Scaling applied:', {
        beastId: beast.id,
        scale: s,
        positionY: node.position.y,
      });
    } else {
      console.warn('[OptimizedBeastModel] Invalid height, skipping scale:', {
        beastId: beast.id,
        height,
      });
    }
  }, [scene, beast.id, cloned]);

  // Handle animations
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.log('[OptimizedBeastModel] No animations available:', {
        beastId: beast.id,
        actionsCount: actions ? Object.keys(actions).length : 0,
      });
      return;
    }

    const actionName = isAttacking ? 'attack' : isMoving ? 'run' : 'idle';
    const available = Object.keys(actions);

    // Flexible matching: case-insensitive and partial
    const match = available.find(n => n.toLowerCase() === actionName) ||
                  available.find(n => n.toLowerCase().includes(actionName)) ||
                  available[0];

    console.log('[OptimizedBeastModel] Animation setup:', {
      beastId: beast.id,
      requestedAction: actionName,
      availableActions: available,
      selectedAction: match,
    });

    if (match && actions[match]) {
      // Stop all other actions first for a clean transition
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      actions[match].reset().fadeIn(0.2).play();
    }
  }, [actions, isAttacking, isMoving, beast.id]);

  // A/B EXPERIMENT: Forensic logging for Clone vs primitive attachment
  useEffect(() => {
    if (!groupRef.current || !cloned) return;

    const captureState = () => {
      const group = groupRef.current!;
      let skinnedMeshCount = 0;
      let meshCount = 0;
      let materialCount = 0;
      let boneCount = 0;
      const skeletonUUIDs: string[] = [];

      cloned.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          meshCount++;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materialCount += mats.length;
        }
        const skinned = obj as THREE.SkinnedMesh;
        if (skinned.isSkinnedMesh) {
          skinnedMeshCount++;
          if (skinned.skeleton && !skeletonUUIDs.includes(skinned.skeleton.uuid)) {
            skeletonUUIDs.push(skinned.skeleton.uuid);
            boneCount = Math.max(boneCount, skinned.skeleton.bones.length);
          }
        }
      });

      const bbox = new THREE.Box3().setFromObject(cloned);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());

      console.log('[OptimizedBeastModel] A/B EXPERIMENT - Forensic State:', {
        beastId: beast.id,
        attachment: 'Clone component',
        groupRefExists: !!group,
        groupParent: group.parent?.type || 'none',
        clonedUUID: cloned.uuid,
        clonedChildCount: cloned.children.length,
        meshCount,
        skinnedMeshCount,
        materialCount,
        skeletonCount: skeletonUUIDs.length,
        skeletonUUIDs,
        boneCount,
        worldScale: { x: group.scale.x, y: group.scale.y, z: group.scale.z },
        worldPosition: { x: group.position.x, y: group.position.y, z: group.position.z },
        bbox: { min: bbox.min, max: bbox.max, size },
        boxCenter: center,
        fallbackActive: loadError,
        visibleFlag: group.visible,
      });
    };

    // Capture state after a small delay to ensure Three.js updates
    const timer = setTimeout(captureState, 100);
    return () => clearTimeout(timer);
  }, [cloned, beast.id, loadError]);

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
    <group ref={outerGroupRef}>
      {/* Inner group with scale and material setup. Models are authored facing +Z;
          rotate to face +X so they face opponents. BattlePlayer/Opponent mirror for left/right. */}
      <group ref={innerGroupRef} rotation={[0, Math.PI / 2, 0]}>
        <group ref={groupRef}>
          <Clone object={cloned} castShadow receiveShadow />
        </group>
      </group>
    </group>
  );
}

// Preload common models
// Preload the real registered models for the primary fighters (correct paths).
useGLTF.preload(getBeastModelPath('kai-jax'));
useGLTF.preload(getBeastModelPath('jaxon'));
useGLTF.preload(getBeastModelPath('kaison'));
