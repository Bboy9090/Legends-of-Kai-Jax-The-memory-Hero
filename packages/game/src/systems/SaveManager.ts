
/**
 * SAVE MANAGER — Persistent Storage System
 * 
 * Purpose: Handle save/load for Genesis (Books 1-3)
 * Storage: localStorage with versioned schema
 * 
 * Save Structure:
 * - Slot 1-3: Manual saves
 * - Auto-save: After each chapter
 * - Checkpoints: A, B, C, D per chapter
 */

import { eventBus } from '../core/EventBus';

export interface SaveData {
  version: string; // Schema version (e.g., "1.0.0")
  timestamp: number;
  slotNumber: number;
  
  // Saga Progress
  currentBook: number; // 1-3
  currentChapter: number; // 1-18
  completedChapters: string[]; // ["1-1", "1-2", ...]
  
  // Character Unlocks
  unlockedCharacters: string[]; // ["kai-jax", "boryx-zenith", ...]
  
  // Stats
  totalPlayTime: number; // seconds
  totalMatches: number;
  totalWins: number;
  highestDreadLevel: number;
  
  // Settings
  settings: {
    volume: number;
    musicVolume: number;
    sfxVolume: number;
    screenShakeEnabled: boolean;
    dreadEffectsEnabled: boolean;
  };
}

export interface Checkpoint {
  chapterId: string;
  checkpointId: 'A' | 'B' | 'C' | 'D';
  timestamp: number;
  playerState: {
    hp: number;
    resonance: number;
  };
}

class SaveManager {
  private static instance: SaveManager;
  private readonly SAVE_KEY_PREFIX = 'AETERNA_GENESIS_SAVE_';
  private readonly AUTOSAVE_KEY = 'AETERNA_GENESIS_AUTOSAVE';
  private readonly CHECKPOINT_KEY_PREFIX = 'AETERNA_GENESIS_CP_';
  private readonly CURRENT_VERSION = '1.0.0';

  private constructor() {
    // Check for legacy saves and migrate if needed
    this.migrateLegacySaves();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Save game to a specific slot (1-3)
   */
  public save(slotNumber: 1 | 2 | 3, data: Omit<SaveData, 'version' | 'timestamp' | 'slotNumber'>): boolean {
    try {
      const saveData: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        slotNumber,
        ...data,
      };

      const key = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(saveData));

      console.log(`[SaveManager] Game saved to slot ${slotNumber}`);
      eventBus.emit('save_complete', { 
        slot: slotNumber, 
        chapterId: `${data.currentBook}-${data.currentChapter}` 
      });

      return true;
    } catch (error) {
      console.error(`[SaveManager] Failed to save to slot ${slotNumber}:`, error);
      return false;
    }
  }

  /**
   * Load game from a specific slot
   */
  public load(slotNumber: 1 | 2 | 3): SaveData | null {
    try {
      const key = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
      const data = localStorage.getItem(key);

      if (!data) {
        console.log(`[SaveManager] No save found in slot ${slotNumber}`);
        return null;
      }

      const saveData: SaveData = JSON.parse(data);

      // Validate version
      if (saveData.version !== this.CURRENT_VERSION) {
        console.warn(`[SaveManager] Save version mismatch: ${saveData.version} vs ${this.CURRENT_VERSION}`);
        // Could implement migration logic here
      }

      console.log(`[SaveManager] Game loaded from slot ${slotNumber}`);
      eventBus.emit('load_complete', { slot: slotNumber, data: saveData });

      return saveData;
    } catch (error) {
      console.error(`[SaveManager] Failed to load from slot ${slotNumber}:`, error);
      return null;
    }
  }

  /**
   * Auto-save (overwrites auto-save slot)
   */
  public autoSave(data: Omit<SaveData, 'version' | 'timestamp' | 'slotNumber'>): boolean {
    try {
      const saveData: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        slotNumber: 0, // 0 indicates auto-save
        ...data,
      };

      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(saveData));
      console.log(`[SaveManager] Auto-save complete`);
      return true;
    } catch (error) {
      console.error(`[SaveManager] Auto-save failed:`, error);
      return false;
    }
  }

  /**
   * Load auto-save
   */
  public loadAutoSave(): SaveData | null {
    try {
      const data = localStorage.getItem(this.AUTOSAVE_KEY);
      if (!data) return null;

      const saveData: SaveData = JSON.parse(data);
      console.log(`[SaveManager] Auto-save loaded`);
      return saveData;
    } catch (error) {
      console.error(`[SaveManager] Failed to load auto-save:`, error);
      return null;
    }
  }

  /**
   * Save checkpoint within a chapter
   */
  public saveCheckpoint(
    chapterId: string,
    checkpointId: 'A' | 'B' | 'C' | 'D',
    playerState: Checkpoint['playerState']
  ): boolean {
    try {
      const checkpoint: Checkpoint = {
        chapterId,
        checkpointId,
        timestamp: Date.now(),
        playerState,
      };

      const key = `${this.CHECKPOINT_KEY_PREFIX}${chapterId}_${checkpointId}`;
      localStorage.setItem(key, JSON.stringify(checkpoint));

      console.log(`[SaveManager] Checkpoint ${checkpointId} saved for chapter ${chapterId}`);
      return true;
    } catch (error) {
      console.error(`[SaveManager] Failed to save checkpoint:`, error);
      return false;
    }
  }

  /**
   * Load checkpoint
   */
  public loadCheckpoint(chapterId: string, checkpointId: 'A' | 'B' | 'C' | 'D'): Checkpoint | null {
    try {
      const key = `${this.CHECKPOINT_KEY_PREFIX}${chapterId}_${checkpointId}`;
      const data = localStorage.getItem(key);

      if (!data) return null;

      const checkpoint: Checkpoint = JSON.parse(data);
      console.log(`[SaveManager] Checkpoint ${checkpointId} loaded for chapter ${chapterId}`);
      return checkpoint;
    } catch (error) {
      console.error(`[SaveManager] Failed to load checkpoint:`, error);
      return null;
    }
  }

  /**
   * Delete save from slot
   */
  public deleteSave(slotNumber: 1 | 2 | 3): boolean {
    try {
      const key = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
      localStorage.removeItem(key);
      console.log(`[SaveManager] Save slot ${slotNumber} deleted`);
      return true;
    } catch (error) {
      console.error(`[SaveManager] Failed to delete save slot ${slotNumber}:`, error);
      return false;
    }
  }

  /**
   * Check if save exists in slot
   */
  public hasSave(slotNumber: 1 | 2 | 3): boolean {
    const key = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all save slot info (for save/load UI)
   */
  public getAllSaveInfo(): Array<{ slot: number; exists: boolean; data: SaveData | null }> {
    return [1, 2, 3].map(slot => ({
      slot,
      exists: this.hasSave(slot as 1 | 2 | 3),
      data: this.load(slot as 1 | 2 | 3),
    }));
  }

  /**
   * Get storage usage info
   */
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (key.startsWith('AETERNA_GENESIS_')) {
          totalSize += (localStorage[key].length + key.length) * 2; // UTF-16 = 2 bytes per char
        }
      }

      const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (totalSize / available) * 100;

      return {
        used: totalSize,
        available,
        percentage,
      };
    } catch (error) {
      console.error('[SaveManager] Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clear all saves (use with caution!)
   */
  public clearAllSaves(): boolean {
    try {
      for (let i = 1; i <= 3; i++) {
        this.deleteSave(i as 1 | 2 | 3);
      }
      localStorage.removeItem(this.AUTOSAVE_KEY);
      
      // Clear checkpoints
      for (let key in localStorage) {
        if (key.startsWith(this.CHECKPOINT_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }

      console.log('[SaveManager] All saves cleared');
      return true;
    } catch (error) {
      console.error('[SaveManager] Failed to clear saves:', error);
      return false;
    }
  }

  /**
   * Migrate legacy saves (if switching schema versions)
   */
  private migrateLegacySaves(): void {
    // Check for old save format and convert if needed
    const oldSaveKey = 'AETERNA_SAVE_SLOT_1';
    const oldData = localStorage.getItem(oldSaveKey);

    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        // Convert old format to new format
        console.log('[SaveManager] Migrating legacy save...');
        // Migration logic here...
        localStorage.removeItem(oldSaveKey);
      } catch (error) {
        console.error('[SaveManager] Failed to migrate legacy save:', error);
      }
    }
  }

  /**
   * Export save to JSON file (for backup/transfer)
   */
  public exportSave(slotNumber: 1 | 2 | 3): string | null {
    const data = this.load(slotNumber);
    if (!data) return null;

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import save from JSON string
   */
  public importSave(slotNumber: 1 | 2 | 3, jsonString: string): boolean {
    try {
      const data: SaveData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!data.version || !data.currentBook || !data.currentChapter) {
        throw new Error('Invalid save data format');
      }

      // Save to slot
      data.slotNumber = slotNumber;
      const key = `${this.SAVE_KEY_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(data));

      console.log(`[SaveManager] Save imported to slot ${slotNumber}`);
      return true;
    } catch (error) {
      console.error('[SaveManager] Failed to import save:', error);
      return false;
    }
  }
}

// Export singleton instance
export const saveManager = SaveManager.getInstance();
