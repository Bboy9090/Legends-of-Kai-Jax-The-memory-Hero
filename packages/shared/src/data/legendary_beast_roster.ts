/**
 * LEGENDARY BEAST ROSTER - BRONX BORN MYTHICAL REFORGED
 * 
 * Complete roster of legendary hybrid mythical beasts:
 * - All unique beast combinations
 * - Bronx-inspired names
 * - No Super Smash references
 * - Coolest, most wanted hybrids
 * - Underdog thoughts
 */

export interface LegendaryBeast {
  id: string;
  name: string;
  title: string;
  beastHybrid: string; // What animals/creatures fused
  description: string;
  visual: {
    primaryColor: string;
    accentColor: string;
    features: string[]; // Key visual features
    size: 'compact' | 'medium' | 'large' | 'massive';
    build: 'athletic' | 'powerful' | 'agile' | 'balanced' | 'imposing';
  };
  powers: {
    primary: string;
    secondary: string;
    ultimate: string;
  };
  role: 'vanguard' | 'blitzer' | 'tank' | 'mystic' | 'support' | 'wildcard' | 'sniper' | 'controller';
  unlock: {
    book: number;
    chapter: number;
    requirement?: string;
  };
}

/**
 * TRINITY - The Core Fusion
 */
export const TRINITY_BEASTS: LegendaryBeast[] = [
  {
    id: 'kaison',
    name: 'Kaison',
    title: 'The Swift Guardian',
    beastHybrid: 'Saiyan-Kitsune-Lupine (Fox-Wolf Hybrid)',
    description: 'Tactical fox-wolf hybrid with Star-Force web control and two mechanical energy tail-blades',
    visual: {
      primaryColor: '#FF8C00', // Golden-Orange
      accentColor: '#0066FF', // Blue
      features: ['two_mechanical_tails', 'tactical_jacket', 'chase_badge', 'web_equipment', 'fox_snout'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Sky-Anchor Web Control',
      secondary: 'Chase-Badge Sonar Pulse',
      ultimate: 'Star-Force Web Storm',
    },
    role: 'blitzer',
    unlock: { book: 1, chapter: 1 },
  },
  {
    id: 'jaxon',
    name: 'Jaxon',
    title: 'The Unstoppable Force',
    beastHybrid: 'Beastly Hedgehog-Lupine Hybrid',
    description: 'Feral hedgehog-wolf hybrid with long electricity-flowing quills and extreme speed',
    visual: {
      primaryColor: '#0066FF', // Electric Blue
      accentColor: '#00FF00', // Green
      features: ['seven_electric_quills', 'feral_amber_eyes', 'charcoal_fur', 'electric_aura'],
      size: 'medium',
      build: 'athletic',
    },
    powers: {
      primary: 'Flicker-Strike (3f Frame-Perfect)',
      secondary: 'Electric Quill Burst',
      ultimate: 'Panic-Speed Overdrive',
    },
    role: 'blitzer',
    unlock: { book: 1, chapter: 1 },
  },
  {
    id: 'kai-jax',
    name: 'Kai-Jax',
    title: 'The Memory Hero | The Archive King',
    beastHybrid: 'Star-Slime Chimera (Hedgehog-Kitsune-Lupine Fusion)',
    description: 'THE ULTIMATE FUSION - Three-tailed memory guardian with obsidian charcoal fur, internal nebulae, and sage-mode eyes',
    visual: {
      primaryColor: '#1a1a1a', // Obsidian Charcoal
      accentColor: '#88d0ff', // Memory Blue
      features: [
        'three_memory_tails', // Gold/Blue/White
        'sage_mode_eyes', // Neon-gold slit pupils
        'electric_quills', // 24 quills, 300% extended
        'internal_nebulae', // Purple-cyan swirls
        'memory_aura', // Iridescent shifting colors
        'badge_of_sovereignty',
        'high_tech_jacket',
      ],
      size: 'medium',
      build: 'balanced',
    },
    powers: {
      primary: 'Memory Strand Manipulation',
      secondary: 'Temporal Rewind (3 seconds)',
      ultimate: 'Convergence Echo (Replay Last 10 Inputs)',
    },
    role: 'vanguard',
    unlock: { book: 1, chapter: 2, requirement: 'Complete fusion ritual' },
  },
];

/**
 * LEGENDARY BEAST HYBRIDS - Unique Combinations
 */
export const LEGENDARY_BEAST_ROSTER: LegendaryBeast[] = [
  // ============ BIRD-DRAGON HYBRIDS ============
  {
    id: 'zephyr-drake',
    name: 'Zephyr Drake',
    title: 'The Sky Tyrant',
    beastHybrid: 'Thunderbird-Dragon Hybrid',
    description: 'Massive bird-dragon hybrid with feathered wings, dragon scales, and lightning breath',
    visual: {
      primaryColor: '#FFD700', // Gold
      accentColor: '#FF4500', // Orange-Red
      features: ['feathered_dragon_wings', 'scaled_body', 'beak_and_fangs', 'lightning_aura', 'massive_size'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Thunder Dive',
      secondary: 'Dragon Fire Breath',
      ultimate: 'Storm Tyrant Rage',
    },
    role: 'tank',
    unlock: { book: 2, chapter: 5 },
  },
  {
    id: 'aero-serpent',
    name: 'Aero Serpent',
    title: 'The Wind Serpent',
    beastHybrid: 'Eagle-Serpent Hybrid',
    description: 'Eagle head and wings fused with serpent body - aerial predator with constricting coils',
    visual: {
      primaryColor: '#4169E1', // Royal Blue
      accentColor: '#FFD700', // Gold
      features: ['eagle_head', 'serpent_body', 'massive_wings', 'coiling_tail', 'talons'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Aerial Constrict',
      secondary: 'Wind Blade Slash',
      ultimate: 'Sky Serpent Tornado',
    },
    role: 'blitzer',
    unlock: { book: 2, chapter: 3 },
  },

  // ============ BIRD-FROG HYBRIDS ============
  {
    id: 'ripple-wing',
    name: 'Ripple Wing',
    title: 'The Tidal Dancer',
    beastHybrid: 'Heron-Poison Dart Frog Hybrid',
    description: 'Elegant heron with poison dart frog colors - water-walking with toxic strikes',
    visual: {
      primaryColor: '#00CED1', // Turquoise
      accentColor: '#FF1493', // Deep Pink
      features: ['heron_legs', 'frog_colors', 'long_neck', 'toxic_skin', 'water_walking'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Toxic Strike',
      secondary: 'Water Walk',
      ultimate: 'Tidal Poison Storm',
    },
    role: 'sniper',
    unlock: { book: 3, chapter: 2 },
  },
  {
    id: 'croak-hawk',
    name: 'Croak Hawk',
    title: 'The Swamp Predator',
    beastHybrid: 'Hawk-Bullfrog Hybrid',
    description: 'Hawk upper body with bullfrog lower body - aerial strikes with powerful leaps',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#8B4513', // Brown
      features: ['hawk_head', 'frog_body', 'powerful_legs', 'talons', 'camouflage'],
      size: 'medium',
      build: 'powerful',
    },
    powers: {
      primary: 'Leap Strike',
      secondary: 'Camouflage',
      ultimate: 'Swamp Ambush',
    },
    role: 'wildcard',
    unlock: { book: 3, chapter: 4 },
  },

  // ============ REPTILE-WOLF HYBRIDS ============
  {
    id: 'scale-fang',
    name: 'Scale Fang',
    title: 'The Desert Hunter',
    beastHybrid: 'Komodo Dragon-Wolf Hybrid',
    description: 'Wolf body with komodo dragon scales and venomous bite - apex desert predator',
    visual: {
      primaryColor: '#8B4513', // Saddle Brown
      accentColor: '#FF4500', // Orange-Red
      features: ['wolf_body', 'komodo_scales', 'venomous_fangs', 'forked_tongue', 'desert_camouflage'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Venomous Bite',
      secondary: 'Scale Armor',
      ultimate: 'Desert Predator Frenzy',
    },
    role: 'tank',
    unlock: { book: 2, chapter: 6 },
  },
  {
    id: 'serpent-wolf',
    name: 'Serpent Wolf',
    title: 'The Coiling Hunter',
    beastHybrid: 'Snake-Wolf Hybrid',
    description: 'Wolf with serpent lower body - constricting predator with pack tactics',
    visual: {
      primaryColor: '#1A1A1A', // Charcoal
      accentColor: '#FFD700', // Gold
      features: ['wolf_head', 'serpent_body', 'coiling_tail', 'venom_fangs', 'pack_leader'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Constrict Attack',
      secondary: 'Pack Howl',
      ultimate: 'Serpent Pack Swarm',
    },
    role: 'controller',
    unlock: { book: 4, chapter: 3 },
  },

  // ============ SPIDER HYBRIDS ============
  {
    id: 'weave-stalker',
    name: 'Weave Stalker',
    title: 'The Web Master',
    beastHybrid: 'Spider-Wolf Hybrid',
    description: 'Wolf with spider legs and web-spinning - tactical predator with trap mastery',
    visual: {
      primaryColor: '#2F2F2F', // Dark Grey
      accentColor: '#FF1493', // Deep Pink
      features: ['wolf_body', 'spider_legs', 'eight_eyes', 'web_spinner', 'venom_fangs'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Web Trap',
      secondary: 'Venom Strike',
      ultimate: 'Web Domain',
    },
    role: 'controller',
    unlock: { book: 3, chapter: 5 },
  },
  {
    id: 'arachne-king',
    name: 'Arachne King',
    title: 'The Silk Tyrant',
    beastHybrid: 'Spider-Bear Hybrid',
    description: 'Massive bear-spider hybrid - tank with web control and crushing strength',
    visual: {
      primaryColor: '#654321', // Dark Brown
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'spider_legs', 'massive_size', 'web_control', 'crushing_claws'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Crushing Web',
      secondary: 'Bear Claw Strike',
      ultimate: 'Silk Tyrant Rage',
    },
    role: 'tank',
    unlock: { book: 5, chapter: 2 },
  },

  // ============ UNIQUE UNDERDOG HYBRIDS ============
  {
    id: 'manta-ray-wolf',
    name: 'Manta Ray Wolf',
    title: 'The Shadow Glider',
    beastHybrid: 'Manta Ray-Wolf Hybrid',
    description: 'Wolf with manta ray wings - gliding predator with shadow manipulation',
    visual: {
      primaryColor: '#000080', // Navy Blue
      accentColor: '#00CED1', // Turquoise
      features: ['wolf_body', 'manta_wings', 'shadow_aura', 'gliding', 'underwater_breathing'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Shadow Glide',
      secondary: 'Water Burst',
      ultimate: 'Shadow Abyss',
    },
    role: 'mystic',
    unlock: { book: 4, chapter: 1 },
  },
  {
    id: 'octo-tiger',
    name: 'Octo Tiger',
    title: 'The Eight-Armed Hunter',
    beastHybrid: 'Octopus-Tiger Hybrid',
    description: 'Tiger with octopus tentacles - land-sea predator with ink clouds and camouflage',
    visual: {
      primaryColor: '#FF8C00', // Dark Orange
      accentColor: '#000000', // Black
      features: ['tiger_body', 'eight_tentacles', 'ink_clouds', 'camouflage', 'regeneration'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Tentacle Strike',
      secondary: 'Ink Cloud',
      ultimate: 'Eight-Armed Fury',
    },
    role: 'wildcard',
    unlock: { book: 4, chapter: 5 },
  },
  {
    id: 'shark-bear',
    name: 'Shark Bear',
    title: 'The Apex Predator',
    beastHybrid: 'Shark-Bear Hybrid',
    description: 'Bear with shark head and fins - brutal land-sea apex with crushing jaws',
    visual: {
      primaryColor: '#708090', // Slate Grey
      accentColor: '#FF4500', // Orange-Red
      features: ['shark_head', 'bear_body', 'fins', 'crushing_jaws', 'apex_aura'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Crushing Bite',
      secondary: 'Blood Frenzy',
      ultimate: 'Apex Predator Rage',
    },
    role: 'tank',
    unlock: { book: 5, chapter: 4 },
  },
  {
    id: 'mantis-wolf',
    name: 'Mantis Wolf',
    title: 'The Precision Hunter',
    beastHybrid: 'Praying Mantis-Wolf Hybrid',
    description: 'Wolf with mantis scythe-arms - precision predator with lightning-fast strikes',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'mantis_arms', 'scythe_claws', 'compound_eyes', 'precision_strikes'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Scythe Strike',
      secondary: 'Precision Vision',
      ultimate: 'Mantis Fury',
    },
    role: 'sniper',
    unlock: { book: 3, chapter: 6 },
  },
  {
    id: 'scorpion-lion',
    name: 'Scorpion Lion',
    title: 'The Desert King',
    beastHybrid: 'Scorpion-Lion Hybrid',
    description: 'Lion with scorpion tail and pincers - desert king with venomous stinger',
    visual: {
      primaryColor: '#FFD700', // Gold
      accentColor: '#8B4513', // Brown
      features: ['lion_body', 'scorpion_tail', 'pincers', 'venom_stinger', 'desert_king'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Venom Sting',
      secondary: 'Pincer Crush',
      ultimate: 'Desert King Roar',
    },
    role: 'vanguard',
    unlock: { book: 4, chapter: 2 },
  },
  {
    id: 'bat-dragon',
    name: 'Bat Dragon',
    title: 'The Night Tyrant',
    beastHybrid: 'Bat-Dragon Hybrid',
    description: 'Dragon with bat wings and echolocation - night predator with sonic attacks',
    visual: {
      primaryColor: '#1A1A1A', // Charcoal Black
      accentColor: '#FF1493', // Deep Pink
      features: ['dragon_body', 'bat_wings', 'echolocation', 'sonic_attacks', 'night_aura'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Sonic Blast',
      secondary: 'Echo Strike',
      ultimate: 'Night Tyrant Scream',
    },
    role: 'mystic',
    unlock: { book: 5, chapter: 1 },
  },
  {
    id: 'crab-bear',
    name: 'Crab Bear',
    title: 'The Shell Guardian',
    beastHybrid: 'Crab-Bear Hybrid',
    description: 'Bear with crab claws and shell armor - defensive tank with crushing pincers',
    visual: {
      primaryColor: '#DC143C', // Crimson
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'crab_claws', 'shell_armor', 'defensive_stance', 'crushing_power'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Pincer Crush',
      secondary: 'Shell Defense',
      ultimate: 'Guardian Rage',
    },
    role: 'tank',
    unlock: { book: 4, chapter: 6 },
  },
  {
    id: 'jellyfish-wolf',
    name: 'Jellyfish Wolf',
    title: 'The Electric Drifter',
    beastHybrid: 'Jellyfish-Wolf Hybrid',
    description: 'Wolf with jellyfish tentacles and electric sting - floating predator with paralysis',
    visual: {
      primaryColor: '#9370DB', // Medium Purple
      accentColor: '#00FFFF', // Cyan
      features: ['wolf_body', 'jellyfish_tentacles', 'electric_sting', 'floating', 'transparent_parts'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Electric Sting',
      secondary: 'Paralysis Cloud',
      ultimate: 'Electric Drift',
    },
    role: 'mystic',
    unlock: { book: 5, chapter: 3 },
  },
  {
    id: 'eel-tiger',
    name: 'Eel Tiger',
    title: 'The Electric Striker',
    beastHybrid: 'Electric Eel-Tiger Hybrid',
    description: 'Tiger with eel body and electric generation - shocking predator with water control',
    visual: {
      primaryColor: '#FFD700', // Gold
      accentColor: '#00FFFF', // Cyan
      features: ['tiger_head', 'eel_body', 'electric_generation', 'water_control', 'shocking_aura'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Electric Strike',
      secondary: 'Water Burst',
      ultimate: 'Electric Storm',
    },
    role: 'blitzer',
    unlock: { book: 4, chapter: 4 },
  },
  {
    id: 'squid-hawk',
    name: 'Squid Hawk',
    title: 'The Sky Ink',
    beastHybrid: 'Squid-Hawk Hybrid',
    description: 'Hawk with squid tentacles and ink clouds - aerial predator with ink manipulation',
    visual: {
      primaryColor: '#000080', // Navy Blue
      accentColor: '#FF1493', // Deep Pink
      features: ['hawk_body', 'squid_tentacles', 'ink_clouds', 'aerial_combat', 'camouflage'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Ink Strike',
      secondary: 'Tentacle Grab',
      ultimate: 'Sky Ink Storm',
    },
    role: 'wildcard',
    unlock: { book: 5, chapter: 5 },
  },
  {
    id: 'stingray-wolf',
    name: 'Stingray Wolf',
    title: 'The Shadow Swimmer',
    beastHybrid: 'Stingray-Wolf Hybrid',
    description: 'Wolf with stingray wings and venomous tail - gliding predator with shadow control',
    visual: {
      primaryColor: '#2F2F2F', // Dark Grey
      accentColor: '#00CED1', // Turquoise
      features: ['wolf_body', 'stingray_wings', 'venomous_tail', 'gliding', 'shadow_control'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Venom Tail Strike',
      secondary: 'Shadow Glide',
      ultimate: 'Shadow Swimmer',
    },
    role: 'mystic',
    unlock: { book: 6, chapter: 2 },
  },
  {
    id: 'lobster-bear',
    name: 'Lobster Bear',
    title: 'The Crustacean King',
    beastHybrid: 'Lobster-Bear Hybrid',
    description: 'Bear with lobster claws and shell armor - crushing tank with aquatic adaptation',
    visual: {
      primaryColor: '#DC143C', // Crimson
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'lobster_claws', 'shell_armor', 'crushing_power', 'aquatic'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Claw Crush',
      secondary: 'Shell Defense',
      ultimate: 'Crustacean King Rage',
    },
    role: 'tank',
    unlock: { book: 6, chapter: 4 },
  },
  {
    id: 'seahorse-dragon',
    name: 'Seahorse Dragon',
    title: 'The Ocean Serpent',
    beastHybrid: 'Seahorse-Dragon Hybrid',
    description: 'Dragon with seahorse body and water control - elegant aquatic predator',
    visual: {
      primaryColor: '#00CED1', // Turquoise
      accentColor: '#FFD700', // Gold
      features: ['dragon_head', 'seahorse_body', 'water_control', 'elegant_form', 'aquatic'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Water Whip',
      secondary: 'Aquatic Dash',
      ultimate: 'Ocean Serpent Storm',
    },
    role: 'mystic',
    unlock: { book: 6, chapter: 3 },
  },
  {
    id: 'piranha-wolf',
    name: 'Piranha Wolf',
    title: 'The Frenzy Pack',
    beastHybrid: 'Piranha-Wolf Hybrid',
    description: 'Wolf with piranha teeth and pack frenzy - bloodthirsty predator with swarm tactics',
    visual: {
      primaryColor: '#DC143C', // Crimson
      accentColor: '#FF4500', // Orange-Red
      features: ['wolf_body', 'piranha_teeth', 'frenzy_aura', 'pack_tactics', 'bloodthirsty'],
      size: 'medium',
      build: 'powerful',
    },
    powers: {
      primary: 'Frenzy Bite',
      secondary: 'Pack Swarm',
      ultimate: 'Blood Frenzy',
    },
    role: 'blitzer',
    unlock: { book: 5, chapter: 6 },
  },
  {
    id: 'angler-wolf',
    name: 'Angler Wolf',
    title: 'The Lure Hunter',
    beastHybrid: 'Anglerfish-Wolf Hybrid',
    description: 'Wolf with anglerfish lure and bioluminescence - dark predator with light manipulation',
    visual: {
      primaryColor: '#000080', // Navy Blue
      accentColor: '#00FFFF', // Cyan
      features: ['wolf_body', 'angler_lure', 'bioluminescence', 'dark_aura', 'light_control'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Lure Strike',
      secondary: 'Bioluminescent Burst',
      ultimate: 'Dark Light Domain',
    },
    role: 'mystic',
    unlock: { book: 6, chapter: 5 },
  },
  {
    id: 'barracuda-tiger',
    name: 'Barracuda Tiger',
    title: 'The Speed Demon',
    beastHybrid: 'Barracuda-Tiger Hybrid',
    description: 'Tiger with barracuda speed and razor teeth - ultra-fast aquatic predator',
    visual: {
      primaryColor: '#4169E1', // Royal Blue
      accentColor: '#FFD700', // Gold
      features: ['tiger_body', 'barracuda_speed', 'razor_teeth', 'streamlined', 'aquatic'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Speed Strike',
      secondary: 'Razor Bite',
      ultimate: 'Speed Demon Rush',
    },
    role: 'blitzer',
    unlock: { book: 6, chapter: 1 },
  },
  {
    id: 'hammerhead-bear',
    name: 'Hammerhead Bear',
    title: 'The Crushing Force',
    beastHybrid: 'Hammerhead Shark-Bear Hybrid',
    description: 'Bear with hammerhead head and crushing power - unique predator with enhanced senses',
    visual: {
      primaryColor: '#708090', // Slate Grey
      accentColor: '#FF4500', // Orange-Red
      features: ['hammerhead_head', 'bear_body', 'crushing_jaws', 'enhanced_senses', 'apex'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Hammer Crush',
      secondary: 'Sense Pulse',
      ultimate: 'Crushing Force Rage',
    },
    role: 'tank',
    unlock: { book: 7, chapter: 2 },
  },
  {
    id: 'whale-bear',
    name: 'Whale Bear',
    title: 'The Leviathan',
    beastHybrid: 'Whale-Bear Hybrid',
    description: 'Massive bear-whale hybrid - largest predator with crushing power and water control',
    visual: {
      primaryColor: '#4169E1', // Royal Blue
      accentColor: '#FFFFFF', // White
      features: ['whale_size', 'bear_body', 'massive_scale', 'water_control', 'leviathan'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Crushing Blow',
      secondary: 'Water Blast',
      ultimate: 'Leviathan Rage',
    },
    role: 'tank',
    unlock: { book: 7, chapter: 4 },
  },
  {
    id: 'dolphin-wolf',
    name: 'Dolphin Wolf',
    title: 'The Intelligent Hunter',
    beastHybrid: 'Dolphin-Wolf Hybrid',
    description: 'Wolf with dolphin intelligence and echolocation - smart predator with pack tactics',
    visual: {
      primaryColor: '#00CED1', // Turquoise
      accentColor: '#FFFFFF', // White
      features: ['wolf_body', 'dolphin_intelligence', 'echolocation', 'pack_tactics', 'smart'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Echo Strike',
      secondary: 'Pack Coordination',
      ultimate: 'Intelligent Swarm',
    },
    role: 'controller',
    unlock: { book: 6, chapter: 6 },
  },
  {
    id: 'orca-bear',
    name: 'Orca Bear',
    title: 'The Apex Killer',
    beastHybrid: 'Orca-Bear Hybrid',
    description: 'Bear with orca power and pack hunting - apex predator with coordinated attacks',
    visual: {
      primaryColor: '#000000', // Black
      accentColor: '#FFFFFF', // White
      features: ['bear_body', 'orca_power', 'pack_hunting', 'apex_aura', 'coordinated'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Pack Strike',
      secondary: 'Orca Blast',
      ultimate: 'Apex Killer Frenzy',
    },
    role: 'tank',
    unlock: { book: 7, chapter: 3 },
  },
  {
    id: 'narwhal-wolf',
    name: 'Narwhal Wolf',
    title: 'The Arctic Spear',
    beastHybrid: 'Narwhal-Wolf Hybrid',
    description: 'Wolf with narwhal tusk and arctic adaptation - ice predator with piercing attacks',
    visual: {
      primaryColor: '#FFFFFF', // White
      accentColor: '#00CED1', // Turquoise
      features: ['wolf_body', 'narwhal_tusk', 'arctic_adaptation', 'ice_control', 'piercing'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Tusk Pierce',
      secondary: 'Ice Blast',
      ultimate: 'Arctic Spear Storm',
    },
    role: 'sniper',
    unlock: { book: 7, chapter: 1 },
  },
  {
    id: 'seal-bear',
    name: 'Seal Bear',
    title: 'The Aquatic Guardian',
    beastHybrid: 'Seal-Bear Hybrid',
    description: 'Bear with seal agility and aquatic adaptation - balanced land-sea predator',
    visual: {
      primaryColor: '#708090', // Slate Grey
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'seal_agility', 'aquatic_adaptation', 'balanced', 'guardian'],
      size: 'large',
      build: 'balanced',
    },
    powers: {
      primary: 'Aquatic Strike',
      secondary: 'Seal Dash',
      ultimate: 'Guardian Rage',
    },
    role: 'vanguard',
    unlock: { book: 6, chapter: 7 },
  },
  {
    id: 'walrus-bear',
    name: 'Walrus Bear',
    title: 'The Tusk Guardian',
    beastHybrid: 'Walrus-Bear Hybrid',
    description: 'Bear with walrus tusks and blubber armor - defensive tank with crushing tusks',
    visual: {
      primaryColor: '#C0C0C0', // Silver
      accentColor: '#8B4513', // Brown
      features: ['bear_body', 'walrus_tusks', 'blubber_armor', 'defensive', 'crushing'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Tusk Crush',
      secondary: 'Blubber Defense',
      ultimate: 'Tusk Guardian Rage',
    },
    role: 'tank',
    unlock: { book: 7, chapter: 5 },
  },
  {
    id: 'turtle-bear',
    name: 'Turtle Bear',
    title: 'The Shell Fortress',
    beastHybrid: 'Turtle-Bear Hybrid',
    description: 'Bear with turtle shell and defensive stance - ultimate tank with retractable defense',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#8B4513', // Brown
      features: ['bear_body', 'turtle_shell', 'retractable_defense', 'fortress_mode', 'tank'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Shell Defense',
      secondary: 'Retract Strike',
      ultimate: 'Fortress Mode',
    },
    role: 'tank',
    unlock: { book: 7, chapter: 6 },
  },
  {
    id: 'alligator-wolf',
    name: 'Alligator Wolf',
    title: 'The Swamp Tyrant',
    beastHybrid: 'Alligator-Wolf Hybrid',
    description: 'Wolf with alligator jaws and scales - swamp predator with death roll',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#8B4513', // Brown
      features: ['wolf_body', 'alligator_jaws', 'scales', 'death_roll', 'swamp'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Death Roll',
      secondary: 'Jaw Crush',
      ultimate: 'Swamp Tyrant Rage',
    },
    role: 'vanguard',
    unlock: { book: 5, chapter: 7 },
  },
  {
    id: 'crocodile-bear',
    name: 'Crocodile Bear',
    title: 'The River King',
    beastHybrid: 'Crocodile-Bear Hybrid',
    description: 'Bear with crocodile scales and ambush tactics - river predator with crushing jaws',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'crocodile_scales', 'ambush_tactics', 'crushing_jaws', 'river'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Ambush Strike',
      secondary: 'Jaw Crush',
      ultimate: 'River King Rage',
    },
    role: 'tank',
    unlock: { book: 6, chapter: 8 },
  },
  {
    id: 'gecko-wolf',
    name: 'Gecko Wolf',
    title: 'The Wall Crawler',
    beastHybrid: 'Gecko-Wolf Hybrid',
    description: 'Wolf with gecko climbing ability and regeneration - agile predator with wall-running',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'gecko_feet', 'wall_climbing', 'regeneration', 'agile'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Wall Strike',
      secondary: 'Regeneration',
      ultimate: 'Wall Crawler Fury',
    },
    role: 'blitzer',
    unlock: { book: 4, chapter: 7 },
  },
  {
    id: 'chameleon-wolf',
    name: 'Chameleon Wolf',
    title: 'The Color Shifter',
    beastHybrid: 'Chameleon-Wolf Hybrid',
    description: 'Wolf with chameleon camouflage and color shifting - stealth predator',
    visual: {
      primaryColor: '#228B22', // Forest Green (shifts)
      accentColor: '#FF1493', // Deep Pink (shifts)
      features: ['wolf_body', 'chameleon_camouflage', 'color_shifting', 'stealth', 'tongue_strike'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Tongue Strike',
      secondary: 'Perfect Camouflage',
      ultimate: 'Color Shift Storm',
    },
    role: 'sniper',
    unlock: { book: 5, chapter: 8 },
  },
  {
    id: 'iguana-bear',
    name: 'Iguana Bear',
    title: 'The Scale Guardian',
    beastHybrid: 'Iguana-Bear Hybrid',
    description: 'Bear with iguana scales and tail whip - defensive predator with tail attacks',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'iguana_scales', 'tail_whip', 'defensive', 'guardian'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Tail Whip',
      secondary: 'Scale Defense',
      ultimate: 'Scale Guardian Rage',
    },
    role: 'tank',
    unlock: { book: 6, chapter: 9 },
  },
  {
    id: 'monitor-wolf',
    name: 'Monitor Wolf',
    title: 'The Lizard Hunter',
    beastHybrid: 'Monitor Lizard-Wolf Hybrid',
    description: 'Wolf with monitor lizard intelligence and venom - smart predator with tracking',
    visual: {
      primaryColor: '#8B4513', // Brown
      accentColor: '#FF4500', // Orange-Red
      features: ['wolf_body', 'monitor_intelligence', 'venom', 'tracking', 'smart'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Venom Strike',
      secondary: 'Track Prey',
      ultimate: 'Lizard Hunter Frenzy',
    },
    role: 'controller',
    unlock: { book: 7, chapter: 7 },
  },
  {
    id: 'beetle-bear',
    name: 'Beetle Bear',
    title: 'The Carapace King',
    beastHybrid: 'Rhinoceros Beetle-Bear Hybrid',
    description: 'Bear with beetle carapace and horn - defensive tank with charging attacks',
    visual: {
      primaryColor: '#654321', // Dark Brown
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'beetle_carapace', 'horn', 'charging', 'defensive'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Charge Attack',
      secondary: 'Carapace Defense',
      ultimate: 'Carapace King Charge',
    },
    role: 'tank',
    unlock: { book: 8, chapter: 2 },
  },
  {
    id: 'ant-lion',
    name: 'Ant Lion',
    title: 'The Sand Trap',
    beastHybrid: 'Ant Lion-Lion Hybrid',
    description: 'Lion with ant lion trap-making - desert predator with sand control',
    visual: {
      primaryColor: '#D2691E', // Chocolate
      accentColor: '#FFD700', // Gold
      features: ['lion_body', 'ant_lion_traps', 'sand_control', 'desert', 'trap_master'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Sand Trap',
      secondary: 'Lion Roar',
      ultimate: 'Sand Trap Domain',
    },
    role: 'controller',
    unlock: { book: 8, chapter: 3 },
  },
  {
    id: 'wasp-wolf',
    name: 'Wasp Wolf',
    title: 'The Sting Pack',
    beastHybrid: 'Wasp-Wolf Hybrid',
    description: 'Wolf with wasp wings and stinger - aerial predator with venom and swarm',
    visual: {
      primaryColor: '#FFD700', // Gold
      accentColor: '#000000', // Black
      features: ['wolf_body', 'wasp_wings', 'stinger', 'venom', 'swarm'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Sting Attack',
      secondary: 'Swarm',
      ultimate: 'Sting Pack Swarm',
    },
    role: 'blitzer',
    unlock: { book: 7, chapter: 8 },
  },
  {
    id: 'hornet-bear',
    name: 'Hornet Bear',
    title: 'The Fury Swarm',
    beastHybrid: 'Hornet-Bear Hybrid',
    description: 'Bear with hornet aggression and swarm - aggressive tank with venom',
    visual: {
      primaryColor: '#FFD700', // Gold
      accentColor: '#000000', // Black
      features: ['bear_body', 'hornet_aggression', 'swarm', 'venom', 'fury'],
      size: 'large',
      build: 'powerful',
    },
    powers: {
      primary: 'Fury Strike',
      secondary: 'Swarm Attack',
      ultimate: 'Fury Swarm Rage',
    },
    role: 'tank',
    unlock: { book: 8, chapter: 4 },
  },
  {
    id: 'centipede-wolf',
    name: 'Centipede Wolf',
    title: 'The Many-Legged',
    beastHybrid: 'Centipede-Wolf Hybrid',
    description: 'Wolf with centipede legs and segments - fast predator with many attacks',
    visual: {
      primaryColor: '#8B4513', // Brown
      accentColor: '#FF4500', // Orange-Red
      features: ['wolf_body', 'centipede_legs', 'segments', 'many_attacks', 'fast'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Multi-Strike',
      secondary: 'Leg Swarm',
      ultimate: 'Many-Legged Fury',
    },
    role: 'blitzer',
    unlock: { book: 8, chapter: 5 },
  },
  {
    id: 'millipede-bear',
    name: 'Millipede Bear',
    title: 'The Armored Crawler',
    beastHybrid: 'Millipede-Bear Hybrid',
    description: 'Bear with millipede armor and many legs - defensive tank with rolling',
    visual: {
      primaryColor: '#654321', // Dark Brown
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'millipede_armor', 'many_legs', 'rolling', 'defensive'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Rolling Crush',
      secondary: 'Armor Defense',
      ultimate: 'Armored Crawler Rage',
    },
    role: 'tank',
    unlock: { book: 8, chapter: 6 },
  },
  {
    id: 'cricket-wolf',
    name: 'Cricket Wolf',
    title: 'The Leaping Hunter',
    beastHybrid: 'Cricket-Wolf Hybrid',
    description: 'Wolf with cricket jumping and sound - agile predator with sonic attacks',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'cricket_jumping', 'sonic_attacks', 'leaping', 'agile'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Leap Strike',
      secondary: 'Sonic Blast',
      ultimate: 'Leaping Hunter Fury',
    },
    role: 'blitzer',
    unlock: { book: 7, chapter: 9 },
  },
  {
    id: 'grasshopper-tiger',
    name: 'Grasshopper Tiger',
    title: 'The Spring Predator',
    beastHybrid: 'Grasshopper-Tiger Hybrid',
    description: 'Tiger with grasshopper legs and jumping - extreme mobility predator',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['tiger_body', 'grasshopper_legs', 'extreme_jumping', 'mobility', 'spring'],
      size: 'large',
      build: 'agile',
    },
    powers: {
      primary: 'Spring Strike',
      secondary: 'Extreme Jump',
      ultimate: 'Spring Predator Rush',
    },
    role: 'blitzer',
    unlock: { book: 8, chapter: 7 },
  },
  {
    id: 'dragonfly-wolf',
    name: 'Dragonfly Wolf',
    title: 'The Aerial Ace',
    beastHybrid: 'Dragonfly-Wolf Hybrid',
    description: 'Wolf with dragonfly wings and compound eyes - aerial predator with precision',
    visual: {
      primaryColor: '#00CED1', // Turquoise
      accentColor: '#FF1493', // Deep Pink
      features: ['wolf_body', 'dragonfly_wings', 'compound_eyes', 'aerial', 'precision'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Aerial Strike',
      secondary: 'Precision Vision',
      ultimate: 'Aerial Ace Storm',
    },
    role: 'sniper',
    unlock: { book: 8, chapter: 8 },
  },
  {
    id: 'butterfly-wolf',
    name: 'Butterfly Wolf',
    title: 'The Color Storm',
    beastHybrid: 'Butterfly-Wolf Hybrid',
    description: 'Wolf with butterfly wings and color manipulation - mystical predator with illusions',
    visual: {
      primaryColor: '#FF1493', // Deep Pink (shifts)
      accentColor: '#00CED1', // Turquoise (shifts)
      features: ['wolf_body', 'butterfly_wings', 'color_manipulation', 'illusions', 'mystical'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Color Strike',
      secondary: 'Illusion',
      ultimate: 'Color Storm',
    },
    role: 'mystic',
    unlock: { book: 9, chapter: 2 },
  },
  {
    id: 'moth-wolf',
    name: 'Moth Wolf',
    title: 'The Night Flutter',
    beastHybrid: 'Moth-Wolf Hybrid',
    description: 'Wolf with moth wings and dust - night predator with confusion attacks',
    visual: {
      primaryColor: '#9370DB', // Medium Purple
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'moth_wings', 'dust_clouds', 'night', 'confusion'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Dust Cloud',
      secondary: 'Night Strike',
      ultimate: 'Night Flutter Storm',
    },
    role: 'mystic',
    unlock: { book: 9, chapter: 3 },
  },
  {
    id: 'beetle-wolf',
    name: 'Beetle Wolf',
    title: 'The Carapace Hunter',
    beastHybrid: 'Beetle-Wolf Hybrid',
    description: 'Wolf with beetle carapace and horns - defensive predator with charging',
    visual: {
      primaryColor: '#654321', // Dark Brown
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'beetle_carapace', 'horns', 'charging', 'defensive'],
      size: 'medium',
      build: 'powerful',
    },
    powers: {
      primary: 'Charge Strike',
      secondary: 'Carapace Defense',
      ultimate: 'Carapace Hunter Charge',
    },
    role: 'vanguard',
    unlock: { book: 8, chapter: 9 },
  },
  {
    id: 'stag-beetle-bear',
    name: 'Stag Beetle Bear',
    title: 'The Antler King',
    beastHybrid: 'Stag Beetle-Bear Hybrid',
    description: 'Bear with stag beetle antlers and crushing mandibles - powerful tank',
    visual: {
      primaryColor: '#654321', // Dark Brown
      accentColor: '#FFD700', // Gold
      features: ['bear_body', 'stag_antlers', 'crushing_mandibles', 'powerful', 'king'],
      size: 'massive',
      build: 'imposing',
    },
    powers: {
      primary: 'Antler Crush',
      secondary: 'Mandible Strike',
      ultimate: 'Antler King Rage',
    },
    role: 'tank',
    unlock: { book: 9, chapter: 4 },
  },
  {
    id: 'firefly-wolf',
    name: 'Firefly Wolf',
    title: 'The Light Dancer',
    beastHybrid: 'Firefly-Wolf Hybrid',
    description: 'Wolf with firefly bioluminescence and light control - mystical predator',
    visual: {
      primaryColor: '#000080', // Navy Blue
      accentColor: '#FFFF00', // Yellow
      features: ['wolf_body', 'firefly_light', 'bioluminescence', 'light_control', 'mystical'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Light Strike',
      secondary: 'Bioluminescent Burst',
      ultimate: 'Light Dancer Storm',
    },
    role: 'mystic',
    unlock: { book: 9, chapter: 5 },
  },
  {
    id: 'cicada-wolf',
    name: 'Cicada Wolf',
    title: 'The Sound Storm',
    beastHybrid: 'Cicada-Wolf Hybrid',
    description: 'Wolf with cicada sound generation and molting - sonic predator with transformation',
    visual: {
      primaryColor: '#228B22', // Forest Green
      accentColor: '#FFD700', // Gold
      features: ['wolf_body', 'cicada_sound', 'molting', 'sonic', 'transformation'],
      size: 'medium',
      build: 'agile',
    },
    powers: {
      primary: 'Sonic Blast',
      secondary: 'Molting Defense',
      ultimate: 'Sound Storm',
    },
    role: 'mystic',
    unlock: { book: 9, chapter: 6 },
  },
];

/**
 * Get all legendary beasts
 */
export function getAllLegendaryBeasts(): LegendaryBeast[] {
  return [...TRINITY_BEASTS, ...LEGENDARY_BEAST_ROSTER];
}

/**
 * Get beast by ID
 */
export function getBeastById(id: string): LegendaryBeast | undefined {
  return getAllLegendaryBeasts().find(beast => beast.id === id);
}

/**
 * Get beasts by role
 */
export function getBeastsByRole(role: LegendaryBeast['role']): LegendaryBeast[] {
  return getAllLegendaryBeasts().filter(beast => beast.role === role);
}
