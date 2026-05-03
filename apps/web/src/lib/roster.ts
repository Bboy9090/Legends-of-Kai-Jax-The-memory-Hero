// LEGENDS OF KAI-JAX: OFFICIAL CHARACTER ROSTER
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

import { CHARACTER_SPECS } from './characterSpecs';

export type CharacterRole = 'Vanguard' | 'Blitzer' | 'Mystic' | 'Support' | 'Wildcard' | 'Tank' | 'Sniper' | 'Controller';

export interface CharacterStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  stamina: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  role: CharacterRole;
  stats: CharacterStats;
  baseDamage: number;
  transformations: string[];
  abilities: string[];
  ultimates: {
    level1: string;
    level2: string;
    level3: string;
    level4?: string;
  };
  synergies: string[];
  unlockLevel: number;
  primaryColor: string;
  accentColor: string;
}

export const CORE_HEROES: Character[] = [
  {
    id: 'kai-jax',
    name: 'Kai-Jax Zenith',
    title: 'The Memory Hero',
    role: 'Vanguard',
    stats: { health: 90, attack: 90, defense: 85, speed: 85, special: 95, stamina: 90 },
    baseDamage: 55,
    transformations: ['Memory Unleashed', 'Chrono Burst', 'Zenith Ascension'],
    abilities: ['Memory Strike', 'Echo Pulse', 'Rift Step', 'Chrono Punch'],
    ultimates: { 
      level1: 'Nexus Shatter', 
      level2: 'Eternal Memory', 
      level3: 'Void Purge', 
      level4: 'Universal Synchronization' 
    },
    synergies: ['jaxon', 'kaison', 'silver'],
    unlockLevel: 0,
    primaryColor: '#00f2ff',
    accentColor: '#FFFFFF'
  },
  {
    id: 'jaxon',
    name: 'Jaxon Swift',
    title: 'The Swift Echo',
    role: 'Blitzer',
    stats: { health: 70, attack: 85, defense: 65, speed: 100, special: 85, stamina: 95 },
    baseDamage: 50,
    transformations: ['Lightning Flow', 'Voltage Overload', 'Hyper Jaxon'],
    abilities: ['Volt Dash', 'Plasma Spin', 'Static Burst', 'Lightning Homing'],
    ultimates: { 
      level1: 'Thunderstorm Spin', 
      level2: 'Voltage Crash', 
      level3: 'Hyper Blitz', 
      level4: 'Infinite Velocity' 
    },
    synergies: ['kaison', 'volter', 'kai-jax'],
    unlockLevel: 0,
    primaryColor: '#a855f7',
    accentColor: '#00f2ff'
  },
  {
    id: 'kaison',
    name: 'Kaison Ember',
    title: 'The Strategic Blade',
    role: 'Blitzer',
    stats: { health: 75, attack: 80, defense: 70, speed: 95, special: 85, stamina: 90 },
    baseDamage: 48,
    transformations: ['Sage Wind', 'Aerial Mastery', 'Celestial Kaison'],
    abilities: ['Wind Slice', 'Tornado Reflector', 'Gale Dash', 'Precision Shot'],
    ultimates: { 
      level1: 'Storm Barrage', 
      level2: 'Cyclone Strike', 
      level3: 'Aerial Ace', 
      level4: 'Zenith Wing' 
    },
    synergies: ['jaxon', 'silver', 'kai-jax'],
    unlockLevel: 0,
    primaryColor: '#22d3ee',
    accentColor: '#FFFFFF'
  },
  {
    id: 'silver',
    name: 'Silver Chronos',
    title: 'The Time Sage',
    role: 'Mystic',
    stats: { health: 70, attack: 75, defense: 80, speed: 70, special: 100, stamina: 85 },
    baseDamage: 48,
    transformations: ['Temporal Shift', 'Chronos Unbound', 'Eternal Silver'],
    abilities: ['Time Anchor', 'Future Sight', 'Gravity Pull', 'Temporal Blast'],
    ultimates: { 
      level1: 'Chronos Freeze', 
      level2: 'Temporal Loop', 
      level3: 'Time Shatter', 
      level4: 'Infinite Timeline' 
    },
    synergies: ['kai-jax', 'kaison', 'lunara'],
    unlockLevel: 5,
    primaryColor: '#c0c0c0',
    accentColor: '#00f2ff'
  }
];

export const BEAST_HEROES: Character[] = [
  {
    id: 'volter',
    name: 'Volter',
    title: 'The Lightning Beast',
    role: 'Blitzer',
    stats: { health: 65, attack: 80, defense: 60, speed: 95, special: 95, stamina: 80 },
    baseDamage: 45,
    transformations: ['Overcharge', 'Thunder God', 'Celestial Beast'],
    abilities: ['Static Claw', 'Thunder Bolt', 'Electric Slide', 'Voltage Leap'],
    ultimates: { 
      level1: 'Thunder Storm', 
      level2: 'Voltage Crash', 
      level3: 'Mega Bolt', 
      level4: 'God of Lightning' 
    },
    synergies: ['jaxon', 'lunara'],
    unlockLevel: 3,
    primaryColor: '#ffff00',
    accentColor: '#FFFFFF'
  },
  {
    id: 'korg',
    name: 'Korg',
    title: 'The Stone Warden',
    role: 'Tank',
    stats: { health: 100, attack: 95, defense: 90, speed: 55, special: 60, stamina: 90 },
    baseDamage: 60,
    transformations: ['Obsidian Form', 'Mountain Heart', 'Earth Father'],
    abilities: ['Ground Slam', 'Stone Toss', 'Earth Shield', 'Granite Punch'],
    ultimates: { 
      level1: 'Earthquake', 
      level2: 'Mountain Crush', 
      level3: 'Tectonic Shift', 
      level4: 'Planet Shatter' 
    },
    synergies: ['puff', 'borgos'],
    unlockLevel: 4,
    primaryColor: '#8B4513',
    accentColor: '#FFD700'
  }
];

export const VOID_HEROES: Character[] = [
  {
    id: 'puff',
    name: 'Puff',
    title: 'The Void Wisp',
    role: 'Wildcard',
    stats: { health: 70, attack: 70, defense: 75, speed: 80, special: 90, stamina: 95 },
    baseDamage: 42,
    transformations: ['Mimic Form', 'Void Consumption', 'Ethereal Nova'],
    abilities: ['Void Inhale', 'Echo Copy', 'Shadow Float', 'Dark Matter'],
    ultimates: { 
      level1: 'Void Blast', 
      level2: 'Shadow Swallows', 
      level3: 'Abyssal Maw', 
      level4: 'Existence Erasure' 
    },
    synergies: ['korg', 'borgos'],
    unlockLevel: 6,
    primaryColor: '#d74894',
    accentColor: '#FF00FF'
  },
  {
    id: 'borgos',
    name: 'Borgos',
    title: 'The Iron Tyrant',
    role: 'Tank',
    stats: { health: 110, attack: 85, defense: 95, speed: 50, special: 70, stamina: 85 },
    baseDamage: 58,
    transformations: ['Iron Fury', 'Steel King', 'Colossus'],
    abilities: ['Spiked Charge', 'Flame Breath', 'Iron Guard', 'Tyrant Slam'],
    ultimates: { 
      level1: 'Iron Storm', 
      level2: 'Siege Engine', 
      level3: 'Citadel Crash', 
      level4: 'Eternal Empire' 
    },
    synergies: ['korg', 'puff'],
    unlockLevel: 10,
    primaryColor: '#228b22',
    accentColor: '#FF0000'
  }
];

export const CELESTIAL_HEROES: Character[] = [
  {
    id: 'lunara',
    name: 'Lunara',
    title: 'The Moon Goddess',
    role: 'Mystic',
    stats: { health: 75, attack: 80, defense: 80, speed: 75, special: 105, stamina: 90 },
    baseDamage: 52,
    transformations: ['Full Moon', 'Eclipse Form', 'Star Mother'],
    abilities: ['Lunar Light', 'Stellar Shield', 'Moon Path', 'Cosmic Pulse'],
    ultimates: { 
      level1: 'Lunar Eclipse', 
      level2: 'Starfall', 
      level3: 'Celestial Judgment', 
      level4: 'Universal Rebirth' 
    },
    synergies: ['silver', 'volter'],
    unlockLevel: 8,
    primaryColor: '#191970',
    accentColor: '#FFFFFF'
  }
];

export function getAllCharacters(): Character[] {
  return [...CORE_HEROES, ...BEAST_HEROES, ...VOID_HEROES, ...CELESTIAL_HEROES];
}

export function getCharacterById(id: string): Character | undefined {
  return getAllCharacters().find(c => c.id === id);
}

export function getCharactersByRole(role: CharacterRole): Character[] {
  return getAllCharacters().filter(c => c.role === role);
}
