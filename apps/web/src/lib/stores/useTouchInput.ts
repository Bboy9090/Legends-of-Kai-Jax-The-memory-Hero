import { create } from "zustand";

interface TouchInputState {
  joystickX: number;
  joystickY: number;
  isJoystickActive: boolean;
  isTouchDevice: boolean;

  pendingAttacks: string[];

  setJoystick: (x: number, y: number, active: boolean) => void;
  releaseJoystick: () => void;
  queueAttack: (type: string) => void;
  consumeAttacks: () => string[];
  setIsTouchDevice: (val: boolean) => void;
}

const MAX_PENDING_TOUCH_ACTIONS = 4;

export const useTouchInput = create<TouchInputState>((set, get) => ({
  joystickX: 0,
  joystickY: 0,
  isJoystickActive: false,
  isTouchDevice: false,
  pendingAttacks: [],

  setJoystick: (x, y, active) =>
    set({
      joystickX: Math.max(-1, Math.min(1, x)),
      joystickY: Math.max(-1, Math.min(1, y)),
      isJoystickActive: active,
    }),
  releaseJoystick: () => set({ joystickX: 0, joystickY: 0, isJoystickActive: false }),

  queueAttack: (type) => {
    const cur = get().pendingAttacks;
    // Mobile browsers can fire duplicate touch/pointer events. Do not let one
    // physical press become an accidental multi-hit queue, and never allow an
    // unbounded backlog to execute after the player has stopped touching.
    if (cur[cur.length - 1] === type) return;
    set({ pendingAttacks: [...cur, type].slice(-MAX_PENDING_TOUCH_ACTIONS) });
  },

  consumeAttacks: () => {
    const cur = get().pendingAttacks;
    if (cur.length === 0) return cur;
    set({ pendingAttacks: [] });
    return cur;
  },

  setIsTouchDevice: (val) => set({ isTouchDevice: val }),
}));
