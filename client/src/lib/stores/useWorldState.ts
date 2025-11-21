import { create } from 'zustand';

// World Collision RPG State Management
// Manages open world exploration, rifts, and progression

export interface DimensionalRift {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
  echoBoss: string;
  difficulty: number;
  rewards: string[];
  active: boolean;
  completed: boolean;
}

export interface WorldZone {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  questsCompleted: number;
  totalQuests: number;
}

interface WorldState {
  // Player progression
  playerLevel: number;
  experiencePoints: number;
  chaosEnergy: number;
  
  // World exploration
  currentZone: string;
  discoveredZones: string[];
  worldZones: WorldZone[];
  
  // Dimensional Rifts
  activeRifts: DimensionalRift[];
  completedRifts: string[];
  
  // Nexus Haven progression
  nexusLevel: number;
  nexusUpgrades: string[];
  recruitedHeroes: string[];
  
  // Story progression
  storyProgress: number;
  completedCutscenes: string[];
  voidKingWeakness: number; // 0-100, how much we've weakened the boss
  
  // Actions
  setCurrentZone: (zone: string) => void;
  discoverZone: (zoneId: string) => void;
  activateRift: (riftId: string) => void;
  completeRift: (riftId: string) => void;
  recruitHero: (heroId: string) => void;
  upgradeNexus: (upgradeId: string) => void;
  addExperience: (amount: number) => void;
  addChaosEnergy: (amount: number) => void;
  weakenVoidKing: (amount: number) => void;
}

export const useWorldState = create<WorldState>((set, get) => ({
  // Initial state
  playerLevel: 1,
  experiencePoints: 0,
  chaosEnergy: 0,
  
  currentZone: 'nexus-haven',
  discoveredZones: ['nexus-haven'],
  worldZones: [
    { id: 'nexus-haven', name: 'Nexus Haven', description: 'Last bastion of hope', discovered: true, questsCompleted: 0, totalQuests: 5 },
    { id: 'green-hill-hyrule', name: 'Green Hill Fields of Hyrule', description: 'Where speed meets courage', discovered: false, questsCompleted: 0, totalQuests: 8 },
    { id: 'dream-toad-sky', name: 'Dream Land Mushroom Skies', description: 'Floating islands above kingdoms', discovered: false, questsCompleted: 0, totalQuests: 6 },
    { id: 'lylat-ruins', name: 'Lylat System Ruins', description: 'Scattered tech across the void', discovered: false, questsCompleted: 0, totalQuests: 7 },
  ],
  
  activeRifts: [],
  completedRifts: [],
  
  nexusLevel: 1,
  nexusUpgrades: [],
  recruitedHeroes: ['jaxon', 'kaison'],
  
  storyProgress: 0,
  completedCutscenes: [],
  voidKingWeakness: 0,
  
  // Actions
  setCurrentZone: (zone) => set({ currentZone: zone }),
  
  discoverZone: (zoneId) => set((state) => ({
    discoveredZones: state.discoveredZones.includes(zoneId) 
      ? state.discoveredZones 
      : [...state.discoveredZones, zoneId],
    worldZones: state.worldZones.map(z => 
      z.id === zoneId ? { ...z, discovered: true } : z
    )
  })),
  
  activateRift: (riftId) => set((state) => ({
    activeRifts: state.activeRifts.map(r =>
      r.id === riftId ? { ...r, active: true } : r
    )
  })),
  
  completeRift: (riftId) => set((state) => ({
    completedRifts: [...state.completedRifts, riftId],
    activeRifts: state.activeRifts.map(r =>
      r.id === riftId ? { ...r, completed: true, active: false } : r
    )
  })),
  
  recruitHero: (heroId) => set((state) => ({
    recruitedHeroes: state.recruitedHeroes.includes(heroId)
      ? state.recruitedHeroes
      : [...state.recruitedHeroes, heroId]
  })),
  
  upgradeNexus: (upgradeId) => set((state) => ({
    nexusUpgrades: [...state.nexusUpgrades, upgradeId],
    nexusLevel: Math.floor(state.nexusUpgrades.length / 3) + 1
  })),
  
  addExperience: (amount) => set((state) => {
    const newXP = state.experiencePoints + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    return {
      experiencePoints: newXP,
      playerLevel: newLevel
    };
  }),
  
  addChaosEnergy: (amount) => set((state) => ({
    chaosEnergy: Math.min(state.chaosEnergy + amount, 9999)
  })),
  
  weakenVoidKing: (amount) => set((state) => ({
    voidKingWeakness: Math.min(state.voidKingWeakness + amount, 100)
  })),
}));
