/**
 * Audio System
 * Procedurally synthesized combat SFX via Web Audio API — zero asset dependency.
 * Sounds are short, punchy, and character-consistent with the Kai-Jax aesthetic.
 */

export type SfxId =
  | 'whoosh' | 'hit_light' | 'hit_heavy' | 'block' | 'shield_break' | 'grab' | 'ko' | 'boss_roar' | 'phase_transition'
  | 'ui_click' | 'strike' | 'cast_t1' | 'cast_t2' | 'ultimate' | 'victory' | 'defeat';

/** Master gain at volume 1.0 — keeps the synthesized SFX well below clipping. */
const MASTER_GAIN_AT_FULL_VOLUME = 0.5;

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private unlocked: boolean = false;
  private volume: number = 0.7;

  constructor() {
    // Browsers keep AudioContext suspended until a user gesture; resume on the first one.
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.resume();
        if (this.ctx && this.ctx.state === 'running') {
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('touchstart', unlock);
        }
      };
      window.addEventListener('keydown', unlock);
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  private initContext(): void {
    if (this.ctx || !this.enabled) return;
    try {
      const Ctx = typeof window !== 'undefined'
        ? (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
        : undefined;
      if (!Ctx) {
        this.enabled = false;
        return;
      }
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume * MASTER_GAIN_AT_FULL_VOLUME;
      this.masterGain.connect(this.ctx.destination);
      this.unlocked = true;
    } catch (e) {
      console.warn('[Audio] Failed to init AudioContext:', e);
      this.enabled = false;
    }
  }

  /** Create (if needed) and resume the context. Safe to call from any user-gesture handler. */
  resume(): void {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** True once a running context exists, i.e. sounds will actually be audible. */
  isRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  /** 0..1 master volume; applied immediately and remembered for a context created later. */
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume * MASTER_GAIN_AT_FULL_VOLUME;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  /**
   * Play a procedurally synthesized SFX by id.
   */
  play(id: SfxId): void {
    if (!this.enabled || this.volume <= 0) return;
    this.resume();
    if (!this.ctx || !this.masterGain || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    switch (id) {
      case 'whoosh':
        this.playWhoosh(now);
        break;
      case 'hit_light':
        this.playHit(now, 320, 0.08, 0.4);
        break;
      case 'hit_heavy':
        this.playHit(now, 140, 0.18, 0.7);
        break;
      case 'block':
        this.playBlock(now);
        break;
      case 'shield_break':
        this.playShieldBreak(now);
        break;
      case 'grab':
        this.playGrab(now);
        break;
      case 'ko':
        this.playKO(now);
        break;
      case 'boss_roar':
        this.playBossRoar(now);
        break;
      case 'phase_transition':
        this.playPhaseTransition(now);
        break;
      case 'ui_click':
        this.playUiClick(now);
        break;
      case 'strike':
        this.playWhoosh(now);
        this.playHit(now + 0.04, 260, 0.1, 0.5);
        break;
      case 'cast_t1':
        this.playCast(now, 400, 900, 0.2, 0.3);
        break;
      case 'cast_t2':
        this.playCast(now, 260, 1100, 0.34, 0.4);
        this.playCast(now + 0.03, 390, 1650, 0.3, 0.2);
        break;
      case 'ultimate':
        this.playUltimate(now);
        break;
      case 'victory':
        this.playFanfare(now, [523.25, 659.25, 783.99, 1046.5], 'triangle', 0.14);
        break;
      case 'defeat':
        this.playFanfare(now, [220, 174.61, 146.83, 110], 'sawtooth', 0.28, 900);
        break;
    }
  }

  /** Short bright blip — menu / button click */
  private playUiClick(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Rising tone with a shimmer of filtered noise — ability cast */
  private playCast(now: number, from: number, to: number, dur: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.08);

    const shimmer = this.ctx.createBufferSource();
    shimmer.buffer = this.noiseBuffer(dur);
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(from * 2, now);
    band.frequency.exponentialRampToValueAtTime(to * 2, now + dur);
    band.Q.value = 6;
    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(vol * 0.35, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    shimmer.connect(band);
    band.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    shimmer.start(now);
    shimmer.stop(now + dur + 0.02);
  }

  /** Sub boom + noise blast + rising sweep — ultimate explosion */
  private playUltimate(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const boom = this.ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(110, now + 0.18);
    boom.frequency.exponentialRampToValueAtTime(28, now + 1.1);
    const boomGain = this.ctx.createGain();
    boomGain.gain.setValueAtTime(0.001, now);
    boomGain.gain.setValueAtTime(0.9, now + 0.18);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(now);
    boom.stop(now + 1.25);

    const blast = this.ctx.createBufferSource();
    blast.buffer = this.noiseBuffer(1.1);
    const low = this.ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.setValueAtTime(5000, now + 0.18);
    low.frequency.exponentialRampToValueAtTime(200, now + 1.1);
    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.001, now);
    blastGain.gain.setValueAtTime(0.7, now + 0.18);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    blast.connect(low);
    low.connect(blastGain);
    blastGain.connect(this.masterGain);
    blast.start(now);
    blast.stop(now + 1.15);

    const sweep = this.ctx.createOscillator();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(150, now);
    sweep.frequency.exponentialRampToValueAtTime(900, now + 0.18);
    const sweepGain = this.ctx.createGain();
    sweepGain.gain.setValueAtTime(0.25, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    sweep.connect(sweepGain);
    sweepGain.connect(this.masterGain);
    sweep.start(now);
    sweep.stop(now + 0.25);
  }

  /** Sequenced notes with a held final chord tone — victory / defeat stingers */
  private playFanfare(now: number, notes: number[], type: OscillatorType, step: number, cutoff = 4000): void {
    if (!this.ctx || !this.masterGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.connect(this.masterGain);
    notes.forEach((freq, i) => {
      const start = now + i * step;
      const last = i === notes.length - 1;
      const dur = last ? 0.9 : step * 1.6;
      const osc = this.ctx!.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.32, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(filter);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  /** Filtered noise burst — swoosh of attack */
  private playWhoosh(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.noiseBuffer(0.2);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + 0.25);
  }

  /** Low-frequency thump + tiny click — meaty impact */
  private playHit(now: number, freq: number, dur: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.05);

    // Click for crispness
    const click = this.ctx.createBufferSource();
    click.buffer = this.noiseBuffer(0.03);
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(vol * 0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(now);
    click.stop(now + 0.05);
  }

  /** Metallic ping — shield block */
  private playBlock(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Shatter — shield break */
  private playShieldBreak(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.noiseBuffer(0.4);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + 0.45);
  }

  /** Deep thud + sustained tone — grab */
  private playGrab(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Doom chord — KO */
  private playKO(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    [110, 138.6, 165].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.3, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 1.1);
    });
  }

  /** Downward growl — boss roar */
  private playBossRoar(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.1);
  }

  /** Rising zing — phase transition */
  private playPhaseTransition(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  /** Play procedural venue-themed battle synth music based on arenaId */
  playVenueThemedMusic(arenaId: string): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Dark-hiphop synth for bronx_streets & urban arenas
    if (arenaId === 'bronx_streets' || arenaId === 'open-world') {
      [65.41, 77.78, 98.00, 116.54].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.2, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.4);
      });
    }
  }

  /** Helper: create a short noise buffer */
  private noiseBuffer(duration: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
}

// Singleton instance — shared across scenes
export const audioSystem = new AudioSystem();
