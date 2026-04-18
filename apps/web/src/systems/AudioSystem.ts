/**
 * Audio System
 * Procedurally synthesized combat SFX via Web Audio API — zero asset dependency.
 * Sounds are short, punchy, and character-consistent with the Kai-Jax aesthetic.
 */

export type SfxId = 'whoosh' | 'hit_light' | 'hit_heavy' | 'block' | 'shield_break' | 'grab' | 'ko' | 'boss_roar' | 'phase_transition';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private unlocked: boolean = false;

  constructor() {
    // Wait for user gesture to unlock AudioContext (browser policy)
    if (typeof window !== 'undefined') {
      const unlock = () => {
        if (this.unlocked) return;
        this.initContext();
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('click', unlock);
      };
      window.addEventListener('keydown', unlock);
      window.addEventListener('click', unlock);
    }
  }

  private initContext(): void {
    try {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
      this.unlocked = true;
      console.log('[Audio] Context unlocked');
    } catch (e) {
      console.warn('[Audio] Failed to init AudioContext:', e);
      this.enabled = false;
    }
  }

  setVolume(v: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  /**
   * Play a procedurally synthesized SFX by id.
   */
  play(id: SfxId): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
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
    }
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
