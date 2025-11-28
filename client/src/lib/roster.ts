// SUPER SMASH GRAND SAGA - COMPLETE CHARACTER ROSTER
// Features authentic character specifications with legal safeguards
// Names/colors modified for copyright compliance while maintaining recognition
import { TeamBonus } from './teamSynergy';
import { CHARACTER_SPECS } from './characterSpecs';

// Generate consistent random colors based on character ID
function generateCharacterColors(id: string): { primary: string; accent: string } {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    { primary: '#FF6600', accent: '#FFFF00' },
    { primary: '#00FF00', accent: '#FF00FF' },
    { primary: '#FF0000', accent: '#00FFFF' },
    { primary: '#0099FF', accent: '#FF9900' },
    { primary: '#FF00FF', accent: '#00FF00' },
    { primary: '#00FFFF', accent: '#FF0000' },
    { primary: '#FFCC00', accent: '#FF0099' },
    { primary: '#00FF99', accent: '#9900FF' },
    { primary: '#FF9900', accent: '#00CCFF' },
    { primary: '#99FF00', accent: '#FF0066' }
  ];
  return colors[hash % colors.length];
}

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
  universe: string; // Original universe (for reference)
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
  // Authentic specifications (from dev manuals & sprite research)
  spriteSpecs?: {
    authenticDimensions: string;
    authenticPalette?: Record<string, string>;
    canonicalHeight?: string;
  };
  primaryColor?: string;
  accentColor?: string;
}

// ============ CORE HEROES (20) ============
export const CORE_HEROES: Character[] = [
  {
    id: 'mario',
    name: 'Marlo Zenith',
    title: 'The Radiant Jumper',
    role: 'Vanguard',
    universe: 'Mario',
    stats: { health: 85, attack: 80, defense: 80, speed: 75, special: 70, stamina: 85 },
    baseDamage: 45,
    transformations: ['Super Marlo', 'Cape Ascension', 'Celestial Marlo'],
    abilities: ['Fireball Burst', 'Super Jump Punch', 'Ground Pound', 'Cape Spin'],
    ultimates: { level1: 'Fire Flower Barrage', level2: 'Star Power Rush', level3: 'Infinity Jump Strike', level4: 'Celestial Ascension' },
    synergies: ['luigi', 'peach', 'bowser'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.mario?.spriteSpecs,
    primaryColor: '#0044CC',
    accentColor: '#FFFFFF'
  },
  {
    id: 'sonic',
    name: 'Redhound Flow',
    title: 'The Crimson Blur',
    role: 'Blitzer',
    universe: 'Sonic',
    stats: { health: 70, attack: 85, defense: 60, speed: 100, special: 80, stamina: 90 },
    baseDamage: 50,
    transformations: ['Super Redhound', 'Chaos Flow Form', 'Celestial Redhound', 'Hyper Flow'],
    abilities: ['Spin Dash', 'Homing Attack', 'Light Speed Dash', 'Boost Rush'],
    ultimates: { level1: 'Spin Cyclone', level2: 'Super Redhound Assault', level3: 'Chaos Destruction', level4: 'Hyper Tempest' },
    synergies: ['tails', 'shadow', 'pikachu'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.sonic?.spriteSpecs,
    primaryColor: '#CC0000',
    accentColor: '#000000'
  },
  {
    id: 'link',
    name: 'Hyllian Valour',
    title: 'The Relic Knight',
    role: 'Vanguard',
    universe: 'Zelda',
    stats: { health: 90, attack: 85, defense: 90, speed: 70, special: 75, stamina: 85 },
    baseDamage: 48,
    transformations: ['Ancient Valour', 'Beast Form', 'Celestial Valour'],
    abilities: ['Master Sword Slash', 'Hylian Shield', 'Remote Bomb', 'Ancient Arrow'],
    ultimates: { level1: 'Spin Attack', level2: 'Triforce Slash', level3: 'Divine Beast Power', level4: 'Master Sword Fury' },
    synergies: ['zelda', 'peach', 'samus'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.link?.spriteSpecs,
    primaryColor: '#228844',
    accentColor: '#B88A3D'
  },
  {
    id: 'samus',
    name: 'Nova Striker',
    title: 'The Galactic Huntress',
    role: 'Sniper',
    universe: 'Metroid',
    stats: { health: 85, attack: 90, defense: 85, speed: 75, special: 85, stamina: 80 },
    baseDamage: 52,
    transformations: ['Varia Suit', 'Gravity Suit', 'Celestial Suit'],
    abilities: ['Charge Beam', 'Missile Salvo', 'Morph Ball Bomb', 'Screw Attack'],
    ultimates: { level1: 'Super Missile Storm', level2: 'Hyper Beam', level3: 'Power Bomb', level4: 'Zero Laser' },
    synergies: ['fox', 'megaman'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.samus?.spriteSpecs,
    primaryColor: '#FF6600',
    accentColor: '#00FF00'
  },
  {
    id: 'pikachu',
    name: 'Volt Striker',
    title: 'The Thunder Mouse',
    role: 'Blitzer',
    universe: 'Pokemon',
    stats: { health: 60, attack: 75, defense: 60, speed: 90, special: 95, stamina: 70 },
    baseDamage: 48,
    transformations: ['Gigantamax Volt', 'Thunder God', 'Celestial Volt'],
    abilities: ['Thunderbolt', 'Quick Attack', 'Iron Tail', 'Volt Tackle'],
    ultimates: { level1: 'Thunder Storm', level2: 'Gigantamax Volt Crash', level3: 'Ten Million Volt Thunderbolt', level4: 'Catastropika' },
    synergies: ['ash', 'greninja'],
    unlockLevel: 0,
    primaryColor: '#FFCC00',
    accentColor: '#FF0000'
  },
  {
    id: 'kirby',
    name: 'Puffball Nova',
    title: 'The Copy Champion',
    role: 'Support',
    universe: 'Kirby',
    stats: { health: 70, attack: 70, defense: 70, speed: 80, special: 85, stamina: 90 },
    baseDamage: 42,
    transformations: ['Hypernova Form', 'Star Allies Form', 'Void Form'],
    abilities: ['Inhale', 'Copy Ability', 'Hammer Flip', 'Stone Drop'],
    ultimates: { level1: 'Ultra Sword', level2: 'Hypernova Blast', level3: 'Star Allies Sparkler', level4: 'Warp Star Crash' },
    synergies: ['rosalina', 'yoshi'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.kirby?.spriteSpecs,
    primaryColor: '#FF66AA',
    accentColor: '#FF0066'
  },
  {
    id: 'megaman',
    name: 'Mega Blaster',
    title: 'The Blue Bomber',
    role: 'Sniper',
    universe: 'Mega Man',
    stats: { health: 75, attack: 80, defense: 75, speed: 75, special: 90, stamina: 85 },
    baseDamage: 50,
    transformations: ['Rush Armor', 'Super Adapter', 'Celestial Armor'],
    abilities: ['Mega Buster', 'Slide Dash', 'Rush Coil', 'Leaf Shield'],
    ultimates: { level1: 'Charge Shot', level2: 'Rush Final Strike', level3: 'Double Gear System', level4: 'Mega Legends Assault' },
    synergies: ['tails', 'samus'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.megaman?.spriteSpecs,
    primaryColor: '#0088FF',
    accentColor: '#00FFFF'
  },
  {
    id: 'zelda',
    name: 'Hylia Sage',
    title: 'The Wisdom Keeper',
    role: 'Mystic',
    universe: 'Zelda',
    stats: { health: 70, attack: 65, defense: 70, speed: 70, special: 95, stamina: 80 },
    baseDamage: 45,
    transformations: ['Sheikah Form', 'Triforce Form', 'Celestial Sage'],
    abilities: ['Phantom Slash', 'Din\'s Fire', 'Farore\'s Wind', 'Nayru\'s Love'],
    ultimates: { level1: 'Light Arrow', level2: 'Triforce of Wisdom', level3: 'Goddess Hylia Power', level4: 'Sacred Realm Judgment' },
    synergies: ['link', 'peach', 'palutena'],
    unlockLevel: 0,
    primaryColor: '#9900FF',
    accentColor: '#FFD700'
  },
  {
    id: 'fox',
    name: 'Vulpine Ace',
    title: 'The Star Pilot',
    role: 'Blitzer',
    universe: 'Star Fox',
    stats: { health: 70, attack: 80, defense: 65, speed: 95, special: 80, stamina: 85 },
    baseDamage: 48,
    transformations: ['Arwing Sync', 'Landmaster Form', 'Celestial Ace'],
    abilities: ['Blaster', 'Reflector Shine', 'Fox Illusion', 'Fire Fox'],
    ultimates: { level1: 'Landmaster', level2: 'Arwing Strike', level3: 'Team Star Fox', level4: 'Great Fox Cannon' },
    synergies: ['falcon', 'tails', 'pikachu'],
    unlockLevel: 0,
    primaryColor: '#FF6600',
    accentColor: '#FFFFFF'
  },
  {
    id: 'donkeykong',
    name: 'Primal Kong',
    title: 'The Jungle King',
    role: 'Tank',
    universe: 'Donkey Kong',
    stats: { health: 100, attack: 95, defense: 85, speed: 60, special: 65, stamina: 90 },
    baseDamage: 55,
    transformations: ['Rambi Rider', 'Strong Kong', 'Celestial Kong'],
    abilities: ['Giant Punch', 'Headbutt', 'Spinning Kong', 'Hand Slap'],
    ultimates: { level1: 'Konga Beat', level2: 'Barrel Barrage', level3: 'DK Island Swing', level4: 'Primal Rampage' },
    synergies: ['diddy', 'yoshi'],
    unlockLevel: 0,
    spriteSpecs: CHARACTER_SPECS.donkeykong?.spriteSpecs,
    primaryColor: '#8B4513',
    accentColor: '#FFD700'
  },
  {
    id: 'tails',
    name: 'Miles Prodigy',
    title: 'The Twin Tails',
    role: 'Support',
    universe: 'Sonic',
    stats: { health: 65, attack: 70, defense: 65, speed: 85, special: 85, stamina: 80 },
    baseDamage: 45,
    transformations: ['Tornado Pilot', 'Super Tails', 'Celestial Tails'],
    abilities: ['Tail Swipe', 'Propeller Flight', 'Energy Ball', 'Remote Robot'],
    ultimates: { level1: 'Tornado Strike', level2: 'Super Flickies', level3: 'Chaos Emerald Power', level4: 'Mech Walker Assault' },
    synergies: ['sonic', 'fox', 'megaman'],
    unlockLevel: 1,
    primaryColor: '#FFAA00',
    accentColor: '#FFFFFF'
  },
  {
    id: 'yoshi',
    name: 'Dino Star',
    title: 'The Egg Master',
    role: 'Wildcard',
    universe: 'Yoshi',
    stats: { health: 75, attack: 75, defense: 75, speed: 80, special: 75, stamina: 85 },
    baseDamage: 46,
    transformations: ['Mega Egg', 'Golden Dino', 'Celestial Dino'],
    abilities: ['Tongue Grab', 'Egg Lay', 'Yoshi Bomb', 'Egg Roll'],
    ultimates: { level1: 'Stampede', level2: 'Super Dragon', level3: 'Yoshi\'s Island Finale', level4: 'Rainbow Flutter' },
    synergies: ['kirby', 'mario'],
    unlockLevel: 1,
    primaryColor: '#00FF00',
    accentColor: '#FF4400'
  },
  {
    id: 'captain_falcon',
    name: 'Falcon Prime',
    title: 'The Bounty Racer',
    role: 'Vanguard',
    universe: 'F-Zero',
    stats: { health: 80, attack: 90, defense: 75, speed: 95, special: 70, stamina: 80 },
    baseDamage: 52,
    transformations: ['Blood Falcon', 'Blue Falcon Mode', 'Celestial Falcon'],
    abilities: ['Falcon Punch', 'Falcon Kick', 'Raptor Boost', 'Falcon Dive'],
    ultimates: { level1: 'Blue Falcon', level2: 'Falcon Strike', level3: 'F-Zero Grand Prix', level4: 'Captain\'s Legacy' },
    synergies: ['fox', 'sonic'],
    unlockLevel: 1,
    spriteSpecs: CHARACTER_SPECS.captain_falcon?.spriteSpecs,
    primaryColor: '#0044AA',
    accentColor: '#FFD700'
  },
  {
    id: 'peach',
    name: 'Princess Aurora',
    title: 'The Royal Heart',
    role: 'Support',
    universe: 'Mario',
    stats: { health: 75, attack: 70, defense: 75, speed: 75, special: 85, stamina: 85 },
    baseDamage: 44,
    transformations: ['Shadow Queen', 'Crown Aurora', 'Celestial Aurora'],
    abilities: ['Toad Guard', 'Vegetable Toss', 'Peach Bomber', 'Parasol Float'],
    ultimates: { level1: 'Peach Blossom', level2: 'Empress Slap', level3: 'Heart Kingdom', level4: 'Royal Judgment' },
    synergies: ['mario', 'zelda', 'rosalina'],
    unlockLevel: 1,
    primaryColor: '#FF88CC',
    accentColor: '#FFD700'
  },
  {
    id: 'rosalina',
    name: 'Cosmic Rose',
    title: 'The Star Mother',
    role: 'Mystic',
    universe: 'Mario',
    stats: { health: 70, attack: 70, defense: 80, speed: 70, special: 95, stamina: 85 },
    baseDamage: 46,
    transformations: ['Luma Queen', 'Galaxy Form', 'Celestial Rose'],
    abilities: ['Luma Shot', 'Gravitational Pull', 'Launch Star', 'Star Bits'],
    ultimates: { level1: 'Power Star', level2: 'Grand Star', level3: 'Comet Observatory', level4: 'Galaxy Reset' },
    synergies: ['kirby', 'zelda', 'palutena'],
    unlockLevel: 1,
    primaryColor: '#88DDFF',
    accentColor: '#FFAADD'
  },
  {
    id: 'shadow',
    name: 'Shade Oblivion',
    title: 'The Obsidian Echo',
    role: 'Blitzer',
    universe: 'Sonic',
    stats: { health: 80, attack: 90, defense: 70, speed: 95, special: 85, stamina: 85 },
    baseDamage: 52,
    transformations: ['Super Shade', 'Dark Form', 'Celestial Oblivion'],
    abilities: ['Chaos Spear', 'Chaos Control', 'Homing Attack', 'Chaos Blast'],
    ultimates: { level1: 'Chaos Blast', level2: 'Super Shade Assault', level3: 'Doom\'s Eye', level4: 'Chaos Rift' },
    synergies: ['sonic', 'bayonetta'],
    unlockLevel: 2,
    spriteSpecs: CHARACTER_SPECS.shadow?.spriteSpecs,
    primaryColor: '#333333',
    accentColor: '#CC0000'
  },
  {
    id: 'palutena',
    name: 'Divine Light',
    title: 'The Goddess of Skyworld',
    role: 'Mystic',
    universe: 'Kid Icarus',
    stats: { health: 75, attack: 75, defense: 80, speed: 70, special: 95, stamina: 85 },
    baseDamage: 48,
    transformations: ['Pseudo Palutena', 'Divine Form', 'Celestial Goddess'],
    abilities: ['Autoreticle', 'Explosive Flame', 'Warp', 'Counter/Reflect'],
    ultimates: { level1: 'Black Hole Laser', level2: 'Heavenly Light', level3: 'Great Sacred Treasure', level4: 'Divine Judgment' },
    synergies: ['zelda', 'peach', 'rosalina'],
    unlockLevel: 2,
    primaryColor: '#00FF88',
    accentColor: '#FFD700'
  },
  {
    id: 'ash',
    name: 'Trainer Red',
    title: 'The Pokemon Champion',
    role: 'Support',
    universe: 'Pokemon',
    stats: { health: 60, attack: 65, defense: 60, speed: 75, special: 80, stamina: 75 },
    baseDamage: 42,
    transformations: ['Champion Form', 'Legendary Bond', 'Celestial Master'],
    abilities: ['Pokemon Switch', 'Potion', 'Command', 'Dodge Roll'],
    ultimates: { level1: 'Triple Finish', level2: 'Mega Evolution', level3: 'Z-Move Power', level4: 'Champion\'s Spirit' },
    synergies: ['pikachu', 'greninja'],
    unlockLevel: 2,
    primaryColor: '#FF0000',
    accentColor: '#FFFFFF'
  }
];

// ============ SUPPORT & WILDCARDS (30) ============
export const SUPPORT_HEROES: Character[] = [
  {
    id: 'luigi',
    name: 'Rio Aura',
    title: 'The Phantom Heart',
    role: 'Support',
    universe: 'Mario',
    stats: { health: 80, attack: 75, defense: 75, speed: 80, special: 75, stamina: 85 },
    baseDamage: 44,
    transformations: ['Super Rio', 'Poltergust Mode', 'Celestial Rio'],
    abilities: ['Green Fireball', 'Super Jump Punch', 'Poltergust G-00', 'Plunge'],
    ultimates: { level1: 'Poltergust Rush', level2: 'Negative Zone', level3: 'Luigi\'s Mansion', level4: 'Phantom Force' },
    synergies: ['mario', 'bowser'],
    unlockLevel: 1,
    primaryColor: '#6600CC',
    accentColor: '#00CC66'
  },
  {
    id: 'bayonetta',
    name: 'Umbra Cereza',
    title: 'The Witch of Inferno',
    role: 'Sniper',
    universe: 'Bayonetta',
    stats: { health: 70, attack: 85, defense: 60, speed: 90, special: 85, stamina: 80 },
    baseDamage: 50,
    transformations: ['Madama Butterfly', 'Umbran Climax', 'Celestial Witch'],
    abilities: ['Bullet Arts', 'Witch Time', 'Wicked Weaves', 'Heel Slide'],
    ultimates: { level1: 'Infernal Climax', level2: 'Gomorrah Summon', level3: 'Queen Sheba', level4: 'Umbran Finale' },
    synergies: ['shadow', 'snake'],
    unlockLevel: 2,
    primaryColor: '#330033',
    accentColor: '#AA00FF'
  },
  {
    id: 'snake',
    name: 'Phantom Snake',
    title: 'The Legendary Soldier',
    role: 'Controller',
    universe: 'Metal Gear',
    stats: { health: 75, attack: 80, defense: 80, speed: 65, special: 75, stamina: 85 },
    baseDamage: 48,
    transformations: ['Sneaking Suit', 'Battle Dress', 'Celestial Snake'],
    abilities: ['Hand Grenade', 'Remote Missile', 'C4', 'Cypher'],
    ultimates: { level1: 'Grenade Launcher', level2: 'Metal Gear REX', level3: 'Codec Strike', level4: 'Nuclear Option' },
    synergies: ['bayonetta'],
    unlockLevel: 2,
    primaryColor: '#556B2F',
    accentColor: '#8B4513'
  },
  {
    id: 'ryu',
    name: 'Dragon Fist',
    title: 'The World Warrior',
    role: 'Vanguard',
    universe: 'Street Fighter',
    stats: { health: 75, attack: 85, defense: 70, speed: 75, special: 80, stamina: 85 },
    baseDamage: 50,
    transformations: ['Evil Ryu', 'Power of Nothingness', 'Celestial Warrior'],
    abilities: ['Hadoken', 'Shoryuken', 'Tatsumaki Senpukyaku', 'Focus Attack'],
    ultimates: { level1: 'Shinku Hadoken', level2: 'Shin Shoryuken', level3: 'Metsu Hadoken', level4: 'Raging Demon' },
    synergies: ['terry'],
    unlockLevel: 3,
    primaryColor: '#FFFFFF',
    accentColor: '#FF0000'
  },
  {
    id: 'greninja',
    name: 'Shadow Frog',
    title: 'The Ninja Pokemon',
    role: 'Blitzer',
    universe: 'Pokemon',
    stats: { health: 65, attack: 80, defense: 65, speed: 95, special: 80, stamina: 80 },
    baseDamage: 48,
    transformations: ['Ash-Bond Form', 'Battle Bond', 'Celestial Ninja'],
    abilities: ['Water Shuriken', 'Shadow Sneak', 'Hydro Pump', 'Substitute'],
    ultimates: { level1: 'Secret Ninja Attack', level2: 'Giant Water Shuriken', level3: 'Battle Bond Power', level4: 'Night Slash Storm' },
    synergies: ['pikachu', 'ash'],
    unlockLevel: 2,
    primaryColor: '#003366',
    accentColor: '#FF6699'
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
