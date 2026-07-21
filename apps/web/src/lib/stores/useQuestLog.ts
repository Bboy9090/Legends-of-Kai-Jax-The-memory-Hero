/**
 * Quest Log State Management
 * Handles player progress through quests, narratives, and story checkpoints
 */

import { create } from 'zustand';
import type { Quest, QuestStatus, StoryCheckpoint } from '../questSystem';
import {
  STORY_CHECKPOINTS,
  CHARACTER_SIDE_QUESTS,
  CHALLENGE_QUESTS,
  updateQuestProgress,
  checkQuestUnlocks,
  activateQuest,
  completeQuest,
} from '../questSystem';

interface QuestLogState {
  // Quest data
  allQuests: Quest[];
  completedQuestIds: string[];
  currentCheckpoint: StoryCheckpoint | null;

  // Quest management
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  getAvailableQuests: () => Quest[];
  getQuestProgress: (questId: string) => number;

  // Quest actions
  activateQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  updateQuestObjective: (questId: string, objectiveId: string, progress: number, target?: number) => void;

  // Story checkpoints
  setCurrentCheckpoint: (checkpoint: StoryCheckpoint) => void;
  checkpointReached: (checkpointId: string) => void;
  getCheckpointProgress: () => number; // 0-100 based on acts completed

  // Initialization
  initialize: () => void;
  reset: () => void;
}

// Combine all quest types
const initialQuests = [...CHARACTER_SIDE_QUESTS, ...CHALLENGE_QUESTS];

export const useQuestLog = create<QuestLogState>((set, get) => ({
  allQuests: initialQuests.map((q) => ({ ...q, status: 'locked' as QuestStatus })),
  completedQuestIds: [],
  currentCheckpoint: null,

  getActiveQuests: () => get().allQuests.filter((q) => q.status === 'active'),

  getCompletedQuests: () => get().allQuests.filter((q) => q.status === 'completed'),

  getAvailableQuests: () => get().allQuests.filter((q) => q.status === 'available'),

  getQuestProgress: (questId: string) => {
    const quest = get().allQuests.find((q) => q.id === questId);
    return quest?.progressPercent ?? 0;
  },

  activateQuest: (questId: string) => {
    set((state) => ({
      allQuests: activateQuest(state.allQuests, questId),
    }));
  },

  completeQuest: (questId: string) => {
    set((state) => {
      const updatedQuests = completeQuest(state.allQuests, questId);
      const newCompletedIds = [...state.completedQuestIds, questId];
      const questsWithUnlocks = checkQuestUnlocks(updatedQuests, newCompletedIds);

      return {
        allQuests: questsWithUnlocks,
        completedQuestIds: newCompletedIds,
      };
    });
  },

  failQuest: (questId: string) => {
    set((state) => ({
      allQuests: state.allQuests.map((quest) => {
        if (quest.id === questId) {
          return { ...quest, status: 'failed' as QuestStatus };
        }
        return quest;
      }),
    }));
  },

  updateQuestObjective: (questId: string, objectiveId: string, progress: number, target?: number) => {
    set((state) => ({
      allQuests: updateQuestProgress(state.allQuests, questId, objectiveId, progress, target),
    }));

    // Check if quest is now complete and auto-complete if so
    const quest = get().allQuests.find((q) => q.id === questId);
    if (quest && quest.status === 'completed' && !get().completedQuestIds.includes(questId)) {
      get().completeQuest(questId);
    }
  },

  setCurrentCheckpoint: (checkpoint: StoryCheckpoint) => {
    set({ currentCheckpoint: { ...checkpoint, completed: true, savedAt: Date.now() } });
  },

  checkpointReached: (checkpointId: string) => {
    const checkpoint = STORY_CHECKPOINTS.find((c) => c.id === checkpointId);
    if (checkpoint) {
      get().setCurrentCheckpoint(checkpoint);
    }
  },

  getCheckpointProgress: () => {
    const state = get();
    const completedActs = STORY_CHECKPOINTS.filter((c) => {
      const quest = state.allQuests.find(
        (q) => q.id.includes(`story_act${c.act}_m5`) && q.status === 'completed'
      );
      return quest !== undefined;
    }).length;

    return Math.round((completedActs / 3) * 100);
  },

  initialize: () => {
    set((state) => {
      // Start with first story quest available if nothing is started
      const hasActiveOrCompleted = state.allQuests.some(
        (q) => q.status === 'active' || q.status === 'completed'
      );

      if (!hasActiveOrCompleted) {
        return {
          allQuests: state.allQuests.map((q) => ({
            ...q,
            status: q.questType === 'story' ? 'available' : ('locked' as QuestStatus),
          })),
        };
      }

      return state;
    });
  },

  reset: () => {
    set({
      allQuests: initialQuests.map((q) => ({ ...q, status: 'locked' as QuestStatus })),
      completedQuestIds: [],
      currentCheckpoint: null,
    });
  },
}));
