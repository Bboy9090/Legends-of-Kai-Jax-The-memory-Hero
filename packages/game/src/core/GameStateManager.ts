/**
 * GAME STATE MANAGER — Central State Orchestrator
 * 
 * Purpose: Single source of truth for all game state
 * Pattern: Singleton state manager with EventBus integration
 * 
 * Responsibilities:
 * - Listen to all engine events
 * - Maintain current match state
 * - Provide state to UI components
 * - Handle state persistence via SaveManager
 */

import { eventBus, EventMap } from './EventBus';

export enum GameMode {
  MAIN_MENU = 'MAIN_MENU',
  SAGA_MODE = 'SAGA_MODE',
  SOVEREIGNTY_GAUNTLET = 'SOVEREIGNTY_GAUNTLET',
  RESONANCE_SYNC = 'RESONANCE_SYNC',
  CORE_REFINEMENT = 'CORE_REFINEMENT',
  COALITION_WARFARE = 'COALITION_WARFARE',
  IN_MATCH = 'IN_MATCH',
  PAUSED = 'PAUSED',
}

export interface CharacterState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  resonance: number;
  maxResonance: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isGrounded: boolean;
  combatState: string;
  legacyConvergenceActive: boolean;
  wins: number;
}

export interface MatchState {
  player1: CharacterState;
  player2: CharacterState;
  currentRound: number;
  roundTimer: number; // seconds
  stage: string;
  dreadLevel: number;
  isPaused: boolean;
  matchStartTime: number;
}

export interface SagaModeState {
  currentBook: number; // 1-3
  currentChapter: number; // 1-18
  completedChapters: Set<string>;
  unlockedCharacters: Set<string>;
  totalPlayTime: number; // seconds
}

export interface GameState {
  mode: GameMode;
  match: MatchState | null;
  sagaMode: SagaModeState;
  settings: {
    volume: number;
    musicVolume: number;
    sfxVolume: number;
    screenShakeEnabled: boolean;
    dreadEffectsEnabled: boolean;
  };
}

type StateListener = (state: GameState) => void;

class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;
  private listeners: Set<StateListener> = new Set();

  private constructor() {
    // Initialize default state
    this.state = {
      mode: GameMode.MAIN_MENU,
      match: null,
      sagaMode: {
        currentBook: 1,
        currentChapter: 1,
        completedChapters: new Set(),
        unlockedCharacters: new Set(['kai-jax', 'boryx-zenith']), // Starting roster
        totalPlayTime: 0,
      },
      settings: {
        volume: 0.8,
        musicVolume: 0.7,
        sfxVolume: 0.9,
        screenShakeEnabled: true,
        dreadEffectsEnabled: true,
      },
    };

    // Subscribe to EventBus events
    this.subscribeToEvents();
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Subscribe to all relevant EventBus events
   */
  private subscribeToEvents(): void {
    // Physics updates
    eventBus.on('physics_update', (data) => {
      if (this.state.match) {
        const char = data.characterId === 'player1' 
          ? this.state.match.player1 
          : this.state.match.player2;
        
        if (char) {
          char.position = data.position;
          char.velocity = data.velocity;
          char.isGrounded = data.isGrounded;
          this.notifyListeners();
        }
      }
    });

    // Combat state changes
    eventBus.on('combat_state_change', (data) => {
      if (this.state.match) {
        const char = data.characterId === 'player1'
          ? this.state.match.player1
          : this.state.match.player2;
        
        if (char) {
          char.combatState = data.currentState;
          this.notifyListeners();
        }
      }
    });

    // Hit landed
    eventBus.on('hit_landed', (data) => {
      if (this.state.match) {
        const defender = data.defenderId === 'player1'
          ? this.state.match.player1
          : this.state.match.player2;
        
        if (defender) {
          defender.hp = Math.max(0, defender.hp - data.damage);
          this.notifyListeners();

          // Check for knockout
          if (defender.hp === 0) {
            this.handleKnockout(data.attackerId, data.defenderId);
          }
        }
      }
    });

    // Resonance changes
    eventBus.on('resonance_change', (data) => {
      if (this.state.match) {
        const char = data.characterId === 'player1'
          ? this.state.match.player1
          : this.state.match.player2;
        
        if (char) {
          char.resonance = data.resonance;
          char.maxResonance = data.maxResonance;
          this.notifyListeners();
        }
      }
    });

    // Dread meter changes
    eventBus.on('dread_change', (data) => {
      if (this.state.match) {
        this.state.match.dreadLevel = data.dreadLevel;
        this.notifyListeners();
      }
    });

    // Legacy Convergence activation
    eventBus.on('legacy_convergence_activated', (data) => {
      if (this.state.match) {
        const char = data.characterId === 'player1'
          ? this.state.match.player1
          : this.state.match.player2;
        
        if (char) {
          char.legacyConvergenceActive = true;
          this.notifyListeners();

          // Auto-deactivate after duration
          setTimeout(() => {
            char.legacyConvergenceActive = false;
            this.notifyListeners();
          }, data.duration);
        }
      }
    });

    // Match lifecycle
    eventBus.on('match_start', (data) => {
      this.startMatch(data.player1, data.player2, data.stage);
    });

    eventBus.on('match_end', (data) => {
      this.endMatch(data.winner, data.winMethod);
    });
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state (immutable copy)
   */
  public getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Start a new match
   */
  public startMatch(player1Id: string, player2Id: string, stage: string): void {
    this.state.mode = GameMode.IN_MATCH;
    this.state.match = {
      player1: this.createCharacterState(player1Id, 'player1'),
      player2: this.createCharacterState(player2Id, 'player2'),
      currentRound: 1,
      roundTimer: 120, // 2 minutes
      stage,
      dreadLevel: 0,
      isPaused: false,
      matchStartTime: Date.now(),
    };
    this.notifyListeners();
  }

  /**
   * Create initial character state for match
   */
  private createCharacterState(characterId: string, playerId: string): CharacterState {
    return {
      id: playerId,
      name: characterId,
      hp: 100,
      maxHp: 100,
      resonance: 0,
      maxResonance: 100,
      position: playerId === 'player1' ? { x: -200, y: 0 } : { x: 200, y: 0 },
      velocity: { x: 0, y: 0 },
      isGrounded: true,
      combatState: 'IDLE',
      legacyConvergenceActive: false,
      wins: 0,
    };
  }

  /**
   * Handle knockout
   */
  private handleKnockout(winnerId: string, loserId: string): void {
    if (this.state.match) {
      const winner = winnerId === 'player1' 
        ? this.state.match.player1 
        : this.state.match.player2;
      
      winner.wins++;
      
      // Check for match victory (best of 3)
      if (winner.wins >= 2) {
        eventBus.emit('match_end', {
          winner: winnerId,
          loser: loserId,
          winMethod: 'knockout',
        });
      } else {
        // Start next round
        eventBus.emit('round_end', {
          roundNumber: this.state.match.currentRound,
          winner: winnerId,
        });
        
        this.state.match.currentRound++;
        
        // Reset character states for next round
        this.state.match.player1.hp = this.state.match.player1.maxHp;
        this.state.match.player2.hp = this.state.match.player2.maxHp;
        this.state.match.player1.resonance = 0;
        this.state.match.player2.resonance = 0;
        this.state.match.dreadLevel = 0;
        
        eventBus.emit('round_start', { roundNumber: this.state.match.currentRound });
      }
      
      this.notifyListeners();
    }
  }

  /**
   * End current match
   */
  private endMatch(winnerId: string, winMethod: 'knockout' | 'timeout' | 'forfeit'): void {
    console.log(`Match ended: ${winnerId} wins by ${winMethod}`);
    
    // Return to menu after 5 seconds
    setTimeout(() => {
      this.state.mode = GameMode.MAIN_MENU;
      this.state.match = null;
      this.notifyListeners();
    }, 5000);
  }

  /**
   * Navigate to game mode
   */
  public setGameMode(mode: GameMode): void {
    this.state.mode = mode;
    this.notifyListeners();
    
    eventBus.emit('ui_navigate', {
      from: this.state.mode,
      to: mode,
    });
  }

  /**
   * Complete chapter (Saga Mode)
   */
  public completeChapter(bookId: number, chapterId: number): void {
    const chapterKey = `${bookId}-${chapterId}`;
    this.state.sagaMode.completedChapters.add(chapterKey);
    
    eventBus.emit('chapter_unlocked', { chapterId: chapterKey });
    
    // Unlock characters based on progression
    this.unlockCharactersByProgression();
    
    this.notifyListeners();
  }

  /**
   * Unlock characters based on story progression
   */
  private unlockCharactersByProgression(): void {
    const completed = this.state.sagaMode.completedChapters.size;
    
    // Book 1 completion (18 chapters): Unlock Umbra-Flux
    if (completed >= 18) {
      this.unlockCharacter('umbra-flux');
    }
    
    // Book 2 completion (36 chapters): Unlock Sentinel Vox
    if (completed >= 36) {
      this.unlockCharacter('sentinel-vox');
    }
    
    // Book 3 completion (54 chapters): Unlock Lunara Solis & Chronos Sere
    if (completed >= 54) {
      this.unlockCharacter('lunara-solis');
      this.unlockCharacter('chronos-sere');
    }
  }

  /**
   * Unlock a character
   */
  private unlockCharacter(characterId: string): void {
    if (!this.state.sagaMode.unlockedCharacters.has(characterId)) {
      this.state.sagaMode.unlockedCharacters.add(characterId);
      eventBus.emit('character_unlocked', { characterId });
    }
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<GameState['settings']>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notifyListeners();
  }

  /**
   * Pause/Resume match
   */
  public togglePause(): void {
    if (this.state.match) {
      this.state.match.isPaused = !this.state.match.isPaused;
      this.state.mode = this.state.match.isPaused ? GameMode.PAUSED : GameMode.IN_MATCH;
      this.notifyListeners();
    }
  }
}

// Export singleton instance
export const gameStateManager = GameStateManager.getInstance();
