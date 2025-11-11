import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  battleMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  punchSound: HTMLAudioElement | null;
  kickSound: HTMLAudioElement | null;
  specialSound: HTMLAudioElement | null;
  jumpSound: HTMLAudioElement | null;
  koSound: HTMLAudioElement | null;
  victorySound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setBattleMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setPunchSound: (sound: HTMLAudioElement) => void;
  setKickSound: (sound: HTMLAudioElement) => void;
  setSpecialSound: (sound: HTMLAudioElement) => void;
  setJumpSound: (sound: HTMLAudioElement) => void;
  setKoSound: (sound: HTMLAudioElement) => void;
  setVictorySound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playPunch: () => void;
  playKick: () => void;
  playSpecial: () => void;
  playJump: () => void;
  playKO: () => void;
  playVictory: () => void;
  startBattleMusic: () => void;
  stopBattleMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  battleMusic: null,
  hitSound: null,
  successSound: null,
  punchSound: null,
  kickSound: null,
  specialSound: null,
  jumpSound: null,
  koSound: null,
  victorySound: null,
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setBattleMusic: (music) => set({ battleMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setPunchSound: (sound) => set({ punchSound: sound }),
  setKickSound: (sound) => set({ kickSound: sound }),
  setSpecialSound: (sound) => set({ specialSound: sound }),
  setJumpSound: (sound) => set({ jumpSound: sound }),
  setKoSound: (sound) => set({ koSound: sound }),
  setVictorySound: (sound) => set({ victorySound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        return;
      }
      
      try {
        // Clone the sound to allow overlapping playback
        const soundClone = hitSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.3;
        soundClone.play().catch(error => {
          // Sound autoplay blocked by browser - this is expected on first interaction
          if (error.name === 'NotAllowedError') {
            console.log("Hit sound blocked - awaiting user interaction");
          } else {
            console.warn("Hit sound failed to play:", error);
          }
        });
      } catch (error) {
        console.error("Failed to create hit sound clone:", error);
      }
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      try {
        successSound.currentTime = 0;
        successSound.play().catch(error => {
          if (error.name !== 'NotAllowedError') {
            console.warn("Success sound failed:", error);
          }
        });
      } catch (error) {
        console.error("Failed to play success sound:", error);
      }
    }
  },
  
  playPunch: () => {
    const { punchSound, hitSound, isMuted } = get();
    const sound = punchSound || hitSound; // Fallback to hit sound
    if (sound && !isMuted) {
      try {
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = 0.4;
        clone.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  playKick: () => {
    const { kickSound, hitSound, isMuted } = get();
    const sound = kickSound || hitSound; // Fallback to hit sound
    if (sound && !isMuted) {
      try {
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = 0.5;
        clone.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  playSpecial: () => {
    const { specialSound, isMuted } = get();
    if (specialSound && !isMuted) {
      try {
        const clone = specialSound.cloneNode() as HTMLAudioElement;
        clone.volume = 0.6;
        clone.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  playJump: () => {
    const { jumpSound, isMuted } = get();
    if (jumpSound && !isMuted) {
      try {
        const clone = jumpSound.cloneNode() as HTMLAudioElement;
        clone.volume = 0.2;
        clone.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  playKO: () => {
    const { koSound, isMuted } = get();
    if (koSound && !isMuted) {
      try {
        koSound.currentTime = 0;
        koSound.volume = 0.7;
        koSound.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  playVictory: () => {
    const { victorySound, successSound, isMuted } = get();
    const sound = victorySound || successSound; // Fallback to success sound
    if (sound && !isMuted) {
      try {
        sound.currentTime = 0;
        sound.volume = 0.6;
        sound.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  startBattleMusic: () => {
    const { battleMusic, backgroundMusic, isMuted } = get();
    const music = battleMusic || backgroundMusic; // Fallback to background music
    if (music && !isMuted) {
      try {
        music.loop = true;
        music.volume = 0.3;
        music.currentTime = 0;
        music.play().catch(() => {});
      } catch (error) {}
    }
  },
  
  stopBattleMusic: () => {
    const { battleMusic, backgroundMusic } = get();
    const music = battleMusic || backgroundMusic;
    if (music) {
      try {
        music.pause();
        music.currentTime = 0;
      } catch (error) {}
    }
  }
}));
