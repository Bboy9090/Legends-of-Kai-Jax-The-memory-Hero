/**
 * THE AETERNA COVENANT - SAVE MANAGER
 * Memory Slot 1 - Versioned Checkpoints (CP_A through CP_D)
 * The Aeterna remembers. The Source does not forget.
 */

export interface SaveData {
    chapterId: string;
    checkpoint: string; // CP_A, CP_B, CP_C, CP_D
    resonance: number;
    health: number;
    position?: { x: number; y: number };
    inventory?: any[];
    timestamp: number;
    version: string;
}

export class SaveManager {
    private readonly SLOT_KEY = 'AETERNA_SLOT_1';
    private readonly VERSION = '1.0.0';
    private readonly CHECKPOINTS = ['CP_A', 'CP_B', 'CP_C', 'CP_D'];

    /**
     * Save game state to Slot 1
     */
    save(
        chapterId: string,
        checkpoint: string = 'CP_A',
        resonance: number = 0,
        health: number = 100,
        position?: { x: number; y: number },
        inventory?: any[]
    ): boolean {
        try {
            const saveData: SaveData = {
                chapterId,
                checkpoint: this.CHECKPOINTS.includes(checkpoint) ? checkpoint : 'CP_A',
                resonance,
                health,
                position,
                inventory: inventory || [],
                timestamp: Date.now(),
                version: this.VERSION
            };

            localStorage.setItem(this.SLOT_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    /**
     * Load game state from Slot 1
     */
    load(): SaveData | null {
        try {
            const data = localStorage.getItem(this.SLOT_KEY);
            if (!data) return null;

            const saveData: SaveData = JSON.parse(data);
            
            // Version check - migrate if needed
            if (saveData.version !== this.VERSION) {
                console.warn('Save version mismatch, attempting migration...');
                return this.migrateSave(saveData);
            }

            return saveData;
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    }

    /**
     * Migrate old save format to current version
     */
    private migrateSave(oldData: any): SaveData {
        // Migration logic for future versions
        return {
            chapterId: oldData.chapterId || 'chapter_1',
            checkpoint: oldData.checkpoint || 'CP_A',
            resonance: oldData.resonance || 0,
            health: oldData.health || 100,
            position: oldData.position,
            inventory: oldData.inventory || [],
            timestamp: oldData.timestamp || Date.now(),
            version: this.VERSION
        };
    }

    /**
     * Check if save exists
     */
    hasSave(): boolean {
        return localStorage.getItem(this.SLOT_KEY) !== null;
    }

    /**
     * Delete save data
     */
    deleteSave(): boolean {
        try {
            localStorage.removeItem(this.SLOT_KEY);
            return true;
        } catch (error) {
            console.error('Delete save failed:', error);
            return false;
        }
    }

    /**
     * Get save metadata without loading full data
     */
    getSaveInfo(): { exists: boolean; timestamp?: number; chapterId?: string; checkpoint?: string } | null {
        const data = this.load();
        if (!data) return { exists: false };

        return {
            exists: true,
            timestamp: data.timestamp,
            chapterId: data.chapterId,
            checkpoint: data.checkpoint
        };
    }

    /**
     * Update checkpoint only
     */
    updateCheckpoint(checkpoint: string): boolean {
        const current = this.load();
        if (!current) return false;

        return this.save(
            current.chapterId,
            checkpoint,
            current.resonance,
            current.health,
            current.position,
            current.inventory
        );
    }

    /**
     * Update position only
     */
    updatePosition(position: { x: number; y: number }): boolean {
        const current = this.load();
        if (!current) return false;

        return this.save(
            current.chapterId,
            current.checkpoint,
            current.resonance,
            current.health,
            position,
            current.inventory
        );
    }
}

// Singleton instance
export const saveManager = new SaveManager();
