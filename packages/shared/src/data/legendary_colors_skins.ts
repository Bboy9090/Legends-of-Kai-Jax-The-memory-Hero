/**
 * LEGENDARY COLOR & SKIN SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class color and skin system with:
 * - Advanced color palettes
 * - Skin variations
 * - Dynamic color systems
 * - Emissive glows
 * - Material variations
 */

export interface ColorPalette {
  // Base colors
  primary: string; // Main body color
  secondary: string; // Accent color
  tertiary: string; // Detail color
  quaternary: string; // Special detail
  
  // Emissive colors
  emissive: string; // Glow color
  emissiveIntensity: number; // 0-2
  
  // Material properties
  metalness: number; // 0-1
  roughness: number; // 0-1
  
  // Special effects
  glowColor: string;
  auraColor: string;
  trailColor: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  colorPalette: ColorPalette;
  specialFeatures: string[];
  unlockCondition: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

/**
 * KAI-JAX SKINS
 */
export const KAI_JAX_SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Memory Hero',
    description: 'Default form with memory powers',
    rarity: 'common',
    unlockCondition: 'default',
    colorPalette: {
      primary: '#1a1a1a',
      secondary: '#88d0ff',
      tertiary: '#ffd700',
      quaternary: '#ffffff',
      emissive: '#88d0ff',
      emissiveIntensity: 1.0,
      metalness: 0.35,
      roughness: 0.25,
      glowColor: '#88d0ff',
      auraColor: '#88d0ff',
      trailColor: '#88d0ff',
    },
    specialFeatures: ['three_tails', 'memory_aura', 'sage_eyes'],
  },
  {
    id: 'awakened',
    name: 'Awakened Form',
    description: 'Awakened state with enhanced memory powers',
    rarity: 'legendary',
    unlockCondition: 'awakening_level_3',
    colorPalette: {
      primary: '#000000',
      secondary: '#ffffff',
      tertiary: '#ffd700',
      quaternary: '#ff00ff',
      emissive: '#ffffff',
      emissiveIntensity: 1.5,
      metalness: 0.50,
      roughness: 0.15,
      glowColor: '#ffffff',
      auraColor: '#ffd700',
      trailColor: '#ff00ff',
    },
    specialFeatures: ['enhanced_tails', 'divine_aura', 'transcendent_glow'],
  },
  {
    id: 'transcendent',
    name: 'Transcendent Form',
    description: 'Beyond all limits - reality-breaking form',
    rarity: 'mythic',
    unlockCondition: 'transcendence_level_1',
    colorPalette: {
      primary: '#ffffff',
      secondary: '#ff00ff',
      tertiary: '#00ffff',
      quaternary: '#ffff00',
      emissive: '#ffffff',
      emissiveIntensity: 2.0,
      metalness: 0.70,
      roughness: 0.10,
      glowColor: '#ffffff',
      auraColor: '#ff00ff',
      trailColor: '#00ffff',
    },
    specialFeatures: ['rainbow_tails', 'reality_break_aura', 'infinite_glow'],
  },
  {
    id: 'void_resistant',
    name: 'Void Resistant',
    description: 'Form adapted to resist void energy',
    rarity: 'epic',
    unlockCondition: 'void_resistance_mastery',
    colorPalette: {
      primary: '#2a1a3a',
      secondary: '#ff0000',
      tertiary: '#ff8800',
      quaternary: '#ffff00',
      emissive: '#ff0000',
      emissiveIntensity: 1.2,
      metalness: 0.40,
      roughness: 0.20,
      glowColor: '#ff0000',
      auraColor: '#ff8800',
      trailColor: '#ffff00',
    },
    specialFeatures: ['void_resistance', 'anti_void_aura', 'reality_anchor'],
  },
];

/**
 * SILVER SKINS
 */
export const SILVER_SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Time-Fixer',
    description: 'Default temporal form',
    rarity: 'common',
    unlockCondition: 'default',
    colorPalette: {
      primary: '#c0c0ff',
      secondary: '#ffffff',
      tertiary: '#0000ff',
      quaternary: '#8888ff',
      emissive: '#c0c0ff',
      emissiveIntensity: 1.0,
      metalness: 0.42,
      roughness: 0.28,
      glowColor: '#c0c0ff',
      auraColor: '#ffffff',
      trailColor: '#0000ff',
    },
    specialFeatures: ['time_trails', 'paradox_aura', 'chrono_effects'],
  },
  {
    id: 'paradox_master',
    name: 'Paradox Master',
    description: 'Master of temporal paradoxes',
    rarity: 'legendary',
    unlockCondition: 'paradox_mastery',
    colorPalette: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      tertiary: '#ffffff',
      quaternary: '#ffff00',
      emissive: '#ff00ff',
      emissiveIntensity: 1.8,
      metalness: 0.55,
      roughness: 0.15,
      glowColor: '#ff00ff',
      auraColor: '#00ffff',
      trailColor: '#ffffff',
    },
    specialFeatures: ['enhanced_paradox', 'reality_break', 'temporal_dominance'],
  },
];

/**
 * LUNARA SKINS
 */
export const LUNARA_SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Oracle Sentinel',
    description: 'Default harmony form',
    rarity: 'common',
    unlockCondition: 'default',
    colorPalette: {
      primary: '#ffd0ff',
      secondary: '#ffffff',
      tertiary: '#ffd700',
      quaternary: '#ff88ff',
      emissive: '#ffd0ff',
      emissiveIntensity: 1.0,
      metalness: 0.30,
      roughness: 0.20,
      glowColor: '#ffd0ff',
      auraColor: '#ffffff',
      trailColor: '#ffd700',
    },
    specialFeatures: ['nine_tails', 'harmony_aura', 'weave_protection'],
  },
  {
    id: 'sovereign',
    name: 'Sovereign Form',
    description: 'Ultimate harmony form',
    rarity: 'mythic',
    unlockCondition: 'sovereign_unlock',
    colorPalette: {
      primary: '#ffffff',
      secondary: '#ffd700',
      tertiary: '#ff00ff',
      quaternary: '#00ffff',
      emissive: '#ffffff',
      emissiveIntensity: 2.0,
      metalness: 0.60,
      roughness: 0.10,
      glowColor: '#ffffff',
      auraColor: '#ffd700',
      trailColor: '#ff00ff',
    },
    specialFeatures: ['enhanced_tails', 'divine_aura', 'sovereign_presence'],
  },
];

/**
 * DYNAMIC COLOR SYSTEM
 */
export interface DynamicColorSystem {
  // Time-based colors (day/night cycle)
  timeBased: {
    day: ColorPalette;
    night: ColorPalette;
    transition: ColorPalette;
  };
  
  // Emotion-based colors
  emotionBased: {
    calm: ColorPalette;
    excited: ColorPalette;
    angry: ColorPalette;
    determined: ColorPalette;
  };
  
  // Power-based colors (based on meter levels)
  powerBased: {
    low: ColorPalette;
    medium: ColorPalette;
    high: ColorPalette;
    max: ColorPalette;
  };
}

/**
 * Get skin by ID
 */
export function getSkin(characterId: string, skinId: string): Skin | undefined {
  const allSkins = [
    ...KAI_JAX_SKINS,
    ...SILVER_SKINS,
    ...LUNARA_SKINS,
  ];
  
  return allSkins.find(skin => 
    skin.id === skinId && 
    (characterId === 'KAI-JAX' && KAI_JAX_SKINS.includes(skin) ||
     characterId === 'SILVER' && SILVER_SKINS.includes(skin) ||
     characterId === 'LUNARA' && LUNARA_SKINS.includes(skin))
  );
}

/**
 * Get all skins for character
 */
export function getCharacterSkins(characterId: string): Skin[] {
  switch (characterId) {
    case 'KAI-JAX':
      return KAI_JAX_SKINS;
    case 'SILVER':
      return SILVER_SKINS;
    case 'LUNARA':
      return LUNARA_SKINS;
    default:
      return [];
  }
}
