import { useState } from "react";
import { useDefenseStats } from "../../lib/stores/useDefenseStats";
import { DELAY_BUCKETS, summarize } from "../../lib/defenseStats";
import type { ParryTiming } from "../../lib/parry";

const LABELS = ["0–50", "50–100", "100–150", "150–200", "200–267"];

/** Local-only parry / evade / hit counters, for tuning the parry window. Nothing is sent anywhere. */
export default function DefenseStatsPanel() {
  const stats = useDefenseStats((s) => s.stats);
  const reset = useDefenseStats((s) => s.reset);
  const exportJson = useDefenseStats((s) => s.exportJson);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson());
      setNote("Copied to clipboard.");
    } catch {
      setNote("Clipboard blocked; select the text below instead.");
    }
  };

  const btn = "rounded-lg border border-white/15 px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10";

  return (
    <section data-testid="defense-stats" aria-label="Defense stats">
      <h2 className="mb-2 text-lg font-bold uppercase tracking-widest text-white/80">Defense stats</h2>
      <p className="mb-3 text-xs text-white/50">Counts of enemy strikes you parried, evaded or took, kept on this device to help tune the parry timing.</p>
      <div className="space-y-4 text-sm text-white/80">
        {(["standard", "generous"] as ParryTiming[]).map((mode) => {
          const c = stats.byTiming[mode];
          const s = summarize(c);
          const peak = Math.max(1, ...c.delayHistogram);
          return (
            <div key={mode} data-testid={`defense-${mode}`} data-strikes={s.strikes} className="rounded-lg border border-white/10 p-3">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-bold capitalize">{mode} timing</span>
                <span className="text-xs text-white/50">{c.dodges} {c.dodges === 1 ? "dodge" : "dodges"} · {s.strikes} {s.strikes === 1 ? "strike" : "strikes"}</span>
              </div>
              {s.strikes === 0 ? (
                <p className="text-xs text-white/40">No strikes recorded yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                    <div><div className="text-base font-black" data-testid={`defense-${mode}-parry`}>{s.parryPct}%</div>Parry · {s.parry}</div>
                    <div><div className="text-base font-black" data-testid={`defense-${mode}-evade`}>{s.evadePct}%</div>Evade · {s.evade}</div>
                    <div><div className="text-base font-black" data-testid={`defense-${mode}-hit`}>{s.hitPct}%</div>Hit · {s.hit}</div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">Of the strikes you tried to dodge: {s.parryOfAttemptedPct}% parried, {s.mistimedPct}% mistimed.</p>
                  <div className="mt-2 flex items-end gap-1" aria-label="Parry and evade delay histogram (ms after the dodge press)">
                    {c.delayHistogram.map((n, i) => (
                      <div key={DELAY_BUCKETS[i]} className="flex flex-1 flex-col items-center text-[9px] text-white/50">
                        <div className="w-full bg-white/30" style={{ height: `${Math.max(2, (n / peak) * 36)}px` }} title={`${n}`} />
                        <span>{LABELS[i]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn} data-testid="defense-copy" onClick={() => void copy()}>Copy JSON</button>
          {confirming ? (
            <button type="button" className={btn} data-testid="defense-reset-confirm" onClick={() => { reset(); setConfirming(false); setNote("Stats cleared."); }}>Confirm reset</button>
          ) : (
            <button type="button" className={btn} data-testid="defense-reset" onClick={() => setConfirming(true)}>Reset</button>
          )}
          <span className="text-xs text-cyan-300" role="status" data-testid="defense-note">{note}</span>
        </div>
      </div>
    </section>
  );
}
