import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

import { DISTRICT_PRODUCTION_SPECS } from '../src/game/data/districtSpecifications.ts';
import { DISTRICTS } from '../src/game/data/canonData.ts';
import { buildAshblockHeights } from '../src/game/engine/WorldBuilder.ts';
import {
  CURRENT_SAVE_VERSION,
  computeSaveChecksum,
  createNewSave,
  loadFromSlot,
  loadFromSlotWithRecovery,
  saveToSlot,
} from '../src/game/save/SaveManager.ts';

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function assertBinaryGltf2(filePath) {
  const buf = fs.readFileSync(filePath);
  assert.equal(buf.readUInt32LE(0), 0x46546c67, `${filePath}: invalid GLB magic`);
  assert.equal(buf.readUInt32LE(4), 2, `${filePath}: expected glTF 2.0`);
}

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function main() {
  const root = process.cwd();
  const ashDir = path.join(root, 'public/models/environments/ashblock');
  const manifestPath = path.join(ashDir, 'ashblock_kit_manifest.json');
  assert.equal(fs.existsSync(manifestPath), true, 'ashblock_kit_manifest.json missing');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.assets.length, 12, 'Expected 12 modular Ashblock GLB assets');

  let totalBytes = 0;
  for (const item of manifest.assets) {
    const fpath = path.join(ashDir, item.file);
    assert.equal(fs.existsSync(fpath), true, `Missing Ashblock GLB: ${item.file}`);
    assertBinaryGltf2(fpath);
    const stat = fs.statSync(fpath);
    assert.equal(stat.size, item.bytes, `${item.file}: size mismatch`);
    assert.equal(sha256File(fpath), item.sha256, `${item.file}: SHA-256 mismatch`);
    totalBytes += stat.size;
  }
  console.log(`[WORLD GLBS] Verified 12/12 Ashblock GLBs (${totalBytes} bytes total, manifest checksums OK)`);

  // Validate AshblockHeights runtime placement invariants
  const stubTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  stubTex.needsUpdate = true;
  const worldScene = new THREE.Scene();
  const world = buildAshblockHeights(
    worldScene,
    {
      asphaltMap: stubTex,
      asphaltRoughness: stubTex,
      sidewalkMap: stubTex,
      buildingFacadeMap: stubTex,
      buildingWarmOchreMap: stubTex,
      containerMap: stubTex,
      awningMap: stubTex,
      muralUnityMap: stubTex,
      billboardTrustMap: stubTex,
      graffitiMemoryMap: stubTex,
      bannerRoarMap: stubTex,
      signMarketMap: stubTex,
      signTailoringMap: stubTex,
      bannerFangSyndicateMap: stubTex,
      graffitiNoLawMap: stubTex,
      contactShadowMap: stubTex,
      dispose: () => stubTex.dispose(),
    },
    'reconstructed'
  );
  assert.equal(world.webAnchors.length, 10, 'Expected 10 geometry-attached Ashblock web anchors');
  assert.equal(world.environmentalHazards.length, 5, 'Expected 5 Syndicate Arc Relay hazards');
  assert.equal(world.walkableZones.length, 23, 'Expected 23 elevated traversal zones');
  assert.ok(world.instancedPropCount >= 133, `Expected >=133 Ashblock placements, got ${world.instancedPropCount}`);
  console.log(
    `[WORLD SCENE] Verified ${world.instancedPropCount} placements, ${world.walkableZones.length} elevated zones, ${world.webAnchors.length} web anchors, ${world.environmentalHazards.length} hazards`
  );

  // Validate Visual Library image references for Ashblock, Sector-7, and Neon Ward
  assert.equal(DISTRICTS.length, 8, 'Expected 8 canonical Raging City districts');
  assert.equal(DISTRICT_PRODUCTION_SPECS.length, 8, 'Expected 8 district production specs');

  const checkedSheets = new Set();
  for (const spec of DISTRICT_PRODUCTION_SPECS) {
    assert.ok(spec.controllingVisualSheets.length >= 1, `${spec.districtId}: missing visual sheet mapping`);
    for (const ref of spec.controllingVisualSheets) {
      const localRel = ref.file.replace(/^\/assets\//, 'public/assets/');
      const absPath = path.join(root, localRel);
      assert.equal(fs.existsSync(absPath), true, `${spec.districtId}: missing visual sheet ${localRel}`);
      checkedSheets.add(localRel);
    }
  }
  console.log(`[VISUAL LIBRARY] Verified ${checkedSheets.size} unique referenced PNG artwork plates on disk`);

  // Verify SaveManager v2 envelope checksum, backup recovery & legacy migration regression
  const storage = createMemoryStorage();
  const initialSave = createNewSave('slot-1', 'Ashblock Heights — Act I', 'jax');
  initialSave.missionStageIndex = 3;
  initialSave.rescuedCivilians = 2;
  initialSave.reconstructedSites = 1;
  initialSave.fusionUnlocked = true;
  initialSave.unlockedDomains = ['domain-ember', 'domain-storm', 'domain-memory'];
  saveToSlot('slot-1', initialSave, storage);

  const loaded = loadFromSlot('slot-1', storage);
  assert.ok(loaded, 'Expected saved slot-1 to reload');
  assert.equal(loaded.version, CURRENT_SAVE_VERSION);
  assert.equal(loaded.activeHero, 'jax');
  assert.equal(loaded.missionStageIndex, 3);
  assert.equal(loaded.fusionUnlocked, true);
  assert.deepEqual(loaded.unlockedDomains, ['domain-ember', 'domain-storm', 'domain-memory']);

  // Second save seeds _bak; corrupting primary must recover from _bak
  const updatedSave = { ...initialSave, missionStageIndex: 4 };
  saveToSlot('slot-1', updatedSave, storage);
  storage.setItem('kaijax_save_v1_slot-1', '{CORRUPTED_JSON');
  const recovery = loadFromSlotWithRecovery('slot-1', storage);
  assert.equal(recovery.status, 'recovered_from_backup');
  assert.equal(recovery.data?.missionStageIndex, 3);

  // Legacy v1 save migration test
  const legacyPayload = { ...initialSave, version: 1, activeHero: 'kai', missionStageIndex: 2 };
  storage.setItem('kaijax_save_v1_slot-2', JSON.stringify(legacyPayload));
  const legacyRecovery = loadFromSlotWithRecovery('slot-2', storage);
  assert.equal(legacyRecovery.status, 'migrated_legacy');
  assert.equal(legacyRecovery.data?.version, CURRENT_SAVE_VERSION);
  assert.equal(legacyRecovery.data?.activeHero, 'kai');
  assert.ok(computeSaveChecksum(JSON.stringify(legacyPayload)).length === 8);

  console.log('[SAVE REGRESSION] Save v2 envelope, _bak corruption recovery, and v1 migration PASSED');
  console.log('ALL P1-P WORLD, VISUAL LIBRARY & SAVE COMPATIBILITY CHECKS PASSED.');
}

main();
