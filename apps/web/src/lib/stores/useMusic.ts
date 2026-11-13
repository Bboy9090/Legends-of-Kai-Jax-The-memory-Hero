import { create } from "zustand";

const KEY = "kaijax_music_v1";

interface MusicSettings {
  /** Procedural mood-reactive music; when off the legacy looping track plays in battle instead. */
  adaptive: boolean;
  /** 0..1, multiplied with the master volume. */
  musicVolume: number;
}

interface MusicState extends MusicSettings {
  setAdaptive: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
}

export function normalizeMusicSettings(raw: unknown): MusicSettings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const v = typeof o.musicVolume === "number" && Number.isFinite(o.musicVolume) ? Math.min(1, Math.max(0, o.musicVolume)) : 0.7;
  return { adaptive: typeof o.adaptive === "boolean" ? o.adaptive : true, musicVolume: v };
}

function load(): MusicSettings {
  try {
    if (typeof localStorage !== "undefined") return normalizeMusicSettings(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    // fall through
  }
  return normalizeMusicSettings(null);
}

function save(s: MusicSettings) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export const useMusic = create<MusicState>((set, get) => ({
  ...load(),
  setAdaptive: (adaptive) => {
    set({ adaptive });
    save({ adaptive, musicVolume: get().musicVolume });
  },
  setMusicVolume: (v) => {
    const { musicVolume } = normalizeMusicSettings({ musicVolume: v });
    set({ musicVolume });
    save({ adaptive: get().adaptive, musicVolume });
  },
}));
