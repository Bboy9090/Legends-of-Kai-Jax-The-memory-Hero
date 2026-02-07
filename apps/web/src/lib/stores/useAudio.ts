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
  startBattleMusic: () => void;
  stopBattleMusic: () => void;
  playJump: () => void;
  playPunch: () => void;
  playKick: () => void;
  playSpecial: () => void;
  playHit: () => void;
  playKO: () => void;
  playVictory: () => void;
}

function tryPlay(a: HTMLAudioElement | null) {
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

export const useAudio = create<AudioState>((set, get) => ({
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
  startBattleMusic: () => { if (!get().isMuted) tryPlay(get().battleMusic); },
  stopBattleMusic: () => { const b = get().battleMusic; if (b) b.pause(); },
  playJump: () => tryPlay(get().hitSound),
  playPunch: () => tryPlay(get().hitSound),
  playKick: () => tryPlay(get().hitSound),
  playSpecial: () => tryPlay(get().successSound),
  playHit: () => tryPlay(get().hitSound),
  playKO: () => tryPlay(get().hitSound),
  playVictory: () => tryPlay(get().successSound),
}));
