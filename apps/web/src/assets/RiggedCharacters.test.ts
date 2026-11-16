import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MODEL_REGISTRY } from './modelRegistry';
import { RIGGED_CLIPS } from '../lib/animationClips';

/** Structural checks on the rigged character masters, read straight from the GLB JSON chunk. */
const PUBLIC = path.resolve(process.cwd(), 'public');

function readGlbJson(file: string) {
  const buf = fs.readFileSync(file);
  expect(buf.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
  const jsonLen = buf.readUInt32LE(12);
  expect(buf.readUInt32LE(16)).toBe(0x4e4f534a); // JSON chunk
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
}

const CHARACTERS = {
  kai: { file: 'kai_master.glb', joints: 37 },
  jax: { file: 'jax_master.glb', joints: 32 },
  kaijax: { file: 'kaijax_master.glb', joints: 56 },
  borax: { file: 'borax_master.glb', joints: 29 },
  boryn: { file: 'boryn_master.glb', joints: 29 },
} as const;

type Gltf = ReturnType<typeof readGlbJson>;
const load = (id: keyof typeof CHARACTERS): { json: Gltf; bytes: number } => {
  const file = path.join(PUBLIC, 'models/characters', CHARACTERS[id].file);
  return { json: readGlbJson(file), bytes: fs.statSync(file).size };
};
const jointNames = (g: Gltf): string[] => {
  const set = new Set<number>(g.skins.flatMap((s: { joints: number[] }) => s.joints));
  return [...set].map((i) => g.nodes[i].name as string);
};
const triangles = (g: Gltf) =>
  g.meshes.flatMap((m: any) => m.primitives).reduce((n: number, p: any) => n + (p.indices !== undefined ? g.accessors[p.indices].count / 3 : g.accessors[p.attributes.POSITION].count / 3), 0);

describe('rigged character masters', () => {
  for (const id of Object.keys(CHARACTERS) as Array<keyof typeof CHARACTERS>) {
    describe(id, () => {
      const { json, bytes } = load(id);

      it('is one skinned mesh with the full 19-clip combat set', () => {
        expect(json.skins).toHaveLength(1);
        expect(json.meshes).toHaveLength(1);
        const clips = json.animations.map((a: { name: string }) => a.name).sort();
        expect(clips).toEqual([...RIGGED_CLIPS].sort());
        expect(jointNames(json)).toHaveLength(CHARACTERS[id].joints);
      });

      it('stays within the mobile budget and ships compressed with no external files', () => {
        expect(triangles(json)).toBeLessThan(30_000);
        expect(bytes).toBeLessThan(3 * 1024 * 1024);
        expect(json.extensionsRequired).toEqual(expect.arrayContaining(['EXT_meshopt_compression', 'EXT_texture_webp']));
        expect(JSON.stringify(json)).not.toMatch(/"uri":"(?!data:)/);
      });

      it('keeps its morph targets', () => {
        const targets = json.meshes[0].primitives.reduce((n: number, p: any) => n + (p.targets?.length ?? 0), 0);
        expect(targets).toBe(5);
      });
    });
  }

  it('Kai has four spider limbs (3 joints each) and a jaw and ears', () => {
    const names = jointNames(load('kai').json);
    for (const limb of ['UL', 'UR', 'LL', 'LR']) for (const n of ['01', '02', '03']) expect(names).toContain(`spider_${limb}_${n}`);
    expect(names).toEqual(expect.arrayContaining(['jaw', 'ear_L', 'ear_R']));
  });

  it('Jax has a seven-joint mane', () => {
    const names = jointNames(load('jax').json);
    expect(names.filter((n) => n.startsWith('mane_'))).toHaveLength(7);
    expect(names.some((n) => n.startsWith('spider_'))).toBe(false);
  });

  it('Kai-Jax has exactly three tails: ember, storm and memory (canon three-tail rule)', () => {
    const names = jointNames(load('kaijax').json);
    const tails = names.filter((n) => n.startsWith('tail_'));
    expect(new Set(tails.map((n) => n.split('_')[1]))).toEqual(new Set(['ember', 'storm', 'memory']));
    for (const t of ['ember', 'storm', 'memory']) expect(tails.filter((n) => n.startsWith(`tail_${t}_`))).toHaveLength(4);
    expect(tails).toHaveLength(12);
  });

  it('Kai-Jax combines the Kai limbs and the Jax mane', () => {
    const names = jointNames(load('kaijax').json);
    expect(names.filter((n) => n.startsWith('spider_'))).toHaveLength(12);
    expect(names.filter((n) => n.startsWith('mane_'))).toHaveLength(7);
  });

  it('the model registry points the five heroes at these masters, and the files exist', () => {
    const expected: Record<string, keyof typeof CHARACTERS> = { kai: 'kai', jax: 'jax', 'kai-jax': 'kaijax', kai_jax: 'kaijax', kaijax: 'kaijax', borax: 'borax', boryn: 'boryn' };
    for (const [key, id] of Object.entries(expected)) {
      expect(MODEL_REGISTRY[key].path).toBe(`/models/characters/${CHARACTERS[id].file}`);
      expect(fs.existsSync(path.join(PUBLIC, MODEL_REGISTRY[key].path))).toBe(true);
    }
  });
});
