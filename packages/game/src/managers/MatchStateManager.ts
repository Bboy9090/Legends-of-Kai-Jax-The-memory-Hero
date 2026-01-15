// Advanced Match State Manager
// Path: packages/game/src/managers/MatchStateManager.ts

import { EventBus } from '@game/core/EventBus';

interface CharacterState {
  id: string;
  hp: number;
  maxHp: number;
  resonance: number;
  maxResonance: number;
  hitstunFrames: number;
  invincibilityFrames: number;
}

interface MatchState {
  status: 'starting' | 'active' | 'paused' | 'ended';
  timeRemaining: number;
  totalTime: number;
  p1: CharacterState;
  p2: CharacterState;
  winner: string | null;
  winReason: string | null;
}

/**
 * Advanced match state manager
 * Tracks game state, character stats, and match progression
 */
export class MatchStateManager {
  private matchState: MatchState;
  private eventBus: EventBus;
  private frameCount = 0;
  private statsHistory: MatchState[] = [];

  constructor(
    p1Id: string,
    p2Id: string,
    matchDuration: number,
    eventBus: EventBus
  ) {
    this.eventBus = eventBus;
    this.matchState = {
      status: 'starting',
      timeRemaining: matchDuration,
      totalTime: matchDuration,
      p1: {
        id: p1Id,
        hp: 100,
        maxHp: 100,
        resonance: 0,
        maxResonance: 100,
        hitstunFrames: 0,
        invincibilityFrames: 0,
      },
      p2: {
        id: p2Id,
        hp: 100,
        maxHp: 100,
        resonance: 0,
        maxResonance: 100,
        hitstunFrames: 0,
        invincibilityFrames: 0,
      },
      winner: null,
      winReason: null,
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('character:hit', (data: any) => {
      const isP1Hit = data.defenderId === this.matchState.p1.id;
      const defender = isP1Hit ? this.matchState.p1 : this.matchState.p2;

      // Apply damage
      defender.hp = Math.max(0, defender.hp - data.damage);

      // Apply hitstun
      defender.hitstunFrames = Math.max(0, 15 + Math.floor(data.damage / 10));

      // Apply invincibility frames (prevent repeated hits)
      defender.invincibilityFrames = 8;

      // Gain resonance
      defender.resonance = Math.min(
        defender.maxResonance,
        defender.resonance + data.damage * 0.5
      );

      this.eventBus.emit('match:character_damage', {
        characterId: data.defenderId,
        damage: data.damage,
        hpRemaining: defender.hp,
      });

      // Check for KO
      if (defender.hp <= 0) {
        this.endMatch(
          isP1Hit ? this.matchState.p2.id : this.matchState.p1.id,
          'KO'
        );
      }
    });

    this.eventBus.subscribe('character:resonance_gain', (data: any) => {
      const character = data.characterId === this.matchState.p1.id 
        ? this.matchState.p1 
        : this.matchState.p2;
      character.resonance = Math.min(
        character.maxResonance,
        character.resonance + data.amount
      );
    });

    this.eventBus.subscribe('match:start', () => {
      this.matchState.status = 'active';
      this.frameCount = 0;
    });
  }

  /**
   * Update match state
   */
  public update(deltaTime: number): void {
    this.frameCount++;

    if (this.matchState.status !== 'active') return;

    // Update timers
    this.matchState.timeRemaining -= deltaTime;
    if (this.matchState.timeRemaining <= 0) {
      this.endMatch(this.determineWinnerByHP(), 'Time Limit');
    }

    // Decay resonance over time
    const resonanceDecay = 0.5 * deltaTime; // Per second
    this.matchState.p1.resonance = Math.max(0, this.matchState.p1.resonance - resonanceDecay);
    this.matchState.p2.resonance = Math.max(0, this.matchState.p2.resonance - resonanceDecay);

    // Update invincibility frames
    this.matchState.p1.invincibilityFrames = Math.max(0, this.matchState.p1.invincibilityFrames - 1);
    this.matchState.p2.invincibilityFrames = Math.max(0, this.matchState.p2.invincibilityFrames - 1);

    // Update hitstun
    this.matchState.p1.hitstunFrames = Math.max(0, this.matchState.p1.hitstunFrames - 1);
    this.matchState.p2.hitstunFrames = Math.max(0, this.matchState.p2.hitstunFrames - 1);

    // Record history every 30 frames (0.5s at 60fps)
    if (this.frameCount % 30 === 0) {
      this.statsHistory.push(JSON.parse(JSON.stringify(this.matchState)));
      if (this.statsHistory.length > 3600) { // Keep last 60 seconds
        this.statsHistory.shift();
      }
    }
  }

  /**
   * Determine winner by HP
   */
  private determineWinnerByHP(): string {
    if (this.matchState.p1.hp > this.matchState.p2.hp) {
      return this.matchState.p1.id;
    } else if (this.matchState.p2.hp > this.matchState.p1.hp) {
      return this.matchState.p2.id;
    } else {
      // Tiebreaker: Resonance
      if (this.matchState.p1.resonance > this.matchState.p2.resonance) {
        return this.matchState.p1.id;
      } else if (this.matchState.p2.resonance > this.matchState.p1.resonance) {
        return this.matchState.p2.id;
      } else {
        return this.matchState.p1.id; // P1 wins ties
      }
    }
  }

  /**
   * End match with a winner
   */
  private endMatch(winnerId: string, reason: string): void {
    if (this.matchState.status === 'ended') return;

    this.matchState.status = 'ended';
    this.matchState.winner = winnerId;
    this.matchState.winReason = reason;

    this.eventBus.emit('match:ended', {
      winnerId,
      reason,
      p1State: this.matchState.p1,
      p2State: this.matchState.p2,
    });
  }

  /**
   * Get current match state
   */
  public getState(): MatchState {
    return JSON.parse(JSON.stringify(this.matchState));
  }

  /**
   * Get character state
   */
  public getCharacterState(characterId: string): CharacterState | null {
    if (characterId === this.matchState.p1.id) {
      return this.matchState.p1;
    } else if (characterId === this.matchState.p2.id) {
      return this.matchState.p2;
    }
    return null;
  }

  /**
   * Check if character is in invincibility period
   */
  public isInvincible(characterId: string): boolean {
    const character = this.getCharacterState(characterId);
    return character ? character.invincibilityFrames > 0 : false;
  }

  /**
   * Get match stats
   */
  public getMatchStats() {
    return {
      timeElapsed: this.matchState.totalTime - this.matchState.timeRemaining,
      timeRemaining: this.matchState.timeRemaining,
      p1HP: this.matchState.p1.hp,
      p1Resonance: this.matchState.p1.resonance,
      p2HP: this.matchState.p2.hp,
      p2Resonance: this.matchState.p2.resonance,
      winner: this.matchState.winner,
      status: this.matchState.status,
    };
  }

  /**
   * Get stats history for graph/chart
   */
  public getStatsHistory() {
    return this.statsHistory;
  }

  /**
   * Pause/resume match
   */
  public setPaused(paused: boolean): void {
    this.matchState.status = paused ? 'paused' : 'active';
    this.eventBus.emit('match:pause_state', { paused });
  }

  /**
   * Reset match
   */
  public reset(): void {
    this.matchState.status = 'starting';
    this.matchState.p1.hp = this.matchState.p1.maxHp;
    this.matchState.p1.resonance = 0;
    this.matchState.p1.hitstunFrames = 0;
    this.matchState.p1.invincibilityFrames = 0;
    this.matchState.p2.hp = this.matchState.p2.maxHp;
    this.matchState.p2.resonance = 0;
    this.matchState.p2.hitstunFrames = 0;
    this.matchState.p2.invincibilityFrames = 0;
    this.matchState.winner = null;
    this.matchState.winReason = null;
    this.matchState.timeRemaining = this.matchState.totalTime;
    this.frameCount = 0;
    this.statsHistory = [];
  }
}
