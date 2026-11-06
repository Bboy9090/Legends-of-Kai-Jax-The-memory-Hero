/**
 * BOSS ENCOUNTER SYSTEM
 * Defines boss enemies, their abilities, mechanics, and visual design
 */

import type { Ability } from './abilitySystems';

export interface BossPhase {
  id: string;
  healthThreshold: number;
  description: string;
  abilities: string[];
  attackPattern: string;
  visualChanges: string[];
  specialMechanics: string[];
}

export interface BossMechanics {
  id: string;
  name: string;
  description: string;
  damageType: string;
  effect: string;
  triggers: string[];
}

export interface BossEncounter {
  id: string;
  name: string;
  displayName: string;
  title: string;
  description: string;
  location: string;
  faction: string;
  difficulty: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  visualIdentity: {
    primaryColor: string;
    accentColor: string;
    visualThemes: string[];
    modelType: string;
    scale: number;
  };
  phases: BossPhase[];
  mechanics: BossMechanics[];
  abilityIds: string[];
  enrageTimer?: number;
  enragePower?: {
    name: string;
    description: string;
    damageMultiplier: number;
    speedMultiplier: number;
  };
  minions?: Array<{
    type: string;
    count: number;
    spawnPhase: number;
  }>;
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
    uniqueDrops: string[];
  };
  lore: string;
}

// ============ MAIN STORY BOSSES ============

export const ASHEN_ENFORCER: BossEncounter = {
  id: 'ashen-enforcer',
  name: 'Ashen Enforcer',
  displayName: 'ASHEN ENFORCER',
  title: 'Commander of Ashblock Heights',
  description: 'A war machine pilot whose armor is scorched from countless battles',
  location: 'ashblock-heights',
  faction: 'FANG SYNDICATE',
  difficulty: 7,
  health: 450,
  maxHealth: 450,
  attack: 85,
  defense: 90,
  speed: 60,
  visualIdentity: {
    primaryColor: '#ff6347',
    accentColor: '#ffa500',
    visualThemes: ['burnt metal', 'scorched armor', 'flame aura', 'syndicate insignia'],
    modelType: 'heavily-armored-humanoid',
    scale: 1.3,
  },
  phases: [
    {
      id: 'ashen-phase-1',
      healthThreshold: 100,
      description: 'Standard combat - uses heavy attacks',
      abilities: ['ashen-slam', 'ashen-combo'],
      attackPattern: 'melee-heavy',
      visualChanges: [],
      specialMechanics: [],
    },
    {
      id: 'ashen-phase-2',
      healthThreshold: 50,
      description: 'Armor ignites - performs area attacks',
      abilities: ['ashen-slam', 'ashen-inferno', 'ashen-combo'],
      attackPattern: 'balanced',
      visualChanges: ['armor-flames-intensify', 'glow-increases'],
      specialMechanics: ['aoe-heat-damage', 'knockback-attacks'],
    },
    {
      id: 'ashen-phase-3',
      healthThreshold: 25,
      description: 'Final stand - uses ultimate ability',
      abilities: ['ashen-slam', 'ashen-inferno', 'ashen-ultimate'],
      attackPattern: 'aggressive',
      visualChanges: ['full-armor-ablaze', 'massive-aura'],
      specialMechanics: ['constant-aoe', 'rapid-attacks'],
    },
  ],
  mechanics: [
    {
      id: 'heat-aura',
      name: 'Heat Aura',
      description: 'The Enforcer radiates intense heat',
      damageType: 'fire',
      effect: 'Continuous damage to players within melee range',
      triggers: ['always-active'],
    },
    {
      id: 'flame-burst',
      name: 'Flame Burst',
      description: 'Explosive burst of flames around the boss',
      damageType: 'fire',
      effect: 'AOE damage + knockback',
      triggers: ['phase-2-start', 'health-50-percent'],
    },
    {
      id: 'counter-attack',
      name: 'Counter Attack',
      description: 'Reflects incoming physical damage',
      damageType: 'physical',
      effect: 'Returns damage to attacker',
      triggers: ['when-attacked', 'phase-2'],
    },
  ],
  abilityIds: ['ashen-slam', 'ashen-inferno', 'ashen-combo', 'ashen-ultimate'],
  enrageTimer: 120,
  enragePower: {
    name: 'Inferno Rage',
    description: 'The Enforcer enters a state of pure fury',
    damageMultiplier: 1.5,
    speedMultiplier: 1.3,
  },
  rewards: {
    xp: 2000,
    currency: 1500,
    loot: ['Enforcer Badge', 'Syndicate Armor Plate', 'Memory Fragment'],
    uniqueDrops: ['Ashen Commander\'s Coat'],
  },
  lore: 'Once a soldier of honor, this Enforcer was enhanced by the Fang Syndicate with experimental war machine technology. The heat from the reactor slowly burns away their humanity.',
};

// ============ VOID STALKER BOSS ============

export const VOID_STALKER: BossEncounter = {
  id: 'void-stalker',
  name: 'Void Stalker',
  displayName: 'VOID STALKER',
  title: 'Shadow from the Rift',
  description: 'A being of pure shadow that hunts the Memory Hero across timelines',
  location: 'memory-vault',
  faction: 'VOID',
  difficulty: 8,
  health: 520,
  maxHealth: 520,
  attack: 95,
  defense: 70,
  speed: 110,
  visualIdentity: {
    primaryColor: '#2d1b69',
    accentColor: '#a020f0',
    visualThemes: ['void mist', 'shadow form', 'purple aura', 'reality tears'],
    modelType: 'shadow-entity',
    scale: 1.1,
  },
  phases: [
    {
      id: 'stalker-phase-1',
      healthThreshold: 100,
      description: 'Stalking phase - fast strikes from shadows',
      abilities: ['void-strike', 'shadow-dash'],
      attackPattern: 'hit-and-run',
      visualChanges: [],
      specialMechanics: ['teleport-attacks'],
    },
    {
      id: 'stalker-phase-2',
      healthThreshold: 50,
      description: 'Void corruption intensifies',
      abilities: ['void-strike', 'shadow-dash', 'void-explosion'],
      attackPattern: 'aggressive',
      visualChanges: ['more-void-energy', 'increased-darkness'],
      specialMechanics: ['shadow-clones', 'reality-damage'],
    },
  ],
  mechanics: [
    {
      id: 'shadow-teleport',
      name: 'Shadow Teleport',
      description: 'Instantly moves to attack position',
      damageType: 'void',
      effect: 'Appears behind player for backstab attack',
      triggers: ['during-combat'],
    },
    {
      id: 'void-corruption',
      name: 'Void Corruption',
      description: 'Spreads void energy that damages and slows',
      damageType: 'void',
      effect: 'Debuff: reduced speed and damage',
      triggers: ['phase-2', 'special-attack'],
    },
    {
      id: 'memory-theft',
      name: 'Memory Theft',
      description: 'Steals player abilities temporarily',
      damageType: 'void',
      effect: 'Player loses one ability for 8 seconds',
      triggers: ['health-50-percent', 'random'],
    },
  ],
  abilityIds: ['void-strike', 'shadow-dash', 'void-explosion', 'void-ultimate'],
  enrageTimer: 150,
  enragePower: {
    name: 'Void Ascendance',
    description: 'The Stalker grows stronger from void energy',
    damageMultiplier: 1.8,
    speedMultiplier: 1.5,
  },
  minions: [
    { type: 'shadow-echo', count: 2, spawnPhase: 2 },
  ],
  rewards: {
    xp: 3000,
    currency: 2000,
    loot: ['Shadow Essence', 'Void Fragment', 'Corrupt Memory'],
    uniqueDrops: ['Stalker\'s Cloak'],
  },
  lore: 'The Void Stalker is a hunter sent from the Rift itself. It was created to eliminate the Memory Hero before he could threaten the Void\'s plans for this world.',
};

// ============ RIFT GENERAL BOSS ============

export const RIFT_GENERAL: BossEncounter = {
  id: 'rift-general',
  name: 'Rift General',
  displayName: 'RIFT GENERAL',
  title: 'Commander of the Void Invasion',
  description: 'An ancient general commanding the assault from beyond reality',
  location: 'memory-vault',
  faction: 'VOID',
  difficulty: 10,
  health: 800,
  maxHealth: 800,
  attack: 110,
  defense: 95,
  speed: 85,
  visualIdentity: {
    primaryColor: '#4b0082',
    accentColor: '#9400d3',
    visualThemes: ['void lord armor', 'cosmic energy', 'reality distortion', 'command aura'],
    modelType: 'elder-void-entity',
    scale: 1.5,
  },
  phases: [
    {
      id: 'general-phase-1',
      healthThreshold: 100,
      description: 'Commander phase - tactical combat',
      abilities: ['void-lance', 'command-strike', 'generals-order'],
      attackPattern: 'tactical',
      visualChanges: [],
      specialMechanics: [],
    },
    {
      id: 'general-phase-2',
      healthThreshold: 60,
      description: 'Opens reality rifts - summons minions',
      abilities: ['void-lance', 'command-strike', 'reality-rift'],
      attackPattern: 'summoning',
      visualChanges: ['rifts-open', 'void-tendrils-emerge'],
      specialMechanics: ['summon-enemies', 'area-control'],
    },
    {
      id: 'general-phase-3',
      healthThreshold: 20,
      description: 'Final form - uses apocalyptic power',
      abilities: ['void-lance', 'command-strike', 'apocalypse-beam'],
      attackPattern: 'devastating',
      visualChanges: ['transforms-into-void-form', 'reality-crumbles'],
      specialMechanics: ['massive-aoe', 'instakill-zones'],
    },
  ],
  mechanics: [
    {
      id: 'void-summon',
      name: 'Void Summon',
      description: 'Calls forth void creatures to fight alongside',
      damageType: 'void',
      effect: 'Summons 3-5 void minions',
      triggers: ['phase-2', 'below-60-percent-health'],
    },
    {
      id: 'reality-distortion',
      name: 'Reality Distortion',
      description: 'Warps space and time around the general',
      damageType: 'void',
      effect: 'Creates hazardous zones that damage and disorient',
      triggers: ['phase-2', 'phase-3'],
    },
    {
      id: 'command-aura',
      name: 'Command Aura',
      description: 'The general\'s presence empowers void creatures',
      damageType: 'void',
      effect: 'All void allies gain +50% damage',
      triggers: ['always-active'],
    },
  ],
  abilityIds: ['void-lance', 'command-strike', 'generals-order', 'reality-rift', 'apocalypse-beam'],
  enrageTimer: 180,
  enragePower: {
    name: 'Void Supremacy',
    description: 'The General unlocks the full power of the Void',
    damageMultiplier: 2.0,
    speedMultiplier: 1.4,
  },
  minions: [
    { type: 'void-grunt', count: 5, spawnPhase: 2 },
    { type: 'void-elite', count: 3, spawnPhase: 3 },
  ],
  rewards: {
    xp: 5000,
    currency: 4000,
    loot: ['Void Core', 'General\'s Insignia', 'Reality Fragment'],
    uniqueDrops: ['Void General\'s Crown'],
  },
  lore: 'The Rift General is an ancient commander who has conquered countless worlds. It sees this reality as another conquest, another dominion to add to the Void\'s eternal expansion.',
};

// ============ BOSS REGISTRY ============

export const ALL_BOSSES: BossEncounter[] = [
  ASHEN_ENFORCER,
  VOID_STALKER,
  RIFT_GENERAL,
];

export const BOSS_MAP: Record<string, BossEncounter> = {
  'ashen-enforcer': ASHEN_ENFORCER,
  'void-stalker': VOID_STALKER,
  'rift-general': RIFT_GENERAL,
};

export function getBossEncounter(bossId: string): BossEncounter | undefined {
  return BOSS_MAP[bossId];
}

export function getBossesByDifficulty(difficulty: number): BossEncounter[] {
  return ALL_BOSSES.filter(boss => boss.difficulty === difficulty);
}

export function getBossesByFaction(faction: string): BossEncounter[] {
  return ALL_BOSSES.filter(boss => boss.faction === faction);
}
