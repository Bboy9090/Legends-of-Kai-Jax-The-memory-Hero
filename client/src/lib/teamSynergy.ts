// MARVEL ULTIMATE ALLIANCE-STYLE TEAM SYNERGY SYSTEM
// Dynamic team bonuses based on hero combinations

export interface TeamBonus {
  name: string;
  description: string;
  heroIds: string[];
  bonuses: {
    [key: string]: number; // stat name => bonus percentage
  };
  teamUltimate: {
    name: string;
    description: string;
    damage: number;
  };
}

export const TEAM_SYNERGIES: TeamBonus[] = [
  // ============ SPEED DEMONS ============
  {
    name: 'Speed Demons',
    description: 'Sonic, Fox, Pikachu, Greninja - Dash Speed Bonanza',
    heroIds: ['jaxon', 'fox', 'pikachu', 'greninja'],
    bonuses: {
      dashSpeed: 0.2,
      dodge: 0.1,
      comboSpeed: 0.15
    },
    teamUltimate: {
      name: 'Lightspeed Blitzstorm',
      description: 'All heroes dash at light-speed, hitting enemies 6 times.',
      damage: 120
    }
  },

  // ============ GUARDIAN ORDER ============
  {
    name: 'Guardian Order',
    description: 'Mario, Link, Samus, Peach - Protection & Healing',
    heroIds: ['mario', 'link', 'samus', 'peach'],
    bonuses: {
      defense: 0.15,
      healingReceived: 0.1,
      blockChance: 0.08
    },
    teamUltimate: {
      name: 'Tri-Force Starburst',
      description: 'Golden shield protects team, healing all allies.',
      damage: 85
    }
  },

  // ============ CHAOS REBELS ============
  {
    name: 'Chaos Rebels',
    description: 'Shadow, Bayonetta, Snake, Meta Knight - Darkness & Precision',
    heroIds: ['shadow', 'bayonetta', 'snake', 'metaknight'],
    bonuses: {
      darknessResist: 0.2,
      criticalChance: 0.1,
      nightDamage: 0.2
    },
    teamUltimate: {
      name: 'Oblivion Execution',
      description: 'Shadows converge, delivering 8 rapid shadow strikes.',
      damage: 135
    }
  },

  // ============ DIVINE CHOIR ============
  {
    name: 'Divine Choir',
    description: 'Zelda, Rosalina, Palutena, Lunara - Cosmic Harmony',
    heroIds: ['zelda', 'rosalina', 'palutena', 'lunara'],
    bonuses: {
      spellPower: 0.25,
      cosmoticEnergy: 0.15,
      allySupportRadius: 0.2
    },
    teamUltimate: {
      name: 'Infinite Symphony',
      description: 'Cosmic harmony heals all, buffs damage by 30%.',
      damage: 100
    }
  },

  // ============ BROTHERS BOND ============
  {
    name: 'Brothers Bond',
    description: 'Mario, Luigi, Bowser Jr, Sonic - Explosive Kinship',
    heroIds: ['mario', 'luigi', 'bowserjr', 'sonic'],
    bonuses: {
      attackPower: 0.12,
      comboChain: 0.15,
      familyDamage: 0.18
    },
    teamUltimate: {
      name: 'Hammer & Spin Fusion',
      description: 'Brothers combine for devastating combo attack.',
      damage: 115
    }
  },

  // ============ TECH GURUS ============
  {
    name: 'Tech Gurus',
    description: 'Mega Man X, Tails, Samus, Wily Egg - Innovation Unleashed',
    heroIds: ['kaison', 'tails', 'samus', 'wily'],
    bonuses: {
      techFusion: 0.2,
      weaponAdjustment: 0.15,
      armorUpgrade: 0.1
    },
    teamUltimate: {
      name: 'Techfront Evolution',
      description: 'Combined tech creates mega-weapon for 180 damage.',
      damage: 180
    }
  },

  // ============ STELLAR PROTECTORS ============
  {
    name: 'Stellar Protectors',
    description: 'Rosalina, Kirby, Yoshi, Dialga - Cosmic Unity',
    heroIds: ['rosalina', 'kirby', 'yoshi', 'dialga'],
    bonuses: {
      cosmoticPower: 0.18,
      timeControl: 0.12,
      allyProtection: 0.15
    },
    teamUltimate: {
      name: 'Star Cluster Ascension',
      description: 'Stars descend, creating shield and healing aura.',
      damage: 105
    }
  },

  // ============ LEGEND CREW ============
  {
    name: 'Legend Crew',
    description: 'Sonic, Mario, Link, Pikachu - The Originals',
    heroIds: ['jaxon', 'mario', 'link', 'pikachu'],
    bonuses: {
      legacyPower: 0.25,
      iconicDamage: 0.2,
      crossoverBonus: 0.15
    },
    teamUltimate: {
      name: 'Ultimate Smash Union',
      description: 'All four legends strike simultaneously. Massive impact.',
      damage: 200
    }
  },

  // ============ DARK ALLIANCE ============
  {
    name: 'Dark Alliance',
    description: 'Ganon, Bowser, King K. Rool, Ridley - Villainous Might',
    heroIds: ['ganon', 'bowser', 'kingrool', 'ridley'],
    bonuses: {
      darkPower: 0.22,
      intimidation: 0.1,
      malevolenceDamage: 0.18
    },
    teamUltimate: {
      name: 'Kingdom of Darkness',
      description: 'Four villains unleash combined darkness.',
      damage: 155
    }
  },

  // ============ SMASH FAMILY ============
  {
    name: 'Smash Family',
    description: 'Pikachu, Ash, Greninja, Eevee - Pokemon Bond',
    heroIds: ['pikachu', 'ash', 'greninja', 'eevee'],
    bonuses: {
      pokemonSynergy: 0.2,
      bondPower: 0.15,
      evolutionBoost: 0.12
    },
    teamUltimate: {
      name: 'Pokemon Unite',
      description: 'Pikachu + team combine into ultimate power.',
      damage: 130
    }
  }
];

export function getTeamSynergy(heroIds: string[]): TeamBonus | null {
  for (const synergy of TEAM_SYNERGIES) {
    // Check if all synergy heroes are in the team
    if (synergy.heroIds.every(id => heroIds.includes(id))) {
      return synergy;
    }
  }
  return null;
}

export function calculateSynergyBonuses(heroIds: string[]): { [key: string]: number } {
  const synergy = getTeamSynergy(heroIds);
  if (!synergy) {
    return {};
  }

  return synergy.bonuses;
}

export interface FusionAttack {
  id: string;
  name: string;
  description: string;
  requiredHeroes: string[];
  damage: number;
  cooldown: number; // seconds
  animationLength: number; // ms
}

export const FUSION_ATTACKS: FusionAttack[] = [
  {
    id: 'brother_fusion',
    name: 'Brother Fusion',
    description: 'Mario & Luigi combine forces',
    requiredHeroes: ['mario', 'luigi'],
    damage: 85,
    cooldown: 15,
    animationLength: 1200
  },
  {
    id: 'sonic_jaxon_blitz',
    name: 'Chaos Blitz',
    description: 'Sonic harnesses chaos energy',
    requiredHeroes: ['jaxon'],
    damage: 110,
    cooldown: 20,
    animationLength: 1500
  },
  {
    id: 'ultimate_fusion',
    name: 'Super Smash Brother Fusion',
    description: 'All power combines',
    requiredHeroes: ['mario', 'luigi', 'jaxon', 'link'],
    damage: 250,
    cooldown: 45,
    animationLength: 3000
  },
  {
    id: 'triforce_ultimate',
    name: 'Triforce Ultimate',
    description: 'Zelda, Link, and Peach channel ancient power',
    requiredHeroes: ['zelda', 'link', 'peach'],
    damage: 200,
    cooldown: 40,
    animationLength: 2500
  },
  {
    id: 'divine_harmony',
    name: 'Divine Harmony',
    description: 'Rosalina and Palutena create cosmic balance',
    requiredHeroes: ['rosalina', 'palutena'],
    damage: 140,
    cooldown: 30,
    animationLength: 2000
  },
  {
    id: 'techfront_fusion',
    name: 'Techfront Evolution',
    description: 'Mega Man X and Tails push technology beyond limits',
    requiredHeroes: ['kaison', 'tails'],
    damage: 170,
    cooldown: 35,
    animationLength: 2200
  }
];

export interface SynergyBonus {
  type: 'stat' | 'ability' | 'special';
  name: string;
  value: number;
}
