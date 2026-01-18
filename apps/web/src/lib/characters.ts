/**
 * ⚡ LEGENDARY CHARACTER ROSTER ⚡
 * Ultimate God-Tier Fighter Database for Legends of Kai-Jax
 * 
 * Each fighter now includes:
 * - Transformation tiers (Base → God Form)
 * - Ultimate abilities
 * - Stat multipliers per tier
 * - Signature moves
 */

export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  description: string;
  category: 'heroes' | 'speedsters' | 'warriors' | 'legends';
  unlocked: boolean;
  unlockRequirement?: number;
  // NEW: Legendary Stats
  baseStats: {
    power: number;
    speed: number;
    defense: number;
    gravity: number;
  };
  // NEW: Signature Abilities
  abilities: {
    basic: string[];
    awakened?: string[];
    sage?: string[];
    legendary?: string[];
    god?: string[];
  };
  // NEW: Ultimate Move
  ultimateMove: {
    name: string;
    description: string;
    damage: number;
    resonanceRequired: number;
  };
  // NEW: Voice Lines
  voiceLines?: {
    intro?: string;
    victory?: string;
    defeat?: string;
    transformation?: string[];
    ultimate?: string;
  };
}

export const FIGHTERS: Fighter[] = [
  // ═══════════════════════════════════════════════════════════════════
  // GENESIS ROSTER - THE ORIGINAL BEAST LEGENDS
  // ═══════════════════════════════════════════════════════════════════
  
  // JAXON - The Velocity Fracture (SOLO PLAYABLE - Pre-Fusion)
  {
    id: 'jaxon',
    name: 'JAXON',
    displayName: 'JAXON, The Velocity Fracture',
    color: '#333333',
    accentColor: '#00CED1',
    description: 'Young beastly hedgehog with long electricity-flowing quills. Very feral but calculated, smart, witty. The speed demon of the Covenant.',
    category: 'speedsters',
    unlocked: true,
    baseStats: { power: 85, speed: 100, defense: 70, gravity: 9.8 },
    abilities: {
      basic: ['Flicker-Strike', 'Panic-Speed', 'Quill-Burst'],
      awakened: ['Lightning-Dash', 'Static-Field', 'Velocity-Echo'],
      sage: ['Thunder-Cloak', 'Quill-Storm', 'Sonic-Break'],
      god: ['INFINITE-VELOCITY', 'Thunder-Annihilation', 'Speed-Force-Overdrive'],
    },
    ultimateMove: {
      name: 'THUNDER GOD BARRAGE',
      description: 'Unleashes a devastating storm of electric quills at supersonic speed',
      damage: 85,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'Try to keep up... if you can!',
      victory: 'Too slow. Way too slow.',
      transformation: ['My power... AWAKENS!', 'Feel the thunder!', 'WITNESS TRUE SPEED!'],
      ultimate: 'THUNDER... GOD... BARRAGE!',
    },
  },
  
  // KAISON - The Star-Force Kitsune (SOLO PLAYABLE - Pre-Fusion)
  {
    id: 'kaison',
    name: 'KAISON',
    displayName: 'KAISON, The Star-Force Kitsune',
    color: '#444444',
    accentColor: '#FFD700',
    description: 'Young fox/tails/wolf with Spider-Man mobility and web control. Chase Badge sonar system. The tactical genius of the Covenant.',
    category: 'warriors',
    unlocked: true,
    baseStats: { power: 90, speed: 85, defense: 85, gravity: 9.8 },
    abilities: {
      basic: ['Web-Control', 'Sky-Anchor', 'Chase-Badge-Pulse'],
      awakened: ['Star-Burst', 'Tail-Blade', 'Web-Matrix'],
      sage: ['Nine-Tail-Sage', 'Celestial-Web', 'Star-Force-Shield'],
      god: ['COSMIC-JUDGEMENT', 'Star-Nova', 'Divine-Protection'],
    },
    ultimateMove: {
      name: 'CELESTIAL GUARDIAN STRIKE',
      description: 'Channels the power of nine tails into a devastating cosmic attack',
      damage: 90,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'The stars have chosen their champion.',
      victory: 'The Covenant is fulfilled.',
      transformation: ['The stars guide my path!', 'Nine tails... AWAKEN!', 'CELESTIAL POWER UNLEASHED!'],
      ultimate: 'CELESTIAL... GUARDIAN... STRIKE!',
    },
  },
  
  // KAI-JAX - The Memory Hero / Archive King (FUSED FORM)
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    displayName: 'KAI-JAX, The Memory Hero',
    color: '#1A1A2E',
    accentColor: '#FFD700',
    description: 'The Archive King! Star-Slime Chimera with 3 Memory Strand Tails. Long electric quills, Sage-Mode eyes. THE ULTIMATE FUSION.',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 50,
    baseStats: { power: 100, speed: 95, defense: 95, gravity: 18.0 },
    abilities: {
      basic: ['Velocity-Echo', 'Memory-Flash', 'Tri-Tail-Strike'],
      awakened: ['Phantom-Strike', 'Ink-Shield', 'Quill-Storm'],
      sage: ['Archive-Recall', 'Memory-Sync', 'Father-Anchor'],
      legendary: ['Nebula-Burst', 'Velocity-Overdrive', 'Memory-Supernova'],
      god: ['GODS-WILL-TREMBLE', 'Infinite-Velocity', 'Cosmic-Archive', 'Ultimate-Fusion'],
    },
    ultimateMove: {
      name: 'GODS WILL TREMBLE',
      description: 'The ultimate technique - channels all three Memory Strands into a reality-breaking attack',
      damage: 100,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'The Archive remembers... everything.',
      victory: 'Gods... have trembled.',
      defeat: 'The memory... endures...',
      transformation: [
        'My power... AWAKENS!',
        'The Memory... flows through me.',
        'I AM THE ARCHIVE KING!',
        'GODS... WILL... TREMBLE!',
      ],
      ultimate: 'GODS... WILL... TREMBLE!!!',
    },
  },
  
  // Boryx Zenith - The Guardian King
  {
    id: 'boryx-zenith',
    name: 'Boryx Zenith',
    displayName: 'BORYX ZENITH, The Guardian King',
    color: '#8B4513',
    accentColor: '#CD7F32',
    description: 'The Guardian King! Draconic Ursine with chaos-infused source star! Found Jaxon and Kaison as orphans - their spirit father.',
    category: 'warriors',
    unlocked: true,
    baseStats: { power: 95, speed: 70, defense: 100, gravity: 12.0 },
    abilities: {
      basic: ['Guardian-Stance', 'Dragon-Claw', 'Star-Shield'],
      awakened: ['Chaos-Roar', 'Ursine-Fury', 'Source-Barrier'],
      sage: ['Dragon-Form', 'Chaos-Infusion', 'Guardian-Aura'],
      god: ['ETERNAL-GUARDIAN', 'Chaos-Supernova', 'Spirit-Father-Bond'],
    },
    ultimateMove: {
      name: 'ETERNAL GUARDIAN JUDGMENT',
      description: 'Channels the chaos-infused source star into an unstoppable protective assault',
      damage: 88,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'I will protect what matters.',
      victory: 'The Guardian prevails.',
      transformation: ['The dragon awakens!', 'Chaos... INFUSION!', 'ETERNAL GUARDIAN!'],
      ultimate: 'ETERNAL... GUARDIAN... JUDGMENT!',
    },
  },
  
  // Lunara Solis - The Oracle Sentinel
  {
    id: 'lunara-solis',
    name: 'Lunara Solis',
    displayName: 'LUNARA SOLIS, The Oracle Sentinel',
    color: '#FFD700',
    accentColor: '#C0C0C0',
    description: 'The Oracle Sentinel! 9-tailed Celestial Kitsune with liquid starlight fur! Sees all timelines.',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 1000,
    baseStats: { power: 88, speed: 92, defense: 90, gravity: 10.0 },
    abilities: {
      basic: ['Oracle-Vision', 'Starlight-Slash', 'Moon-Veil'],
      awakened: ['Sun-Flare', 'Lunar-Shield', 'Timeline-Glimpse'],
      sage: ['Celestial-Dance', 'Solar-Eclipse', 'Prophecy-Strike'],
      god: ['ORACLE-REVELATION', 'Cosmic-Foresight', 'Timeline-Collapse'],
    },
    ultimateMove: {
      name: 'ORACLE REVELATION',
      description: 'Reveals and attacks across all possible timelines simultaneously',
      damage: 92,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'I have seen your defeat... in every timeline.',
      victory: 'The prophecy is fulfilled.',
      transformation: ['The stars reveal!', 'Oracle sight... AWAKENS!', 'ALL TIMELINES CONVERGE!'],
      ultimate: 'ORACLE... REVELATION!',
    },
  },
  
  // Umbra-Flux - The Velocity Wraith
  {
    id: 'umbra-flux',
    name: 'Umbra-Flux',
    displayName: 'UMBRA-FLUX, The Velocity Wraith',
    color: '#FFFFFF',
    accentColor: '#00CED1',
    description: 'The Velocity Wraith! Star-Wolf with 5 elemental tails and hypersonic speed! A spectral speedster.',
    category: 'speedsters',
    unlocked: false,
    unlockRequirement: 750,
    baseStats: { power: 80, speed: 100, defense: 75, gravity: 8.0 },
    abilities: {
      basic: ['Wraith-Dash', 'Spectral-Strike', 'Phase-Shift'],
      awakened: ['Elemental-Tail', 'Hypersonic-Burst', 'Ghost-Form'],
      sage: ['Wraith-Storm', 'Dimension-Skip', 'Elemental-Fusion'],
      god: ['PHANTOM-ANNIHILATION', 'Reality-Phase', 'Infinite-Wraith'],
    },
    ultimateMove: {
      name: 'PHANTOM ANNIHILATION',
      description: 'Phases through reality itself to deliver attacks from impossible angles',
      damage: 82,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'You cannot hit what does not exist.',
      victory: 'Like a ghost... I vanish.',
      transformation: ['Phase... shifting!', 'Wraith form... ENGAGED!', 'I AM EVERYWHERE AND NOWHERE!'],
      ultimate: 'PHANTOM... ANNIHILATION!',
    },
  },
  
  // Sentinel Vox - The Chrono-Tactician
  {
    id: 'sentinel-vox',
    name: 'Sentinel Vox',
    displayName: 'SENTINEL VOX, The Chrono-Tactician',
    color: '#708090',
    accentColor: '#FF4500',
    description: 'The Chrono-Tactician! Cybernetic Commander with time-lock abilities! Master of temporal warfare.',
    category: 'warriors',
    unlocked: false,
    unlockRequirement: 1500,
    baseStats: { power: 85, speed: 85, defense: 90, gravity: 10.5 },
    abilities: {
      basic: ['Time-Lock', 'Tactical-Strike', 'Chrono-Shield'],
      awakened: ['Time-Slow', 'Command-Override', 'Tactical-Matrix'],
      sage: ['Temporal-Storm', 'Chrono-Clone', 'Strategy-Perfection'],
      god: ['CHRONO-DOMINION', 'Time-Erasure', 'Infinite-Tactics'],
    },
    ultimateMove: {
      name: 'CHRONO DOMINION',
      description: 'Freezes time itself to deliver an inescapable tactical assault',
      damage: 86,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'Time is my weapon.',
      victory: 'Tactical superiority... confirmed.',
      transformation: ['Time bends to my will!', 'Chrono systems... MAXIMUM!', 'I CONTROL TIME ITSELF!'],
      ultimate: 'CHRONO... DOMINION!',
    },
  },
  
  // Chronos Sere - The Extinction Sovereign
  {
    id: 'chronos-sere',
    name: 'Chronos Sere',
    displayName: 'CHRONOS SERE, The Extinction Sovereign',
    color: '#4B0082',
    accentColor: '#9370DB',
    description: 'The Extinction Sovereign! Time-Wielding Warlord from the Collapse! Seeks to end all timelines.',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 2500,
    baseStats: { power: 98, speed: 88, defense: 92, gravity: 14.0 },
    abilities: {
      basic: ['Extinction-Wave', 'Void-Slash', 'Timeline-Rend'],
      awakened: ['Collapse-Burst', 'Entropy-Field', 'Sovereign-Command'],
      sage: ['Extinction-Protocol', 'Timeline-Sever', 'Void-Consumption'],
      god: ['TOTAL-EXTINCTION', 'Timeline-Annihilation', 'Void-Emperor'],
    },
    ultimateMove: {
      name: 'TOTAL EXTINCTION',
      description: 'Channels the power of the Collapse to erase existence itself',
      damage: 98,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'All timelines... end with me.',
      victory: 'Extinction... is inevitable.',
      transformation: ['The Collapse... BEGINS!', 'Entropy consumes!', 'I AM THE END OF ALL THINGS!'],
      ultimate: 'TOTAL... EXTINCTION!!!',
    },
  },
  
  // Silver - The Time Warden (Eternal Triad)
  {
    id: 'silver',
    name: 'SILVER',
    displayName: 'SILVER, The Time Warden',
    color: '#C0C0C0',
    accentColor: '#00E5FF',
    description: 'The Time Warden! Psychokinetic time-traveler with ESP! Protects the flow of time.',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 3000,
    baseStats: { power: 90, speed: 90, defense: 88, gravity: 9.0 },
    abilities: {
      basic: ['Psycho-Lift', 'Time-Shield', 'ESP-Strike'],
      awakened: ['Telekinetic-Storm', 'Future-Sight', 'Chrono-Barrier'],
      sage: ['Mind-Crush', 'Timeline-Protect', 'Psychic-Overload'],
      god: ['TEMPORAL-WARDEN', 'Psychic-Supernova', 'Time-Absolute'],
    },
    ultimateMove: {
      name: 'TEMPORAL WARDEN JUDGMENT',
      description: 'Uses psychokinetic power to protect time by destroying threats across all timelines',
      damage: 91,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'The timeline will be protected!',
      victory: 'Time... is safe.',
      transformation: ['My psychic power... SURGES!', 'ESP at maximum!', 'I AM THE WARDEN OF TIME!'],
      ultimate: 'TEMPORAL... WARDEN... JUDGMENT!',
    },
  },
  
  // Voidonus Imperion - The Void King (ULTIMATE VILLAIN)
  {
    id: 'voidonus',
    name: 'Voidonus Imperion',
    displayName: 'VOIDONUS IMPERION, The Void King',
    color: '#0A0A0A',
    accentColor: '#8B00FF',
    description: 'The Void King! The End of All Things - ultimate darkness! The final boss of the Covenant.',
    category: 'legends',
    unlocked: false,
    unlockRequirement: 5000,
    baseStats: { power: 100, speed: 95, defense: 100, gravity: 20.0 },
    abilities: {
      basic: ['Void-Slash', 'Dark-Burst', 'Null-Field'],
      awakened: ['Void-Storm', 'Darkness-Consume', 'Null-Shield'],
      sage: ['Void-Form', 'Reality-Rend', 'Dark-Supernova'],
      god: ['VOID-EMPEROR', 'Reality-Erasure', 'Infinite-Darkness', 'THE-END'],
    },
    ultimateMove: {
      name: 'THE END OF ALL THINGS',
      description: 'Channels the infinite void to erase existence from reality',
      damage: 100,
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: 'All... will return... to the void.',
      victory: 'Existence... ends.',
      defeat: 'The void... is eternal...',
      transformation: ['DARKNESS CONSUMES!', 'THE VOID AWAKENS!', 'I AM THE END!', 'ALL WILL BE VOID!'],
      ultimate: 'THE... END... OF... ALL... THINGS!!!',
    },
  },
];

export function getFighterById(id: string): Fighter | undefined {
  return FIGHTERS.find(f => f.id === id);
}

export function getUnlockedFighters(): Fighter[] {
  return FIGHTERS.filter(f => f.unlocked);
}

export function getFightersByCategory(category: Fighter['category']): Fighter[] {
  return FIGHTERS.filter(f => f.category === category);
}

export function canUnlockFighter(fighter: Fighter, score: number): boolean {
  if (fighter.unlocked) return false;
  if (!fighter.unlockRequirement) return true;
  return score >= fighter.unlockRequirement;
}
