/**
 * THE AETERNA COVENANT - AURA ENGINE
 * 
 * The Dread System. Tension builds as enemies approach.
 * At 80%+, the screen glitches. The void is near.
 * 
 * Resonance Formula: R_p = (A_g × W_l) + M_a
 *   R_p = Resonance Power
 *   A_g = Aggression (player actions)
 *   W_l = Will Level (determination)
 *   M_a = Memory Accumulation (story progress)
 */

import { bus } from './EventBus';
import { Events } from './EventBus';

export interface AuraState {
  dreadLevel: number;      // 0-100, tension meter
  resonance: number;       // 0-100, power level
  willLevel: number;       // 0-100, determination
  memoryAccumulation: number; // Story progress multiplier
}

export class AuraEngine {
  private state: AuraState = {
    dreadLevel: 0,
    resonance: 0,
    willLevel: 50, // Start at neutral
    memoryAccumulation: 0
  };

  private readonly maxDread: number = 100;
  private readonly maxResonance: number = 100;
  private readonly glitchThreshold: number = 80;
  private readonly decayRate: number = 0.5; // Dread decays when safe
  private readonly buildRate: number = 2.0;  // Dread builds when threatened

  /**
   * Update aura system (call every frame)
   */
  update(deltaTime: number, enemyProximity: number, playerActions: number = 0): void {
    // Update Dread based on enemy proximity
    if (enemyProximity > 200) {
      // Safe distance - dread decays
      this.state.dreadLevel = Math.max(0, this.state.dreadLevel - this.decayRate * deltaTime * 60);
    } else {
      // Close proximity - dread builds
      this.state.dreadLevel = Math.min(
        this.maxDread, 
        this.state.dreadLevel + this.buildRate * deltaTime * 60
      );
    }

    // Calculate Resonance: R_p = (A_g × W_l) + M_a
    const aggression = playerActions * 0.1; // Scale player actions
    const resonancePower = (aggression * this.state.willLevel) + this.state.memoryAccumulation;
    this.state.resonance = Math.min(this.maxResonance, Math.max(0, resonancePower));

    // Check for glitch threshold
    if (this.state.dreadLevel >= this.glitchThreshold) {
      bus.emit(Events.VFX_GLITCH_INTENSE, { 
        intensity: (this.state.dreadLevel - this.glitchThreshold) / (this.maxDread - this.glitchThreshold)
      });
    }

    // Emit updates
    bus.emit(Events.DREAD_UPDATE, { 
      dreadLevel: this.state.dreadLevel,
      resonance: this.state.resonance 
    });
    
    bus.emit(Events.UI_UPDATE_DREAD, this.state.dreadLevel);
    bus.emit(Events.UI_UPDATE_RESONANCE, this.state.resonance);
  }

  /**
   * Add will (determination boost)
   */
  addWill(amount: number): void {
    this.state.willLevel = Math.min(100, this.state.willLevel + amount);
  }

  /**
   * Reduce will (despair)
   */
  reduceWill(amount: number): void {
    this.state.willLevel = Math.max(0, this.state.willLevel - amount);
  }

  /**
   * Add memory accumulation (story progress)
   */
  addMemory(amount: number): void {
    this.state.memoryAccumulation = Math.min(100, this.state.memoryAccumulation + amount);
  }

  /**
   * Get current dread level
   */
  getDreadLevel(): number {
    return this.state.dreadLevel;
  }

  /**
   * Get current resonance
   */
  getResonance(): number {
    return this.state.resonance;
  }

  /**
   * Get full aura state
   */
  getState(): AuraState {
    return { ...this.state };
  }

  /**
   * Reset aura state
   */
  reset(): void {
    this.state = {
      dreadLevel: 0,
      resonance: 0,
      willLevel: 50,
      memoryAccumulation: 0
    };
  }

  /**
   * Set dread level directly (for boss encounters)
   */
  setDreadLevel(level: number): void {
    this.state.dreadLevel = Math.max(0, Math.min(this.maxDread, level));
    bus.emit(Events.UI_UPDATE_DREAD, this.state.dreadLevel);
  }

  /**
   * Set resonance directly
   */
  setResonance(level: number): void {
    this.state.resonance = Math.max(0, Math.min(this.maxResonance, level));
    bus.emit(Events.UI_UPDATE_RESONANCE, this.state.resonance);
  }
}

// Singleton instance
export const auraEngine = new AuraEngine();
