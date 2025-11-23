// SUPER SMASH GRAND SAGA - COMPLETE CHARACTER ROSTER
import { TeamBonus } from './teamSynergy';

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
  universe: string; // "Mario", "Sonic", "Zelda", etc.
  stats: CharacterStats;
  baseDamage: number;
  transformations: string[]; // Names of transformation stages
  abilities: string[];
  ultimates: {
    level1: string;
    level2: string;
    level3: string;
    level4?: string;
  };
  synergies: string[]; // IDs of characters they synergize with
  unlockLevel: number; // 0 = starter, progression level to unlock
}

// ============ CORE HEROES (20) ============
export const CORE_HEROES: Character[] = [
  {
    id: 'mario',
    name: 'Mario',
    title: 'Jump King',
    role: 'Vanguard',
    universe: 'Mario',
    stats: { health: 85, attack: 80, defense: 80, speed: 75, special: 70, stamina: 85 },
    baseDamage: 45,
    transformations: ['Super Mario', 'Cape Mario', 'Celestial Mario'],
    abilities: ['Fireball', 'Super Jump', 'Ground Pound', 'Spin Attack'],
    ultimates: { level1: 'Fire Flower Barrage', level2: 'Super Form Fury', level3: 'Infinite Coins', level4: 'Celestial Jump Strike' },
    synergies: ['luigi', 'peach', 'bowser'],
    unlockLevel: 0
  },
  {
    id: 'sonic',
    name: 'Sonic',
    title: 'Chaos Incarnate',
    role: 'Blitzer',
    universe: 'Sonic',
    stats: { health: 70, attack: 85, defense: 60, speed: 100, special: 80, stamina: 90 },
    baseDamage: 50,
    transformations: ['Super Sonic', 'Chaos Control Sonic', 'Celestial Sonic', 'Hyper Sonic'],
    abilities: ['Spin Dash', 'Homing Attack', 'Chaos Control', 'Ring Tornado'],
    ultimates: { level1: 'Spin Cycle', level2: 'Super Sonic Assault', level3: 'Chaos Emerald Burst', level4: 'Hyper Sonic Tempest' },
    synergies: ['tails', 'shadow', 'pikachu'],
    unlockLevel: 0
  },
  {
    id: 'link',
    name: 'Link',
    title: 'Triforce Hero',
    role: 'Vanguard',
    universe: 'Zelda',
    stats: { health: 90, attack: 85, defense: 90, speed: 70, special: 75, stamina: 85 },
    baseDamage: 48,
    transformations: ['Ancient Link', 'Beast Link', 'Celestial Link'],
    abilities: ['Master Sword Slash', 'Shield Guard', 'Bomb', 'Bow Attack'],
    ultimates: { level1: 'Sword Spin', level2: 'Ancient Arrow Barrage', level3: 'Triforce Power', level4: 'Golden God Form' },
    synergies: ['zelda', 'peach', 'samus'],
    unlockLevel: 0
  },
  {
    id: 'samus',
    name: 'Samus',
    title: 'Adaptive Arsenal',
    role: 'Sniper',
    universe: 'Metroid',
    stats: { health: 85, attack: 90, defense: 85, speed: 75, special: 85, stamina: 80 },
    baseDamage: 52,
    transformations: ['Varia Suit', 'Gravity Suit', 'Celestial Suit'],
    abilities: ['Charge Beam', 'Missile', 'Morph Ball', 'Grapple'],
    ultimates: { level1: 'Super Missile Storm', level2: 'Plasma Beam Overload', level3: 'Metroid Swarm', level4: 'Full Arsenal Fury' },
    synergies: ['fox', 'megaman'],
    unlockLevel: 0
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    title: 'Thunder God',
    role: 'Blitzer',
    universe: 'Pokemon',
    stats: { health: 60, attack: 75, defense: 60, speed: 90, special: 95, stamina: 70 },
    baseDamage: 48,
    transformations: ['Gigantamax', 'Thunder God', 'Celestial Pikachu'],
    abilities: ['Thunderbolt', 'Quick Attack', 'Iron Tail', 'Volt Tackle'],
    ultimates: { level1: 'Pikachu Thunder', level2: 'Gigantamax Volt Crash', level3: 'Thunder God Ascension', level4: 'Infinite Electricity' },
    synergies: ['ash', 'greninja'],
    unlockLevel: 0
  },
  {
    id: 'kirby',
    name: 'Kirby',
    title: 'Pink Void',
    role: 'Support',
    universe: 'Kirby',
    stats: { health: 70, attack: 70, defense: 70, speed: 80, special: 85, stamina: 90 },
    baseDamage: 42,
    transformations: ['Hypernova Kirby', 'Celestial Kirby', 'Void Kirby'],
    abilities: ['Neutral B', 'Copy Ability', 'Hammer', 'Guard'],
    ultimates: { level1: 'Final Smash', level2: 'Hypernova Kirby', level3: 'Celestial Vacuum', level4: 'Infinite Void' },
    synergies: ['rosalina', 'yoshi'],
    unlockLevel: 0
  },
  {
    id: 'megaman',
    name: 'Mega Man X',
    title: 'Adaptive Arsenal',
    role: 'Sniper',
    universe: 'Mega Man',
    stats: { health: 75, attack: 80, defense: 75, speed: 75, special: 90, stamina: 85 },
    baseDamage: 50,
    transformations: ['Falcon Armor', 'Gaia Armor', 'Ultimate Armor'],
    abilities: ['Mega Buster', 'Dash', 'Wall Climb', 'Special Weapon'],
    ultimates: { level1: 'Charge Cannon', level2: 'Ultimate Armor Blast', level3: 'Full Weapon Arsenal', level4: 'Ultimate Armor Overload' },
    synergies: ['tails', 'samus'],
    unlockLevel: 0
  },
  {
    id: 'zelda',
    name: 'Zelda',
    title: 'Mystic Sage',
    role: 'Mystic',
    universe: 'Zelda',
    stats: { health: 70, attack: 65, defense: 70, speed: 70, special: 95, stamina: 80 },
    baseDamage: 45,
    transformations: ['Sheik Form', 'Triforce Form', 'Celestial Zelda'],
    abilities: ['Phantom Slash', 'Din\'s Fire', 'Farore\'s Wind', 'Nayru\'s Love'],
    ultimates: { level1: 'Light Arrow', level2: 'Triforce Burst', level3: 'Divine Beast Power', level4: 'Infinite Wisdom' },
    synergies: ['link', 'peach', 'palutena'],
    unlockLevel: 0
  },
  {
    id: 'fox',
    name: 'Fox',
    title: 'Star Pilot',
    role: 'Blitzer',
    universe: 'Star Fox',
    stats: { health: 70, attack: 80, defense: 65, speed: 95, special: 80, stamina: 85 },
    baseDamage: 48,
    transformations: ['Landmaster', 'Arwing Form', 'Celestial Fox'],
    abilities: ['Blaster', 'Reflector', 'Fox Illusion', 'Shine'],
    ultimates: { level1: 'Landmaster Laser', level2: 'Arwing Assault', level3: 'Falco Combo', level4: 'Ultimate Arwing' },
    synergies: ['falcon', 'tails', 'pikachu'],
    unlockLevel: 0
  },
  {
    id: 'donkeykong',
    name: 'Donkey Kong',
    title: 'Jungle King',
    role: 'Tank',
    universe: 'Donkey Kong',
    stats: { health: 100, attack: 95, defense: 85, speed: 60, special: 65, stamina: 90 },
    baseDamage: 55,
    transformations: ['Cranky Kong Form', 'Primal Kong', 'Celestial Kong'],
    abilities: ['Punch', 'Headbutt', 'Tie Spin', 'Grab'],
    ultimates: { level1: 'Giant Punch', level2: 'Primal Fury Rampage', level3: 'Jungle King Roar', level4: 'Infinite Strength' },
    synergies: ['diddy', 'yoshi'],
    unlockLevel: 0
  },
  {
    id: 'tails',
    name: 'Tails',
    title: 'Sky Engineer',
    role: 'Support',
    universe: 'Sonic',
    stats: { health: 65, attack: 70, defense: 65, speed: 85, special: 85, stamina: 80 },
    baseDamage: 45,
    transformations: ['Twin Tails Flight', 'Chaos Tails', 'Celestial Tails'],
    abilities: ['Twin Tails Flight', 'Wrench Smash', 'Tornado Attack', 'Gadget Grapple'],
    ultimates: { level1: 'Dual Tails Spin', level2: 'Chaos Tails Flight', level3: 'Tech Arsenal Burst', level4: 'Infinite Flight' },
    synergies: ['sonic', 'fox', 'megaman'],
    unlockLevel: 1
  },
  {
    id: 'pikachu',
    name: 'Yoshi',
    title: 'Dino Master',
    role: 'Wildcard',
    universe: 'Yoshi',
    stats: { health: 75, attack: 75, defense: 75, speed: 80, special: 75, stamina: 85 },
    baseDamage: 46,
    transformations: ['Mega Yoshi', 'Golden Yoshi', 'Celestial Yoshi'],
    abilities: ['Tongue Grab', 'Egg Throw', 'Ground Pound', 'Dash Attack'],
    ultimates: { level1: 'Super Yoshi Bomb', level2: 'Mega Yoshi Stomp', level3: 'Yoshi\'s Island Power', level4: 'Infinite Transformation' },
    synergies: ['kirby', 'mario'],
    unlockLevel: 1
  },
  {
    id: 'captain_falcon',
    name: 'Captain Falcon',
    title: 'Falcon Warrior',
    role: 'Vanguard',
    universe: 'F-Zero',
    stats: { health: 80, attack: 90, defense: 75, speed: 95, special: 70, stamina: 80 },
    baseDamage: 52,
    transformations: ['Falcon Flare', 'Dragon Kick Form', 'Celestial Falcon'],
    abilities: ['Falcon Punch', 'Falcon Kick', 'Raptor Boost', 'Blue Falcon'],
    ultimates: { level1: 'Blue Falcon', level2: 'Falcon Super Punch', level3: 'Dragon Claw Fury', level4: 'Infinite Speed' },
    synergies: ['fox', 'sonic'],
    unlockLevel: 1
  },
  {
    id: 'peach',
    name: 'Peach',
    title: 'Royal Authority',
    role: 'Support',
    universe: 'Mario',
    stats: { health: 75, attack: 70, defense: 75, speed: 75, special: 85, stamina: 85 },
    baseDamage: 44,
    transformations: ['Daisy Form', 'Crown Peach', 'Celestial Peach'],
    abilities: ['Toad Guard', 'Vegetable Pluck', 'Peach Bomber', 'Parasol'],
    ultimates: { level1: 'Peach Blossom', level2: 'Royal Guard', level3: 'Crown Power', level4: 'Infinite Grace' },
    synergies: ['mario', 'zelda', 'rosalina'],
    unlockLevel: 1
  },
  {
    id: 'rosalina',
    name: 'Rosalina',
    title: 'Cosmic Oracle',
    role: 'Mystic',
    universe: 'Mario',
    stats: { health: 70, attack: 70, defense: 80, speed: 70, special: 95, stamina: 85 },
    baseDamage: 46,
    transformations: ['Luma Burst', 'Celestial Rosalina', 'Void Rosalina'],
    abilities: ['Luma Shot', 'Gravitational Pull', 'Luma Launch', 'Star Bit'],
    ultimates: { level1: 'Luma Swarm', level2: 'Gravity Surge', level3: 'Cosmic Power', level4: 'Infinite Stars' },
    synergies: ['kirby', 'zelda', 'palutena'],
    unlockLevel: 1
  },
  {
    id: 'shadow',
    name: 'Shadow',
    title: 'Ultimate Lifeform',
    role: 'Blitzer',
    universe: 'Sonic',
    stats: { health: 80, attack: 90, defense: 70, speed: 95, special: 85, stamina: 85 },
    baseDamage: 52,
    transformations: ['Super Shadow', 'Chaos Shadow', 'Celestial Shadow'],
    abilities: ['Chaos Control', 'Chaos Blast', 'Air Dash', 'Hover'],
    ultimates: { level1: 'Chaos Control Warp', level2: 'Super Shadow Assault', level3: 'Chaos Destruction', level4: 'Infinite Chaos' },
    synergies: ['sonic', 'bayonetta'],
    unlockLevel: 2
  },
  {
    id: 'palutena',
    name: 'Palutena',
    title: 'Goddess of Light',
    role: 'Mystic',
    universe: 'Kid Icarus',
    stats: { health: 75, attack: 75, defense: 80, speed: 70, special: 95, stamina: 85 },
    baseDamage: 48,
    transformations: ['Dark Palutena', 'Celestial Palutena', 'Void Palutena'],
    abilities: ['Neutral B', 'Side B', 'Up B', 'Down B'],
    ultimates: { level1: 'Black Hole Punch', level2: 'Heavenly Light', level3: 'Divine Power', level4: 'Infinite Light' },
    synergies: ['zelda', 'peach', 'rosalina'],
    unlockLevel: 2
  },
  {
    id: 'ash',
    name: 'Ash',
    title: 'Pokemon Master',
    role: 'Support',
    universe: 'Pokemon',
    stats: { health: 60, attack: 65, defense: 60, speed: 75, special: 80, stamina: 75 },
    baseDamage: 42,
    transformations: ['Gigantamax Charizard', 'Legendary Bond', 'Celestial Ash'],
    abilities: ['Pikachu Call', 'Team Switch', 'Item Throw', 'Dodge'],
    ultimates: { level1: 'Charizard Attack', level2: 'Pikachu Thunder', level3: 'Pokemon Union', level4: 'Infinite Partners' },
    synergies: ['pikachu', 'greninja'],
    unlockLevel: 2
  }
];

// ============ SUPPORT & WILDCARDS (30) ============
export const SUPPORT_HEROES: Character[] = [
  {
    id: 'luigi',
    name: 'Luigi',
    title: 'Green Plumber',
    role: 'Vanguard',
    universe: 'Mario',
    stats: { health: 80, attack: 75, defense: 75, speed: 80, special: 70, stamina: 85 },
    baseDamage: 44,
    transformations: ['Super Luigi', 'Vacuum Luigi', 'Celestial Luigi'],
    abilities: ['Fireball', 'Super Jump', 'Vacuum', 'Dark Moon'],
    ultimates: { level1: 'Green Missile', level2: 'Vacuum Spin', level3: 'King Luigi Power', level4: 'Infinite Green' },
    synergies: ['mario', 'bowser'],
    unlockLevel: 1
  },
  {
    id: 'bayonetta',
    name: 'Bayonetta',
    title: 'Umbral Witch',
    role: 'Sniper',
    universe: 'Bayonetta',
    stats: { health: 70, attack: 85, defense: 60, speed: 90, special: 85, stamina: 80 },
    baseDamage: 50,
    transformations: ['Purgatorio Form', 'Infernal Bayonetta', 'Celestial Form'],
    abilities: ['Pistol Fire', 'Witch Time', 'Kick Attack', 'Hair Attack'],
    ultimates: { level1: 'Bullet Arts', level2: 'Infernal Summoning', level3: 'Purgatorio Power', level4: 'Infinite Magic' },
    synergies: ['shadow', 'snake'],
    unlockLevel: 2
  },
  {
    id: 'snake',
    name: 'Snake',
    title: 'Soldier of Fortune',
    role: 'Controller',
    universe: 'Metal Gear',
    stats: { health: 75, attack: 80, defense: 80, speed: 65, special: 75, stamina: 85 },
    baseDamage: 48,
    transformations: ['Sneaking Suit', 'Battle Armor', 'Celestial Soldier'],
    abilities: ['Remote Missile', 'C4', 'Cypher', 'Grenade'],
    ultimates: { level1: 'Missile Barrage', level2: 'Cypher Swarm', level3: 'Metal Gear Power', level4: 'Infinite Arsenal' },
    synergies: ['bayonetta'],
    unlockLevel: 2
  },
  {
    id: 'ryu',
    name: 'Ryu',
    title: 'Hadoken Master',
    role: 'Vanguard',
    universe: 'Street Fighter',
    stats: { health: 75, attack: 85, defense: 70, speed: 75, special: 80, stamina: 85 },
    baseDamage: 50,
    transformations: ['Super Ryu', 'Satsui no Hado', 'Celestial Ryu'],
    abilities: ['Hadoken', 'Shoryuken', 'Tatsumaki', 'Focus Attack'],
    ultimates: { level1: 'Shinku Hadoken', level2: 'Raging Demon', level3: 'Satsui Power', level4: 'Infinite Hadoken' },
    synergies: ['terry'],
    unlockLevel: 3
  },
  {
    id: 'greninja',
    name: 'Greninja',
    title: 'Ninja Pokemon',
    role: 'Blitzer',
    universe: 'Pokemon',
    stats: { health: 65, attack: 80, defense: 65, speed: 95, special: 80, stamina: 80 },
    baseDamage: 48,
    transformations: ['Ash-Greninja', 'Bond Form', 'Celestial Greninja'],
    abilities: ['Water Shuriken', 'Aerial Ace', 'Hydro Cannon', 'Shadow Strike'],
    ultimates: { level1: 'Water Ninja Assault', level2: 'Bond Transformation', level3: 'Ninja Power', level4: 'Infinite Water' },
    synergies: ['pikachu', 'ash'],
    unlockLevel: 2
  }
];

// ============ LEGACY KIDS (9) ============
export const LEGACY_KIDS: Character[] = [
  {
    id: 'solaro',
    name: 'Solaro',
    title: 'Sonic\'s Legacy',
    role: 'Blitzer',
    universe: 'Sonic',
    stats: { health: 75, attack: 85, defense: 70, speed: 100, special: 80, stamina: 90 },
    baseDamage: 50,
    transformations: ['Super Solaro', 'Chaos Solaro', 'Hyper Solaro'],
    abilities: ['Wind Dash', 'Sonic Spin', 'Chaos Strike', 'Speed Zone'],
    ultimates: { level1: 'Sonic Legacy', level2: 'Chaos Tempest', level3: 'Hyper Assault', level4: 'Infinite Speed' },
    synergies: ['sonic', 'tempest'],
    unlockLevel: 5
  }
];

// ============ SECRET CHARACTERS (Unlockable) ============
export const SECRET_CHARACTERS: Character[] = [
  {
    id: 'silver',
    name: 'Silver',
    title: 'Time Sage',
    role: 'Mystic',
    universe: 'Sonic',
    stats: { health: 70, attack: 75, defense: 75, speed: 70, special: 100, stamina: 85 },
    baseDamage: 48,
    transformations: ['Super Silver', 'Temporal Silver', 'Celestial Silver'],
    abilities: ['Psychokinesis', 'Future Vision', 'Time Warp', 'Potential Unleash'],
    ultimates: { level1: 'Psycho Boost', level2: 'Time Stop', level3: 'Temporal Fury', level4: 'Infinite Time' },
    synergies: ['sonic', 'shadow'],
    unlockLevel: 7
  },
  {
    id: 'lunara',
    name: 'Lunara',
    title: 'Moon Goddess',
    role: 'Mystic',
    universe: 'Original',
    stats: { health: 70, attack: 75, defense: 80, speed: 75, special: 100, stamina: 90 },
    baseDamage: 49,
    transformations: ['Lunar Form', 'Eclipse Lunara', 'Celestial Lunara'],
    abilities: ['Moon Beam', 'Lunar Flight', 'Eclipse Shield', 'Night Surge'],
    ultimates: { level1: 'Lunar Ascension', level2: 'Eclipse Power', level3: 'Cosmic Lunara', level4: 'Infinite Moon' },
    synergies: ['zelda', 'palutena'],
    unlockLevel: 8
  }
];

// Helper functions
export function getAllCharacters(): Character[] {
  return [...CORE_HEROES, ...SUPPORT_HEROES, ...LEGACY_KIDS, ...SECRET_CHARACTERS];
}

export function getCharacterById(id: string): Character | undefined {
  return getAllCharacters().find(c => c.id === id);
}

export function getCharactersByRole(role: CharacterRole): Character[] {
  return getAllCharacters().filter(c => c.role === role);
}

export function getCharactersByUniverse(universe: string): Character[] {
  return getAllCharacters().filter(c => c.universe === universe);
}
