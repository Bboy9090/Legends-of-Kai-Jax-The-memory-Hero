/**
 * OMEGA PROTOCOL: POST-FX PIPELINE
 * 
 * Visual effects driven by Trinity meter state:
 * - Blur: Dread-induced radial blur and time smear
 * - Desaturation: Resonance mastery clarity
 * - Chromatic Aberration: Intensity indicator
 * - Vignette: Synergy energy visualization
 * - Bloom: Combined resonance + synergy glow
 * 
 * "Effects are parameter-driven, not hardcoded. Meter math now pays rent."
 * "Dread must finally look like danger."
 */

import { TrinityFXParams } from '../combat/TrinityMeterSystem';

export interface PostFXConfig {
  enabled: boolean;
  
  // Blur settings
  blurEnabled: boolean;
  blurMaxStrength: number;
  blurRadialFocus: { x: number; y: number };
  
  // Desaturation settings
  desaturationEnabled: boolean;
  desaturationMaxStrength: number;
  
  // Chromatic aberration settings
  chromaticEnabled: boolean;
  chromaticMaxOffset: number;
  
  // Vignette settings
  vignetteEnabled: boolean;
  vignetteMaxStrength: number;
  vignetteColor: { r: number; g: number; b: number };
  
  // Bloom settings
  bloomEnabled: boolean;
  bloomMaxIntensity: number;
  bloomThreshold: number;
  
  // Screen flash
  flashEnabled: boolean;
  flashMaxIntensity: number;
  
  // Color grading
  colorGradingEnabled: boolean;
  dreadColorTint: { r: number; g: number; b: number };
  resonanceColorTint: { r: number; g: number; b: number };
  synergyColorTint: { r: number; g: number; b: number };
}

export const DEFAULT_POSTFX_CONFIG: PostFXConfig = {
  enabled: true,
  
  blurEnabled: true,
  blurMaxStrength: 0.05,
  blurRadialFocus: { x: 0.5, y: 0.5 },
  
  desaturationEnabled: true,
  desaturationMaxStrength: 0.4,
  
  chromaticEnabled: true,
  chromaticMaxOffset: 0.01,
  
  vignetteEnabled: true,
  vignetteMaxStrength: 0.6,
  vignetteColor: { r: 0, g: 0, b: 0 },
  
  bloomEnabled: true,
  bloomMaxIntensity: 1.5,
  bloomThreshold: 0.6,
  
  flashEnabled: true,
  flashMaxIntensity: 0.8,
  
  colorGradingEnabled: true,
  dreadColorTint: { r: 0.1, g: 0, b: 0.05 }, // Dark red-purple
  resonanceColorTint: { r: 0, g: 0.02, b: 0.08 }, // Cool blue
  synergyColorTint: { r: 0.08, g: 0.06, b: 0 }, // Warm gold
};

export interface ActiveFXState {
  blur: number;
  blurCenter: { x: number; y: number };
  desaturation: number;
  chromaticAberration: number;
  vignetteStrength: number;
  vignetteColor: { r: number; g: number; b: number };
  bloomIntensity: number;
  flashIntensity: number;
  flashColor: { r: number; g: number; b: number };
  colorTint: { r: number; g: number; b: number };
  timeScale: number; // For time smear effect
}

export class PostFXPipeline {
  private config: PostFXConfig;
  private currentState: ActiveFXState;
  private targetState: ActiveFXState;
  private transitionSpeed: number = 8.0; // Lerp speed
  
  // Flash system
  private flashTimer: number = 0;
  private flashDuration: number = 0;
  private flashPeakIntensity: number = 0;
  private flashPeakColor: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 };
  
  // Pulse effects
  private pulsePhase: number = 0;
  private pulseActive: boolean = false;
  private pulseIntensity: number = 0;
  
  constructor(config: Partial<PostFXConfig> = {}) {
    this.config = { ...DEFAULT_POSTFX_CONFIG, ...config };
    
    this.currentState = this.getDefaultState();
    this.targetState = this.getDefaultState();
  }
  
  private getDefaultState(): ActiveFXState {
    return {
      blur: 0,
      blurCenter: { ...this.config.blurRadialFocus },
      desaturation: 0,
      chromaticAberration: 0,
      vignetteStrength: 0,
      vignetteColor: { ...this.config.vignetteColor },
      bloomIntensity: 0,
      flashIntensity: 0,
      flashColor: { r: 1, g: 1, b: 1 },
      colorTint: { r: 0, g: 0, b: 0 },
      timeScale: 1.0,
    };
  }
  
  /**
   * Update FX state from Trinity meters
   */
  updateFromTrinity(params: TrinityFXParams): void {
    if (!this.config.enabled) return;
    
    // Map Trinity params to target state
    this.targetState.blur = this.config.blurEnabled 
      ? Math.min(params.blur, this.config.blurMaxStrength) 
      : 0;
    
    this.targetState.desaturation = this.config.desaturationEnabled
      ? Math.min(params.desaturation, this.config.desaturationMaxStrength)
      : 0;
    
    this.targetState.chromaticAberration = this.config.chromaticEnabled
      ? Math.min(params.chromaticAberration, this.config.chromaticMaxOffset)
      : 0;
    
    this.targetState.vignetteStrength = this.config.vignetteEnabled
      ? Math.min(params.vignette, this.config.vignetteMaxStrength)
      : 0;
    
    this.targetState.bloomIntensity = this.config.bloomEnabled
      ? Math.min(params.bloomIntensity, this.config.bloomMaxIntensity)
      : 0;
  }
  
  /**
   * Update FX state from raw meter values (alternative input)
   */
  updateFromMeters(synergy: number, resonance: number, dread: number): void {
    const normalizedSynergy = synergy / 100;
    const normalizedResonance = resonance / 100;
    const normalizedDread = dread / 100;
    
    // Dread: radial blur + time smear
    this.targetState.blur = this.config.blurEnabled
      ? normalizedDread * this.config.blurMaxStrength
      : 0;
    this.targetState.timeScale = 1.0 - (normalizedDread * 0.1); // Slight time slow feel
    
    // Resonance: clarity through desaturation
    this.targetState.desaturation = this.config.desaturationEnabled
      ? normalizedResonance * this.config.desaturationMaxStrength * 0.5
      : 0;
    
    // Combined: chromatic aberration
    this.targetState.chromaticAberration = this.config.chromaticEnabled
      ? (normalizedDread * 0.003 + normalizedResonance * 0.001) * 
        (this.config.chromaticMaxOffset / 0.004) // Normalize to config
      : 0;
    
    // Synergy: energetic vignette
    this.targetState.vignetteStrength = this.config.vignetteEnabled
      ? normalizedSynergy * this.config.vignetteMaxStrength * 0.5
      : 0;
    
    // Resonance + Synergy: bloom
    this.targetState.bloomIntensity = this.config.bloomEnabled
      ? (normalizedSynergy + normalizedResonance) * this.config.bloomMaxIntensity * 0.5
      : 0;
    
    // Color grading
    if (this.config.colorGradingEnabled) {
      this.targetState.colorTint = {
        r: this.config.dreadColorTint.r * normalizedDread +
           this.config.synergyColorTint.r * normalizedSynergy,
        g: this.config.dreadColorTint.g * normalizedDread +
           this.config.resonanceColorTint.g * normalizedResonance,
        b: this.config.dreadColorTint.b * normalizedDread +
           this.config.resonanceColorTint.b * normalizedResonance,
      };
    }
    
    // Critical dread threshold effects
    if (dread >= 80) {
      this.targetState.vignetteColor = { r: 0.2, g: 0, b: 0 }; // Red danger vignette
      this.pulseActive = true;
      this.pulseIntensity = (dread - 80) / 20; // 0-1 as dread goes 80-100
    } else {
      this.targetState.vignetteColor = { ...this.config.vignetteColor };
      this.pulseActive = false;
    }
  }
  
  /**
   * Trigger screen flash (for hits, parries, etc.)
   */
  triggerFlash(
    color: { r: number; g: number; b: number },
    intensity: number,
    durationMs: number
  ): void {
    if (!this.config.flashEnabled) return;
    
    this.flashTimer = durationMs;
    this.flashDuration = durationMs;
    this.flashPeakIntensity = Math.min(intensity, this.config.flashMaxIntensity);
    this.flashPeakColor = { ...color };
  }
  
  /**
   * Trigger impact flash (white flash for hits)
   */
  triggerImpactFlash(damage: number): void {
    const intensity = Math.min(damage / 50, 0.6);
    this.triggerFlash({ r: 1, g: 1, b: 1 }, intensity, 100);
  }
  
  /**
   * Trigger parry flash (gold flash)
   */
  triggerParryFlash(): void {
    this.triggerFlash({ r: 1, g: 0.85, b: 0.3 }, 0.5, 150);
  }
  
  /**
   * Trigger legendary blow flash (as per Omega Protocol)
   */
  triggerLegendaryBlowFlash(): void {
    // Desaturation spike
    this.currentState.desaturation = 0.7;
    // Flash
    this.triggerFlash({ r: 1, g: 0.9, b: 0.7 }, 0.7, 200);
  }
  
  /**
   * Update pipeline state (call every frame)
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds
    
    // Lerp current state towards target
    this.lerpState(dt);
    
    // Update flash
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
      const flashProgress = this.flashTimer / this.flashDuration;
      this.currentState.flashIntensity = this.flashPeakIntensity * flashProgress;
      this.currentState.flashColor = { ...this.flashPeakColor };
      
      if (this.flashTimer <= 0) {
        this.currentState.flashIntensity = 0;
      }
    }
    
    // Update pulse effect
    if (this.pulseActive) {
      this.pulsePhase += dt * 4; // Pulse frequency
      const pulseValue = (Math.sin(this.pulsePhase) + 1) * 0.5; // 0-1
      
      // Add pulse to vignette and chromatic
      this.currentState.vignetteStrength += pulseValue * 0.1 * this.pulseIntensity;
      this.currentState.chromaticAberration += pulseValue * 0.002 * this.pulseIntensity;
    }
  }
  
  private lerpState(dt: number): void {
    const t = Math.min(dt * this.transitionSpeed, 1);
    
    this.currentState.blur = this.lerp(this.currentState.blur, this.targetState.blur, t);
    this.currentState.desaturation = this.lerp(this.currentState.desaturation, this.targetState.desaturation, t);
    this.currentState.chromaticAberration = this.lerp(this.currentState.chromaticAberration, this.targetState.chromaticAberration, t);
    this.currentState.vignetteStrength = this.lerp(this.currentState.vignetteStrength, this.targetState.vignetteStrength, t);
    this.currentState.bloomIntensity = this.lerp(this.currentState.bloomIntensity, this.targetState.bloomIntensity, t);
    this.currentState.timeScale = this.lerp(this.currentState.timeScale, this.targetState.timeScale, t);
    
    // Lerp colors
    this.currentState.colorTint.r = this.lerp(this.currentState.colorTint.r, this.targetState.colorTint.r, t);
    this.currentState.colorTint.g = this.lerp(this.currentState.colorTint.g, this.targetState.colorTint.g, t);
    this.currentState.colorTint.b = this.lerp(this.currentState.colorTint.b, this.targetState.colorTint.b, t);
    
    this.currentState.vignetteColor.r = this.lerp(this.currentState.vignetteColor.r, this.targetState.vignetteColor.r, t);
    this.currentState.vignetteColor.g = this.lerp(this.currentState.vignetteColor.g, this.targetState.vignetteColor.g, t);
    this.currentState.vignetteColor.b = this.lerp(this.currentState.vignetteColor.b, this.targetState.vignetteColor.b, t);
  }
  
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * Get current FX state for rendering
   */
  getState(): ActiveFXState {
    return { ...this.currentState };
  }
  
  /**
   * Get shader uniforms for Three.js/WebGL integration
   */
  getShaderUniforms(): Record<string, number | { x: number; y: number } | { r: number; g: number; b: number }> {
    return {
      uBlurStrength: this.currentState.blur,
      uBlurCenter: this.currentState.blurCenter,
      uDesaturation: this.currentState.desaturation,
      uChromaticOffset: this.currentState.chromaticAberration,
      uVignetteStrength: this.currentState.vignetteStrength,
      uVignetteColor: this.currentState.vignetteColor,
      uBloomIntensity: this.currentState.bloomIntensity,
      uFlashIntensity: this.currentState.flashIntensity,
      uFlashColor: this.currentState.flashColor,
      uColorTint: this.currentState.colorTint,
      uTimeScale: this.currentState.timeScale,
    };
  }
  
  /**
   * Check if any effects are active
   */
  hasActiveEffects(): boolean {
    return this.currentState.blur > 0.001 ||
           this.currentState.desaturation > 0.01 ||
           this.currentState.chromaticAberration > 0.0001 ||
           this.currentState.vignetteStrength > 0.01 ||
           this.currentState.bloomIntensity > 0.01 ||
           this.currentState.flashIntensity > 0.01;
  }
  
  /**
   * Reset to default state
   */
  reset(): void {
    this.currentState = this.getDefaultState();
    this.targetState = this.getDefaultState();
    this.flashTimer = 0;
    this.pulsePhase = 0;
    this.pulseActive = false;
    this.pulseIntensity = 0;
  }
  
  /**
   * Update config
   */
  setConfig(config: Partial<PostFXConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * GLSL shader snippets for PostFX implementation
 */
export const POST_FX_SHADER_SNIPPETS = {
  uniforms: `
    uniform float uBlurStrength;
    uniform vec2 uBlurCenter;
    uniform float uDesaturation;
    uniform float uChromaticOffset;
    uniform float uVignetteStrength;
    uniform vec3 uVignetteColor;
    uniform float uBloomIntensity;
    uniform float uFlashIntensity;
    uniform vec3 uFlashColor;
    uniform vec3 uColorTint;
  `,
  
  functions: `
    vec3 applyDesaturation(vec3 color, float amount) {
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(color, vec3(gray), amount);
    }
    
    vec3 applyChromaticAberration(sampler2D tex, vec2 uv, float offset) {
      float r = texture2D(tex, uv + vec2(offset, 0.0)).r;
      float g = texture2D(tex, uv).g;
      float b = texture2D(tex, uv - vec2(offset, 0.0)).b;
      return vec3(r, g, b);
    }
    
    float applyVignette(vec2 uv, float strength) {
      float dist = distance(uv, vec2(0.5));
      return 1.0 - smoothstep(0.4, 0.8, dist) * strength;
    }
    
    vec3 applyFlash(vec3 color, vec3 flashColor, float intensity) {
      return mix(color, flashColor, intensity);
    }
    
    vec3 applyColorTint(vec3 color, vec3 tint) {
      return color + tint;
    }
  `,
  
  main: `
    // Sample with chromatic aberration
    vec3 color = applyChromaticAberration(uTexture, vUv, uChromaticOffset);
    
    // Apply desaturation
    color = applyDesaturation(color, uDesaturation);
    
    // Apply vignette
    float vignette = applyVignette(vUv, uVignetteStrength);
    color = mix(uVignetteColor, color, vignette);
    
    // Apply flash
    color = applyFlash(color, uFlashColor, uFlashIntensity);
    
    // Apply color tint
    color = applyColorTint(color, uColorTint);
    
    // Apply bloom (simplified)
    color += max(vec3(0.0), color - vec3(0.8)) * uBloomIntensity;
    
    gl_FragColor = vec4(color, 1.0);
  `,
};
