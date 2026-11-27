import { GameSettings } from '../types';

export type MusicMood = 'title' | 'explore' | 'combat' | 'boss' | 'victory';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private mood: MusicMood = 'title';
  private stepTimer: number | null = null;
  private stepIndex = 0;
  private initialized = false;
  private settings: GameSettings;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  public unlock(): void {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.ambienceGain = this.ctx.createGain();

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.initialized = true;
    this.applySettings(this.settings);
    this.startAmbienceBed();
    this.startMusicSequencer();
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    const master = settings.muted ? 0 : settings.masterVolume;
    this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    this.musicGain.gain.setTargetAtTime(settings.musicVolume * 0.42, now, 0.08);
    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume * 0.65, now, 0.05);
    this.ambienceGain.gain.setTargetAtTime(settings.musicVolume * 0.18, now, 0.1);
  }

  public setMood(mood: MusicMood): void {
    this.mood = mood;
  }

  public suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended' && !this.settings.muted) {
      void this.ctx.resume();
    }
  }

  private startAmbienceBed(): void {
    if (!this.ctx || !this.ambienceGain) return;
    // Filtered rain & urban wind noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 0.7;

    noise.connect(filter);
    filter.connect(this.ambienceGain);
    noise.start();
  }

  private startMusicSequencer(): void {
    if (this.stepTimer !== null) window.clearInterval(this.stepTimer);
    // 136 BPM 8th-note adaptive sequencer (~220ms step)
    this.stepTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.ctx.state !== 'running' || this.settings.muted) return;
      const now = this.ctx.currentTime;
      const step = this.stepIndex % 16;
      this.stepIndex++;

      // D Minor / Phrygian urban dark-fantasy scale frequencies
      const bassRoots: Record<MusicMood, number[]> = {
        title: [73.42, 73.42, 87.31, 65.41],
        explore: [73.42, 73.42, 77.78, 65.41],
        combat: [73.42, 87.31, 77.78, 98.0],
        boss: [65.41, 73.42, 61.74, 87.31],
        victory: [73.42, 98.0, 110.0, 146.83],
      };

      const roots = bassRoots[this.mood];
      const barRoot = roots[Math.floor(step / 4) % roots.length];

      // Bass pulse on beats
      if (this.mood !== 'title' || step % 4 === 0) {
        if (step % 2 === 0 || this.mood === 'boss' || this.mood === 'combat') {
          this.playTone(barRoot, this.mood === 'boss' ? 'sawtooth' : 'triangle', 0.18, 0.24, now, this.musicGain, 320);
        }
      }

      // Melodic memory chime motif
      if ((this.mood === 'title' || this.mood === 'explore' || this.mood === 'victory') && (step === 0 || step === 6 || step === 10 || step === 14)) {
        const melodyRatios = [2, 2.4, 3, 2.667];
        const freq = barRoot * melodyRatios[(step / 2) % melodyRatios.length] * 2;
        this.playTone(freq, 'sine', 0.42, 0.14, now, this.musicGain, 1600);
      }

      // Percussive drive in combat / boss
      if ((this.mood === 'combat' || this.mood === 'boss') && (step % 4 === 0 || step % 4 === 2)) {
        this.playKick(now, step % 4 === 0 ? 0.35 : 0.16);
      }
      if (this.mood === 'boss' && step % 2 === 1) {
        this.playHiHat(now, 0.12);
      }
    }, 215);
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainVal: number,
    startTime: number,
    dest: AudioNode,
    cutoff = 2400
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, gainVal), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private playKick(time: number, vol: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(125, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.14);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playHiHat(time: number, vol: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(5200, time);
    gain.gain.setValueAtTime(vol * 0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  public playSfx(
    kind:
      | 'ui'
      | 'attack_kai'
      | 'attack_jax'
      | 'heavy'
      | 'hit'
      | 'parry'
      | 'dodge'
      | 'web'
      | 'lightning'
      | 'memory'
      | 'fusion'
      | 'rescue'
      | 'levelup'
      | 'boss_slam'
  ): void {
    this.unlock();
    if (!this.ctx || !this.sfxGain || this.settings.muted) return;
    const t = this.ctx.currentTime;

    switch (kind) {
      case 'ui':
        this.playTone(640, 'triangle', 0.07, 0.18, t, this.sfxGain);
        break;
      case 'attack_kai':
        this.playSweep(520, 180, 'sawtooth', 0.11, 0.22, t);
        break;
      case 'attack_jax':
        this.playSweep(240, 75, 'sawtooth', 0.15, 0.3, t);
        break;
      case 'heavy':
        this.playSweep(190, 48, 'square', 0.24, 0.35, t);
        break;
      case 'hit':
        this.playSweep(160, 52, 'triangle', 0.12, 0.34, t);
        break;
      case 'parry':
        this.playTone(1180, 'sine', 0.22, 0.34, t, this.sfxGain, 4500);
        this.playTone(1760, 'triangle', 0.16, 0.22, t + 0.02, this.sfxGain, 4800);
        break;
      case 'dodge':
        this.playSweep(360, 140, 'sine', 0.14, 0.2, t);
        break;
      case 'web':
        this.playSweep(760, 1240, 'triangle', 0.14, 0.24, t);
        break;
      case 'lightning':
        this.playSweep(1350, 220, 'sawtooth', 0.22, 0.32, t);
        this.playSweep(880, 140, 'square', 0.18, 0.18, t + 0.04);
        break;
      case 'memory':
        this.playTone(587.33, 'sine', 0.45, 0.22, t, this.sfxGain, 3200);
        this.playTone(880, 'sine', 0.55, 0.2, t + 0.08, this.sfxGain, 3600);
        this.playTone(1174.66, 'triangle', 0.65, 0.16, t + 0.16, this.sfxGain, 3800);
        break;
      case 'fusion':
        this.playSweep(110, 660, 'sawtooth', 0.65, 0.34, t);
        this.playTone(440, 'sine', 0.75, 0.28, t + 0.15, this.sfxGain, 4000);
        this.playTone(659.25, 'triangle', 0.85, 0.25, t + 0.25, this.sfxGain, 4200);
        break;
      case 'rescue':
        this.playTone(523.25, 'triangle', 0.2, 0.22, t, this.sfxGain, 3000);
        this.playTone(783.99, 'triangle', 0.35, 0.24, t + 0.1, this.sfxGain, 3000);
        break;
      case 'levelup':
        this.playTone(440, 'triangle', 0.22, 0.25, t, this.sfxGain, 3000);
        this.playTone(554.37, 'triangle', 0.22, 0.25, t + 0.1, this.sfxGain, 3000);
        this.playTone(659.25, 'triangle', 0.3, 0.28, t + 0.2, this.sfxGain, 3000);
        this.playTone(880, 'sine', 0.5, 0.3, t + 0.32, this.sfxGain, 3600);
        break;
      case 'boss_slam':
        this.playSweep(140, 32, 'sawtooth', 0.42, 0.44, t);
        break;
    }
  }

  private playSweep(
    f0: number,
    f1: number,
    type: OscillatorType,
    duration: number,
    vol: number,
    time: number
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), time + duration);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  public dispose(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
