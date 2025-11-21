import { create } from 'zustand';

// Squad Management System
// Handles the 3-hero squad selection and swapping

export interface SquadMember {
  heroId: string;
  position: 0 | 1 | 2; // Position in squad
  transformationLevel: number; // 0 = base, 1 = super, 2 = hyper/ultimate
  healthPercent: number;
  energyPercent: number;
}

interface SquadState {
  // Squad composition
  squad: [string, string, string]; // 3 hero IDs
  activeHeroIndex: 0 | 1 | 2; // Which hero is currently active
  
  // Squad member stats
  squadMembers: SquadMember[];
  
  // Synergy bonuses
  synergyBonus: number; // 0-100, based on team composition
  
  // Actions
  setSquad: (hero1: string, hero2: string, hero3: string) => void;
  swapToHero: (index: 0 | 1 | 2) => void;
  updateHeroHealth: (heroId: string, healthPercent: number) => void;
  updateHeroEnergy: (heroId: string, energyPercent: number) => void;
  transformHero: (heroId: string, level: number) => void;
  calculateSynergy: () => void;
}

export const useSquad = create<SquadState>((set, get) => ({
  // Default squad: Jaxon, Kaison, Marlo
  squad: ['jaxon', 'kaison', 'marlo'],
  activeHeroIndex: 0,
  
  squadMembers: [
    { heroId: 'jaxon', position: 0, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
    { heroId: 'kaison', position: 1, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
    { heroId: 'marlo', position: 2, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
  ],
  
  synergyBonus: 0,
  
  setSquad: (hero1, hero2, hero3) => {
    set({
      squad: [hero1, hero2, hero3],
      squadMembers: [
        { heroId: hero1, position: 0, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
        { heroId: hero2, position: 1, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
        { heroId: hero3, position: 2, transformationLevel: 0, healthPercent: 100, energyPercent: 100 },
      ],
      activeHeroIndex: 0
    });
    get().calculateSynergy();
  },
  
  swapToHero: (index) => set({ activeHeroIndex: index }),
  
  updateHeroHealth: (heroId, healthPercent) => set((state) => ({
    squadMembers: state.squadMembers.map(member =>
      member.heroId === heroId ? { ...member, healthPercent } : member
    )
  })),
  
  updateHeroEnergy: (heroId, energyPercent) => set((state) => ({
    squadMembers: state.squadMembers.map(member =>
      member.heroId === heroId ? { ...member, energyPercent } : member
    )
  })),
  
  transformHero: (heroId, level) => set((state) => ({
    squadMembers: state.squadMembers.map(member =>
      member.heroId === heroId ? { ...member, transformationLevel: level } : member
    )
  })),
  
  calculateSynergy: () => {
    const state = get();
    const squad = state.squad;
    
    // Calculate synergy based on team composition
    // Speed + Power combo
    const hasSpeed = squad.some(id => ['jaxon', 'kaison', 'speedy', 'midnight'].includes(id));
    const hasPower = squad.some(id => ['marlo', 'kingspike'].includes(id));
    
    let bonus = 0;
    if (hasSpeed && hasPower) bonus += 20;
    
    // Twin heroes bonus
    if (squad.includes('jaxon') && squad.includes('kaison')) bonus += 30;
    if (squad.includes('marlo') && squad.includes('leonardo')) bonus += 25;
    
    set({ synergyBonus: Math.min(bonus, 100) });
  },
}));
