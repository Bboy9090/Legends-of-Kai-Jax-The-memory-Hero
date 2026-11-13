import { audioSystem, type SfxId } from "../systems/AudioSystem";
import { useAudio } from "./stores/useAudio";

export type SfxName =
  | "uiClick"
  | "strike"
  | "hitLight"
  | "hitHeavy"
  | "castT1"
  | "castT2"
  | "ultimate"
  | "bossRoar"
  | "phaseTransition"
  | "victory"
  | "defeat"
  | "ko"
  | "block"
  | "whoosh";

const SFX_IDS: Record<SfxName, SfxId> = {
  uiClick: "ui_click",
  strike: "strike",
  hitLight: "hit_light",
  hitHeavy: "hit_heavy",
  castT1: "cast_t1",
  castT2: "cast_t2",
  ultimate: "ultimate",
  bossRoar: "boss_roar",
  phaseTransition: "phase_transition",
  victory: "victory",
  defeat: "defeat",
  ko: "ko",
  block: "block",
  whoosh: "whoosh",
};

/**
 * Play a procedural sound effect. Honors the Settings mute and volume, and is a silent
 * no-op when audio is unavailable (no AudioContext, autoplay not yet unlocked, SSR/tests).
 */
export function playSfx(name: SfxName): void {
  try {
    const { isMuted, volume } = useAudio.getState();
    if (isMuted) return;
    audioSystem.setVolume(volume);
    audioSystem.play(SFX_IDS[name]);
  } catch {
    // Audio must never break gameplay.
  }
}

const CLICKABLE = "button, [role='button'], a[href], summary, [data-sfx='click']";

function isDisabled(el: Element): boolean {
  return el.matches(":disabled") || el.getAttribute("aria-disabled") === "true";
}

let uiClickInstalled = false;

/** One capture-phase listener gives every menu button (shared or hand-rolled) a click sound. */
export function installUiClickSounds(): void {
  if (uiClickInstalled || typeof document === "undefined") return;
  uiClickInstalled = true;
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickable = target.closest(CLICKABLE);
      if (!clickable || isDisabled(clickable) || clickable.closest("[data-sfx='off']")) return;
      playSfx("uiClick");
    },
    true,
  );
}

installUiClickSounds();
