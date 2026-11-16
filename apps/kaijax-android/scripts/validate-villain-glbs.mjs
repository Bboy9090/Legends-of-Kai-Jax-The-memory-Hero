import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { inspectGlbBinary } from './validate-character-glbs.mjs';

const REQUIRED_CLIPS = [
  'idle', 'breathing', 'walk', 'run', 'sprint',
  'jump', 'fall', 'landing', 'dodge',
  'attack_1', 'attack_2', 'attack_3', 'heavy_strike',
  'parry', 'hit_reaction', 'roar', 'ability_cast',
  'victory', 'defeat',
];

const REQUIRED_SOCKETS = [
  'socket_weapon_L',
  'socket_weapon_R',
  'socket_relic',
  'socket_hitbox_L',
  'socket_hitbox_R',
  'socket_head',
];

const VILLAIN_IDS = [
  'fang_enforcer',
  'blood_broker',
  'syndicate_brawler',
  'syndicate_stalker',
  'syndicate_marksman',
  'architect_scout',
  'neon_prince',
  'undercrown_sentinel',
  'borax_zenith',
  'erasure_choir',
  'hollow_architect',
];

const dir = path.resolve(process.cwd(), 'public/models/enemies');
let count = 0;

for (const id of VILLAIN_IDS) {
  for (const tier of ['master', 'lod1']) {
    const fname = `${id}_${tier}.glb`;
    const fpath = path.join(dir, fname);
    assert.ok(fs.existsSync(fpath), `Missing villain GLB: ${fpath}`);
    const info = inspectGlbBinary(fpath);
    const maxTris = tier === 'master' ? 18000 : 8000;
    assert.ok(info.tris > 800 && info.tris <= maxTris, `${fname}: tris ${info.tris} out of (800..${maxTris}]`);
    assert.equal(info.hasUv, true, `${fname}: missing UV`);
    assert.equal(info.hasJoints, true, `${fname}: missing JOINTS_0`);
    assert.equal(info.hasWeights, true, `${fname}: missing WEIGHTS_0`);
    assert.equal(info.skinCount, 1, `${fname}: expected 1 skin`);
    assert.ok(info.morphTargetCount >= 5, `${fname}: expected >= 5 morph targets`);
    assert.ok(info.imageCount >= 4, `${fname}: expected 4 PBR images`);
    for (const sock of REQUIRED_SOCKETS) {
      assert.ok(info.nodeNames.includes(sock), `${fname}: missing socket ${sock}`);
    }
    for (const clip of REQUIRED_CLIPS) {
      assert.ok(info.animNames.includes(clip), `${fname}: missing clip ${clip}`);
    }
    count++;
    console.log(
      `[VALIDATED] ${fname.padEnd(28)} ${(info.sizeBytes / 1024).toFixed(1).padStart(6)} KB | tris=${String(info.tris).padStart(5)} | joints=${info.jointCount} | clips=${info.animNames.length}`
    );
  }
}

console.log(`ALL ${count} VILLAIN & ENEMY GLB BINARY INVARIANTS PASSED.`);
