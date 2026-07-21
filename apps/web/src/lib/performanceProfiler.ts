/**
 * Performance Profiling System
 * FPS monitoring, memory tracking, frame time analysis, and optimization hints
 */

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  memoryUsedMB: number;
  memoryLimitMB: number;
  drawCalls?: number;
  triangles?: number;
  timestamp: number;
}

export interface PerformanceReport {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  averageFrameTime: number;
  percentile95FrameTime: number;
  memoryPeakMB: number;
  droppedFrames: number;
  totalFrames: number;
  duration: number;
  recommendations: string[];
}

export interface ProfilerConfig {
  sampleWindowSize: number; // number of frames to keep
  targetFPS: number;
  lowFPSThreshold: number;
  memoryWarningThresholdMB: number;
}

const DEFAULT_CONFIG: ProfilerConfig = {
  sampleWindowSize: 300, // ~5 seconds at 60fps
  targetFPS: 60,
  lowFPSThreshold: 30,
  memoryWarningThresholdMB: 500,
};

export class PerformanceProfiler {
  private config: ProfilerConfig;
  private samples: PerformanceMetrics[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private running = false;
  private rafId: number | null = null;
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor(config: Partial<ProfilerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const frameTimeMs = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    const metrics: PerformanceMetrics = {
      fps: frameTimeMs > 0 ? Math.min(1000 / frameTimeMs, 240) : 0,
      frameTimeMs,
      memoryUsedMB: this.getMemoryUsage(),
      memoryLimitMB: this.getMemoryLimit(),
      timestamp: now,
    };

    this.samples.push(metrics);
    if (this.samples.length > this.config.sampleWindowSize) {
      this.samples.shift();
    }

    for (const listener of this.listeners) {
      listener(metrics);
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private getMemoryUsage(): number {
    const mem = (performance as any).memory;
    return mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;
  }

  private getMemoryLimit(): number {
    const mem = (performance as any).memory;
    return mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 0;
  }

  onSample(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getCurrentFPS(): number {
    if (this.samples.length === 0) return 0;
    const recent = this.samples.slice(-30);
    return Math.round(recent.reduce((sum, s) => sum + s.fps, 0) / recent.length);
  }

  generateReport(): PerformanceReport {
    if (this.samples.length === 0) {
      return {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        averageFrameTime: 0,
        percentile95FrameTime: 0,
        memoryPeakMB: 0,
        droppedFrames: 0,
        totalFrames: this.frameCount,
        duration: 0,
        recommendations: ['No samples collected yet'],
      };
    }

    const fpsList = this.samples.map((s) => s.fps);
    const frameTimes = this.samples.map((s) => s.frameTimeMs).sort((a, b) => a - b);
    const targetFrameTime = 1000 / this.config.targetFPS;

    const averageFPS = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;
    const droppedFrames = this.samples.filter(
      (s) => s.frameTimeMs > targetFrameTime * 1.5
    ).length;

    const report: PerformanceReport = {
      averageFPS: Math.round(averageFPS),
      minFPS: Math.round(Math.min(...fpsList)),
      maxFPS: Math.round(Math.max(...fpsList)),
      averageFrameTime:
        Math.round((frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length) * 100) / 100,
      percentile95FrameTime:
        Math.round(frameTimes[Math.floor(frameTimes.length * 0.95)] * 100) / 100,
      memoryPeakMB: Math.max(...this.samples.map((s) => s.memoryUsedMB)),
      droppedFrames,
      totalFrames: this.frameCount,
      duration:
        this.samples.length > 1
          ? this.samples[this.samples.length - 1].timestamp - this.samples[0].timestamp
          : 0,
      recommendations: [],
    };

    report.recommendations = this.buildRecommendations(report);
    return report;
  }

  private buildRecommendations(report: PerformanceReport): string[] {
    const recs: string[] = [];

    if (report.averageFPS < this.config.lowFPSThreshold) {
      recs.push('Average FPS is critically low. Reduce shadow quality and pixel ratio.');
    } else if (report.averageFPS < this.config.targetFPS * 0.8) {
      recs.push('FPS below 80% of target. Consider lowering post-processing effects.');
    }

    if (report.droppedFrames > report.totalFrames * 0.1) {
      recs.push('Over 10% of frames dropped. Check for heavy work on the main thread.');
    }

    if (report.memoryPeakMB > this.config.memoryWarningThresholdMB) {
      recs.push(
        `Memory peaked at ${report.memoryPeakMB}MB. Audit texture sizes and dispose unused GLB models.`
      );
    }

    if (report.percentile95FrameTime > (1000 / this.config.targetFPS) * 2) {
      recs.push('95th percentile frame time is high — intermittent stutter likely (GC or asset loads).');
    }

    if (recs.length === 0) {
      recs.push('Performance is healthy. No action needed.');
    }

    return recs;
  }

  reset(): void {
    this.samples = [];
    this.frameCount = 0;
  }
}

// Singleton profiler instance for the game
let sharedProfiler: PerformanceProfiler | null = null;

export function getProfiler(): PerformanceProfiler {
  if (!sharedProfiler) {
    sharedProfiler = new PerformanceProfiler();
  }
  return sharedProfiler;
}
