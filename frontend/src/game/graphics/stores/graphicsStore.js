/**
 * Graphics State Store - Zustand
 * Manages rendering settings, performance metrics, and visual presets
 */

import { create } from 'zustand';
import visualPresets from '../visual-presets.json';

const useGraphicsStore = create((set, get) => ({
  // Current preset
  currentPreset: 'high',
  preset: visualPresets.presets.high,
  
  // Color blind mode
  colorBlindMode: 'default',
  palette: visualPresets.colorBlindPalettes.default,
  
  // Dynamic resolution
  currentResolution: 1.0,
  targetResolution: 1.0,
  autoResolution: true,
  
  // Performance metrics
  fps: 60,
  frameTime: 16.67,
  triangleCount: 0,
  drawCalls: 0,
  showPerfHUD: false,
  
  // Hit-stop state
  hitStopActive: false,
  hitStopIntensity: 0,
  
  // High impact mode (for replays)
  highImpactMode: false,
  
  // Actions
  setPreset: (presetName) => {
    const preset = visualPresets.presets[presetName];
    if (preset) {
      set({ 
        currentPreset: presetName, 
        preset,
        targetResolution: preset.resolution 
      });
    }
  },
  
  setColorBlindMode: (mode) => {
    const palette = visualPresets.colorBlindPalettes[mode];
    if (palette) {
      set({ colorBlindMode: mode, palette });
    }
  },
  
  updatePerformance: (metrics) => {
    const { fps, frameTime, triangleCount, drawCalls } = metrics;
    const state = get();
    
    set({ fps, frameTime, triangleCount, drawCalls });
    
    // Auto-adjust resolution based on frame time
    if (state.autoResolution) {
      const budget = visualPresets.performanceBudgets.frameTimeBudgetMs;
      let newResolution = state.targetResolution;
      
      if (frameTime > budget * 1.5 && newResolution > 0.5) {
        newResolution = Math.max(0.5, newResolution - 0.25);
      } else if (frameTime < budget * 0.8 && newResolution < 1.0) {
        newResolution = Math.min(1.0, newResolution + 0.25);
      }
      
      if (newResolution !== state.currentResolution) {
        set({ currentResolution: newResolution });
      }
    }
  },
  
  togglePerfHUD: () => set((state) => ({ showPerfHUD: !state.showPerfHUD })),
  
  triggerHitStop: (intensity = 1) => {
    set({ hitStopActive: true, hitStopIntensity: intensity });
    setTimeout(() => {
      set({ hitStopActive: false, hitStopIntensity: 0 });
    }, 100 + intensity * 50);
  },
  
  setHighImpactMode: (enabled) => {
    if (enabled) {
      set({ 
        highImpactMode: true,
        preset: visualPresets.presets.highImpact 
      });
    } else {
      const state = get();
      set({ 
        highImpactMode: false,
        preset: visualPresets.presets[state.currentPreset] 
      });
    }
  },
  
  setAutoResolution: (enabled) => set({ autoResolution: enabled }),
}));

export default useGraphicsStore;
export { visualPresets };
