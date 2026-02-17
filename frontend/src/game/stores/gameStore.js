import { create } from 'zustand';

// Game State Store - Central state management for the game
export const useGameStore = create((set, get) => ({
  // Player State
  player: {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    position: [0, 2, 0],
    rotation: [0, 0, 0],
    isGrounded: true,
    isAttacking: false,
    isDodging: false,
    isBlocking: false,
    combo: 0,
  },

  // Tail System - Tails 4-6 for Phase 2
  tails: {
    active: [4, 5, 6], // Available tails
    equipped: [4, 5], // Currently equipped (max 2 active)
    cooldowns: {
      4: 0, // Law Tail
      5: 0, // Sacrifice Tail
      6: 0, // Memory Fracture Tail
    },
    energy: 100,
    maxEnergy: 100,
  },

  // Tail Definitions
  tailData: {
    4: {
      name: 'Law Tail',
      element: 'Storm/Ice/Pressure',
      color: '#64D2FF',
      abilities: ['Space Control', 'Enemy Displacement', 'Pressure Field'],
      cooldown: 8,
      energyCost: 25,
    },
    5: {
      name: 'Sacrifice Tail',
      element: 'Fire/Endurance',
      color: '#FF3B30',
      abilities: ['Damage Redirect', 'Last Stand', 'Protect Ally'],
      cooldown: 12,
      energyCost: 35,
    },
    6: {
      name: 'Memory Fracture Tail',
      element: 'Web/Shadow/Adaptation',
      color: '#BF5AF2',
      abilities: ['Echo Action', 'Memory Step', 'Route Rewrite'],
      cooldown: 15,
      energyCost: 40,
    },
  },

  // Combat State
  combat: {
    inCombat: false,
    enemies: [],
    targetEnemy: null,
    lastHitTime: 0,
    comboTimer: 0,
  },

  // Game State
  gameState: 'menu', // 'menu', 'playing', 'paused', 'cutscene', 'dead', 'victory'
  currentDistrict: 'ironvein',
  checkpointPosition: [0, 2, 0],

  // Faction Reaction System
  factionReaction: {
    fangSyndicate: {
      awareness: 0, // 0-100
      aggression: 50,
      tactics: 'standard', // 'standard', 'flanking', 'fortified', 'ambush'
    },
    covenant: {
      awareness: 0,
      aggression: 30,
      tactics: 'stealth',
    },
  },

  // Memory Fragments (collectibles that unlock abilities)
  memoryFragments: {
    collected: 0,
    total: 10,
    fragments: [],
  },

  // Actions
  setGameState: (state) => set({ gameState: state }),
  
  updatePlayerHealth: (amount) => set((state) => ({
    player: {
      ...state.player,
      health: Math.max(0, Math.min(state.player.maxHealth, state.player.health + amount)),
    },
  })),

  updatePlayerStamina: (amount) => set((state) => ({
    player: {
      ...state.player,
      stamina: Math.max(0, Math.min(state.player.maxStamina, state.player.stamina + amount)),
    },
  })),

  updatePlayerPosition: (position) => set((state) => ({
    player: { ...state.player, position },
  })),

  setPlayerAttacking: (isAttacking) => set((state) => ({
    player: { ...state.player, isAttacking },
  })),

  setPlayerDodging: (isDodging) => set((state) => ({
    player: { ...state.player, isDodging },
  })),

  // Tail Actions
  useTailAbility: (tailId) => {
    const state = get();
    const tail = state.tailData[tailId];
    if (!tail) return false;
    
    if (state.tails.cooldowns[tailId] > 0) return false;
    if (state.tails.energy < tail.energyCost) return false;

    set((state) => ({
      tails: {
        ...state.tails,
        cooldowns: { ...state.tails.cooldowns, [tailId]: tail.cooldown },
        energy: state.tails.energy - tail.energyCost,
      },
    }));
    return true;
  },

  updateTailCooldowns: (delta) => set((state) => {
    const newCooldowns = { ...state.tails.cooldowns };
    Object.keys(newCooldowns).forEach((key) => {
      newCooldowns[key] = Math.max(0, newCooldowns[key] - delta);
    });
    return {
      tails: {
        ...state.tails,
        cooldowns: newCooldowns,
        energy: Math.min(state.tails.maxEnergy, state.tails.energy + delta * 5), // Regen
      },
    };
  }),

  // Combat Actions
  enterCombat: () => set((state) => ({
    combat: { ...state.combat, inCombat: true },
  })),

  exitCombat: () => set((state) => ({
    combat: { ...state.combat, inCombat: false, targetEnemy: null },
  })),

  addEnemy: (enemy) => set((state) => ({
    combat: { ...state.combat, enemies: [...state.combat.enemies, enemy] },
  })),

  removeEnemy: (enemyId) => set((state) => ({
    combat: {
      ...state.combat,
      enemies: state.combat.enemies.filter((e) => e.id !== enemyId),
    },
  })),

  // Faction Reaction
  updateFactionAwareness: (faction, amount) => set((state) => ({
    factionReaction: {
      ...state.factionReaction,
      [faction]: {
        ...state.factionReaction[faction],
        awareness: Math.min(100, state.factionReaction[faction].awareness + amount),
      },
    },
  })),

  // Memory Fragments
  collectFragment: (fragment) => set((state) => ({
    memoryFragments: {
      ...state.memoryFragments,
      collected: state.memoryFragments.collected + 1,
      fragments: [...state.memoryFragments.fragments, fragment],
    },
  })),

  // Reset Game
  resetGame: () => set({
    player: {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      position: [0, 2, 0],
      rotation: [0, 0, 0],
      isGrounded: true,
      isAttacking: false,
      isDodging: false,
      isBlocking: false,
      combo: 0,
    },
    tails: {
      active: [4, 5, 6],
      equipped: [4, 5],
      cooldowns: { 4: 0, 5: 0, 6: 0 },
      energy: 100,
      maxEnergy: 100,
    },
    combat: {
      inCombat: false,
      enemies: [],
      targetEnemy: null,
      lastHitTime: 0,
      comboTimer: 0,
    },
    gameState: 'menu',
  }),
}));

export default useGameStore;
