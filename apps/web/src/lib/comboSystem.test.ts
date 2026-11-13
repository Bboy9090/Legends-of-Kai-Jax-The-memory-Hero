import { describe, expect, it } from "vitest";
import { COMBO, COMBO_RANKS, breakCombo, comboProgress, initialCombo, isComboWarning, rankFor, refreshCombo, registerHit, tickCombo } from "./comboSystem";
import { isSettled, springStep } from "./spring";

const hits = (n: number) => Array.from({ length: n }).reduce<ReturnType<typeof initialCombo>>((s) => registerHit(s), initialCombo());

describe("combo rules", () => {
  it("every hit adds one, refreshes the 3.5s timer and bumps the pop counter", () => {
    let s = registerHit(initialCombo());
    expect(s).toMatchObject({ count: 1, timeLeft: 3.5, hitSeq: 1 });
    s = tickCombo(s, 2);
    expect(s.timeLeft).toBeCloseTo(1.5);
    s = registerHit(s);
    expect(s).toMatchObject({ count: 2, timeLeft: 3.5, hitSeq: 2 });
  });

  it("decays to nothing after 3.5s without a hit, silently", () => {
    let s = hits(6);
    s = tickCombo(s, 3.4);
    expect(s.count).toBe(6);
    s = tickCombo(s, 0.2);
    expect(s).toMatchObject({ count: 0, timeLeft: 0, broken: 0 });
  });

  it("warns below 28% of the timer", () => {
    let s = hits(3);
    expect(isComboWarning(s)).toBe(false);
    s = tickCombo(s, 3.5 * (1 - 0.3)); // 30% left
    expect(isComboWarning(s)).toBe(false);
    s = tickCombo(s, 0.1); // ~27% left
    expect(comboProgress(s)).toBeLessThan(COMBO.warnFraction);
    expect(isComboWarning(s)).toBe(true);
    expect(isComboWarning(initialCombo())).toBe(false);
  });

  it("taking damage resets count and timer at once and shows Combo Broken for 0.7s", () => {
    const s = breakCombo(hits(12));
    expect(s).toMatchObject({ count: 0, timeLeft: 0, broken: 0.7, brokenFrom: 12 });
    expect(comboProgress(s)).toBe(0);
    const mid = tickCombo(s, 0.5);
    expect(mid.broken).toBeCloseTo(0.2);
    expect(mid.brokenFrom).toBe(12);
    const done = tickCombo(mid, 0.3);
    expect(done).toMatchObject({ broken: 0, brokenFrom: 0 });
  });

  it("breaking with no combo does nothing; a new hit clears the broken state", () => {
    const empty = initialCombo();
    expect(breakCombo(empty)).toBe(empty);
    expect(registerHit(breakCombo(hits(4))).broken).toBe(0);
  });

  it("a parry keeps the combo alive without adding to it", () => {
    let s = tickCombo(hits(5), 3);
    s = refreshCombo(s);
    expect(s).toMatchObject({ count: 5, timeLeft: 3.5, hitSeq: 5 });
    expect(refreshCombo(initialCombo())).toEqual(initialCombo());
  });

  it("ranks by heritage as the count climbs", () => {
    const names = [1, 4, 5, 9, 10, 19, 20, 34, 35, 80].map((n) => rankFor(n).label);
    expect(names).toEqual(["Strike Chain", "Strike Chain", "Memory Rhythm", "Memory Rhythm", "Storm Surge", "Storm Surge", "Pyraxis Frenzy", "Pyraxis Frenzy", "Convergence Apex", "Convergence Apex"]);
    const scales = COMBO_RANKS.map((r) => r.scale);
    expect([...scales].sort((a, b) => a - b)).toEqual(scales); // tier scale only escalates
  });
});

describe("spring", () => {
  it("overshoots on an impulse, then settles on the target", () => {
    let s = { pos: 1.35, vel: 0 };
    let peakBelow = 2;
    for (let t = 0; t < 2; t += 1 / 60) {
      s = springStep(s, 1, 1 / 60);
      peakBelow = Math.min(peakBelow, s.pos);
    }
    expect(peakBelow).toBeLessThan(1); // springs past the target, not a plain ease
    expect(isSettled(s, 1)).toBe(true);
  });
  it("is stable for huge frame times", () => {
    const s = springStep({ pos: 5, vel: 100 }, 1, 5);
    expect(Number.isFinite(s.pos)).toBe(true);
    expect(Math.abs(s.pos)).toBeLessThan(50);
  });
});
