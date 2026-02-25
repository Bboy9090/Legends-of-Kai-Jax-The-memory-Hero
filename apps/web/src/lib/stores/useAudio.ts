import { create } from "zustand";
import { persist } from "zustand/middleware";

const STATUE_IDS = new Set(["marble-gladiator", "granite-colossus", "sandstone-sentinel"]);

const AUDIO_STORAGE = "MK_AUDIO_SETTINGS_V1";

export function isStatueFighter(id: string): boolean {
  return STATUE_IDS.has(id);
}

let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
    return null;
  }
  return audioCtx;
}

function unlockAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
}

if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudioCtx();
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

function getSfxMultiplier(): number {
  try {
    const s = useAudio.getState();
    return s.masterVolume * s.sfxVolume;
  } catch {
    return 1;
  }
}

function playStoneGrind(type: "move" | "attack" | "hit") {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const mult = getSfxMultiplier();
    const duration = type === "move" ? 0.25 : type === "attack" ? 0.4 : 0.15;
    const baseFreq = type === "move" ? 80 : type === "attack" ? 120 : 200;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * (type === "move" ? 6 : 4));
      const noise = (Math.random() * 2 - 1) * 0.3;
      const grind = Math.sin(2 * Math.PI * baseFreq * t + Math.sin(t * 300) * 2) * 0.4;
      const rumble = Math.sin(2 * Math.PI * 40 * t) * 0.3;
      data[i] = (noise + grind + rumble) * env;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = type === "move" ? 600 : 1200;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    const baseGain = type === "move" ? 0.15 : type === "attack" ? 0.25 : 0.2;
    gain.gain.value = baseGain * mult;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch (err) {
    if (import.meta.env?.DEV) console.warn("[useAudio] playStoneGrind error:", err);
  }
}

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  battleMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  setBackgroundMusic: (a: HTMLAudioElement | null) => void;
  setBattleMusic: (a: HTMLAudioElement | null) => void;
  setHitSound: (a: HTMLAudioElement | null) => void;
  setSuccessSound: (a: HTMLAudioElement | null) => void;
  setMuted: (m: boolean) => void;
  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  startBattleMusic: () => void;
  stopBattleMusic: () => void;
  playJump: () => void;
  playPunch: () => void;
  playKick: () => void;
  playSpecial: () => void;
  playHit: () => void;
  playKO: () => void;
  playVictory: () => void;
  playStoneMove: () => void;
  playStoneAttack: () => void;
  playStoneHit: () => void;
}

function tryPlay(a: HTMLAudioElement | null, muted = false, playbackRate = 1) {
  try {
    if (!a || muted) return;
    const s = useAudio.getState();
    a.volume = s.masterVolume * s.sfxVolume;
    a.playbackRate = playbackRate;
    a.currentTime = 0;
    a.play().catch((err) => {
      if (import.meta.env?.DEV) {
        console.warn("[useAudio] Play failed (e.g. file missing):", err);
      }
    });
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn("[useAudio] tryPlay error:", err);
    }
  }
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
  backgroundMusic: null,
  battleMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  masterVolume: 1,
  musicVolume: 1,
  sfxVolume: 1,
  setBackgroundMusic: (backgroundMusic) => set({ backgroundMusic }),
  setBattleMusic: (battleMusic) => set({ battleMusic }),
  setHitSound: (hitSound) => set({ hitSound }),
  setSuccessSound: (successSound) => set({ successSound }),
  setMuted: (isMuted) => set({ isMuted }),
  setMasterVolume: (masterVolume) => set({ masterVolume: Math.max(0, Math.min(1, masterVolume)) }),
  setMusicVolume: (musicVolume) => set({ musicVolume: Math.max(0, Math.min(1, musicVolume)) }),
  setSfxVolume: (sfxVolume) => set({ sfxVolume: Math.max(0, Math.min(1, sfxVolume)) }),
  startBattleMusic: () => {
    try {
      const s = get();
      if (s.isMuted || !s.battleMusic) return;
      s.battleMusic.volume = 0.4 * s.masterVolume * s.musicVolume;
      s.battleMusic.currentTime = 0;
      s.battleMusic.play().catch((err) => {
        if (import.meta.env?.DEV) console.warn("[useAudio] Battle music play failed:", err);
      });
    } catch (err) {
      if (import.meta.env?.DEV) console.warn("[useAudio] startBattleMusic error:", err);
    }
  },
  stopBattleMusic: () => { const b = get().battleMusic; if (b) b.pause(); },
  playJump: () => tryPlay(get().hitSound, get().isMuted),
  playPunch: () => tryPlay(get().hitSound, get().isMuted, 1),
  playKick: () => tryPlay(get().hitSound, get().isMuted, 1.1),
  playSpecial: () => tryPlay(get().successSound, get().isMuted),
  playHit: () => tryPlay(get().hitSound, get().isMuted),
  playKO: () => tryPlay(get().hitSound, get().isMuted),
  playVictory: () => tryPlay(get().successSound, get().isMuted),
  playStoneMove: () => { if (!get().isMuted) playStoneGrind("move"); },
  playStoneAttack: () => { if (!get().isMuted) playStoneGrind("attack"); },
  playStoneHit: () => { if (!get().isMuted) playStoneGrind("hit"); },
}),
    {
      name: AUDIO_STORAGE,
      partialize: (s) => ({
        isMuted: s.isMuted,
        masterVolume: s.masterVolume,
        musicVolume: s.musicVolume,
        sfxVolume: s.sfxVolume,
      }),
    }
  )
);
