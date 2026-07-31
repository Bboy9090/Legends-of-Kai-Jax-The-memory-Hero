/**
 * THREE.JS LOD SYSTEM FOR CHARACTER MODELS
 * Loads appropriate detail level based on distance and device
 */

import * as THREE from 'three';
import { getDeviceType } from './PerformanceOptimizer';

export interface LODModelConfig {
  standard: string;      // Full detail (100%)
  optimized: string;     // Medium detail (50%)
  lodLow?: string;       // Low detail (25%)
}

/**
 * LOD registry: maps character IDs to optimized model paths
 * Update after running Blender optimization script
 */
export const LOD_MODEL_REGISTRY: Record<string, LODModelConfig> = {
  'kai-jax': {
    standard: '/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb',
    optimized: '/models/optimized/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX_optimized.glb',
    lodLow: '/models/optimized/lod_low/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX_lod_low.glb',
  },
  jaxon: {
    standard: '/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb',
    optimized: '/models/optimized/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI_optimized.glb',
    lodLow: '/models/optimized/lod_low/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI_lod_low.glb',
  },
  kaison: {
    standard: '/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb',
    optimized: '/models/optimized/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS_optimized.glb',
    lodLow: '/models/optimized/lod_low/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS_lod_low.glb',
  },
  // Add more as you optimize models
};

/**
 * LOD distance thresholds (in world units)
 * Adjusted per device to maintain target framerate
 */
export const LOD_THRESHOLDS = {
  mobile: {
    useOptimized: 2,   // Use optimized (50%) beyond 2 units
    useLODLow: 5,      // Use LOD (25%) beyond 5 units
  },
  tablet: {
    useOptimized: 4,
    useLODLow: 10,
  },
  desktop: {
    useOptimized: 8,
    useLODLow: 20,
  },
};

/**
 * Get appropriate model path based on distance and device
 * Falls back to standard if optimized version not available
 */
export function getLODModelPath(
  characterId: string,
  distance: number = 0
): string {
  const config = LOD_MODEL_REGISTRY[characterId];
  if (!config) return '/models/stylized-beast.glb'; // Fallback

  const deviceType = getDeviceType();
  const thresholds = LOD_THRESHOLDS[deviceType];

  // Use LOD low if available and far enough
  if (config.lodLow && distance > thresholds.useLODLow) {
    return config.lodLow;
  }

  // Use optimized if far enough or on mobile
  if (distance > thresholds.useOptimized || deviceType === 'mobile') {
    return config.optimized;
  }

  // Use full detail close up or on desktop
  return config.standard;
}

/**
 * Preload LOD models for faster switching
 */
export function preloadLODModels(characterIds: string[]): void {
  const { useGLTF } = require('@react-three/drei');

  for (const id of characterIds) {
    const config = LOD_MODEL_REGISTRY[id];
    if (!config) continue;

    // Preload all variants in parallel
    Promise.all([
      useGLTF.preload(config.standard),
      useGLTF.preload(config.optimized),
      config.lodLow && useGLTF.preload(config.lodLow),
    ]).catch((err) => {
      console.warn(`Failed to preload LOD models for ${id}:`, err);
    });
  }
}

/**
 * Calculate LOD level based on camera distance
 * Returns a normalized score (0 = closest/highest detail, 1 = farthest/lowest detail)
 */
export function calculateLODLevel(
  characterPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3
): number {
  const distance = characterPosition.distanceTo(cameraPosition);
  const deviceType = getDeviceType();
  const thresholds = LOD_THRESHOLDS[deviceType];

  if (distance < thresholds.useOptimized) return 0; // High detail
  if (distance < thresholds.useLODLow) return 0.5; // Medium detail
  return 1; // Low detail
}

/**
 * Monitor LOD switching in battle scene
 * Useful for debugging performance
 */
export class LODMonitor {
  private characters: Map<string, { position: THREE.Vector3; lodLevel: number }> = new Map();

  update(
    characterId: string,
    position: THREE.Vector3,
    cameraPosition: THREE.Vector3
  ): void {
    const lodLevel = calculateLODLevel(position, cameraPosition);
    this.characters.set(characterId, { position, lodLevel });
  }

  getStats(): { highDetail: number; mediumDetail: number; lowDetail: number } {
    let highDetail = 0;
    let mediumDetail = 0;
    let lowDetail = 0;

    for (const { lodLevel } of this.characters.values()) {
      if (lodLevel < 0.25) highDetail++;
      else if (lodLevel < 0.75) mediumDetail++;
      else lowDetail++;
    }

    return { highDetail, mediumDetail, lowDetail };
  }

  log(): void {
    const stats = this.getStats();
    console.log(`🎬 LOD Stats - High: ${stats.highDetail}, Medium: ${stats.mediumDetail}, Low: ${stats.lowDetail}`);
  }

  reset(): void {
    this.characters.clear();
  }
}
