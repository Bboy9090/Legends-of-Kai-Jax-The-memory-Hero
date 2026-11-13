import { adaptiveMusic, type MusicMood } from "../systems/AdaptiveMusic";
import { useAdventure } from "./stores/useAdventure";
import { useAudio } from "./stores/useAudio";
import { useMusic } from "./stores/useMusic";
import { useRunner, type GameState } from "./stores/useRunner";

const EXPLORE: ReadonlySet<GameState> = new Set(["story-hub", "campaign-map", "district-select", "story-mode-select", "mission-select"]);
const COMBAT: ReadonlySet<GameState> = new Set(["adventure", "playing", "story-mode"]);

/** Which mood the music should be in. A living boss in phase 2 outranks plain combat. */
export function moodFor(state: GameState, boss: { alive: boolean; phase?: 1 | 2 } = { alive: false }): MusicMood {
  if (state === "mission-complete") return "victory";
  if (COMBAT.has(state)) return boss.alive && boss.phase === 2 ? "boss" : "combat";
  if (EXPLORE.has(state)) return "explore";
  return "title";
}

function currentMood(): MusicMood {
  const boss = useAdventure.getState().enemies.find((e) => e.bossKey && !e.isDead);
  return moodFor(useRunner.getState().gameState, { alive: Boolean(boss), phase: boss?.bossPhase });
}

/** Wires stores → music engine. Returns a cleanup function. Idempotent per call. */
export function startMusicDirector(): () => void {
  const apply = () => {
    const { isMuted, volume } = useAudio.getState();
    const { adaptive, musicVolume } = useMusic.getState();
    adaptiveMusic.setLevel(isMuted || !adaptive ? 0 : volume * musicVolume);
    adaptiveMusic.setMood(currentMood());
  };
  const unsubs = [useRunner.subscribe(apply), useAdventure.subscribe(apply), useAudio.subscribe(apply), useMusic.subscribe(apply)];

  const unlock = () => {
    if (useMusic.getState().adaptive) adaptiveMusic.unlock();
    apply();
  };
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  events.forEach((e) => window.addEventListener(e, unlock, { once: false, passive: true }));
  const onVisibility = () => (document.hidden ? adaptiveMusic.suspend() : adaptiveMusic.resume());
  document.addEventListener("visibilitychange", onVisibility);
  apply();

  return () => {
    unsubs.forEach((u) => u());
    events.forEach((e) => window.removeEventListener(e, unlock));
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
