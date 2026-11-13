/**
 * Backup save slots layered on the runner profiles: an autosave plus three manual slots, each a versioned
 * envelope that can be migrated, exported to JSON and re-imported. Storage is injectable for tests.
 */
import { normalizeProfile, type ProfileData } from "./stores/useRunner";

export const SAVE_SLOT_IDS = ["autosave", "slot-1", "slot-2", "slot-3"] as const;
export type SaveSlotId = (typeof SAVE_SLOT_IDS)[number];
export const SAVE_ENVELOPE_VERSION = 2;
const PREFIX = "kaijax_slot_v2_";

export interface SaveEnvelope {
  version: typeof SAVE_ENVELOPE_VERSION;
  slotId: SaveSlotId;
  savedAt: string;
  label: string;
  profile: ProfileData;
  unlockedHeroIds: string[];
}

export type SlotStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const isSlotId = (id: unknown): id is SaveSlotId => SAVE_SLOT_IDS.includes(id as SaveSlotId);

export function createEnvelope(slotId: SaveSlotId, profile: ProfileData, unlockedHeroIds: readonly string[], now = new Date()): SaveEnvelope {
  const clean = normalizeProfile(profile);
  return {
    version: SAVE_ENVELOPE_VERSION,
    slotId,
    savedAt: now.toISOString(),
    label: clean.lastPlayedTitle || (clean.completedStoryMissionIds.length ? `${clean.completedStoryMissionIds.length} missions cleared` : "New adventure"),
    profile: clean,
    unlockedHeroIds: [...unlockedHeroIds],
  };
}

/**
 * Accepts a current envelope, a v1 shape (a bare profile without `version`) or garbage.
 * Returns null when nothing usable can be recovered, so callers never load half a save.
 */
export function migrateEnvelope(raw: unknown, slotId: SaveSlotId): SaveEnvelope | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const looksV1 = o.version === undefined && ("totalScore" in o || "completedStoryMissionIds" in o);
  const profileRaw = looksV1 ? o : o.profile;
  if (!profileRaw || typeof profileRaw !== "object") return null;
  const savedAt = typeof o.savedAt === "string" && !Number.isNaN(Date.parse(o.savedAt)) ? o.savedAt : new Date(0).toISOString();
  const heroes = Array.isArray(o.unlockedHeroIds) ? o.unlockedHeroIds.filter((x): x is string => typeof x === "string") : [];
  const env = createEnvelope(slotId, profileRaw as ProfileData, heroes, new Date(savedAt));
  if (typeof o.label === "string" && o.label.trim()) env.label = o.label.slice(0, 80);
  return env;
}

const defaultStorage = (): SlotStorage | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

export function writeSlot(env: SaveEnvelope, storage: SlotStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(PREFIX + env.slotId, JSON.stringify(env));
    return true;
  } catch {
    return false; // quota or private mode
  }
}

export function readSlot(slotId: SaveSlotId, storage: SlotStorage | null = defaultStorage()): SaveEnvelope | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(PREFIX + slotId);
    return raw ? migrateEnvelope(JSON.parse(raw), slotId) : null;
  } catch {
    return null;
  }
}

export function listSlots(storage: SlotStorage | null = defaultStorage()): Record<SaveSlotId, SaveEnvelope | null> {
  return Object.fromEntries(SAVE_SLOT_IDS.map((id) => [id, readSlot(id, storage)])) as Record<SaveSlotId, SaveEnvelope | null>;
}

export function deleteSlot(slotId: SaveSlotId, storage: SlotStorage | null = defaultStorage()): void {
  try {
    storage?.removeItem(PREFIX + slotId);
  } catch {
    // ignore
  }
}

export const exportEnvelope = (env: SaveEnvelope): string => JSON.stringify(env, null, 2);

/** Parses exported JSON into an envelope for `targetSlot`; null if it is not a recognizable save. */
export function importEnvelope(json: string, targetSlot: SaveSlotId): SaveEnvelope | null {
  try {
    return migrateEnvelope(JSON.parse(json), targetSlot);
  } catch {
    return null;
  }
}
