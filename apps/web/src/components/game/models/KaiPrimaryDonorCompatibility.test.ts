import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

type Gltf = {
  nodes?: Array<{ name?: string }>;
  skins?: Array<{ joints?: number[] }>;
  meshes?: Array<{ primitives?: Array<{ attributes?: Record<string, number>; indices?: number }> }>;
  accessors?: Array<{ bufferView?: number }>;
  bufferViews?: Array<{
    byteOffset?: number;
    byteLength: number;
    extensions?: {
      EXT_meshopt_compression?: {
        buffer: number;
        byteOffset?: number;
        byteLength: number;
        byteStride: number;
        count: number;
        mode: 'ATTRIBUTES' | 'TRIANGLES' | 'INDICES';
        filter?: 'NONE' | 'OCTAHEDRAL' | 'QUATERNION' | 'EXPONENTIAL';
      };
    };
  }>;
  images?: Array<{ bufferView?: number; mimeType?: string }>;
  materials?: unknown[];
  animations?: unknown[];
};

function parseGlb(relativePath: string): { json: Gltf; bin: Buffer } {
  const file = path.resolve(process.cwd(), relativePath);
  const data = fs.readFileSync(file);
  expect(data.readUInt32LE(0)).toBe(0x46546c67);

  let offset = 12;
  let json: Gltf | null = null;
  let bin = Buffer.alloc(0);

  while (offset + 8 <= data.length) {
    const length = data.readUInt32LE(offset);
    const type = data.readUInt32LE(offset + 4);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').trimEnd());
    if (type === 0x004e4942) bin = chunk;
    offset += 8 + length;
  }

  if (!json) throw new Error(`Missing JSON chunk in ${relativePath}`);
  return { json, bin };
}

function hash(bytes: Buffer): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

// Mesh buffer views may be EXT_meshopt_compression-encoded; hash their decoded bytes so the
// donor-vs-primary guard compares real geometry instead of compressed container bytes.
function bufferViewHash(gltf: Gltf, bin: Buffer, index: number): string {
  const view = gltf.bufferViews?.[index];
  if (!view) throw new Error(`Missing bufferView ${index}`);
  const meshopt = view.extensions?.EXT_meshopt_compression;
  if (meshopt) {
    const start = meshopt.byteOffset ?? 0;
    const source = new Uint8Array(bin.subarray(start, start + meshopt.byteLength));
    const target = new Uint8Array(meshopt.count * meshopt.byteStride);
    MeshoptDecoder.decodeGltfBuffer(target, meshopt.count, meshopt.byteStride, source, meshopt.mode, meshopt.filter ?? 'NONE');
    return hash(Buffer.from(target));
  }
  const start = view.byteOffset ?? 0;
  return hash(bin.subarray(start, start + view.byteLength));
}

function visualFingerprint(gltf: Gltf, bin: Buffer) {
  const meshViews = new Set<number>();
  for (const mesh of gltf.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      for (const accessorIndex of Object.values(primitive.attributes ?? {})) {
        const view = gltf.accessors?.[accessorIndex]?.bufferView;
        if (typeof view === 'number') meshViews.add(view);
      }
      if (typeof primitive.indices === 'number') {
        const view = gltf.accessors?.[primitive.indices]?.bufferView;
        if (typeof view === 'number') meshViews.add(view);
      }
    }
  }

  const imageHashes = (gltf.images ?? [])
    .map((image) => typeof image.bufferView === 'number'
      ? `${image.mimeType ?? ''}:${bufferViewHash(gltf, bin, image.bufferView)}`
      : 'external-image')
    .sort();

  const jointNames = (gltf.skins?.[0]?.joints ?? [])
    .map((index) => gltf.nodes?.[index]?.name ?? `node-${index}`)
    .sort();

  return {
    jointNames,
    meshHashes: [...meshViews].map((index) => bufferViewHash(gltf, bin, index)).sort(),
    imageHashes,
    materials: JSON.stringify(gltf.materials ?? []),
  };
}

describe('Kai primary donor authority', () => {
  it('preserves the current Kai skeleton, geometry buffers, textures, and materials', async () => {
    await MeshoptDecoder.ready;
    const staticKai = parseGlb('public/models/Meshy_AI_Character_outputSPiDERKAIJAX9TIALS.glb');
    const walkingKai = parseGlb('public/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb');

    expect(walkingKai.json.animations?.length ?? 0).toBeGreaterThan(0);
    expect(visualFingerprint(walkingKai.json, walkingKai.bin)).toEqual(
      visualFingerprint(staticKai.json, staticKai.bin),
    );
  });

  it('keeps the authored walk donor animation-only and lightweight', () => {
    const relative = 'public/models/Meshy_AI_Animation_Walking_onlySPiDERKAIJAX9TIALS.glb';
    const walk = parseGlb(relative);

    expect(walk.json.animations?.length ?? 0).toBeGreaterThan(0);
    expect(walk.json.meshes?.length ?? 0).toBe(0);
    expect(walk.json.images?.length ?? 0).toBe(0);
    expect(walk.json.materials?.length ?? 0).toBe(0);
    expect(fs.statSync(path.resolve(process.cwd(), relative)).size).toBeLessThan(250_000);
  });

  it('keeps the authored run donor animation-only and lightweight', () => {
    const relative = 'public/models/Meshy_AI_Animation_Running_onlySPiDERKAIJAX9TIALS.glb';
    const run = parseGlb(relative);

    expect(run.json.animations?.length ?? 0).toBeGreaterThan(0);
    expect(run.json.meshes?.length ?? 0).toBe(0);
    expect(run.json.images?.length ?? 0).toBe(0);
    expect(run.json.materials?.length ?? 0).toBe(0);
    expect(fs.statSync(path.resolve(process.cwd(), relative)).size).toBeLessThan(250_000);
  });
});
