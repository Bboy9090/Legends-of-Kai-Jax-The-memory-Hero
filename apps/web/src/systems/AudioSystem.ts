/**
 * Audio System
 * Procedurally synthesized combat SFX via Web Audio API — zero asset dependency.
 * Sounds are short, punchy, and character-consistent with the Kai-Jax aesthetic.
 */

export type SfxId = 'whoosh' | 'hit_light' | 'hit_heavy' | 'block' | 'shield_break' | 'grab' | 'ko' | 'boss_roar' | 'phase_transition' | 'ambient_wind' | 'ambient_industrial' | 'ambient_metal_creak';

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
      case 'ambient_wind':
        this.playAmbientWind(now);
        break;
      case 'ambient_industrial':
        this.playAmbientIndustrial(now);
        break;
      case 'ambient_metal_creak':
        this.playAmbientMetalCreak(now);
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

  /** Ambient wind through broken structures — Ashblock atmosphere */
  private playAmbientWind(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.noiseBuffer(2.0);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = false;

    // Low-pass filter for wind howl
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.linearRampToValueAtTime(1500, now + 2.0);
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + 2.1);
  }

  /** Industrial ambient sound — machinery, distant impacts */
  private playAmbientIndustrial(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Deep industrial drone (low frequency)
    const droneLow = this.ctx.createOscillator();
    droneLow.type = 'sine';
    droneLow.frequency.setValueAtTime(48, now);
    droneLow.frequency.linearRampToValueAtTime(52, now + 1.5);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, now);
    droneGain.gain.linearRampToValueAtTime(0.001, now + 1.5);

    droneLow.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneLow.start(now);
    droneLow.stop(now + 1.6);

    // Metallic clangs (sparse industrial sounds)
    const clangs = [0.2, 0.6, 1.0];
    clangs.forEach((offset) => {
      const clang = this.ctx!.createOscillator();
      clang.type = 'square';
      clang.frequency.setValueAtTime(320 + Math.random() * 200, now + offset);
      clang.frequency.exponentialRampToValueAtTime(80, now + offset + 0.3);

      const clangGain = this.ctx!.createGain();
      clangGain.gain.setValueAtTime(0.15, now + offset);
      clangGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.3);

      clang.connect(clangGain);
      clangGain.connect(this.masterGain!);
      clang.start(now + offset);
      clang.stop(now + offset + 0.35);
    });
  }

  /** Metal creak — structural stress, broken architecture ambience */
  private playAmbientMetalCreak(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.noiseBuffer(1.2);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    // High-pass filter for creaky metal
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + 1.3);
  }

  /** Public method for ambient industrial audio (called by EnvironmentAmbience) */
  playAmbientIndustrial(): void {
    if (!this.enabled || !this.ctx) return;
    this.play('ambient_industrial');
  }

  /** Public method for ambient wind audio */
  playAmbientWind(): void {
    if (!this.enabled || !this.ctx) return;
    this.play('ambient_wind');
  }

  /** Public method for ambient metal creak audio */
  playAmbientMetalCreak(): void {
    if (!this.enabled || !this.ctx) return;
    this.play('ambient_metal_creak');
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
