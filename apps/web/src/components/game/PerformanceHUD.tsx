/**
 * Performance HUD Component
 * Displays live FPS, frame time, and memory usage during gameplay (dev/debug)
 */

import React, { useEffect, useState } from 'react';
import { getProfiler, type PerformanceMetrics } from '../../lib/performanceProfiler';

interface PerformanceHUDProps {
  visible: boolean;
}

export default function PerformanceHUD({ visible }: PerformanceHUDProps) {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const profiler = getProfiler();
    profiler.start();

    let frameCounter = 0;
    const unsubscribe = profiler.onSample((metrics: PerformanceMetrics) => {
      // Update UI at ~4Hz to avoid re-render churn
      frameCounter++;
      if (frameCounter % 15 !== 0) return;

      setFps(profiler.getCurrentFPS());
      setFrameTime(Math.round(metrics.frameTimeMs * 10) / 10);
      setMemory(metrics.memoryUsedMB);
    });

    return () => {
      unsubscribe();
    };
  }, [visible]);

  if (!visible) return null;

  const fpsColor = fps >= 55 ? '#4ade80' : fps >= 30 ? '#facc15' : '#ef4444';

  return (
    <div className="fixed top-2 right-2 z-50 pointer-events-none font-mono text-xs bg-black/70 border border-slate-700 rounded-lg px-3 py-2 space-y-0.5">
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">FPS</span>
        <span className="font-bold" style={{ color: fpsColor }}>
          {fps}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Frame</span>
        <span className="text-white">{frameTime}ms</span>
      </div>
      {memory > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Mem</span>
          <span className="text-white">{memory}MB</span>
        </div>
      )}
    </div>
  );
}
