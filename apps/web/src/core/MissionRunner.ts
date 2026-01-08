/**
 * THE AETERNA COVENANT - MISSION RUNNER
 * 
 * The general logic that reads SaveManager snapshots to rebuild match state.
 * Handles chapter progression, checkpoint loading, and state restoration.
 */

import { bus } from './EventBus';
import { Events } from './EventBus';
import { SaveManager } from '../systems/SaveManager';

export interface MissionState {
  chapterId: string;
  checkpoint: string;
  playerPosition: { x: number; y: number };
  playerHealth: number;
  resonance: number;
  inventory: any[];
  flags: { [key: string]: boolean };
  timestamp: number;
}

export class MissionRunner {
  private saveManager: SaveManager;
  private currentState: MissionState | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.saveManager = new SaveManager();
  }

  /**
   * Start a mission/chapter
   */
  startMission(chapterId: string, checkpoint?: string): boolean {
    // Load saved state if checkpoint provided
    if (checkpoint) {
      const saved = this.saveManager.loadCheckpoint(chapterId, checkpoint);
      if (saved) {
        this.currentState = saved;
        this.restoreState(saved);
        bus.emit(Events.CHAPTER_START, { chapterId, checkpoint, restored: true });
        return true;
      }
    }

    // Start fresh mission
    this.currentState = {
      chapterId,
      checkpoint: checkpoint || 'CP_A',
      playerPosition: { x: 0, y: 0 },
      playerHealth: 100,
      resonance: 0,
      inventory: [],
      flags: {},
      timestamp: Date.now()
    };

    this.isRunning = true;
    bus.emit(Events.CHAPTER_START, { chapterId, checkpoint: this.currentState.checkpoint, restored: false });
    return true;
  }

  /**
   * Save current mission state to checkpoint
   */
  saveCheckpoint(checkpointId: string): boolean {
    if (!this.currentState || !this.isRunning) {
      return false;
    }

    this.currentState.checkpoint = checkpointId;
    this.currentState.timestamp = Date.now();

    const saved = this.saveManager.saveCheckpoint(
      this.currentState.chapterId,
      checkpointId,
      this.currentState
    );

    if (saved) {
      bus.emit(Events.CHECKPOINT_REACHED, { 
        chapterId: this.currentState.chapterId,
        checkpoint: checkpointId 
      });
      return true;
    }

    return false;
  }

  /**
   * Load checkpoint
   */
  loadCheckpoint(chapterId: string, checkpointId: string): boolean {
    const saved = this.saveManager.loadCheckpoint(chapterId, checkpointId);
    if (saved) {
      this.currentState = saved;
      this.restoreState(saved);
      bus.emit(Events.LOAD_CHECKPOINT, { chapterId, checkpoint: checkpointId });
      return true;
    }
    return false;
  }

  /**
   * Restore game state from snapshot
   */
  private restoreState(state: MissionState): void {
    // Emit events to restore all systems
    bus.emit(Events.UI_UPDATE_HP, state.playerHealth);
    bus.emit(Events.UI_UPDATE_RESONANCE, state.resonance);
    
    // Restore player position (would need player entity reference)
    // This would be handled by the game's entity system
    
    // Restore flags
    for (const [key, value] of Object.entries(state.flags)) {
      bus.emit('FLAG_RESTORE', { key, value });
    }

    this.isRunning = true;
  }

  /**
   * Update mission state (call every frame)
   */
  update(playerPosition: { x: number; y: number }, playerHealth: number, resonance: number): void {
    if (!this.currentState || !this.isRunning) return;

    this.currentState.playerPosition = playerPosition;
    this.currentState.playerHealth = playerHealth;
    this.currentState.resonance = resonance;
  }

  /**
   * Complete current chapter
   */
  completeChapter(): void {
    if (!this.currentState) return;

    bus.emit(Events.CHAPTER_COMPLETE, {
      chapterId: this.currentState.chapterId,
      checkpoint: this.currentState.checkpoint
    });

    // Auto-save completion
    this.saveManager.saveChapterProgress(
      this.currentState.chapterId,
      this.currentState.resonance
    );

    this.isRunning = false;
  }

  /**
   * Set mission flag
   */
  setFlag(key: string, value: boolean): void {
    if (this.currentState) {
      this.currentState.flags[key] = value;
    }
  }

  /**
   * Get mission flag
   */
  getFlag(key: string): boolean {
    return this.currentState?.flags[key] || false;
  }

  /**
   * Get current mission state
   */
  getCurrentState(): MissionState | null {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * Check if mission is running
   */
  isMissionRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Reset mission runner
   */
  reset(): void {
    this.currentState = null;
    this.isRunning = false;
  }
}

// Singleton instance
export const missionRunner = new MissionRunner();
