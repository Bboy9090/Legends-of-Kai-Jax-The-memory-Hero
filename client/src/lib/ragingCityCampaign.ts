// LEGENDS OF KAI-JAX: THE MEMORY HERO OF RAGING CITY
// Campaign Structure: Prologue + 8 Chapters + Finale

export type ChapterNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type PillarType = 'hunger' | 'law' | 'sacrifice' | 'memory';

export interface MemoryFragment {
  id: string;
  name: string;
  description: string;
  pillar: PillarType;
  reward: {
    type: 'movement' | 'combat' | 'crafting' | 'permission' | 'truth';
    name: string;
    description: string;
  };
  collected: boolean;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  isDiscovered: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  species: string;
  role: 'fodder' | 'elite' | 'hunter' | 'roaming_elite';
  description: string;
  attacks: string[];
  weakness: string;
}

export interface Sovereign {
  id: string;
  name: string;
  title: string;
  pillar: PillarType;
  description: string;
  philosophy: string;
  phases: number;
  teachesSkill: string;
  defeated: boolean;
}

export interface Mission {
  id: string;
  chapterId: ChapterNumber;
  name: string;
  description: string;
  pillar: PillarType;
  objectives: string[];
  rewards: {
    xp: number;
    fragments: string[];
    abilities?: string[];
    flags: string[];
  };
  isSovereign: boolean;
  completed: boolean;
}

export interface Chapter {
  number: ChapterNumber;
  publicName: string;
  districtName: string;
  trialName: string;
  pillar: PillarType;
  description: string;
  visual: string;
  hubNode: string;
  landmarks: Landmark[];
  enemies: Enemy[];
  fragments: MemoryFragment[];
  missions: Mission[];
  sovereign: Sovereign | null;
  gateKey: string;
  unlocked: boolean;
  completed: boolean;
  fastTravelNodes: string[];
  devFlags: Record<string, boolean>;
}

// THE FOUR PILLARS - Color and meaning
export const PILLARS: Record<PillarType, { color: string; hex: string; meaning: string; god: string }> = {
  hunger: { color: 'orange', hex: '#ff6600', meaning: 'Chase / Consume / Dominate', god: 'Kar-Voth' },
  law: { color: 'cyan', hex: '#00bfff', meaning: 'Order / Judgment / Code', god: 'Thryxen' },
  sacrifice: { color: 'red', hex: '#ff4444', meaning: 'Trade / Loss / Burden', god: 'Pyraxis' },
  memory: { color: 'purple', hex: '#9966ff', meaning: 'Echo / Reconstruction / Truth', god: "Myrr'Kai" }
};

// PROLOGUE - Home Town
const PROLOGUE: Chapter = {
  number: 0,
  publicName: 'Prologue',
  districtName: 'Home Town',
  trialName: 'The First Fracture',
  pillar: 'memory',
  description: 'Tutorial disguised as story. First threat. First fragment. First vow.',
  visual: 'warm home streets → storm-scarred outskirts → first rift glow',
  hubNode: 'Home Square',
  landmarks: [
    { id: 'boryn_memorial', name: "Boryn's Memorial Steps", description: 'Where the Sabertooth Tiger father made his sacrifice', position: [0, 0, -20], isDiscovered: false },
    { id: 'rail_bridge', name: 'Old Rail Bridge', description: 'Tutorial traversal location', position: [30, 5, 0], isDiscovered: false },
    { id: 'edgefield', name: 'Edgefield', description: 'First wild zone with prowlers', position: [-40, 0, 30], isDiscovered: false }
  ],
  enemies: [
    { id: 'street_thug', name: 'Street Thug', species: 'Various', role: 'fodder', description: 'Basic street fighters', attacks: ['punch', 'kick'], weakness: 'Slow, predictable' },
    { id: 'wild_prowler', name: 'Wild Prowler', species: 'Feral beast', role: 'fodder', description: 'Feral creatures from the outskirts', attacks: ['bite', 'pounce'], weakness: 'Dodge timing' },
    { id: 'rift_wisp', name: 'Rift Wisp', species: 'Anomaly', role: 'elite', description: 'Introduction to Architect influence', attacks: ['phase_strike', 'reality_flicker'], weakness: 'Memory anchors' }
  ],
  fragments: [
    { id: 'frag_p_1', name: 'Echo of Home', pillar: 'memory', description: "First fragment - Boryn's memory", reward: { type: 'truth', name: 'Fragment Slot', description: 'Enables Memory Fragment collection' }, collected: false },
    { id: 'frag_p_2', name: 'Street Instinct', pillar: 'hunger', description: 'Learn to track by scent', reward: { type: 'movement', name: 'Trail Sense', description: 'See faint enemy trails' }, collected: false },
    { id: 'frag_p_3', name: 'First Defense', pillar: 'law', description: 'Basic protection technique', reward: { type: 'combat', name: 'Block Stance', description: 'Hold to reduce damage' }, collected: false }
  ],
  missions: [
    { id: 'p0_1', chapterId: 0, name: 'Wake to the Rift', pillar: 'memory', description: 'Reach Home Square', objectives: ['Reach Home Square', 'Learn basic movement'], rewards: { xp: 50, fragments: [], flags: ['TUTORIAL_MOVEMENT_DONE'] }, isSovereign: false, completed: false },
    { id: 'p0_2', chapterId: 0, name: 'First Contact', pillar: 'hunger', description: 'Defeat prowlers near Edgefield', objectives: ['Defeat 5 prowlers', 'Master dodge timing'], rewards: { xp: 75, fragments: [], abilities: ['dodge'], flags: ['COMBAT_BASIC_DONE'] }, isSovereign: false, completed: false },
    { id: 'p0_3', chapterId: 0, name: "Boryn's Aftermath", pillar: 'sacrifice', description: 'Investigate the memorial', objectives: ['Visit memorial steps', 'Collect Fragment 01'], rewards: { xp: 100, fragments: ['frag_p_1'], flags: ['FRAGMENT_SLOT'] }, isSovereign: false, completed: false },
    { id: 'p0_4', chapterId: 0, name: 'The Map Opens', pillar: 'law', description: 'Accept your first Trial', objectives: ['Speak to mentor NPC', 'Accept first Trial'], rewards: { xp: 75, fragments: [], flags: ['WORLD_MAP_ENABLED'] }, isSovereign: false, completed: false },
    { id: 'p0_5', chapterId: 0, name: 'Rift Surge', pillar: 'memory', description: 'Survive the Rift event', objectives: ['Survive Rift Surge', 'Reach Chapter 1 gate'], rewards: { xp: 150, fragments: [], flags: ['CHAPTER_1_GATE_UNLOCKED'] }, isSovereign: false, completed: false }
  ],
  sovereign: null,
  gateKey: 'PROLOGUE_COMPLETE',
  unlocked: true,
  completed: false,
  fastTravelNodes: [],
  devFlags: { WORLD_MAP_ENABLED: false, FRAGMENT_SYSTEM_ENABLED: false, CHAPTER_1_GATE_UNLOCKED: false }
};

// CHAPTER 1 - The Hungry Edge (HUNGER)
const CHAPTER_1: Chapter = {
  number: 1,
  publicName: 'Chapter 1',
  districtName: 'The Hungry Edge',
  trialName: 'Trial of the Hunt',
  pillar: 'hunger',
  description: 'Wind ridges, predator dens, red sky streaks. Learn to track, chase, and dominate.',
  visual: 'wind ridges + predator dens + red sky streaks',
  hubNode: 'Ridge Camp',
  landmarks: [
    { id: 'ruined_watchtower', name: 'Ruined Watchtower', description: 'Overlooks the hunting grounds', position: [50, 20, -30], isDiscovered: false },
    { id: 'echo_spring', name: 'Echo Spring', description: 'Memory water that reveals truth', position: [-20, 0, 50], isDiscovered: false },
    { id: 'bone_run', name: 'The Bone Run', description: 'Chase corridor through predator territory', position: [30, 0, 70], isDiscovered: false }
  ],
  enemies: [
    { id: 'scavenger', name: 'Scavenger', species: 'Hyena/Jackal', role: 'fodder', description: 'Fast pack hunters', attacks: ['bite', 'circle_attack'], weakness: 'Weak individually' },
    { id: 'stalker', name: 'Stalker', species: 'Panther', role: 'hunter', description: 'Precision killer that tracks movement', attacks: ['ambush', 'blind_strike'], weakness: 'Predictable timing' },
    { id: 'burrower', name: 'Burrower Ambusher', species: 'Mole beast', role: 'elite', description: 'Attacks from below', attacks: ['ground_burst', 'tunnel_chase'], weakness: 'Airborne attacks' },
    { id: 'rift_prowler', name: 'Rift Prowler', species: 'Corrupted beast', role: 'roaming_elite', description: 'Elite patrol enemy', attacks: ['rift_slash', 'phase_pounce', 'corruption_howl'], weakness: 'Counter timing' }
  ],
  fragments: [
    { id: 'frag_1_a', name: 'Predator Echo', pillar: 'hunger', description: 'The instinct to pursue', reward: { type: 'movement', name: 'Burst Dash', description: 'Short explosive forward dash' }, collected: false },
    { id: 'frag_1_b', name: 'Hunter Memory', pillar: 'hunger', description: 'Ancient tracking knowledge', reward: { type: 'combat', name: 'Trail Mark', description: 'Mark enemies for tracking' }, collected: false },
    { id: 'frag_1_c', name: 'Pack Law', pillar: 'law', description: 'How the hunt is governed', reward: { type: 'permission', name: 'Ridge Camp Access', description: 'Full hub access' }, collected: false }
  ],
  missions: [
    { id: 'c1_1', chapterId: 1, name: 'Ridge Camp Arrival', pillar: 'hunger', description: 'Reach and register at Ridge Camp', objectives: ['Reach Ridge Camp', 'Register with scouts'], rewards: { xp: 100, fragments: [], flags: ['RIDGECAMP_ACTIVE', 'FAST_TRAVEL_NODE_RIDGECAMP'] }, isSovereign: false, completed: false },
    { id: 'c1_2', chapterId: 1, name: 'Scent of the Hunt', pillar: 'hunger', description: 'Track the Ravel Fang trail', objectives: ['Follow trail markers', 'Reach Watchtower'], rewards: { xp: 150, fragments: ['frag_1_a'], flags: ['C1_FRAGMENT_A'] }, isSovereign: false, completed: false },
    { id: 'c1_3', chapterId: 1, name: 'The Bone Run', pillar: 'hunger', description: 'Timed chase through predator territory', objectives: ['Complete chase in time', 'Dodge all hazards'], rewards: { xp: 175, fragments: [], abilities: ['sprint_boost'], flags: ['BONE_RUN_CLEARED'] }, isSovereign: false, completed: false },
    { id: 'c1_4', chapterId: 1, name: 'Nest Purge', pillar: 'hunger', description: 'Clear predator nests', objectives: ['Clear 3 nests', 'Defeat nest alphas'], rewards: { xp: 200, fragments: [], flags: ['NESTS_CLEARED'] }, isSovereign: false, completed: false },
    { id: 'c1_5', chapterId: 1, name: 'Echo Spring', pillar: 'memory', description: 'Cleanse and defend the spring', objectives: ['Cleanse Echo Spring', 'Defend from waves'], rewards: { xp: 200, fragments: ['frag_1_b'], flags: ['C1_FRAGMENT_B'] }, isSovereign: false, completed: false },
    { id: 'c1_6', chapterId: 1, name: 'Roaming Elite Hunt', pillar: 'hunger', description: 'Defeat the Rift Prowler', objectives: ['Track Rift Prowler', 'Defeat elite enemy'], rewards: { xp: 300, fragments: [], flags: ['ELITE_RIFT_PROWLER_DOWN'] }, isSovereign: false, completed: false },
    { id: 'c1_7', chapterId: 1, name: 'Trial Stone: Hunger', pillar: 'hunger', description: 'Place fragments at Trial Stone', objectives: ['Place fragments', 'Unlock Sovereign arena'], rewards: { xp: 100, fragments: [], flags: ['HUNGER_TRIAL_READY'] }, isSovereign: false, completed: false },
    { id: 'c1_8', chapterId: 1, name: 'Sovereign: The Ravel Fang', pillar: 'hunger', description: 'Face the District Sovereign', objectives: ['Defeat The Ravel Fang', 'Master dodge → counter'], rewards: { xp: 500, fragments: [], abilities: ['burst_dash', 'web_tug'], flags: ['TRAVERSAL_1_GRANTED', 'GATE_KEY_1', 'CHAPTER_2_GATE_UNLOCKED'] }, isSovereign: true, completed: false },
    { id: 'c1_9', chapterId: 1, name: 'Return to Ridge Camp', pillar: 'law', description: 'Debrief and prepare for next chapter', objectives: ['Return to camp', 'Receive next route'], rewards: { xp: 100, fragments: ['frag_1_c'], flags: ['CHAPTER_1_COMPLETE'] }, isSovereign: false, completed: false }
  ],
  sovereign: {
    id: 'ravel_fang',
    name: 'The Ravel Fang',
    title: 'Trial Sovereign of Hunger',
    pillar: 'hunger',
    description: 'Fast predator boss that teaches dodge → counter timing',
    philosophy: 'Hunger without discipline is death',
    phases: 3,
    teachesSkill: 'Dodge → Counter',
    defeated: false
  },
  gateKey: 'GATE_KEY_1',
  unlocked: false,
  completed: false,
  fastTravelNodes: ['Ridge Camp'],
  devFlags: { TRAVERSAL_1_GRANTED: false, GATE_KEY_1: false, FAST_TRAVEL_NODE_RIDGECAMP: false }
};

// CHAPTER 2 - The Iron Order (LAW)
const CHAPTER_2: Chapter = {
  number: 2,
  publicName: 'Chapter 2',
  districtName: 'The Iron Order',
  trialName: 'Trial of the Code',
  pillar: 'law',
  description: 'Walled checkpoint city with clockwork gates. Learn discipline and precision.',
  visual: 'walled city, banners, clockwork gates, searchlights',
  hubNode: 'Checkpoint Bazaar',
  landmarks: [
    { id: 'tribunal_stairs', name: 'Tribunal Stairs', description: 'Vertical arena for parry trials', position: [0, 30, -50], isDiscovered: false },
    { id: 'clockwork_plaza', name: 'Clockwork Plaza', description: 'Central hub with mechanical puzzles', position: [40, 0, 20], isDiscovered: false },
    { id: 'detention_yard', name: 'Detention Yard', description: 'Where rule-breakers are held', position: [-60, 0, 40], isDiscovered: false }
  ],
  enemies: [
    { id: 'patrol_unit', name: 'Patrol Unit', species: 'Guard beast', role: 'fodder', description: 'Disciplined watchers', attacks: ['baton_strike', 'alert_call'], weakness: 'Predictable routes' },
    { id: 'snare_caster', name: 'Snare Caster', species: 'Spider-type', role: 'elite', description: 'Traps and binds targets', attacks: ['web_snare', 'binding_shot'], weakness: 'Close combat' },
    { id: 'shield_bearer', name: 'Shield Bearer', species: 'Turtle-type', role: 'elite', description: 'Heavy defense enemy', attacks: ['shield_bash', 'guard_stance'], weakness: 'Parry timing' },
    { id: 'code_enforcer', name: 'Code Enforcer', species: 'Lion-type', role: 'roaming_elite', description: 'Elite patrol that enforces law', attacks: ['judgment_strike', 'law_bind', 'pressure_wave'], weakness: 'Perfect parry windows' }
  ],
  fragments: [
    { id: 'frag_2_a', name: 'Code of Defense', pillar: 'law', description: 'Ancient parry technique', reward: { type: 'combat', name: 'Parry Upgrade', description: 'Extended parry window' }, collected: false },
    { id: 'frag_2_b', name: 'Binding Echo', pillar: 'law', description: 'Counter-attack memory', reward: { type: 'combat', name: 'Bind Counter', description: 'Counter after successful parry' }, collected: false },
    { id: 'frag_2_c', name: 'Order Memory', pillar: 'memory', description: 'The law of the old city', reward: { type: 'truth', name: 'Thryxen Vision', description: 'See echoes of the Law God' }, collected: false }
  ],
  missions: [
    { id: 'c2_1', chapterId: 2, name: 'Checkpoint Entry', pillar: 'law', description: 'Enter the Iron Order district', objectives: ['Pass checkpoint', 'Register at Bazaar'], rewards: { xp: 100, fragments: [], flags: ['BAZAAR_ACTIVE'] }, isSovereign: false, completed: false },
    { id: 'c2_2', chapterId: 2, name: 'Silent Passage', pillar: 'law', description: 'Reach objective without alerting patrol tiers', objectives: ['Avoid detection', 'Reach Tribunal Stairs'], rewards: { xp: 200, fragments: ['frag_2_a'], flags: ['C2_FRAGMENT_A'] }, isSovereign: false, completed: false },
    { id: 'c2_3', chapterId: 2, name: 'Witness Trial', pillar: 'law', description: 'Solve sequence puzzle under pursuit', objectives: ['Solve puzzle', 'Evade pursuers'], rewards: { xp: 175, fragments: [], flags: ['WITNESS_TRIAL_DONE'] }, isSovereign: false, completed: false },
    { id: 'c2_4', chapterId: 2, name: 'Code Duel', pillar: 'law', description: 'Parry-only challenge', objectives: ['Win parry-only duel', 'No offensive attacks'], rewards: { xp: 250, fragments: ['frag_2_b'], abilities: ['parry_counter'], flags: ['C2_FRAGMENT_B'] }, isSovereign: false, completed: false },
    { id: 'c2_5', chapterId: 2, name: 'Detention Break', pillar: 'sacrifice', description: 'Free prisoners from the yard', objectives: ['Infiltrate Detention Yard', 'Free 5 prisoners'], rewards: { xp: 200, fragments: [], flags: ['PRISONERS_FREED'] }, isSovereign: false, completed: false },
    { id: 'c2_6', chapterId: 2, name: 'Code Enforcer Hunt', pillar: 'law', description: 'Defeat the roaming elite', objectives: ['Track Code Enforcer', 'Defeat with parry mastery'], rewards: { xp: 350, fragments: [], flags: ['ELITE_CODE_ENFORCER_DOWN'] }, isSovereign: false, completed: false },
    { id: 'c2_7', chapterId: 2, name: 'Trial Stone: Law', pillar: 'law', description: 'Prove your discipline', objectives: ['Complete trial without Witness Tier 3', 'Place fragments'], rewards: { xp: 100, fragments: ['frag_2_c'], flags: ['LAW_TRIAL_READY'] }, isSovereign: false, completed: false },
    { id: 'c2_8', chapterId: 2, name: 'Sovereign: Marshal of Codes', pillar: 'law', description: 'Face the Law Sovereign', objectives: ['Defeat Marshal of Codes', 'Master parry windows'], rewards: { xp: 500, fragments: [], abilities: ['parry_upgrade', 'bind_counter'], flags: ['PARRY_UPGRADE', 'GATE_KEY_2', 'CHAPTER_3_GATE_UNLOCKED'] }, isSovereign: true, completed: false },
    { id: 'c2_9', chapterId: 2, name: 'Order Restored', pillar: 'law', description: 'Return to prepare for next trial', objectives: ['Debrief at Bazaar', 'Receive Chapter 3 route'], rewards: { xp: 100, fragments: [], flags: ['CHAPTER_2_COMPLETE'] }, isSovereign: false, completed: false }
  ],
  sovereign: {
    id: 'marshal_of_codes',
    name: 'The Marshal of Codes',
    title: 'Trial Sovereign of Law',
    pillar: 'law',
    description: 'Discipline master that punishes sloppy timing',
    philosophy: 'Law is not punishment. Law is protection.',
    phases: 3,
    teachesSkill: 'Parry Windows',
    defeated: false
  },
  gateKey: 'GATE_KEY_2',
  unlocked: false,
  completed: false,
  fastTravelNodes: ['Checkpoint Bazaar'],
  devFlags: { PARRY_UPGRADE: false, GATE_KEY_2: false }
};

// CHAPTER 3 - The Broken Bridge (SACRIFICE)
const CHAPTER_3: Chapter = {
  number: 3,
  publicName: 'Chapter 3',
  districtName: 'The Broken Bridge',
  trialName: 'Trial of Burden',
  pillar: 'sacrifice',
  description: 'Abyss bridge ruins, refugee camp lights, salvage storms. Learn the cost of power.',
  visual: 'abyss bridge ruins, refugee camp lights, salvage storms',
  hubNode: 'Refuge Camp',
  landmarks: [
    { id: 'collapsed_skyway', name: 'Collapsed Skyway', description: 'Massive broken highway over the abyss', position: [0, 0, -80], isDiscovered: false },
    { id: 'salvage_cathedral', name: 'Salvage Cathedral', description: 'Sacred place of offering', position: [70, 10, 20], isDiscovered: false },
    { id: 'burden_gate', name: 'Burden Gate', description: 'The sacrifice altar', position: [-50, 0, 60], isDiscovered: false }
  ],
  enemies: [
    { id: 'raider', name: 'Raider', species: 'Various', role: 'fodder', description: 'Desperate survivors turned hostile', attacks: ['scrap_weapon', 'desperation_charge'], weakness: 'Low morale' },
    { id: 'corruption_husk', name: 'Corruption Husk', species: 'Void-touched', role: 'elite', description: 'Corrupted by Architect influence', attacks: ['void_touch', 'corruption_spread'], weakness: 'Memory anchors' },
    { id: 'artillery_scavenger', name: 'Artillery Scavenger', species: 'Crab-type', role: 'elite', description: 'Long-range bombardment', attacks: ['artillery_shell', 'mortar_barrage'], weakness: 'Close range' },
    { id: 'burden_brute', name: 'Burden Brute', species: 'Bear-type', role: 'roaming_elite', description: 'Massive elite that tests endurance', attacks: ['crushing_blow', 'burden_slam', 'weight_of_world'], weakness: 'Sacrifice timing' }
  ],
  fragments: [
    { id: 'frag_3_a', name: 'Weight of Choice', pillar: 'sacrifice', description: 'The burden of decision', reward: { type: 'combat', name: 'Burden Stance', description: 'Trade speed for power' }, collected: false },
    { id: 'frag_3_b', name: 'Pyraxis Echo', pillar: 'sacrifice', description: "The Tiger Father's sacrifice", reward: { type: 'truth', name: "Father's Memory", description: "Feel Boryn's presence" }, collected: false },
    { id: 'frag_3_c', name: 'Forge Blueprint', pillar: 'sacrifice', description: 'Crafting knowledge', reward: { type: 'crafting', name: 'Upgrade Station', description: 'Unlock crafting/augmenting' }, collected: false }
  ],
  missions: [
    { id: 'c3_1', chapterId: 3, name: 'Bridge Crossing', pillar: 'sacrifice', description: 'Cross the dangerous broken bridge', objectives: ['Cross Collapsed Skyway', 'Protect refugees'], rewards: { xp: 150, fragments: [], flags: ['SKYWAY_CROSSED'] }, isSovereign: false, completed: false },
    { id: 'c3_2', chapterId: 3, name: 'Refuge Registration', pillar: 'law', description: 'Establish at Refuge Camp', objectives: ['Register at camp', 'Meet survivors'], rewards: { xp: 100, fragments: [], flags: ['REFUGE_CAMP_ACTIVE'] }, isSovereign: false, completed: false },
    { id: 'c3_3', chapterId: 3, name: 'Weighted Escort', pillar: 'sacrifice', description: 'Escort civilians while debuffed', objectives: ['Escort 3 civilians', 'Survive with slow debuff'], rewards: { xp: 250, fragments: ['frag_3_a'], flags: ['C3_FRAGMENT_A'] }, isSovereign: false, completed: false },
    { id: 'c3_4', chapterId: 3, name: 'Gate Trade', pillar: 'sacrifice', description: 'Sacrifice resource to open path', objectives: ['Choose what to sacrifice', 'Accept consequence'], rewards: { xp: 200, fragments: [], flags: ['GATE_TRADE_COMPLETE'] }, isSovereign: false, completed: false },
    { id: 'c3_5', chapterId: 3, name: 'Choose the Saved', pillar: 'sacrifice', description: 'Two objectives, one choice', objectives: ['Choose who to save', 'Accept the loss'], rewards: { xp: 300, fragments: ['frag_3_b'], flags: ['C3_FRAGMENT_B', 'SACRIFICE_CHOICE_MADE'] }, isSovereign: false, completed: false },
    { id: 'c3_6', chapterId: 3, name: 'Burden Brute Hunt', pillar: 'sacrifice', description: 'Face the roaming elite', objectives: ['Track Burden Brute', 'Defeat through endurance'], rewards: { xp: 400, fragments: [], flags: ['ELITE_BURDEN_BRUTE_DOWN'] }, isSovereign: false, completed: false },
    { id: 'c3_7', chapterId: 3, name: 'Cathedral Offering', pillar: 'sacrifice', description: 'Make offering at Salvage Cathedral', objectives: ['Bring offering', 'Complete ritual'], rewards: { xp: 150, fragments: ['frag_3_c'], flags: ['CATHEDRAL_COMPLETE', 'UPGRADE_STATION_UNLOCKED'] }, isSovereign: false, completed: false },
    { id: 'c3_8', chapterId: 3, name: 'Sovereign: The Burden Keeper', pillar: 'sacrifice', description: 'Face the Sacrifice Sovereign', objectives: ['Defeat Burden Keeper', 'Endure area denial'], rewards: { xp: 500, fragments: [], abilities: ['burden_stance'], flags: ['GATE_KEY_3', 'CHAPTER_4_GATE_UNLOCKED'] }, isSovereign: true, completed: false },
    { id: 'c3_9', chapterId: 3, name: 'Weight Accepted', pillar: 'sacrifice', description: 'Complete Chapter 3', objectives: ['Return to Refuge Camp', 'Prepare for Memory'], rewards: { xp: 100, fragments: [], flags: ['CHAPTER_3_COMPLETE'] }, isSovereign: false, completed: false }
  ],
  sovereign: {
    id: 'burden_keeper',
    name: 'The Burden Keeper',
    title: 'Trial Sovereign of Sacrifice',
    pillar: 'sacrifice',
    description: 'Area denial boss that tests discipline and endurance',
    philosophy: 'What you give away defines what you become.',
    phases: 3,
    teachesSkill: 'Sacrifice Timing',
    defeated: false
  },
  gateKey: 'GATE_KEY_3',
  unlocked: false,
  completed: false,
  fastTravelNodes: ['Refuge Camp'],
  devFlags: { UPGRADE_STATION_UNLOCKED: false, SACRIFICE_CHOICE_LOCKED: false, GATE_KEY_3: false }
};

// CHAPTERS 4-8 (Locked for Beta - Teaser content)
const CHAPTER_4: Chapter = {
  number: 4,
  publicName: 'Chapter 4',
  districtName: 'The Glass Archive',
  trialName: 'Trial of Truth',
  pillar: 'memory',
  description: 'Mirror ruins, glass halls, echo voices. Memory becomes your weapon.',
  visual: 'mirror ruins, glass halls, echo voices',
  hubNode: 'Archive Foyer',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'archivist_echo', name: 'The Archivist Echo', title: 'Trial Sovereign of Memory', pillar: 'memory', description: 'Predictive patterns punish spam', philosophy: 'Truth is not found. It is remembered.', phases: 3, teachesSkill: 'Pattern Recognition', defeated: false },
  gateKey: 'GATE_KEY_4',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { MEMORY_POWER_1: false, GATE_KEY_4: false }
};

const CHAPTER_5: Chapter = {
  number: 5,
  publicName: 'Chapter 5',
  districtName: 'The Wild Hunger',
  trialName: 'Trial of Starvation',
  pillar: 'hunger',
  description: 'Fungal forest, molten roots, corrupted wildlife. Hunger becomes corruption.',
  visual: 'fungal forest, molten roots, corrupted wildlife',
  hubNode: 'Hunter Shrine',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'starved_crown', name: 'The Starved Crown', title: 'Trial Sovereign of Corrupted Hunger', pillar: 'hunger', description: 'Rage phases and survival escalation', philosophy: 'Hunger without end consumes itself.', phases: 4, teachesSkill: 'Rage Control', defeated: false },
  gateKey: 'GATE_KEY_5',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { TAIL_GROWTH_1: false, GATE_KEY_5: false }
};

const CHAPTER_6: Chapter = {
  number: 6,
  publicName: 'Chapter 6',
  districtName: 'The Law That Lies',
  trialName: 'Trial of Judgment',
  pillar: 'law',
  description: 'Propaganda city, prison routes, oath chambers. Law becomes moral choice.',
  visual: 'propaganda city, prison routes, oath chambers',
  hubNode: 'Split Market',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'false_judge', name: 'The False Judge', title: 'Trial Sovereign of Corrupted Law', pillar: 'law', description: 'Counter-baiting and mind games', philosophy: 'Law without truth is tyranny.', phases: 4, teachesSkill: 'Moral Clarity', defeated: false },
  gateKey: 'GATE_KEY_6',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { FACTION_A_OR_B_LOCKED: false, GATE_KEY_6: false }
};

const CHAPTER_7: Chapter = {
  number: 7,
  publicName: 'Chapter 7',
  districtName: 'Weight of Blood',
  trialName: 'Trial of Lineage',
  pillar: 'sacrifice',
  description: 'Ancestral pits, oathfire bridges, storm altar. Sacrifice becomes legacy.',
  visual: 'ancestral pits, oathfire bridges, storm altar',
  hubNode: 'Lineage Camp',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'lineage_warden', name: 'The Lineage Warden', title: 'Trial Sovereign of Legacy', pillar: 'sacrifice', description: 'Multi-stage mastery test', philosophy: 'Blood remembers what words forget.', phases: 5, teachesSkill: 'Legacy Bond', defeated: false },
  gateKey: 'GATE_KEY_7',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { MYTH_GEAR_SLOT: false, GATE_KEY_7: false }
};

const CHAPTER_8: Chapter = {
  number: 8,
  publicName: 'Chapter 8',
  districtName: 'Memory Warfront',
  trialName: 'Trial of the Hollow',
  pillar: 'memory',
  description: 'Fractured city blocks, floating roads, rift sky. Memory versus erasure.',
  visual: 'fractured city blocks, floating roads, rift sky',
  hubNode: 'Warfront Shelter',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'hollow_hand', name: 'The Hollow Hand', title: "Architect's Avatar", pillar: 'memory', description: "First true 'editor' fight", philosophy: 'What is designed cannot remember. What remembers cannot be designed.', phases: 5, teachesSkill: 'Reality Resistance', defeated: false },
  gateKey: 'GATE_KEY_8',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { FINAL_GATE_ACCESS: false, ARCHITECT_REVEALED: false }
};

// FINALE
const FINALE: Chapter = {
  number: 9,
  publicName: 'Finale',
  districtName: 'The Memory Nexus',
  trialName: 'The Hollow Architect',
  pillar: 'memory',
  description: 'All timelines converge. The final battle against erasure itself.',
  visual: 'cosmic convergence, reality tears, memory streams',
  hubNode: 'Nexus Core',
  landmarks: [],
  enemies: [],
  fragments: [],
  missions: [],
  sovereign: { id: 'hollow_architect', name: 'The Hollow Architect', title: 'God of Overwrite', pillar: 'memory', description: 'Retroactively removes attacks. Tries to erase Kai & Jax separately. Fails against Memory Fusion.', philosophy: 'You should not exist.', phases: 4, teachesSkill: 'Legacy Defeats Control', defeated: false },
  gateKey: 'FINALE_COMPLETE',
  unlocked: false,
  completed: false,
  fastTravelNodes: [],
  devFlags: { ARCHITECT_DEFEATED: false, MEMORY_KING_CROWNED: false }
};

// All chapters
export const CAMPAIGN_CHAPTERS: Chapter[] = [
  PROLOGUE,
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CHAPTER_5,
  CHAPTER_6,
  CHAPTER_7,
  CHAPTER_8,
  FINALE
];

// Helper functions
export function getChapterByNumber(num: ChapterNumber): Chapter | undefined {
  return CAMPAIGN_CHAPTERS.find(c => c.number === num);
}

export function getChapterMissions(chapterNum: ChapterNumber): Mission[] {
  const chapter = getChapterByNumber(chapterNum);
  return chapter?.missions || [];
}

export function getMissionById(missionId: string): Mission | undefined {
  for (const chapter of CAMPAIGN_CHAPTERS) {
    const mission = chapter.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  return undefined;
}

export function getUnlockedChapters(): Chapter[] {
  return CAMPAIGN_CHAPTERS.filter(c => c.unlocked);
}

export function getBetaChapters(): Chapter[] {
  return CAMPAIGN_CHAPTERS.filter(c => c.number <= 3);
}

export function isChapterLocked(chapterNum: ChapterNumber): boolean {
  return chapterNum > 3;
}

export function getPillarColor(pillar: PillarType): string {
  return PILLARS[pillar].hex;
}

export function getChapterProgress(chapterNum: ChapterNumber): number {
  const chapter = getChapterByNumber(chapterNum);
  if (!chapter) return 0;
  const completed = chapter.missions.filter(m => m.completed).length;
  return chapter.missions.length > 0 ? (completed / chapter.missions.length) * 100 : 0;
}
