/**
 * Quest and Narrative Progression System
 * Tracks player progress through story campaigns, side quests, and narrative arcs
 */

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';
export type QuestType = 'story' | 'side' | 'character' | 'challenge' | 'secret';

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  questType: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  reward: {
    xp: number;
    currency: number;
    unlocks?: string[];
    items?: string[];
  };
  prerequisites?: string[]; // quest IDs that must be completed first
  characterAssociation?: string; // character this quest is about
  progressPercent: number; // 0-100
  startedAt?: number; // timestamp
  completedAt?: number; // timestamp
}

export interface StoryCheckpoint {
  id: string;
  act: 1 | 2 | 3;
  missionId: string;
  missionNumber: number;
  title: string;
  narrative: string;
  completed: boolean;
  savedAt?: number;
}

export interface QuestLog {
  activeQuests: Quest[];
  completedQuests: Quest[];
  failedQuests: Quest[];
  allQuests: Quest[];
  currentCheckpoint?: StoryCheckpoint;
}

// Story checkpoints aligned with story_missions.ts
export const STORY_CHECKPOINTS: StoryCheckpoint[] = [
  {
    id: 'checkpoint_act1_complete',
    act: 1,
    missionId: 'story_act1_m5',
    missionNumber: 5,
    title: 'Act I: Convergence Complete',
    narrative: 'The arena falls. The heroes retreat into the shadows. A new era begins.',
    completed: false,
  },
  {
    id: 'checkpoint_act2_complete',
    act: 2,
    missionId: 'story_act2_m5',
    missionNumber: 10,
    title: 'Act II: War in the Rift Complete',
    narrative: 'The Memory Well stabilizes. The war for memory itself hangs in balance.',
    completed: false,
  },
  {
    id: 'checkpoint_act3_complete',
    act: 3,
    missionId: 'story_act3_m5',
    missionNumber: 15,
    title: 'Act III: The Memory King - Complete',
    narrative: 'Kai-Jax stands victorious. The Architect is defeated. Peace returns to the nine-tailed realm.',
    completed: false,
  },
];

// Character-specific side quests
export const CHARACTER_SIDE_QUESTS: Quest[] = [
  {
    id: 'side_kaison_origins',
    title: 'Kaison: The Bronx Shadow',
    description: 'Learn the truth about Kaison\'s past and the Memory Well corruption.',
    questType: 'character',
    status: 'locked',
    objectives: [
      { id: 'obj_1', description: 'Defeat Kaison in training match', completed: false },
      { id: 'obj_2', description: 'Complete 3 Kaison story missions', completed: false },
      { id: 'obj_3', description: 'Unlock Kaison\'s beast hybrid form', completed: false },
    ],
    reward: { xp: 500, currency: 400, unlocks: ['kaison-advanced'] },
    characterAssociation: 'kaison',
    progressPercent: 0,
    prerequisites: ['story_act1_m2'],
  },
  {
    id: 'side_jaxon_redemption',
    title: 'Jaxon: Speed and Sacrifice',
    description: 'Follow Jaxon\'s journey to redeem himself in the eyes of the Bronx.',
    questType: 'character',
    status: 'locked',
    objectives: [
      { id: 'obj_1', description: 'Complete 3 Jaxon missions', completed: false },
      { id: 'obj_2', description: 'Achieve 5-hit combo with Jaxon', completed: false, progress: 0, target: 5 },
      { id: 'obj_3', description: 'Defeat Void Stalker', completed: false },
    ],
    reward: { xp: 600, currency: 450, unlocks: ['jaxon-legend'] },
    characterAssociation: 'jaxon',
    progressPercent: 0,
    prerequisites: ['story_act1_m4'],
  },
  {
    id: 'side_kai_jax_convergence',
    title: 'The Fusion: Kai-Jax Protocol',
    description: 'Master the ancient fusion technique that transforms Kai and Jaxon into Kai-Jax.',
    questType: 'character',
    status: 'locked',
    objectives: [
      { id: 'obj_1', description: 'Fusion success rate 50%+', completed: false, progress: 0, target: 50 },
      { id: 'obj_2', description: 'Complete 5 Kai-Jax missions', completed: false, progress: 0, target: 5 },
      { id: 'obj_3', description: 'Defeat final boss as Kai-Jax', completed: false },
    ],
    reward: { xp: 1000, currency: 800, unlocks: ['kai-jax-master'] },
    characterAssociation: 'kai-jax',
    progressPercent: 0,
    prerequisites: ['story_act2_m1'],
  },
];

// Challenge quests for extended gameplay
export const CHALLENGE_QUESTS: Quest[] = [
  {
    id: 'challenge_speedrun_act1',
    title: 'Act I Speedrun Challenge',
    description: 'Complete Act I in under 30 minutes without dying.',
    questType: 'challenge',
    status: 'available',
    objectives: [
      { id: 'obj_1', description: 'Complete Act I', completed: false },
      { id: 'obj_2', description: 'Time: Under 30 minutes', completed: false },
      { id: 'obj_3', description: 'No deaths', completed: false },
    ],
    reward: { xp: 750, currency: 500, items: ['speedrun-badge'] },
    progressPercent: 0,
    prerequisites: ['checkpoint_act1_complete'],
  },
  {
    id: 'challenge_no_damage_boss',
    title: 'Perfect Parry: Final Boss Challenge',
    description: 'Defeat the final boss without taking damage.',
    questType: 'challenge',
    status: 'locked',
    objectives: [
      { id: 'obj_1', description: 'Defeat final boss', completed: false },
      { id: 'obj_2', description: 'Health: 100% maintained', completed: false },
    ],
    reward: { xp: 1000, currency: 800, items: ['perfect-parry-trophy'] },
    progressPercent: 0,
    prerequisites: ['checkpoint_act3_complete'],
  },
];

/**
 * Updates quest progress based on gameplay events
 * Called by game logic during combat, exploration, and story progression
 */
export function updateQuestProgress(
  quests: Quest[],
  questId: string,
  objectiveId: string,
  progress: number,
  target?: number
): Quest[] {
  return quests.map((quest) => {
    if (quest.id === questId) {
      const updatedQuest = { ...quest };
      updatedQuest.objectives = updatedQuest.objectives.map((obj) => {
        if (obj.id === objectiveId) {
          const newProgress = Math.min(progress, target || 100);
          const isComplete = target ? newProgress >= target : progress > 0;
          return { ...obj, progress: newProgress, completed: isComplete };
        }
        return obj;
      });

      // Calculate overall progress
      const completedObjectives = updatedQuest.objectives.filter((obj) => obj.completed).length;
      updatedQuest.progressPercent = Math.round((completedObjectives / updatedQuest.objectives.length) * 100);

      // Mark quest as completed if all objectives done
      if (updatedQuest.progressPercent === 100 && updatedQuest.status === 'active') {
        updatedQuest.status = 'completed';
        updatedQuest.completedAt = Date.now();
      }

      return updatedQuest;
    }
    return quest;
  });
}

/**
 * Checks if a quest should be unlocked based on prerequisites
 */
export function checkQuestUnlocks(
  quests: Quest[],
  completedQuestIds: string[]
): Quest[] {
  return quests.map((quest) => {
    if (quest.status === 'locked' && quest.prerequisites) {
      const allPrerequisitesMet = quest.prerequisites.every((prereq) =>
        completedQuestIds.includes(prereq)
      );
      if (allPrerequisitesMet) {
        return { ...quest, status: 'available' };
      }
    }
    return quest;
  });
}

/**
 * Activates a quest for the player
 */
export function activateQuest(quests: Quest[], questId: string): Quest[] {
  return quests.map((quest) => {
    if (quest.id === questId && (quest.status === 'available' || quest.status === 'locked')) {
      return {
        ...quest,
        status: 'active',
        startedAt: Date.now(),
        progressPercent: 0,
      };
    }
    return quest;
  });
}

/**
 * Completes a quest
 */
export function completeQuest(quests: Quest[], questId: string): Quest[] {
  return quests.map((quest) => {
    if (quest.id === questId) {
      return {
        ...quest,
        status: 'completed',
        completedAt: Date.now(),
        progressPercent: 100,
        objectives: quest.objectives.map((obj) => ({ ...obj, completed: true })),
      };
    }
    return quest;
  });
}
