/**
 * THE AETERNA COVENANT - SAVE MANAGER
 * 
 * Memory Slot 1 System. Versioned checkpoints (CP_A through CP_D).
 * All saves go to localStorage with versioning for compatibility.
 */

export interface SaveData {
  chapterId: string;
  checkpoint: string;
  resonance: number;
  timestamp: number;
  version: string;
  playerData?: {
    position: { x: number; y: number };
    health: number;
    inventory: any[];
  };
  flags?: { [key: string]: boolean };
}

export interface CheckpointData extends SaveData {
  playerPosition: { x: number; y: number };
  playerHealth: number;
  resonance: number;
  inventory: any[];
  flags: { [key: string]: boolean };
}

const SAVE_SLOT_KEY = 'AETERNA_SLOT_1';
const CURRENT_VERSION = '1.0.0';

export class SaveManager {
  /**
   * Save chapter progress to slot 1
   */
  save(chapterId: string, resonance: number, additionalData?: Partial<SaveData>): boolean {
    try {
      const saveData: SaveData = {
        chapterId,
        checkpoint: additionalData?.checkpoint || 'CP_A',
        resonance,
        timestamp: Date.now(),
        version: CURRENT_VERSION,
        ...additionalData
      };

      localStorage.setItem(SAVE_SLOT_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  /**
   * Load save from slot 1
   */
  load(): SaveData | null {
    try {
      const data = localStorage.getItem(SAVE_SLOT_KEY);
      if (!data) return null;

      const saveData: SaveData = JSON.parse(data);
      
      // Version check (could migrate old saves here)
      if (saveData.version !== CURRENT_VERSION) {
        console.warn(`Save version mismatch: ${saveData.version} vs ${CURRENT_VERSION}`);
      }

      return saveData;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  /**
   * Save checkpoint (CP_A, CP_B, CP_C, CP_D)
   */
  saveCheckpoint(chapterId: string, checkpointId: string, checkpointData: CheckpointData): boolean {
    try {
      const checkpointKey = `${SAVE_SLOT_KEY}_${chapterId}_${checkpointId}`;
      const data: CheckpointData = {
        ...checkpointData,
        chapterId,
        checkpoint: checkpointId,
        timestamp: Date.now(),
        version: CURRENT_VERSION
      };

      localStorage.setItem(checkpointKey, JSON.stringify(data));
      
      // Also update main save slot
      this.save(chapterId, checkpointData.resonance, {
        checkpoint: checkpointId,
        playerData: {
          position: checkpointData.playerPosition,
          health: checkpointData.playerHealth,
          inventory: checkpointData.inventory || []
        },
        flags: checkpointData.flags || {}
      });

      return true;
    } catch (error) {
      console.error('Checkpoint save failed:', error);
      return false;
    }
  }

  /**
   * Load checkpoint
   */
  loadCheckpoint(chapterId: string, checkpointId: string): CheckpointData | null {
    try {
      const checkpointKey = `${SAVE_SLOT_KEY}_${chapterId}_${checkpointId}`;
      const data = localStorage.getItem(checkpointKey);
      
      if (!data) return null;

      const checkpointData: CheckpointData = JSON.parse(data);
      return checkpointData;
    } catch (error) {
      console.error('Checkpoint load failed:', error);
      return null;
    }
  }

  /**
   * Save chapter progress (for chapter completion)
   */
  saveChapterProgress(chapterId: string, resonance: number): boolean {
    return this.save(chapterId, resonance);
  }

  /**
   * Delete save slot
   */
  deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_SLOT_KEY);
      
      // Also clear all checkpoints for this slot
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(SAVE_SLOT_KEY + '_')) {
          localStorage.removeItem(key);
        }
      });

      return true;
    } catch (error) {
      console.error('Delete save failed:', error);
      return false;
    }
  }

  /**
   * Check if save exists
   */
  hasSave(): boolean {
    return localStorage.getItem(SAVE_SLOT_KEY) !== null;
  }

  /**
   * Get all checkpoints for a chapter
   */
  getCheckpoints(chapterId: string): string[] {
    const checkpoints: string[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(`${SAVE_SLOT_KEY}_${chapterId}_`)) {
        const checkpointId = key.split('_').pop();
        if (checkpointId) {
          checkpoints.push(checkpointId);
        }
      }
    });

    return checkpoints.sort();
  }
}

// Singleton instance
export const saveManager = new SaveManager();
