// LEGENDS OF KAI-JAX: TEAM COORDINATION SYSTEM
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

export interface TeamMember {
  characterId: string;
  position: 0 | 1 | 2 | 3; // Team slot
  isActive: boolean;
  health: number;
  maxHealth: number;
  energy: number;
  transformationLevel: 0 | 1 | 2 | 3 | 4; // Base, Awakening, Synchronized, Zenith, Eternal
  selectedAbilities: string[]; 
  ultimateCharge: number; // 0-100
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  synergies: {
    activeSynergy?: string;
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
  characters: [string, string];
  description: string;
  damage: number;
  cooldown: number;
  animationLength: number;
}

export interface EntranceStrike {
  characterId: string;
  name: string;
  damage: number;
  effect: string; // "stun", "knockback", "slow", etc.
  duration?: number;
}

// ============ TAG SWITCHING SYSTEM ============
export class TagSwitchSystem {
  static generateEntranceStrike(characterId: string): EntranceStrike {
    const strikeMap: { [key: string]: EntranceStrike } = {
      'jaxon': {
        characterId: 'jaxon',
        name: 'Volt Burst',
        damage: 45,
        effect: 'rush',
        duration: 3
      },
      'kai-jax': {
        characterId: 'kai-jax',
        name: 'Memory Ripple',
        damage: 55,
        effect: 'knockback'
      },
      'silver': {
        characterId: 'silver',
        name: 'Temporal Anchor',
        damage: 40,
        effect: 'slow',
        duration: 2
      },
      'volter': {
        characterId: 'volter',
        name: 'Thunder Leap',
        damage: 50,
        effect: 'paralyze',
        duration: 1.5
      }
    };

    return strikeMap[characterId] || {
      characterId,
      name: 'Memory Strike',
      damage: 35,
      effect: 'none'
    };
  }
}

// ============ PASSIVE BUFF SYSTEM ============
export const TAG_PASSIVE_BUFFS: { [key: string]: { [key: string]: number } } = {
  'jaxon': {
    speed: 0.25,
    dashDistance: 0.2,
  },
  'kai-jax': {
    attack: 0.2,
    syncRate: 0.15,
  },
  'silver': {
    timeDilation: 0.15,
    cooldownReduction: 0.1,
  },
  'volter': {
    specialPower: 0.3,
    staticChance: 0.2,
  },
  'korg': {
    defense: 0.3,
    staggerResist: 0.25,
  },
  'puff': {
    mimicEfficiency: 0.2,
    voidRegen: 0.15,
  },
  'lunara': {
    celestialPower: 0.25,
    lunarShield: 0.2,
  }
};

export function getTagPassiveBuff(characterId: string): { [key: string]: number } {
  return TAG_PASSIVE_BUFFS[characterId] || {};
}
