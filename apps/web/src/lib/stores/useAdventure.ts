import { create } from "zustand";

export interface AdventurePlayerState {
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
  attackType: "punch" | "kick" | "special" | "ultimate" | null;
  attackCooldown: number;
}

export interface AdventureEnemy {
  id: string;
  fighterId: string;
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
  health: number;
  maxHealth: number;
  isAggro: boolean;
  isAttacking: boolean;
  isDead: boolean;
}

interface AdventureState {
  player: AdventurePlayerState;
  enemies: AdventureEnemy[];
  missionId: string | null;
  arenaId: string;
  waveCount: number;
  enemiesDefeated: number;
  isPaused: boolean;

  setPlayerPos: (x: number, y: number, z: number) => void;
  setPlayerRot: (rotY: number) => void;
  setPlayerVelocity: (vx: number, vz: number) => void;
  setPlayerMoving: (moving: boolean, running: boolean) => void;
  setPlayerCombat: (combat: boolean) => void;
  playerAttack: (type: "punch" | "kick" | "special" | "ultimate") => void;
  clearAttack: () => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  useStamina: (amount: number) => boolean;
  regenStamina: (amount: number) => void;

  spawnEnemies: (enemies: AdventureEnemy[]) => void;
  damageEnemy: (id: string, amount: number) => void;
  setEnemyAggro: (id: string, aggro: boolean) => void;
  setEnemyPos: (id: string, x: number, y: number, z: number) => void;
  setEnemyAttacking: (id: string, attacking: boolean) => void;
  removeEnemy: (id: string) => void;

  initAdventure: (characterId: string, missionId: string | null, arenaId: string) => void;
  togglePause: () => void;
  reset: () => void;
}

const defaultPlayer: AdventurePlayerState = {
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
  stamina: 100,
  maxStamina: 100,
  combo: 0,
  isAttacking: false,
  attackType: null,
  attackCooldown: 0,
};

export const useAdventure = create<AdventureState>((set, get) => ({
  player: { ...defaultPlayer },
  enemies: [],
  missionId: null,
  arenaId: "open-world",
  waveCount: 0,
  enemiesDefeated: 0,
  isPaused: false,

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
        attackCooldown: type === "ultimate" ? 1.0 : type === "special" ? 0.6 : 0.3,
        combo: s.player.combo + 1,
      },
    })),

  clearAttack: () =>
    set((s) => ({
      player: { ...s.player, isAttacking: false, attackType: null, attackCooldown: 0 },
    })),

  damagePlayer: (amount) =>
    set((s) => ({
      player: { ...s.player, health: Math.max(0, s.player.health - amount) },
    })),

  healPlayer: (amount) =>
    set((s) => ({
      player: {
        ...s.player,
        health: Math.min(s.player.maxHealth, s.player.health + amount),
      },
    })),

  useStamina: (amount) => {
    const cur = get().player.stamina;
    if (cur < amount) return false;
    set((s) => ({
      player: { ...s.player, stamina: Math.max(0, s.player.stamina - amount) },
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

  spawnEnemies: (enemies) => set({ enemies }),

  damageEnemy: (id, amount) =>
    set((s) => {
      const enemies = s.enemies.map((e) => {
        if (e.id !== id) return e;
        const newHp = Math.max(0, e.health - amount);
        return { ...e, health: newHp, isDead: newHp <= 0 };
      });
      const justKilled = s.enemies.find((e) => e.id === id && !e.isDead);
      const newHp = justKilled ? Math.max(0, justKilled.health - amount) : 1;
      return {
        enemies,
        enemiesDefeated: newHp <= 0 ? s.enemiesDefeated + 1 : s.enemiesDefeated,
      };
    }),

  setEnemyAggro: (id, aggro) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, isAggro: aggro } : e)),
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

  removeEnemy: (id) =>
    set((s) => ({ enemies: s.enemies.filter((e) => e.id !== id) })),

  initAdventure: (_characterId, missionId, arenaId) =>
    set({
      player: { ...defaultPlayer },
      enemies: [],
      missionId,
      arenaId,
      waveCount: 0,
      enemiesDefeated: 0,
      isPaused: false,
    }),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  reset: () =>
    set({
      player: { ...defaultPlayer },
      enemies: [],
      missionId: null,
      arenaId: "open-world",
      waveCount: 0,
      enemiesDefeated: 0,
      isPaused: false,
    }),
}));
