import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioSystem, audioSystem } from "../systems/AudioSystem";
import { playSfx } from "./sfx";
import { useAudio } from "./stores/useAudio";

class FakeParam {
  value = 0;
  setValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
}

function makeNode(counter: { starts: number }) {
  const node: Record<string, unknown> = {
    connect: (target: unknown) => target,
    start: () => { counter.starts++; },
    stop: () => {},
    frequency: new FakeParam(),
    gain: new FakeParam(),
    Q: new FakeParam(),
    type: "sine",
    buffer: null,
  };
  return node;
}

function installFakeAudioContext(initialState: "running" | "suspended" = "running") {
  const counter = { starts: 0, resumed: 0 };
  class FakeContext {
    state: string = initialState;
    currentTime = 0;
    sampleRate = 8000;
    destination = {};
    createOscillator() { return makeNode(counter); }
    createBufferSource() { return makeNode(counter); }
    createBiquadFilter() { return makeNode(counter); }
    createGain() { return makeNode(counter); }
    createBuffer(_c: number, length: number) { return { getChannelData: () => new Float32Array(length) }; }
    resume() { counter.resumed++; return Promise.resolve().then(() => { this.state = "running"; }); }
  }
  (globalThis as Record<string, unknown>).window = { AudioContext: FakeContext, addEventListener: () => {} };
  return counter;
}

const REQUIRED_SOUNDS = ["ui_click", "strike", "cast_t1", "cast_t2", "ultimate", "boss_roar", "victory", "defeat"] as const;

describe("AudioSystem procedural engine", () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  it("synthesizes every required sound with a running context", () => {
    for (const id of REQUIRED_SOUNDS) {
      const counter = installFakeAudioContext();
      const engine = new AudioSystem();
      engine.setVolume(0.8);
      engine.play(id);
      expect(counter.starts, id).toBeGreaterThan(0);
      expect(engine.isRunning()).toBe(true);
    }
  });

  it("resumes a suspended context (autoplay policy) and plays nothing until it is running", async () => {
    const counter = installFakeAudioContext("suspended");
    const engine = new AudioSystem();
    engine.play("ui_click");
    expect(counter.starts).toBe(0);
    expect(counter.resumed).toBeGreaterThan(0);
    await Promise.resolve();
    await Promise.resolve();
    engine.play("ui_click");
    expect(counter.starts).toBeGreaterThan(0);
  });

  it("is silent at zero volume", () => {
    const counter = installFakeAudioContext();
    const engine = new AudioSystem();
    engine.setVolume(0);
    engine.play("ultimate");
    expect(counter.starts).toBe(0);
  });

  it("is a silent no-op when no AudioContext exists", () => {
    delete (globalThis as Record<string, unknown>).window;
    const engine = new AudioSystem();
    expect(() => REQUIRED_SOUNDS.forEach((id) => engine.play(id))).not.toThrow();
    expect(engine.isRunning()).toBe(false);
  });
});

describe("playSfx facade and Settings controls", () => {
  beforeEach(() => {
    useAudio.setState({ isMuted: false, volume: 0.6 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps camelCase names to engine ids and applies the Settings volume", () => {
    const play = vi.spyOn(audioSystem, "play").mockImplementation(() => {});
    const setVolume = vi.spyOn(audioSystem, "setVolume").mockImplementation(() => {});
    playSfx("bossRoar");
    expect(setVolume).toHaveBeenCalledWith(0.6);
    expect(play).toHaveBeenCalledWith("boss_roar");
    playSfx("castT2");
    expect(play).toHaveBeenLastCalledWith("cast_t2");
  });

  it("does not play while muted and resumes after unmuting", () => {
    const play = vi.spyOn(audioSystem, "play").mockImplementation(() => {});
    useAudio.getState().toggleMute();
    expect(useAudio.getState().isMuted).toBe(true);
    playSfx("uiClick");
    expect(play).not.toHaveBeenCalled();
    useAudio.getState().toggleMute();
    playSfx("uiClick");
    expect(play).toHaveBeenCalledWith("ui_click");
  });

  it("silences the combat sound hooks while muted", () => {
    const play = vi.spyOn(audioSystem, "play").mockImplementation(() => {});
    useAudio.getState().setMuted(true);
    const { playPunch, playSpecial, playHit, playKO, playVictory } = useAudio.getState();
    [playPunch, playSpecial, playHit, playKO, playVictory].forEach((fn) => fn());
    expect(play).not.toHaveBeenCalled();
  });

  it("clamps volume", () => {
    useAudio.getState().setVolume(5);
    expect(useAudio.getState().volume).toBe(1);
    useAudio.getState().setVolume(-1);
    expect(useAudio.getState().volume).toBe(0);
  });
});
