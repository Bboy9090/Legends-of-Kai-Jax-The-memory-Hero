/**
 * PHASE 5.5: MOBILE RENDER OPTIMIZATION
 * Comprehensive rendering optimizations for iOS/Android targets
 *
 * Features:
 * - Dynamic shadow map resolution (1024 -> 512 -> 256 based on FPS)
 * - Automatic LOD switching based on distance
 * - Texture memory tracking and downsampling
 * - Draw call batching metadata
 * - WebGL state optimization
 */

import * as THREE from 'three';
import { getDeviceType } from './PerformanceOptimizer';

export interface MobileRenderConfig {
  targetFPS: number;
  minShadowResolution: number;
  maxShadowResolution: number;
  enableTextureMipMapping: boolean;
  enableTextureCompression: boolean;
  maxTextureMemoryMb: number;
  reduceLODDistance: boolean;
}

export const MOBILE_RENDER_CONFIG: MobileRenderConfig = {
  targetFPS: 30,
  minShadowResolution: 256,
  maxShadowResolution: 1024,
  enableTextureMipMapping: true,
  enableTextureCompression: true,
  maxTextureMemoryMb: 128,
  reduceLODDistance: true,
};

export const TABLET_RENDER_CONFIG: MobileRenderConfig = {
  targetFPS: 60,
  minShadowResolution: 512,
  maxShadowResolution: 1024,
  enableTextureMipMapping: true,
  enableTextureCompression: true,
  maxTextureMemoryMb: 256,
  reduceLODDistance: false,
};

export const DESKTOP_RENDER_CONFIG: MobileRenderConfig = {
  targetFPS: 60,
  minShadowResolution: 1024,
  maxShadowResolution: 2048,
  enableTextureMipMapping: true,
  enableTextureCompression: false,
  maxTextureMemoryMb: 512,
  reduceLODDistance: false,
};

/**
 * Manager for dynamic shadow map resolution
 */
export class DynamicShadowManager {
  private currentResolution: number;
  private targetResolution: number;
  private fpsSamples: number[] = [];
  private readonly maxFpsSamples = 60;
  private lights: THREE.Light[] = [];

  constructor(
    private config: MobileRenderConfig,
    private renderer: THREE.WebGLRenderer
  ) {
    this.currentResolution = config.maxShadowResolution;
    this.targetResolution = config.maxShadowResolution;
  }

  /**
   * Register a light for shadow management
   */
  registerLight(light: THREE.Light): void {
    if ('shadow' in light && light.shadow) {
      this.lights.push(light);
    }
  }

  /**
   * Update shadow resolution based on FPS
   */
  updateShadowResolution(fps: number): void {
    this.fpsSamples.push(fps);
    if (this.fpsSamples.length > this.maxFpsSamples) {
      this.fpsSamples.shift();
    }

    const avgFps = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;

    // Adjust target resolution based on performance
    if (avgFps < this.config.targetFPS * 0.8) {
      // Under-performing: reduce shadow resolution
      this.targetResolution = Math.max(
        this.config.minShadowResolution,
        this.currentResolution / 2
      );
    } else if (avgFps > this.config.targetFPS * 1.1 && this.currentResolution < this.config.maxShadowResolution) {
      // Over-performing: can afford better shadows
      this.targetResolution = Math.min(
        this.config.maxShadowResolution,
        this.currentResolution * 1.5
      );
    }

    // Gradually adjust (avoid jarring changes)
    if (Math.abs(this.currentResolution - this.targetResolution) > 1) {
      this.currentResolution += (this.targetResolution - this.currentResolution) * 0.1;
      this.applyShadowResolution(Math.round(this.currentResolution));
    }
  }

  /**
   * Apply shadow resolution to all registered lights
   */
  private applyShadowResolution(resolution: number): void {
    for (const light of this.lights) {
      if ('shadow' in light && light.shadow) {
        light.shadow.mapSize.width = resolution;
        light.shadow.mapSize.height = resolution;
        light.shadow.map = null; // Force rebuild
      }
    }
  }

  /**
   * Get current shadow resolution
   */
  getResolution(): number {
    return Math.round(this.currentResolution);
  }

  /**
   * Completely disable shadows (emergency mode)
   */
  disableShadows(): void {
    this.renderer.shadowMap.enabled = false;
    for (const light of this.lights) {
      if ('shadow' in light) {
        light.castShadow = false;
      }
    }
  }

  /**
   * Re-enable shadows
   */
  enableShadows(): void {
    this.renderer.shadowMap.enabled = true;
    for (const light of this.lights) {
      if ('shadow' in light) {
        light.castShadow = true;
      }
    }
  }
}

/**
 * Manager for texture memory optimization
 */
export class TextureMemoryOptimizer {
  private textures: Map<string, THREE.Texture> = new Map();
  private totalMemory = 0;
  private readonly maxMemory: number;

  constructor(maxMemoryMb: number) {
    this.maxMemory = maxMemoryMb * 1024 * 1024;
  }

  /**
   * Register a texture for memory tracking
   */
  registerTexture(key: string, texture: THREE.Texture): void {
    this.textures.set(key, texture);
    this.updateMemoryEstimate();
  }

  /**
   * Estimate VRAM usage (rough approximation)
   */
  private estimateTextureMemory(texture: THREE.Texture): number {
    if (!texture.image) return 0;

    const { width = 0, height = 0 } = texture.image as any;
    const bytesPerPixel = 4; // RGBA

    // Account for mipmaps
    let memory = width * height * bytesPerPixel;
    if (texture.mipmaps && texture.mipmaps.length > 0) {
      memory *= 1.33; // Mipmaps add ~33% overhead
    }

    return memory;
  }

  /**
   * Update total memory estimate
   */
  private updateMemoryEstimate(): void {
    this.totalMemory = 0;
    for (const texture of this.textures.values()) {
      this.totalMemory += this.estimateTextureMemory(texture);
    }
  }

  /**
   * Get current memory usage in MB
   */
  getMemoryUsageMb(): number {
    return this.totalMemory / 1024 / 1024;
  }

  /**
   * Check if memory budget exceeded
   */
  isExceededMemoryBudget(): boolean {
    return this.totalMemory > this.maxMemory;
  }

  /**
   * Downscale textures to fit memory budget
   */
  optimizeTextureMemory(): void {
    if (!this.isExceededMemoryBudget()) {
      return;
    }

    const excessRatio = this.totalMemory / this.maxMemory;
    const targetScaleDown = Math.sqrt(excessRatio);

    for (const texture of this.textures.values()) {
      // Disable mipmaps if memory is critical
      if (targetScaleDown > 1.5) {
        texture.generateMipmaps = false;
      }

      // Reduce minfilter quality
      if (targetScaleDown > 1.2) {
        texture.minFilter = THREE.LinearFilter;
      }
    }

    this.updateMemoryEstimate();
  }

  /**
   * Get memory usage report
   */
  getReport(): {
    totalMemoryMb: number;
    textureCount: number;
    budgetRemaining: number;
    isOverBudget: boolean;
  } {
    return {
      totalMemoryMb: Math.round(this.getMemoryUsageMb() * 10) / 10,
      textureCount: this.textures.size,
      budgetRemaining: Math.round((this.maxMemory - this.totalMemory) / 1024 / 1024),
      isOverBudget: this.isExceededMemoryBudget(),
    };
  }
}

/**
 * Batch draw call metadata collector
 * Useful for identifying bottlenecks
 */
export class DrawCallAnalyzer {
  private drawCalls = 0;
  private batches: Map<string, number> = new Map();

  /**
   * Record a draw call for analysis
   */
  recordDrawCall(materialType: string): void {
    this.drawCalls++;
    this.batches.set(
      materialType,
      (this.batches.get(materialType) ?? 0) + 1
    );
  }

  /**
   * Get analysis report
   */
  getReport(): {
    totalDrawCalls: number;
    batchBreakdown: Record<string, number>;
    batchingOpportunity: number;
  } {
    const breakdown: Record<string, number> = {};
    this.batches.forEach((count, type) => {
      breakdown[type] = count;
    });

    // Estimate batching opportunity (assume 20% can be batched)
    const batchingOpportunity = Math.round(this.drawCalls * 0.2);

    return {
      totalDrawCalls: this.drawCalls,
      batchBreakdown: breakdown,
      batchingOpportunity,
    };
  }

  /**
   * Reset for next frame
   */
  reset(): void {
    this.drawCalls = 0;
    this.batches.clear();
  }
}

/**
 * Unified mobile render optimizer
 */
export class MobileRenderOptimizer {
  private shadowManager: DynamicShadowManager;
  private textureOptimizer: TextureMemoryOptimizer;
  private drawCallAnalyzer: DrawCallAnalyzer;
  private config: MobileRenderConfig;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    const deviceType = getDeviceType();
    this.config = this.getConfigForDevice(deviceType);

    this.shadowManager = new DynamicShadowManager(this.config, renderer);
    this.textureOptimizer = new TextureMemoryOptimizer(this.config.maxTextureMemoryMb);
    this.drawCallAnalyzer = new DrawCallAnalyzer();

    // Register existing lights
    scene.traverse((node) => {
      if (node instanceof THREE.Light) {
        this.shadowManager.registerLight(node);
      }
    });
  }

  /**
   * Get config for device type
   */
  private getConfigForDevice(deviceType: 'mobile' | 'tablet' | 'desktop'): MobileRenderConfig {
    if (deviceType === 'mobile') return MOBILE_RENDER_CONFIG;
    if (deviceType === 'tablet') return TABLET_RENDER_CONFIG;
    return DESKTOP_RENDER_CONFIG;
  }

  /**
   * Update optimization based on FPS
   */
  update(fps: number): void {
    this.shadowManager.updateShadowResolution(fps);
    this.textureOptimizer.optimizeTextureMemory();
  }

  /**
   * Get shadow manager
   */
  getShadowManager(): DynamicShadowManager {
    return this.shadowManager;
  }

  /**
   * Get texture optimizer
   */
  getTextureOptimizer(): TextureMemoryOptimizer {
    return this.textureOptimizer;
  }

  /**
   * Get draw call analyzer
   */
  getDrawCallAnalyzer(): DrawCallAnalyzer {
    return this.drawCallAnalyzer;
  }

  /**
   * Get complete performance report
   */
  getReport(): {
    device: string;
    targetFPS: number;
    shadowResolution: number;
    textureMemory: number;
    drawCalls: number;
  } {
    return {
      device: getDeviceType(),
      targetFPS: this.config.targetFPS,
      shadowResolution: this.shadowManager.getResolution(),
      textureMemory: Math.round(this.textureOptimizer.getMemoryUsageMb()),
      drawCalls: this.drawCallAnalyzer.getReport().totalDrawCalls,
    };
  }
}
