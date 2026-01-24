/**
 * LEGENDARY STORY ENHANCEMENTS - BEYOND BEYOND LEGENDARY
 * 
 * World-class story system with:
 * - Enhanced villains
 * - Epic narrative moments
 * - Character arcs
 * - Story beats
 * - Cinematic sequences
 */

export interface LegendaryVillain {
  id: string;
  name: string;
  title: string;
  description: string;
  
  // Visual Design
  appearance: {
    height: number;
    build: 'massive' | 'towering' | 'imposing' | 'ethereal';
    colorPalette: {
      primary: string;
      secondary: string;
      emissive: string;
    };
    uniqueFeatures: string[];
    silhouette: string;
  };
  
  // Personality & Motivation
  personality: {
    traits: string[];
    motivation: string;
    flaw: string;
    goal: string;
  };
  
  // Powers & Abilities
  powers: {
    signature: string[];
    ultimate: string;
    weakness: string;
    resistance: string[];
  };
  
  // Story Role
  storyRole: {
    book: number;
    chapter: number;
    significance: string;
    arc: string;
  };
  
  // Boss Fight
  bossFight: {
    health: number;
    phases: number;
    specialMechanics: string[];
    cinematicMoments: string[];
  };
}

/**
 * ENHANCED VOID KING
 */
export const LEGENDARY_VOID_KING_STORY: LegendaryVillain = {
  id: 'void_king_legendary',
  name: 'The Void King',
  title: 'The Architect of Oblivion',
  description: 'The entity that seeks to sever the Weave of Reality itself. Born from the collective despair of destroyed universes.',
  
  appearance: {
    height: 8.0, // Massive
    build: 'towering',
    colorPalette: {
      primary: '#000000', // Pure void black
      secondary: '#FF0000', // Void energy red
      emissive: '#FF0000', // Glowing void
    },
    uniqueFeatures: [
      'reality_fragments_orbiting',
      'void_energy_tendrils',
      'broken_reality_aura',
      'glitch_visual_effects',
      'static_decay_field',
    ],
    silhouette: 'Towering figure with reality fragments orbiting, void energy tendrils, glitch effects',
  },
  
  personality: {
    traits: ['silent', 'inevitable', 'absolute', 'desperate', 'broken'],
    motivation: 'End all suffering by ending existence itself',
    flaw: 'Cannot comprehend that existence has value',
    goal: 'Sever the Weave and collapse all realities into void',
  },
  
  powers: {
    signature: [
      'void_clench', // Collapses space
      'legendary_end', // Ground-shattering attack
      'glitch_step', // Reality-skipping teleport
      'reality_override', // Breaks game rules
    ],
    ultimate: 'existence_erasure',
    weakness: 'The Weave itself - reality resists void',
    resistance: ['physical', 'energy', 'time', 'reality'],
  },
  
  storyRole: {
    book: 9,
    chapter: 9,
    significance: 'Final boss - the ultimate threat',
    arc: 'The Choice - player decides fate of reality',
  },
  
  bossFight: {
    health: 10000,
    phases: 4,
    specialMechanics: [
      'reality_break', // Breaks game rules
      'void_dominance', // Overwhelms player
      'weave_resistance', // Reality fights back
      'final_choice', // Player agency moment
    ],
    cinematicMoments: [
      'void_king_awakening',
      'reality_collapse',
      'weave_restoration',
      'final_choice',
      'epic_conclusion',
    ],
  },
};

/**
 * ENHANCED ALL-HIGH
 */
export const LEGENDARY_ALL_HIGH_STORY: LegendaryVillain = {
  id: 'all_high_legendary',
  name: 'The All-High',
  title: 'The Cosmic Judge',
  description: 'A divine entity that judges whether mortals deserve to exist. Hosts the Multiverse Gauntlet.',
  
  appearance: {
    height: 10.0, // Towering
    build: 'imposing',
    colorPalette: {
      primary: '#FFFFFF', // Divine white
      secondary: '#FFD700', // Gold
      emissive: '#FFFFFF', // Pure light
    },
    uniqueFeatures: [
      'divine_aura',
      'cosmic_judgment_eyes',
      'multiverse_gauntlet',
      'reality_trials',
      'divine_armor',
    ],
    silhouette: 'Towering divine figure with cosmic judgment presence',
  },
  
  personality: {
    traits: ['judgmental', 'cosmic', 'lawful', 'testing', 'fair'],
    motivation: 'Determine if mortals deserve existence',
    flaw: 'Bound by cosmic law - cannot act directly',
    goal: 'Judge through trials, not destroy',
  },
  
  powers: {
    signature: [
      'divine_judgment',
      'multiverse_gauntlet',
      'reality_trials',
      'cosmic_verdict',
    ],
    ultimate: 'final_judgment',
    weakness: 'Cosmic law - must follow rules',
    resistance: ['all', 'except_cosmic_law'],
  },
  
  storyRole: {
    book: 8,
    chapter: 8,
    significance: 'Tests heroes before final battle',
    arc: 'The Trial - prove worthiness',
  },
  
  bossFight: {
    health: 8000,
    phases: 3,
    specialMechanics: [
      'five_divine_trials',
      'team_synergy_required',
      'cosmic_law_constraints',
      'worthiness_test',
    ],
    cinematicMoments: [
      'all_high_appearance',
      'trial_beginning',
      'trial_completion',
      'verdict_pronouncement',
    ],
  },
};

/**
 * ENHANCED RIFT GENERALS
 */
export const LEGENDARY_RIFT_GENERALS_STORY: LegendaryVillain[] = [
  {
    id: 'void_tower_warden_legendary',
    name: 'Void Tower Warden',
    title: 'The Unbreakable Shield',
    description: 'A fortress defender corrupted by void energy. Protects the Void Tower with unbreakable defense.',
    
    appearance: {
      height: 6.0,
      build: 'imposing',
      colorPalette: {
        primary: '#1a1a1a',
        secondary: '#666666',
        emissive: '#ff0000',
      },
      uniqueFeatures: [
        'massive_shield',
        'fortress_armor',
        'defensive_barriers',
        'void_corruption',
      ],
      silhouette: 'Heavily armored with massive shield',
    },
    
    personality: {
      traits: ['defensive', 'unyielding', 'corrupted', 'protective'],
      motivation: 'Protect the Void Tower at all costs',
      flaw: 'Cannot move from defensive position',
      goal: 'Prevent heroes from reaching tower',
    },
    
    powers: {
      signature: ['shield_bash', 'fortress_defense', 'barrier_expansion'],
      ultimate: 'tower_collapse',
      weakness: 'Attacks from behind',
      resistance: ['frontal_attacks'],
    },
    
    storyRole: {
      book: 1,
      chapter: 6,
      significance: 'First major boss - teaches defensive strategy',
      arc: 'The Fortress - break through defenses',
    },
    
    bossFight: {
      health: 5000,
      phases: 2,
      specialMechanics: ['shield_blocking', 'fortress_defense', 'tower_collapse'],
      cinematicMoments: ['warden_appearance', 'shield_break', 'tower_fall'],
    },
  },
  {
    id: 'rift_harvester_legendary',
    name: 'Rift Harvester',
    title: 'The Life Drainer',
    description: 'A creature that harvests life force from the archipelago. Feeds on the energy of the living.',
    
    appearance: {
      height: 5.0,
      build: 'ethereal',
      colorPalette: {
        primary: '#4a0080',
        secondary: '#ff00ff',
        emissive: '#ff00ff',
      },
      uniqueFeatures: [
        'life_drain_tendrils',
        'soul_siphon_aura',
        'ethereal_form',
        'harvest_fields',
      ],
      silhouette: 'Ethereal form with life-draining tendrils',
    },
    
    personality: {
      traits: ['hungry', 'parasitic', 'desperate', 'consuming'],
      motivation: 'Feed on all life to survive',
      flaw: 'Cannot exist without feeding',
      goal: 'Harvest all life force',
    },
    
    powers: {
      signature: ['life_drain', 'harvest_beam', 'soul_siphon'],
      ultimate: 'mass_harvest',
      weakness: 'Life energy - too much overwhelms',
      resistance: ['physical', 'energy_drain'],
    },
    
    storyRole: {
      book: 2,
      chapter: 4,
      significance: 'Teaches resource management',
      arc: 'The Harvest - stop the draining',
    },
    
    bossFight: {
      health: 4000,
      phases: 2,
      specialMechanics: ['life_drain_over_time', 'harvest_fields', 'soul_siphon'],
      cinematicMoments: ['harvester_awakening', 'life_drain', 'harvest_stopped'],
    },
  },
];

/**
 * STORY BEAT ENHANCEMENTS
 */
export interface LegendaryStoryBeat {
  id: string;
  book: number;
  chapter: number;
  name: string;
  description: string;
  type: 'cinematic' | 'boss_fight' | 'character_moment' | 'plot_twist' | 'epic_moment';
  cinematic: {
    duration: number;
    cameraAngles: string[];
    music: string;
    visualEffects: string[];
  };
  significance: string;
}

export const LEGENDARY_STORY_BEATS: LegendaryStoryBeat[] = [
  {
    id: 'kai_jax_awakening',
    book: 1,
    chapter: 2,
    name: 'Kai-Jax Awakening',
    description: 'The moment Kai-Jax first transforms and discovers his memory powers',
    type: 'character_moment',
    cinematic: {
      duration: 3000,
      cameraAngles: ['low_angle', 'dramatic', 'close_up'],
      music: 'awakening_theme',
      visualEffects: ['memory_fragments', 'transformation_glow', 'three_tails_reveal'],
    },
    significance: 'Hero discovers true power',
  },
  {
    id: 'trinity_unite',
    book: 2,
    chapter: 8,
    name: 'Trinity Unite',
    description: 'Kai-Jax, Silver, and Lunara unite for the first time',
    type: 'epic_moment',
    cinematic: {
      duration: 5000,
      cameraAngles: ['wide', 'orbital', 'hero_shot'],
      music: 'trinity_theme',
      visualEffects: ['trinity_aura', 'reality_stabilization', 'power_convergence'],
    },
    significance: 'The Trinity forms',
  },
  {
    id: 'void_king_confrontation',
    book: 9,
    chapter: 9,
    name: 'Final Confrontation',
    description: 'The ultimate battle against the Void King',
    type: 'boss_fight',
    cinematic: {
      duration: 10000,
      cameraAngles: ['dramatic', 'epic', 'cinematic'],
      music: 'final_battle_theme',
      visualEffects: ['reality_break', 'void_dominance', 'weave_restoration'],
    },
    significance: 'The final choice',
  },
];
