import { create } from "zustand";
import { persist } from "zustand/middleware";

const KEYBINDS_STORAGE = "kai_jax_keybinds_v1";

export type KeybindAction =
  | "punch"
  | "kick"
  | "special"
  | "ultimate"
  | "transform"
  | "jump"
  | "pause";

export interface KeybindsState {
  punch: string;
  kick: string;
  special: string;
  ultimate: string;
  transform: string;
  jump: string;
  pause: string;

  setKeybind: (action: KeybindAction, code: string) => boolean;
  getBinds: () => Record<KeybindAction, string>;
}

function validateNoDuplicate(
  action: KeybindAction,
  newCode: string,
  current: Record<KeybindAction, string>
): boolean {
  const others = (Object.keys(current) as KeybindAction[]).filter((k) => k !== action);
  return !others.some((k) => current[k] === newCode);
}

const DEFAULT_KEYBINDS: Record<KeybindAction, string> = {
  punch: "KeyJ",
  kick: "KeyK",
  special: "KeyL",
  ultimate: "KeyR",
  transform: "KeyT",
  jump: "Space",
  pause: "KeyP",
};

export const useKeybinds = create<KeybindsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_KEYBINDS,

      setKeybind: (action: KeybindAction, code: string) => {
        const s = get();
        const current: Record<KeybindAction, string> = {
          punch: s.punch,
          kick: s.kick,
          special: s.special,
          ultimate: s.ultimate,
          transform: s.transform,
          jump: s.jump,
          pause: s.pause,
        };
        if (!validateNoDuplicate(action, code, current)) {
          return false;
        }
        set({ [action]: code });
        return true;
      },

      getBinds: () => {
        const s = get();
        return {
          punch: s.punch,
          kick: s.kick,
          special: s.special,
          ultimate: s.ultimate,
          transform: s.transform,
          jump: s.jump,
          pause: s.pause,
        };
      },
    }),
    { name: KEYBINDS_STORAGE }
  )
);
