/**
 * THE AETERNA COVENANT - EVENT BUS
 * 
 * The Communications Hub. All game-wide signals flow through here.
 * Decoupled architecture prevents memory leaks and spaghetti code.
 * 
 * Usage:
 *   bus.on('PLAYER_HIT', (data) => { ... });
 *   bus.emit('PLAYER_HIT', { damage: 10 });
 */

type Callback = (data?: any) => void;

class EventBus {
  private events: { [key: string]: Callback[] } = {};

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Callback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Callback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Remove all listeners for an event
   */
  clear(event: string): void {
    if (this.events[event]) {
      delete this.events[event];
    }
  }

  /**
   * Remove all listeners
   */
  clearAll(): void {
    this.events = {};
  }
}

// Singleton instance - THE ONE TRUE BUS
export const bus = new EventBus();

// Event name constants for type safety
export const Events = {
  // Combat
  PLAYER_HIT: 'PLAYER_HIT',
  PLAYER_ATTACK: 'PLAYER_ATTACK',
  ENEMY_HIT: 'ENEMY_HIT',
  BOSS_PHASE_CHANGE: 'BOSS_PHASE_CHANGE',
  
  // Physics
  PLAYER_GROUNDED: 'PLAYER_GROUNDED',
  PLAYER_JUMP: 'PLAYER_JUMP',
  COLLISION_DETECTED: 'COLLISION_DETECTED',
  
  // Resonance & Transformation
  RESONANCE_CHANGE: 'RESONANCE_CHANGE',
  TRANSFORMATION_TRIGGER: 'TRANSFORMATION_TRIGGER',
  TRANSFORMATION_END: 'TRANSFORMATION_END',
  
  // Dread & Aura
  DREAD_UPDATE: 'DREAD_UPDATE',
  UI_UPDATE_DREAD: 'UI_UPDATE_DREAD',
  VFX_GLITCH_INTENSE: 'VFX_GLITCH_INTENSE',
  
  // Save System
  SAVE_CHECKPOINT: 'SAVE_CHECKPOINT',
  LOAD_CHECKPOINT: 'LOAD_CHECKPOINT',
  
  // Arena
  HAZARD_SPAWN: 'HAZARD_SPAWN',
  RIFT_BUBBLE: 'RIFT_BUBBLE',
  CRACK_LANE: 'CRACK_LANE',
  
  // UI
  UI_UPDATE_HP: 'UI_UPDATE_HP',
  UI_UPDATE_RESONANCE: 'UI_UPDATE_RESONANCE',
  UI_SHOW_DIALOGUE: 'UI_SHOW_DIALOGUE',
  
  // Mission
  CHAPTER_START: 'CHAPTER_START',
  CHAPTER_COMPLETE: 'CHAPTER_COMPLETE',
  CHECKPOINT_REACHED: 'CHECKPOINT_REACHED',
} as const;
