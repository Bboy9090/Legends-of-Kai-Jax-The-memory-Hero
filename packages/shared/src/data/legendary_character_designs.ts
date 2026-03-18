/**
 * LEGENDARY CHARACTER DESIGNS - BEYOND BEYOND LEGENDARY
 * 
 * World-class character designs with:
 * - Heroic proportions
 * - Unique silhouettes
 * - Enhanced colors and materials
 * - Character-specific effects
 * - Skin/costume variations
 */

import type { CharacterDNA } from './character_dna';

export interface LegendaryCharacterDesign {
  characterId: string;
  
  // Visual Design
  proportions: {
    height: number; // Units
    build: 'athletic' | 'powerful' | 'agile' | 'balanced' | 'massive';
    shoulderWidth: number; // Heroic shoulders
    waistWidth: number;
    limbLength: number;
  };
  
  // Colors & Materials
  colorPalette: {
    primary: string; // Main color
    secondary: string; // Accent color
    tertiary: string; // Detail color
    emissive: string; // Glow color
    metal: number; // 0-1 metallic
    rough: number; // 0-1 roughness
  };
  
  // Unique Features
  uniqueFeatures: {
    accessories: string[]; // Capes, armor, emblems, etc.
    specialEffects: string[]; // Auras, trails, particles
    silhouetteElements: string[]; // What makes them recognizable
  };
  
  // Skins/Variations
  skins: Array<{
    id: string;
    name: string;
    colorVariations: Record<string, string>;
    specialFeatures: string[];
    unlockCondition: string;
  }>;
  
  // Animation Enhancements
  animationEnhancements: {
    attackTrails: boolean;
    impactEffects: boolean;
    transformationEffects: boolean;
    emotionExpressions: boolean;
  };
}

/**
 * ENHANCED KAI-JAX DESIGN
 */
export const LEGENDARY_KAI_JAX_DESIGN: LegendaryCharacterDesign = {
  characterId: 'KAI-JAX',
  proportions: {
    height: 3.5,
    build: 'balanced',
    shoulderWidth: 1.2,
    waistWidth: 0.8,
    limbLength: 1.0,
  },
  colorPalette: {
    primary: '#1a1a1a', // Obsidian charcoal
    secondary: '#88d0ff', // Memory blue
    tertiary: '#ffd700', // Gold accents
    emissive: '#88d0ff', // Memory glow
    metal: 0.35,
    rough: 0.25,
  },
  uniqueFeatures: {
    accessories: [
      'three_memory_tails', // Gold/Blue/White tails
      'memory_aura', // Glowing memory fragments
      'sage_mode_eyes', // Neon-gold slit pupils
      'electric_quills', // Jagged electric quills
    ],
    specialEffects: [
      'memory_fragment_particles',
      'echo_trail',
      'temporal_distortion',
      'memory_network_glow',
    ],
    silhouetteElements: [
      'three_distinct_tails',
      'rounded_body',
      'electric_quills',
      'memory_aura',
    ],
  },
  skins: [
    {
      id: 'default',
      name: 'Memory Hero',
      colorVariations: {
        primary: '#1a1a1a',
        secondary: '#88d0ff',
      },
      specialFeatures: ['three_tails', 'memory_aura'],
      unlockCondition: 'default',
    },
    {
      id: 'awakened',
      name: 'Awakened Form',
      colorVariations: {
        primary: '#000000',
        secondary: '#ffffff',
        tertiary: '#ffd700',
      },
      specialFeatures: ['enhanced_tails', 'divine_aura', 'transcendent_glow'],
      unlockCondition: 'awakening_level_3',
    },
    {
      id: 'transcendent',
      name: 'Transcendent Form',
      colorVariations: {
        primary: '#ffffff',
        secondary: '#ff00ff',
        tertiary: '#00ffff',
      },
      specialFeatures: ['rainbow_tails', 'reality_break_aura', 'infinite_glow'],
      unlockCondition: 'transcendence_level_1',
    },
  ],
  animationEnhancements: {
    attackTrails: true,
    impactEffects: true,
    transformationEffects: true,
    emotionExpressions: true,
  },
};

/**
 * ENHANCED SILVER DESIGN
 */
export const LEGENDARY_SILVER_DESIGN: LegendaryCharacterDesign = {
  characterId: 'SILVER',
  proportions: {
    height: 4.0,
    build: 'agile',
    shoulderWidth: 1.0,
    waistWidth: 0.7,
    limbLength: 1.2,
  },
  colorPalette: {
    primary: '#c0c0ff', // Silver-white
    secondary: '#ffffff', // Pure white
    tertiary: '#0000ff', // Time blue
    emissive: '#c0c0ff', // Chronokinesis glow
    metal: 0.42,
    rough: 0.28,
  },
  uniqueFeatures: {
    accessories: [
      'temporal_distortion_field',
      'time_trails',
      'paradox_aura',
      'chrono_gloves',
    ],
    specialEffects: [
      'time_rewind_particles',
      'paradox_visuals',
      'temporal_freeze',
      'timeline_echoes',
    ],
    silhouetteElements: [
      'time_trails',
      'distortion_field',
      'silver_white_coloring',
      'chrono_effects',
    ],
  },
  skins: [
    {
      id: 'default',
      name: 'Time-Fixer',
      colorVariations: {
        primary: '#c0c0ff',
        secondary: '#ffffff',
      },
      specialFeatures: ['time_trails', 'paradox_aura'],
      unlockCondition: 'default',
    },
    {
      id: 'paradox_master',
      name: 'Paradox Master',
      colorVariations: {
        primary: '#ff00ff',
        secondary: '#00ffff',
      },
      specialFeatures: ['enhanced_paradox', 'reality_break'],
      unlockCondition: 'paradox_mastery',
    },
  ],
  animationEnhancements: {
    attackTrails: true,
    impactEffects: true,
    transformationEffects: true,
    emotionExpressions: true,
  },
};

/**
 * ENHANCED LUNARA DESIGN
 */
export const LEGENDARY_LUNARA_DESIGN: LegendaryCharacterDesign = {
  characterId: 'LUNARA',
  proportions: {
    height: 5.8,
    build: 'agile',
    shoulderWidth: 1.1,
    waistWidth: 0.6,
    limbLength: 1.3,
  },
  colorPalette: {
    primary: '#ffd0ff', // Liquid starlight
    secondary: '#ffffff', // Pure white
    tertiary: '#ffd700', // Gold
    emissive: '#ffd0ff', // Harmony glow
    metal: 0.30,
    rough: 0.20,
  },
  uniqueFeatures: {
    accessories: [
      'nine_sovereign_tails',
      'harmony_armor',
      'weave_protection_aura',
      'celestial_crown',
    ],
    specialEffects: [
      'harmony_resonance',
      'weave_visualization',
      'team_synergy_glow',
      'celestial_particles',
    ],
    silhouetteElements: [
      'nine_tails',
      'ethereal_form',
      'harmony_aura',
      'celestial_elements',
    ],
  },
  skins: [
    {
      id: 'default',
      name: 'Oracle Sentinel',
      colorVariations: {
        primary: '#ffd0ff',
        secondary: '#ffffff',
      },
      specialFeatures: ['nine_tails', 'harmony_aura'],
      unlockCondition: 'default',
    },
    {
      id: 'sovereign',
      name: 'Sovereign Form',
      colorVariations: {
        primary: '#ffffff',
        secondary: '#ffd700',
      },
      specialFeatures: ['enhanced_tails', 'divine_aura'],
      unlockCondition: 'sovereign_unlock',
    },
  ],
  animationEnhancements: {
    attackTrails: true,
    impactEffects: true,
    transformationEffects: true,
    emotionExpressions: true,
  },
};

/**
 * ENHANCED JAXON DESIGN
 */
export const LEGENDARY_JAXON_DESIGN: LegendaryCharacterDesign = {
  characterId: 'JAXON',
  proportions: {
    height: 3.8,
    build: 'athletic',
    shoulderWidth: 1.3,
    waistWidth: 0.9,
    limbLength: 1.1,
  },
  colorPalette: {
    primary: '#0066FF', // Electric blue
    secondary: '#00FF00', // Green accents
    tertiary: '#FFD700', // Gold
    emissive: '#00FFFF', // Electric glow
    metal: 0.40,
    rough: 0.30,
  },
  uniqueFeatures: {
    accessories: [
      'electric_quills', // 7 massive quills
      'speed_trails',
      'energy_aura',
      'combat_gear',
    ],
    specialEffects: [
      'electric_particles',
      'speed_afterimages',
      'energy_bursts',
      'momentum_trails',
    ],
    silhouetteElements: [
      'seven_quills',
      'electric_glow',
      'speedster_build',
      'energy_effects',
    ],
  },
  skins: [
    {
      id: 'default',
      name: 'Electric Speedster',
      colorVariations: {
        primary: '#0066FF',
        secondary: '#00FF00',
      },
      specialFeatures: ['electric_quills', 'speed_trails'],
      unlockCondition: 'default',
    },
    {
      id: 'super',
      name: 'Super Form',
      colorVariations: {
        primary: '#FFD700',
        secondary: '#FFFFFF',
      },
      specialFeatures: ['golden_quills', 'super_aura'],
      unlockCondition: 'super_unlock',
    },
  ],
  animationEnhancements: {
    attackTrails: true,
    impactEffects: true,
    transformationEffects: true,
    emotionExpressions: true,
  },
};

/**
 * ENHANCED KAISON DESIGN
 */
export const LEGENDARY_KAISON_DESIGN: LegendaryCharacterDesign = {
  characterId: 'KAISON',
  proportions: {
    height: 4.2,
    build: 'agile',
    shoulderWidth: 1.1,
    waistWidth: 0.8,
    limbLength: 1.2,
  },
  colorPalette: {
    primary: '#FF8C00', // Golden-orange
    secondary: '#0066FF', // Blue accents
    tertiary: '#00C853', // Green
    emissive: '#FFD700', // Gold glow
    metal: 0.35,
    rough: 0.25,
  },
  uniqueFeatures: {
    accessories: [
      'two_tails', // Energy-like tails
      'web_equipment',
      'tactical_jacket',
      'guardian_emblem',
    ],
    specialEffects: [
      'web_trails',
      'guardian_aura',
      'speed_effects',
      'tactical_indicators',
    ],
    silhouetteElements: [
      'two_tails',
      'fox_snout',
      'tactical_gear',
      'guardian_presence',
    ],
  },
  skins: [
    {
      id: 'default',
      name: 'Swift Guardian',
      colorVariations: {
        primary: '#FF8C00',
        secondary: '#0066FF',
      },
      specialFeatures: ['two_tails', 'web_equipment'],
      unlockCondition: 'default',
    },
  ],
  animationEnhancements: {
    attackTrails: true,
    impactEffects: true,
    transformationEffects: true,
    emotionExpressions: true,
  },
};

/**
 * ALL LEGENDARY DESIGNS
 */
export const ALL_LEGENDARY_DESIGNS: LegendaryCharacterDesign[] = [
  LEGENDARY_KAI_JAX_DESIGN,
  LEGENDARY_SILVER_DESIGN,
  LEGENDARY_LUNARA_DESIGN,
  LEGENDARY_JAXON_DESIGN,
  LEGENDARY_KAISON_DESIGN,
];

/**
 * Get design by character ID
 */
export function getLegendaryDesign(characterId: string): LegendaryCharacterDesign | undefined {
  return ALL_LEGENDARY_DESIGNS.find(design => design.characterId === characterId);
}
