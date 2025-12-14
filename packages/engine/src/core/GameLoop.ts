import { GAME_CONSTANTS } from '@smash-heroes/shared';
import { DeltaAccumulator } from '@smash-heroes/shared';

export interface GameLoopCallbacks {
  update: (deltaTime: number) => void;
  render: (alpha: number) => void;
  onFpsUpdate?: (fps: number) => void;
}

export class GameLoop {
  private running = false;
  private paused = false;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;
  private deltaAccumulator: DeltaAccumulator;
  private frameCount = 0;
  private fpsTimer = 0;
  private fpsFrameCount = 0;
  private currentFps = 0;

  constructor(
    private callbacks: GameLoopCallbacks,
    private targetFPS = GAME_CONSTANTS.TARGET_FPS,
    private fixedTimeStep = GAME_CONSTANTS.FIXED_TIMESTEP
  ) {
    this.deltaAccumulator = new DeltaAccumulator(fixedTimeStep);
  }

  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTimestamp = performance.now();
  }

  isPaused(): boolean {
    return this.paused;
  }

  isRunning(): boolean {
    return this.running;
  }

  getFps(): number {
    return this.currentFps;
  }

  getFrameCount(): number {
    return this.frameCount;
  }

  private loop = (timestamp: number): void => {
    if (!this.running) return;

    this.animationFrameId = requestAnimationFrame(this.loop);

    if (this.paused) return;

    // Calculate delta time
    let deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Prevent spiral of death by capping delta time
    if (deltaTime > GAME_CONSTANTS.MAX_DELTA_TIME) {
      deltaTime = GAME_CONSTANTS.MAX_DELTA_TIME;
    }

    // Fixed timestep update
    const steps = this.deltaAccumulator.add(deltaTime);
    for (let i = 0; i < steps; i++) {
      this.callbacks.update(this.fixedTimeStep);
      this.frameCount++;
    }

    // Get interpolation alpha for smooth rendering
    const alpha = this.deltaAccumulator.getAlpha();
    this.callbacks.render(alpha);

    // FPS calculation
    this.updateFps(deltaTime);
  };

  private updateFps(deltaTime: number): void {
    this.fpsTimer += deltaTime;
    this.fpsFrameCount++;

    // Update FPS every second
    if (this.fpsTimer >= 1000) {
      this.currentFps = Math.round((this.fpsFrameCount * 1000) / this.fpsTimer);
      
      if (this.callbacks.onFpsUpdate) {
        this.callbacks.onFpsUpdate(this.currentFps);
      }

      this.fpsTimer = 0;
      this.fpsFrameCount = 0;
    }
  }

  reset(): void {
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.fpsFrameCount = 0;
    this.currentFps = 0;
    this.deltaAccumulator.reset();
  }
}
