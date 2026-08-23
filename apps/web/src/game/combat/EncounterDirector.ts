/**
 * Mission 1 encounter director.
 *
 * Owns deterministic wave progression and delegates per-enemy combat behavior to
 * EnemyStateMachine. Wave composition is declarative so QA, save validation, and
 * future difficulty variants can inspect the same source of truth.
 */

import {
  type EnemyContract,
  type EnemyDamageResult,
  EnemyStateMachine,
  type Position3D,
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

type EnemyFactory = () => EnemyContract;

const MISSION_ID = 'MISSION_1';
const WAVE_ORDER: readonly MissionWave[] = Object.freeze([
  'WAVE_1',
  'WAVE_2',
  'WAVE_3',
  'WAVE_4',
  'ELITE',
  'BOSS',
  'VICTORY',
]);

const WAVE_FACTORIES: Readonly<Partial<Record<MissionWave, readonly EnemyFactory[]>>> = Object.freeze({
  WAVE_1: [
    () => createMemoryWisp('wisp-1', { x: 5, y: 0, z: 0 }),
    () => createMemoryWisp('wisp-2', { x: -5, y: 0, z: 0 }),
  ],
  WAVE_2: [
    () => createMemoryWisp('wisp-3', { x: 4, y: 0, z: 2 }),
    () => createRiftDrone('drone-1', { x: 8, y: 0, z: -4 }),
  ],
  WAVE_3: [
    () => createCorruptionBrute('brute-1', { x: 6, y: 0, z: 0 }),
  ],
  WAVE_4: [
    () => createRiftDrone('drone-2', { x: 9, y: 0, z: 3 }),
    () => createCorruptionBrute('brute-2', { x: 5, y: 0, z: -2 }),
  ],
  ELITE: [
    () => createVoidStalker('stalker-1', { x: 7, y: 0, z: 0 }),
  ],
  BOSS: [
    () => createVoidStalkerPrime('boss-1', { x: 10, y: 0, z: 0 }),
  ],
});

function safeDeltaMs(deltaMs: number): number {
  return Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
}

function isFinitePosition(position: Position3D): boolean {
  return Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z);
}

export class EncounterDirector {
  private currentWave: MissionWave = 'WAVE_1';
  private enemies: EnemyStateMachine[] = [];
  private isPaused = false;
  private isCompleted = false;
  private saveState: MissionSaveState = { missionId: MISSION_ID, completed: false };

  constructor() {
    this.startWave('WAVE_1');
  }

  public getCurrentWave(): MissionWave {
    return this.currentWave;
  }

  public getEnemies(): EnemyContract[] {
    return this.enemies.map((enemy) => enemy.getEntity());
  }

  public isMissionCompleted(): boolean {
    return this.isCompleted;
  }

  public getSaveState(): MissionSaveState {
    return { ...this.saveState };
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
    this.saveState = { missionId: MISSION_ID, completed: false };
    this.startWave('WAVE_1');
  }

  public update(deltaMs: number, playerPosition: Position3D, isPlayerDodging = false): void {
    if (this.isPaused || this.isCompleted) return;
    if (!isFinitePosition(playerPosition)) return;

    const dt = safeDeltaMs(deltaMs);
    let activeEnemiesCount = 0;

    for (const enemyMachine of this.enemies) {
      const before = enemyMachine.getEntity();
      if (before.isDead) continue;

      enemyMachine.update(dt, playerPosition, isPlayerDodging);

      // Re-read after update. The previous implementation checked a stale snapshot.
      const after = enemyMachine.getEntity();
      if (!after.isDead) activeEnemiesCount++;
    }

    if (activeEnemiesCount === 0) this.advanceWave();
  }

  public applyDamageToEnemy(
    enemyId: string,
    damage: number,
    isHeavyAttack = false
  ): EnemyDamageResult | null {
    const target = this.enemies.find((enemy) => enemy.getEntity().id === enemyId);
    return target ? target.applySingleHitDamage(damage, isHeavyAttack) : null;
  }

  private advanceWave(): void {
    const index = WAVE_ORDER.indexOf(this.currentWave);
    if (index < 0 || index >= WAVE_ORDER.length - 1) return;

    const nextWave = WAVE_ORDER[index + 1];
    if (nextWave === 'VICTORY') {
      this.currentWave = 'VICTORY';
      this.enemies = [];
      this.isCompleted = true;
      this.saveState = {
        missionId: MISSION_ID,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      return;
    }

    this.startWave(nextWave);
  }

  private startWave(wave: MissionWave): void {
    this.currentWave = wave;
    const factories = WAVE_FACTORIES[wave] ?? [];
    this.enemies = factories.map((factory) => new EnemyStateMachine(factory()));
  }
}
