/**
 * Adaptive procedural music + ambience bed (ported from the zip prototype's AudioEngine and reshaped
 * to this game: it owns no settings, the caller sets volumes). `planMusicStep` is pure so the
 * note pattern is unit-testable without an AudioContext.
 */
export type MusicMood = "title" | "explore" | "combat" | "boss" | "victory";

export interface ToneEvent {
  freq: number;
  type: OscillatorType;
  duration: number;
  gain: number;
  cutoff: number;
}
export interface MusicStepPlan {
  bass?: ToneEvent;
  chime?: ToneEvent;
  kick?: number;
  hat?: number;
}

// D-minor / Phrygian dark-urban roots, one per beat group.
const BASS_ROOTS: Record<MusicMood, number[]> = {
  title: [73.42, 73.42, 87.31, 65.41],
  explore: [73.42, 73.42, 77.78, 65.41],
  combat: [73.42, 87.31, 77.78, 98.0],
  boss: [65.41, 73.42, 61.74, 87.31],
  victory: [73.42, 98.0, 110.0, 146.83],
};
const MELODY_RATIOS = [2, 2.4, 3, 2.667];
export const STEP_MS = 215; // ~140 BPM eighth notes
export const MUSIC_STEPS = 16;

/** What to play on a given sixteen-step bar position for a mood. */
export function planMusicStep(mood: MusicMood, stepIndex: number): MusicStepPlan {
  const step = ((stepIndex % MUSIC_STEPS) + MUSIC_STEPS) % MUSIC_STEPS;
  const roots = BASS_ROOTS[mood];
  const barRoot = roots[Math.floor(step / 4) % roots.length];
  const plan: MusicStepPlan = {};
  const driving = mood === "combat" || mood === "boss";

  if ((mood !== "title" || step % 4 === 0) && (step % 2 === 0 || driving)) {
    plan.bass = { freq: barRoot, type: mood === "boss" ? "sawtooth" : "triangle", duration: 0.18, gain: 0.24, cutoff: 320 };
  }
  if ((mood === "title" || mood === "explore" || mood === "victory") && [0, 6, 10, 14].includes(step)) {
    plan.chime = { freq: barRoot * MELODY_RATIOS[(step / 2) % MELODY_RATIOS.length] * 2, type: "sine", duration: 0.42, gain: 0.14, cutoff: 1600 };
  }
  if (driving && step % 4 === 0) plan.kick = 0.35;
  else if (driving && step % 4 === 2) plan.kick = 0.16;
  if (mood === "boss" && step % 2 === 1) plan.hat = 0.12;
  return plan;
}

export class AdaptiveMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private ambience: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private stepIndex = 0;
  private mood: MusicMood = "title";
  private level = 0.5;

  /** Must be called from a user gesture the first time (browser autoplay policy). Safe to call repeatedly. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
      return;
    }
    const Ctor = typeof window === "undefined" ? undefined : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.music = this.ctx.createGain();
    this.ambience = this.ctx.createGain();
    this.music.connect(this.master);
    this.ambience.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.setLevel(this.level);
    this.startAmbience();
    this.start();
  }

  /** 0..1 overall level (already master × music volume, 0 when muted). */
  setLevel(level: number): void {
    this.level = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0));
    if (!this.ctx || !this.master || !this.music || !this.ambience) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.level, t, 0.06);
    this.music.gain.setTargetAtTime(0.42, t, 0.08);
    this.ambience.gain.setTargetAtTime(0.18, t, 0.1);
  }

  setMood(mood: MusicMood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    this.stepIndex = 0; // restart the bar so the new mood lands on its downbeat
  }
  getMood(): MusicMood {
    return this.mood;
  }

  suspend(): void {
    if (this.ctx?.state === "running") void this.ctx.suspend().catch(() => {});
  }
  resume(): void {
    if (this.ctx?.state === "suspended") void this.ctx.resume().catch(() => {});
  }

  private start(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), STEP_MS);
  }

  private tick(): void {
    const { ctx, music } = this;
    if (!ctx || !music || ctx.state !== "running" || this.level <= 0) return;
    const plan = planMusicStep(this.mood, this.stepIndex++);
    const t = ctx.currentTime;
    if (plan.bass) this.tone(plan.bass, t, music);
    if (plan.chime) this.tone(plan.chime, t, music);
    if (plan.kick !== undefined) this.kick(t, plan.kick);
    if (plan.hat !== undefined) this.hat(t, plan.hat);
  }

  private tone(e: ToneEvent, at: number, dest: AudioNode): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = e.type;
    osc.frequency.setValueAtTime(e.freq, at);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(e.cutoff, at);
    gain.gain.setValueAtTime(0.001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, e.gain), at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + e.duration);
    osc.connect(filter).connect(gain).connect(dest);
    osc.start(at);
    osc.stop(at + e.duration + 0.02);
  }

  private kick(at: number, vol: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(125, at);
    osc.frequency.exponentialRampToValueAtTime(38, at + 0.14);
    gain.gain.setValueAtTime(vol, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
    osc.connect(gain).connect(this.music!);
    osc.start(at);
    osc.stop(at + 0.18);
  }

  private hat(at: number, vol: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(5200, at);
    gain.gain.setValueAtTime(vol * 0.35, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.04);
    osc.connect(gain).connect(this.music!);
    osc.start(at);
    osc.stop(at + 0.05);
  }

  /** Looping filtered brown noise: distant rain and urban wind. */
  private startAmbience(): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambience || this.noise) return;
    const size = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      data[i] = last;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 340;
    filter.Q.value = 0.7;
    src.connect(filter).connect(this.ambience);
    src.start();
    this.noise = src;
  }

  dispose(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    try {
      this.noise?.stop();
    } catch {
      // already stopped
    }
    this.noise = null;
    if (this.ctx) void this.ctx.close().catch(() => {});
    this.ctx = this.master = this.music = this.ambience = null;
  }
}

export const adaptiveMusic = new AdaptiveMusic();
