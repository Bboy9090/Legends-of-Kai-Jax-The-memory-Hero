export interface District {
  id: string;
  name: string;
  act: 1 | 2 | 3;
  description: string;
  philosophy: string;
  teaches: string[];
  visualStyle: string;
  controlledBy: 'fang_syndicate' | 'architect' | 'neutral' | 'sabertooth' | 'erasure';
  unlockRequirement?: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  district: string;
  act: 1 | 2 | 3;
  archetype: string;
  tests: string[];
  description: string;
  phases: number;
  purpose: string;
  mechanicTwist?: string;
  sabertoothGod?: 'kar_voth' | 'thryxen' | 'pyraxis' | 'myrr_kai';
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  type: 'story' | 'versus' | 'quick' | 'survival';
  features: string[];
  unlockRequirement?: string;
}

export const DISTRICTS: District[] = [
  {
    id: 'ashblock_heights',
    name: 'Ashblock Heights',
    act: 1,
    description: 'Vertical rooftops and fire escapes. The Fang Syndicate controls these streets.',
    philosophy: 'Movement and survival come before power.',
    teaches: ['Movement discipline', 'Restraint', 'Verticality'],
    visualStyle: 'Urban rooftops, orange streetlights, graffiti walls, fire escapes',
    controlledBy: 'fang_syndicate'
  },
  {
    id: 'sector_7_outskirts',
    name: 'Sector-7 Outskirts',
    act: 1,
    description: 'Collapsed infrastructure where the Architect first tested reality.',
    philosophy: 'Fear must be faced before fusion can ignite.',
    teaches: ['Gravity adaptation', 'Fear management', 'First fusion'],
    visualStyle: 'Crumbling buildings, reality distortions, frozen NPCs',
    controlledBy: 'architect'
  },
  {
    id: 'neon_ward',
    name: 'Neon Ward',
    act: 2,
    description: 'Colorful and bright, but deceptive. Speed-focused enemies dominate.',
    philosophy: 'Timing beats speed. Flashiness loses to precision.',
    teaches: ['Speed control', 'Overconfidence punishment', 'Arena combat'],
    visualStyle: 'Neon signs, bright colors, holographic ads, racing circuits',
    controlledBy: 'neutral',
    unlockRequirement: 'Complete Act I'
  },
  {
    id: 'iron_market',
    name: 'Iron Market',
    act: 2,
    description: 'Black-market augmentations and moral choice quests.',
    philosophy: 'Hunger must be controlled, not indulged.',
    teaches: ['Restraint vs hunger', 'Moral choices', 'Consequence'],
    visualStyle: 'Underground bazaars, neon-lit alleys, shady deals',
    controlledBy: 'neutral',
    unlockRequirement: 'Complete Act I'
  },
  {
    id: 'undercrown',
    name: 'The Undercrown',
    act: 2,
    description: 'Ancient ruins beneath the city where Sabertooth myths are revealed.',
    philosophy: 'Memory is a weapon. The past teaches the present.',
    teaches: ['Memory endurance', 'Pattern recognition', 'Lore discovery'],
    visualStyle: 'Ancient temples, glowing runes, timeline echoes',
    controlledBy: 'sabertooth',
    unlockRequirement: 'Complete Act I'
  },
  {
    id: 'zenith_spires',
    name: 'The Zenith Spires',
    act: 3,
    description: 'Gravity-distorted towers where Architect influence is heaviest.',
    philosophy: 'Law demands perfection. Mastery requires sacrifice.',
    teaches: ['Absolute mastery', 'Perfect execution', 'Lion legacy'],
    visualStyle: 'Impossible architecture, gravity shifts, storm clouds',
    controlledBy: 'architect',
    unlockRequirement: 'Complete Act II'
  },
  {
    id: 'erasure_fields',
    name: 'The Erasure Fields',
    act: 3,
    description: 'Reality deletion zones where NPCs vanish mid-quest.',
    philosophy: 'Only what remembers itself can survive erasure.',
    teaches: ['Survival without certainty', 'Identity preservation'],
    visualStyle: 'White void patches, dissolving reality, static noise',
    controlledBy: 'erasure',
    unlockRequirement: 'Complete Zenith Spires'
  },
  {
    id: 'memory_nexus',
    name: 'The Memory Nexus',
    act: 3,
    description: 'Final open space where all timelines converge.',
    philosophy: 'Legacy defeats control. Memory survives everything.',
    teaches: ['Everything combined', 'Final mastery', 'Architect immunity'],
    visualStyle: 'Converging timelines, echo fragments, cosmic infinity',
    controlledBy: 'sabertooth',
    unlockRequirement: 'Complete Erasure Fields'
  }
];

export const BOSSES: Boss[] = [
  {
    id: 'fang_enforcer',
    name: 'Fang Syndicate Enforcer',
    title: 'The Check',
    district: 'ashblock_heights',
    act: 1,
    archetype: 'Brute punisher',
    tests: ['Movement discipline', 'Restraint'],
    description: 'Punishes button mashing. Breaks walls, controls space. Near-fusion denied. Sabertooth Lion intervenes.',
    phases: 2,
    purpose: 'Teach the player they are not ready.',
    sabertoothGod: 'kar_voth'
  },
  {
    id: 'blood_broker',
    name: 'The Blood Broker',
    title: 'The Deal',
    district: 'iron_market',
    act: 1,
    archetype: 'Dealer of forbidden power',
    tests: ['Hunger vs morality'],
    description: 'Offers shortcuts with consequences. Player can win faster—but weaker long-term. Memory system flags the choice.',
    phases: 3,
    purpose: 'Introduce choice under pressure.',
    sabertoothGod: 'kar_voth'
  },
  {
    id: 'architect_scout',
    name: 'Architect Scout Engine',
    title: 'The Probe',
    district: 'sector_7_outskirts',
    act: 1,
    archetype: 'Reality probe',
    tests: ['Gravity adaptation', 'Fear'],
    description: 'Partial erasure fields. NPCs freeze mid-motion. Fusion first ignites here.',
    phases: 3,
    purpose: 'Reveal the real enemy.',
    mechanicTwist: 'First fusion ignition during battle'
  },
  {
    id: 'neon_prince',
    name: 'The Neon Prince',
    title: 'The Flash',
    district: 'neon_ward',
    act: 2,
    archetype: 'Flashy rival',
    tests: ['Speed control', 'Overconfidence'],
    description: 'Faster than Kaijax early. Punishes reckless aggression. Teaches timing beats speed.',
    phases: 3,
    purpose: 'Teach that timing beats speed.'
  },
  {
    id: 'undercrown_sentinel',
    name: 'The Undercrown Sentinel',
    title: 'The Ancient',
    district: 'undercrown',
    act: 2,
    archetype: 'Ancient guardian',
    tests: ['Memory endurance'],
    description: 'Phases between timelines. Attacks repeat with variation. Player must remember patterns.',
    phases: 4,
    purpose: 'Memory as a weapon.',
    sabertoothGod: 'myrr_kai'
  },
  {
    id: 'boryx_zenith_boss',
    name: 'Boryx Zenith',
    title: 'Shadow of the Law',
    district: 'zenith_spires',
    act: 2,
    archetype: 'Mentor-as-trial',
    tests: ['Absolute mastery'],
    description: 'Stormmane pressure zone. No healing. No fusion. Perfect play required.',
    phases: 4,
    purpose: 'Prove the player is worthy of legacy.',
    mechanicTwist: 'No healing, no fusion allowed',
    sabertoothGod: 'thryxen'
  },
  {
    id: 'erasure_choir',
    name: 'The Erasure Choir',
    title: 'The Deletion',
    district: 'erasure_fields',
    act: 3,
    archetype: 'Multi-entity deletion engine',
    tests: ['Survival without certainty'],
    description: 'Boss deletes mechanics mid-fight. HUD elements disappear. Kaijax remains functional.',
    phases: 5,
    purpose: 'Show why Kaijax is different.',
    mechanicTwist: 'Mechanics and HUD disappear during fight'
  },
  {
    id: 'hollow_architect',
    name: 'The Hollow Architect',
    title: 'The Overwrite',
    district: 'memory_nexus',
    act: 3,
    archetype: 'God of overwrite',
    tests: ['Everything'],
    description: 'Retroactively removes attacks. Tries to erase Kai & Jax separately. Fails against Memory Fusion.',
    phases: 6,
    purpose: 'Legacy defeats control.',
    mechanicTwist: 'Attempts to separate Kai and Jax',
    sabertoothGod: 'myrr_kai'
  }
];

export const GAME_MODES: GameMode[] = [
  {
    id: 'story_mode',
    name: 'Story Mode',
    description: 'Open world exploration with quests and cinematic boss fights. The canon narrative.',
    type: 'story',
    features: ['Open world', 'Quests', 'Cinematic boss fights', 'Canon narrative', '3 Acts']
  },
  {
    id: 'versus_mode',
    name: 'Versus Mode',
    description: '1v1 local and online battles in clean arenas. Pure skill, no Stormmane interference.',
    type: 'versus',
    features: ['1v1 battles', 'Local & online', 'Clean arenas', 'Pure skill', 'Tournament ready'],
    unlockRequirement: 'Complete Act I Chapter 5'
  },
  {
    id: 'quick_battle',
    name: 'Quick Battle',
    description: 'Instant fights with random modifiers. Great for casual play.',
    type: 'quick',
    features: ['Instant fights', 'Random modifiers', 'Casual play', 'No stakes']
  },
  {
    id: 'survival_gauntlet',
    name: 'Survival / Gauntlet',
    description: 'Endless waves with increasing gravity and Architect corruption. Leaderboards track the best.',
    type: 'survival',
    features: ['Endless waves', 'Increasing gravity', 'Architect corruption', 'Leaderboards'],
    unlockRequirement: 'Complete Act II'
  }
];

export const STORY_ACTS = {
  act1: {
    id: 'act_1',
    name: 'Act I: The Age of Protection',
    description: 'Play as Kai and Jax separately. Raised by Boryn (Sabertooth Tiger). Street-level survival. Ends with Boryn\'s sacrifice.',
    mentor: 'boryn',
    theme: 'protection',
    unlocks: ['Dual-character switching', 'Base Sabertooth traits'],
    color: '#4169E1'
  },
  act2: {
    id: 'act_2',
    name: 'Act II: The Age of Law',
    description: 'Boryx Zenith (Sabertooth Lion) takes over. Brutal, cold training. Fusion denied repeatedly. Truth of the First Sabertooth Gods revealed.',
    mentor: 'boryx_zenith',
    theme: 'law',
    unlocks: ['Controlled Fusion', 'Stormmane pressure zones', 'Survival Mode'],
    color: '#FFD700',
    unlockRequirement: 'Complete Act I'
  },
  act3: {
    id: 'act_3',
    name: 'Act III: The Age of Memory',
    description: 'Architect begins erasing reality. NPCs forget you. Locations disappear. Kaijax becomes the Memory King.',
    mentor: 'kaijax',
    theme: 'memory',
    unlocks: ['Full Fusion mastery', 'Architect immunity', 'Final boss gauntlet'],
    color: '#FF4500',
    unlockRequirement: 'Complete Act II'
  }
};

export function getDistrictsByAct(act: 1 | 2 | 3): District[] {
  return DISTRICTS.filter(d => d.act === act);
}

export function getBossesByAct(act: 1 | 2 | 3): Boss[] {
  return BOSSES.filter(b => b.act === act);
}

export function getBossForDistrict(districtId: string): Boss | undefined {
  return BOSSES.find(b => b.district === districtId);
}
