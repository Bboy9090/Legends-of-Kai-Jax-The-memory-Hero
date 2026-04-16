/**
 * Mission Orchestrator
 * Complete mission slice implementation per architecture doctrine
 */

import { MissionTracker } from './MissionTracker';
import { WaveDirector } from './WaveDirector';
import type { MissionSchema } from './MissionSchema';

export class MissionOrchestrator {
  private tracker: MissionTracker;
  private waveDirector: WaveDirector;
  private schema: MissionSchema;
  private currentWaveIndex = 0;
  private bossSpawned = false;
  private updateLoopId: number | null = null;

  constructor(scene: any, schema: MissionSchema) {
    this.schema = schema;
    this.tracker = new MissionTracker();
    this.waveDirector = new WaveDirector(scene, this.tracker);

    // Register callbacks
    this.tracker.onWin = () => this.handleWin();
    this.tracker.onLose = () => this.handleLose();
  }

  /**
   * Start mission
   */
  start(): void {
    console.log(`\n=== MISSION START: ${this.schema.name} ===`);
    this.tracker.start();
    this.currentWaveIndex = 0;
    this.bossSpawned = false;

    // Spawn first wave immediately
    this.spawnNextWave();

    // Start update loop
    this.startUpdateLoop();
  }

  /**
   * Spawn next wave
   */
  private spawnNextWave(): void {
    if (this.currentWaveIndex >= this.schema.waves.length) {
      console.log('[Mission] All waves spawned, waiting for boss trigger');
      return;
    }

    const wave = this.schema.waves[this.currentWaveIndex];
    console.log(`\n[Mission] Spawning Wave ${this.currentWaveIndex + 1}`);

    setTimeout(() => {
      this.waveDirector.spawnWave(wave.enemies);
      this.currentWaveIndex++;
    }, wave.delay * 1000);
  }

  /**
   * Check if ready to spawn boss
   */
  private checkBossSpawn(): void {
    if (this.bossSpawned) return;
    if (this.currentWaveIndex < this.schema.waves.length) return;
    if (!this.waveDirector.isWaveCleared()) return;

    console.log('\n[Mission] Waves cleared, spawning boss...');

    setTimeout(() => {
      this.waveDirector.spawnEnemy(this.schema.boss.type, 0, 0);
      this.bossSpawned = true;
      console.log('[Mission] BOSS SPAWNED');
    }, this.schema.boss.delayAfterWaves * 1000);
  }

  /**
   * Update loop
   */
  private startUpdateLoop(): void {
    const update = () => {
      if (!this.tracker.isRunning()) {
        if (this.updateLoopId) {
          clearInterval(this.updateLoopId);
          this.updateLoopId = null;
        }
        return;
      }

      this.waveDirector.update();

      // Check if need to spawn next wave
      if (this.waveDirector.isWaveCleared() && this.currentWaveIndex < this.schema.waves.length) {
        this.spawnNextWave();
      }

      // Check if ready for boss
      this.checkBossSpawn();
    };

    this.updateLoopId = window.setInterval(update, 100);
  }

  /**
   * Handle mission win
   */
  private handleWin(): void {
    console.log(`\n✅ MISSION COMPLETE: ${this.schema.name}`);
    console.log(`Total kills: ${this.tracker.getStats().kills}`);
    this.stop();
  }

  /**
   * Handle mission loss
   */
  private handleLose(): void {
    console.log(`\n❌ MISSION FAILED: ${this.schema.name}`);
    this.stop();
  }

  /**
   * Stop mission
   */
  stop(): void {
    if (this.updateLoopId) {
      clearInterval(this.updateLoopId);
      this.updateLoopId = null;
    }
    console.log('[Mission] Orchestrator stopped');
  }

  /**
   * Get mission status
   */
  getStatus(): {
    missionName: string;
    state: string;
    wave: number;
    totalWaves: number;
    kills: number;
    enemiesActive: number;
    bossSpawned: boolean;
  } {
    return {
      missionName: this.schema.name,
      state: this.tracker.state,
      wave: this.currentWaveIndex,
      totalWaves: this.schema.waves.length,
      kills: this.tracker.kills,
      enemiesActive: this.waveDirector.getEnemyCount(),
      bossSpawned: this.bossSpawned,
    };
  }

  /**
   * Get tracker for external access
   */
  getTracker(): MissionTracker {
    return this.tracker;
  }

  /**
   * Get wave director for external access
   */
  getWaveDirector(): WaveDirector {
    return this.waveDirector;
  }
}
