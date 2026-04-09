import { create } from "zustand";

const STATUE_IDS = new Set(["marble-gladiator", "granite-colossus", "sandstone-sentinel"]);

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

function playStoneGrind(type: "move" | "attack" | "hit") {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
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
    gain.gain.value = type === "move" ? 0.15 : type === "attack" ? 0.25 : 0.2;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch (_e) {}
}

function playDodgeWhoosh() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const duration = 0.12;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.sin((Math.PI * t) / duration);
      const sweep = Math.sin(2 * Math.PI * (2200 * t * (1 - t * 3)));
      data[i] = sweep * 0.35 * env;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch (_e) {}
}

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
  playStoneMove: () => void;
  playStoneAttack: () => void;
  playStoneHit: () => void;
  /** Short movement whoosh (procedural; battle dodge / roll) */
  playDodge: () => void;
  /** 0..1 adaptive battle music intensity (combo + low HP); no-op if unsupported */
  battleIntensity: number;
  setBattleIntensity: (n: number) => void;
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
  battleIntensity: 0,
  setBattleIntensity: (battleIntensity) =>
    set({ battleIntensity: Math.max(0, Math.min(1, battleIntensity)) }),
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
  playStoneMove: () => { if (!get().isMuted) playStoneGrind("move"); },
  playStoneAttack: () => { if (!get().isMuted) playStoneGrind("attack"); },
  playStoneHit: () => { if (!get().isMuted) playStoneGrind("hit"); },
  playDodge: () => { if (!get().isMuted) playDodgeWhoosh(); },
}));
