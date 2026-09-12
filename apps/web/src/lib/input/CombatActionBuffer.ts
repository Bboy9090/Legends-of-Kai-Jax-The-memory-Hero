/**
 * COMBAT ACTION BUFFER
 *
 * Keyboard combat presses are captured on the DOM event itself instead of being
 * inferred from a later render-frame sample. This keeps a short keydown/keyup
 * pair from disappearing when WebGL is running below the target frame rate.
 *
 * The buffer is intentionally separate from GameplayInputState. Shared input
 * reads stay level-based and non-consuming so systems such as the temporary Kai
 * slice adapter can observe the same input without another consumer clearing it.
 */

export type BufferedCombatAction =
  | 'attackLight'
  | 'attackHeavy'
  | 'attackSpecial'
  | 'attackUltimate'
  | 'dodge';

const KEY_TO_ACTION: Record<string, BufferedCombatAction | undefined> = {
  KeyJ: 'attackLight',
  KeyX: 'attackLight',
  KeyK: 'attackHeavy',
  KeyZ: 'attackHeavy',
  KeyL: 'attackSpecial',
  KeyC: 'attackSpecial',
  KeyI: 'attackUltimate',
  KeyV: 'attackUltimate',
  KeyQ: 'dodge',
};

const MAX_QUEUED_PRESSES = 3;

export class CombatActionBuffer {
  private queued: Record<BufferedCombatAction, number> = {
    attackLight: 0,
    attackHeavy: 0,
    attackSpecial: 0,
    attackUltimate: 0,
    dodge: 0,
  };

  private heldCodes = new Set<string>();
  private attached = false;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const wasHeld = this.heldCodes.has(event.code);
    this.heldCodes.add(event.code);

    if (event.repeat || wasHeld) return;
    const action = KEY_TO_ACTION[event.code];
    if (action) this.enqueue(action);
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

  /**
   * Public enqueue point for touch/gamepad adapters. Keyboard uses this from the
   * real keydown event above; other devices can feed the same queue when their
   * event/polling adapters are hardened.
   */
  enqueue(action: BufferedCombatAction): void {
    this.queued[action] = Math.min(
      MAX_QUEUED_PRESSES,
      this.queued[action] + 1
    );
  }

  consume(action: BufferedCombatAction): boolean {
    if (this.queued[action] <= 0) return false;
    this.queued[action] -= 1;
    return true;
  }

  pending(action: BufferedCombatAction): number {
    return this.queued[action];
  }

  clear(action?: BufferedCombatAction): void {
    if (action) {
      this.queued[action] = 0;
      return;
    }

    this.queued.attackLight = 0;
    this.queued.attackHeavy = 0;
    this.queued.attackSpecial = 0;
    this.queued.attackUltimate = 0;
    this.queued.dodge = 0;
  }
}

export const combatActionBuffer = new CombatActionBuffer();
