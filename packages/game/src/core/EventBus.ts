/**
 * EVENT BUS — Global Communication Layer
 * 
 * Purpose: Decoupled event-driven architecture for all game systems
 * Pattern: Singleton pub/sub system
 * 
 * Usage:
 *   eventBus.emit('physics_update', { velocity, position })
 *   eventBus.on('dread_change', (level) => updateUI(level))
 * 
 * Key Events:
 *   - physics_update: KineticEngine position/velocity changes
 *   - combat_state_change: CombatStateMachine state transitions
 *   - dread_change: AuraEngine dread meter updates
 *   - hit_landed: Combat hit detection
 *   - resonance_change: Character power level updates
 *   - match_start, match_end: Match lifecycle
 *   - chapter_complete: Saga Mode progression
 */

export type EventCallback<T = any> = (data: T) => void;

export interface EventMap {
  // Physics Events
  'physics_update': {
    characterId: string;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    isGrounded: boolean;
  };
  'collision_detected': {
    entityA: string;
    entityB: string;
    impactForce: number;
  };
  
  // Combat Events
  'combat_state_change': {
    characterId: string;
    previousState: string;
    currentState: string;
    frameData: number;
  };
  'hit_landed': {
    attackerId: string;
    defenderId: string;
    damage: number;
    knockback: { x: number; y: number };
    hitStop: number;
  };
  'attack_triggered': {
    characterId: string;
    moveId: string;
    telegraphFrames: number;
  };
  
  // Resonance & Dread
  'resonance_change': {
    characterId: string;
    resonance: number; // 0-100
    maxResonance: number;
  };
  'dread_change': {
    dreadLevel: number; // 0-100
    intensity: 'low' | 'medium' | 'high' | 'extreme';
  };
  'legacy_convergence_activated': {
    characterId: string;
    duration: number;
  };
  
  // Match Events
  'match_start': {
    player1: string;
    player2: string;
    stage: string;
  };
  'match_end': {
    winner: string;
    loser: string;
    winMethod: 'knockout' | 'timeout' | 'forfeit';
  };
  'round_start': { roundNumber: number };
  'round_end': { roundNumber: number; winner: string };
  
  // UI Events
  'ui_navigate': {
    from: string;
    to: string;
  };
  'menu_select': {
    menuId: string;
    itemId: string;
  };
  
  // Save/Load Events
  'save_complete': { slot: number; chapterId: string };
  'load_complete': { slot: number; data: any };
  'chapter_unlocked': { chapterId: string };
  'character_unlocked': { characterId: string };
  
  // Boss Events
  'boss_phase_change': {
    bossId: string;
    phase: number;
    hp: number;
  };
  'boss_enraged': { bossId: string };
  
  // VFX Events
  'vfx_spawn': {
    type: 'impact' | 'trail' | 'aura' | 'screen_shake';
    position?: { x: number; y: number };
    intensity: number;
  };
  'screen_shake': { duration: number; intensity: number };
  'chromatic_aberration': { strength: number };
}

class EventBus {
  private static instance: EventBus;
  private events: Map<keyof EventMap, Set<EventCallback>> = new Map();
  private eventHistory: Array<{ event: string; timestamp: number; data: any }> = [];
  private maxHistorySize = 100;

  // Singleton pattern
  private constructor() {
    if (typeof window !== 'undefined') {
      // Expose to window for debugging in development
      (window as any).__eventBus = this;
    }
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  public on<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event (fires once then auto-unsubscribes)
   */
  public once<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): void {
    const wrappedCallback = (data: EventMap[K]) => {
      callback(data);
      this.off(event, wrappedCallback as EventCallback);
    };
    this.on(event, wrappedCallback as EventCallback);
  }

  /**
   * Unsubscribe from an event
   */
  public off<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  public emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void {
    // Store in history for debugging
    this.eventHistory.push({
      event: event as string,
      timestamp: Date.now(),
      data
    });

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify all subscribers
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Clear all event listeners (use sparingly, mainly for cleanup)
   */
  public clear(): void {
    this.events.clear();
  }

  /**
   * Get event history (for debugging)
   */
  public getHistory(eventType?: keyof EventMap): Array<{ event: string; timestamp: number; data: any }> {
    if (eventType) {
      return this.eventHistory.filter(h => h.event === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Get all active listeners (for debugging)
   */
  public getListeners(): Map<keyof EventMap, number> {
    const counts = new Map<keyof EventMap, number>();
    this.events.forEach((callbacks, event) => {
      counts.set(event, callbacks.size);
    });
    return counts;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Export types for external use
export type { EventMap };
