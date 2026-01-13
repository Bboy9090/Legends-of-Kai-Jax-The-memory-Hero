// Audio System
// Path: packages/game/src/systems/AudioSystem.ts

import { EventBus } from '@game/core/EventBus';

interface SoundEffect {
  name: string;
  url: string;
  volume: number;
  pitch: number;
}

interface MusicTrack {
  name: string;
  url: string;
  loop: boolean;
  volume: number;
  fadeInDuration: number;
}

/**
 * Audio system for game sounds and music
 * Web Audio API based with EventBus integration
 */
export class AudioSystem {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private ambientGain: GainNode;

  private loadedSounds: Map<string, AudioBuffer> = new Map();
  private currentMusic: AudioBufferAudioContext | null = null;
  private eventBus: EventBus;

  // Sound library (would be loaded from asset files)
  private soundLibrary: Map<string, SoundEffect> = new Map([
    ['hit_impact', { name: 'Hit Impact', url: '/audio/sfx/hit_impact.wav', volume: 0.8, pitch: 1 }],
    ['attack_whoosh', { name: 'Attack Whoosh', url: '/audio/sfx/attack_whoosh.wav', volume: 0.6, pitch: 1 }],
    ['jump', { name: 'Jump', url: '/audio/sfx/jump.wav', volume: 0.5, pitch: 1 }],
    ['land', { name: 'Land', url: '/audio/sfx/land.wav', volume: 0.5, pitch: 1 }],
    ['victory', { name: 'Victory', url: '/audio/sfx/victory.wav', volume: 0.7, pitch: 1 }],
    ['defeat', { name: 'Defeat', url: '/audio/sfx/defeat.wav', volume: 0.7, pitch: 1 }],
  ]);

  // Music library
  private musicLibrary: Map<string, MusicTrack> = new Map([
    ['menu', { name: 'Menu Theme', url: '/audio/music/menu.mp3', loop: true, volume: 0.5, fadeInDuration: 2 }],
    ['saga_theme', { name: 'Saga Theme', url: '/audio/music/saga_theme.mp3', loop: true, volume: 0.6, fadeInDuration: 1 }],
    ['battle_default', { name: 'Battle Theme', url: '/audio/music/battle_default.mp3', loop: true, volume: 0.6, fadeInDuration: 0.5 }],
  ]);

  constructor(eventBus: EventBus) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.eventBus = eventBus;

    // Setup gain nodes for volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.8;

    this.musicGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.5;

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = 0.8;

    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.connect(this.masterGain);
    this.ambientGain.gain.value = 0.3;

    // Setup event listeners
    this.setupEventListeners();

    // Preload sounds
    this.preloadSounds();
  }

  /**
   * Setup audio event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('audio:play_sfx', (data: any) => {
      this.playSFX(data.name, data.volume || 1, data.pitch || 1);
    });

    this.eventBus.subscribe('audio:play_music', (data: any) => {
      this.playMusic(data.name);
    });

    this.eventBus.subscribe('audio:stop_music', () => {
      this.stopMusic();
    });

    this.eventBus.subscribe('audio:set_master_volume', (data: any) => {
      this.setMasterVolume(data.volume);
    });

    this.eventBus.subscribe('audio:set_music_volume', (data: any) => {
      this.setMusicVolume(data.volume);
    });

    this.eventBus.subscribe('audio:set_sfx_volume', (data: any) => {
      this.setSFXVolume(data.volume);
    });
  }

  /**
   * Preload all sound effects
   */
  private preloadSounds(): void {
    for (const [name, sound] of this.soundLibrary.entries()) {
      this.loadSound(name, sound.url);
    }
  }

  /**
   * Load a sound file into the audio context
   */
  private loadSound(name: string, url: string): void {
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        this.loadedSounds.set(name, audioBuffer);
      })
      .catch((error) => {
        console.warn(`[Audio] Failed to load ${name}:`, error);
      });
  }

  /**
   * Play a sound effect
   */
  public playSFX(name: string, volumeMultiplier: number = 1, pitch: number = 1): void {
    const buffer = this.loadedSounds.get(name);
    if (!buffer) {
      console.warn(`[Audio] Sound not loaded: ${name}`);
      return;
    }

    const sound = this.soundLibrary.get(name);
    const baseVolume = sound?.volume || 0.5;

    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    // Create gain node for this instance
    const gain = this.audioContext.createGain();
    gain.gain.value = baseVolume * volumeMultiplier;
    source.connect(gain);
    gain.connect(this.sfxGain);

    // Play
    source.start(0);

    // Auto cleanup when finished
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Play background music
   */
  public playMusic(name: string): void {
    // Stop current music with fade out
    if (this.currentMusic) {
      this.stopMusic();
    }

    const track = this.musicLibrary.get(name);
    if (!track) {
      console.warn(`[Audio] Music not found: ${name}`);
      return;
    }

    // In a real implementation, use Web Audio or HTML5 Audio element
    // For now, just emit event
    this.eventBus.emit('audio:music_started', { name });
  }

  /**
   * Stop current music with fade out
   */
  public stopMusic(): void {
    if (!this.currentMusic) return;

    // Fade out (would implement actual fadeout)
    this.musicGain.gain.value = 0;
    this.currentMusic = null;

    this.eventBus.emit('audio:music_stopped', {});
  }

  /**
   * Set master volume (0-1)
   */
  public setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set SFX volume (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current audio context time
   */
  public getCurrentTime(): number {
    return this.audioContext.currentTime;
  }

  /**
   * Resume audio context (required by browser autoplay policy)
   */
  public resume(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
