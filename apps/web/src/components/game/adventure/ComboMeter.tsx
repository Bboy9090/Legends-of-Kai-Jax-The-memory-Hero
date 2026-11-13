import { useEffect, useRef } from "react";
import { useCombo } from "../../../lib/stores/useCombo";
import { COMBO, comboProgress, isComboWarning, rankFor } from "../../../lib/comboSystem";
import { isSettled, springStep, type SpringState } from "../../../lib/spring";
import { useAccessibility } from "../../../lib/stores/useAccessibility";

/**
 * Top-right combo counter. React renders only when the count, rank or broken state changes; the per-frame
 * parts (spring scale, decay bar, countdown) are written straight to the DOM so they cost no re-renders.
 *  - spring pop on every landed strike, resting at a tier-scaled size (reduced motion: no pop, no shake)
 *  - compositor-only decay bar (transform: scaleX) that turns amber and striped below 28%
 *  - "Combo Broken" for 0.7s after real damage, then it dismisses
 */
export default function ComboMeter() {
  const count = useCombo((c) => c.state.count);
  const broken = useCombo((c) => c.state.broken > 0);
  const brokenFrom = useCombo((c) => c.state.brokenFrom);
  const reduceMotion = useAccessibility((s) => s.reducedMotion);

  const rank = rankFor(count);
  const visible = count > 0 || broken;
  const targetScale = broken ? 0.92 : rank.scale;

  const popRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const spring = useRef<SpringState>({ pos: 1, vel: 0 });
  const lastSeq = useRef(0);
  const targetRef = useRef(targetScale);
  targetRef.current = targetScale;
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = useCombo.getState().state;

      // Spring-driven scale: each new hit kicks the spring, which overshoots and settles at the tier size.
      if (st.hitSeq !== lastSeq.current) {
        lastSeq.current = st.hitSeq;
        if (!reduceRef.current && st.count > 0) spring.current = { pos: spring.current.pos, vel: spring.current.vel + 7 };
      }
      const target = targetRef.current;
      spring.current = reduceRef.current ? { pos: target, vel: 0 } : isSettled(spring.current, target) ? { pos: target, vel: 0 } : springStep(spring.current, target, dt);
      if (popRef.current) popRef.current.style.transform = `scale(${spring.current.pos.toFixed(4)})`;

      // Decay bar + countdown (tabular numerals keep the readout from jittering).
      const progress = comboProgress(st);
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
        barRef.current.dataset.warning = String(isComboWarning(st));
      }
      if (timeRef.current) timeRef.current.textContent = st.count > 0 ? `${st.timeLeft.toFixed(1)}s` : "";
      if (rootRef.current) rootRef.current.dataset.warning = String(isComboWarning(st));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="kj-combo pointer-events-none absolute z-30"
      data-testid="combo-meter"
      data-rank={broken ? "broken" : rank.id}
      data-count={count}
      data-broken={broken}
      data-warning="false"
      role="status"
      aria-live="off"
      aria-label={broken ? `Combo broken at ${brokenFrom}` : `Combo ${count}, ${rank.label}`}
    >
      <div ref={popRef} className="kj-combo-pop" style={{ transformOrigin: "100% 0%" }}>
        {broken ? (
          <div className="kj-combo-broken" data-testid="combo-broken">
            <span className="kj-combo-label">Combo Broken</span>
            <span className="kj-combo-lost" data-testid="combo-lost">{brokenFrom} hits lost</span>
          </div>
        ) : (
          <>
            <div className="kj-combo-row">
              <span className="kj-combo-count" data-testid="combo-count">{count}</span>
              <span className="kj-combo-x">HITS</span>
              <span ref={timeRef} className="kj-combo-time" data-testid="combo-time" />
            </div>
            <div className="kj-combo-label" data-testid="combo-rank">{rank.label}</div>
            <div className="kj-combo-heritage">{rank.heritage}</div>
            <div className="kj-combo-bar" aria-hidden="true">
              <div ref={barRef} className="kj-combo-bar-fill" data-testid="combo-bar" data-warning="false" style={{ transform: "scaleX(1)" }} />
            </div>
            <span className="kj-combo-fading" aria-hidden="true">FADING</span>
          </>
        )}
      </div>
    </div>
  );
}

export const COMBO_DECAY_SECONDS = COMBO.decaySeconds;
