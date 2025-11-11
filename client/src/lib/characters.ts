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
  // Main Heroes - Jaxon & Kaison
  {
    id: 'jaxon',
    name: 'Jaxon',
    displayName: 'Jaxon',
    color: '#DC143C', // Deep Crimson Red
    accentColor: '#FFD700', // Fiery Gold
    description: 'Super fast hero with sonic powers!',
    category: 'heroes',
    unlocked: true
  },
  {
    id: 'kaison',
    name: 'Kaison',
    displayName: 'Kaison',
    color: '#00CED1', // Vibrant Cyan
    accentColor: '#00FF00', // Bright Green
    description: 'Lightning quick hero with electric speed!',
    category: 'heroes',
    unlocked: true
  },
  
  // Mario spoof - Marlo the Plumber
  {
    id: 'marlo',
    name: 'Marlo',
    displayName: 'Marlo',
    color: '#FF6B6B', // Lighter red than Mario
    accentColor: '#4ECDC4', // Teal instead of blue
    description: 'Jumping plumber who loves mushrooms!',
    category: 'heroes',
    unlocked: true
  },
  
  // Luigi spoof - Leonardo
  {
    id: 'leonardo',
    name: 'Leonardo',
    displayName: 'Leonardo',
    color: '#95E1D3', // Light green
    accentColor: '#F38181', // Pink instead of red
    description: 'Tall jumper and Marlo\'s brother!',
    category: 'heroes',
    unlocked: false,
    unlockRequirement: 500
  },
  
  // Sonic spoof - Speedy the Hedgehog
  {
    id: 'speedy',
    name: 'Speedy',
    displayName: 'Speedy',
    color: '#4A90E2', // Bright blue
    accentColor: '#FFD700', // Gold
    description: 'The fastest hedgehog alive!',
    category: 'speedsters',
    unlocked: true
  },
  
  // Shadow spoof - Midnight
  {
    id: 'midnight',
    name: 'Midnight',
    displayName: 'Midnight',
    color: '#2C3E50', // Dark blue-gray
    accentColor: '#E74C3C', // Red
    description: 'Dark and mysterious speedster!',
    category: 'speedsters',
    unlocked: false,
    unlockRequirement: 1000
  },
  
  // Link spoof - Flynn the Hero
  {
    id: 'flynn',
    name: 'Flynn',
    displayName: 'Flynn',
    color: '#27AE60', // Green
    accentColor: '#F39C12', // Gold
    description: 'Brave hero with a magic sword!',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 750
  },
  
  // Pikachu spoof - Sparky
  {
    id: 'sparky',
    name: 'Sparky',
    displayName: 'Sparky',
    color: '#F4D03F', // Yellow
    accentColor: '#E74C3C', // Red
    description: 'Electric critter with shocking powers!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 1500
  },
  
  // Kirby spoof - Bubble
  {
    id: 'bubble',
    name: 'Bubble',
    displayName: 'Bubble',
    color: '#FF9FF3', // Pink
    accentColor: '#54A0FF', // Blue
    description: 'Round and bouncy fighter!',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 2000
  },
  
  // Bowser spoof - King Spike
  {
    id: 'kingspike',
    name: 'King Spike',
    displayName: 'King Spike',
    color: '#E67E22', // Orange
    accentColor: '#8E44AD', // Purple
    description: 'Big strong turtle king!',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 2500
  },
  
  // Fox McCloud spoof - Captain Blaze
  {
    id: 'captainblaze',
    name: 'Captain Blaze',
    displayName: 'Captain Blaze',
    color: '#95A5A6', // Gray
    accentColor: '#3498DB', // Blue
    description: 'Space pilot with laser blasters!',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 3000
  },
  
  // Samus spoof - Nova Knight
  {
    id: 'novaknight',
    name: 'Nova Knight',
    displayName: 'Nova Knight',
    color: '#E91E63', // Pink/Magenta instead of orange
    accentColor: '#9C27B0', // Purple
    description: 'Armored space warrior!',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 3500
  }
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
