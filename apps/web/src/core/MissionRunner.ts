/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING - MISSION RUNNER
 * General logic that reads SaveManager snapshots to rebuild match state
 * The Archive remembers. The Source rebuilds.
 */

import { saveManager, SaveData } from '../systems/SaveManager';
import { bus } from './EventBus';

export interface MissionState {
    chapterId: string;
    checkpoint: string;
    playerHealth: number;
    playerResonance: number;
    playerPosition: { x: number; y: number };
    bossHp?: number;
    bossPhase?: number;
    arenaHazards?: any[];
    timestamp: number;
}

export class MissionRunner {
    private currentState: MissionState | null = null;
    private isRunning: boolean = false;

    /**
     * Load mission state from save
     */
    loadMission(): MissionState | null {
        const saveData = saveManager.load();
        if (!saveData) {
            bus.emit('MISSION_LOAD_FAILED', { reason: 'no_save_data' });
            return null;
        }

        this.currentState = {
            chapterId: saveData.chapterId,
            checkpoint: saveData.checkpoint,
            playerHealth: saveData.health,
            playerResonance: saveData.resonance,
            playerPosition: saveData.position || { x: 0, y: 0 },
            timestamp: saveData.timestamp
        };

        bus.emit('MISSION_LOADED', { state: this.currentState });
        return this.currentState;
    }

    /**
     * Start mission
     */
    startMission(chapterId: string, checkpoint: string = 'CP_A') {
        this.currentState = {
            chapterId,
            checkpoint,
            playerHealth: 100,
            playerResonance: 0,
            playerPosition: { x: 0, y: 0 },
            timestamp: Date.now()
        };

        this.isRunning = true;
        bus.emit('MISSION_STARTED', { state: this.currentState });
    }

    /**
     * Update mission state
     */
    updateState(updates: Partial<MissionState>) {
        if (!this.currentState) return;

        this.currentState = {
            ...this.currentState,
            ...updates,
            timestamp: Date.now()
        };

        bus.emit('MISSION_STATE_UPDATED', { state: this.currentState });
    }

    /**
     * Save current mission state
     */
    saveMission() {
        if (!this.currentState) return false;

        const success = saveManager.save(
            this.currentState.chapterId,
            this.currentState.checkpoint,
            this.currentState.playerResonance,
            this.currentState.playerHealth,
            this.currentState.playerPosition
        );

        if (success) {
            bus.emit('MISSION_SAVED', { state: this.currentState });
        } else {
            bus.emit('MISSION_SAVE_FAILED', { state: this.currentState });
        }

        return success;
    }

    /**
     * Get current mission state
     */
    getCurrentState(): MissionState | null {
        return this.currentState;
    }

    /**
     * Check if mission is running
     */
    isMissionRunning(): boolean {
        return this.isRunning;
    }

    /**
     * End mission
     */
    endMission() {
        this.isRunning = false;
        this.saveMission();
        bus.emit('MISSION_ENDED', { state: this.currentState });
    }

    /**
     * Reset mission
     */
    resetMission() {
        this.currentState = null;
        this.isRunning = false;
        bus.emit('MISSION_RESET', {});
    }
}

// Singleton instance
export const missionRunner = new MissionRunner();
