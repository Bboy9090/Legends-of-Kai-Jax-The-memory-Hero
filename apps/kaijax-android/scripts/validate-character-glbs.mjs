import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_CLIPS = [
  'idle',
  'breathing',
  'walk',
  'run',
  'sprint',
  'jump',
  'fall',
  'landing',
  'dodge',
  'attack_1',
  'attack_2',
  'attack_3',
  'heavy_strike',
  'parry',
  'hit_reaction',
  'roar',
  'ability_cast',
  'victory',
  'defeat',
];

const REQUIRED_SOCKETS = [
  'socket_weapon_L',
  'socket_weapon_R',
  'socket_relic',
  'socket_hitbox_L',
  'socket_hitbox_R',
  'socket_head',
];

const EXPECTED_SPECS = {
  kai: { spiderBones: 12, maneBones: 0, tailBones: 0, maxMasterTris: 30000, maxLod1Tris: 12000 },
  jax: { spiderBones: 0, maneBones: 7, tailBones: 0, maxMasterTris: 30000, maxLod1Tris: 12000 },
  kaijax: { spiderBones: 12, maneBones: 7, tailBones: 12, maxMasterTris: 35000, maxLod1Tris: 14000 },
  boryn: { spiderBones: 0, maneBones: 0, tailBones: 4, maxMasterTris: 28000, maxLod1Tris: 11000 },
  borax: { spiderBones: 0, maneBones: 0, tailBones: 4, maxMasterTris: 30000, maxLod1Tris: 12000 },
};

export function inspectGlbBinary(filePath) {
  const buf = fs.readFileSync(filePath);
  assert.equal(buf.readUInt32LE(0), 0x46546c67, `${filePath}: invalid GLB magic`);
  assert.equal(buf.readUInt32LE(4), 2, `${filePath}: expected glTF 2.0`);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));

  let tris = 0;
  let verts = 0;
  let hasUv = false;
  let hasJoints = false;
  let hasWeights = false;
  let morphTargetCount = 0;

  for (const m of gltf.meshes ?? []) {
    for (const p of m.primitives ?? []) {
      const attrs = p.attributes ?? {};
      if (attrs.POSITION !== undefined) verts += gltf.accessors[attrs.POSITION].count;
      if (attrs.TEXCOORD_0 !== undefined) hasUv = true;
      if (attrs.JOINTS_0 !== undefined) hasJoints = true;
      if (attrs.WEIGHTS_0 !== undefined) hasWeights = true;
      if (p.indices !== undefined) tris += Math.floor(gltf.accessors[p.indices].count / 3);
      morphTargetCount = Math.max(morphTargetCount, (p.targets ?? []).length);
    }
  }

  const nodeNames = (gltf.nodes ?? []).map((n) => n.name || '');
  const skinCount = (gltf.skins ?? []).length;
  const jointCount = skinCount > 0 ? gltf.skins[0].joints.length : 0;
  const animNames = (gltf.animations ?? []).map((a) => a.name || '');
  const materialCount = (gltf.materials ?? []).length;
  const imageCount = (gltf.images ?? []).length;

  return {
    sizeBytes: buf.length,
    verts,
    tris,
    hasUv,
    hasJoints,
    hasWeights,
    morphTargetCount,
    skinCount,
    jointCount,
    nodeNames,
    animNames,
    materialCount,
    imageCount,
  };
}

const dir = path.resolve(process.cwd(), 'public/models/characters');
const filterIds = process.argv.slice(2);
const ids = filterIds.length > 0 ? filterIds : Object.keys(EXPECTED_SPECS);

for (const id of ids) {
  const spec = EXPECTED_SPECS[id];
  assert.ok(spec, `Unknown character id: ${id}`);

  for (const tier of ['master', 'lod1']) {
    const fname = `${id}_${tier}.glb`;
    const fpath = path.join(dir, fname);
    assert.ok(fs.existsSync(fpath), `Missing expected GLB: ${fpath}`);

    const info = inspectGlbBinary(fpath);
    const maxTris = tier === 'master' ? spec.maxTriangles ?? spec.maxMasterTris : spec.maxLod1Tris;

    assert.ok(info.tris > 1500 && info.tris <= maxTris, `${fname}: tris ${info.tris} outside (1500..${maxTris}]`);
    assert.equal(info.hasUv, true, `${fname}: missing UV map TEXCOORD_0`);
    assert.equal(info.hasJoints, true, `${fname}: missing skinning JOINTS_0`);
    assert.equal(info.hasWeights, true, `${fname}: missing skinning WEIGHTS_0`);
    assert.equal(info.skinCount, 1, `${fname}: expected 1 unified skin, got ${info.skinCount}`);
    assert.ok(info.morphTargetCount >= 5, `${fname}: expected >= 5 facial morph targets, got ${info.morphTargetCount}`);
    assert.ok(info.imageCount >= 1, `${fname}: expected embedded PBR textures`);

    for (const sock of REQUIRED_SOCKETS) {
      assert.ok(info.nodeNames.includes(sock), `${fname}: missing required attachment socket ${sock}`);
    }
    for (const clip of REQUIRED_CLIPS) {
      assert.ok(info.animNames.includes(clip), `${fname}: missing required animation clip '${clip}' (found: ${info.animNames.join(', ')})`);
    }

    const spiderNodes = info.nodeNames.filter((n) => /^spider_(UL|UR|LL|LR)_0[1-3]$/.test(n));
    const maneNodes = info.nodeNames.filter((n) => /^mane_0[1-7]$/.test(n));
    const tailNodes = info.nodeNames.filter((n) => /^tail(_ember|_memory|_storm)?_0[1-4]$/.test(n));

    assert.equal(spiderNodes.length, spec.spiderBones, `${fname}: spider bone count ${spiderNodes.length} !== ${spec.spiderBones}`);
    assert.equal(maneNodes.length, spec.maneBones, `${fname}: mane bone count ${maneNodes.length} !== ${spec.maneBones}`);
    assert.equal(tailNodes.length, spec.tailBones, `${fname}: tail bone count ${tailNodes.length} !== ${spec.tailBones} (3-Tail Canon Rule)`);

    console.log(
      `[VALIDATED] ${fname.padEnd(20)} ${(info.sizeBytes / 1e6).toFixed(2)} MB | tris=${String(info.tris).padStart(6)} | joints=${info.jointCount} | morphs=${info.morphTargetCount} | clips=${info.animNames.length}`
    );
  }
}

// Verify Bovar governance rule: must NOT exist as an unapproved fabricated GLB
assert.equal(
  fs.existsSync(path.join(dir, 'bovar_master.glb')),
  false,
  'bovar_master.glb must remain withheld while marked awaiting_visual_approval'
);
console.log('ALL GLB BINARY & CANON INVARIANTS PASSED.');
