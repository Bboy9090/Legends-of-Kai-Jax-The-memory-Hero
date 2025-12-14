import { CounterWindow } from '@smash-heroes/shared';
import { COMBAT_CONSTANTS } from '@smash-heroes/shared';

export class CounterSystem {
  private counterWindows: Map<string, CounterWindow> = new Map();
  private parryWindows: Map<string, CounterWindow> = new Map();

  startCounterWindow(fighterId: string, currentFrame: number): void {
    this.counterWindows.set(fighterId, {
      active: true,
      startFrame: currentFrame,
      endFrame: currentFrame + COMBAT_CONSTANTS.COUNTER_WINDOW_FRAMES,
      successMultiplier: COMBAT_CONSTANTS.COUNTER_MULTIPLIER,
    });
  }

  startParryWindow(fighterId: string, currentFrame: number): void {
    this.parryWindows.set(fighterId, {
      active: true,
      startFrame: currentFrame,
      endFrame: currentFrame + COMBAT_CONSTANTS.PARRY_WINDOW_FRAMES,
      successMultiplier: COMBAT_CONSTANTS.PARRY_MULTIPLIER,
    });
  }

  checkCounter(fighterId: string, currentFrame: number): boolean {
    const window = this.counterWindows.get(fighterId);
    
    if (!window || !window.active) return false;

    if (currentFrame >= window.startFrame && currentFrame <= window.endFrame) {
      // Successful counter!
      this.endCounterWindow(fighterId);
      return true;
    }

    // Window expired
    if (currentFrame > window.endFrame) {
      this.endCounterWindow(fighterId);
    }

    return false;
  }

  checkParry(fighterId: string, currentFrame: number): boolean {
    const window = this.parryWindows.get(fighterId);
    
    if (!window || !window.active) return false;

    if (currentFrame >= window.startFrame && currentFrame <= window.endFrame) {
      // Successful parry!
      const isPerfect = currentFrame === window.startFrame;
      
      if (isPerfect) {
        // Perfect parry extends counter window
        this.startCounterWindow(
          fighterId,
          currentFrame + COMBAT_CONSTANTS.PERFECT_PARRY_BONUS_FRAMES
        );
      }
      
      this.endParryWindow(fighterId);
      return true;
    }

    // Window expired
    if (currentFrame > window.endFrame) {
      this.endParryWindow(fighterId);
    }

    return false;
  }

  isCounterActive(fighterId: string): boolean {
    return this.counterWindows.get(fighterId)?.active ?? false;
  }

  isParryActive(fighterId: string): boolean {
    return this.parryWindows.get(fighterId)?.active ?? false;
  }

  endCounterWindow(fighterId: string): void {
    const window = this.counterWindows.get(fighterId);
    if (window) {
      window.active = false;
    }
  }

  endParryWindow(fighterId: string): void {
    const window = this.parryWindows.get(fighterId);
    if (window) {
      window.active = false;
    }
  }

  update(currentFrame: number): void {
    // Check and expire old windows
    this.counterWindows.forEach((window, fighterId) => {
      if (window.active && currentFrame > window.endFrame) {
        this.endCounterWindow(fighterId);
      }
    });

    this.parryWindows.forEach((window, fighterId) => {
      if (window.active && currentFrame > window.endFrame) {
        this.endParryWindow(fighterId);
      }
    });
  }

  reset(fighterId: string): void {
    this.counterWindows.delete(fighterId);
    this.parryWindows.delete(fighterId);
  }

  resetAll(): void {
    this.counterWindows.clear();
    this.parryWindows.clear();
  }
}
