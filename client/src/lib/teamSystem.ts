// SUPER SMASH GRAND SAGA - 4-HERO TEAM SYSTEM WITH TAG SWITCHING

export interface TeamMember {
  characterId: string;
  position: 0 | 1 | 2 | 3; // Team slot
  isActive: boolean;
  health: number;
  maxHealth: number;
  energy: number;
  transformationLevel: 0 | 1 | 2 | 3 | 4; // Base, Super, Chaos, Celestial, Hyper
  selectedAbilities: string[]; // 4 abilities per character
  ultimateCharge: number; // 0-100
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  synergies: {
    activeSynergy?: string; // Current active team synergy ID
    bonusStats: {
      attackBonus: number;
      defenseBonus: number;
      speedBonus: number;
      specialBonus: number;
    };
  };
  tagCombos: TagCombo[];
}

export interface TagCombo {
  id: string;
  name: string;
  characters: [string, string]; // Two character IDs
  description: string;
  damage: number;
  cooldown: number;
  animationLength: number;
}

export interface EntranceStrike {
  characterId: string;
  name: string;
  damage: number;
  effect: string; // "stun", "knockback", "buff", etc.
  duration?: number;
}

export interface RevivalMechanic {
  downedCharacterId: string;
  reviverCharacterId: string;
  healthRestored: number; // Percentage
  invulnerabilityFrames: number;
  recoveryBonus: number; // Stat multiplier after revival
}

// ============ TAG SWITCHING SYSTEM ============
export class TagSwitchSystem {
  static performTagSwitch(
    activeCharacterId: string,
    targetCharacterId: string,
    team: Team
  ): EntranceStrike {
    // Get the character performing entrance strike
    const character = team.members.find(m => m.characterId === targetCharacterId);
    
    if (!character) {
      throw new Error(`Character ${targetCharacterId} not found in team`);
    }

    // Create entrance strike based on character
    const entranceStrike: EntranceStrike = this.generateEntranceStrike(targetCharacterId);
    
    // Switch active character
    team.members.forEach((member, index) => {
      if (member.characterId === activeCharacterId) {
        member.isActive = false;
      }
      if (member.characterId === targetCharacterId) {
        member.isActive = true;
      }
    });

    return entranceStrike;
  }

  static generateEntranceStrike(characterId: string): EntranceStrike {
    const strikeMap: { [key: string]: EntranceStrike } = {
      'sonic': {
        characterId: 'sonic',
        name: 'Sonic Speed Burst',
        damage: 40,
        effect: 'rush',
        duration: 3
      },
      'mario': {
        characterId: 'mario',
        name: 'Super Jump Strike',
        damage: 45,
        effect: 'knockback'
      },
      'link': {
        characterId: 'link',
        name: 'Sword Slash',
        damage: 50,
        effect: 'stun',
        duration: 2
      },
      'pikachu': {
        characterId: 'pikachu',
        name: 'Thunder Shock',
        damage: 35,
        effect: 'paralyze',
        duration: 2
      }
    };

    return strikeMap[characterId] || {
      characterId,
      name: 'Basic Strike',
      damage: 30,
      effect: 'none'
    };
  }
}

// ============ REVIVAL SYSTEM ============
export class RevivalSystem {
  static reviveCharacter(
    downed: TeamMember,
    reviver: TeamMember,
    team: Team
  ): RevivalMechanic {
    const healthRestored = 50; // Restore 50% health
    const invulnerabilityFrames = 180; // 3 seconds at 60fps
    const recoveryBonus = 1.2; // 20% stat boost after revival

    downed.health = Math.ceil(downed.maxHealth * (healthRestored / 100));
    
    // Apply temporary buff
    team.synergies.bonusStats.speedBonus += 0.1;

    return {
      downedCharacterId: downed.characterId,
      reviverCharacterId: reviver.characterId,
      healthRestored,
      invulnerabilityFrames,
      recoveryBonus
    };
  }

  static canRevive(reviver: TeamMember, opponent: any): boolean {
    // Can revive if reviver is not downed and not in danger
    return reviver.health > 0 && (opponent?.distance || 0) > 3;
  }
}

// ============ PASSIVE BUFF SYSTEM ============
export const TAG_PASSIVE_BUFFS: { [key: string]: { [key: string]: number } } = {
  'sonic': {
    speed: 0.2,
    dash: 0.3,
  },
  'mario': {
    attack: 0.15,
    defense: 0.1,
  },
  'link': {
    defense: 0.2,
    stamina: 0.15,
  },
  'samus': {
    special: 0.2,
    charge: 0.25,
  },
  'pikachu': {
    special: 0.25,
    speed: 0.1,
  },
  'kirby': {
    absorb: 0.2,
    recovery: 0.15,
  },
  'fox': {
    speed: 0.15,
    reflect: 0.2,
  },
  'donkeykong': {
    attack: 0.3,
    grab: 0.2,
  }
};

// ============ HELPER FUNCTIONS ============
export function getTagPassiveBuff(characterId: string): { [key: string]: number } {
  return TAG_PASSIVE_BUFFS[characterId] || {};
}

export function calculateTeamSynergyBonus(team: Team, synergy: string): { [key: string]: number } {
  const bonuses = {
    attackBonus: 0,
    defenseBonus: 0,
    speedBonus: 0,
    specialBonus: 0
  };

  // Apply bonuses based on synergy
  const synergyBonusMap: { [key: string]: { [key: string]: number } } = {
    'speed_demons': { speedBonus: 0.2, attackBonus: 0.1 },
    'brute_squad': { attackBonus: 0.25, defenseBonus: 0.1 },
    'divine_choir': { specialBonus: 0.25, defenseBonus: 0.15 },
  };

  const synergyBonus = synergyBonusMap[synergy];
  if (synergyBonus) {
    Object.assign(bonuses, synergyBonus);
  }

  return bonuses;
}

export function createTeam(
  member1: string,
  member2: string,
  member3: string,
  member4: string
): Team {
  const team: Team = {
    id: `team_${Date.now()}`,
    name: 'Custom Team',
    members: [
      {
        characterId: member1,
        position: 0,
        isActive: true,
        health: 100,
        maxHealth: 100,
        energy: 0,
        transformationLevel: 0,
        selectedAbilities: [],
        ultimateCharge: 0
      },
      {
        characterId: member2,
        position: 1,
        isActive: false,
        health: 100,
        maxHealth: 100,
        energy: 0,
        transformationLevel: 0,
        selectedAbilities: [],
        ultimateCharge: 0
      },
      {
        characterId: member3,
        position: 2,
        isActive: false,
        health: 100,
        maxHealth: 100,
        energy: 0,
        transformationLevel: 0,
        selectedAbilities: [],
        ultimateCharge: 0
      },
      {
        characterId: member4,
        position: 3,
        isActive: false,
        health: 100,
        maxHealth: 100,
        energy: 0,
        transformationLevel: 0,
        selectedAbilities: [],
        ultimateCharge: 0
      }
    ],
    synergies: {
      bonusStats: {
        attackBonus: 0,
        defenseBonus: 0,
        speedBonus: 0,
        specialBonus: 0
      }
    },
    tagCombos: []
  };

  return team;
}
