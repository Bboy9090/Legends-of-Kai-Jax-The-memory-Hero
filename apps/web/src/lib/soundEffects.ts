/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * SOUND EFFECTS SYSTEM
 * Enhanced sound effects for legendary experience
 */

export interface SoundEffect {
  name: string;
  path: string;
  volume: number;
  playbackRate?: number;
}

export const SOUND_EFFECTS: Record<string, SoundEffect> = {
  // UI Sounds
  menuClick: {
    name: 'Menu Click',
    path: '/sounds/ui/click.mp3',
    volume: 0.5,
    playbackRate: 1.0,
  },
  menuHover: {
    name: 'Menu Hover',
    path: '/sounds/ui/hover.mp3',
    volume: 0.3,
    playbackRate: 1.0,
  },
  menuSelect: {
    name: 'Menu Select',
    path: '/sounds/ui/select.mp3',
    volume: 0.6,
    playbackRate: 1.0,
  },
  menuBack: {
    name: 'Menu Back',
    path: '/sounds/ui/back.mp3',
    volume: 0.4,
    playbackRate: 1.0,
  },
  
  // Combat Sounds
  punch: {
    name: 'Punch',
    path: '/sounds/combat/punch.mp3',
    volume: 0.6,
    playbackRate: 1.1,
  },
  kick: {
    name: 'Kick',
    path: '/sounds/combat/kick.mp3',
    volume: 0.7,
    playbackRate: 0.9,
  },
  special: {
    name: 'Special Attack',
    path: '/sounds/combat/special.mp3',
    volume: 0.8,
    playbackRate: 1.0,
  },
  hit: {
    name: 'Hit',
    path: '/sounds/combat/hit.mp3',
    volume: 0.6,
    playbackRate: 0.9 + Math.random() * 0.2,
  },
  block: {
    name: 'Block',
    path: '/sounds/combat/block.mp3',
    volume: 0.5,
    playbackRate: 1.0,
  },
  dodge: {
    name: 'Dodge',
    path: '/sounds/combat/dodge.mp3',
    volume: 0.4,
    playbackRate: 1.2,
  },
  
  // Movement Sounds
  jump: {
    name: 'Jump',
    path: '/sounds/movement/jump.mp3',
    volume: 0.3,
    playbackRate: 1.0,
  },
  dash: {
    name: 'Dash',
    path: '/sounds/movement/dash.mp3',
    volume: 0.4,
    playbackRate: 1.1,
  },
  land: {
    name: 'Land',
    path: '/sounds/movement/land.mp3',
    volume: 0.3,
    playbackRate: 0.9,
  },
  
  // Battle Events
  taunt: {
    name: 'Taunt',
    path: '/sounds/battle/taunt.mp3',
    volume: 0.5,
    playbackRate: 1.0,
  },
  smirk: {
    name: 'Smirk',
    path: '/sounds/battle/smirk.mp3',
    volume: 0.4,
    playbackRate: 1.0,
  },
  encourage: {
    name: 'Encourage',
    path: '/sounds/battle/encourage.mp3',
    volume: 0.5,
    playbackRate: 1.0,
  },
  ko: {
    name: 'KO',
    path: '/sounds/battle/ko.mp3',
    volume: 0.8,
    playbackRate: 1.0,
  },
  victory: {
    name: 'Victory',
    path: '/sounds/battle/victory.mp3',
    volume: 0.7,
    playbackRate: 1.0,
  },
  defeat: {
    name: 'Defeat',
    path: '/sounds/battle/defeat.mp3',
    volume: 0.6,
    playbackRate: 1.0,
  },
  
  // Transformation
  transform: {
    name: 'Transform',
    path: '/sounds/transform/transform.mp3',
    volume: 0.8,
    playbackRate: 1.0,
  },
  fusion: {
    name: 'Fusion',
    path: '/sounds/transform/fusion.mp3',
    volume: 0.9,
    playbackRate: 1.0,
  },
  
  // Mission/UI
  missionStart: {
    name: 'Mission Start',
    path: '/sounds/mission/start.mp3',
    volume: 0.7,
    playbackRate: 1.0,
  },
  missionComplete: {
    name: 'Mission Complete',
    path: '/sounds/mission/complete.mp3',
    volume: 0.8,
    playbackRate: 1.0,
  },
  unlock: {
    name: 'Unlock',
    path: '/sounds/ui/unlock.mp3',
    volume: 0.6,
    playbackRate: 1.0,
  },
  error: {
    name: 'Error',
    path: '/sounds/ui/error.mp3',
    volume: 0.5,
    playbackRate: 1.0,
  },
};

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  async loadSound(key: string, sound: SoundEffect): Promise<void> {
    try {
      const audio = new Audio(sound.path);
      audio.volume = sound.volume;
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    } catch (error) {
      console.warn(`Failed to load sound ${key}:`, error);
    }
  }

  async loadAllSounds(): Promise<void> {
    const loadPromises = Object.entries(SOUND_EFFECTS).map(([key, sound]) =>
      this.loadSound(key, sound)
    );
    await Promise.all(loadPromises);
  }

  play(key: string, options?: { volume?: number; playbackRate?: number }): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(key);
    if (!sound) {
      console.warn(`Sound ${key} not loaded`);
      return;
    }

    try {
      const clone = sound.cloneNode() as HTMLAudioElement;
      if (options?.volume !== undefined) clone.volume = options.volume;
      if (options?.playbackRate !== undefined) clone.playbackRate = options.playbackRate;
      clone.play().catch((error) => {
        if (error.name !== 'NotAllowedError') {
          console.warn(`Failed to play sound ${key}:`, error);
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  isSoundLoaded(key: string): boolean {
    return this.sounds.has(key);
  }
}

export const soundManager = new SoundManager();

// Auto-load sounds on initialization
if (typeof window !== 'undefined') {
  soundManager.loadAllSounds().catch(console.error);
}
