/**
 * STORY PROGRESS MANAGER - Central Story Mode Controller
 * 
 * Purpose: Manages story progression, chapter unlocks, and narrative state
 * Connects: SagaEngine + DialogueSystem + UI Components
 * 
 * Features:
 * - Chapter progression tracking
 * - Save/Load story progress
 * - Character unlocks based on story
 * - Narrative choice persistence
 * - Boss fight integration
 */

import { SagaEngine, BookId, StoryNode } from '@game/core/SagaEngine';
import { DialogueSystem } from '@game/systems/DialogueSystem';

export interface ChapterProgress {
  chapterId: number;
  bookId: BookId;
  completed: boolean;
  completionRank?: 'S' | 'A' | 'B' | 'C';
  completionTime?: number;
  perfectDodges?: number;
  perfectParries?: number;
  maxCombo?: number;
  bossDefeated?: boolean;
}

export interface StoryProgress {
  currentBook: BookId;
  currentChapter: number;
  completedChapters: ChapterProgress[];
  unlockedCharacters: string[];
  narrativeChoices: { [nodeId: string]: string };
  globalFlags: string[];
  totalPlaytime: number;
  lastPlayed: number;
}

export class StoryProgressManager {
  private static instance: StoryProgressManager;
  private sagaEngine: SagaEngine;
  private dialogueSystem: DialogueSystem;
  private progress: StoryProgress;

  private constructor() {
    this.sagaEngine = SagaEngine.getInstance();
    this.dialogueSystem = DialogueSystem.getInstance();
    this.progress = this.loadProgress();
  }

  public static getInstance(): StoryProgressManager {
    if (!StoryProgressManager.instance) {
      StoryProgressManager.instance = new StoryProgressManager();
    }
    return StoryProgressManager.instance;
  }

  /**
   * Initialize story mode for first-time players
   */
  public initializeNewGame(): StoryProgress {
    const newProgress: StoryProgress = {
      currentBook: BookId.BOOK_1,
      currentChapter: 1,
      completedChapters: [],
      unlockedCharacters: ['kai-jax'], // Starting character
      narrativeChoices: {},
      globalFlags: [],
      totalPlaytime: 0,
      lastPlayed: Date.now(),
    };

    this.progress = newProgress;
    this.saveProgress();
    return newProgress;
  }

  /**
   * Get current story progress
   */
  public getProgress(): StoryProgress {
    return { ...this.progress };
  }

  /**
   * Check if a chapter is unlocked
   */
  public isChapterUnlocked(bookId: BookId, chapterId: number): boolean {
    // Chapter 1 of Book 1 is always unlocked
    if (bookId === BookId.BOOK_1 && chapterId === 1) {
      return true;
    }

    // Check if previous chapter is completed
    const previousChapterId = chapterId - 1;
    const completed = this.progress.completedChapters.find(
      (ch) => ch.bookId === bookId && ch.chapterId === previousChapterId && ch.completed
    );

    return !!completed;
  }

  /**
   * Complete a chapter with performance metrics
   */
  public completeChapter(
    bookId: BookId,
    chapterId: number,
    metrics: {
      completionTime: number;
      perfectDodges: number;
      perfectParries: number;
      maxCombo: number;
      finalHP: number;
      bossDefeated?: boolean;
    }
  ): void {
    // Calculate rank based on performance
    const rank = this.calculateRank(metrics);

    // Create chapter progress record
    const chapterProgress: ChapterProgress = {
      chapterId,
      bookId,
      completed: true,
      completionRank: rank,
      completionTime: metrics.completionTime,
      perfectDodges: metrics.perfectDodges,
      perfectParries: metrics.perfectParries,
      maxCombo: metrics.maxCombo,
      bossDefeated: metrics.bossDefeated,
    };

    // Remove old completion if it exists
    this.progress.completedChapters = this.progress.completedChapters.filter(
      (ch) => !(ch.bookId === bookId && ch.chapterId === chapterId)
    );

    // Add new completion
    this.progress.completedChapters.push(chapterProgress);

    // Update current chapter if this was the current one
    if (bookId === this.progress.currentBook && chapterId === this.progress.currentChapter) {
      this.progress.currentChapter = chapterId + 1;
    }

    // Unlock characters based on completion
    this.unlockCharactersForChapter(bookId, chapterId, rank);

    // Save progress
    this.saveProgress();

    console.log(`✅ Chapter ${chapterId} of Book ${bookId} completed with rank ${rank}!`);
  }

  /**
   * Calculate performance rank
   */
  private calculateRank(metrics: {
    completionTime: number;
    perfectDodges: number;
    perfectParries: number;
    maxCombo: number;
    finalHP: number;
  }): 'S' | 'A' | 'B' | 'C' {
    let score = 0;

    // Time bonus (under 2 minutes = bonus)
    if (metrics.completionTime < 120000) score += 25;
    else if (metrics.completionTime < 180000) score += 15;

    // Perfect dodge/parry bonus
    score += Math.min(metrics.perfectDodges * 5, 25);
    score += Math.min(metrics.perfectParries * 5, 25);

    // Combo bonus
    if (metrics.maxCombo >= 50) score += 25;
    else if (metrics.maxCombo >= 20) score += 15;
    else if (metrics.maxCombo >= 10) score += 10;

    // HP bonus
    if (metrics.finalHP >= 80) score += 20;
    else if (metrics.finalHP >= 50) score += 10;

    // Determine rank
    if (score >= 90) return 'S';
    if (score >= 70) return 'A';
    if (score >= 50) return 'B';
    return 'C';
  }

  /**
   * Unlock characters based on story progression
   */
  private unlockCharactersForChapter(bookId: BookId, chapterId: number, rank: 'S' | 'A' | 'B' | 'C'): void {
    // Define character unlocks (can be expanded)
    const unlocks: { [key: string]: string } = {
      '1-3': 'lunara-solis', // Complete Chapter 3
      '1-6': 'umbra-flux', // Complete Chapter 6
      '1-9': 'boryx-zenith', // Complete Chapter 9 (boss)
    };

    const key = `${bookId}-${chapterId}`;
    const characterToUnlock = unlocks[key];

    if (characterToUnlock && !this.progress.unlockedCharacters.includes(characterToUnlock)) {
      this.progress.unlockedCharacters.push(characterToUnlock);
      console.log(`🔓 Character unlocked: ${characterToUnlock}`);
    }

    // S-Rank unlocks special characters
    if (rank === 'S' && chapterId % 3 === 0) {
      // Every 3rd chapter with S-rank unlocks a special character
      const specialUnlocks = ['sentinel-vox', 'kiro-kong', 'chronos-sere'];
      const specialChar = specialUnlocks[Math.floor(chapterId / 3) - 1];
      
      if (specialChar && !this.progress.unlockedCharacters.includes(specialChar)) {
        this.progress.unlockedCharacters.push(specialChar);
        console.log(`⭐ S-Rank unlock: ${specialChar}`);
      }
    }
  }

  /**
   * Record a narrative choice
   */
  public recordChoice(nodeId: string, choiceId: string): void {
    this.progress.narrativeChoices[nodeId] = choiceId;
    this.saveProgress();
    
    // Update SagaEngine
    this.sagaEngine.makeChoice(choiceId);
  }

  /**
   * Add a global story flag
   */
  public addStoryFlag(flag: string): void {
    if (!this.progress.globalFlags.includes(flag)) {
      this.progress.globalFlags.push(flag);
      this.saveProgress();
    }
  }

  /**
   * Check if a character is unlocked
   */
  public isCharacterUnlocked(characterId: string): boolean {
    return this.progress.unlockedCharacters.includes(characterId);
  }

  /**
   * Get completion percentage
   */
  public getCompletionPercentage(): number {
    const totalChapters = 54; // 9 books × 6 chapters each
    return Math.round((this.progress.completedChapters.length / totalChapters) * 100);
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem('legends-of-kai-jax-story-progress', JSON.stringify(this.progress));
      console.log('💾 Story progress saved');
    } catch (error) {
      console.error('Failed to save story progress:', error);
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): StoryProgress {
    try {
      const saved = localStorage.getItem('legends-of-kai-jax-story-progress');
      if (saved) {
        const progress = JSON.parse(saved);
        console.log('📖 Story progress loaded:', progress);
        return progress;
      }
    } catch (error) {
      console.error('Failed to load story progress:', error);
    }

    // Return new game progress if no save found
    return this.initializeNewGame();
  }

  /**
   * Reset story progress (for testing)
   */
  public resetProgress(): void {
    this.progress = this.initializeNewGame();
    console.log('🔄 Story progress reset');
  }

  /**
   * Get story node for current chapter
   */
  public getCurrentStoryNode(): StoryNode | null {
    return this.sagaEngine.getNode(`book${this.progress.currentBook}-ch${this.progress.currentChapter}`);
  }

  /**
   * Start a chapter (triggers pre-fight story)
   */
  public startChapter(bookId: BookId, chapterId: number): {
    dialogue: string[];
    opponent: string;
    storyNode: StoryNode | null;
  } {
    const node = this.sagaEngine.getNode(`book${bookId}-ch${chapterId}`);
    
    if (!node) {
      return {
        dialogue: [`Chapter ${chapterId} - Begin!`],
        opponent: 'training-dummy',
        storyNode: null,
      };
    }

    // Get dialogue from dialogue system
    const dialogue = node.dialogueLines.length > 0 
      ? node.dialogueLines 
      : [`Chapter ${chapterId}: ${node.title}`];

    // Determine opponent (from node or default)
    const opponent = node.environmentState?.opponent || 'training-dummy';

    return { dialogue, opponent, storyNode: node };
  }
}

export default StoryProgressManager;
