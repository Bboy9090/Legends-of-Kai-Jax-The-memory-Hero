import { create } from "zustand";
import { CombatState } from "../../game/combat/stateEnums";
import { MISSION6_ID, freshMission6Memories, isMemoryInRange, unlockMission6Memories, type TrappedMemory } from "../mission6";
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
}

export interface DedicatedCivilian {
  id: string;
  health: number;
  maxHealth: number;
  posX: number;
  posY: number;
  posZ: number;
}
export interface ObjectiveState {
  status: "UNINITIALIZED" | "ACTIVE" | "FAILED" | "VICTORY";
  civilianRegistry: DedicatedCivilian[];
  memoryRescues: TrappedMemory[];
  milestones: {
    stalkerIntercepted: boolean;
    generalDefeated: boolean;
    chaseTargetEscaped: boolean;
  };
}
const freshObjectives = (missionId: string | null): ObjectiveState => ({
  status: missionId ? "ACTIVE" : "UNINITIALIZED",
  civilianRegistry: missionId === "story_act1_m5" ? [
    { id: "civ_01", health: 100, maxHealth: 100, posX: -5, posY: 0, posZ: 10 },
    { id: "civ_02", health: 100, maxHealth: 100, posX: -8, posY: 0, posZ: 12 },
  ] : [],
  memoryRescues: freshMission6Memories(missionId),
  milestones: { stalkerIntercepted: false, generalDefeated: false, chaseTargetEscaped: false },
});

interface AdventureState {
  objectives: ObjectiveState;
  damageCivilian: (id: string, amount: number) => void;
  rescueMemory: (id: TrappedMemory["id"]) => boolean;
  markChaseTargetEscaped: () => void;
  player: AdventurePlayerState;
  enemies: AdventureEnemy[];
  /** Scripted encounter damage authority; rendering snapshots are not simulation. */
  encounterDamageHandler: ((id: string, amount: number, heavy: boolean) => void) | null;
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
  damageEnemy: (id: string, amount: number, heavy?: boolean) => void;
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
  retryMission: () => void;
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
  encounterDamageHandler: null,
  missionId: null,
  objectives: freshObjectives(null),
  damageCivilian: (id, amount) => set(s => ({
    objectives: s.objectives.status !== "ACTIVE" || s.missionId !== "story_act1_m5" ? s.objectives : {
      ...s.objectives,
      civilianRegistry: s.objectives.civilianRegistry.map(c =>
        c.id === id ? { ...c, health: Math.max(0, c.health - Math.max(0, amount)) } : c),
    },
  })),
  rescueMemory: (id) => {
    const s = get();
    const memory = s.objectives.memoryRescues.find(node => node.id === id);
    if (s.missionId !== MISSION6_ID || s.objectives.status !== "ACTIVE" ||
        s.isPaused || s.player.health <= 0 || !memory || !memory.unlocked ||
        memory.rescued || !isMemoryInRange(memory, s.player.posX, s.player.posZ)) return false;
    set(state => ({
      objectives: {
        ...state.objectives,
        memoryRescues: state.objectives.memoryRescues.map(node =>
          node.id === id ? { ...node, rescued: true } : node),
      },
    }));
    return true;
  },
  markChaseTargetEscaped: () => set(s => ({
    objectives: s.missionId !== "story_act1_m4" || s.objectives.status !== "ACTIVE" ? s.objectives : {
      ...s.objectives,
      milestones: { ...s.objectives.milestones, chaseTargetEscaped: true },
    },
  })),
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
    // or just pass it in. For now, let's assume we can get it.
    const { trainingSession } = (typeof window !== "undefined" ? (window as any).runnerStore?.getState() : null) || { trainingSession: false };
    
    if (p.invulnTimer > 0 || trainingSession) return;
    if (p.superArmor) {
      set((s) => ({
        player: { ...s.player, health: Math.max(0, s.player.health - amount * 0.5) },
      }));
      return;
    }
    set((s) => ({
      player: {
        ...s.player,
        health: Math.max(0, s.player.health - amount),
        combatState: CombatState.HITSTUN,
        hitStunTimer: 0.3,
        isAttacking: false,
        attackType: null,
      },
    }));
  },

  healPlayer: (amount) =>
    set((s) => ({
      player: {
        ...s.player,
        health: Math.min(s.player.maxHealth, s.player.health + amount),
      },
    })),

  useStamina: (amount) => {
    const s = get();
    const cur = s.player.stamina;
    // @ts-ignore
    const { trainingSession } = (typeof window !== "undefined" ? (window as any).runnerStore?.getState() : null) || { trainingSession: false };
    
    if (trainingSession) return true; // Infinite stamina in training
    if (cur < amount) return false;
    set((s) => ({
      player: {
        ...s.player,
        stamina: Math.max(0, s.player.stamina - amount),
        staminaRegenDelay: STAMINA_CONFIG.regenDelay,
      },
    }));
    return true;
  },

  regenStamina: (amount) =>
    set((s) => ({
      player: {
        ...s.player,
        stamina: Math.min(s.player.maxStamina, s.player.stamina + amount),
      },
    })),

  setCombatState: (combatState) =>
    set((s) => ({ player: { ...s.player, combatState } })),

  setComboStep: (comboStep) =>
    set((s) => ({ player: { ...s.player, comboStep } })),

  setComboTimer: (comboTimer) =>
    set((s) => ({ player: { ...s.player, comboTimer } })),

  setDodgeTimer: (dodgeTimer) =>
    set((s) => ({ player: { ...s.player, dodgeTimer } })),

  setInvulnTimer: (invulnTimer) =>
    set((s) => ({ player: { ...s.player, invulnTimer } })),

  setHitStunTimer: (hitStunTimer) =>
    set((s) => ({ player: { ...s.player, hitStunTimer } })),

  setHitStopTimer: (hitStopTimer) =>
    set((s) => ({ player: { ...s.player, hitStopTimer } })),

  setStaminaRegenDelay: (staminaRegenDelay) =>
    set((s) => ({ player: { ...s.player, staminaRegenDelay } })),

  setAutoTargetId: (autoTargetId) =>
    set((s) => ({ player: { ...s.player, autoTargetId } })),

  setSuperArmor: (superArmor) =>
    set((s) => ({ player: { ...s.player, superArmor } })),

  triggerScreenShake: (intensity) =>
    set((s) => ({ player: { ...s.player, screenShake: intensity } })),

  triggerTimeScale: (scale, duration) => {
    set((s) => ({ player: { ...s.player, timeScale: scale } }));
    setTimeout(() => {
      set((s) => ({ player: { ...s.player, timeScale: 1.0 } }));
    }, duration * 1000);
  },

  triggerImpactFlash: (color) => {
    set((s) => ({ player: { ...s.player, impactFlash: color } }));
    setTimeout(() => {
      set((s) => ({ player: { ...s.player, impactFlash: null } }));
    }, 150);
  },

  spawnEnemies: (enemies) => set({ enemies }),

  damageEnemy: (id, amount, heavy = false) => {
    const handler = get().encounterDamageHandler;
    if (handler) { handler(id, amount, heavy); return; }
    set((s) => {
      const target = s.enemies.find(e => e.id === id && !e.isDead);
      const isStalkerIntercept = s.objectives.status === "ACTIVE" && s.missionId === "story_act1_m4" && target?.fighterId === "void-stalker";
      const floorHp = isStalkerIntercept ? Math.max(1, target.maxHealth * 0.1) : 0;
      const targetHp = target ? Math.max(floorHp, target.health - Math.max(0, amount)) : null;
      const enemies = s.enemies.map((e) => {
        if (e.id !== id || e.isDead || targetHp === null) return e;
        return {
          ...e,
          health: targetHp,
          isDead: targetHp <= 0,
          aiState: (isStalkerIntercept && targetHp <= floorHp ? "retreat" : targetHp <= 0 ? "idle" : targetHp / e.maxHealth < 0.3 ? "retreat" : e.aiState) as EnemyAIState,
          stunTimer: targetHp > 0 ? 0.3 : 0,
        };
      });
      const milestones = { ...s.objectives.milestones };
      if (s.objectives.status === "ACTIVE" && target && targetHp !== null) {
        if (s.missionId === "story_act1_m4" && target.fighterId === "void-stalker" && targetHp <= target.maxHealth * 0.1) {
          milestones.stalkerIntercepted = true;
        }
        if (s.missionId === "story_act1_m5" && target.fighterId === "rift-general" && targetHp === 0) {
          milestones.generalDefeated = true;
        }
      }
      const enemiesDefeated = target && targetHp === 0 && target.health > 0
        ? s.enemiesDefeated + 1 : s.enemiesDefeated;
      const memoryRescues = s.missionId === MISSION6_ID
        ? unlockMission6Memories(s.objectives.memoryRescues, enemiesDefeated)
        : s.objectives.memoryRescues;
      return {
        enemies,
        enemiesDefeated,
        objectives: { ...s.objectives, milestones, memoryRescues },
      };
    });
  },

  setEnemyAggro: (id, aggro) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, isAggro: aggro, aiState: aggro ? "chase" as EnemyAIState : "idle" as EnemyAIState } : e
      ),
    })),

  setEnemyPos: (id, x, y, z) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, posX: x, posY: y, posZ: z } : e
      ),
    })),

  setEnemyAttacking: (id, attacking) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, isAttacking: attacking } : e
      ),
    })),

  setEnemyAIState: (id, aiState) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, aiState } : e
      ),
    })),

  setEnemyTelegraph: (id, timer) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, telegraphTimer: timer } : e
      ),
    })),

  setEnemyStun: (id, timer) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, stunTimer: timer } : e
      ),
    })),

  removeEnemy: (id) =>
    set((s) => ({ enemies: s.enemies.filter((e) => e.id !== id) })),

  initAdventure: (characterId, missionId, arenaId) =>
    set({
      player: { ...defaultPlayer, fighterId: characterId },
      enemies: [],
      encounterDamageHandler: null,
      missionId,
      objectives: freshObjectives(missionId),
      arenaId,
      waveCount: 0,
      enemiesDefeated: 0,
      isPaused: false,
      roamDistrictId: null,
      roamSessionId: 0,
      encounterIndex: 0,
      districtCompleted: false,
      checkpointBetweenEncounters: true,
    }),

  startDistrictRoam: (districtId, characterId) => {
    const sid = get().roamSessionId + 1;
    set({
      player: { ...defaultPlayer, fighterId: characterId },
      enemies: [],
      encounterDamageHandler: null,
      missionId: null,
      objectives: freshObjectives(null),
      arenaId: `roam-${districtId}`,
      waveCount: 0,
      enemiesDefeated: 0,
      isPaused: false,
      roamDistrictId: districtId,
      roamSessionId: sid,
      encounterIndex: 0,
      districtCompleted: false,
      checkpointBetweenEncounters: true,
    });
  },

  applyDistrictCheckpoint: () => {
    const s = get();
    if (!s.roamDistrictId || !s.checkpointBetweenEncounters) return;
    const p = s.player;
    const heal = Math.round(p.maxHealth * 0.22);
    const stam = Math.round(STAMINA_CONFIG.max * 0.35);
    set({
      player: {
        ...p,
        health: Math.min(p.maxHealth, p.health + heal),
        stamina: Math.min(p.maxStamina, p.stamina + stam),
        staminaRegenDelay: 0,
      },
    });
    get().triggerImpactFlash("#22d3ee");
  },

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  reset: () =>
    set({
      player: { ...defaultPlayer },
      enemies: [],
      encounterDamageHandler: null,
      missionId: null,
      objectives: freshObjectives(null),
      arenaId: "open-world",
      waveCount: 0,
      enemiesDefeated: 0,
      isPaused: false,
      roamDistrictId: null,
      roamSessionId: 0,
      encounterIndex: 0,
      districtCompleted: false,
      checkpointBetweenEncounters: true,
    }),
  retryMission: () => {
    const state = get();
    set({
      player: { ...defaultPlayer, fighterId: state.player.fighterId },
      enemies: [],
      objectives: freshObjectives(state.missionId),
      waveCount: 1,
      enemiesDefeated: 0,
      isPaused: false,
    });
  },
}));

(window as any).useAdventure = useAdventure;
