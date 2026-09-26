/**
 * GAMEPLAY PULSE BUFFER
 *
 * Captures short edge-triggered traversal/interaction inputs at the DOM/touch
 * event boundary so a press cannot disappear between sparse render frames.
 * Level-state input remains owned by GameplayInputState; this buffer only
 * preserves one-shot intent for actions whose semantics are rising-edge based.
 */

export type BufferedGameplayPulse = 'jump' | 'traversal' | 'interact';

const KEY_TO_PULSE: Record<string, BufferedGameplayPulse | undefined> = {
  Space: 'jump',
  KeyE: 'traversal',
  KeyF: 'interact',
};

const MAX_QUEUED_PULSES = 3;

export class GameplayPulseBuffer {
  private queued: Record<BufferedGameplayPulse, number> = {
    jump: 0,
    traversal: 0,
    interact: 0,
  };

  private heldCodes = new Set<string>();
  private attached = false;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const wasHeld = this.heldCodes.has(event.code);
    this.heldCodes.add(event.code);
    if (event.repeat || wasHeld) return;

    const pulse = KEY_TO_PULSE[event.code];
    if (pulse) this.enqueue(pulse);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.heldCodes.delete(event.code);
  };

  constructor(attachToWindow = true) {
    if (attachToWindow) this.attach();
  }

  attach(): void {
    if (this.attached || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.attached = true;
  }

  dispose(): void {
    if (!this.attached || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.attached = false;
    this.heldCodes.clear();
    this.clear();
  }

  enqueue(action: BufferedGameplayPulse): void {
    this.queued[action] = Math.min(MAX_QUEUED_PULSES, this.queued[action] + 1);
  }

  consume(action: BufferedGameplayPulse): boolean {
    if (this.queued[action] <= 0) return false;
    this.queued[action] -= 1;
    return true;
  }

  pending(action: BufferedGameplayPulse): number {
    return this.queued[action];
  }

  clear(action?: BufferedGameplayPulse): void {
    if (action) {
      this.queued[action] = 0;
      return;
    }
    this.queued.jump = 0;
    this.queued.traversal = 0;
    this.queued.interact = 0;
  }
}

export const gameplayPulseBuffer = new GameplayPulseBuffer();
