/**
 * VOICE ACTING SYSTEM
 * Text-to-Speech integration for character dialogue
 * Uses Web Speech API + future support for premium TTS (ElevenLabs, Google Cloud)
 */

export type VoiceProvider = 'web-speech' | 'elevenlabs' | 'google-cloud' | 'professional-va';
export type VoiceEmotion = 'neutral' | 'confident' | 'angry' | 'sad' | 'determined' | 'calm' | 'epic';

export interface VoiceConfig {
  characterId: string;
  voiceName: string;
  pitch: number; // 0.5 - 2.0
  rate: number; // 0.5 - 2.0
  volume: number; // 0 - 1.0
  provider: VoiceProvider;
  emotion: VoiceEmotion;
}

export interface DialogueAudioOptions {
  characterId: string;
  text: string;
  emotion?: VoiceEmotion;
  volume?: number;
  onEnd?: () => void;
}

// Character voice configurations
export const CHARACTER_VOICES: Record<string, VoiceConfig> = {
  'kai-jax': {
    characterId: 'kai-jax',
    voiceName: 'Google UK English Male',
    pitch: 0.85,
    rate: 0.95,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'determined',
  },
  jaxon: {
    characterId: 'jaxon',
    voiceName: 'Google US English Male',
    pitch: 1.1,
    rate: 1.15,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'confident',
  },
  kaison: {
    characterId: 'kaison',
    voiceName: 'Google UK English Male',
    pitch: 0.9,
    rate: 1.0,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'calm',
  },
  'boryx-zenith': {
    characterId: 'boryx-zenith',
    voiceName: 'Google US English Male',
    pitch: 0.7,
    rate: 0.9,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'angry',
  },
  'lunara-solis': {
    characterId: 'lunara-solis',
    voiceName: 'Google US English Female',
    pitch: 1.2,
    rate: 0.95,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'calm',
  },
  'umbra-flux': {
    characterId: 'umbra-flux',
    voiceName: 'Google US English Male',
    pitch: 1.0,
    rate: 1.2,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'confident',
  },
  'sentinel-vox': {
    characterId: 'sentinel-vox',
    voiceName: 'Google UK English Male',
    pitch: 0.8,
    rate: 1.0,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'neutral',
  },
  'chronos-sere': {
    characterId: 'chronos-sere',
    voiceName: 'Google US English Male',
    pitch: 0.6,
    rate: 0.85,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'angry',
  },
  silver: {
    characterId: 'silver',
    voiceName: 'Google US English Male',
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
    provider: 'web-speech',
    emotion: 'determined',
  },
};

// Global state
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;
let voiceVolume = 1.0;
let isVoiceEnabled = true;

/**
 * Initialize speech synthesis
 */
export function initializeVoiceSystem(): void {
  // Check browser support
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn('Speech Synthesis API not supported in this browser');
    isVoiceEnabled = false;
    return;
  }

  // Load saved settings
  const savedVolume = localStorage.getItem('voice-volume');
  const savedEnabled = localStorage.getItem('voice-enabled');

  if (savedVolume) voiceVolume = parseFloat(savedVolume);
  if (savedEnabled !== null) isVoiceEnabled = JSON.parse(savedEnabled);
}

/**
 * Play dialogue audio for a character
 */
export async function playDialogueAudio(
  options: DialogueAudioOptions
): Promise<void> {
  if (!isVoiceEnabled) {
    options.onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    options.onEnd?.();
    return;
  }

  // Cancel any currently speaking utterance
  synth.cancel();

  const voiceConfig = CHARACTER_VOICES[options.characterId] || CHARACTER_VOICES['kai-jax'];
  const emotion = options.emotion || voiceConfig.emotion;

  // Adjust text based on emotion for better TTS delivery
  let processedText = options.text;
  if (emotion === 'angry') {
    processedText = processedText.toUpperCase();
  } else if (emotion === 'sad') {
    processedText = processedText.replace(/\./g, '...');
  }

  const utterance = new SpeechSynthesisUtterance(processedText);

  // Set voice
  const voices = synth.getVoices();
  const selectedVoice = voices.find(v => v.name.includes(voiceConfig.voiceName)) || voices[0];
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Set prosody
  utterance.pitch = voiceConfig.pitch;
  utterance.rate = voiceConfig.rate;
  utterance.volume = (options.volume || voiceConfig.volume) * voiceVolume;

  // Handle completion
  utterance.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (event) => {
    console.warn('Speech synthesis error:', event.error);
    isSpeaking = false;
    currentUtterance = null;
    options.onEnd?.();
  };

  currentUtterance = utterance;
  isSpeaking = true;
  synth.speak(utterance);
}

/**
 * Stop current speech
 */
export function stopDialogueAudio(): void {
  const synth = window.speechSynthesis;
  if (synth) {
    synth.cancel();
  }
  isSpeaking = false;
  currentUtterance = null;
}

/**
 * Check if audio is currently playing
 */
export function isPlayingDialogue(): boolean {
  return isSpeaking;
}

/**
 * Set voice volume (0-1)
 */
export function setVoiceVolume(volume: number): void {
  voiceVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('voice-volume', voiceVolume.toString());
}

/**
 * Get current voice volume
 */
export function getVoiceVolume(): number {
  return voiceVolume;
}

/**
 * Enable/disable voice
 */
export function setVoiceEnabled(enabled: boolean): void {
  isVoiceEnabled = enabled;
  localStorage.setItem('voice-enabled', JSON.stringify(enabled));
  if (!enabled) {
    stopDialogueAudio();
  }
}

/**
 * Get voice enabled status
 */
export function isVoiceEnabled_(): boolean {
  return isVoiceEnabled;
}

/**
 * Load available voices (call after synth initializes)
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  const synth = window.speechSynthesis;
  return synth ? synth.getVoices() : [];
}

/**
 * Preload voices (some browsers require this)
 */
export function preloadVoices(): void {
  const synth = window.speechSynthesis;
  if (!synth) return;

  // Trigger voice loading
  if (synth.onvoiceschanged !== null) {
    synth.onvoiceschanged = () => {
      console.log('Voices loaded:', getAvailableVoices().length);
    };
  }
}
