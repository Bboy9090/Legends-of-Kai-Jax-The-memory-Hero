/**
 * cinematicFlow — pure helpers for the Ashblock beat overlay.
 * Extracted so we can unit-test progression logic without React/DOM.
 */
import type { EncounterScript, NarrativeBeat } from "../../../game/world/zones/AshblockHeights/AshblockHeightsScript";

export type FlowPhase =
  /** A pre-combat beat (scene_entry / objective / conflict / escalation) is on screen. */
  | "playing_beat"
  /** Combat is live; overlay is hidden. */
  | "combat"
  /** Payoff beat is on screen after combat. */
  | "payoff"
  /** Slice is finished. */
  | "done";

export interface FlowState {
  encounterIndex: number;
  beatIndex: number;
  phase: FlowPhase;
}

export const INITIAL_FLOW: FlowState = {
  encounterIndex: 0,
  beatIndex: 0,
  phase: "playing_beat",
};

/**
 * Advance the flow by one user-interaction tick.
 *  - In `playing_beat`: walks beats 0→3 (scene_entry → objective → conflict → escalation).
 *    On reaching escalation, transitions to `combat` (caller should then spawn the wave).
 *  - In `combat`: handled by `onCombatComplete` (not advance()).
 *  - In `payoff`: advances to next encounter or `done`.
 */
export function advanceFlow(
  state: FlowState,
  scripts: readonly EncounterScript[],
): FlowState {
  if (state.phase === "done") return state;
  const enc = scripts[state.encounterIndex];
  if (!enc) return { ...state, phase: "done" };

  if (state.phase === "playing_beat") {
    const nextBeat = state.beatIndex + 1;
    // beats 0..2 are pre-escalation; beat 3 is escalation; beat 4 is payoff.
    if (nextBeat >= 3) {
      // We reached escalation — caller should hand off to combat.
      return { ...state, beatIndex: 3, phase: "combat" };
    }
    return { ...state, beatIndex: nextBeat };
  }

  if (state.phase === "payoff") {
    const nextEnc = state.encounterIndex + 1;
    if (nextEnc >= scripts.length) {
      return { ...state, phase: "done" };
    }
    return { encounterIndex: nextEnc, beatIndex: 0, phase: "playing_beat" };
  }

  return state;
}

/** Caller invokes this after the combat encounter is cleared. */
export function onCombatComplete(state: FlowState): FlowState {
  if (state.phase !== "combat") return state;
  return { ...state, beatIndex: 4, phase: "payoff" };
}

/** Skip button — bails to combat if pre-escalation, or to next encounter if payoff. */
export function skipCurrentBeat(
  state: FlowState,
  scripts: readonly EncounterScript[],
): FlowState {
  if (state.phase === "playing_beat") {
    return { ...state, beatIndex: 3, phase: "combat" };
  }
  if (state.phase === "payoff") {
    const nextEnc = state.encounterIndex + 1;
    if (nextEnc >= scripts.length) return { ...state, phase: "done" };
    return { encounterIndex: nextEnc, beatIndex: 0, phase: "playing_beat" };
  }
  return state;
}

export function getCurrentBeat(
  state: FlowState,
  scripts: readonly EncounterScript[],
): NarrativeBeat | null {
  if (state.phase === "combat" || state.phase === "done") return null;
  const enc = scripts[state.encounterIndex];
  if (!enc) return null;
  return enc.beats[state.beatIndex] ?? null;
}

export function getCurrentEncounter(
  state: FlowState,
  scripts: readonly EncounterScript[],
): EncounterScript | null {
  return scripts[state.encounterIndex] ?? null;
}
