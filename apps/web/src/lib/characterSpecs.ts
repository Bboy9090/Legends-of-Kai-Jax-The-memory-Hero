// LEGENDS OF KAI-JAX: CHARACTER LORE SPECIFICATIONS
// OFFICIAL PRODUCTION DATA - PROTECTED PROPERTY

export interface CharacterLoreSpec {
  id: string;
  loreTitle: string;
  elementalAffinity: 'Memory' | 'Void' | 'Time' | 'Lightning' | 'Earth' | 'Wind' | 'Fire' | 'Celestial' | 'Iron';
  memoryStrandColor: string;
  originSector: string;
  signatureAbility: string;
  backstory: string;
  visualThemes: string[];
}

export const CHARACTER_SPECS: Record<string, CharacterLoreSpec> = {
  'kai-jax': {
    id: 'kai-jax',
    loreTitle: 'The Memory Hero',
    elementalAffinity: 'Memory',
    memoryStrandColor: '#00f2ff',
    originSector: 'The Weave Core',
    signatureAbility: 'Prismatic Convergence',
    backstory: 'A legendary fusion born from the combined resolve of Jaxon and Kaison. Kai-Jax possesses the ability to manipulate memory strands to rewrite reality.',
    visualThemes: ['Cyan Glow', 'Fusion Shards', 'Prismatic Trails']
  },

  'jaxon': {
    id: 'jaxon',
    loreTitle: 'The Swift Echo',
    elementalAffinity: 'Lightning',
    memoryStrandColor: '#a855f7',
    originSector: 'Voltage District',
    signatureAbility: 'Electric Dash',
    backstory: 'A high-speed survivor of the first Rift tear. Jaxon uses his lightning-quick reflexes to outrun the Void.',
    visualThemes: ['Electric Purple', 'Shadow Quills', 'Blur Effects']
  },

  'kaison': {
    id: 'kaison',
    loreTitle: 'The Strategic Blade',
    elementalAffinity: 'Wind',
    memoryStrandColor: '#22d3ee',
    originSector: 'Sage Heights',
    signatureAbility: 'Tactical Gale',
    backstory: 'The calmer, more calculated brother. Kaison focuses on defensive maneuvers and precise strikes.',
    visualThemes: ['Sage Green', 'Wind Flow', 'Precise Lines']
  },

  'silver': {
    id: 'silver',
    loreTitle: 'The Time Sage',
    elementalAffinity: 'Time',
    memoryStrandColor: '#c0c0c0',
    originSector: 'Chronos Spire',
    signatureAbility: 'Temporal Anchor',
    backstory: 'A traveler from a timeline consumed by the Void. He seeks to stabilize the Weave before it is too late.',
    visualThemes: ['Platinum', 'Clockwork Gears', 'Silver Mist']
  },

  'volter': {
    id: 'volter',
    loreTitle: 'The Lightning Beast',
    elementalAffinity: 'Lightning',
    memoryStrandColor: '#ffff00',
    originSector: 'Thunder Valley',
    signatureAbility: 'Static Burst',
    backstory: 'A wild beast infused with pure electrical energy from a ruptured memory shard.',
    visualThemes: ['Golden Yellow', 'Lightning Bolts', 'Static Spark']
  },

  'korg': {
    id: 'korg',
    loreTitle: 'The Stone Warden',
    elementalAffinity: 'Earth',
    memoryStrandColor: '#8B4513',
    originSector: 'Granite Peaks',
    signatureAbility: 'Earthshaker',
    backstory: 'An ancient guardian of the earth memory nodes, awakened by the Rift invasion.',
    visualThemes: ['Earth Brown', 'Stone Cracks', 'Heavy Impacts']
  },

  'lunara': {
    id: 'lunara',
    loreTitle: 'The Moon Goddess',
    elementalAffinity: 'Celestial',
    memoryStrandColor: '#191970',
    originSector: 'Lunar Sanctuary',
    signatureAbility: 'Lunar Eclipse',
    backstory: 'A celestial being who oversees the flow of time and memory across the stars.',
    visualThemes: ['Deep Sapphire', 'Moonlight', 'Star Particles']
  },

  'puff': {
    id: 'puff',
    loreTitle: 'The Void Wisp',
    elementalAffinity: 'Void',
    memoryStrandColor: '#d74894',
    originSector: 'Ethereal Abyss',
    signatureAbility: 'Void Inhale',
    backstory: 'A mysterious entity from the Rift that mimics the abilities of those it encounters.',
    visualThemes: ['Magenta', 'Void Mist', 'Ethereal Glow']
  },

  'borgos': {
    id: 'borgos',
    loreTitle: 'The Iron Tyrant',
    elementalAffinity: 'Iron',
    memoryStrandColor: '#228b22',
    originSector: 'Rust Citadel',
    signatureAbility: 'Iron Shell',
    backstory: 'A warlord who seeks to harness the Void to build an empire of eternal steel.',
    visualThemes: ['Forest Green', 'Rusty Metal', 'Spiked Armor']
  }
};
