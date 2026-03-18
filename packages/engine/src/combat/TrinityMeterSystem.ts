/**
 * OMEGA PROTOCOL: TRINITY METER SYSTEM
 * 
 * The three-fold combat resource system that drives emotional and mechanical depth:
 * - SYNERGY: Builds through aggressive play, combo extension, team coordination
 * - RESONANCE: Builds through defensive excellence, parries, reads, and perfect blocks
 * - DREAD: Builds passively as match progresses, accelerates on phase breaks and near-death
 * 
 * These meters drive:
 * - Post-processing effects (blur, desaturation, chromatic aberration)
 * - Combat modifiers (knockback bias, damage scaling)
 * - Transformation availability
 * - Ultimate abilities
 */

export interface TrinityMeter {
  synergy: number;    // 0-100: Offensive momentum
  resonance: number;  // 0-100: Defensive mastery
  dread: number;      // 0-100: Match tension/desperation
}

export interface TrinityConfig {
  // Synergy gain rates
  synergyOnHit: number;
  synergyOnCombo: number;
  synergyOnTeamCombo: number;
  synergyDecayRate: number;
  
  // Resonance gain rates
  resonanceOnParry: number;
  resonanceOnPerfectBlock: number;
  resonanceOnCounter: number;
  resonanceDecayRate: number;
  
  // Dread mechanics
  dreadPassiveGain: number;
  dreadOnPhaseBreak: number;
  dreadOnLowHealth: number;
  dreadDecayRate: number;
  dreadThreshold: number; // When effects become intense
}

export const DEFAULT_TRINITY_CONFIG: TrinityConfig = {
  // Synergy
  synergyOnHit: 3,
  synergyOnCombo: 5,
  synergyOnTeamCombo: 8,
  synergyDecayRate: 0.5, // Per second
  
  // Resonance
  resonanceOnParry: 10,
  resonanceOnPerfectBlock: 6,
  resonanceOnCounter: 15,
  resonanceDecayRate: 0.3,
  
  // Dread
  dreadPassiveGain: 0.2,
  dreadOnPhaseBreak: 20,
  dreadOnLowHealth: 0.5,
  dreadDecayRate: 0.6,
  dreadThreshold: 80,
};

export type TrinityEvent = 
  | 'hit'
  | 'combo'
  | 'team_combo'
  | 'parry'
  | 'perfect_block'
  | 'counter'
  | 'phase_break'
  | 'low_health'
  | 'time';

export class TrinityMeterSystem {
  private meters: Map<string, TrinityMeter> = new Map();
  private config: TrinityConfig;
  private eventLog: Array<{ entityId: string; event: TrinityEvent; timestamp: number }> = [];
  
  constructor(config: Partial<TrinityConfig> = {}) {
    this.config = { ...DEFAULT_TRINITY_CONFIG, ...config };
  }
  
  /**
   * Initialize trinity meters for a fighter
   */
  initializeMeter(entityId: string): void {
    this.meters.set(entityId, {
      synergy: 0,
      resonance: 0,
      dread: 0,
    });
  }
  
  /**
   * Get current trinity values
   */
  getMeter(entityId: string): TrinityMeter | null {
    return this.meters.get(entityId) ?? null;
  }
  
  /**
   * Process trinity event - updates meters based on combat events
   */
  processEvent(entityId: string, event: TrinityEvent, deltaTime: number = 0): void {
    const meter = this.meters.get(entityId);
    if (!meter) return;
    
    this.eventLog.push({ entityId, event, timestamp: performance.now() });
    
    switch (event) {
      case 'hit':
        meter.synergy = Math.min(100, meter.synergy + this.config.synergyOnHit);
        break;
        
      case 'combo':
        meter.synergy = Math.min(100, meter.synergy + this.config.synergyOnCombo);
        break;
        
      case 'team_combo':
        meter.synergy = Math.min(100, meter.synergy + this.config.synergyOnTeamCombo);
        break;
        
      case 'parry':
        meter.resonance = Math.min(100, meter.resonance + this.config.resonanceOnParry);
        // Parry log line: "A future collapses."
        break;
        
      case 'perfect_block':
        meter.resonance = Math.min(100, meter.resonance + this.config.resonanceOnPerfectBlock);
        break;
        
      case 'counter':
        meter.resonance = Math.min(100, meter.resonance + this.config.resonanceOnCounter);
        break;
        
      case 'phase_break':
        meter.dread = Math.max(0, Math.min(100, meter.dread + this.config.dreadOnPhaseBreak));
        // Phase break log line: "A truth fails to persist."
        break;
        
      case 'low_health':
        meter.dread = Math.max(0, Math.min(100, meter.dread + this.config.dreadOnLowHealth * deltaTime));
        break;
        
      case 'time':
        // Passive time-based updates
        meter.dread = Math.max(0, Math.min(100, meter.dread + this.config.dreadPassiveGain * deltaTime));
        // Decay synergy and resonance over time
        meter.synergy = Math.max(0, meter.synergy - this.config.synergyDecayRate * deltaTime);
        meter.resonance = Math.max(0, meter.resonance - this.config.resonanceDecayRate * deltaTime);
        break;
    }
  }
  
  /**
   * Update all meters (call every frame)
   */
  update(deltaTime: number): void {
    for (const [entityId, meter] of this.meters) {
      // Passive dread gain
      meter.dread = Math.max(0, Math.min(100, meter.dread + this.config.dreadPassiveGain * deltaTime));
      
      // Decay synergy and resonance
      meter.synergy = Math.max(0, meter.synergy - this.config.synergyDecayRate * deltaTime);
      meter.resonance = Math.max(0, meter.resonance - this.config.resonanceDecayRate * deltaTime);
    }
  }
  
  /**
   * Get post-processing FX parameters based on trinity state
   * These values drive the visual intensity of the game
   */
  getFXParams(entityId: string): TrinityFXParams {
    const meter = this.meters.get(entityId);
    if (!meter) {
      return { blur: 0, desaturation: 0, chromaticAberration: 0, vignette: 0, bloomIntensity: 0 };
    }
    
    const dreadNormalized = meter.dread / 100;
    const resonanceNormalized = meter.resonance / 100;
    const synergyNormalized = meter.synergy / 100;
    
    return {
      // Dread: danger blur and time distortion feel
      blur: dreadNormalized * 0.02,
      
      // Resonance: mastery clarity (slight desaturation for focus)
      desaturation: resonanceNormalized * 0.15,
      
      // Combined: chromatic aberration for intensity
      chromaticAberration: (dreadNormalized * 0.003) + (resonanceNormalized * 0.001),
      
      // High synergy: energetic vignette
      vignette: synergyNormalized * 0.2,
      
      // High resonance + high synergy: bloom
      bloomIntensity: (synergyNormalized + resonanceNormalized) * 0.3,
    };
  }
  
  /**
   * Get combat modifiers based on trinity state
   */
  getCombatModifiers(entityId: string): TrinityCombatModifiers {
    const meter = this.meters.get(entityId);
    if (!meter) {
      return { knockbackBias: 0, damageMultiplier: 1, parryWindowBonus: 0, launchBias: 0 };
    }
    
    return {
      // High resonance: vertical launch bias (as per design spec)
      launchBias: meter.resonance >= 60 ? 1.15 : 1.0,
      
      // High synergy: slight damage boost
      damageMultiplier: 1.0 + (meter.synergy * 0.002),
      
      // High resonance: parry window bonus (+2 frames if >= 80)
      parryWindowBonus: meter.resonance >= 80 ? 2 : 0,
      
      // High dread: knockback instability
      knockbackBias: meter.dread * 0.005,
    };
  }
  
  /**
   * Check if dread threshold exceeded (for visual intensity)
   */
  isDreadCritical(entityId: string): boolean {
    const meter = this.meters.get(entityId);
    return meter ? meter.dread >= this.config.dreadThreshold : false;
  }
  
  /**
   * Check if transformation is available
   */
  canTransform(entityId: string, requiredSynergy: number, requiredResonance: number): boolean {
    const meter = this.meters.get(entityId);
    if (!meter) return false;
    
    return meter.synergy >= requiredSynergy && meter.resonance >= requiredResonance;
  }
  
  /**
   * Consume trinity resources for ultimate/transformation
   */
  consumeTrinity(entityId: string, synergyCost: number, resonanceCost: number): boolean {
    const meter = this.meters.get(entityId);
    if (!meter) return false;
    
    if (meter.synergy >= synergyCost && meter.resonance >= resonanceCost) {
      meter.synergy -= synergyCost;
      meter.resonance -= resonanceCost;
      return true;
    }
    
    return false;
  }
  
  /**
   * Get narrative log based on recent trinity events
   * For story-mechanic alignment
   */
  getNarrativeLog(): string[] {
    const logs: string[] = [];
    const recentEvents = this.eventLog.filter(
      e => performance.now() - e.timestamp < 5000
    );
    
    for (const event of recentEvents) {
      switch (event.event) {
        case 'parry':
          logs.push('A future collapses.');
          break;
        case 'phase_break':
          logs.push('A truth fails to persist.');
          break;
        case 'counter':
          logs.push('The echo is reversed.');
          break;
      }
    }
    
    return logs;
  }
  
  /**
   * Reset meter for entity
   */
  resetMeter(entityId: string): void {
    const meter = this.meters.get(entityId);
    if (meter) {
      meter.synergy = 0;
      meter.resonance = 0;
      meter.dread = 0;
    }
  }
  
  /**
   * Clear all meters
   */
  clear(): void {
    this.meters.clear();
    this.eventLog = [];
  }
}

export interface TrinityFXParams {
  blur: number;
  desaturation: number;
  chromaticAberration: number;
  vignette: number;
  bloomIntensity: number;
}

export interface TrinityCombatModifiers {
  knockbackBias: number;
  damageMultiplier: number;
  parryWindowBonus: number;
  launchBias: number;
}
