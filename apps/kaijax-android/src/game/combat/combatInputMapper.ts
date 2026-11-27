import { GamepadBindingMap } from '../types';

export const DEFAULT_GAMEPAD_BINDINGS: GamepadBindingMap = {
  jump: 0, // A / Cross
  dodge: 1, // B / Circle
  lightAttack: 2, // X / Square
  tacticalAbility: 3, // Y / Triangle (Web / Storm Tactical)
  blockParry: 4, // LB / L1 (Hold = Agile Block, Tap = Parry)
  switchPartner: 5, // RB / R1
  aimLockOn: 6, // LT / L2
  heavyAttack: 7, // RT / R2
};

export const ALTERNATE_BUMPER_GAMEPAD_BINDINGS: GamepadBindingMap = {
  jump: 0, // A / Cross
  dodge: 1, // B / Circle
  tacticalAbility: 2, // X / Square
  switchPartner: 3, // Y / Triangle
  blockParry: 6, // LT / L2
  lightAttack: 5, // RB / R1
  heavyAttack: 7, // RT / R2
  aimLockOn: 4, // LB / L1
};

export interface PolledGamepadActions {
  moveX: number;
  moveY: number;
  hasMoveInput: boolean;
  lookX: number;
  lookY: number;
  jumpJustPressed: boolean;
  dodgeJustPressed: boolean;
  lightAttackJustPressed: boolean;
  heavyAttackJustPressed: boolean;
  tacticalJustPressed: boolean;
  blockParryJustPressed: boolean;
  blockHeld: boolean;
  switchJustPressed: boolean;
  lockOnJustPressed: boolean;
  duoChordJustPressed: boolean;
}

export interface RawGamepadLike {
  axes: readonly number[];
  buttons: readonly { pressed: boolean; value?: number }[];
}

export function remapGamepadBinding(
  current: GamepadBindingMap,
  action: keyof GamepadBindingMap,
  buttonIndex: number
): GamepadBindingMap {
  const clamped = Math.max(0, Math.min(16, Math.floor(buttonIndex)));
  const updated: GamepadBindingMap = { ...current };

  // Swap if another action already uses `clamped` so bindings stay conflict-free
  for (const key of Object.keys(updated) as (keyof GamepadBindingMap)[]) {
    if (key !== action && updated[key] === clamped) {
      updated[key] = current[action];
    }
  }
  updated[action] = clamped;
  return updated;
}

/**
 * Edge-triggered Gamepad Poller with deadzone filtering and simultaneous two-button
 * chord detection (`lightAttack + tacticalAbility`).
 */
export class GamepadInputPoller {
  private prevPressed = new Map<number, boolean>();

  public poll(
    gp: RawGamepadLike | null | undefined,
    bindings: GamepadBindingMap = DEFAULT_GAMEPAD_BINDINGS,
    deadzone = 0.16
  ): PolledGamepadActions {
    if (!gp) {
      this.prevPressed.clear();
      return {
        moveX: 0,
        moveY: 0,
        hasMoveInput: false,
        lookX: 0,
        lookY: 0,
        jumpJustPressed: false,
        dodgeJustPressed: false,
        lightAttackJustPressed: false,
        heavyAttackJustPressed: false,
        tacticalJustPressed: false,
        blockParryJustPressed: false,
        blockHeld: false,
        switchJustPressed: false,
        lockOnJustPressed: false,
        duoChordJustPressed: false,
      };
    }

    const isPressed = (idx: number): boolean => {
      const b = gp.buttons[idx];
      if (!b) return false;
      return Boolean(b.pressed || (typeof b.value === 'number' && b.value > 0.45));
    };

    const edge = (idx: number): boolean => {
      const cur = isPressed(idx);
      const was = this.prevPressed.get(idx) ?? false;
      return cur && !was;
    };

    const jumpJustPressed = edge(bindings.jump);
    const dodgeJustPressed = edge(bindings.dodge);
    const lightAttackJustPressed = edge(bindings.lightAttack);
    const heavyAttackJustPressed = edge(bindings.heavyAttack);
    const tacticalJustPressed = edge(bindings.tacticalAbility);
    const blockParryJustPressed = edge(bindings.blockParry);
    const blockHeld = isPressed(bindings.blockParry);
    const switchJustPressed = edge(bindings.switchPartner);
    const lockOnJustPressed = edge(bindings.aimLockOn);

    const bothHeld = isPressed(bindings.lightAttack) && isPressed(bindings.tacticalAbility);
    const duoChordJustPressed = bothHeld && (lightAttackJustPressed || tacticalJustPressed);

    for (let i = 0; i < gp.buttons.length; i++) {
      this.prevPressed.set(i, isPressed(i));
    }

    const ax0 = gp.axes[0] ?? 0;
    const ax1 = gp.axes[1] ?? 0;
    const ax2 = gp.axes[2] ?? 0;
    const ax3 = gp.axes[3] ?? 0;

    const hasMoveInput = Math.hypot(ax0, ax1) > deadzone;
    const moveX = Math.abs(ax0) > deadzone ? ax0 : 0;
    const moveY = Math.abs(ax1) > deadzone ? ax1 : 0;
    const lookX = Math.abs(ax2) > deadzone ? ax2 : 0;
    const lookY = Math.abs(ax3) > deadzone ? ax3 : 0;

    return {
      moveX,
      moveY,
      hasMoveInput,
      lookX,
      lookY,
      jumpJustPressed,
      dodgeJustPressed,
      lightAttackJustPressed,
      heavyAttackJustPressed,
      tacticalJustPressed,
      blockParryJustPressed,
      blockHeld,
      switchJustPressed,
      lockOnJustPressed,
      duoChordJustPressed,
    };
  }
}
