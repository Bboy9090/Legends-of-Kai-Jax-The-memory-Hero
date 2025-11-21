import { create } from 'zustand';
import { CHARACTER_BIOS, TransformationTier } from '../characterBios';

interface TransformationState {
  // Current transformation levels for all heroes
  transformationLevels: Record<string, number>; // heroId -> level (0, 1, 2)
  
  // Transformation meters (0-100)
  transformationMeters: Record<string, number>; // heroId -> meter progress
  
  // Unlocked transformations
  unlockedTransformations: Record<string, number[]>; // heroId -> [levels unlocked]
  
  // Active transformation duration (for temporary forms)
  activeTransformDuration: Record<string, number>; // heroId -> frames remaining
  
  // Actions
  addTransformationEnergy: (heroId: string, amount: number) => void;
  activateTransformation: (heroId: string, level: number) => void;
  deactivateTransformation: (heroId: string) => void;
  unlockTransformation: (heroId: string, level: number) => void;
  getHeroTransformation: (heroId: string) => TransformationTier | null;
  canTransform: (heroId: string, level: number) => boolean;
  tickTransformDuration: (heroId: string) => void;
}

export const useTransformations = create<TransformationState>((set, get) => ({
  transformationLevels: {},
  transformationMeters: {},
  unlockedTransformations: {
    // Default unlocks - base forms always available
    'jaxon': [0],
    'kaison': [0],
    'marlo': [0],
    'flynn': [0],
    'sparky': [0],
    'bubble': [0],
    'novaknight': [0],
    'speedy': [0],
  },
  activeTransformDuration: {},
  
  addTransformationEnergy: (heroId, amount) => set((state) => {
    const current = state.transformationMeters[heroId] || 0;
    const newValue = Math.min(current + amount, 100);
    
    return {
      transformationMeters: {
        ...state.transformationMeters,
        [heroId]: newValue
      }
    };
  }),
  
  activateTransformation: (heroId, level) => {
    const state = get();
    
    // Check if transformation is unlocked
    const unlocked = state.unlockedTransformations[heroId] || [0];
    if (!unlocked.includes(level)) {
      console.warn(`Transformation level ${level} not unlocked for ${heroId}`);
      return;
    }
    
    // Check if meter is full for level 1+
    if (level > 0) {
      const meter = state.transformationMeters[heroId] || 0;
      if (meter < 100) {
        console.warn(`Not enough energy to transform ${heroId}`);
        return;
      }
    }
    
    set((state) => ({
      transformationLevels: {
        ...state.transformationLevels,
        [heroId]: level
      },
      transformationMeters: {
        ...state.transformationMeters,
        [heroId]: level > 0 ? 0 : state.transformationMeters[heroId] || 0
      },
      activeTransformDuration: {
        ...state.activeTransformDuration,
        [heroId]: level > 0 ? 600 : 0 // 10 seconds at 60fps
      }
    }));
  },
  
  deactivateTransformation: (heroId) => set((state) => ({
    transformationLevels: {
      ...state.transformationLevels,
      [heroId]: 0
    },
    activeTransformDuration: {
      ...state.activeTransformDuration,
      [heroId]: 0
    }
  })),
  
  unlockTransformation: (heroId, level) => set((state) => {
    const current = state.unlockedTransformations[heroId] || [0];
    if (current.includes(level)) return state;
    
    return {
      unlockedTransformations: {
        ...state.unlockedTransformations,
        [heroId]: [...current, level].sort()
      }
    };
  }),
  
  getHeroTransformation: (heroId) => {
    const state = get();
    const level = state.transformationLevels[heroId] || 0;
    const bio = CHARACTER_BIOS.find(b => b.heroId === heroId);
    return bio?.transformations.find(t => t.level === level) || null;
  },
  
  canTransform: (heroId, level) => {
    const state = get();
    const unlocked = state.unlockedTransformations[heroId] || [0];
    const meter = state.transformationMeters[heroId] || 0;
    
    return unlocked.includes(level) && (level === 0 || meter >= 100);
  },
  
  tickTransformDuration: (heroId) => set((state) => {
    const duration = state.activeTransformDuration[heroId] || 0;
    if (duration <= 0) return state;
    
    const newDuration = duration - 1;
    
    // Auto-revert when duration expires
    if (newDuration <= 0) {
      return {
        activeTransformDuration: {
          ...state.activeTransformDuration,
          [heroId]: 0
        },
        transformationLevels: {
          ...state.transformationLevels,
          [heroId]: 0
        }
      };
    }
    
    return {
      activeTransformDuration: {
        ...state.activeTransformDuration,
        [heroId]: newDuration
      }
    };
  }),
}));
