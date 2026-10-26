import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudio } from './useAudio';
import { soundManager } from '../soundEffects';
import {
  getVoiceVolume, isVoiceEnabled_, playDialogueAudio, setVoiceEnabled, setVoiceVolume,
} from '../voiceActing';

class FakeAudio {
  muted = false;
  paused = false;
  currentTime = 7;
  volume = 1;
  playbackRate = 1;
  preload = '';
  play = vi.fn(async () => { this.paused = false; });
  pause = vi.fn(() => { this.paused = true; });
  addEventListener = vi.fn();
  clones: FakeAudio[] = [];
  cloneNode = vi.fn(() => {
    const clone = new FakeAudio();
    this.clones.push(clone);
    return clone;
  });
}
const audio = () => new FakeAudio() as unknown as HTMLAudioElement;

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.stubGlobal('window', { speechSynthesis: { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] } });
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    constructor(public text: string) {}
    volume = 1;
  });
  useAudio.setState({ backgroundMusic: null, battleMusic: null, hitSound: null, successSound: null });
  useAudio.getState().setMuted(false);
  setVoiceEnabled(true);
  setVoiceVolume(1);
});
afterEach(() => { useAudio.getState().setMuted(true); vi.unstubAllGlobals(); });

describe('master audio mute release contract', () => {
  it('silences every existing HTML track and sound immediately', () => {
    const tracks = [audio(), audio(), audio(), audio()];
    const state = useAudio.getState();
    state.setBackgroundMusic(tracks[0]); state.setBattleMusic(tracks[1]);
    state.setHitSound(tracks[2]); state.setSuccessSound(tracks[3]);
    state.setMuted(true);
    for (const track of tracks) {
      expect(track.muted).toBe(true);
      expect(track.pause).toHaveBeenCalledOnce();
    }
  });

  it('applies mute to later assignments and blocks all HTML effect entry points', () => {
    const state = useAudio.getState();
    state.setMuted(true);
    const hit = audio(); const success = audio(); const battle = audio();
    state.setHitSound(hit); state.setSuccessSound(success); state.setBattleMusic(battle);
    state.playJump(); state.playPunch(); state.playKick(); state.playSpecial();
    state.playHit(); state.playKO(); state.playVictory(); state.startBattleMusic();
    for (const track of [hit, success, battle]) {
      expect(track.muted).toBe(true);
      expect(track.play).not.toHaveBeenCalled();
      expect(track.currentTime).toBe(7);
    }
  });

  it('unmutes without replaying paused sounds and permits deliberate new playback', () => {
    const hit = audio(); const music = audio();
    const state = useAudio.getState();
    state.setHitSound(hit); state.setBackgroundMusic(music);
    state.setMuted(true); state.setMuted(false);
    expect(hit.muted).toBe(false); expect(music.muted).toBe(false);
    expect(hit.play).not.toHaveBeenCalled(); expect(music.play).not.toHaveBeenCalled();
    state.playPunch();
    expect(hit.play).toHaveBeenCalledOnce();
    expect(hit.currentTime).toBe(0);
  });

  it('pauses a replaced reference so an old track cannot continue ungoverned', () => {
    const state = useAudio.getState(); const old = audio();
    state.setBackgroundMusic(old); state.setBackgroundMusic(audio());
    expect(old.pause).toHaveBeenCalledOnce();
  });

  it('silences active SoundManager clones and blocks future clones while muted', async () => {
    const template = new FakeAudio();
    vi.stubGlobal('Audio', vi.fn(function () { return template; }));
    await soundManager.loadSound('mute-contract', { name: 'test', path: '/sounds/test.mp3', volume: 0.5 });
    soundManager.play('mute-contract');
    expect(template.clones).toHaveLength(1);
    const active = template.clones[0];
    useAudio.getState().setMuted(true);
    expect(active.muted).toBe(true); expect(active.pause).toHaveBeenCalledOnce();
    soundManager.play('mute-contract'); expect(template.clones).toHaveLength(1);
    useAudio.getState().setMuted(false);
    expect(active.play).toHaveBeenCalledOnce();
    soundManager.play('mute-contract'); expect(template.clones).toHaveLength(2);
  });

  it('cancels speech temporarily without changing saved voice preferences or replaying it', async () => {
    setVoiceVolume(0.4); setVoiceEnabled(true);
    await playDialogueAudio({ characterId: 'kai-jax', text: 'Remember.' });
    expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();
    useAudio.getState().setMuted(true);
    const ended = vi.fn();
    await playDialogueAudio({ characterId: 'kai-jax', text: 'Quiet.', onEnd: ended });
    expect(ended).toHaveBeenCalledOnce();
    expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();
    expect(getVoiceVolume()).toBe(0.4); expect(isVoiceEnabled_()).toBe(true);
    expect(localStorage.getItem('voice-volume')).toBe('0.4');
    expect(localStorage.getItem('voice-enabled')).toBe('true');
    useAudio.getState().setMuted(false);
    expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();
  });

  it('silences and stops an in-flight procedural effect at its master output', () => {
    const gains: any[] = []; const sources: any[] = [];
    class Context {
      state = 'running'; sampleRate = 1000; destination = {};
      createGain() { const gain = { gain: { value: 1 }, connect: vi.fn((next) => next) }; gains.push(gain); return gain; }
      createBuffer() { return { getChannelData: () => new Float32Array(1000) }; }
      createBufferSource() { const source = { connect: vi.fn((next) => next), start: vi.fn(), stop: vi.fn(), buffer: null, onended: null }; sources.push(source); return source; }
      createBiquadFilter() { return { frequency: { value: 0 }, Q: { value: 0 }, type: '', connect: vi.fn((next) => next) }; }
    }
    vi.stubGlobal('AudioContext', Context);
    useAudio.getState().playStoneAttack();
    expect(sources[0].start).toHaveBeenCalledOnce();
    useAudio.getState().setMuted(true);
    expect(gains[0].gain.value).toBe(0); expect(sources[0].stop).toHaveBeenCalledOnce();
    useAudio.getState().playDodge(); expect(sources).toHaveLength(1);
  });
});
