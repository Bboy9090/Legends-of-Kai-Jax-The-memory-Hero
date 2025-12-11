export class FrameTimer {
  private frameCount = 0;
  private elapsed = 0;
  private lastTimestamp = 0;

  constructor(private targetFPS: number = 60) {}

  get currentFrame(): number {
    return this.frameCount;
  }

  get elapsedTime(): number {
    return this.elapsed;
  }

  get deltaTime(): number {
    return 1000 / this.targetFPS;
  }

  tick(timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }
    
    const delta = timestamp - this.lastTimestamp;
    this.elapsed += delta;
    this.frameCount++;
    this.lastTimestamp = timestamp;
  }

  reset(): void {
    this.frameCount = 0;
    this.elapsed = 0;
    this.lastTimestamp = 0;
  }

  framesToSeconds(frames: number): number {
    return (frames / this.targetFPS);
  }

  secondsToFrames(seconds: number): number {
    return Math.floor(seconds * this.targetFPS);
  }
}

export class CooldownTimer {
  private startTime = 0;
  private duration = 0;
  private active = false;

  start(durationMs: number): void {
    this.startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.duration = durationMs;
    this.active = true;
  }

  isActive(): boolean {
    if (!this.active) return false;
    
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - this.startTime;
    if (elapsed >= this.duration) {
      this.active = false;
      return false;
    }
    
    return true;
  }

  getProgress(): number {
    if (!this.active) return 1;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - this.startTime;
    return Math.min(elapsed / this.duration, 1);
  }

  getRemainingTime(): number {
    if (!this.active) return 0;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - this.startTime;
    return Math.max(this.duration - elapsed, 0);
  }

  reset(): void {
    this.active = false;
    this.startTime = 0;
    this.duration = 0;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export class DeltaAccumulator {
  private accumulator = 0;
  
  constructor(private fixedTimeStep: number) {}

  add(delta: number): number {
    this.accumulator += delta;
    let steps = 0;
    
    while (this.accumulator >= this.fixedTimeStep) {
      this.accumulator -= this.fixedTimeStep;
      steps++;
    }
    
    return steps;
  }

  getAlpha(): number {
    return this.accumulator / this.fixedTimeStep;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
