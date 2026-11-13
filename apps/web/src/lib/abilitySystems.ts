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
    { ...PREDATOR_SENSES, tier: 1 },
    { ...EMBER_VENOM, tier: 1 },
    { ...MEMORY_WEAVE, tier: 2 },
    { ...STORM_CURRENT, tier: 2 },
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
    {
      id: 'kaison-ability-4',
      name: 'Web Snare',
      description: 'Fire a quick web that slows the first enemy hit',
      element: 'Web',
      tier: 1,
      cooldown: 3,
      manaCost: 25,
      damage: 30,
      visualEffect: 'web-snare',
      animation: 'snare-throw',
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
    {
      id: 'silver-ability-4',
      name: 'Moment Pause',
      description: 'Stall a single enemy for a heartbeat of borrowed time',
      element: 'Time',
      tier: 1,
      cooldown: 3,
      manaCost: 30,
      damage: 20,
      visualEffect: 'time-pause',
      animation: 'pause-cast',
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
    {
      id: 'volter-ability-4',
      name: 'Static Pounce',
      description: 'Leap forward in a crackle of stored charge',
      element: 'Lightning',
      tier: 1,
      cooldown: 2,
      manaCost: 25,
      damage: 50,
      visualEffect: 'static-pounce',
      animation: 'pounce-leap',
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

// ============ NEW CHARACTER POWER MATRICES ============

export const BORYN_POWER_MATRIX: PowerMatrix = {
  characterId: 'boryn',
  abilities: [
    { id: 'boryn-ability-1', name: 'Shield Bash', description: 'Offensive defense technique using shield', element: 'Physical', tier: 1, cooldown: 3, manaCost: 25, damage: 40, visualEffect: 'shield-impact', animation: 'bash-strike' },
    { id: 'boryn-ability-2', name: 'Fortified Stance', description: 'Brace for incoming damage', element: 'Physical', tier: 1, cooldown: 4, manaCost: 30, damage: 0, visualEffect: 'fortify-glow', animation: 'stance-hold' },
    { id: 'boryn-ability-3', name: 'Guardian Protector', description: 'Redirect enemy attacks to self', element: 'Physical', tier: 2, cooldown: 6, manaCost: 50, damage: 55, visualEffect: 'guard-aura', animation: 'protect-cast' },
    {
      id: 'boryn-ability-4',
      name: 'Bulwark Charge',
      description: 'Charge forward behind the shield and knock enemies back',
      element: 'Physical',
      tier: 2,
      cooldown: 6,
      manaCost: 50,
      damage: 70,
      visualEffect: 'bulwark-charge',
      animation: 'charge-rush',
    },
  ],
  passives: [
    { id: 'boryn-passive-1', name: 'Unwavering Defense', description: 'Reduce all damage by percentage', effect: 'Reduce damage taken by 20%' },
    { id: 'boryn-passive-2', name: 'Paternal Shield', description: 'Protect allies from harm', effect: 'Share 10% of defense with nearby allies' },
  ],
  ultimate: { id: 'boryn-ultimate', name: 'Last Stand', description: 'Become an immovable object absorbing all damage', damage: 0, duration: 8, cooldown: 20, visualEffect: 'immovable-fortress' },
};

export const BORAX_POWER_MATRIX: PowerMatrix = {
  characterId: 'borax',
  abilities: [
    { id: 'borax-ability-1', name: 'Healing Order', description: 'Command allies to restore their vitality', element: 'Magic', tier: 1, cooldown: 4, manaCost: 40, damage: 0, visualEffect: 'heal-pulse', animation: 'order-cast' },
    { id: 'borax-ability-2', name: 'Justice Gaze', description: 'Focus on maintaining balance and order', element: 'Magic', tier: 1, cooldown: 3, manaCost: 35, damage: 45, visualEffect: 'justice-beam', animation: 'gaze-focus' },
    { id: 'borax-ability-3', name: 'Law Enforcement', description: 'Enforce rules of combat through magical power', element: 'Magic', tier: 2, cooldown: 5, manaCost: 55, damage: 65, visualEffect: 'enforce-strike', animation: 'enforce-cast' },
    {
      id: 'borax-ability-4',
      name: 'Verdict Seal',
      description: 'Seal an enemy in a binding sentence that damages over time',
      element: 'Magic',
      tier: 2,
      cooldown: 6,
      manaCost: 55,
      damage: 75,
      visualEffect: 'verdict-seal',
      animation: 'seal-cast',
    },
  ],
  passives: [
    { id: 'borax-passive-1', name: 'Mentor\'s Guidance', description: 'Guide allies to better performance', effect: 'Increase ally damage by 10%' },
    { id: 'borax-passive-2', name: 'Balance Keeper', description: 'Maintain equilibrium in battle', effect: 'Reduce all ability cooldowns by 10%' },
  ],
  ultimate: { id: 'borax-ultimate', name: 'Divine Judgment', description: 'Pass ultimate judgment on all enemies', damage: 210, duration: 7, cooldown: 18, visualEffect: 'judgment-strike' },
};

export const VHARCK_POWER_MATRIX: PowerMatrix = {
  characterId: 'vharck',
  abilities: [
    { id: 'vharck-ability-1', name: 'Prophecy Strike', description: 'Strike with knowledge of the future', element: 'Magic', tier: 1, cooldown: 3, manaCost: 35, damage: 50, visualEffect: 'prophecy-flash', animation: 'fang-strike' },
    { id: 'vharck-ability-2', name: 'Eldritch Wisdom', description: 'Channel ancient magical knowledge', element: 'Magic', tier: 2, cooldown: 5, manaCost: 50, damage: 70, visualEffect: 'elder-glow', animation: 'wisdom-cast' },
    { id: 'vharck-ability-3', name: 'Temporal Teaching', description: 'Share wisdom across time', element: 'Time', tier: 2, cooldown: 6, manaCost: 60, damage: 65, visualEffect: 'temporal-link', animation: 'teach-cast' },
    {
      id: 'vharck-ability-4',
      name: 'Fang Sweep',
      description: 'A wide ancestral strike that clears the space in front',
      element: 'Physical',
      tier: 1,
      cooldown: 3,
      manaCost: 30,
      damage: 45,
      visualEffect: 'fang-sweep',
      animation: 'fang-sweep-swing',
    },
  ],
  passives: [
    { id: 'vharck-passive-1', name: 'Ancient Knowledge', description: 'Wisdom of ages past', effect: 'Increase mana regen by 20%' },
    { id: 'vharck-passive-2', name: 'Prophetic Foresight', description: 'See threats before they arrive', effect: 'Gain 15% dodge chance' },
  ],
  ultimate: { id: 'vharck-ultimate', name: 'Apocalypse Vision', description: 'Show enemies a glimpse of their doom', damage: 240, duration: 8, cooldown: 20, visualEffect: 'vision-collapse' },
};

export const RIKKA_POWER_MATRIX: PowerMatrix = {
  characterId: 'rikka',
  abilities: [
    { id: 'rikka-ability-1', name: 'Spark Sprint', description: 'Move at blazing speed with fire', element: 'Fire', tier: 1, cooldown: 2, manaCost: 25, damage: 45, visualEffect: 'fire-dash', animation: 'sprint-flame' },
    { id: 'rikka-ability-2', name: 'Inferno Burst', description: 'Unleash explosive fire in all directions', element: 'Fire', tier: 2, cooldown: 4, manaCost: 45, damage: 75, visualEffect: 'inferno-explosion', animation: 'burst-cast' },
    { id: 'rikka-ability-3', name: 'Flame Tornado', description: 'Create spinning vortex of flame', element: 'Fire', tier: 2, cooldown: 5, manaCost: 50, damage: 80, visualEffect: 'tornado-flame', animation: 'tornado-spin' },
    {
      id: 'rikka-ability-4',
      name: 'Ember Flick',
      description: 'Flick a small, fast flame at the nearest enemy',
      element: 'Fire',
      tier: 1,
      cooldown: 2,
      manaCost: 20,
      damage: 40,
      visualEffect: 'ember-flick',
      animation: 'flick-throw',
    },
  ],
  passives: [
    { id: 'rikka-passive-1', name: 'Little Spark', description: 'Small but mighty fire core', effect: 'Increase attack speed by 25%' },
    { id: 'rikka-passive-2', name: 'Unstoppable Fire', description: 'Once started, never stops', effect: 'Gain 30% critical strike chance' },
  ],
  ultimate: { id: 'rikka-ultimate', name: 'Supernova', description: 'Release all inner fire in massive explosion', damage: 250, duration: 5, cooldown: 17, visualEffect: 'supernova-blast' },
};

export const MIREK_POWER_MATRIX: PowerMatrix = {
  characterId: 'mirek',
  abilities: [
    { id: 'mirek-ability-1', name: 'Underground Strike', description: 'Strike from the shadows', element: 'Physical', tier: 1, cooldown: 3, manaCost: 30, damage: 60, visualEffect: 'shadow-strike', animation: 'emerge-attack' },
    { id: 'mirek-ability-2', name: 'Scout\'s Path', description: 'Find the safest route through danger', element: 'Physical', tier: 1, cooldown: 3, manaCost: 25, damage: 0, visualEffect: 'scout-glow', animation: 'path-reveal' },
    { id: 'mirek-ability-3', name: 'Tunnel Escape', description: 'Disappear into the earth', element: 'Physical', tier: 2, cooldown: 4, manaCost: 45, damage: 55, visualEffect: 'tunnel-escape', animation: 'disappear-cast' },
    {
      id: 'mirek-ability-4',
      name: 'Burrow Ambush',
      description: 'Vanish underground and strike from below',
      element: 'Physical',
      tier: 2,
      cooldown: 5,
      manaCost: 45,
      damage: 70,
      visualEffect: 'burrow-ambush',
      animation: 'ambush-emerge',
    },
  ],
  passives: [
    { id: 'mirek-passive-1', name: 'Underground Knowledge', description: 'Navigate any terrain', effect: 'Increase dodge by 20%' },
    { id: 'mirek-passive-2', name: 'Scout\'s Precision', description: 'Accurate strikes from any angle', effect: 'Increase critical damage by 40%' },
  ],
  ultimate: { id: 'mirek-ultimate', name: 'Earth Rupture', description: 'Tear the earth apart with underground power', damage: 200, duration: 6, cooldown: 16, visualEffect: 'earth-rupture' },
};

export const AURELION_POWER_MATRIX: PowerMatrix = {
  characterId: 'aurelion',
  abilities: [
    { id: 'aurelion-ability-1', name: 'Temporal Slip', description: 'Slip through time briefly', element: 'Time', tier: 1, cooldown: 3, manaCost: 30, damage: 40, visualEffect: 'time-slip', animation: 'flicker-teleport' },
    { id: 'aurelion-ability-2', name: 'Chrono Beam', description: 'Strike with focused temporal energy', element: 'Time', tier: 2, cooldown: 4, manaCost: 45, damage: 65, visualEffect: 'chrono-beam', animation: 'beam-cast' },
    { id: 'aurelion-ability-3', name: 'Future Echo', description: 'Attack with echoes from possible futures', element: 'Time', tier: 2, cooldown: 5, manaCost: 55, damage: 75, visualEffect: 'echo-strike', animation: 'echo-cast' },
    {
      id: 'aurelion-ability-4',
      name: 'Slip Jab',
      description: 'A flickering strike from a half-second ahead of the fight',
      element: 'Time',
      tier: 1,
      cooldown: 2,
      manaCost: 25,
      damage: 35,
      visualEffect: 'slip-jab',
      animation: 'jab-flicker',
    },
  ],
  passives: [
    { id: 'aurelion-passive-1', name: 'Time Survivor', description: 'Endured temporal rifts', effect: 'Increase evasion by 25%' },
    { id: 'aurelion-passive-2', name: 'Slip Energy', description: 'Natural affinity for temporal magic', effect: 'Reduce spell cooldowns by 15%' },
  ],
  ultimate: { id: 'aurelion-ultimate', name: 'Timeline Collapse', description: 'Collapse multiple timelines onto enemies', damage: 230, duration: 7, cooldown: 19, visualEffect: 'timeline-collapse' },
};

export const SELENE_POWER_MATRIX: PowerMatrix = {
  characterId: 'selene',
  abilities: [
    { id: 'selene-ability-1', name: 'Oracle Vision', description: 'See and strike with mystical sight', element: 'Magic', tier: 1, cooldown: 3, manaCost: 35, damage: 45, visualEffect: 'vision-glow', animation: 'sight-cast' },
    { id: 'selene-ability-2', name: 'Mystic Veil', description: 'Obscure with mystical energy', element: 'Magic', tier: 1, cooldown: 4, manaCost: 30, damage: 0, visualEffect: 'veil-shroud', animation: 'veil-cast' },
    { id: 'selene-ability-3', name: 'Destiny Touch', description: 'Influence fate itself', element: 'Magic', tier: 2, cooldown: 5, manaCost: 50, damage: 70, visualEffect: 'destiny-spark', animation: 'touch-cast' },
    {
      id: 'selene-ability-4',
      name: 'Moonthread Lance',
      description: 'Spin a thread of moonlight into a piercing lance',
      element: 'Magic',
      tier: 2,
      cooldown: 5,
      manaCost: 50,
      damage: 75,
      visualEffect: 'moonthread-lance',
      animation: 'lance-cast',
    },
  ],
  passives: [
    { id: 'selene-passive-1', name: 'Oracle\'s Sight', description: 'See beyond the veil', effect: 'Increase damage by 15%' },
    { id: 'selene-passive-2', name: 'Myrr\'kai Blood', description: 'Ancient mystical lineage', effect: 'Increase mana by 20%' },
  ],
  ultimate: { id: 'selene-ultimate', name: 'Fate Reversal', description: 'Reverse the fate of all combatants', damage: 200, duration: 8, cooldown: 18, visualEffect: 'fate-reverse' },
};

export const MIRI_POWER_MATRIX: PowerMatrix = {
  characterId: 'miri',
  abilities: [
    { id: 'miri-ability-1', name: 'Protective Seal', description: 'Seal and protect allies', element: 'Magic', tier: 1, cooldown: 4, manaCost: 35, damage: 0, visualEffect: 'seal-glow', animation: 'seal-cast' },
    { id: 'miri-ability-2', name: 'Identity Guard', description: 'Guard allies\' identities and safety', element: 'Magic', tier: 1, cooldown: 3, manaCost: 30, damage: 40, visualEffect: 'guard-aura', animation: 'guard-cast' },
    { id: 'miri-ability-3', name: 'Consent Boundary', description: 'Create boundaries that cannot be crossed', element: 'Magic', tier: 2, cooldown: 5, manaCost: 50, damage: 60, visualEffect: 'boundary-wall', animation: 'boundary-cast' },
    {
      id: 'miri-ability-4',
      name: 'Name Ward Burst',
      description: 'Release the ward in a ring that repels everything nearby',
      element: 'Magic',
      tier: 2,
      cooldown: 6,
      manaCost: 50,
      damage: 65,
      visualEffect: 'ward-burst',
      animation: 'burst-cast',
    },
  ],
  passives: [
    { id: 'miri-passive-1', name: 'Sealed Name', description: 'Identity is protected', effect: 'Reduce damage taken by 15%' },
    { id: 'miri-passive-2', name: 'Consent Keeper', description: 'Respect others\' boundaries', effect: 'Increase ally defense by 10%' },
  ],
  ultimate: { id: 'miri-ultimate', name: 'Safe Haven', description: 'Create ultimate sanctuary for allies', damage: 0, duration: 10, cooldown: 20, visualEffect: 'sanctuary-create' },
};

export const OLD_MOSS_POWER_MATRIX: PowerMatrix = {
  characterId: 'old-moss',
  abilities: [
    { id: 'old-moss-ability-1', name: 'Root Strike', description: 'Strike with living roots from earth', element: 'Nature', tier: 1, cooldown: 3, manaCost: 30, damage: 50, visualEffect: 'root-strike', animation: 'root-emerge' },
    { id: 'old-moss-ability-2', name: 'Wildland Blessing', description: 'Bless allies with nature\'s power', element: 'Nature', tier: 1, cooldown: 4, manaCost: 35, damage: 0, visualEffect: 'blessing-glow', animation: 'bless-cast' },
    { id: 'old-moss-ability-3', name: 'Moss Swarm', description: 'Summon living moss to attack', element: 'Nature', tier: 2, cooldown: 5, manaCost: 50, damage: 70, visualEffect: 'moss-swarm', animation: 'swarm-cast' },
    {
      id: 'old-moss-ability-4',
      name: 'Rootquake',
      description: 'Slam the ground so roots erupt beneath enemies',
      element: 'Nature',
      tier: 2,
      cooldown: 6,
      manaCost: 55,
      damage: 75,
      visualEffect: 'rootquake',
      animation: 'quake-slam',
    },
  ],
  passives: [
    { id: 'old-moss-passive-1', name: 'Wildland Elder', description: 'Ancient wisdom of nature', effect: 'Increase max health by 20%' },
    { id: 'old-moss-passive-2', name: 'Living Memory', description: 'Connected to all living things', effect: 'Gain 10% lifesteal on all attacks' },
  ],
  ultimate: { id: 'old-moss-ultimate', name: 'Primordial Forest', description: 'Transform battlefield into living forest', damage: 180, duration: 9, cooldown: 20, visualEffect: 'forest-rise' },
};

export const SABLE_NINE_POWER_MATRIX: PowerMatrix = {
  characterId: 'sable-nine',
  abilities: [
    { id: 'sable-nine-ability-1', name: 'Shadow Strike', description: 'Strike from the Erasure-touched shadows', element: 'Erasure', tier: 1, cooldown: 3, manaCost: 30, damage: 65, visualEffect: 'shadow-strike', animation: 'void-strike' },
    { id: 'sable-nine-ability-2', name: 'Prophecy Sight', description: 'See and strike at weak points', element: 'Memory', tier: 1, cooldown: 3, manaCost: 25, damage: 50, visualEffect: 'prophecy-glow', animation: 'sight-strike' },
    { id: 'sable-nine-ability-3', name: 'Rival\'s Edge', description: 'Strike with the power of rivalry', element: 'Physical', tier: 2, cooldown: 4, manaCost: 45, damage: 80, visualEffect: 'rival-clash', animation: 'rivalry-strike' },
    {
      id: 'sable-nine-ability-4',
      name: 'Umbral Rift Step',
      description: 'Slip through a rift and cut down from behind',
      element: 'Erasure',
      tier: 2,
      cooldown: 5,
      manaCost: 50,
      damage: 75,
      visualEffect: 'rift-step',
      animation: 'rift-step-cast',
    },
  ],
  passives: [
    { id: 'sable-nine-passive-1', name: 'Rival Shade', description: 'Embody the spirit of competition', effect: 'Gain 35% critical strike chance' },
    { id: 'sable-nine-passive-2', name: 'Prophecy Connection', description: 'Connected to dangerous visions', effect: 'Increase attack speed by 20%' },
  ],
  ultimate: { id: 'sable-nine-ultimate', name: 'Erasure Prophecy', description: 'Strike with knowledge of doom', damage: 240, duration: 6, cooldown: 17, visualEffect: 'void-prophecy' },
};

// ============ POWER MATRIX REGISTRY ============

export const POWER_MATRICES: Record<string, PowerMatrix> = {
  'kai-jax': KAI_JAX_POWER_MATRIX,
  'jax': JAX_POWER_MATRIX,
  'kaison': KAISON_POWER_MATRIX,
  'silver': SILVER_POWER_MATRIX,
  'volter': VOLTER_POWER_MATRIX,
  'boryn': BORYN_POWER_MATRIX,
  'borax': BORAX_POWER_MATRIX,
  'vharck': VHARCK_POWER_MATRIX,
  'aurelion': AURELION_POWER_MATRIX,
  'selene': SELENE_POWER_MATRIX,
  'miri': MIRI_POWER_MATRIX,
  'old-moss': OLD_MOSS_POWER_MATRIX,
  'rikka': RIKKA_POWER_MATRIX,
  'mirek': MIREK_POWER_MATRIX,
  'sable-nine': SABLE_NINE_POWER_MATRIX,
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
