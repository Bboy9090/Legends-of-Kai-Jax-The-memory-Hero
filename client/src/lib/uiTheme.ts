export interface ColorMeaning {
  color: string;
  hex: string;
  meaning: string;
  sabertoothGod?: string;
  usage: string[];
}

export const COLOR_LANGUAGE: ColorMeaning[] = [
  {
    color: 'Orange',
    hex: '#FF4500',
    meaning: 'Sacrifice / Father',
    sabertoothGod: 'pyraxis',
    usage: ['Health bar near death', 'Boryn memories', 'Tiger aspect abilities', 'Ember-Memory tail']
  },
  {
    color: 'Cyan',
    hex: '#00CED1',
    meaning: 'Law / Sabertooth Lion',
    sabertoothGod: 'thryxen',
    usage: ['Fusion meter start', 'Boryx Zenith abilities', 'Lion aspect attacks', 'Stormmane effects']
  },
  {
    color: 'Gold',
    hex: '#FFD700',
    meaning: 'Fusion / Power',
    sabertoothGod: 'myrr_kai',
    usage: ['Full fusion meter', 'Kaijax abilities', 'Victory states', 'Memory preservation']
  },
  {
    color: 'Purple',
    hex: '#9400D3',
    meaning: 'Memory / Fusion',
    sabertoothGod: 'myrr_kai',
    usage: ['Web-Ink Anchor tail', 'Spider abilities', 'Memory visions', 'Kaison heritage']
  },
  {
    color: 'Electric Yellow',
    hex: '#FFFF00',
    meaning: 'Velocity / Electric',
    sabertoothGod: 'kar_voth',
    usage: ['Electric Velocity tail', 'Jaxon abilities', 'Speed boosts', 'Lightning attacks']
  },
  {
    color: 'Black',
    hex: '#1a1a1a',
    meaning: 'Erasure / Architect',
    usage: ['Architect presence', 'Erasure zones', 'Deletion effects', 'Void enemies']
  },
  {
    color: 'Red',
    hex: '#DC143C',
    meaning: 'Health / Danger',
    sabertoothGod: 'kar_voth',
    usage: ['Health bar', 'Damage taken', 'Critical state', 'Hunger warnings']
  }
];

export interface HUDElement {
  id: string;
  name: string;
  position: 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right';
  description: string;
  colors: string[];
  behavior: string;
}

export const HUD_LAYOUT: HUDElement[] = [
  {
    id: 'health_bar',
    name: 'Health Bar',
    position: 'top-left',
    description: 'Thick, bold bar that shakes on heavy hits. Turns ember-orange near death (Tiger echo).',
    colors: ['#DC143C', '#FF4500'],
    behavior: 'Shakes on heavy hits, transitions to ember-orange when low'
  },
  {
    id: 'dread_meter',
    name: 'Dread / Pressure Meter',
    position: 'top-right',
    description: 'Pulses when Architect influence rises. Triggers Father Anchor. No numbers, only feeling.',
    colors: ['#1a1a1a', '#9400D3'],
    behavior: 'Pulses with Architect presence, no numeric display'
  },
  {
    id: 'fusion_meter',
    name: 'Resonance / Fusion Meter',
    position: 'bottom-center',
    description: 'Cyan to Gold gradient. Fills only under danger. Locks visually when denied.',
    colors: ['#00CED1', '#FFD700'],
    behavior: 'Gradient fill under danger, visual lock when fusion denied'
  }
];

export const UI_PHILOSOPHY = {
  coreRules: [
    'Readable at a glance',
    'Colorful, not noisy',
    'Disappears during mastery',
    'Reacts to pressure'
  ],
  menuDesign: {
    style: ['Bright', 'Rounded', 'Animated', 'Friendly'],
    progression: 'Colors darken subtly as story progresses. Music slows. UI breathes less. The game grows up with the player.'
  },
  versusUI: {
    style: ['Clean', 'Flat', 'Tournament-ready'],
    philosophy: 'No lore effects. Pure readability.'
  },
  visualIdentity: {
    menus: 'Bright, colorful, kid-friendly',
    combat: 'Heavy, loud, readable',
    lore: 'Stylized, symbolic',
    violence: 'Mythic, not graphic'
  },
  tagline: 'Looks fun. Hits hard.'
};

export const PROGRESSION_SYSTEMS = {
  characterGrowth: {
    name: 'Character Growth',
    philosophy: 'Movement mastery, not stats. New cancels, counters, air control. Skill > numbers.',
    features: ['Movement mastery', 'Cancel windows', 'Counter timing', 'Air control']
  },
  sabertoothOverlay: {
    name: 'Sabertooth Overlay',
    philosophy: 'Passive lineage traits. Activated only under pressure. Never always-on.',
    features: ['Pressure-activated', 'Lineage-specific', 'Situational power']
  },
  memorySystem: {
    name: 'Memory System',
    philosophy: 'Death doesn\'t reset progress. Memories unlock abilities. Failure teaches mechanics.',
    features: ['Persistent progress', 'Failure as teacher', 'Memory-unlocked abilities']
  }
};

export const GAME_THEMES = {
  core: 'Power fades. Memory survives.',
  identity: {
    genre: 'Open-World Action RPG / Fighter',
    tone: 'Mythic + Bronx grit, colorful on the surface, deep underneath',
    audience: 'All-ages readable, grown-up meaning'
  },
  notThisGame: [
    'Not a Smash clone',
    'Not a grimdark revenge tale',
    'Not a power fantasy'
  ],
  thisGame: 'A legacy game. You don\'t win by being strongest. You win by being unforgettable.'
};

export function getColorByMeaning(meaning: string): ColorMeaning | undefined {
  return COLOR_LANGUAGE.find(c => c.meaning.toLowerCase().includes(meaning.toLowerCase()));
}

export function getHUDElementByPosition(position: HUDElement['position']): HUDElement | undefined {
  return HUD_LAYOUT.find(h => h.position === position);
}
