/**
 * Mission Tracker
 * Authoritative implementation from architecture doctrine
 */

export type MissionState = 'idle' | 'running' | 'won' | 'lost';

export class MissionTracker {
  state: MissionState = 'idle';
  kills = 0;
  bossDefeated = false;
  onWin?: () => void;
  onLose?: () => void;

  start(): void {
    this.state = 'running';
    this.kills = 0;
    this.bossDefeated = false;
    console.log('[MissionTracker] Mission started');
  }

  registerKill(): void {
    this.kills++;
    console.log(`[MissionTracker] Kill registered. Total: ${this.kills}`);
  }

  registerBossDefeated(): void {
    this.bossDefeated = true;
    this.state = 'won';
    console.log('[MissionTracker] Boss defeated - MISSION WIN');
    this.onWin?.();
  }

  registerPlayerDead(): void {
    this.state = 'lost';
    console.log('[MissionTracker] Player defeated - MISSION LOST');
    this.onLose?.();
  }

  isRunning(): boolean {
    return this.state === 'running';
  }

  isComplete(): boolean {
    return this.state === 'won' || this.state === 'lost';
  }

  getStats(): {
    state: MissionState;
    kills: number;
    bossDefeated: boolean;
  } {
    return {
      state: this.state,
      kills: this.kills,
      bossDefeated: this.bossDefeated,
    };
  }
}
