/**
 * Current visual-authority gate for provisional villain GLBs.
 *
 * Unlike the frozen Wave 7 gameSystems test, this file is allowed to evolve
 * with later production art sign-off receipts. It is included in the
 * `npm run test:server` glob without changing the certified snapshot.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ENEMY_ASSET_REGISTRY,
  resolveEnemyFallbackChain,
  type EnemyModelId,
} from '../../src/game/data/enemyAssetRegistry';

const namedMismatches = [
  'fang_enforcer',
  'hollow_architect',
  'erasure_choir',
] as const satisfies readonly EnemyModelId[];

test('all villain GLBs remain provisional unless signed off by the project owner', () => {
  const entries = Object.values(ENEMY_ASSET_REGISTRY);
  assert.equal(entries.length, 11, 'Review every current villain and enemy model');
  for (const entry of entries) {
    assert.equal(
      entry.visualAuthorityStatus,
      'awaiting_visual_approval',
      `${entry.id}: GLB structural validity is not owner art approval`,
    );
  }
});

test('confirmed concept-sheet mismatches are not silently treated as approved', () => {
  for (const id of namedMismatches) {
    const entry = ENEMY_ASSET_REGISTRY[id];
    assert.equal(entry.visualReferenceMatch, 'mismatch', id);
    assert.equal(entry.visualAuthorityStatus, 'awaiting_visual_approval', id);
  }
});

test('unmapped villain concepts do not inherit unrelated character approvals', () => {
  const mismatches = new Set<string>(namedMismatches);
  for (const entry of Object.values(ENEMY_ASSET_REGISTRY)) {
    if (!mismatches.has(entry.id)) {
      assert.equal(entry.visualReferenceMatch, 'unmapped', entry.id);
    }
  }
});

test('visual approval metadata cannot change existing model URLs or LOD selection', () => {
  for (const id of Object.keys(ENEMY_ASSET_REGISTRY) as EnemyModelId[]) {
    const entry = ENEMY_ASSET_REGISTRY[id];
    assert.match(entry.masterGlbUrl, /^\/models\/enemies\/[^/]+_master\.glb$/);
    assert.match(entry.lod1GlbUrl, /^\/models\/enemies\/[^/]+_lod1\.glb$/);
    assert.deepEqual(resolveEnemyFallbackChain(id, 'low', true), [entry.lod1GlbUrl, entry.masterGlbUrl]);
    assert.deepEqual(resolveEnemyFallbackChain(id, 'high', false), [entry.masterGlbUrl, entry.lod1GlbUrl]);
  }
});
