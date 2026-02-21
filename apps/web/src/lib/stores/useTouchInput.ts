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

export const useTouchInput = create<TouchInputState>((set, get) => ({
  joystickX: 0,
  joystickY: 0,
  isJoystickActive: false,
  isTouchDevice: false,
  pendingAttacks: [],

  setJoystick: (x, y, active) => set({ joystickX: x, joystickY: y, isJoystickActive: active }),
  releaseJoystick: () => set({ joystickX: 0, joystickY: 0, isJoystickActive: false }),

  queueAttack: (type) => {
    const cur = get().pendingAttacks;
    set({ pendingAttacks: [...cur, type] });
  },

  consumeAttacks: () => {
    const cur = get().pendingAttacks;
    if (cur.length === 0) return cur;
    set({ pendingAttacks: [] });
    return cur;
  },

  setIsTouchDevice: (val) => set({ isTouchDevice: val }),
}));
