/**
 * ABILITY & POWER MECHANICS SYSTEM
 * Defines abilities, power matrices, and skill trees for all characters
 */

export interface Ability {
  id: string;
  name: string;
  description: string;
  element: string;
  tier: 1 | 2 | 3;
  cooldown: number;
  manaCost: number;
  damage: number;
  visualEffect: string;
  animation: string;
}

export interface PowerMatrix {
  characterId: string;
  abilities: Ability[];
  passives: Array<{ id: string; name: string; description: string; effect: string }>;
  ultimate: {
    id: string;
    name: string;
    description: string;
    damage: number;
    duration: number;
    cooldown: number;
    visualEffect: string;
  };
  fusionPower?: {
    id: string;
    name: string;
    description: string;
    requiresCharacters: string[];
    damage: number;
    cooldown: number;
  };
}

// ============ CORE ABILITIES ============

export const STORM_PRESSURE: Ability = {
  id: 'storm-pressure',
  name: 'Storm Pressure',
  description: 'Unleash a wave of electrical pressure that damages all enemies in front',
  element: 'Lightning',
  tier: 1,
  cooldown: 3,
  manaCost: 30,
  damage: 45,
  visualEffect: 'electrical-wave',
  animation: 'pressure-wave-start',
};

export const LIGHTNING_CHANNELING: Ability = {
  id: 'lightning-channeling',
  name: 'Lightning Channeling',
  description: 'Channel lightning energy for increased damage and attack speed',
  element: 'Lightning',
  tier: 2,
  cooldown: 5,
  manaCost: 50,
  damage: 70,
  visualEffect: 'lightning-aura',
  animation: 'channeling-start',
};

export const DISPLACEMENT_BURST: Ability = {
  id: 'displacement-burst',
  name: 'Displacement Burst',
  description: 'Teleport to a target location and burst with electrical energy',
  element: 'Lightning',
  tier: 2,
  cooldown: 6,
  manaCost: 60,
  damage: 80,
  visualEffect: 'displacement-vortex',
  animation: 'burst-teleport',
};

export const THRYXEN_SENSES: Ability = {
  id: 'thryxen-senses',
  name: 'Thryxen Senses',
  description: 'Activate heightened perception to detect and dodge incoming attacks',
  element: 'Lightning',
  tier: 1,
  cooldown: 4,
  manaCost: 40,
  damage: 0,
  visualEffect: 'perception-glow',
  animation: 'sense-activation',
};

// ============ KAI-JAX FUSION ABILITIES ============

export const MEMORY_WEAVE: Ability = {
  id: 'memory-weave',
  name: 'Memory Weave',
  description: 'Manipulate memory strands to rewrite battlefield conditions',
  element: 'Memory',
  tier: 3,
  cooldown: 7,
  manaCost: 80,
  damage: 100,
  visualEffect: 'memory-strands',
  animation: 'weave-casting',
};

export const STORM_CURRENT: Ability = {
  id: 'storm-current',
  name: 'Storm Current',
  description: 'Combine storm and current energy for devastating electrical cascades',
  element: 'Lightning',
  tier: 3,
  cooldown: 8,
  manaCost: 90,
  damage: 120,
  visualEffect: 'storm-cascade',
  animation: 'current-surge',
};

export const EMBER_VENOM: Ability = {
  id: 'ember-venom',
  name: 'Ember Venom',
  description: 'Infect enemies with burning toxin that spreads between foes',
  element: 'Fire',
  tier: 2,
  cooldown: 5,
  manaCost: 55,
  damage: 75,
  visualEffect: 'venom-cloud',
  animation: 'venom-spray',
};

export const PRESSURE_DOMAIN: Ability = {
  id: 'pressure-domain',
  name: 'Pressure Domain',
  description: 'Create a zone of intense pressure that slows and damages enemies',
  element: 'Lightning',
  tier: 3,
  cooldown: 9,
  manaCost: 100,
  damage: 90,
  visualEffect: 'pressure-field',
  animation: 'domain-creation',
};

export const PREDATOR_SENSES: Ability = {
  id: 'predator-senses',
  name: 'Predator Senses',
  description: 'Track enemy movements and predict attacks with savage instinct',
  element: 'Primal',
  tier: 2,
  cooldown: 4,
  manaCost: 45,
  damage: 0,
  visualEffect: 'predator-glow',
  animation: 'sense-activation',
};

// ============ CHARACTER POWER MATRICES ============

export const JAX_POWER_MATRIX: PowerMatrix = {
  characterId: 'jax',
  abilities: [
    STORM_PRESSURE,
    LIGHTNING_CHANNELING,
    DISPLACEMENT_BURST,
    THRYXEN_SENSES,
  ],
  passives: [
    {
      id: 'jax-passive-1',
      name: 'Storm Resonance',
      description: 'Every attack generates electrical charge',
      effect: 'Charge increases next ability damage by 10% per stack (max 5)',
    },
    {
      id: 'jax-passive-2',
      name: 'Lightning Reflexes',
      description: 'Dodge incoming attacks with supernatural speed',
      effect: '20% chance to automatically dodge incoming damage',
    },
  ],
  ultimate: {
    id: 'jax-ultimate',
    name: 'Thryxen Ascension',
    description: 'Transform into full Thryxen form - devastating lightning fury',
    damage: 200,
    duration: 8,
    cooldown: 15,
    visualEffect: 'ascension-burst',
  },
};

export const KAI_JAX_POWER_MATRIX: PowerMatrix = {
  characterId: 'kai-jax',
  abilities: [
    MEMORY_WEAVE,
    STORM_CURRENT,
    EMBER_VENOM,
    PRESSURE_DOMAIN,
    PREDATOR_SENSES,
  ],
  passives: [
    {
      id: 'kaijax-passive-1',
      name: 'Dual Nature',
      description: 'Combine Kai and Jax powers for enhanced effects',
      effect: 'All abilities gain 25% increased effectiveness',
    },
    {
      id: 'kaijax-passive-2',
      name: 'Memory Convergence',
      description: 'Absorbed memories amplify power',
      effect: 'Damage increases 5% for each ability used in sequence',
    },
    {
      id: 'kaijax-passive-3',
      name: 'Predatory Instinct',
      description: 'Never backs down from a fight',
      effect: 'Gain 2% lifesteal on all damage dealt',
    },
  ],
  ultimate: {
    id: 'kaijax-ultimate',
    name: 'Prismatic Convergence',
    description: 'The Memory Hero channels all power into one catastrophic strike',
    damage: 300,
    duration: 10,
    cooldown: 20,
    visualEffect: 'prismatic-explosion',
  },
  fusionPower: {
    id: 'fusion-nexus',
    name: 'Fusion Nexus',
    description: 'When Kai and Jax unite, reality itself bends to their will',
    requiresCharacters: ['kai', 'jax'],
    damage: 250,
    cooldown: 25,
  },
};

export const KAISON_POWER_MATRIX: PowerMatrix = {
  characterId: 'kaison',
  abilities: [
    {
      id: 'kaison-ability-1',
      name: 'Fox Dash',
      description: 'Swift tactical dodge and counter',
      element: 'Wind',
      tier: 1,
      cooldown: 3,
      manaCost: 25,
      damage: 35,
      visualEffect: 'wind-dash',
      animation: 'dash-counter',
    },
    {
      id: 'kaison-ability-2',
      name: 'Web Control',
      description: 'Manipulate webs for mobility and traps',
      element: 'Web',
      tier: 2,
      cooldown: 4,
      manaCost: 40,
      damage: 50,
      visualEffect: 'web-construct',
      animation: 'web-cast',
    },
    {
      id: 'kaison-ability-3',
      name: 'Tactical Gale',
      description: 'Redirect enemy attacks with precise wind control',
      element: 'Wind',
      tier: 2,
      cooldown: 5,
      manaCost: 45,
      damage: 60,
      visualEffect: 'wind-redirect',
      animation: 'gale-cast',
    },
  ],
  passives: [
    {
      id: 'kaison-passive-1',
      name: 'Strategic Mind',
      description: 'Analyze enemy patterns and exploit weaknesses',
      effect: 'Gain 15% critical strike chance',
    },
    {
      id: 'kaison-passive-2',
      name: 'Protective Stance',
      description: 'Guard allies with tactical positioning',
      effect: 'Reduce damage taken by 10%',
    },
  ],
  ultimate: {
    id: 'kaison-ultimate',
    name: 'Swift Reckoning',
    description: 'Strike from impossible angles at superhuman speed',
    damage: 180,
    duration: 6,
    cooldown: 15,
    visualEffect: 'reckoning-strike',
  },
};

export const SILVER_POWER_MATRIX: PowerMatrix = {
  characterId: 'silver',
  abilities: [
    {
      id: 'silver-ability-1',
      name: 'Time Rewind',
      description: 'Reverse recent events to undo damage or escape danger',
      element: 'Time',
      tier: 1,
      cooldown: 4,
      manaCost: 35,
      damage: 0,
      visualEffect: 'temporal-rewind',
      animation: 'time-reversal',
    },
    {
      id: 'silver-ability-2',
      name: 'Chrono Acceleration',
      description: 'Accelerate time for increased movement and attack speed',
      element: 'Time',
      tier: 2,
      cooldown: 5,
      manaCost: 50,
      damage: 40,
      visualEffect: 'time-acceleration',
      animation: 'speed-burst',
    },
    {
      id: 'silver-ability-3',
      name: 'Temporal Anchor',
      description: 'Lock an enemy in temporal stasis, preventing their actions',
      element: 'Time',
      tier: 2,
      cooldown: 6,
      manaCost: 55,
      damage: 50,
      visualEffect: 'temporal-freeze',
      animation: 'anchor-cast',
    },
  ],
  passives: [
    {
      id: 'silver-passive-1',
      name: 'Time Manipulation',
      description: 'Naturally slip through time, dodging incoming damage',
      effect: 'Increase evasion by 20%',
    },
    {
      id: 'silver-passive-2',
      name: 'Reality Weaver',
      description: 'Mend tears in reality with each spell cast',
      effect: 'Regenerate 5% max mana per ability used',
    },
  ],
  ultimate: {
    id: 'silver-ultimate',
    name: 'Time Fractured',
    description: 'Shatter time itself, damaging all enemies and reversing recent actions',
    damage: 200,
    duration: 8,
    cooldown: 18,
    visualEffect: 'time-fracture',
  },
};

export const VOLTER_POWER_MATRIX: PowerMatrix = {
  characterId: 'volter',
  abilities: [
    {
      id: 'volter-ability-1',
      name: 'Thunderstrike',
      description: 'Unleash a powerful lightning bolt at a single target',
      element: 'Lightning',
      tier: 1,
      cooldown: 3,
      manaCost: 30,
      damage: 55,
      visualEffect: 'lightning-bolt',
      animation: 'strike-down',
    },
    {
      id: 'volter-ability-2',
      name: 'Static Field',
      description: 'Create a field of static electricity that damages nearby enemies',
      element: 'Lightning',
      tier: 2,
      cooldown: 4,
      manaCost: 45,
      damage: 70,
      visualEffect: 'static-aura',
      animation: 'field-expand',
    },
    {
      id: 'volter-ability-3',
      name: 'Feral Rampage',
      description: 'Enter a primal fury, striking all nearby enemies with savage power',
      element: 'Lightning',
      tier: 2,
      cooldown: 5,
      manaCost: 55,
      damage: 85,
      visualEffect: 'rampage-charge',
      animation: 'beast-fury',
    },
  ],
  passives: [
    {
      id: 'volter-passive-1',
      name: 'Primal Instinct',
      description: 'React with raw instinct to incoming threats',
      effect: 'Gain 25% critical strike chance',
    },
    {
      id: 'volter-passive-2',
      name: 'Static Charge',
      description: 'Build electrical energy with each attack',
      effect: 'Each ability increases next attack damage by 15%',
    },
  ],
  ultimate: {
    id: 'volter-ultimate',
    name: 'Lightning Apocalypse',
    description: 'Unleash uncontrolled electrical fury, striking all enemies with maximum voltage',
    damage: 220,
    duration: 5,
    cooldown: 16,
    visualEffect: 'lightning-storm',
  },
};

// ============ POWER MATRIX REGISTRY ============

export const POWER_MATRICES: Record<string, PowerMatrix> = {
  'kai-jax': KAI_JAX_POWER_MATRIX,
  'jax': JAX_POWER_MATRIX,
  'kaison': KAISON_POWER_MATRIX,
  'silver': SILVER_POWER_MATRIX,
  'volter': VOLTER_POWER_MATRIX,
};

export function getCharacterPowerMatrix(characterId: string): PowerMatrix | undefined {
  return POWER_MATRICES[characterId];
}

export function getCharacterAbilities(characterId: string): Ability[] {
  const matrix = POWER_MATRICES[characterId];
  return matrix?.abilities || [];
}

export function getCharacterUltimate(characterId: string) {
  const matrix = POWER_MATRICES[characterId];
  return matrix?.ultimate;
}

export function getCharacterPassives(characterId: string) {
  const matrix = POWER_MATRICES[characterId];
  return matrix?.passives || [];
}
