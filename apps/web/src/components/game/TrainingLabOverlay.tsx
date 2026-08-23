import { useEffect, useMemo, useRef, useState } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import {
  buildTrainingTelemetry,
  sanitizeInputHistory,
  type TrainingInputEvent,
} from "../../game/combat/trainingLab";

const MAX_INPUT_HISTORY = 12;

function formatSeconds(value: number): string {
  return `${Math.max(0, value).toFixed(3)}s`;
}

export default function TrainingLabOverlay({ visible }: { visible: boolean }) {
  const battle = useBattle();
  const [inputHistory, setInputHistory] = useState<TrainingInputEvent[]>([]);
  const sequenceRef = useRef(0);

  useEffect(() => {
    if (!visible) return;

    const record = (pressed: boolean) => (event: KeyboardEvent) => {
      if (event.repeat && pressed) return;
      const entry: TrainingInputEvent = {
        id: ++sequenceRef.current,
        code: event.code,
        pressed,
        atMs: performance.now(),
      };
      setInputHistory((history) =>
        sanitizeInputHistory([...history, entry], MAX_INPUT_HISTORY)
      );
    };

    const onDown = record(true);
    const onUp = record(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [visible]);

  const telemetry = useMemo(
    () =>
      buildTrainingTelemetry({
        playerAttackType: battle.playerAttackType,
        playerAttackElapsed: battle.playerAttackElapsed,
        playerComboStep: battle.playerComboStep,
        comboCount: battle.comboCount,
        comboDamage: battle.comboDamage,
        playerHitStunTimer: battle.playerHitStunTimer,
        opponentHitStunTimer: battle.opponentHitStunTimer,
        playerDodgeTimer: battle.playerDodgeTimer,
        guardBreakTimer: battle.guardBreakTimer,
        playerBlockParryWindow: battle.playerBlockParryWindow,
        playerStamina: battle.playerStamina,
        maxPlayerStamina: battle.maxPlayerStamina,
        playerX: battle.playerX,
        opponentX: battle.opponentX,
        playerVelocityX: battle.playerVelocityX,
        playerVelocityY: battle.playerVelocityY,
      }),
    [battle]
  );

  if (!visible) return null;

  return (
    <aside
      className="fixed left-3 top-16 z-[140] w-[min(94vw,390px)] max-h-[calc(100vh-5rem)] overflow-auto rounded-xl border border-cyan-400/30 bg-slate-950/90 p-3 text-slate-100 shadow-2xl backdrop-blur-md"
      aria-label="Training Lab telemetry"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Training Lab V1</div>
          <div className="text-xs text-slate-400">F2 toggles · observational telemetry</div>
        </div>
        <button
          type="button"
          className="rounded border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10"
          onClick={() => {
            battle.resetRound();
            setInputHistory([]);
          }}
        >
          Reset round
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Metric label="Distance" value={telemetry.distance.toFixed(2)} />
        <Metric label="Stamina" value={`${Math.round(telemetry.staminaRatio * 100)}%`} />
        <Metric label="Combo" value={`${telemetry.comboCount} / ${telemetry.comboDamage.toFixed(1)} dmg`} />
        <Metric label="Velocity" value={`${telemetry.velocityX.toFixed(2)}, ${telemetry.velocityY.toFixed(2)}`} />
        <Metric label="Player hitstun" value={formatSeconds(telemetry.playerHitStunTimer)} />
        <Metric label="Enemy hitstun" value={formatSeconds(telemetry.opponentHitStunTimer)} />
        <Metric label="Dodge invuln" value={formatSeconds(telemetry.playerDodgeTimer)} />
        <Metric label="Parry window" value={formatSeconds(telemetry.parryWindow)} />
      </div>

      <section className="mt-3 rounded-lg border border-white/10 bg-black/25 p-2">
        <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current move</div>
        {telemetry.move ? (
          <>
            <div className="flex items-center justify-between gap-2 text-sm font-bold">
              <span>{telemetry.move.key}</span>
              <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-200">
                {telemetry.move.phase}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-300">
              <span>Frame {telemetry.move.frame}</span>
              <span>Startup {(telemetry.move.startupSec * 60).toFixed(0)}f</span>
              <span>Active {(telemetry.move.activeSec * 60).toFixed(0)}f</span>
              <span>Recovery {(telemetry.move.recoverySec * 60).toFixed(0)}f</span>
              <span>Cancel {(telemetry.move.cancelSec * 60).toFixed(0)}f</span>
              <span>Total {(telemetry.move.totalSec * 60).toFixed(0)}f</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500">No active player move.</div>
        )}
      </section>

      <section className="mt-3 rounded-lg border border-white/10 bg-black/25 p-2">
        <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <span>Input history</span>
          <button
            type="button"
            className="normal-case tracking-normal text-slate-500 hover:text-slate-200"
            onClick={() => setInputHistory([])}
          >
            clear
          </button>
        </div>
        <div className="flex min-h-6 flex-wrap gap-1">
          {inputHistory.length === 0 ? (
            <span className="text-[10px] text-slate-600">Waiting for input…</span>
          ) : (
            inputHistory.map((event) => (
              <span
                key={event.id}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                  event.pressed
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-slate-600/40 bg-slate-800/60 text-slate-400"
                }`}
                title={`${event.pressed ? "pressed" : "released"} at ${event.atMs.toFixed(1)}ms`}
              >
                {event.pressed ? "↓" : "↑"} {event.code.replace(/^Key/, "")}
              </span>
            ))
          )}
        </div>
      </section>

      <div className="mt-3 text-[10px] leading-relaxed text-slate-500">
        V1 is intentionally read-only except for round reset. Frame-step, dummy recording/playback, hitbox rendering,
        guard behavior, and saveable training presets belong to the next instrumentation slice.
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-1.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-[11px] text-slate-200">{value}</div>
    </div>
  );
}
