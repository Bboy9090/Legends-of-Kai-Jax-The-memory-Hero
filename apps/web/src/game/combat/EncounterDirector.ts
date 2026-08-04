/**
 * KJ-007F: Encounter Director for Mission 1
 * Sequentially manages waves, boss phase transition, and mission completion save hook.
 */

import {
  EnemyContract,
  EnemyStateMachine,
  Position3D,
  createMemoryWisp,
  createRiftDrone,
  createCorruptionBrute,
  createVoidStalker,
  createVoidStalkerPrime,
} from './EnemyStateMachine';

export type MissionWave =
  | 'WAVE_1'
  | 'WAVE_2'
  | 'WAVE_3'
  | 'WAVE_4'
  | 'ELITE'
  | 'BOSS'
  | 'VICTORY';

export interface MissionSaveState {
  missionId: string;
  completed: boolean;
  completedAt?: string;
}

export class EncounterDirector {
  private currentWave: MissionWave = 'WAVE_1';
  private enemies: EnemyStateMachine[] = [];
  private isPaused: boolean = false;
  private isCompleted: boolean = false;
  private saveState: MissionSaveState = { missionId: 'MISSION_1', completed: false };

  constructor() {
    this.startWave('WAVE_1');
  }

  public getCurrentWave(): MissionWave {
    return this.currentWave;
  }

  public getEnemies(): EnemyContract[] {
    return this.enemies.map((e) => e.getEntity());
  }

  public isMissionCompleted(): boolean {
    return this.isCompleted;
  }

  public getSaveState(): MissionSaveState {
    return this.saveState;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public restart(): void {
    this.isPaused = false;
    this.isCompleted = false;
    this.saveState = { missionId: 'MISSION_1', completed: false };
    this.startWave('WAVE_1');
  }

  public update(deltaMs: number, playerPosition: Position3D, isPlayerDodging: boolean = false): void {
    if (this.isPaused || this.isCompleted) return;

    let activeEnemiesCount = 0;

    this.enemies.forEach((enemyMachine) => {
      const entity = enemyMachine.getEntity();
      if (!entity.isDead) {
        enemyMachine.update(deltaMs, playerPosition, isPlayerDodging);
        if (!entity.isDead) {
          activeEnemiesCount++;
        }
      }
    });

    // Wave advancement check
    if (activeEnemiesCount === 0) {
      this.advanceWave();
    }
  }

  public applyDamageToEnemy(enemyId: string, damage: number, isHeavyAttack: boolean = false) {
    const target = this.enemies.find((e) => e.getEntity().id === enemyId);
    if (target) {
      return target.applySingleHitDamage(damage, isHeavyAttack);
    }
    return null;
  }

  private advanceWave() {
    switch (this.currentWave) {
      case 'WAVE_1':
        this.startWave('WAVE_2');
        break;
      case 'WAVE_2':
        this.startWave('WAVE_3');
        break;
      case 'WAVE_3':
        this.startWave('WAVE_4');
        break;
      case 'WAVE_4':
        this.startWave('ELITE');
        break;
      case 'ELITE':
        this.startWave('BOSS');
        break;
      case 'BOSS':
        this.currentWave = 'VICTORY';
        this.isCompleted = true;
        this.saveState = {
          missionId: 'MISSION_1',
          completed: true,
          completedAt: new Date().toISOString(),
        };
        break;
      case 'VICTORY':
        break;
    }
  }

  private startWave(wave: MissionWave) {
    this.currentWave = wave;
    this.enemies = [];

    switch (wave) {
      case 'WAVE_1':
        // 2 Memory Wisps
        this.enemies.push(
          new EnemyStateMachine(createMemoryWisp('wisp-1', { x: 5, y: 0, z: 0 })),
          new EnemyStateMachine(createMemoryWisp('wisp-2', { x: -5, y: 0, z: 0 }))
        );
        break;

      case 'WAVE_2':
        // 1 Memory Wisp + 1 Rift Drone
        this.enemies.push(
          new EnemyStateMachine(createMemoryWisp('wisp-3', { x: 4, y: 0, z: 2 })),
          new EnemyStateMachine(createRiftDrone('drone-1', { x: 8, y: 0, z: -4 }))
        );
        break;

      case 'WAVE_3':
        // 1 Corruption Brute
        this.enemies.push(
          new EnemyStateMachine(createCorruptionBrute('brute-1', { x: 6, y: 0, z: 0 }))
        );
        break;

      case 'WAVE_4':
        // 1 Rift Drone + 1 Corruption Brute
        this.enemies.push(
          new EnemyStateMachine(createRiftDrone('drone-2', { x: 9, y: 0, z: 3 })),
          new EnemyStateMachine(createCorruptionBrute('brute-2', { x: 5, y: 0, z: -2 }))
        );
        break;

      case 'ELITE':
        // 1 Void Stalker
        this.enemies.push(
          new EnemyStateMachine(createVoidStalker('stalker-1', { x: 7, y: 0, z: 0 }))
        );
        break;

      case 'BOSS':
        // Void Stalker Prime
        this.enemies.push(
          new EnemyStateMachine(createVoidStalkerPrime('boss-1', { x: 10, y: 0, z: 0 }))
        );
        break;

      case 'VICTORY':
        break;
    }
  }
}
