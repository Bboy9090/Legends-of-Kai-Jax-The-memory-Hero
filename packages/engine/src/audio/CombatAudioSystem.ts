/**
 * OMEGA PROTOCOL: COMBAT AUDIO SYSTEM
 * 
 * Audio priority and ducking system for combat clarity:
 * - Priority tiers: Impact > Parry > Boss Stinger > Ambience
 * - Music ducks cleanly on hit-stop and phase transitions
 * - Hit SFX hooked to magnitude (light/heavy/launcher tiers)
 * - Parry bell lands exactly on hit-stop frame
 * 
 * "Hits sound heavier without being louder."
 * "Parry reads are unmistakable."
 * "Chaos reduced without losing intensity."
 */

export enum AudioPriority {
  CRITICAL = 0,     // Phase transitions, ultimates
  IMPACT = 1,       // Hit sounds
  PARRY = 2,        // Parry/counter sounds
  BOSS_STINGER = 3, // Boss phase stingers
  ABILITY = 4,      // Special move sounds
  MOVEMENT = 5,     // Dash, jump, land
  AMBIENT = 6,      // Background sounds
  MUSIC = 7,        // Background music
}

export interface AudioChannel {
  id: string;
  priority: AudioPriority;
  volume: number;
  baseVolume: number;
  ducking: number; // 0-1, current duck amount
  duckTarget: number;
  duckSpeed: number;
  playing: boolean;
  looping: boolean;
  fadeTarget?: number;
  fadeSpeed?: number;
}

export interface SoundEffect {
  id: string;
  path: string;
  priority: AudioPriority;
  volume: number;
  pitchRange?: { min: number; max: number };
  cooldownMs?: number;
  duckOthers?: boolean;
  duckAmount?: number;
  duckDuration?: number;
}

export interface HitSoundConfig {
  lightHit: SoundEffect;
  mediumHit: SoundEffect;
  heavyHit: SoundEffect;
  launcher: SoundEffect;
  parry: SoundEffect;
  parryPerfect: SoundEffect;
  counter: SoundEffect;
  block: SoundEffect;
  whiff: SoundEffect;
}

export const DEFAULT_HIT_SOUNDS: HitSoundConfig = {
  lightHit: {
    id: 'hit_light',
    path: '/sounds/hit_light.wav',
    priority: AudioPriority.IMPACT,
    volume: 0.7,
    pitchRange: { min: 0.95, max: 1.05 },
    cooldownMs: 50,
  },
  mediumHit: {
    id: 'hit_medium',
    path: '/sounds/hit_medium.wav',
    priority: AudioPriority.IMPACT,
    volume: 0.8,
    pitchRange: { min: 0.9, max: 1.1 },
    cooldownMs: 50,
    duckOthers: true,
    duckAmount: 0.3,
    duckDuration: 100,
  },
  heavyHit: {
    id: 'hit_heavy',
    path: '/sounds/hit_heavy.wav',
    priority: AudioPriority.IMPACT,
    volume: 0.9,
    pitchRange: { min: 0.85, max: 1.0 },
    cooldownMs: 80,
    duckOthers: true,
    duckAmount: 0.5,
    duckDuration: 150,
  },
  launcher: {
    id: 'hit_launcher',
    path: '/sounds/hit_launcher.wav',
    priority: AudioPriority.IMPACT,
    volume: 1.0,
    pitchRange: { min: 0.9, max: 1.0 },
    cooldownMs: 100,
    duckOthers: true,
    duckAmount: 0.6,
    duckDuration: 200,
  },
  parry: {
    id: 'parry',
    path: '/sounds/parry_bell.wav',
    priority: AudioPriority.PARRY,
    volume: 0.85,
    pitchRange: { min: 0.98, max: 1.02 },
    duckOthers: true,
    duckAmount: 0.4,
    duckDuration: 180,
  },
  parryPerfect: {
    id: 'parry_perfect',
    path: '/sounds/parry_perfect.wav',
    priority: AudioPriority.PARRY,
    volume: 1.0,
    duckOthers: true,
    duckAmount: 0.6,
    duckDuration: 250,
  },
  counter: {
    id: 'counter',
    path: '/sounds/counter.wav',
    priority: AudioPriority.PARRY,
    volume: 0.9,
    duckOthers: true,
    duckAmount: 0.5,
    duckDuration: 200,
  },
  block: {
    id: 'block',
    path: '/sounds/block.wav',
    priority: AudioPriority.MOVEMENT,
    volume: 0.6,
    pitchRange: { min: 0.9, max: 1.1 },
    cooldownMs: 30,
  },
  whiff: {
    id: 'whiff',
    path: '/sounds/whiff.wav',
    priority: AudioPriority.MOVEMENT,
    volume: 0.3,
    pitchRange: { min: 0.8, max: 1.2 },
    cooldownMs: 50,
  },
};

export class CombatAudioSystem {
  private channels: Map<string, AudioChannel> = new Map();
  private soundCooldowns: Map<string, number> = new Map();
  private hitSounds: HitSoundConfig;
  private masterVolume: number = 1.0;
  
  // Ducking state
  private globalDuck: number = 0;
  private globalDuckTarget: number = 0;
  private globalDuckSpeed: number = 0.1;
  private duckRecoveryTimer: number = 0;
  
  // Music channel reference
  private musicChannelId: string | null = null;
  private musicBaseline: number = 0.7;
  
  // Audio context (for actual playback)
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeNodes: Map<string, AudioBufferSourceNode> = new Map();
  
  constructor(hitSounds: Partial<HitSoundConfig> = {}) {
    this.hitSounds = { ...DEFAULT_HIT_SOUNDS, ...hitSounds };
    
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }
  
  private async initAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio context initialization failed:', e);
    }
  }
  
  /**
   * Play a hit sound based on damage magnitude
   */
  playHit(damage: number, isLauncher: boolean = false): void {
    let sound: SoundEffect;
    
    if (isLauncher) {
      sound = this.hitSounds.launcher;
    } else if (damage >= 25) {
      sound = this.hitSounds.heavyHit;
    } else if (damage >= 12) {
      sound = this.hitSounds.mediumHit;
    } else {
      sound = this.hitSounds.lightHit;
    }
    
    this.playSound(sound);
  }
  
  /**
   * Play parry sound (lands exactly on hit-stop frame)
   */
  playParry(isPerfect: boolean = false): void {
    const sound = isPerfect ? this.hitSounds.parryPerfect : this.hitSounds.parry;
    this.playSound(sound);
  }
  
  /**
   * Play counter sound
   */
  playCounter(): void {
    this.playSound(this.hitSounds.counter);
  }
  
  /**
   * Play block sound
   */
  playBlock(): void {
    this.playSound(this.hitSounds.block);
  }
  
  /**
   * Play whiff sound
   */
  playWhiff(): void {
    this.playSound(this.hitSounds.whiff);
  }
  
  /**
   * Play a boss phase stinger
   */
  playBossStinger(stingerId: string): void {
    const sound: SoundEffect = {
      id: `boss_stinger_${stingerId}`,
      path: `/sounds/boss/${stingerId}.wav`,
      priority: AudioPriority.BOSS_STINGER,
      volume: 1.0,
      duckOthers: true,
      duckAmount: 0.7,
      duckDuration: 500,
    };
    
    this.playSound(sound);
  }
  
  /**
   * Generic sound playback with priority system
   */
  playSound(sound: SoundEffect): void {
    // Check cooldown
    const lastPlayed = this.soundCooldowns.get(sound.id) ?? 0;
    const now = performance.now();
    
    if (sound.cooldownMs && now - lastPlayed < sound.cooldownMs) {
      return;
    }
    
    this.soundCooldowns.set(sound.id, now);
    
    // Apply ducking if needed
    if (sound.duckOthers && sound.duckAmount) {
      this.applyDucking(sound.priority, sound.duckAmount, sound.duckDuration ?? 100);
    }
    
    // Calculate volume with ducking
    const finalVolume = sound.volume * this.masterVolume * (1 - this.globalDuck);
    
    // Apply pitch variation
    let pitch = 1.0;
    if (sound.pitchRange) {
      pitch = sound.pitchRange.min + 
        Math.random() * (sound.pitchRange.max - sound.pitchRange.min);
    }
    
    // Play the sound (would integrate with actual audio API)
    this.playSoundActual(sound.id, sound.path, finalVolume, pitch);
  }
  
  /**
   * Apply ducking to lower priority sounds
   */
  private applyDucking(triggerPriority: AudioPriority, amount: number, durationMs: number): void {
    this.globalDuckTarget = Math.max(this.globalDuckTarget, amount);
    this.duckRecoveryTimer = durationMs;
    
    // Duck music heavily on high-priority events
    if (triggerPriority <= AudioPriority.PARRY && this.musicChannelId) {
      const musicChannel = this.channels.get(this.musicChannelId);
      if (musicChannel) {
        musicChannel.duckTarget = amount * 0.8; // Music ducks more
      }
    }
  }
  
  /**
   * Hit-stop audio handling
   * Music ducks cleanly on hit-stop and phase transitions
   */
  onHitStopStart(durationMs: number): void {
    // Immediate music duck
    if (this.musicChannelId) {
      const musicChannel = this.channels.get(this.musicChannelId);
      if (musicChannel) {
        musicChannel.duckTarget = 0.5;
        musicChannel.duckSpeed = 0.3; // Fast duck
      }
    }
    
    // Global duck for all sounds
    this.globalDuckTarget = 0.3;
    this.duckRecoveryTimer = durationMs + 100; // Recover after hit-stop
  }
  
  /**
   * Phase transition audio handling
   */
  onPhaseTransition(): void {
    // Dramatic music duck
    if (this.musicChannelId) {
      const musicChannel = this.channels.get(this.musicChannelId);
      if (musicChannel) {
        musicChannel.duckTarget = 0.7;
        musicChannel.duckSpeed = 0.2;
      }
    }
    
    this.globalDuckTarget = 0.5;
    this.duckRecoveryTimer = 1000; // 1 second recovery
  }
  
  /**
   * Set music channel for ducking
   */
  setMusicChannel(channelId: string): void {
    this.musicChannelId = channelId;
    
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, {
        id: channelId,
        priority: AudioPriority.MUSIC,
        volume: this.musicBaseline,
        baseVolume: this.musicBaseline,
        ducking: 0,
        duckTarget: 0,
        duckSpeed: 0.05,
        playing: false,
        looping: true,
      });
    }
  }
  
  /**
   * Update audio system (call every frame)
   */
  update(deltaTimeMs: number): void {
    // Update global ducking
    if (this.duckRecoveryTimer > 0) {
      this.duckRecoveryTimer -= deltaTimeMs;
      
      if (this.duckRecoveryTimer <= 0) {
        this.globalDuckTarget = 0;
      }
    }
    
    // Lerp global duck
    const duckLerpSpeed = deltaTimeMs * 0.005;
    this.globalDuck += (this.globalDuckTarget - this.globalDuck) * duckLerpSpeed;
    
    // Update channels
    for (const [_, channel] of this.channels) {
      // Lerp ducking
      channel.ducking += (channel.duckTarget - channel.ducking) * channel.duckSpeed;
      
      // Apply ducking to volume
      channel.volume = channel.baseVolume * (1 - channel.ducking);
      
      // Recover ducking if no target
      if (channel.duckTarget === 0 && channel.ducking > 0) {
        channel.duckTarget = 0;
      }
      
      // Handle fading
      if (channel.fadeTarget !== undefined && channel.fadeSpeed) {
        const fadeStep = channel.fadeSpeed * deltaTimeMs;
        if (channel.volume < channel.fadeTarget) {
          channel.volume = Math.min(channel.volume + fadeStep, channel.fadeTarget);
        } else if (channel.volume > channel.fadeTarget) {
          channel.volume = Math.max(channel.volume - fadeStep, channel.fadeTarget);
        }
        
        if (Math.abs(channel.volume - channel.fadeTarget) < 0.01) {
          channel.fadeTarget = undefined;
          channel.fadeSpeed = undefined;
        }
      }
    }
    
    // Clean up old cooldowns
    const now = performance.now();
    for (const [id, lastPlayed] of this.soundCooldowns) {
      if (now - lastPlayed > 5000) {
        this.soundCooldowns.delete(id);
      }
    }
  }
  
  /**
   * Actual sound playback implementation
   */
  private playSoundActual(id: string, path: string, volume: number, pitch: number): void {
    if (!this.audioContext) return;
    
    // In a real implementation, this would:
    // 1. Load or retrieve cached audio buffer
    // 2. Create source node
    // 3. Connect to gain node with volume
    // 4. Set playback rate for pitch
    // 5. Start playback
    
    console.log(`[Audio] Play: ${id} @ volume ${volume.toFixed(2)}, pitch ${pitch.toFixed(2)}`);
    
    // Placeholder for actual Web Audio API implementation
    // const source = this.audioContext.createBufferSource();
    // const gainNode = this.audioContext.createGain();
    // source.buffer = this.audioBuffers.get(path);
    // source.playbackRate.value = pitch;
    // gainNode.gain.value = volume;
    // source.connect(gainNode);
    // gainNode.connect(this.audioContext.destination);
    // source.start();
  }
  
  /**
   * Preload sound effect
   */
  async preloadSound(sound: SoundEffect): Promise<void> {
    if (!this.audioContext) return;
    
    try {
      const response = await fetch(sound.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(sound.path, audioBuffer);
    } catch (e) {
      console.warn(`Failed to preload sound: ${sound.path}`, e);
    }
  }
  
  /**
   * Preload all hit sounds
   */
  async preloadHitSounds(): Promise<void> {
    const sounds = Object.values(this.hitSounds);
    await Promise.all(sounds.map(s => this.preloadSound(s)));
  }
  
  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Get current ducking state
   */
  getDuckingState(): { global: number; music: number } {
    const musicChannel = this.musicChannelId 
      ? this.channels.get(this.musicChannelId) 
      : null;
    
    return {
      global: this.globalDuck,
      music: musicChannel?.ducking ?? 0,
    };
  }
  
  /**
   * Stop all sounds
   */
  stopAll(): void {
    for (const [id, node] of this.activeNodes) {
      try {
        node.stop();
      } catch (e) {
        // Ignore errors on already stopped nodes
      }
    }
    this.activeNodes.clear();
    
    this.globalDuck = 0;
    this.globalDuckTarget = 0;
    
    for (const [_, channel] of this.channels) {
      channel.ducking = 0;
      channel.duckTarget = 0;
      channel.playing = false;
    }
  }
}
