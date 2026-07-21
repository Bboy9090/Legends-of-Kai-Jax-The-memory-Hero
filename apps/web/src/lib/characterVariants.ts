/**
 * Character Variants System
 * Skin/color variants via material swaps — no new art assets required.
 * Variants recolor the base GLB materials at load time.
 */

export interface VariantColorSwap {
  targetMaterial: string; // material name pattern in the GLB
  color: string; // hex color to apply
  emissive?: string; // optional emissive tint
  emissiveIntensity?: number;
}

export interface CharacterVariant {
  id: string;
  fighterId: string;
  name: string;
  description: string;
  rarity: 'default' | 'rare' | 'epic' | 'legendary';
  colorSwaps: VariantColorSwap[];
  accentColor: string; // UI accent when variant is equipped
  unlockCondition: {
    type: 'default' | 'level' | 'quest' | 'challenge' | 'mission';
    requirement?: string | number;
    description: string;
  };
}

export const CHARACTER_VARIANTS: CharacterVariant[] = [
  // KAI-JAX VARIANTS
  {
    id: 'kai-jax-default',
    fighterId: 'kai-jax',
    name: 'Memory King',
    description: 'The canonical fusion form of Kai and Jax.',
    rarity: 'default',
    colorSwaps: [],
    accentColor: '#2e2efe',
    unlockCondition: { type: 'default', description: 'Available from the start' },
  },
  {
    id: 'kai-jax-void',
    fighterId: 'kai-jax',
    name: 'Void Archive',
    description: 'Kai-Jax steeped in Rift energy — obsidian fur, violet glow.',
    rarity: 'epic',
    colorSwaps: [
      { targetMaterial: 'fur', color: '#12101c' },
      { targetMaterial: 'accent', color: '#7c3aed', emissive: '#7c3aed', emissiveIntensity: 0.6 },
      { targetMaterial: 'tail', color: '#1e1b30' },
    ],
    accentColor: '#7c3aed',
    unlockCondition: {
      type: 'mission',
      requirement: 'story_act2_m5',
      description: 'Complete Act II',
    },
  },
  {
    id: 'kai-jax-gold',
    fighterId: 'kai-jax',
    name: 'Golden Convergence',
    description: 'The nine tails burn with golden memory-light.',
    rarity: 'legendary',
    colorSwaps: [
      { targetMaterial: 'fur', color: '#4a3208' },
      { targetMaterial: 'accent', color: '#ffbf00', emissive: '#ffbf00', emissiveIntensity: 0.8 },
      { targetMaterial: 'tail', color: '#8a6a1a' },
    ],
    accentColor: '#ffbf00',
    unlockCondition: {
      type: 'mission',
      requirement: 'story_act3_m5',
      description: 'Complete the full 15-mission campaign',
    },
  },

  // KAISON VARIANTS
  {
    id: 'kaison-default',
    fighterId: 'kaison',
    name: 'Bronx Ghost',
    description: 'Kaison in his standard tactical gear.',
    rarity: 'default',
    colorSwaps: [],
    accentColor: '#ff3b30',
    unlockCondition: { type: 'default', description: 'Available from the start' },
  },
  {
    id: 'kaison-frost',
    fighterId: 'kaison',
    name: 'Frostbite',
    description: 'Winter operations camouflage with ice-blue webbing.',
    rarity: 'rare',
    colorSwaps: [
      { targetMaterial: 'fur', color: '#dbeafe' },
      { targetMaterial: 'accent', color: '#38bdf8', emissive: '#38bdf8', emissiveIntensity: 0.4 },
    ],
    accentColor: '#38bdf8',
    unlockCondition: {
      type: 'level',
      requirement: 10,
      description: 'Reach level 10 with Kaison',
    },
  },

  // JAXON VARIANTS
  {
    id: 'jaxon-default',
    fighterId: 'jaxon',
    name: 'Bronx Thunder',
    description: 'Jaxon with his signature storm quills.',
    rarity: 'default',
    colorSwaps: [],
    accentColor: '#22d3ee',
    unlockCondition: { type: 'default', description: 'Available from the start' },
  },
  {
    id: 'jaxon-ember',
    fighterId: 'jaxon',
    name: 'Emberstorm',
    description: 'Lightning turned to fire — crimson quills crackling with heat.',
    rarity: 'rare',
    colorSwaps: [
      { targetMaterial: 'fur', color: '#3b0f0f' },
      { targetMaterial: 'accent', color: '#f97316', emissive: '#f97316', emissiveIntensity: 0.5 },
    ],
    accentColor: '#f97316',
    unlockCondition: {
      type: 'challenge',
      requirement: 'challenge_speedrun_act1',
      description: 'Complete the Act I Speedrun Challenge',
    },
  },
];

/**
 * Get all variants for a fighter
 */
export function getVariantsForFighter(fighterId: string): CharacterVariant[] {
  return CHARACTER_VARIANTS.filter((v) => v.fighterId === fighterId);
}

/**
 * Get a variant by ID (falls back to fighter default)
 */
export function getVariant(variantId: string): CharacterVariant | null {
  return CHARACTER_VARIANTS.find((v) => v.id === variantId) ?? null;
}

/**
 * Get the default variant for a fighter
 */
export function getDefaultVariant(fighterId: string): CharacterVariant | null {
  return CHARACTER_VARIANTS.find((v) => v.fighterId === fighterId && v.rarity === 'default') ?? null;
}

/**
 * Check whether a variant is unlocked given player progress
 */
export function isVariantUnlocked(
  variant: CharacterVariant,
  progress: {
    characterLevel: number;
    completedMissions: string[];
    completedQuests: string[];
  }
): boolean {
  const cond = variant.unlockCondition;
  switch (cond.type) {
    case 'default':
      return true;
    case 'level':
      return progress.characterLevel >= (cond.requirement as number);
    case 'mission':
      return progress.completedMissions.includes(cond.requirement as string);
    case 'quest':
    case 'challenge':
      return progress.completedQuests.includes(cond.requirement as string);
    default:
      return false;
  }
}
