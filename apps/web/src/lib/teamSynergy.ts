// LEGENDS OF KAI-JAX: TEAM SYNERGY SYSTEM
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

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
  // ============ THE FIRST FUSIONS ============
  {
    name: 'The First Fusions',
    description: 'Kai-Jax, Jaxon, Kaison - The Core Memory bond',
    heroIds: ['kai-jax', 'jaxon', 'kaison'],
    bonuses: {
      attackPower: 0.2,
      staminaRegen: 0.15,
      fusionRate: 0.25
    },
    teamUltimate: {
      name: 'Zenith Overload',
      description: 'The trio merges their strands for a massive reality-shattering impact.',
      damage: 180
    }
  },

  // ============ WEAVE SENTINELS ============
  {
    name: 'Weave Sentinels',
    description: 'Kai-Jax, Silver, Korg - Unbreakable Defense',
    heroIds: ['kai-jax', 'silver', 'korg'],
    bonuses: {
      defense: 0.25,
      damageReduction: 0.15,
      staggerResist: 0.2
    },
    teamUltimate: {
      name: 'Aegis of the Eternal',
      description: 'A massive energy barrier protects the team while stone spikes erupt from the ground.',
      damage: 120
    }
  },

  // ============ CELESTIAL ASSEMBLY ============
  {
    name: 'Celestial Assembly',
    description: 'Lunara, Silver, Puff - Cosmic Distortion',
    heroIds: ['lunara', 'silver', 'puff'],
    bonuses: {
      specialPower: 0.3,
      timeDilation: 0.1,
      voidDamage: 0.15
    },
    teamUltimate: {
      name: 'Lunar Collapse',
      description: 'Gravity is inverted as a black hole consumes the battlefield.',
      damage: 220
    }
  },

  // ============ ELEMENTAL BEASTS ============
  {
    name: 'Elemental Beasts',
    description: 'Volter, Korg, Puff, Borgos - Raw Primal Fury',
    heroIds: ['volter', 'korg', 'puff', 'borgos'],
    bonuses: {
      baseDamage: 0.2,
      criticalChance: 0.12,
      movementSpeed: 0.1
    },
    teamUltimate: {
      name: 'Primal Cataclysm',
      description: 'A storm of lightning, stone, and void energy ravages everything in sight.',
      damage: 190
    }
  }
];

export function getTeamSynergy(heroIds: string[]): TeamBonus | null {
  for (const synergy of TEAM_SYNERGIES) {
    if (synergy.heroIds.every(id => heroIds.includes(id))) {
      return synergy;
    }
  }
  return null;
}

export function calculateSynergyBonuses(heroIds: string[]): { [key: string]: number } {
  const synergy = getTeamSynergy(heroIds);
  if (!synergy) return {};
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
    id: 'zenith_convergence',
    name: 'Zenith Convergence',
    description: 'Jaxon and Kaison fuse into Kai-Jax for a devastating strike.',
    requiredHeroes: ['jaxon', 'kaison'],
    damage: 150,
    cooldown: 30,
    animationLength: 2000
  },
  {
    id: 'lunar_chronos',
    name: 'Lunar Chronos',
    description: 'Lunara and Silver manipulate time and space.',
    requiredHeroes: ['lunara', 'silver'],
    damage: 130,
    cooldown: 25,
    animationLength: 1800
  },
  {
    id: 'beast_overdrive',
    name: 'Beast Overdrive',
    description: 'Volter and Korg unleash primal electrical and earth energy.',
    requiredHeroes: ['volter', 'korg'],
    damage: 140,
    cooldown: 25,
    animationLength: 1900
  }
];

export function getActiveTeamBonuses(teamIds: string[]): TeamBonus[] {
  return TEAM_SYNERGIES.filter(synergy => {
    const matchCount = synergy.heroIds.filter(id => teamIds.includes(id)).length;
    return matchCount >= 2;
  });
}
