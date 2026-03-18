// Performance Profiler
// Path: packages/game/src/debug/PerformanceProfiler.ts

/**
 * Performance profiler for game systems
 * Tracks frame time, system updates, and identifies bottlenecks
 */
export class PerformanceProfiler {
  private markers: Map<string, number[]> = new Map();
  private currentFrame: Map<string, number> = new Map();
  private frameMetrics: {
    fps: number;
    avgFrameTime: number;
    maxFrameTime: number;
    minFrameTime: number;
    timestamp: number;
  } = {
    fps: 0,
    avgFrameTime: 0,
    maxFrameTime: 0,
    minFrameTime: Infinity,
    timestamp: 0,
  };

  private frameCount = 0;
  private lastFrameTime = performance.now();
  private frameTimeBuffer: number[] = [];
  private readonly FRAME_BUFFER_SIZE = 60; // 1 second at 60fps

  /**
   * Start timing a system
   */
  public startMark(label: string): void {
    this.currentFrame.set(label, performance.now());
  }

  /**
   * End timing a system and record
   */
  public endMark(label: string): void {
    const startTime = this.currentFrame.get(label);
    if (!startTime) {
      console.warn(`[Profiler] No start mark for ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    const marks = this.markers.get(label) || [];
    marks.push(duration);

    // Keep only last 100 measurements
    if (marks.length > 100) {
      marks.shift();
    }

    this.markers.set(label, marks);
    this.currentFrame.delete(label);
  }

  /**
   * Update frame metrics
   */
  public updateFrameMetrics(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.frameTimeBuffer.push(frameTime);
    if (this.frameTimeBuffer.length > this.FRAME_BUFFER_SIZE) {
      this.frameTimeBuffer.shift();
    }

    this.frameMetrics.timestamp = now;

    // Calculate metrics
    const avgTime =
      this.frameTimeBuffer.reduce((a, b) => a + b, 0) /
      this.frameTimeBuffer.length;
    const maxTime = Math.max(...this.frameTimeBuffer);
    const minTime = Math.min(...this.frameTimeBuffer);
    const fps = 1000 / avgTime;

    this.frameMetrics.avgFrameTime = avgTime;
    this.frameMetrics.maxFrameTime = maxTime;
    this.frameMetrics.minFrameTime = minTime;
    this.frameMetrics.fps = fps;
    this.frameCount++;
  }

  /**
   * Get metrics for a specific system
   */
  public getSystemMetrics(label: string) {
    const marks = this.markers.get(label) || [];
    if (marks.length === 0) {
      return {
        label,
        count: 0,
        avg: 0,
        max: 0,
        min: 0,
      };
    }

    const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
    const max = Math.max(...marks);
    const min = Math.min(...marks);

    return {
      label,
      count: marks.length,
      avg: avg.toFixed(3),
      max: max.toFixed(3),
      min: min.toFixed(3),
      totalMs: (avg * marks.length).toFixed(1),
    };
  }

  /**
   * Get all system metrics
   */
  public getAllMetrics() {
    const metrics = [];
    for (const label of this.markers.keys()) {
      metrics.push(this.getSystemMetrics(label));
    }
    return {
      frame: this.frameMetrics,
      systems: metrics,
    };
  }

  /**
   * Get frame metrics
   */
  public getFrameMetrics() {
    return {
      fps: this.frameMetrics.fps.toFixed(1),
      avgFrameTime: this.frameMetrics.avgFrameTime.toFixed(2),
      maxFrameTime: this.frameMetrics.maxFrameTime.toFixed(2),
      minFrameTime: this.frameMetrics.minFrameTime.toFixed(2),
    };
  }

  /**
   * Display metrics in console
   */
  public logMetrics(): void {
    const metrics = this.getAllMetrics();
    console.group('[Performance Profiler]');
    console.log('Frame Metrics:', metrics.frame);
    console.table(metrics.systems);
    console.groupEnd();
  }

  /**
   * Create HTML performance display widget
   */
  public createHtmlWidget(): HTMLElement {
    const widget = document.createElement('div');
    widget.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      padding: 10px;
      font-family: monospace;
      font-size: 11px;
      z-index: 9999;
      border: 1px solid #0f0;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `;

    const updateWidget = () => {
      const metrics = this.getAllMetrics();
      let html = `
        <div style="margin-bottom: 8px;">
          <b>FPS: ${metrics.frame.fps.toFixed(1)}</b><br>
          Avg: ${metrics.frame.avgFrameTime.toFixed(2)}ms<br>
          Max: ${metrics.frame.maxFrameTime.toFixed(2)}ms
        </div>
        <div style="border-top: 1px solid #0f0; padding-top: 8px;">
      `;

      for (const sys of metrics.systems) {
        html += `
          <div style="margin-bottom: 4px;">
            ${sys.label}: ${sys.avg}ms
          </div>
        `;
      }

      html += '</div>';
      widget.innerHTML = html;
    };

    // Update every 500ms
    setInterval(updateWidget, 500);
    updateWidget();

    return widget;
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.markers.clear();
    this.currentFrame.clear();
    this.frameCount = 0;
    this.frameTimeBuffer = [];
  }
}

// Global profiler instance
let globalProfiler: PerformanceProfiler | null = null;

/**
 * Get or create global profiler
 */
export function getProfiler(): PerformanceProfiler {
  if (!globalProfiler) {
    globalProfiler = new PerformanceProfiler();
  }
  return globalProfiler;
}

/**
 * Profiler helper decorators
 */
export function profile(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const profiler = getProfiler();
    profiler.startMark(propertyKey);
    const result = originalMethod.apply(this, args);
    profiler.endMark(propertyKey);
    return result;
  };

  return descriptor;
}
