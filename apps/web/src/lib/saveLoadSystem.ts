/**
 * Save/Load Persistence System v2
 * Handles game state serialization, multiple save slots, auto-save, and cloud sync
 */

import type { CharacterProgression } from './levelProgressionSystem';
import type { Quest } from './questSystem';

export interface GameSaveFile {
  id: string;
  slot: number;
  characterId: string;
  missionId: string;
  progress: CharacterProgression;
  quests: Quest[];
  gameState: {
    currentScene: string;
    playerPosition: [number, number, number];
    enemiesDefeated: string[];
    itemsCollected: string[];
    checkpointsReached: string[];
  };
  timestamp: number;
  playTimeSeconds: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'legendary';
  version: number;
  encrypted?: boolean;
}

export interface SaveSlot {
  slot: number;
  hasData: boolean;
  characterName?: string;
  missionName?: string;
  playTime?: number;
  lastModified?: number;
  corrupted?: boolean;
}

export interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  maxAutoSaves: number;
  backupOnMissionComplete: boolean;
}

// Save file schema version
const SAVE_FILE_VERSION = 2;
const STORAGE_KEY_PREFIX = 'kai-jax-save-';
const AUTO_SAVE_PREFIX = 'kai-jax-autosave-';
const MAX_SAVE_SLOTS = 10;

/**
 * Create a new save file
 */
export function createSaveFile(
  slot: number,
  characterId: string,
  missionId: string,
  progress: CharacterProgression,
  quests: Quest[],
  gameState: GameSaveFile['gameState'],
  playTimeSeconds: number,
  difficulty: 'easy' | 'normal' | 'hard' | 'legendary'
): GameSaveFile {
  return {
    id: `save-${slot}-${Date.now()}`,
    slot,
    characterId,
    missionId,
    progress,
    quests,
    gameState,
    timestamp: Date.now(),
    playTimeSeconds,
    difficulty,
    version: SAVE_FILE_VERSION,
  };
}

/**
 * Save game to a slot
 */
export async function saveToSlot(saveFile: GameSaveFile): Promise<boolean> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${saveFile.slot}`;
    const serialized = JSON.stringify(saveFile);

    // Store in localStorage
    localStorage.setItem(key, serialized);

    // Also backup to IndexedDB
    await saveToIndexedDB(saveFile);

    console.log(`Game saved to slot ${saveFile.slot}`);
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}

/**
 * Load game from a slot
 */
export async function loadFromSlot(slot: number): Promise<GameSaveFile | null> {
  const key = `${STORAGE_KEY_PREFIX}${slot}`;

  try {
    const serialized = localStorage.getItem(key);

    if (serialized) {
      try {
        const parsed: GameSaveFile = JSON.parse(serialized);
        if (validateSaveFile(parsed)) {
          const migrated = migrateSaveFile(parsed);
          console.log(`Loaded game from slot ${slot}`);
          return migrated;
        }
        console.warn(`Primary save failed validation in slot ${slot}; attempting backup recovery`);
      } catch (error) {
        console.warn(`Primary save could not be parsed in slot ${slot}; attempting backup recovery`, error);
      }
    } else {
      console.log(`No primary save found in slot ${slot}; checking backup`);
    }

    const backup = await loadFromIndexedDB(slot);
    if (!backup || !validateSaveFile(backup)) {
      return null;
    }

    const recovered = migrateSaveFile(backup);

    // Heal the primary copy so the next load does not depend on recovery.
    try {
      localStorage.setItem(key, JSON.stringify(recovered));
    } catch (error) {
      console.warn(`Recovered slot ${slot}, but could not heal localStorage copy`, error);
    }

    console.warn(`Recovered save slot ${slot} from IndexedDB backup`);
    return recovered;
  } catch (error) {
    console.error('Load failed:', error);
    return null;
  }
}

/**
 * Get all save slots with metadata
 */
export function getSaveSlots(): SaveSlot[] {
  const slots: SaveSlot[] = [];

  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const key = `${STORAGE_KEY_PREFIX}${i}`;
    const serialized = localStorage.getItem(key);

    if (serialized) {
      try {
        const saveFile: GameSaveFile = JSON.parse(serialized);
        slots.push({
          slot: i,
          hasData: true,
          characterName: saveFile.characterId,
          missionName: saveFile.missionId,
          playTime: saveFile.playTimeSeconds,
          lastModified: saveFile.timestamp,
          corrupted: !validateSaveFile(saveFile),
        });
      } catch {
        slots.push({
          slot: i,
          hasData: false,
          corrupted: true,
        });
      }
    } else {
      slots.push({
        slot: i,
        hasData: false,
      });
    }
  }

  return slots;
}

/**
 * Delete save from slot
 */
export async function deleteSaveSlot(slot: number): Promise<boolean> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${slot}`;
    localStorage.removeItem(key);

    // Also remove from IndexedDB
    await deleteFromIndexedDB(slot);

    console.log(`Save slot ${slot} deleted`);
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}

/**
 * Create auto-save
 */
export async function createAutoSave(saveFile: GameSaveFile): Promise<boolean> {
  try {
    const key = `${AUTO_SAVE_PREFIX}${saveFile.characterId}`;
    const serialized = JSON.stringify(saveFile);
    localStorage.setItem(key, serialized);

    // Mirror the latest autosave into IndexedDB so recovery survives a
    // damaged or missing localStorage entry.
    await saveAutoSaveToIndexedDB(saveFile);

    // Clean up old auto-saves
    await pruneAutoSaves(saveFile.characterId);

    console.log(`Auto-save created for ${saveFile.characterId}`);
    return true;
  } catch (error) {
    console.error('Auto-save failed:', error);
    return false;
  }
}

/**
 * Load latest auto-save for a character
 */
export async function loadAutoSave(characterId: string): Promise<GameSaveFile | null> {
  try {
    const key = `${AUTO_SAVE_PREFIX}${characterId}`;
    const serialized = localStorage.getItem(key);

    if (serialized) {
      try {
        const saveFile: GameSaveFile = JSON.parse(serialized);
        if (validateSaveFile(saveFile)) return migrateSaveFile(saveFile);
      } catch (error) {
        console.warn('Primary auto-save could not be parsed; checking backup', error);
      }
    }

    const backup = await loadAutoSaveFromIndexedDB(characterId);
    return backup && validateSaveFile(backup) ? migrateSaveFile(backup) : null;
  } catch (error) {
    console.error('Load auto-save failed:', error);
    return null;
  }
}

/**
 * Validate save file integrity
 */
function validateSaveFile(saveFile: GameSaveFile): boolean {
  if (!saveFile.id || !saveFile.characterId || !saveFile.missionId) {
    return false;
  }

  if (saveFile.version !== SAVE_FILE_VERSION) {
    console.warn(`Save file version mismatch: ${saveFile.version} vs ${SAVE_FILE_VERSION}`);
    // Could migrate old save files here
  }

  if (!saveFile.progress || !saveFile.gameState) {
    return false;
  }

  return true;
}

/**
 * Migrate save file to new version if needed
 */
export function migrateSaveFile(saveFile: GameSaveFile): GameSaveFile {
  if (saveFile.version === SAVE_FILE_VERSION) {
    return saveFile;
  }

  // Migration logic for different versions
  const migrated = { ...saveFile, version: SAVE_FILE_VERSION };

  // Add any version-specific migrations here
  if (saveFile.version < 2) {
    // Example: migrate old progress format
    console.log('Migrating save file from v1 to v2');
  }

  return migrated;
}

/**
 * Export save file as JSON (for backup/sharing)
 */
export function exportSaveFile(saveFile: GameSaveFile): string {
  return JSON.stringify(saveFile, null, 2);
}

/**
 * Import save file from JSON
 */
export function importSaveFile(json: string): GameSaveFile | null {
  try {
    const saveFile: GameSaveFile = JSON.parse(json);
    if (validateSaveFile(saveFile)) {
      return migrateSaveFile(saveFile);
    }
    return null;
  } catch (error) {
    console.error('Import failed:', error);
    return null;
  }
}

/**
 * Helper: Save to IndexedDB for backup
 */
async function saveToIndexedDB(saveFile: GameSaveFile): Promise<void> {
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('saves', 'readwrite');
    const store = transaction.objectStore('saves');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(saveFile);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  } catch (error) {
    console.warn('IndexedDB backup failed:', error);
  }
}

/**
 * Helper: Load slot backup from IndexedDB
 */
async function loadFromIndexedDB(slot: number): Promise<GameSaveFile | null> {
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('saves', 'readonly');
    const store = transaction.objectStore('saves');

    return await new Promise<GameSaveFile | null>((resolve, reject) => {
      const request = store.get(slot);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB recovery read failed:', error);
    return null;
  }
}

/**
 * Helper: Mirror auto-save into IndexedDB
 */
async function saveAutoSaveToIndexedDB(saveFile: GameSaveFile): Promise<void> {
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('autoSaves', 'readwrite');
    const store = transaction.objectStore('autoSaves');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(saveFile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB auto-save backup failed:', error);
  }
}

/**
 * Helper: Load latest auto-save for a character from IndexedDB
 */
async function loadAutoSaveFromIndexedDB(characterId: string): Promise<GameSaveFile | null> {
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('autoSaves', 'readonly');
    const store = transaction.objectStore('autoSaves');

    const allSaves = await new Promise<GameSaveFile[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error);
    });

    return allSaves
      .filter((save) => save.characterId === characterId)
      .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
  } catch (error) {
    console.warn('IndexedDB auto-save recovery failed:', error);
    return null;
  }
}

/**
 * Helper: Delete from IndexedDB
 */
async function deleteFromIndexedDB(slot: number): Promise<void> {
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('saves', 'readwrite');
    const store = transaction.objectStore('saves');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(slot);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  } catch (error) {
    console.warn('IndexedDB delete failed:', error);
  }
}

/**
 * Helper: Prune old auto-saves
 */
async function pruneAutoSaves(characterId: string, maxCount: number = 3): Promise<void> {
  // Keep only the 3 most recent auto-saves per character
  try {
    const db = await openSaveDB();
    const transaction = db.transaction('autoSaves', 'readwrite');
    const store = transaction.objectStore('autoSaves');

    const allSaves = await new Promise<GameSaveFile[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });

    const characterSaves = allSaves
      .filter((s) => s.characterId === characterId)
      .sort((a, b) => b.timestamp - a.timestamp);

    // Delete older saves
    for (let i = maxCount; i < characterSaves.length; i++) {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(characterSaves[i].slot);
        request.onsuccess = () => resolve();
        request.onerror = reject;
      });
    }
  } catch (error) {
    console.warn('Auto-save pruning failed:', error);
  }
}

/**
 * Helper: Open save database
 */
function openSaveDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kai-jax-saves', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('saves')) {
        db.createObjectStore('saves', { keyPath: 'slot' });
      }

      if (!db.objectStoreNames.contains('autoSaves')) {
        db.createObjectStore('autoSaves', { keyPath: 'slot' });
      }
    };
  });
}

/**
 * Get estimated save size
 */
export function estimateSaveSize(saveFile: GameSaveFile): number {
  const json = JSON.stringify(saveFile);
  return new Blob([json]).size;
}

/**
 * Get total save data usage
 */
export function getTotalSaveUsage(): number {
  let total = 0;

  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const key = `${STORAGE_KEY_PREFIX}${i}`;
    const serialized = localStorage.getItem(key);
    if (serialized) {
      total += new Blob([serialized]).size;
    }
  }

  return total;
}
