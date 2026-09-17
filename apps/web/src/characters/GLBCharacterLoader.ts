/**
 * GLB Character Loader
 * Loads real character GLB assets, validates anchors, falls back to box on failure.
 *
 * Production asset contract:
 *   root, spine, head, tail_01 .. tail_09
 *
 * Runtime may optionally synthesize semantic tail attachment sockets for a rig
 * whose source GLB lacks tail joints. Those sockets are gameplay attachment
 * transforms only: they do NOT claim to be deformation bones and do not satisfy
 * strict production-rig certification.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type TailSocketMode = 'native' | 'mixed' | 'semantic' | 'none';

export interface CharacterRig {
  /** Group placed in scene (use this as fighter root for combat math) */
  group: THREE.Group;
  /** Root bone or pivot */
  root: THREE.Object3D | null;
  spine: THREE.Object3D | null;
  head: THREE.Object3D | null;
  /**
   * Gameplay tail attachment transforms, index 0 = tail_01.
   * Entries may be native GLB nodes or explicit semantic runtime sockets.
   */
  tails: Array<THREE.Object3D | null>;
  /** How the tail attachment transforms were sourced. */
  tailSocketMode: TailSocketMode;
  /** Number of literal tail_01..tail_09 nodes found in the source GLB. */
  nativeTailCount: number;
  /** Number of missing tail sockets synthesized at runtime. */
  semanticTailCount: number;
  /** Approximate world height (for hurtbox sizing) */
  height: number;
  /** True if real GLB loaded successfully; false if fallback box */
  loaded: boolean;
  /** Source URL if loaded */
  source?: string;
}

export interface LoadCharacterRigOptions {
  color?: number;
  targetHeight?: number;
  debug?: boolean;
  /**
   * Fill missing tail_01..tail_09 attachment transforms with deterministic
   * sockets parented to the animated body root. This improves gameplay socket
   * behavior without pretending the asset has real tail deformation bones.
   */
  synthesizeTailSockets?: boolean;
}

const loader = new GLTFLoader();

function findByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let hit: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (hit) return;
    if (obj.name === name || obj.name.toLowerCase() === name.toLowerCase()) hit = obj;
  });
  return hit;
}

function findByContains(root: THREE.Object3D, fragment: string): THREE.Object3D | null {
  let hit: THREE.Object3D | null = null;
  const f = fragment.toLowerCase();
  root.traverse((obj) => {
    if (hit) return;
    if (obj.name.toLowerCase().includes(f)) hit = obj;
  });
  return hit;
}

/**
 * Build deterministic gameplay-only tail attachment sockets.
 *
 * The fan is intentionally small and centered around the pelvis/root so move
 * data remains the main authority for attack reach. Because these sockets are
 * children of an animated root/hips bone, they inherit locomotion/animation
 * transforms even when the source asset has no independent tail bones.
 */
export function createSemanticTailSockets(
  parent: THREE.Object3D,
  existing: Array<THREE.Object3D | null> = Array.from({ length: 9 }, () => null)
): { tails: Array<THREE.Object3D | null>; created: number } {
  const tails = Array.from({ length: 9 }, (_, index) => existing[index] ?? null);
  let created = 0;

  for (let index = 0; index < 9; index++) {
    if (tails[index]) continue;

    const centered = index - 4;
    const socket = new THREE.Object3D();
    socket.name = `semantic_tail_${String(index + 1).padStart(2, '0')}`;
    socket.userData.semanticSocket = true;
    socket.userData.canonicalSocket = `tail_${String(index + 1).padStart(2, '0')}`;

    // Compact nine-point fan around the lower torso. HitSpec offsets still
    // control the actual move reach; these only provide animated attachment.
    socket.position.set(centered * 0.045, 0.04 + Math.abs(centered) * 0.008, -0.08);
    parent.add(socket);
    tails[index] = socket;
    created++;
  }

  return { tails, created };
}

function buildBoxFallback(color: number, height: number = 1.8): CharacterRig {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(0.8, height, 0.5);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  group.add(mesh);
  return {
    group,
    root: mesh,
    spine: null,
    head: null,
    tails: [],
    tailSocketMode: 'none',
    nativeTailCount: 0,
    semanticTailCount: 0,
    height,
    loaded: false,
  };
}

export async function loadCharacterRig(
  url: string,
  options: LoadCharacterRigOptions = {}
): Promise<CharacterRig> {
  const targetHeight = options.targetHeight ?? 1.8;
  const fallbackColor = options.color ?? 0x00d9ff;

  try {
    const gltf = await loader.loadAsync(url);
    const sceneRoot = gltf.scene;

    // Compute bounding box → uniform scale to target height
    const bbox = new THREE.Box3().setFromObject(sceneRoot);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    if (size.y > 0.001) {
      const scale = targetHeight / size.y;
      sceneRoot.scale.setScalar(scale);
    }

    // After scale, translate so feet sit at y=0 in the parent group
    sceneRoot.updateMatrixWorld(true);
    const bbox2 = new THREE.Box3().setFromObject(sceneRoot);
    sceneRoot.position.y -= bbox2.min.y;

    // Z-up → Y-up correction (some Meshy exports come Z-up)
    if (size.y < size.z * 0.6 && size.z > size.x) {
      sceneRoot.rotation.x = -Math.PI / 2;
    }

    // Anchor lookup. Runtime root aliases remain accepted for locomotion, but
    // strict asset certification separately verifies the literal source contract.
    const root = findByName(sceneRoot, 'root') ?? findByContains(sceneRoot, 'hips') ?? sceneRoot;
    const spine = findByName(sceneRoot, 'spine') ?? findByContains(sceneRoot, 'spine');
    const head = findByName(sceneRoot, 'head') ?? findByContains(sceneRoot, 'head');
    let tails: Array<THREE.Object3D | null> = [];
    for (let i = 1; i <= 9; i++) {
      const id = `tail_${i.toString().padStart(2, '0')}`;
      tails.push(findByName(sceneRoot, id));
    }

    const nativeTailCount = tails.filter(Boolean).length;
    let semanticTailCount = 0;

    if (options.synthesizeTailSockets && root && nativeTailCount < 9) {
      const semantic = createSemanticTailSockets(root, tails);
      tails = semantic.tails;
      semanticTailCount = semantic.created;
    }

    const tailSocketMode: TailSocketMode =
      nativeTailCount === 9
        ? 'native'
        : nativeTailCount > 0 && semanticTailCount > 0
          ? 'mixed'
          : nativeTailCount === 0 && semanticTailCount === 9
            ? 'semantic'
            : nativeTailCount > 0
              ? 'native'
              : 'none';

    const missingRuntimeTails = tails.filter((tail) => !tail).length;
    if (options.debug) {
      console.log(`[GLBLoader] Loaded ${url}`);
      console.log(`  root: ${root?.name || '(scene)'} | spine: ${spine?.name || 'MISSING'} | head: ${head?.name || 'MISSING'}`);
      console.log(`  source tails: ${nativeTailCount}/9 | semantic sockets: ${semanticTailCount}/9 | mode: ${tailSocketMode}`);
    }

    if (nativeTailCount < 9) {
      const note = semanticTailCount > 0
        ? `runtime filled ${semanticTailCount} gameplay socket(s); source GLB still requires real tail rigging`
        : 'tail attachment will be limited';
      console.warn(`[GLBLoader] ${url}: ${9 - nativeTailCount}/9 native tail anchors missing (tail_01..tail_09); ${note}.`);
    }
    if (missingRuntimeTails > 0) {
      console.warn(`[GLBLoader] ${url}: ${missingRuntimeTails}/9 runtime tail sockets remain unavailable.`);
    }

    const group = new THREE.Group();
    group.add(sceneRoot);

    return {
      group,
      root,
      spine,
      head,
      tails,
      tailSocketMode,
      nativeTailCount,
      semanticTailCount,
      height: targetHeight,
      loaded: true,
      source: url,
    };
  } catch (err) {
    console.warn(`[GLBLoader] Failed to load ${url}, using box fallback:`, err);
    return buildBoxFallback(fallbackColor, targetHeight);
  }
}

/** Maps character ids → committed GLB asset paths (sourced from MODEL_REGISTRY).
 *  This is intentionally a thin alias so the mission/combat scenes use the
 *  exact same paths the React adventure renderer uses. Update modelRegistry.ts
 *  to change paths — never edit this map. */
import { getModelPath } from '../assets/modelRegistry';

export const CHARACTER_GLB: Record<string, string> = {
  get kai() { return (getModelPath('kai') ?? '').replace(/^\//, ''); },
  get jax() { return (getModelPath('jax') ?? '').replace(/^\//, ''); },
  get kaijax() { return (getModelPath('kai-jax') ?? '').replace(/^\//, ''); },
};