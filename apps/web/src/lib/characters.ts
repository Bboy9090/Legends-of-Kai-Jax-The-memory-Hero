// Character roster for the Super Smash-style fighting game
// Spoof versions of famous characters to avoid copyright

export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  description: string;
  category: 'heroes' | 'speedsters' | 'warriors' | 'legends';
  unlocked: boolean;
  unlockRequirement?: number;
}

export const FIGHTERS: Fighter[] = [
  // GENESIS ROSTER - ORIGINAL BEAST CHARACTERS
  
  // KAI-JAX - The Memory King (MAIN PROTAGONIST)
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    displayName: 'KAI-JAX',
    color: '#1A1A2E', // Obsidian charcoal
    accentColor: '#FFD700', // Golden memory echoes
    description: 'The Memory King! Star-Slime Chimera with 3 tails and electric quills!',
    category: 'legends',
    unlocked: true
  },
  
  // Boryx Zenith - The Guardian King
  {
    id: 'boryx-zenith',
    name: 'Boryx Zenith',
    displayName: 'Boryx Zenith',
    color: '#8B4513', // Bronx brown
    accentColor: '#CD7F32', // Bronze
    description: 'The Guardian King! Draconic Ursine with chaos-infused source star!',
    category: 'warriors',
    unlocked: true
  },
  
  // Lunara Solis - The Oracle Sentinel
  {
    id: 'lunara-solis',
    name: 'Lunara Solis',
    displayName: 'Lunara Solis',
    color: '#FFD700', // Gold in sunlight
    accentColor: '#C0C0C0', // Silver in moonlight
    description: 'The Oracle Sentinel! 9-tailed Celestial Kitsune with liquid starlight fur!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 1000
  },
  
  // Umbra-Flux - The Velocity Wraith
  {
    id: 'umbra-flux',
    name: 'Umbra-Flux',
    displayName: 'Umbra-Flux',
    color: '#FFFFFF', // Matte-white metallic
    accentColor: '#00CED1', // Cyan iridescent
    description: 'The Velocity Wraith! Star-Wolf with 5 elemental tails and hypersonic speed!',
    category: 'speedsters',
    unlocked: false,
    unlockRequirement: 750
  },
  
  // Sentinel Vox - The Chrono-Tactician
  {
    id: 'sentinel-vox',
    name: 'Sentinel Vox',
    displayName: 'Sentinel Vox',
    color: '#708090', // Steel gray
    accentColor: '#FF4500', // Orange-red visor
    description: 'The Chrono-Tactician! Cybernetic Commander with time-lock abilities!',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 1500
  },
  
  // Chronos Sere - The Extinction Sovereign
  {
    id: 'chronos-sere',
    name: 'Chronos Sere',
    displayName: 'Chronos Sere',
    color: '#4B0082', // Indigo void
    accentColor: '#9370DB', // Medium purple
    description: 'The Extinction Sovereign! Time-Wielding Warlord from the Collapse!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 2500
  },
  
  // Silver - The Time Warden (Eternal Triad)
  {
    id: 'silver',
    name: 'SILVER',
    displayName: 'SILVER',
    color: '#C0C0C0', // Silver-white
    accentColor: '#00E5FF', // Cyan chrono-energy
    description: 'The Time Warden! Psychokinetic time-traveler with ESP!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 3000
  },
  
  // Voidonus Imperion - The Void King (ULTIMATE VILLAIN)
  {
    id: 'voidonus',
    name: 'Voidonus Imperion',
    displayName: 'Voidonus Imperion',
    color: '#0A0A0A', // Void black
    accentColor: '#8B00FF', // Neon violet
    description: 'The Void King! The End of All Things - ultimate darkness!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 5000
  },
];

export function getFighterById(id: string): Fighter | undefined {
  return FIGHTERS.find(f => f.id === id);
}

export function getUnlockedFighters(): Fighter[] {
  return FIGHTERS.filter(f => f.unlocked);
}

export function getFightersByCategory(category: Fighter['category']): Fighter[] {
  return FIGHTERS.filter(f => f.category === category);
}

export function canUnlockFighter(fighter: Fighter, score: number): boolean {
  if (fighter.unlocked) return false;
  if (!fighter.unlockRequirement) return true;
  return score >= fighter.unlockRequirement;
}
