import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createNewSave,
  grantHeroXp,
  loadFromSlotWithRecovery,
  loadSettings,
  migrateSaveData,
  saveToSlot,
  validateSavePayload,
} from '../save/SaveManager';

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
    entries,
  };
}

test('new campaigns survive a checksummed round trip with hero, mission, and inventory intact', () => {
  const storage = memoryStorage();
  const original = createNewSave('slot-1', 'Ashblock Test', 'jax');
  const saved = saveToSlot('slot-1', original, storage);
  const roundtrip = loadFromSlotWithRecovery('slot-1', storage);
  assert.equal(roundtrip.status, 'ok');
  assert.equal(roundtrip.data?.activeHero, 'jax');
  assert.deepEqual(roundtrip.data?.inventoryIds, original.inventoryIds);
  assert.equal(roundtrip.data?.savedAt, saved.savedAt);
});

test('corrupted primary is recovered from an independently verified backup', () => {
  const storage = memoryStorage();
  saveToSlot('autosave', createNewSave('autosave'), storage);
  storage.setItem('kaijax_save_v1_autosave', '{"bad-json":');
  const result = loadFromSlotWithRecovery('autosave', storage);
  assert.equal(result.status, 'recovered_from_backup');
  assert.ok(result.data);
  assert.equal(loadFromSlotWithRecovery('autosave', storage).status, 'ok');
});

test('storage access failures return an empty safe recovery result, not a boot crash', () => {
  const blocked = {
    getItem: (_key: string): string | null => { throw new Error('SecurityError'); },
    setItem: (_key: string, _value: string) => { throw new Error('SecurityError'); },
    removeItem: (_key: string) => { throw new Error('SecurityError'); },
  };
  assert.equal(loadFromSlotWithRecovery('autosave', blocked).status, 'empty');
  assert.equal(loadSettings(blocked).graphicsQuality, 'balanced');
});

test('malformed legacy progression is sanitized rather than hanging leveling logic', () => {
  const raw = createNewSave('slot-2');
  raw.heroes.kai.xpToNext = 0;
  raw.heroes.kai.level = Number.NaN;
  raw.heroes.kai.xp = -200;
  raw.heroes.kai.unlockedSkills = null as unknown as string[];
  raw.heroes.jax.xpToNext = Number.POSITIVE_INFINITY;
  const recovered = migrateSaveData(raw, 'slot-2');
  assert.equal(recovered.heroes.kai.level, 1);
  assert.equal(recovered.heroes.kai.xp, 0);
  assert.equal(recovered.heroes.kai.xpToNext, 1);
  assert.deepEqual(recovered.heroes.kai.unlockedSkills, []);
  assert.equal(recovered.heroes.jax.xpToNext, 100);
});

test('XP never loops on zero thresholds or accepts negative and NaN awards', () => {
  const base = createNewSave().heroes.kai;
  const corrupt = { ...base, xp: 50, xpToNext: 0 };
  const gained = grantHeroXp(corrupt, 100);
  assert.equal(gained.leveledUp, true);
  assert.ok(gained.updated.level > corrupt.level);
  assert.ok(gained.updated.xpToNext > 0);
  const invalidAward = grantHeroXp(base, Number.NaN);
  assert.equal(invalidAward.updated.xp, base.xp);
  const negativeAward = grantHeroXp(base, -100);
  assert.equal(negativeAward.updated.xp, base.xp);
});

test('settings normalize corrupted speed, volume, HUD and gamepad inputs', () => {
  const storage = memoryStorage();
  storage.setItem('kaijax_settings_v1', JSON.stringify({
    graphicsQuality: 'ultra',
    targetFps: 1000,
    masterVolume: 700,
    musicVolume: -5,
    sfxVolume: null,
    touchSensitivity: -50,
    hudOpacity: 0,
    hudButtonScale: 10,
    hudEdgeOffset: 10000,
    gamepadBindings: { lightAttack: -1, heavyAttack: 8, aimLockOn: 999 },
  }));
  const loaded = loadSettings(storage);
  assert.equal(loaded.graphicsQuality, 'balanced');
  assert.equal(loaded.targetFps, 60);
  assert.equal(loaded.masterVolume, 1);
  assert.equal(loaded.musicVolume, 0);
  assert.equal(loaded.sfxVolume, 0.85);
  assert.equal(loaded.touchSensitivity, 0.2);
  assert.equal(loaded.hudOpacity, 0.35);
  assert.equal(loaded.hudButtonScale, 1.5);
  assert.equal(loaded.hudEdgeOffset, 80);
  assert.equal(loaded.gamepadBindings?.heavyAttack, 8);
  assert.ok(loaded.gamepadBindings && loaded.gamepadBindings.lightAttack >= 0);
});

test('truncated and malformed inventories are not accepted as valid save data', () => {
  assert.equal(validateSavePayload({ inventoryIds: 'not-an-array' }), false);
  assert.equal(validateSavePayload({ heroes: [] }), false);
  assert.equal(validateSavePayload({ materials: null }), false);
  assert.equal(validateSavePayload({ checkpointPos: [0, Number.POSITIVE_INFINITY, 2] }), false);
});
