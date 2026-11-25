import { DEFAULT_GAMEPAD_BINDINGS } from '../combat/combatInputMapper';
import { EQUIPMENT_CATALOG } from '../data/itemsData';
import { SKILL_TREES } from '../data/abilitiesData';
import { GameSettings, HeroProgression, SaveSlotData } from '../types';

const SETTINGS_KEY = 'kaijax_settings_v1';
const SAVE_PREFIX = 'kaijax_save_v1_';
const BACKUP_SUFFIX = '_bak';
export const CURRENT_SAVE_VERSION = 2;
export const SAVE_SLOTS = ['autosave', 'slot-1', 'slot-2', 'slot-3'] as const;

export interface SaveEnvelopeV2 {
  __kaijaxEnvelope: 2;
  checksum: string;
  payload: SaveSlotData;
}

export interface SaveRecoveryReport {
  slotId: string;
  status: 'empty' | 'ok' | 'migrated_legacy' | 'recovered_from_backup' | 'corrupted_unrecoverable';
  data: SaveSlotData | null;
}

export function computeSaveChecksum(serializedPayload: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < serializedPayload.length; i++) {
    hash ^= serializedPayload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function getStorageSafe(customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  if (customStorage) return customStorage;
  // Android private mode, embedded WebViews, and locked-down browsers may
  // throw SecurityError even when the localStorage property is accessed.
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function finiteRange(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

function finiteNonnegativeInt(value: unknown, fallback: number, max: number): number {
  return Math.floor(finiteRange(value, fallback, 0, max));
}

function prefersReducedMotionDefault(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'balanced',
  characterModelVersion: 'p1i_reconstructed',
  environmentMode: 'reconstructed',
  targetFps: 60,
  masterVolume: 0.75,
  musicVolume: 0.55,
  sfxVolume: 0.85,
  muted: false,
  touchSensitivity: 1.0,
  invertCameraY: false,
  aimAssist: true,
  autoRecenterCamera: false,
  hudButtonScale: 1.0,
  hudOpacity: 0.9,
  hudEdgeOffset: 12,
  hudVerticalOffset: 10,
  hudCompactMode: 'auto',
  subtitlesEnabled: true,
  subtitleScale: 'normal',
  reducedMotion: prefersReducedMotionDefault(),
  reduceCameraShake: false,
  colorblindMode: 'none',
  hapticsEnabled: true,
  parryTiming: 'standard',
  gamepadBindings: { ...DEFAULT_GAMEPAD_BINDINGS },
};

export function createNewSave(
  slotId = 'autosave',
  label = 'Ashblock Heights — Act I',
  startingHero: 'kai' | 'jax' = 'kai'
): SaveSlotData {
  return {
    version: CURRENT_SAVE_VERSION,
    slotId,
    savedAt: new Date().toISOString(),
    label,
    activeHero: startingHero,
    fusionUnlocked: false,
    unlockedDomains: ['domain-ember', 'domain-storm', 'domain-memory'],
    traversalTier: 'Apex Street',
    missionStageIndex: 0,
    missionCompleted: false,
    checkpointPos: [0, 0, 8],
    rescuedCivilians: 0,
    reconstructedSites: 0,
    memoryFragments: 0,
    combatMastery: 0,
    traversalMastery: 0,
    duoSynergySaved: 0,
    combatStats: {
      parryCount: 0,
      evadeCount: 0,
      hitsTaken: 0,
      maxCombo: 0,
      duoFinishersUsed: 0,
      wallPinsCount: 0,
      guardBreaksCount: 0,
      styleScoreBest: 0,
    },
    heroes: {
      kai: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        skillPoints: 1,
        unlockedSkills: [],
        equipped: {
          weapon: 'wpn-kai-street',
          armor: 'arm-kai-coat',
          relic: 'rel-bovar-charm',
        },
      },
      jax: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        skillPoints: 1,
        unlockedSkills: [],
        equipped: {
          weapon: 'wpn-jax-gauntlets',
          armor: 'arm-jax-vest',
          relic: 'rel-bovar-charm',
        },
      },
    },
    inventoryIds: [
      'wpn-kai-street',
      'arm-kai-coat',
      'wpn-jax-gauntlets',
      'arm-jax-vest',
      'rel-bovar-charm',
    ],
    materials: {
      'Ash Scrap': 2,
      'Pyraxis Ember': 1,
      'Storm Capacitor': 1,
      'Myrr\'Kai Thread': 0,
    },
    activeCosmeticId: 'canon-default',
    unlockedCosmeticIds: ['canon-default'],
  };
}

export function validateSavePayload(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const obj = raw as Record<string, unknown>;
  if ('activeHero' in obj && obj.activeHero !== 'kai' && obj.activeHero !== 'jax') return false;
  if ('missionStageIndex' in obj && (typeof obj.missionStageIndex !== 'number' || !Number.isFinite(obj.missionStageIndex))) {
    return false;
  }
  if ('checkpointPos' in obj) {
    if (!Array.isArray(obj.checkpointPos) || obj.checkpointPos.length !== 3) return false;
    if (!obj.checkpointPos.every((n) => typeof n === 'number' && Number.isFinite(n))) return false;
  }
  if ('heroes' in obj && (!obj.heroes || typeof obj.heroes !== 'object' || Array.isArray(obj.heroes))) return false;
  if ('materials' in obj && (!obj.materials || typeof obj.materials !== 'object' || Array.isArray(obj.materials))) return false;
  if ('inventoryIds' in obj && (!Array.isArray(obj.inventoryIds) || !obj.inventoryIds.every((x) => typeof x === 'string'))) return false;
  if ('unlockedCosmeticIds' in obj && (!Array.isArray(obj.unlockedCosmeticIds) || !obj.unlockedCosmeticIds.every((x) => typeof x === 'string'))) return false;
  return true;
}

export function migrateSaveData(raw: unknown, slotId: string): SaveSlotData {
  const base = createNewSave(slotId);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const obj = raw as Partial<SaveSlotData>;
  const safeHero = obj.activeHero === 'jax' ? 'jax' : 'kai';
  const safeStage =
    typeof obj.missionStageIndex === 'number' && Number.isFinite(obj.missionStageIndex)
      ? Math.max(0, Math.min(4, Math.floor(obj.missionStageIndex)))
      : base.missionStageIndex;
  const safePos: [number, number, number] =
    Array.isArray(obj.checkpointPos) &&
    obj.checkpointPos.length === 3 &&
    obj.checkpointPos.every((v) => typeof v === 'number' && Number.isFinite(v))
      ? [obj.checkpointPos[0], obj.checkpointPos[1], obj.checkpointPos[2]]
      : base.checkpointPos;

  const cleanHero = (rawHero: Partial<HeroProgression> | undefined, fallback: HeroProgression): HeroProgression => {
    const equipped = rawHero?.equipped;
    return {
      ...fallback,
      ...rawHero,
      level: finiteNonnegativeInt(rawHero?.level, fallback.level, 1000) || 1,
      xp: finiteNonnegativeInt(rawHero?.xp, fallback.xp, 1_000_000_000),
      xpToNext: Math.max(1, finiteNonnegativeInt(rawHero?.xpToNext, fallback.xpToNext, 1_000_000_000)),
      skillPoints: finiteNonnegativeInt(rawHero?.skillPoints, fallback.skillPoints, 100_000),
      unlockedSkills: Array.isArray(rawHero?.unlockedSkills)
        ? rawHero.unlockedSkills.filter((id): id is string => typeof id === 'string')
        : fallback.unlockedSkills,
      equipped: {
        weapon: typeof equipped?.weapon === 'string' ? equipped.weapon : fallback.equipped.weapon,
        armor: typeof equipped?.armor === 'string' ? equipped.armor : fallback.equipped.armor,
        relic: typeof equipped?.relic === 'string' ? equipped.relic : fallback.equipped.relic,
      },
    };
  };

  return {
    ...base,
    ...obj,
    version: CURRENT_SAVE_VERSION,
    slotId,
    activeHero: safeHero,
    missionStageIndex: safeStage,
    checkpointPos: safePos,
    combatStats: Object.fromEntries(
      Object.entries(base.combatStats).map(([key, fallback]) => [
        key,
        finiteNonnegativeInt(
          obj.combatStats && typeof obj.combatStats === 'object' && !Array.isArray(obj.combatStats)
            ? (obj.combatStats as unknown as Record<string, unknown>)[key]
            : undefined,
          fallback ?? 0,
          1_000_000_000
        ),
      ])
    ) as SaveSlotData['combatStats'],
    heroes: {
      kai: cleanHero(obj.heroes?.kai, base.heroes.kai),
      jax: cleanHero(obj.heroes?.jax, base.heroes.jax),
    },
    inventoryIds: Array.isArray(obj.inventoryIds)
      ? obj.inventoryIds.filter((id): id is string => typeof id === 'string')
      : base.inventoryIds,
    unlockedCosmeticIds: Array.isArray(obj.unlockedCosmeticIds)
      ? obj.unlockedCosmeticIds.filter((id): id is string => typeof id === 'string')
      : base.unlockedCosmeticIds,
    materials: Object.fromEntries(
      Object.entries({ ...base.materials, ...(obj.materials ?? {}) }).map(([key, value]) => [
        key,
        finiteNonnegativeInt(value, base.materials[key] ?? 0, 1_000_000_000),
      ])
    ),
  };
}

export function loadSettings(
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): GameSettings {
  try {
    const store = getStorageSafe(customStorage);
    if (!store) return DEFAULT_SETTINGS;
    const raw = store.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_SETTINGS;
    const rawBindings = parsed.gamepadBindings &&
      typeof parsed.gamepadBindings === 'object' && !Array.isArray(parsed.gamepadBindings)
        ? parsed.gamepadBindings
        : {};
    const validBindingEntries = Object.fromEntries(
      Object.entries(rawBindings)
        .filter(([key, value]) => key in DEFAULT_GAMEPAD_BINDINGS &&
          Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 31)
    );
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      graphicsQuality: ['low', 'balanced', 'high'].includes(String(parsed.graphicsQuality))
        ? parsed.graphicsQuality! : DEFAULT_SETTINGS.graphicsQuality,
      targetFps: parsed.targetFps === 30 ? 30 : 60,
      masterVolume: finiteRange(parsed.masterVolume, DEFAULT_SETTINGS.masterVolume, 0, 1),
      musicVolume: finiteRange(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume, 0, 1),
      sfxVolume: finiteRange(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume, 0, 1),
      touchSensitivity: finiteRange(parsed.touchSensitivity, DEFAULT_SETTINGS.touchSensitivity, 0.2, 3),
      hudButtonScale: finiteRange(parsed.hudButtonScale, DEFAULT_SETTINGS.hudButtonScale, 0.65, 1.5),
      hudOpacity: finiteRange(parsed.hudOpacity, DEFAULT_SETTINGS.hudOpacity, 0.35, 1),
      hudEdgeOffset: finiteRange(parsed.hudEdgeOffset, DEFAULT_SETTINGS.hudEdgeOffset, 0, 80),
      hudVerticalOffset: finiteRange(parsed.hudVerticalOffset, DEFAULT_SETTINGS.hudVerticalOffset ?? 10, 0, 80),
      hudCompactMode: parsed.hudCompactMode === 'compact' || parsed.hudCompactMode === 'expanded'
        ? parsed.hudCompactMode : 'auto',
      gamepadBindings: {
        ...DEFAULT_GAMEPAD_BINDINGS,
        ...validBindingEntries,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(
  settings: GameSettings,
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): void {
  try {
    const store = getStorageSafe(customStorage);
    if (!store) return;
    store.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function parseSlotEntry(
  rawStr: string,
  slotId: string
): { valid: boolean; legacy: boolean; data: SaveSlotData | null } {
  try {
    const parsed = JSON.parse(rawStr) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { valid: false, legacy: false, data: null };
    }
    const maybeEnv = parsed as Partial<SaveEnvelopeV2>;
    if (maybeEnv.__kaijaxEnvelope === 2 && maybeEnv.payload && typeof maybeEnv.checksum === 'string') {
      const payloadJson = JSON.stringify(maybeEnv.payload);
      if (computeSaveChecksum(payloadJson) !== maybeEnv.checksum) {
        return { valid: false, legacy: false, data: null };
      }
      if (!validateSavePayload(maybeEnv.payload)) {
        return { valid: false, legacy: false, data: null };
      }
      return { valid: true, legacy: false, data: migrateSaveData(maybeEnv.payload, slotId) };
    }
    // Legacy v0 / v1 plain SaveSlotData object
    if (!validateSavePayload(parsed)) {
      return { valid: false, legacy: true, data: null };
    }
    return { valid: true, legacy: true, data: migrateSaveData(parsed, slotId) };
  } catch {
    return { valid: false, legacy: false, data: null };
  }
}

export function saveToSlot(
  slotId: string,
  data: SaveSlotData,
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): SaveSlotData {
  const stamped: SaveSlotData = {
    ...data,
    version: CURRENT_SAVE_VERSION,
    slotId,
    savedAt: new Date().toISOString(),
  };
  const store = getStorageSafe(customStorage);
  if (!store) return stamped;

  const primaryKey = `${SAVE_PREFIX}${slotId}`;
  const backupKey = `${SAVE_PREFIX}${slotId}${BACKUP_SUFFIX}`;

  try {
    // Preserve previous known-good primary entry into shadow backup BEFORE writing new primary
    const existingPrimary = store.getItem(primaryKey);
    if (existingPrimary) {
      const checkExisting = parseSlotEntry(existingPrimary, slotId);
      if (checkExisting.valid) {
        store.setItem(backupKey, existingPrimary);
      }
    }

    const payloadJson = JSON.stringify(stamped);
    const envelope: SaveEnvelopeV2 = {
      __kaijaxEnvelope: 2,
      checksum: computeSaveChecksum(payloadJson),
      payload: stamped,
    };
    const serializedEnvelope = JSON.stringify(envelope);
    store.setItem(primaryKey, serializedEnvelope);
    // Ensure fresh slots immediately possess a valid shadow backup as well
    if (!store.getItem(backupKey)) {
      store.setItem(backupKey, serializedEnvelope);
    }
  } catch {
    // Ignore quota failure gracefully without crashing gameplay
  }
  return stamped;
}

export function loadFromSlotWithRecovery(
  slotId: string,
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): SaveRecoveryReport {
  const store = getStorageSafe(customStorage);
  if (!store) {
    return { slotId, status: 'empty', data: null };
  }
  const primaryKey = `${SAVE_PREFIX}${slotId}`;
  const backupKey = `${SAVE_PREFIX}${slotId}${BACKUP_SUFFIX}`;

  let rawPrimary: string | null = null;
  let rawBackup: string | null = null;
  try {
    rawPrimary = store.getItem(primaryKey);
    rawBackup = store.getItem(backupKey);
  } catch {
    // Restricted storage must not crash boot or erase the current in-memory save.
    return { slotId, status: 'empty', data: null };
  }

  if (!rawPrimary && !rawBackup) {
    return { slotId, status: 'empty', data: null };
  }

  if (rawPrimary) {
    const res = parseSlotEntry(rawPrimary, slotId);
    if (res.valid && res.data) {
      if (res.legacy) {
        // Automatically upgrade legacy v0/v1 save to checksummed v2 envelope in-place
        saveToSlot(slotId, res.data, store);
        return { slotId, status: 'migrated_legacy', data: res.data };
      }
      return { slotId, status: 'ok', data: res.data };
    }
  }

  // Primary was truncated or corrupted -> Attempt atomic shadow backup recovery!
  if (rawBackup) {
    const bakRes = parseSlotEntry(rawBackup, slotId);
    if (bakRes.valid && bakRes.data) {
      try {
        // Heal corrupted primary key from verified backup
        const payloadJson = JSON.stringify(bakRes.data);
        const healed: SaveEnvelopeV2 = {
          __kaijaxEnvelope: 2,
          checksum: computeSaveChecksum(payloadJson),
          payload: bakRes.data,
        };
        store.setItem(primaryKey, JSON.stringify(healed));
      } catch {
        // Ignore write error
      }
      return { slotId, status: 'recovered_from_backup', data: bakRes.data };
    }
  }

  return { slotId, status: 'corrupted_unrecoverable', data: null };
}

export function loadFromSlot(
  slotId: string,
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): SaveSlotData | null {
  return loadFromSlotWithRecovery(slotId, customStorage).data;
}

export function listAllSaves(
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): Record<string, SaveSlotData | null> {
  const out: Record<string, SaveSlotData | null> = {};
  for (const id of SAVE_SLOTS) {
    out[id] = loadFromSlot(id, customStorage);
  }
  return out;
}

export function deleteSlot(
  slotId: string,
  customStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): void {
  const store = getStorageSafe(customStorage);
  if (!store) return;
  try {
    store.removeItem(`${SAVE_PREFIX}${slotId}`);
    store.removeItem(`${SAVE_PREFIX}${slotId}${BACKUP_SUFFIX}`);
  } catch {
    // Ignore
  }
}

export function computeHeroStats(hero: 'kai' | 'jax', prog: HeroProgression) {
  const isKai = hero === 'kai';
  let maxHp = (isKai ? 140 : 175) + (prog.level - 1) * 18;
  let maxEnergy = (isKai ? 115 : 95) + (prog.level - 1) * 6;
  let attack = (isKai ? 22 : 27) + (prog.level - 1) * 4;
  let defense = (isKai ? 8 : 12) + (prog.level - 1) * 2;
  let speedMult = isKai ? 1.12 : 1.02;
  let critChance = isKai ? 0.16 : 0.12;
  let abilityPower = 1.0;

  for (const skillId of prog.unlockedSkills) {
    const node = SKILL_TREES.find((n) => n.id === skillId);
    if (!node) continue;
    if (node.statBoost.maxHp) maxHp += node.statBoost.maxHp;
    if (node.statBoost.maxEnergy) maxEnergy += node.statBoost.maxEnergy;
    if (node.statBoost.attack) attack += node.statBoost.attack;
    if (node.statBoost.critChance) critChance += node.statBoost.critChance;
    if (node.statBoost.abilityPower) abilityPower += node.statBoost.abilityPower;
    if (node.statBoost.speed) speedMult += node.statBoost.speed;
  }

  for (const slot of ['weapon', 'armor', 'relic'] as const) {
    const eqId = prog.equipped[slot];
    const item = EQUIPMENT_CATALOG.find((i) => i.id === eqId);
    if (!item) continue;
    attack += item.attackBonus;
    defense += item.defenseBonus;
    maxEnergy += item.energyBonus;
  }

  return {
    maxHp,
    maxEnergy,
    attack,
    defense,
    speedMult,
    critChance,
    abilityPower,
  };
}

export function grantHeroXp(prog: HeroProgression, amount: number): { updated: HeroProgression; leveledUp: boolean } {
  const award = finiteNonnegativeInt(amount, 0, 1_000_000);
  let xp = finiteNonnegativeInt(prog.xp, 0, 1_000_000_000) + award;
  let level = Math.max(1, finiteNonnegativeInt(prog.level, 1, 1000));
  let xpToNext = Math.max(1, finiteNonnegativeInt(prog.xpToNext, 100, 1_000_000_000));
  let skillPoints = finiteNonnegativeInt(prog.skillPoints, 0, 100_000);
  let leveledUp = false;

  // Corrupt or legacy zero thresholds must never hang the main game thread.
  while (xp >= xpToNext && level < 1000) {
    xp -= xpToNext;
    level += 1;
    skillPoints = Math.min(100_000, skillPoints + 1);
    xpToNext = Math.min(1_000_000_000, Math.max(xpToNext + 1, Math.round(xpToNext * 1.35)));
    leveledUp = true;
  }
  xp = Math.min(xp, Math.max(0, xpToNext - 1));

  return {
    leveledUp,
    updated: {
      ...prog,
      level,
      xp,
      xpToNext,
      skillPoints,
    },
  };
}
