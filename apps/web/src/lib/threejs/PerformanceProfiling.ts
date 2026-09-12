/**
 * PERFORMANCE PROFILING UTILITIES
 * Tools for measuring and analyzing game performance
 *
 * Usage:
 * - Collect frame timings
 * - Measure component render costs
 * - Detect memory leaks
 * - Analyze bottlenecks
 */

export interface FrameTimingsample {
  timestamp: number;
  frameTime: number;
  renderTime: number;
  aiTime: number;
  fps: number;
}

export interface PerformanceReport {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  p50FrameTime: number;
  p95FrameTime: number;
  p99FrameTime: number;
  memoryHeapUsedMb: number;
  memoryHeapLimitMb: number;
  totalFrames: number;
  droppedFrames: number; // Frames > 33ms (< 30 fps)
  stableMemory: boolean;
}

/**
 * Collects performance metrics over time
 */
export class PerformanceProfiler {
  private samples: FrameTimingsample[] = [];
  private readonly maxSamples: number;
  private lastTime = performance.now();
  private memoryReadings: number[] = [];

  constructor(maxSamples: number = 300) {
    this.maxSamples = maxSamples;
  }

  /**
   * Record a frame
   */
  recordFrame(frameTime: number, renderTime: number = 0, aiTime: number = 0): void {
    const now = performance.now();
    const fps = 1000 / frameTime;

    this.samples.push({
      timestamp: now,
      frameTime,
      renderTime,
      aiTime,
      fps,
    });

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    this.lastTime = now;
  }

  /**
   * Record memory snapshot
   */
  recordMemory(): void {
    if ('memory' in performance) {
      const heapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      this.memoryReadings.push(heapUsed);

      if (this.memoryReadings.length > this.maxSamples) {
        this.memoryReadings.shift();
      }
    }
  }

  /**
   * Generate performance report
   */
  getReport(): PerformanceReport {
    if (this.samples.length === 0) {
      return {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        p50FrameTime: 0,
        p95FrameTime: 0,
        p99FrameTime: 0,
        memoryHeapUsedMb: 0,
        memoryHeapLimitMb: 0,
        totalFrames: 0,
        droppedFrames: 0,
        stableMemory: true,
      };
    }

    const frameTimes = this.samples.map((s) => s.frameTime);
    const fpsSamples = this.samples.map((s) => s.fps);

    // Sort for percentiles
    const sortedFrameTimes = [...frameTimes].sort((a, b) => a - b);
    const sortedFps = [...fpsSamples].sort((a, b) => a - b);

    const getPercentile = (arr: number[], p: number) => {
      const idx = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, Math.min(idx, arr.length - 1))];
    };

    // Memory analysis
    let memoryHeapUsed = 0;
    let memoryHeapLimit = 0;
    if ('memory' in performance) {
      memoryHeapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      memoryHeapLimit = (performance as any).memory.jsHeapSizeLimit / 1024 / 1024;
    }

    // Detect memory stability
    const memStdDev = this.calculateStdDev(this.memoryReadings);
    const stableMemory = memStdDev < 20; // Stable if < 20MB variance

    // Count dropped frames (> 33ms = < 30fps)
    const droppedFrames = frameTimes.filter((t) => t > 33.33).length;

    return {
      averageFPS: Math.round(getPercentile(sortedFps, 50) * 10) / 10,
      minFPS: Math.round(getPercentile(sortedFps, 5) * 10) / 10,
      maxFPS: Math.round(getPercentile(sortedFps, 95) * 10) / 10,
      p50FrameTime: Math.round(getPercentile(sortedFrameTimes, 50) * 100) / 100,
      p95FrameTime: Math.round(getPercentile(sortedFrameTimes, 95) * 100) / 100,
      p99FrameTime: Math.round(getPercentile(sortedFrameTimes, 99) * 100) / 100,
      memoryHeapUsedMb: Math.round(memoryHeapUsed * 10) / 10,
      memoryHeapLimitMb: Math.round(memoryHeapLimit),
      totalFrames: this.samples.length,
      droppedFrames,
      stableMemory,
    };
  }

  /**
   * Get recent samples (for graphing)
   */
  getRecentSamples(count: number = 60): FrameTimingsample[] {
    return this.samples.slice(-count);
  }

  /**
   * Calculate standard deviation (for memory stability)
   */
  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((v) => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;

    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Reset profiler
   */
  reset(): void {
    this.samples = [];
    this.memoryReadings = [];
  }
}

/**
 * Component-level performance tracker
 */
export class ComponentPerformanceTracker {
  private componentTimes: Map<string, number[]> = new Map();
  private readonly maxSamplesPerComponent = 100;

  /**
   * Record render time for a component
   */
  recordRender(componentName: string, renderTimeMs: number): void {
    if (!this.componentTimes.has(componentName)) {
      this.componentTimes.set(componentName, []);
    }

    const times = this.componentTimes.get(componentName)!;
    times.push(renderTimeMs);

    if (times.length > this.maxSamplesPerComponent) {
      times.shift();
    }
  }

  /**
   * Get average render time for component
   */
  getAverageRenderTime(componentName: string): number {
    const times = this.componentTimes.get(componentName);
    if (!times || times.length === 0) return 0;

    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Get all tracked components with their stats
   */
  getReport(): Record<string, { avg: number; max: number; samples: number }> {
    const report: Record<string, { avg: number; max: number; samples: number }> = {};

    this.componentTimes.forEach((times, componentName) => {
      report[componentName] = {
        avg: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100,
        max: Math.max(...times),
        samples: times.length,
      };
    });

    return report;
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.componentTimes.clear();
  }
}

/**
 * Memory leak detector
 * Monitors heap size for monotonic increase
 */
export class MemoryLeakDetector {
  private readings: number[] = [];
  private readonly sampleInterval = 1000; // 1 second
  private lastSampleTime = 0;
  private isMonitoring = false;

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.readings = [];
    this.lastSampleTime = performance.now();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Update monitoring (call periodically, e.g., every 100ms)
   */
  update(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    if (now - this.lastSampleTime < this.sampleInterval) {
      return;
    }

    if ('memory' in performance) {
      const heapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      this.readings.push(heapUsed);
      this.lastSampleTime = now;

      // Keep last 60 samples (60 seconds of data)
      if (this.readings.length > 60) {
        this.readings.shift();
      }
    }
  }

  /**
   * Analyze memory trend
   * Returns leak probability (0-1)
   */
  analyzeTrend(): {
    leakDetected: boolean;
    leakProbability: number;
    avgGrowthMbPerSecond: number;
    timespan: number;
  } {
    if (this.readings.length < 10) {
      return {
        leakDetected: false,
        leakProbability: 0,
        avgGrowthMbPerSecond: 0,
        timespan: this.readings.length,
      };
    }

    // Simple linear regression to detect trend
    const n = this.readings.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += this.readings[i];
      sumXY += i * this.readings[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgGrowthMbPerSecond = slope; // Each sample is 1 second apart

    // Leak likely if consistently growing > 0.5 MB/sec
    const leakDetected = avgGrowthMbPerSecond > 0.5;
    const leakProbability = Math.min(1, Math.max(0, avgGrowthMbPerSecond / 2));

    return {
      leakDetected,
      leakProbability: Math.round(leakProbability * 100) / 100,
      avgGrowthMbPerSecond: Math.round(avgGrowthMbPerSecond * 100) / 100,
      timespan: n,
    };
  }

  /**
   * Get readings for graph
   */
  getReadings(): number[] {
    return [...this.readings];
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.readings = [];
    this.isMonitoring = false;
  }
}

/**
 * Global performance profiler instance
 */
export const globalProfiler = new PerformanceProfiler();

/**
 * Global component tracker
 */
export const globalComponentTracker = new ComponentPerformanceTracker();

/**
 * Global memory leak detector
 */
export const globalMemoryLeakDetector = new MemoryLeakDetector();
