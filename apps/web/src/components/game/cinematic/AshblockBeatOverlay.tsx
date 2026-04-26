/**
 * AshblockBeatOverlay — DOM-layer cinematic for the Ashblock vertical slice.
 *
 * Sits over the Three.js canvas. Reads canon-locked beats from
 * AshblockHeightsScript and plays them with typewriter narration,
 * speaker color bands, and click/skip controls.
 *
 * Triggers `onEscalation(encounterId)` exactly once when the escalation
 * beat is reached so the slice scene can spawn the wave.
 * Triggers `onPayoff()` exactly once after the payoff beat is dismissed.
 *
 * No Three.js imports here — pure DOM/Tailwind. No LLM. No async network.
 */

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ASHBLOCK_SCRIPTS,
  SPEAKER_COLORS,
  type EncounterScript,
  type NarrativeLine,
} from "../../../game/world/zones/AshblockHeights/AshblockHeightsScript";
import {
  INITIAL_FLOW,
  advanceFlow,
  onCombatComplete,
  skipCurrentBeat,
  getCurrentBeat,
  getCurrentEncounter,
  type FlowState,
} from "./cinematicFlow";

// Speed of the typewriter, in chars/second. Narrator slower for atmosphere.
const TYPE_SPEEDS: Record<NarrativeLine["tone"], number> = {
  narrative: 38,
  warm: 52,
  cold: 48,
  memory: 44,
  electric: 60,
  hungry: 56,
  commanding: 50,
};

interface AshblockBeatOverlayHandle {
  /** Call from the host scene when a combat encounter is fully cleared. */
  notifyCombatComplete: () => void;
  /** Read current state for tests / debug HUDs. */
  getState: () => FlowState;
}

export interface AshblockBeatOverlayProps {
  /** Optional override (used in storybook / tests). Defaults to canon scripts. */
  scripts?: readonly EncounterScript[];
  /** Fires once per encounter when the escalation beat is reached. */
  onEscalation: (encounterId: string) => void;
  /** Fires after the payoff beat of the FINAL encounter is dismissed. */
  onSliceComplete?: () => void;
  /** Fires after each encounter's payoff (every encounter). */
  onEncounterComplete?: (encounterId: string) => void;
  /** Hide the entire overlay (e.g. host scene paused/menu). */
  hidden?: boolean;
  /**
   * Imperative handle so the host scene can call notifyCombatComplete().
   * Kept simple instead of forwardRef to avoid pulling extra plumbing.
   */
  controlRef?: React.MutableRefObject<AshblockBeatOverlayHandle | null>;
}

export function AshblockBeatOverlay(props: AshblockBeatOverlayProps): React.ReactElement | null {
  const scripts = props.scripts ?? ASHBLOCK_SCRIPTS;
  const [flow, setFlow] = useState<FlowState>(INITIAL_FLOW);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const escalationFiredFor = useRef<Set<string>>(new Set());
  const payoffFiredFor = useRef<Set<string>>(new Set());

  const beat = getCurrentBeat(flow, scripts);
  const encounter = getCurrentEncounter(flow, scripts);
  const currentLine: NarrativeLine | null = beat?.lines[lineIdx] ?? null;

  // Reset typewriter when the line changes.
  useEffect(() => {
    setTyped(0);
  }, [flow.encounterIndex, flow.beatIndex, lineIdx, flow.phase]);

  // Typewriter ticker.
  useEffect(() => {
    if (!currentLine) return;
    if (typed >= currentLine.text.length) return;
    const speed = TYPE_SPEEDS[currentLine.tone] ?? 45;
    const interval = window.setInterval(() => {
      setTyped((t) => Math.min(currentLine.text.length, t + 1));
    }, Math.max(15, Math.floor(1000 / speed)));
    return () => window.clearInterval(interval);
  }, [currentLine, typed]);

  // Fire escalation callback once per encounter when phase flips to combat.
  useEffect(() => {
    if (flow.phase !== "combat") return;
    if (!encounter) return;
    if (escalationFiredFor.current.has(encounter.encounterId)) return;
    escalationFiredFor.current.add(encounter.encounterId);
    props.onEscalation(encounter.encounterId);
  }, [flow.phase, encounter, props]);

  // Reset line index whenever beat changes.
  useEffect(() => {
    setLineIdx(0);
  }, [flow.encounterIndex, flow.beatIndex, flow.phase]);

  // Imperative control handle for the host scene.
  useEffect(() => {
    if (!props.controlRef) return;
    props.controlRef.current = {
      notifyCombatComplete: () => setFlow((s) => onCombatComplete(s)),
      getState: () => flow,
    };
    return () => {
      if (props.controlRef) props.controlRef.current = null;
    };
  }, [props.controlRef, flow]);

  // Click handler — advance line, then beat, then encounter.
  const handleAdvance = () => {
    if (!currentLine || !beat) {
      // payoff already dismissed → next encounter
      setFlow((s) => {
        const next = advanceFlow(s, scripts);
        return next;
      });
      return;
    }
    // If typewriter not done, finish it first.
    if (typed < currentLine.text.length) {
      setTyped(currentLine.text.length);
      return;
    }
    // Move to next line in the same beat.
    if (lineIdx + 1 < beat.lines.length) {
      setLineIdx((i) => i + 1);
      return;
    }
    // End of beat: special handling for payoff (fire callback) then advance.
    if (flow.phase === "payoff" && encounter) {
      if (!payoffFiredFor.current.has(encounter.encounterId)) {
        payoffFiredFor.current.add(encounter.encounterId);
        props.onEncounterComplete?.(encounter.encounterId);
      }
      setFlow((s) => {
        const next = advanceFlow(s, scripts);
        if (next.phase === "done") props.onSliceComplete?.();
        return next;
      });
      return;
    }
    // Pre-combat beat boundary.
    setFlow((s) => advanceFlow(s, scripts));
  };

  const handleSkip = () => {
    setFlow((s) => {
      const next = skipCurrentBeat(s, scripts);
      if (next.phase === "done") props.onSliceComplete?.();
      return next;
    });
  };

  if (props.hidden) return null;
  if (flow.phase === "combat" || flow.phase === "done") return null;
  if (!beat || !encounter || !currentLine) return null;

  const palette = SPEAKER_COLORS[currentLine.speaker];
  const bandStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${palette.hex}33 0%, transparent 100%)`,
    borderLeft: `3px solid ${palette.hex}`,
  };

  const phaseLabel =
    flow.phase === "payoff"
      ? "AFTERMATH"
      : beat.step === "scene_entry"
        ? "ATMOSPHERE"
        : beat.step === "objective"
          ? "OBJECTIVE"
          : beat.step === "conflict"
            ? "TENSION"
            : beat.step === "escalation"
              ? "GO"
              : beat.step.toUpperCase();

  return (
    <div
      role="dialog"
      aria-label="Ashblock cinematic beat"
      data-testid="ashblock-beat-overlay"
      data-flow-phase={flow.phase}
      data-encounter-id={encounter.encounterId}
      data-beat-step={beat.step}
      onClick={handleAdvance}
      className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,5,12,0.0) 0%, rgba(8,5,12,0.55) 65%, rgba(8,5,12,0.92) 100%)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Header strip */}
      <div className="absolute top-0 left-0 right-0 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="text-[10px] tracking-[0.35em] font-bold"
            style={{ color: "#ff8a3d" }}
          >
            ASHBLOCK HEIGHTS
          </div>
          <div className="text-[10px] tracking-[0.3em] text-white/40">·</div>
          <div className="text-[10px] tracking-[0.3em] text-white/55">
            {encounter.title.toUpperCase()}
          </div>
          <div className="text-[10px] tracking-[0.3em] text-white/30">·</div>
          <div className="text-[10px] tracking-[0.3em] text-white/70" data-testid="beat-phase-label">
            {phaseLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          data-testid="cinematic-skip"
          className="text-[10px] tracking-[0.3em] text-white/45 hover:text-white/90 transition px-3 py-1 border border-white/15 rounded"
        >
          SKIP
        </button>
      </div>

      {/* Dialogue panel */}
      <div className="px-6 pb-10 pt-6">
        <div
          className="max-w-3xl mx-auto rounded-md p-5 shadow-2xl"
          style={{
            ...bandStyle,
            background: `linear-gradient(180deg, rgba(15,10,22,0.85), rgba(8,5,14,0.95)), ${bandStyle.background as string}`,
            boxShadow: `0 0 40px ${palette.hex}22`,
          }}
        >
          <div className="flex items-baseline gap-3 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: palette.hex }}
              data-testid="beat-speaker"
            >
              {palette.name}
            </span>
            <span className="text-[10px] tracking-[0.3em] text-white/35">
              {currentLine.tone}
            </span>
          </div>
          <p
            className={
              currentLine.speaker === "narrator"
                ? "text-[15px] leading-relaxed text-white/85 italic"
                : "text-lg leading-relaxed text-white"
            }
            data-testid="beat-line-text"
          >
            {currentLine.text.slice(0, typed)}
            <span
              className="inline-block w-2 ml-0.5"
              style={{
                opacity: typed < currentLine.text.length ? 0.85 : 0,
                color: palette.hex,
              }}
            >
              ▍
            </span>
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[10px] tracking-[0.3em] text-white/35">
              line {lineIdx + 1} / {beat.lines.length}
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/45">
              click to continue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AshblockBeatOverlay;
export type { AshblockBeatOverlayHandle };
