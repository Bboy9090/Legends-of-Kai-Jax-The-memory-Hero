import { create } from "zustand";
import { audioSystem, type SfxId } from "../../systems/AudioSystem";

const STATUE_IDS = new Set(["marble-gladiator", "granite-colossus", "sandstone-sentinel"]);

export function isStatueFighter(id: string): boolean {
  return STATUE_IDS.has(id);
}

let audioCtx: AudioContext | null = null;
let resumeBackgroundMusicAfterVisibility = false;
let resumeBattleMusicAfterVisibility = false;
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
  toggleMute: () => void;
  /** 0..1 master volume for procedural SFX (persisted). */
  volume: number;
  setVolume: (v: number) => void;
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

const SETTINGS_KEY = "kj-audio-settings";

function loadSettings(): { muted: boolean; volume: number } {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        muted: parsed?.muted === true,
        volume: typeof parsed?.volume === "number" ? Math.max(0, Math.min(1, parsed.volume)) : 0.7,
      };
    }
  } catch {
    // Storage unavailable or corrupt: fall back to defaults.
  }
  return { muted: false, volume: 0.7 };
}

function saveSettings(muted: boolean, volume: number) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(SETTINGS_KEY, JSON.stringify({ muted, volume }));
  } catch {
    // Persisting is best-effort.
  }
}

const initialSettings = loadSettings();
audioSystem.setVolume(initialSettings.volume);

function procedural(get: () => AudioState, id: SfxId) {
  const { isMuted, volume } = get();
  if (isMuted) return;
  audioSystem.setVolume(volume);
  audioSystem.play(id);
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  battleMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: initialSettings.muted,
  volume: initialSettings.volume,
  battleIntensity: 0,
  setBattleIntensity: (battleIntensity) =>
    set({ battleIntensity: Math.max(0, Math.min(1, battleIntensity)) }),
  setBackgroundMusic: (backgroundMusic) => set({ backgroundMusic }),
  setBattleMusic: (battleMusic) => set({ battleMusic }),
  setHitSound: (hitSound) => set({ hitSound }),
  setSuccessSound: (successSound) => set({ successSound }),
  setMuted: (isMuted) => {
    set({ isMuted });
    if (isMuted) {
      get().backgroundMusic?.pause();
      get().battleMusic?.pause();
    }
    saveSettings(isMuted, get().volume);
  },
  toggleMute: () => get().setMuted(!get().isMuted),
  setVolume: (v) => {
    const volume = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    audioSystem.setVolume(volume);
    set({ volume });
    saveSettings(get().isMuted, volume);
  },
  startBattleMusic: () => { if (!get().isMuted) tryPlay(get().battleMusic); },
  stopBattleMusic: () => { const b = get().battleMusic; if (b) b.pause(); },
  playJump: () => { if (!get().isMuted) tryPlay(get().hitSound); },
  playPunch: () => { if (!get().isMuted) tryPlay(get().hitSound); procedural(get, "strike"); },
  playKick: () => { if (!get().isMuted) tryPlay(get().hitSound); procedural(get, "strike"); },
  playSpecial: () => { if (!get().isMuted) tryPlay(get().successSound); procedural(get, "cast_t2"); },
  playHit: () => { if (!get().isMuted) tryPlay(get().hitSound); procedural(get, "hit_light"); },
  playKO: () => { if (!get().isMuted) tryPlay(get().hitSound); procedural(get, "ko"); },
  playVictory: () => { if (!get().isMuted) tryPlay(get().successSound); procedural(get, "victory"); },
  playStoneMove: () => { if (!get().isMuted) playStoneGrind("move"); },
  playStoneAttack: () => { if (!get().isMuted) playStoneGrind("attack"); },
  playStoneHit: () => { if (!get().isMuted) playStoneGrind("hit"); },
  playDodge: () => { if (!get().isMuted) playDodgeWhoosh(); },
}));


if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const state = useAudio.getState();
    const background = state.backgroundMusic;
    const battle = state.battleMusic;

    if (document.hidden) {
      resumeBackgroundMusicAfterVisibility = Boolean(background && !background.paused);
      resumeBattleMusicAfterVisibility = Boolean(battle && !battle.paused);

      background?.pause();
      battle?.pause();

      if (audioCtx?.state === "running") {
        audioCtx.suspend().catch(() => {});
      }
      return;
    }

    if (state.isMuted) {
      resumeBackgroundMusicAfterVisibility = false;
      resumeBattleMusicAfterVisibility = false;
      return;
    }

    if (audioCtx?.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    if (resumeBattleMusicAfterVisibility && battle) {
      battle.play().catch(() => {});
    } else if (resumeBackgroundMusicAfterVisibility && background) {
      background.play().catch(() => {});
    }

    resumeBackgroundMusicAfterVisibility = false;
    resumeBattleMusicAfterVisibility = false;
  });
}
