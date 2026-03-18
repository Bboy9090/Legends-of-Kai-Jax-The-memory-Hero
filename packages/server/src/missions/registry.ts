import { Mission, MissionType, MissionDifficulty, DNAType } from './types';

/**
 * Complete Mission Registry - 100 Missions
 * Organized into 10 Books with 10 Missions each
 */
export const MISSION_REGISTRY: Mission[] = [
  // ==================== BOOK 1: AWAKENING (Missions 1-10) ====================
  {
    id: 1,
    book: 1,
    chapter: 1,
    title: 'First Steps',
    description: 'Learn basic movement and controls',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.TUTORIAL,
    objectives: [
      { id: 'move', description: 'Move left and right', type: 'timing' },
      { id: 'jump', description: 'Perform a jump', type: 'timing' },
    ],
    rewards: { xp: 100, currency: 50 },
    characters: ['kaison'],
    arena: 'training_grounds',
  },
  {
    id: 2,
    book: 1,
    chapter: 1,
    title: 'Combat Basics',
    description: 'Master light and heavy attacks',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.TUTORIAL,
    objectives: [
      { id: 'light', description: 'Land 5 light attacks', type: 'combo', target: 5 },
      { id: 'heavy', description: 'Land 3 heavy attacks', type: 'combo', target: 3 },
    ],
    rewards: { xp: 150, currency: 75, dna: { type: DNAType.FOX, amount: 10 } },
    prerequisites: [1],
    characters: ['kaison'],
    arena: 'training_grounds',
  },
  {
    id: 3,
    book: 1,
    chapter: 1,
    title: 'The Broken Bracket',
    description: 'Defeat the corrupted training dummy',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.EASY,
    objectives: [
      { id: 'defeat_dummy', description: 'Defeat the training dummy', type: 'defeat', target: 'training_dummy' },
    ],
    rewards: { xp: 200, currency: 100, dna: { type: DNAType.FOX, amount: 20 } },
    prerequisites: [2],
    characters: ['kaison'],
    arena: 'broken_arena',
    timeLimit: 180,
  },
  {
    id: 4,
    book: 1,
    chapter: 2,
    title: 'Speed Demon',
    description: 'Meet Jaxon the hedgehog',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.EASY,
    objectives: [
      { id: 'survive', description: 'Survive 60 seconds against Jaxon', type: 'survive', target: 60 },
    ],
    rewards: { xp: 250, currency: 125, dna: { type: DNAType.HEDGEHOG, amount: 25 }, unlocks: ['jaxon'] },
    prerequisites: [3],
    characters: ['kaison'],
    arena: 'speed_track',
  },
  {
    id: 5,
    book: 1,
    chapter: 2,
    title: 'Tag Team Training',
    description: 'Learn to switch between characters',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.EASY,
    objectives: [
      { id: 'switch', description: 'Switch characters 5 times', type: 'timing', target: 5 },
      { id: 'combo', description: 'Land a 10-hit combo', type: 'combo', target: 10 },
    ],
    rewards: { xp: 300, currency: 150 },
    prerequisites: [4],
    characters: ['kaison', 'jaxon'],
    arena: 'training_grounds',
  },
  {
    id: 6,
    book: 1,
    chapter: 3,
    title: 'Synergy Surge',
    description: 'Build and activate synergy meter',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'build_synergy', description: 'Fill synergy meter to 100%', type: 'collect', target: 100 },
      { id: 'activate', description: 'Activate synergy mode', type: 'timing' },
    ],
    rewards: { xp: 350, currency: 175, dna: { type: DNAType.FOX, amount: 15 } },
    prerequisites: [5],
    characters: ['kaison', 'jaxon'],
    arena: 'training_grounds',
  },
  {
    id: 7,
    book: 1,
    chapter: 3,
    title: 'Fusion Awakening',
    description: 'Transform into Kaxon for the first time',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'fuse', description: 'Complete fusion transformation', type: 'timing' },
      { id: 'test', description: 'Defeat 3 enemies as Kaxon', type: 'defeat', target: 3 },
    ],
    rewards: { xp: 500, currency: 250, unlocks: ['kaxon_fusion'] },
    prerequisites: [6],
    characters: ['kaison', 'jaxon'],
    arena: 'fusion_chamber',
  },
  {
    id: 8,
    book: 1,
    chapter: 4,
    title: 'First Arena Battle',
    description: 'Complete your first arena match',
    type: MissionType.ARENA,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'win', description: 'Win the arena match', type: 'defeat' },
    ],
    rewards: { xp: 400, currency: 200, dna: { type: DNAType.HEDGEHOG, amount: 20 } },
    prerequisites: [7],
    characters: ['kaison', 'jaxon'],
    arena: 'rookie_arena',
  },
  {
    id: 9,
    book: 1,
    chapter: 4,
    title: 'Advanced Combos',
    description: 'Master advanced combo techniques',
    type: MissionType.CHALLENGE,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'combo_15', description: 'Land a 15-hit combo', type: 'combo', target: 15 },
      { id: 'combo_damage', description: 'Deal 50% damage in one combo', type: 'combo', target: 50 },
    ],
    rewards: { xp: 450, currency: 225 },
    prerequisites: [8],
    characters: ['kaison', 'jaxon'],
    arena: 'training_grounds',
  },
  {
    id: 10,
    book: 1,
    chapter: 5,
    title: 'The Shadow Appears',
    description: 'Face a mysterious opponent - Book 1 Boss',
    type: MissionType.BOSS,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'defeat_boss', description: 'Defeat the Shadow', type: 'defeat', target: 'shadow_boss' },
    ],
    rewards: { xp: 1000, currency: 500, dna: { type: DNAType.WOLF, amount: 50 }, unlocks: ['book_2'] },
    prerequisites: [9],
    characters: ['kaison', 'jaxon'],
    arena: 'shadow_realm',
    timeLimit: 300,
  },

  // ==================== BOOK 2: RISING POWER (Missions 11-20) ====================
  {
    id: 11,
    book: 2,
    chapter: 1,
    title: 'Wolf Territory',
    description: 'Enter the Wolf Clan domain',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'explore', description: 'Navigate through Wolf Territory', type: 'timing' },
      { id: 'defeat_guards', description: 'Defeat 5 Wolf Guards', type: 'defeat', target: 5 },
    ],
    rewards: { xp: 600, currency: 300, dna: { type: DNAType.WOLF, amount: 30 } },
    prerequisites: [10],
    characters: ['kaison', 'jaxon'],
    arena: 'wolf_den',
  },
  {
    id: 12,
    book: 2,
    chapter: 1,
    title: 'Aerial Mastery',
    description: 'Perfect your aerial combat skills',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'aerial_combo', description: 'Land 10 aerial attacks without touching ground', type: 'combo', target: 10 },
    ],
    rewards: { xp: 500, currency: 250 },
    prerequisites: [11],
    characters: ['kaison', 'jaxon'],
    arena: 'sky_platform',
  },
  {
    id: 13,
    book: 2,
    chapter: 2,
    title: 'Bird DNA Collection',
    description: 'Collect Bird DNA samples',
    type: MissionType.COLLECTION,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'collect_dna', description: 'Collect 10 Bird DNA fragments', type: 'collect', target: 10 },
    ],
    rewards: { xp: 550, currency: 275, dna: { type: DNAType.BIRD, amount: 100 }, unlocks: ['bird_abilities'] },
    prerequisites: [12],
    characters: ['kaison', 'jaxon'],
    arena: 'floating_islands',
  },
  {
    id: 14,
    book: 2,
    chapter: 2,
    title: 'Team Dynamics',
    description: 'Master tag team mechanics',
    type: MissionType.CHALLENGE,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'tag_combo', description: 'Perform 5 tag team combos', type: 'combo', target: 5 },
      { id: 'fusion_finish', description: 'Finish with Kaxon fusion ultimate', type: 'timing' },
    ],
    rewards: { xp: 700, currency: 350 },
    prerequisites: [13],
    characters: ['kaison', 'jaxon'],
    arena: 'dual_arena',
  },
  {
    id: 15,
    book: 2,
    chapter: 3,
    title: 'The Cat Clan',
    description: 'Meet the mysterious Cat Clan',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.NORMAL,
    objectives: [
      { id: 'stealth', description: 'Complete stealth sequence', type: 'timing' },
      { id: 'defeat_ninjas', description: 'Defeat 8 Cat Ninjas', type: 'defeat', target: 8 },
    ],
    rewards: { xp: 650, currency: 325, dna: { type: DNAType.CAT, amount: 40 }, unlocks: ['cat_character'] },
    prerequisites: [14],
    characters: ['kaison', 'jaxon'],
    arena: 'moonlit_rooftops',
  },
  {
    id: 16,
    book: 2,
    chapter: 3,
    title: 'Counter Master',
    description: 'Perfect the counter system',
    type: MissionType.TRAINING,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'counter', description: 'Successfully counter 10 attacks', type: 'combo', target: 10 },
      { id: 'perfect', description: 'Land 3 perfect counters in a row', type: 'combo', target: 3 },
    ],
    rewards: { xp: 750, currency: 375 },
    prerequisites: [15],
    characters: ['kaison', 'jaxon'],
    arena: 'training_grounds',
  },
  {
    id: 17,
    book: 2,
    chapter: 4,
    title: 'Tournament Qualifier',
    description: 'Qualify for the Grand Tournament',
    type: MissionType.ARENA,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'win_3', description: 'Win 3 consecutive matches', type: 'defeat', target: 3 },
    ],
    rewards: { xp: 800, currency: 400, dna: { type: DNAType.FOX, amount: 30 } },
    prerequisites: [16],
    characters: ['kaison', 'jaxon'],
    arena: 'tournament_stage',
  },
  {
    id: 18,
    book: 2,
    chapter: 4,
    title: 'Ultimate Meter Mastery',
    description: 'Master ultimate meter management',
    type: MissionType.CHALLENGE,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'fill_meter', description: 'Fill ultimate meter 3 times', type: 'collect', target: 3 },
      { id: 'use_ultimates', description: 'Use 3 different ultimate moves', type: 'combo', target: 3 },
    ],
    rewards: { xp: 850, currency: 425 },
    prerequisites: [17],
    characters: ['kaison', 'jaxon'],
    arena: 'power_nexus',
  },
  {
    id: 19,
    book: 2,
    chapter: 5,
    title: 'Dragon DNA Hunt',
    description: 'Discover ancient Dragon DNA',
    type: MissionType.STORY,
    difficulty: MissionDifficulty.HARD,
    objectives: [
      { id: 'explore_ruins', description: 'Explore ancient ruins', type: 'timing' },
      { id: 'defeat_guardians', description: 'Defeat 10 Dragon Guardians', type: 'defeat', target: 10 },
      { id: 'obtain_dna', description: 'Obtain Dragon DNA', type: 'collect' },
    ],
    rewards: { xp: 900, currency: 450, dna: { type: DNAType.DRAGON, amount: 75 } },
    prerequisites: [18],
    characters: ['kaison', 'jaxon'],
    arena: 'dragon_ruins',
  },
  {
    id: 20,
    book: 2,
    chapter: 5,
    title: 'Alpha Wolf Boss',
    description: 'Face the Alpha Wolf - Book 2 Boss',
    type: MissionType.BOSS,
    difficulty: MissionDifficulty.EXPERT,
    objectives: [
      { id: 'defeat_alpha', description: 'Defeat the Alpha Wolf', type: 'defeat', target: 'alpha_wolf' },
      { id: 'no_damage', description: 'Take less than 50% damage', type: 'survive', optional: true },
    ],
    rewards: { xp: 1500, currency: 750, dna: { type: DNAType.WOLF, amount: 100 }, unlocks: ['book_3', 'wolf_character'] },
    prerequisites: [19],
    characters: ['kaison', 'jaxon'],
    arena: 'alpha_den',
    timeLimit: 300,
  },

  // ==================== BOOK 3-10: Placeholder Missions (21-100) ====================
  // Creating condensed entries for remaining books to reach 100 missions

  // BOOK 3: ELEMENTAL FORCE (21-30)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 21 + i,
    book: 3,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 3 Mission ${i + 1}`,
    description: 'Master elemental powers and unlock new abilities',
    type: i % 3 === 0 ? MissionType.BOSS : i % 2 === 0 ? MissionType.STORY : MissionType.CHALLENGE,
    difficulty: i < 5 ? MissionDifficulty.NORMAL : MissionDifficulty.HARD,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 1000 + i * 50, currency: 500 + i * 25, dna: { type: DNAType.ELEMENTAL, amount: 30 + i * 5 } },
    prerequisites: [20 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'elemental_realm',
  })),

  // BOOK 4: PHOENIX RISING (31-40)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 31 + i,
    book: 4,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 4 Mission ${i + 1}`,
    description: 'Unlock the legendary Phoenix transformation',
    type: i % 3 === 0 ? MissionType.BOSS : i % 2 === 0 ? MissionType.STORY : MissionType.ARENA,
    difficulty: i < 4 ? MissionDifficulty.HARD : MissionDifficulty.EXPERT,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 1500 + i * 75, currency: 750 + i * 35, dna: { type: DNAType.PHOENIX, amount: 40 + i * 8 } },
    prerequisites: [30 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'phoenix_temple',
  })),

  // BOOK 5: SHADOW TOURNAMENT (41-50)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 41 + i,
    book: 5,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 5 Mission ${i + 1}`,
    description: 'Compete in the legendary Shadow Tournament',
    type: i % 2 === 0 ? MissionType.ARENA : MissionType.CHALLENGE,
    difficulty: i < 3 ? MissionDifficulty.HARD : i < 7 ? MissionDifficulty.EXPERT : MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 2000 + i * 100, currency: 1000 + i * 50, dna: { type: DNAType.DRAGON, amount: 50 + i * 10 } },
    prerequisites: [40 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'shadow_tournament',
  })),

  // BOOK 6: COSMIC AWAKENING (51-60)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 51 + i,
    book: 6,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 6 Mission ${i + 1}`,
    description: 'Transcend mortal limits with cosmic power',
    type: i % 3 === 0 ? MissionType.BOSS : MissionType.STORY,
    difficulty: i < 5 ? MissionDifficulty.EXPERT : MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 2500 + i * 125, currency: 1250 + i * 60, dna: { type: DNAType.PHOENIX, amount: 60 + i * 12 } },
    prerequisites: [50 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'cosmic_nexus',
  })),

  // BOOK 7: MULTIVERSE CLASH (61-70)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 61 + i,
    book: 7,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 7 Mission ${i + 1}`,
    description: 'Battle across parallel dimensions',
    type: i % 2 === 0 ? MissionType.STORY : MissionType.CHALLENGE,
    difficulty: i < 3 ? MissionDifficulty.EXPERT : MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 3000 + i * 150, currency: 1500 + i * 75, dna: { type: DNAType.ELEMENTAL, amount: 70 + i * 15 } },
    prerequisites: [60 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'multiverse_rift',
  })),

  // BOOK 8: DIVINE TRIALS (71-80)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 71 + i,
    book: 8,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 8 Mission ${i + 1}`,
    description: 'Face the trials of the divine beings',
    type: i % 3 === 0 ? MissionType.BOSS : i % 2 === 0 ? MissionType.ARENA : MissionType.CHALLENGE,
    difficulty: MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 3500 + i * 200, currency: 1750 + i * 100, dna: { type: DNAType.PHOENIX, amount: 80 + i * 20 } },
    prerequisites: [70 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'divine_realm',
  })),

  // BOOK 9: ULTIMATE FUSION (81-90)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 81 + i,
    book: 9,
    chapter: Math.floor(i / 2) + 1,
    title: `Book 9 Mission ${i + 1}`,
    description: 'Master ultimate fusion forms',
    type: i % 2 === 0 ? MissionType.STORY : MissionType.TRAINING,
    difficulty: MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: 'Complete mission objective', type: 'defeat' as const }],
    rewards: { xp: 4000 + i * 250, currency: 2000 + i * 125, dna: { type: DNAType.DRAGON, amount: 100 + i * 25 } },
    prerequisites: [80 + i],
    characters: ['kaison', 'jaxon'],
    arena: 'fusion_nexus',
  })),

  // BOOK 10: FINAL DESTINY (91-100)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 91 + i,
    book: 10,
    chapter: Math.floor(i / 2) + 1,
    title: i === 9 ? 'The Final Battle' : `Book 10 Mission ${i + 1}`,
    description: i === 9 ? 'Face the ultimate challenge and determine the fate of all worlds' : 'The final chapter begins',
    type: i === 9 ? MissionType.BOSS : i % 2 === 0 ? MissionType.STORY : MissionType.CHALLENGE,
    difficulty: MissionDifficulty.MASTER,
    objectives: [{ id: 'obj1', description: i === 9 ? 'Defeat the Final Boss' : 'Complete mission objective', type: 'defeat' as const }],
    rewards: { 
      xp: 5000 + i * 500, 
      currency: 2500 + i * 250, 
      dna: { type: DNAType.PHOENIX, amount: 150 + i * 50 },
      unlocks: i === 9 ? ['true_ending', 'god_mode'] : undefined
    },
    prerequisites: [90 + i],
    characters: ['kaison', 'jaxon'],
    arena: i === 9 ? 'final_destiny' : 'ultimate_arena',
    timeLimit: i === 9 ? 600 : undefined,
  })),
];

/**
 * Get mission by ID
 */
export function getMissionById(id: number): Mission | undefined {
  return MISSION_REGISTRY.find(m => m.id === id);
}

/**
 * Get missions by book
 */
export function getMissionsByBook(book: number): Mission[] {
  return MISSION_REGISTRY.filter(m => m.book === book);
}

/**
 * Get all missions
 */
export function getAllMissions(): Mission[] {
  return MISSION_REGISTRY;
}

/**
 * Get available missions (prerequisites met, not completed)
 */
export function getAvailableMissions(completedMissionIds: number[]): Mission[] {
  return MISSION_REGISTRY.filter(mission => {
    // Check if mission is already completed
    if (completedMissionIds.includes(mission.id)) {
      return false;
    }
    
    // Check if prerequisites are met
    if (mission.prerequisites) {
      return mission.prerequisites.every(prereqId => completedMissionIds.includes(prereqId));
    }
    
    return true;
  });
}
