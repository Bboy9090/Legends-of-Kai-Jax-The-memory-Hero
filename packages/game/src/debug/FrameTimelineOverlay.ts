/**
 * OMEGA PROTOCOL: FRAME TIMELINE OVERLAY
 * 
 * Per-entity debug strip showing:
 * - Current phase (startup/active/recovery/hitstun)
 * - Frames remaining in current state
 * - Cancel flags (what can be cancelled into)
 * - Invincibility frames (i-frames)
 * - Armor frames
 * - Hit-stop visualization (freezes timeline while rendering continues)
 * 
 * "The prototype can no longer lie about how it feels."
 * "Frame data is visible. Cancels are accountable. Speed has consequences."
 */

export interface EntityTimelineData {
  entityId: string;
  entityName: string;
  phase: CombatPhase;
  framesRemaining: number;
  totalFrames: number;
  cancelFlags: CancelFlag[];
  iFrames: number;
  armorFrames: number;
  currentMove?: string;
  hitStopActive: boolean;
  hitStopRemaining: number;
  comboCount: number;
  damagePercent: number;
  trinityState?: {
    synergy: number;
    resonance: number;
    dread: number;
  };
}

export type CombatPhase = 'idle' | 'startup' | 'active' | 'recovery' | 'hitstun' | 'blockstun' | 'tumble' | 'ledge';

export interface CancelFlag {
  type: 'dash' | 'jump' | 'special' | 'dodge' | 'attack' | 'any';
  condition: 'on_hit' | 'on_whiff' | 'always' | 'never';
  enabled: boolean;
}

export interface FrameTimelineConfig {
  enabled: boolean;
  showPhase: boolean;
  showFrameData: boolean;
  showCancelFlags: boolean;
  showIFrames: boolean;
  showArmor: boolean;
  showHitStop: boolean;
  showTrinity: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  scale: number;
  opacity: number;
}

export const DEFAULT_TIMELINE_CONFIG: FrameTimelineConfig = {
  enabled: true,
  showPhase: true,
  showFrameData: true,
  showCancelFlags: true,
  showIFrames: true,
  showArmor: true,
  showHitStop: true,
  showTrinity: true,
  position: 'top',
  scale: 1.0,
  opacity: 0.85,
};

export class FrameTimelineOverlay {
  private config: FrameTimelineConfig;
  private entityData: Map<string, EntityTimelineData> = new Map();
  private frameHistory: Map<string, PhaseHistoryEntry[]> = new Map();
  private readonly HISTORY_LENGTH = 60; // 1 second at 60fps
  
  constructor(config: Partial<FrameTimelineConfig> = {}) {
    this.config = { ...DEFAULT_TIMELINE_CONFIG, ...config };
  }
  
  /**
   * Update entity timeline data (call every frame)
   */
  updateEntity(data: EntityTimelineData): void {
    this.entityData.set(data.entityId, data);
    
    // Update frame history
    let history = this.frameHistory.get(data.entityId);
    if (!history) {
      history = [];
      this.frameHistory.set(data.entityId, history);
    }
    
    history.push({
      phase: data.phase,
      frame: data.totalFrames - data.framesRemaining,
      hitStopActive: data.hitStopActive,
      iFrameActive: data.iFrames > 0,
      armorActive: data.armorFrames > 0,
    });
    
    if (history.length > this.HISTORY_LENGTH) {
      history.shift();
    }
  }
  
  /**
   * Remove entity from overlay
   */
  removeEntity(entityId: string): void {
    this.entityData.delete(entityId);
    this.frameHistory.delete(entityId);
  }
  
  /**
   * Generate render data for overlay
   */
  getRenderData(): TimelineRenderData[] {
    if (!this.config.enabled) return [];
    
    const renderData: TimelineRenderData[] = [];
    
    for (const [entityId, data] of this.entityData) {
      const history = this.frameHistory.get(entityId) ?? [];
      
      renderData.push({
        entityId,
        entityName: data.entityName,
        position: this.getEntityPosition(entityId),
        
        // Phase display
        phase: this.config.showPhase ? {
          current: data.phase,
          color: this.getPhaseColor(data.phase),
          label: this.getPhaseLabel(data.phase),
        } : undefined,
        
        // Frame data
        frameData: this.config.showFrameData ? {
          current: data.totalFrames - data.framesRemaining,
          total: data.totalFrames,
          remaining: data.framesRemaining,
          moveName: data.currentMove,
          percentage: ((data.totalFrames - data.framesRemaining) / data.totalFrames) * 100,
        } : undefined,
        
        // Cancel flags
        cancelFlags: this.config.showCancelFlags ? data.cancelFlags : undefined,
        
        // I-frames
        iFrames: this.config.showIFrames ? {
          active: data.iFrames > 0,
          remaining: data.iFrames,
        } : undefined,
        
        // Armor
        armor: this.config.showArmor ? {
          active: data.armorFrames > 0,
          remaining: data.armorFrames,
        } : undefined,
        
        // Hit-stop
        hitStop: this.config.showHitStop ? {
          active: data.hitStopActive,
          remaining: data.hitStopRemaining,
        } : undefined,
        
        // Trinity meters
        trinity: this.config.showTrinity ? data.trinityState : undefined,
        
        // Frame history for timeline strip
        history: history.map(h => ({
          phase: h.phase,
          color: this.getPhaseColor(h.phase),
          iFrame: h.iFrameActive,
          armor: h.armorActive,
          hitStop: h.hitStopActive,
        })),
        
        // Combat state
        comboCount: data.comboCount,
        damagePercent: data.damagePercent,
        
        // Styling
        opacity: this.config.opacity,
        scale: this.config.scale,
      });
    }
    
    return renderData;
  }
  
  /**
   * Get phase color for visualization
   */
  private getPhaseColor(phase: CombatPhase): string {
    switch (phase) {
      case 'idle': return '#4A90E2';      // Blue - neutral
      case 'startup': return '#F5A623';   // Orange - warning, commitment
      case 'active': return '#7ED321';    // Green - hitting
      case 'recovery': return '#D0021B';  // Red - vulnerable
      case 'hitstun': return '#9013FE';   // Purple - damaged
      case 'blockstun': return '#50E3C2'; // Cyan - defending
      case 'tumble': return '#BD10E0';    // Magenta - launched
      case 'ledge': return '#B8E986';     // Light green - ledge
      default: return '#888888';
    }
  }
  
  /**
   * Get phase label for display
   */
  private getPhaseLabel(phase: CombatPhase): string {
    switch (phase) {
      case 'idle': return 'IDLE';
      case 'startup': return 'STARTUP';
      case 'active': return 'ACTIVE';
      case 'recovery': return 'RECOVERY';
      case 'hitstun': return 'HITSTUN';
      case 'blockstun': return 'BLOCKSTUN';
      case 'tumble': return 'TUMBLE';
      case 'ledge': return 'LEDGE';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Get entity screen position (placeholder - would integrate with camera)
   */
  private getEntityPosition(entityId: string): { x: number; y: number } {
    // This would be replaced with actual screen position from camera system
    const index = Array.from(this.entityData.keys()).indexOf(entityId);
    return {
      x: 100,
      y: 50 + index * 80,
    };
  }
  
  /**
   * Toggle overlay visibility
   */
  toggle(): void {
    this.config.enabled = !this.config.enabled;
  }
  
  /**
   * Update config
   */
  setConfig(config: Partial<FrameTimelineConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current config
   */
  getConfig(): FrameTimelineConfig {
    return { ...this.config };
  }
  
  /**
   * Clear all data
   */
  clear(): void {
    this.entityData.clear();
    this.frameHistory.clear();
  }
}

interface PhaseHistoryEntry {
  phase: CombatPhase;
  frame: number;
  hitStopActive: boolean;
  iFrameActive: boolean;
  armorActive: boolean;
}

export interface TimelineRenderData {
  entityId: string;
  entityName: string;
  position: { x: number; y: number };
  
  phase?: {
    current: CombatPhase;
    color: string;
    label: string;
  };
  
  frameData?: {
    current: number;
    total: number;
    remaining: number;
    moveName?: string;
    percentage: number;
  };
  
  cancelFlags?: CancelFlag[];
  
  iFrames?: {
    active: boolean;
    remaining: number;
  };
  
  armor?: {
    active: boolean;
    remaining: number;
  };
  
  hitStop?: {
    active: boolean;
    remaining: number;
  };
  
  trinity?: {
    synergy: number;
    resonance: number;
    dread: number;
  };
  
  history: Array<{
    phase: CombatPhase;
    color: string;
    iFrame: boolean;
    armor: boolean;
    hitStop: boolean;
  }>;
  
  comboCount: number;
  damagePercent: number;
  opacity: number;
  scale: number;
}

/**
 * React component helper - generates CSS for timeline strip
 */
export function generateTimelineCSS(data: TimelineRenderData): Record<string, string | number> {
  return {
    position: 'absolute',
    left: data.position.x,
    top: data.position.y,
    opacity: data.opacity,
    transform: `scale(${data.scale})`,
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#FFFFFF',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
    zIndex: 9999,
  };
}
