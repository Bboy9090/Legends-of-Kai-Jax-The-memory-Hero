/**
 * GLB Character Loader
 * Loads real character GLB assets, validates anchors, falls back to box on failure.
 *
 * Required anchor hierarchy (per problem statement):
 *   root, spine, head, tail_01 .. tail_09
 * Missing tails are tolerated (logged) — only `root` is hard-required.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CharacterRig {
  /** Group placed in scene (use this as fighter root for combat math) */
  group: THREE.Group;
  /** Root bone or pivot */
  root: THREE.Object3D | null;
  spine: THREE.Object3D | null;
  head: THREE.Object3D | null;
  /** tail_01 .. tail_09 (sparse — index 0 is tail_01) */
  tails: Array<THREE.Object3D | null>;
  /** Approximate world height (for hurtbox sizing) */
  height: number;
  /** True if real GLB loaded successfully; false if fallback box */
  loaded: boolean;
  /** Source URL if loaded */
  source?: string;
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

function buildBoxFallback(color: number, height: number = 1.8): CharacterRig {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(0.8, height, 0.5);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  group.add(mesh);
  return { group, root: mesh, spine: null, head: null, tails: [], height, loaded: false };
}

export async function loadCharacterRig(
  url: string,
  options: { color?: number; targetHeight?: number; debug?: boolean } = {}
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

    // Anchor lookup
    const root = findByName(sceneRoot, 'root') ?? findByContains(sceneRoot, 'hips') ?? sceneRoot;
    const spine = findByName(sceneRoot, 'spine') ?? findByContains(sceneRoot, 'spine');
    const head = findByName(sceneRoot, 'head') ?? findByContains(sceneRoot, 'head');
    const tails: Array<THREE.Object3D | null> = [];
    for (let i = 1; i <= 9; i++) {
      const id = `tail_${i.toString().padStart(2, '0')}`;
      tails.push(findByName(sceneRoot, id));
    }

    const missingTails = tails.filter((t) => !t).length;
    if (options.debug) {
      console.log(`[GLBLoader] Loaded ${url}`);
      console.log(`  root: ${root?.name || '(scene)'} | spine: ${spine?.name || 'MISSING'} | head: ${head?.name || 'MISSING'}`);
      console.log(`  tails present: ${9 - missingTails}/9`);
    }
    if (missingTails > 0) {
      console.warn(`[GLBLoader] ${url}: ${missingTails}/9 tail anchors missing (tail_01..tail_09). Tail attachment will be limited.`);
    }

    const group = new THREE.Group();
    group.add(sceneRoot);

    return {
      group,
      root,
      spine,
      head,
      tails,
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
