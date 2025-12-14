export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private masterVolume = 1.0;
  private sfxVolume = 1.0;
  private musicVolume = 0.7;
  private currentMusic: HTMLAudioElement | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async loadSound(key: string, url: string): Promise<void> {
    if (!this.audioContext) return;

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.sounds.set(key, audioBuffer);
  }

  loadMusic(key: string, url: string): void {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = this.musicVolume * this.masterVolume;
    this.music.set(key, audio);
  }

  playSound(key: string, volume = 1.0): void {
    if (!this.audioContext) return;

    const buffer = this.sounds.get(key);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  playMusic(key: string): void {
    const audio = this.music.get(key);
    if (!audio) return;

    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    this.currentMusic = audio;
    audio.play();
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
  }

  private updateMusicVolume(): void {
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }
}
