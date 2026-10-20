import { useAdventure, type AdventureEnemy, type EnemyAIState } from '../../lib/stores/useAdventure';
import { useMissions } from '../../lib/stores/useMissions';
import { EncounterDirector } from './EncounterDirector';
import type { EnemyContract, EnemyDamageResult } from './EnemyStateMachine';
import { isMission1Id } from './mission1Identity';

const RENDER_AI_STATE: Record<EnemyContract['currentState'], EnemyAIState> = {
  IDLE: 'idle', DETECTION: 'chase', APPROACH: 'chase', RETREAT: 'retreat',
  TELEGRAPH: 'telegraph', ATTACK: 'attack', RECOVERY: 'idle', STAGGER: 'stun',
  DEATH: 'idle', TELEPORT: 'chase', PHASE_TRANSITION: 'idle',
};

/** Single Mission 1 simulation owner; the adventure store is its render projection. */
export class Mission1AdventureSession {
  public readonly director = new EncounterDirector();
  private completed = false;
  private readonly damageHandler = (id: string, amount: number, heavy: boolean) => {
    this.applyDamage(id, amount, heavy);
  };

  constructor(missionId: string) {
    if (!isMission1Id(missionId)) throw new Error('Mission1AdventureSession requires Mission 1');
    useAdventure.setState({ encounterDamageHandler: this.damageHandler });
    useMissions.getState().startMission('story', 'story_act1_m1');
    this.publish();
  }

  private get active(): boolean {
    const state = useAdventure.getState();
    return state.encounterDamageHandler === this.damageHandler && isMission1Id(state.missionId);
  }

  public applyDamage(id: string, amount: number, heavy = false): EnemyDamageResult | null {
    const state = useAdventure.getState();
    if (!this.active || this.completed || state.isPaused || state.player.health <= 0
      || !Number.isFinite(amount) || amount <= 0) return null;
    const before = this.director.getEnemies().find((enemy) => enemy.id === id);
    const result = this.director.applyDamageToEnemy(id, amount, heavy);
    if (before && !before.isDead && result?.triggeredDeath) {
      useAdventure.setState((current) => ({ enemiesDefeated: current.enemiesDefeated + 1 }));
    }
    this.publish();
    return result;
  }

  public tick(rawDelta: number): void {
    const state = useAdventure.getState();
    if (!this.active || this.completed || state.isPaused || state.player.health <= 0) return;
    const dt = Number.isFinite(rawDelta) ? Math.max(0, Math.min(rawDelta, 0.05)) : 0;
    if (dt === 0 || state.player.hitStopTimer > 0) return;
    const player = state.player;
    this.director.update(dt * player.timeScale * 1000, {
      x: player.posX, y: player.posY, z: player.posZ,
    }, player.invulnTimer > 0);
    for (const damage of this.director.drainPlayerDamage()) {
      const current = useAdventure.getState();
      if (current.player.health <= 0) break;
      if (current.player.invulnTimer > 0) continue;
      current.damagePlayer(damage);
      current.setInvulnTimer(0.42);
    }
    this.publish();
    if (this.director.isMissionCompleted() && useAdventure.getState().player.health > 0) {
      this.completed = true;
      useAdventure.setState({ districtCompleted: true });
      useMissions.getState().completeMission(true);
    }
  }

  private publish(): void {
    const player = useAdventure.getState().player;
    const enemies: AdventureEnemy[] = this.director.getEnemies().map((enemy) => ({
      id: enemy.id, fighterId: enemy.type.toLowerCase(),
      tier: enemy.type === 'VOID_STALKER_PRIME' ? 'boss2' : enemy.type === 'CORRUPTION_BRUTE' ? 'boss1' : 'minion1',
      posX: enemy.position.x, posY: enemy.position.y, posZ: enemy.position.z,
      rotY: Math.atan2(player.posX - enemy.position.x, player.posZ - enemy.position.z),
      health: enemy.stats.currentHealth, maxHealth: enemy.stats.maxHealth,
      isAggro: enemy.currentState !== 'IDLE', isAttacking: enemy.currentState === 'ATTACK',
      isDead: enemy.isDead, aiState: RENDER_AI_STATE[enemy.currentState],
      telegraphTimer: enemy.stateTimerMs / 1000,
      patrolTargetX: enemy.position.x, patrolTargetZ: enemy.position.z,
      stunTimer: enemy.isStaggered ? enemy.stats.staggerDurationMs / 1000 : 0,
    }));
    useAdventure.setState({ enemies });
  }

  public dispose(): void {
    if (useAdventure.getState().encounterDamageHandler === this.damageHandler) {
      useAdventure.setState({ encounterDamageHandler: null });
    }
  }
}
