import { create } from "zustand";
import { CombatState } from "../../game/combat/stateEnums";
import { STAMINA_CONFIG } from "../../game/tuning/adventureTuning";
import type { CampaignNodeId } from "./useRunner";

export interface AdventurePlayerState {
  fighterId: string;
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
  velocityX: number;
  velocityZ: number;
  speed: number;
  isMoving: boolean;
  isRunning: boolean;
  isCombat: boolean;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  combo: number;
  isAttacking: boolean;
  attackType: "light1" | "light2" | "light3" | "heavy" | "skill" | "punch" | "kick" | "special" | "ultimate" | null;
  attackCooldown: number;
  attackTimer: number;

  combatState: CombatState;
  comboStep: number;
  comboTimer: number;
  dodgeTimer: number;
  invulnTimer: number;
  hitStunTimer: number;
  hitStopTimer: number;
  staminaRegenDelay: number;
  autoTargetId: string | null;
  superArmor: boolean;
  screenShake: number;
  timeScale: number;
  impactFlash: string | null;
}

export type EnemyAIState = "idle" | "patrol" | "chase" | "telegraph" | "attack" | "retreat" | "stun";

export interface AdventureEnemy {
  id: string;
  fighterId: string;
  tier: "minion1" | "minion2" | "boss1" | "boss2";
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
  health: number;
  maxHealth: number;
  isAggro: boolean;
  isAttacking: boolean;
  isDead: boolean;
  aiState: EnemyAIState;
  telegraphTimer: number;
  patrolTargetX: number;
  patrolTargetZ: number;
  stunTimer: number;
  /** Authoritative scripted boss phase when supplied by the encounter runtime. */
  bossPhase?: 1 | 2;
}

interface AdventureState {
  player: AdventurePlayerState;
  enemies: AdventureEnemy[];
  missionId: string | null;
  arenaId: string;
  waveCount: number;
  enemiesDefeated: number;
  isPaused: boolean;
  /** When set, open-world uses scripted district encounters instead of infinite waves */
  roamDistrictId: CampaignNodeId | null;
  /** Bumps when starting a new district patrol (spawner resets) */
  roamSessionId: number;
  encounterIndex: number;
  /** All encounters in district cleared */
  districtCompleted: boolean;
  /** Between scripted encounters: partial restore (checkpoint) */
  checkpointBetweenEncounters: boolean;

  setPlayerPos: (x: number, y: number, z: number) => void;
  setPlayerRot: (rotY: number) => void;
  setPlayerVelocity: (vx: number, vz: number) => void;
  setPlayerMoving: (moving: boolean, running: boolean) => void;
  setPlayerCombat: (combat: boolean) => void;
  playerAttack: (type: AdventurePlayerState["attackType"]) => void;
  clearAttack: () => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  useStamina: (amount: number) => boolean;
  regenStamina: (amount: number) => void;
  setCombatState: (state: CombatState) => void;
  setComboStep: (step: number) => void;
  setComboTimer: (time: number) => void;
  setDodgeTimer: (time: number) => void;
  setInvulnTimer: (time: number) => void;
  setHitStunTimer: (time: number) => void;
  setHitStopTimer: (time: number) => void;
  setStaminaRegenDelay: (time: number) => void;
  setAutoTargetId: (id: string | null) => void;
  setSuperArmor: (val: boolean) => void;
  triggerScreenShake: (intensity: number) => void;
  triggerTimeScale: (scale: number, duration: number) => void;
  triggerImpactFlash: (color: string) => void;

  spawnEnemies: (enemies: AdventureEnemy[]) => void;
  damageEnemy: (id: string, amount: number) => void;
  setEnemyAggro: (id: string, aggro: boolean) => void;
  setEnemyPos: (id: string, x: number, y: number, z: number) => void;
  setEnemyAttacking: (id: string, attacking: boolean) => void;
  setEnemyAIState: (id: string, aiState: EnemyAIState) => void;
  setEnemyTelegraph: (id: string, timer: number) => void;
  setEnemyStun: (id: string, timer: number) => void;
  removeEnemy: (id: string) => void;

  initAdventure: (characterId: string, missionId: string | null, arenaId: string) => void;
  /** Phase 5: district-based roam (scripted encounters) */
  startDistrictRoam: (districtId: CampaignNodeId, characterId: string) => void;
  applyDistrictCheckpoint: () => void;
  togglePause: () => void;
  reset: () => void;
}

const defaultPlayer: AdventurePlayerState = {
  fighterId: "kai-jax",
  posX: 0,
  posY: 0,
  posZ: 0,
  rotY: 0,
  velocityX: 0,
  velocityZ: 0,
  speed: 0,
  isMoving: false,
  isRunning: false,
  isCombat: false,
  health: 100,
  maxHealth: 100,
  stamina: STAMINA_CONFIG.max,
  maxStamina: STAMINA_CONFIG.max,
  combo: 0,
  isAttacking: false,
  attackType: null,
  attackCooldown: 0,
  attackTimer: 0,

  combatState: CombatState.FREE,
  comboStep: 0,
  comboTimer: 0,
  dodgeTimer: 0,
  invulnTimer: 0,
  hitStunTimer: 0,
  hitStopTimer: 0,
  staminaRegenDelay: 0,
  autoTargetId: null,
  superArmor: false,
  screenShake: 0,
  timeScale: 1.0,
  impactFlash: null,
};

export const useAdventure = create<AdventureState>((set, get) => ({
  player: { ...defaultPlayer },
  enemies: [],
  missionId: null,
  arenaId: "open-world",
  waveCount: 0,
  enemiesDefeated: 0,
  isPaused: false,
  roamDistrictId: null,
  roamSessionId: 0,
  encounterIndex: 0,
  districtCompleted: false,
  checkpointBetweenEncounters: true,

  setPlayerPos: (x, y, z) =>
    set((s) => ({ player: { ...s.player, posX: x, posY: y, posZ: z } })),

  setPlayerRot: (rotY) =>
    set((s) => ({ player: { ...s.player, rotY } })),

  setPlayerVelocity: (vx, vz) => {
    const speed = Math.sqrt(vx * vx + vz * vz);
    set((s) => ({
      player: { ...s.player, velocityX: vx, velocityZ: vz, speed },
    }));
  },

  setPlayerMoving: (isMoving, isRunning) =>
    set((s) => ({ player: { ...s.player, isMoving, isRunning } })),

  setPlayerCombat: (isCombat) =>
    set((s) => ({ player: { ...s.player, isCombat } })),

  playerAttack: (type) =>
    set((s) => ({
      player: {
        ...s.player,
        isAttacking: true,
        attackType: type,
        combatState: CombatState.ATTACKING,
      },
    })),

  clearAttack: () =>
    set((s) => ({
      player: {
        ...s.player,
        isAttacking: false,
        attackType: null,
        attackCooldown: 0,
        combatState: CombatState.FREE,
      },
    })),

  damagePlayer: (amount) => {
    const p = get().player;
    // @ts-ignore - Avoid circular dependency if useRunner is not imported yet, 
    // but we can check the trainingSession flag via the global runner store if needed
    const isTraining = typeof window !== 'undefined' && (window as any).runnerStore?.getState?.().trainingSession;
    if (isTraining) return;
    set((s) => ({ player: { ...s.player, health: Math.max(0, p.health - amount) } }));
  },

  healPlayer: (amount) =>
    set((s) => ({ player: { ...s.player, health: Math.min(s.player.maxHealth, s.player.health + amount) } })),

  useStamina: (amount) => {
    const p = get().player;
    if (p.stamina < amount) return false;
    set((s) => ({ player: { ...s.player, stamina: Math.max(0, s.player.stamina - amount) } }));
    return true;
  },

  regenStamina: (amount) =>
    set((s) => ({ player: { ...s.player, stamina: Math.min(s.player.maxStamina, s.player.stamina + amount) } })),

  setCombatState: (combatState) => set((s) => ({ player: { ...s.player, combatState } })),
  setComboStep: (comboStep) => set((s) => ({ player: { ...s.player, comboStep } })),
  setComboTimer: (comboTimer) => set((s) => ({ player: { ...s.player, comboTimer } })),
  setDodgeTimer: (dodgeTimer) => set((s) => ({ player: { ...s.player, dodgeTimer } })),
  setInvulnTimer: (invulnTimer) => set((s) => ({ player: { ...s.player, invulnTimer } })),
  setHitStunTimer: (hitStunTimer) => set((s) => ({ player: { ...s.player, hitStunTimer } })),
  setHitStopTimer: (hitStopTimer) => set((s) => ({ player: { ...s.player, hitStopTimer } })),
  setStaminaRegenDelay: (staminaRegenDelay) => set((s) => ({ player: { ...s.player, staminaRegenDelay } })),
  setAutoTargetId: (autoTargetId) => set((s) => ({ player: { ...s.player, autoTargetId } })),
  setSuperArmor: (superArmor) => set((s) => ({ player: { ...s.player, superArmor } })),

  triggerScreenShake: (intensity) => set((s) => ({ player: { ...s.player, screenShake: intensity } })),
  triggerTimeScale: (scale, _duration) => set((s) => ({ player: { ...s.player, timeScale: scale } })),
  triggerImpactFlash: (color) => {
    set((s) => ({ player: { ...s.player, impactFlash: color } }));
    setTimeout(() => set((s) => ({ player: { ...s.player, impactFlash: null } })), 150);
  },

  spawnEnemies: (enemies) => set({ enemies }),
  damageEnemy: (id, amount) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id
      ? { ...enemy, health: Math.max(0, enemy.health - amount), isDead: enemy.health - amount <= 0 }
      : enemy),
  })),
  setEnemyAggro: (id, isAggro) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, isAggro } : enemy),
  })),
  setEnemyPos: (id, posX, posY, posZ) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, posX, posY, posZ } : enemy),
  })),
  setEnemyAttacking: (id, isAttacking) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, isAttacking } : enemy),
  })),
  setEnemyAIState: (id, aiState) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, aiState } : enemy),
  })),
  setEnemyTelegraph: (id, telegraphTimer) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, telegraphTimer } : enemy),
  })),
  setEnemyStun: (id, stunTimer) => set((s) => ({
    enemies: s.enemies.map((enemy) => enemy.id === id ? { ...enemy, stunTimer } : enemy),
  })),
  removeEnemy: (id) => set((s) => ({ enemies: s.enemies.filter((enemy) => enemy.id !== id) })),

  initAdventure: (characterId, missionId, arenaId) => set({
    player: { ...defaultPlayer, fighterId: characterId },
    enemies: [],
    missionId,
    arenaId,
    waveCount: 0,
    enemiesDefeated: 0,
    isPaused: false,
    roamDistrictId: null,
    encounterIndex: 0,
    districtCompleted: false,
  }),

  startDistrictRoam: (districtId, characterId) => set((s) => ({
    player: { ...defaultPlayer, fighterId: characterId },
    enemies: [],
    missionId: null,
    arenaId: "open-world",
    waveCount: 0,
    enemiesDefeated: 0,
    isPaused: false,
    roamDistrictId: districtId,
    roamSessionId: s.roamSessionId + 1,
    encounterIndex: 0,
    districtCompleted: false,
  })),

  applyDistrictCheckpoint: () => set((s) => ({
    player: {
      ...s.player,
      health: Math.min(s.player.maxHealth, s.player.health + s.player.maxHealth * 0.25),
      stamina: s.player.maxStamina,
      isAttacking: false,
      attackType: null,
      combatState: CombatState.FREE,
      comboStep: 0,
      comboTimer: 0,
      invulnTimer: 0,
      hitStunTimer: 0,
      autoTargetId: null,
    },
  })),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  reset: () => set((s) => ({
    player: { ...defaultPlayer },
    enemies: [],
    missionId: null,
    arenaId: "open-world",
    waveCount: 0,
    enemiesDefeated: 0,
    isPaused: false,
    roamDistrictId: null,
    roamSessionId: s.roamSessionId + 1,
    encounterIndex: 0,
    districtCompleted: false,
    checkpointBetweenEncounters: true,
  })),
}));