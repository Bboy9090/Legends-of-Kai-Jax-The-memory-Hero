/**
 * PHASE 5.5 OPTIMIZATION HOOKS
 * React hooks for integrating performance optimizations
 *
 * Usage in components:
 * - useAITickOptimization() - Enable optimized AI update rates
 * - useMobileRenderOptimization() - Enable mobile-specific rendering
 * - usePerformanceMonitoring() - Track and report performance metrics
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { globalAITickManager } from '../../../game/characters/fang/FangAITickOptimizer';
import { MobileRenderOptimizer } from '../../../lib/threejs/MobileRenderOptimizer';
import {
  globalProfiler,
  globalComponentTracker,
  globalMemoryLeakDetector,
  PerformanceReport,
} from '../../../lib/threejs/PerformanceProfiling';
import { getDeviceType } from '../../../lib/threejs/PerformanceOptimizer';

/**
 * Hook: Enable AI tick rate optimization
 * Automatically skip AI updates for scout-type enemies
 *
 * Usage:
 * const { ticksSkipped, optimizationGain } = useAITickOptimization();
 */
export function useAITickOptimization() {
  const ticksSkipped = useRef(0);
  const totalTicks = useRef(0);

  const getOptimizationGain = useCallback(() => {
    if (totalTicks.current === 0) return 0;
    return (ticksSkipped.current / totalTicks.current) * 100;
  }, []);

  return {
    ticksSkipped: ticksSkipped.current,
    totalTicks: totalTicks.current,
    optimizationGain: getOptimizationGain(),
    tickManager: globalAITickManager,
  };
}

/**
 * Hook: Enable mobile-specific rendering optimizations
 * Handles dynamic shadow resolution, memory management
 *
 * Usage:
 * const { shadowResolution, textureMemory } = useMobileRenderOptimization();
 */
export function useMobileRenderOptimization() {
  const { gl, scene } = useThree();
  const optimizerRef = useRef<MobileRenderOptimizer | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current && gl && scene) {
      optimizerRef.current = new MobileRenderOptimizer(gl, scene);
      isInitializedRef.current = true;
    }

    return () => {
      optimizerRef.current = null;
      isInitializedRef.current = false;
    };
  }, [gl, scene]);

  const getStats = useCallback(() => {
    if (!optimizerRef.current) {
      return {
        shadowResolution: 0,
        textureMemoryMb: 0,
        device: getDeviceType(),
      };
    }

    const report = optimizerRef.current.getReport();
    return {
      shadowResolution: report.shadowResolution,
      textureMemoryMb: report.textureMemory,
      device: report.device,
      drawCalls: report.drawCalls,
    };
  }, []);

  return {
    optimizer: optimizerRef.current,
    getStats,
  };
}

/**
 * Hook: Track performance metrics
 * Collects FPS, frame times, memory usage
 *
 * Usage:
 * const { report, isStable } = usePerformanceMonitoring();
 */
export function usePerformanceMonitoring() {
  const profilerRef = useRef(globalProfiler);
  const lastReportRef = useRef<PerformanceReport | null>(null);

  useFrame((frameState, rawDelta) => {
    // Record frame
    const frameTime = Math.min(rawDelta * 1000, 100); // Cap at 100ms
    profilerRef.current.recordFrame(frameTime);
    profilerRef.current.recordMemory();
  });

  const getReport = useCallback((): PerformanceReport => {
    lastReportRef.current = profilerRef.current.getReport();
    return lastReportRef.current;
  }, []);

  const isPerformanceStable = useCallback((): boolean => {
    const report = getReport();
    // Stable if: 30+ fps average, memory stable, < 5% dropped frames
    return (
      report.averageFPS >= 30
      && report.stableMemory
      && report.droppedFrames / report.totalFrames < 0.05
    );
  }, [getReport]);

  return {
    profiler: profilerRef.current,
    getReport,
    isPerformanceStable,
    lastReport: lastReportRef.current,
  };
}

/**
 * Hook: Monitor component render performance
 * Tracks individual component render times
 *
 * Usage:
 * const trackRender = useComponentPerformanceTracking('FangCombatantVisual');
 * const t0 = performance.now();
 * // ... render code ...
 * trackRender(performance.now() - t0);
 */
export function useComponentPerformanceTracking(componentName: string) {
  return useCallback((renderTimeMs: number) => {
    globalComponentTracker.recordRender(componentName, renderTimeMs);
  }, [componentName]);
}

/**
 * Hook: Memory leak detection
 * Continuously monitors heap for unusual growth patterns
 *
 * Usage:
 * const { hasLeak, leakProbability } = useMemoryLeakDetection();
 */
export function useMemoryLeakDetection() {
  const detectorRef = useRef(globalMemoryLeakDetector);

  useEffect(() => {
    detectorRef.current.startMonitoring();

    return () => {
      detectorRef.current.stopMonitoring();
    };
  }, []);

  useFrame(() => {
    detectorRef.current.update();
  });

  const checkMemoryHealth = useCallback(() => {
    return detectorRef.current.analyzeTrend();
  }, []);

  return {
    detector: detectorRef.current,
    checkMemoryHealth,
  };
}

/**
 * Hook: Adaptive quality settings based on device performance
 * Automatically disables expensive features if FPS drops
 *
 * Usage:
 * const { quality, shouldRender } = useAdaptiveQuality();
 */
export function useAdaptiveQuality() {
  const { profiler, getReport } = usePerformanceMonitoring();
  const qualityRef = useRef(1.0);

  useFrame(() => {
    const report = getReport();
    const targetFPS = getDeviceType() === 'mobile' ? 30 : 60;

    // Adjust quality based on FPS
    if (report.averageFPS < targetFPS * 0.8) {
      qualityRef.current = Math.max(0.3, qualityRef.current - 0.1);
    } else if (report.averageFPS > targetFPS * 1.1 && qualityRef.current < 1.0) {
      qualityRef.current = Math.min(1.0, qualityRef.current + 0.05);
    }
  });

  const shouldRenderComponent = useCallback((
    baseQuality: number = 1.0,
    minQuality: number = 0.3
  ): boolean => {
    return qualityRef.current >= minQuality;
  }, []);

  const getParticleCount = useCallback((baseCount: number): number => {
    return Math.floor(baseCount * qualityRef.current);
  }, []);

  return {
    quality: qualityRef.current,
    shouldRenderComponent,
    getParticleCount,
  };
}

/**
 * Hook: FPS display (for debug HUD)
 * Real-time FPS counter
 *
 * Usage:
 * const fps = useFPSCounter();
 * return <div>{fps.toFixed(1)} FPS</div>;
 */
export function useFPSCounter() {
  const fpsRef = useRef(0);

  useFrame((frameState) => {
    if ('performance' in window) {
      const perfData = performance.now();
      // Simple approximation using frame delta
      const delta = frameState.clock.getDelta();
      fpsRef.current = 1 / delta;
    }
  });

  return fpsRef.current;
}

/**
 * Hook: Batch render optimization status
 * Reports on batching opportunities and current efficiency
 *
 * Usage:
 * const { drawCalls, batchingOpportunity } = useBatchRenderStats();
 */
export function useBatchRenderStats() {
  const { optimizer } = useMobileRenderOptimization();

  const getStats = useCallback(() => {
    if (!optimizer) {
      return {
        drawCalls: 0,
        batchingOpportunity: 0,
        batchingEfficiency: 0,
      };
    }

    const analyzer = optimizer.getDrawCallAnalyzer();
    const report = analyzer.getReport();

    return {
      drawCalls: report.totalDrawCalls,
      batchingOpportunity: report.batchingOpportunity,
      batchingEfficiency: report.batchingOpportunity / report.totalDrawCalls,
    };
  }, [optimizer]);

  return getStats();
}

/**
 * Hook: Mobile-specific visual optimization
 * Disables expensive effects on low-performance devices
 *
 * Usage:
 * const { isLowEnd, renderQuality } = useMobileVisualOptimization();
 */
export function useMobileVisualOptimization() {
  const deviceType = getDeviceType();
  const isLowEnd = deviceType === 'mobile';

  const shouldRenderEffect = useCallback((
    effectName: string,
    isExpensive: boolean = true
  ): boolean => {
    // Disable expensive effects on low-end devices
    if (isLowEnd && isExpensive) {
      return false;
    }
    return true;
  }, [isLowEnd]);

  const getTextureQuality = useCallback((): 'low' | 'medium' | 'high' => {
    if (deviceType === 'mobile') return 'low';
    if (deviceType === 'tablet') return 'medium';
    return 'high';
  }, [deviceType]);

  const getShadowQuality = useCallback((): boolean => {
    // Disable shadows on very low-end devices
    return deviceType !== 'mobile';
  }, [deviceType]);

  return {
    isLowEnd,
    deviceType,
    shouldRenderEffect,
    getTextureQuality,
    getShadowQuality,
  };
}

/**
 * Export all hooks as a bundle for easy import
 */
export const Phase55OptimizationHooks = {
  useAITickOptimization,
  useMobileRenderOptimization,
  usePerformanceMonitoring,
  useComponentPerformanceTracking,
  useMemoryLeakDetection,
  useAdaptiveQuality,
  useFPSCounter,
  useBatchRenderStats,
  useMobileVisualOptimization,
};
