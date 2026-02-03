import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  battleMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  setBackgroundMusic: (a: HTMLAudioElement | null) => void;
  setBattleMusic: (a: HTMLAudioElement | null) => void;
  setHitSound: (a: HTMLAudioElement | null) => void;
  setSuccessSound: (a: HTMLAudioElement | null) => void;
  setMuted: (m: boolean) => void;
}

export const useAudio = create<AudioState>((set) => ({
  backgroundMusic: null,
  battleMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  setBackgroundMusic: (backgroundMusic) => set({ backgroundMusic }),
  setBattleMusic: (battleMusic) => set({ battleMusic }),
  setHitSound: (hitSound) => set({ hitSound }),
  setSuccessSound: (successSound) => set({ successSound }),
  setMuted: (isMuted) => set({ isMuted }),
}));
