/**
 * BEAST CHARACTERS - BRONX BORN MYTHICAL REFORGED
 * 
 * Complete character roster using legendary beast hybrids:
 * - All unique beast combinations
 * - Bronx-inspired names
 * - Coolest, most wanted hybrids
 */

const COMPLETE_BEAST_ROSTER: any[] = [];
export type LegendaryBeast = any;
const getNameWithTitle = (id: string) => id;

export interface BeastFighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  description: string;
  archetype: string;
  role: string;
  category: 'trinity' | 'bird-dragon' | 'bird-frog' | 'reptile-wolf' | 'spider' | 'underdog' | 'legacy' | 'secret';
  unlocked: boolean;
  unlockRequirement?: number;
  bookUnlock?: number;
  beastHybrid: string;
  visualFeatures: string[];
}

/**
 * Convert LegendaryBeast to BeastFighter
 */
function convertToBeastFighter(beast: any, category: BeastFighter['category']): BeastFighter {
  const fullName = beast.title ? `${beast.name}, ${beast.title}` : beast.name;
  
  return {
    id: beast.id,
    name: beast.name,
    displayName: fullName,
    color: beast.visual?.primaryColor || '#1a1a1a',
    accentColor: beast.visual?.accentColor || '#7fff00',
    description: beast.description || '',
    archetype: beast.beastHybrid || '',
    role: beast.role || 'hero',
    category,
    unlocked: true, // ALL CHARACTERS PLAYABLE
    bookUnlock: beast.unlock?.book || 1,
    beastHybrid: beast.beastHybrid || '',
    visualFeatures: beast.visual?.features || [],
  };
}

/**
 * COMPLETE BEAST FIGHTERS ROSTER
 */
export const BEAST_FIGHTERS: BeastFighter[] = COMPLETE_BEAST_ROSTER.map((beast, index) => {
  // Categorize based on beast hybrid
  let category: BeastFighter['category'] = 'underdog';
  
  if (beast.id === 'kaison' || beast.id === 'jaxon' || beast.id === 'kai-jax') {
    category = 'trinity';
  } else if (beast.beastHybrid.includes('Dragon') && beast.beastHybrid.includes('Bird')) {
    category = 'bird-dragon';
  } else if (beast.beastHybrid.includes('Frog') && beast.beastHybrid.includes('Bird')) {
    category = 'bird-frog';
  } else if (beast.beastHybrid.includes('Wolf') && (beast.beastHybrid.includes('Reptile') || beast.beastHybrid.includes('Lizard') || beast.beastHybrid.includes('Snake') || beast.beastHybrid.includes('Alligator') || beast.beastHybrid.includes('Crocodile'))) {
    category = 'reptile-wolf';
  } else if (beast.beastHybrid.includes('Spider')) {
    category = 'spider';
  } else {
    category = 'underdog';
  }
  
  return convertToBeastFighter(beast, category);
});

/**
 * Get fighter by ID
 */
export function getBeastFighterById(id: string): BeastFighter | undefined {
  return BEAST_FIGHTERS.find(f => f.id === id);
}

/**
 * Get all unlocked fighters - ALL CHARACTERS ARE PLAYABLE!
 */
export function getUnlockedBeastFighters(): BeastFighter[] {
  return BEAST_FIGHTERS; // All characters unlocked!
}

/**
 * Get fighters by category
 */
export function getBeastFightersByCategory(category: BeastFighter['category']): BeastFighter[] {
  return BEAST_FIGHTERS.filter(f => f.category === category);
}

/**
 * Get fighters by role
 */
export function getBeastFightersByRole(role: BeastFighter['role']): BeastFighter[] {
  return BEAST_FIGHTERS.filter(f => f.role === role);
}

/**
 * Check if fighter can be unlocked - ALL CHARACTERS ARE PLAYABLE!
 */
export function canUnlockBeastFighter(fighter: BeastFighter, score: number): boolean {
  return true; // All characters unlocked!
}
