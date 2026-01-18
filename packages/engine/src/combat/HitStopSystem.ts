/**
 * OMEGA PROTOCOL: HIT-STOP & SHAKE SYSTEM
 * 
 * Frame-perfect feel systems tied to combat events:
 * - Hit-stop: Freezes game logic while rendering continues
 * - Camera shake: Intensity-based shake with decay
 * - Screen punch: Directional camera displacement
 * 
 * "Combat Crunch: Use Dynamic Hit-Stop. When a Legendary Blow lands,
 * the game freezes for exactly 0.08 seconds, the screen desaturates,
 * and a shockwave ripples through the environment."
 */

export interface HitStopEvent {
  id: string;
  durationMs: number;
  intensity: number; // 0-1, affects related effects
  source: HitStopSource;
  timestamp: number;
}

export type HitStopSource = 
  | 'light_attack'
  | 'heavy_attack'
  | 'launcher'
  | 'super'
  | 'parry'
  | 'phase_break'
  | 'transformation';

export interface ShakeEvent {
  id: string;
  amplitude: number;
  frequency: number;
  decay: number;
  direction?: { x: number; y: number }; // For directional shake
  remainingMs: number;
}

export interface ScreenPunch {
  direction: { x: number; y: number };
  magnitude: number;
  returnSpeed: number;
  currentOffset: { x: number; y: number };
}

export class HitStopSystem {
  private remainingMs: number = 0;
  private currentIntensity: number = 0;
  private activeEvents: HitStopEvent[] = [];
  private framesFrozen: number = 0;
  
  // Tuning parameters
  private readonly BASE_HITSTOP_LIGHT = 50;  // 3 frames at 60fps
  private readonly BASE_HITSTOP_HEAVY = 80;  // 5 frames at 60fps (0.08s as specified)
  private readonly BASE_HITSTOP_LAUNCHER = 100; // 6 frames
  private readonly BASE_HITSTOP_SUPER = 150; // 9 frames
  private readonly BASE_HITSTOP_PARRY = 120; // 7 frames
  
  /**
   * Add hit-stop effect
   */
  add(ms: number, intensity: number = 1.0, source: HitStopSource = 'light_attack'): void {
    // Take the maximum of current remaining and new hit-stop
    this.remainingMs = Math.max(this.remainingMs, ms);
    this.currentIntensity = Math.max(this.currentIntensity, intensity);
    
    this.activeEvents.push({
      id: `hitstop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      durationMs: ms,
      intensity,
      source,
      timestamp: performance.now(),
    });
  }
  
  /**
   * Add hit-stop based on damage and attack type
   */
  addFromDamage(damage: number, isLauncher: boolean = false, isSuper: boolean = false): void {
    let baseMs: number;
    let source: HitStopSource;
    
    if (isSuper) {
      baseMs = this.BASE_HITSTOP_SUPER;
      source = 'super';
    } else if (isLauncher) {
      baseMs = this.BASE_HITSTOP_LAUNCHER;
      source = 'launcher';
    } else if (damage >= 20) {
      baseMs = this.BASE_HITSTOP_HEAVY;
      source = 'heavy_attack';
    } else {
      baseMs = this.BASE_HITSTOP_LIGHT;
      source = 'light_attack';
    }
    
    // Scale by damage
    const damageScale = Math.min(damage / 30, 1.5);
    const finalMs = baseMs * damageScale;
    const intensity = Math.min(damage / 50, 1.0);
    
    this.add(finalMs, intensity, source);
  }
  
  /**
   * Add parry hit-stop
   */
  addParry(): void {
    this.add(this.BASE_HITSTOP_PARRY, 0.9, 'parry');
  }
  
  /**
   * Add phase break hit-stop (boss transitions)
   */
  addPhaseBreak(): void {
    this.add(500, 1.0, 'phase_break'); // 30 frames - dramatic pause
  }
  
  /**
   * Add transformation hit-stop
   */
  addTransformation(): void {
    this.add(300, 1.0, 'transformation'); // 18 frames
  }
  
  /**
   * Tick the system - call every frame
   * Returns true if game logic should be frozen
   */
  tick(dtMs: number): boolean {
    if (this.remainingMs > 0) {
      this.remainingMs = Math.max(0, this.remainingMs - dtMs);
      this.framesFrozen++;
      
      if (this.remainingMs <= 0) {
        this.currentIntensity = 0;
        this.framesFrozen = 0;
        this.activeEvents = [];
      }
      
      return true; // Freeze game logic
    }
    
    return false;
  }
  
  /**
   * Check if currently in hit-stop
   */
  isActive(): boolean {
    return this.remainingMs > 0;
  }
  
  /**
   * Get remaining milliseconds
   */
  getMs(): number {
    return this.remainingMs;
  }
  
  /**
   * Get current intensity (for visual effects)
   */
  getIntensity(): number {
    return this.currentIntensity;
  }
  
  /**
   * Get frames frozen count
   */
  getFramesFrozen(): number {
    return this.framesFrozen;
  }
  
  /**
   * Get active events for debugging
   */
  getActiveEvents(): HitStopEvent[] {
    return [...this.activeEvents];
  }
  
  /**
   * Reset the system
   */
  reset(): void {
    this.remainingMs = 0;
    this.currentIntensity = 0;
    this.framesFrozen = 0;
    this.activeEvents = [];
  }
}

export class CameraShake {
  private amplitude: number = 0;
  private frequency: number = 10;
  private decay: number = 6;
  private shakeEvents: ShakeEvent[] = [];
  private currentOffset: { x: number; y: number } = { x: 0, y: 0 };
  private phase: number = 0;
  
  // Screen punch
  private activePunch: ScreenPunch | null = null;
  
  /**
   * Trigger a shake pulse
   */
  pulse(amplitude: number, frequency: number = 10, decay: number = 6): void {
    // Stack with current shake
    this.amplitude = Math.max(this.amplitude, amplitude);
    this.frequency = frequency;
    this.decay = decay;
    
    this.shakeEvents.push({
      id: `shake_${Date.now()}`,
      amplitude,
      frequency,
      decay,
      remainingMs: 1000, // Max 1 second shake
    });
  }
  
  /**
   * Trigger directional shake (from knockback direction)
   */
  pulseDirectional(
    amplitude: number,
    direction: { x: number; y: number },
    frequency: number = 12,
    decay: number = 8
  ): void {
    this.pulse(amplitude, frequency, decay);
    
    // Add directional bias
    if (this.shakeEvents.length > 0) {
      const latestEvent = this.shakeEvents[this.shakeEvents.length - 1];
      if (latestEvent) {
        latestEvent.direction = { ...direction };
      }
    }
  }
  
  /**
   * Trigger screen punch (camera displacement that returns)
   */
  punch(direction: { x: number; y: number }, magnitude: number): void {
    // Normalize direction
    const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalized = len > 0 
      ? { x: direction.x / len, y: direction.y / len }
      : { x: 0, y: -1 };
    
    this.activePunch = {
      direction: normalized,
      magnitude,
      returnSpeed: 0.15,
      currentOffset: {
        x: normalized.x * magnitude,
        y: normalized.y * magnitude,
      },
    };
  }
  
  /**
   * Update shake state
   */
  tick(dtSeconds: number): void {
    // Update phase
    this.phase += dtSeconds * this.frequency * Math.PI * 2;
    
    // Decay amplitude
    this.amplitude = Math.max(0, this.amplitude - dtSeconds * this.decay * 0.15);
    
    // Calculate offset
    if (this.amplitude > 0) {
      this.currentOffset = {
        x: Math.sin(this.phase) * this.amplitude,
        y: Math.cos(this.phase * 0.8) * this.amplitude * 0.6,
      };
    } else {
      this.currentOffset = { x: 0, y: 0 };
    }
    
    // Update punch
    if (this.activePunch) {
      // Return to center
      this.activePunch.currentOffset.x *= (1 - this.activePunch.returnSpeed);
      this.activePunch.currentOffset.y *= (1 - this.activePunch.returnSpeed);
      
      // Check if returned
      const punchMag = Math.sqrt(
        this.activePunch.currentOffset.x ** 2 +
        this.activePunch.currentOffset.y ** 2
      );
      
      if (punchMag < 0.1) {
        this.activePunch = null;
      }
    }
    
    // Update shake events
    this.shakeEvents = this.shakeEvents.filter(event => {
      event.remainingMs -= dtSeconds * 1000;
      return event.remainingMs > 0;
    });
  }
  
  /**
   * Get current shake data for rendering
   */
  get(): { amplitude: number; freq: number; decay: number } | null {
    if (this.amplitude <= 0) return null;
    
    return {
      amplitude: this.amplitude,
      freq: this.frequency,
      decay: this.decay,
    };
  }
  
  /**
   * Get current camera offset (shake + punch)
   */
  getOffset(): { x: number; y: number } {
    let x = this.currentOffset.x;
    let y = this.currentOffset.y;
    
    if (this.activePunch) {
      x += this.activePunch.currentOffset.x;
      y += this.activePunch.currentOffset.y;
    }
    
    return { x, y };
  }
  
  /**
   * Check if shake is active
   */
  isActive(): boolean {
    return this.amplitude > 0 || this.activePunch !== null;
  }
  
  /**
   * Reset shake
   */
  reset(): void {
    this.amplitude = 0;
    this.phase = 0;
    this.currentOffset = { x: 0, y: 0 };
    this.activePunch = null;
    this.shakeEvents = [];
  }
}

/**
 * Combined hit-feel system for convenient integration
 */
export class CombatFeelSystem {
  public hitStop: HitStopSystem;
  public cameraShake: CameraShake;
  
  constructor() {
    this.hitStop = new HitStopSystem();
    this.cameraShake = new CameraShake();
  }
  
  /**
   * Process a hit event with all feel effects
   */
  processHit(
    damage: number,
    knockbackAngle: number,
    isLauncher: boolean = false,
    isSuper: boolean = false
  ): void {
    // Hit-stop
    this.hitStop.addFromDamage(damage, isLauncher, isSuper);
    
    // Camera shake (scaled by damage)
    const shakeAmplitude = Math.min(damage * 0.3, 15);
    this.cameraShake.pulse(shakeAmplitude, 12, 8);
    
    // Camera punch for launchers
    if (isLauncher || damage >= 30) {
      const punchDirection = {
        x: Math.cos(knockbackAngle * Math.PI / 180),
        y: Math.sin(knockbackAngle * Math.PI / 180),
      };
      this.cameraShake.punch(punchDirection, damage * 0.2);
    }
  }
  
  /**
   * Process a parry
   */
  processParry(): void {
    this.hitStop.addParry();
    this.cameraShake.pulse(8, 15, 10);
  }
  
  /**
   * Process a phase break (boss transitions)
   */
  processPhaseBreak(): void {
    this.hitStop.addPhaseBreak();
    this.cameraShake.pulse(20, 8, 4);
  }
  
  /**
   * Process transformation
   */
  processTransformation(): void {
    this.hitStop.addTransformation();
    this.cameraShake.pulse(12, 6, 3);
  }
  
  /**
   * Tick both systems
   */
  tick(dtMs: number): { frozen: boolean; shakeOffset: { x: number; y: number } } {
    const frozen = this.hitStop.tick(dtMs);
    this.cameraShake.tick(dtMs / 1000);
    
    return {
      frozen,
      shakeOffset: this.cameraShake.getOffset(),
    };
  }
  
  /**
   * Reset both systems
   */
  reset(): void {
    this.hitStop.reset();
    this.cameraShake.reset();
  }
}
