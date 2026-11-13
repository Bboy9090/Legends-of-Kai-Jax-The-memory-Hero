import { describe, expect, it } from "vitest";
import { DELAY_BUCKETS, MISTIMED_WITHIN, bucketIndex, emptyStats, normalizeStats, recordDodge, recordStrike, summarize } from "./defenseStats";

const T0 = new Date("2026-01-01T00:00:00Z");

describe("defense stats", () => {
  it("starts empty for both timing modes", () => {
    const s = emptyStats(T0);
    expect(summarize(s.byTiming.standard)).toMatchObject({ strikes: 0, parryPct: 0, hitPct: 0 });
    expect(s.byTiming.generous.delayHistogram).toHaveLength(DELAY_BUCKETS.length);
  });

  it("buckets delays by 50ms steps up to the i-frame end", () => {
    expect([0, 0.049, 0.05, 0.051, 0.1, 0.15, 0.199, 0.2, 0.267, 0.5].map(bucketIndex)).toEqual([0, 0, 0, 1, 1, 2, 3, 3, 4, 4]);
  });

  it("counts parries and evades with their delay, kept separate per timing mode", () => {
    let s = emptyStats(T0);
    s = recordStrike(s, { outcome: "parry", timing: "standard", delay: 0.03 });
    s = recordStrike(s, { outcome: "parry", timing: "standard", delay: 0.08 });
    s = recordStrike(s, { outcome: "evade", timing: "standard", delay: 0.22 });
    s = recordStrike(s, { outcome: "parry", timing: "generous", delay: 0.14 });
    expect(s.byTiming.standard).toMatchObject({ parry: 2, evade: 1, delayHistogram: [1, 1, 0, 0, 1] });
    expect(s.byTiming.generous).toMatchObject({ parry: 1, delayHistogram: [0, 0, 1, 0, 0] });
  });

  it("splits hits into mistimed (a dodge was pressed just before) and no-dodge", () => {
    let s = emptyStats(T0);
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: 0.4 });
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: MISTIMED_WITHIN });
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: 2.5 });
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: null });
    s = recordStrike(s, { outcome: "hit", timing: "standard" });
    expect(s.byTiming.standard).toMatchObject({ hitMistimed: 2, hitNoDodge: 3 });
  });

  it("summarises percentages and the parry rate among attempted dodges", () => {
    let s = emptyStats(T0);
    for (let i = 0; i < 6; i++) s = recordStrike(s, { outcome: "parry", timing: "standard", delay: 0.05 });
    for (let i = 0; i < 2; i++) s = recordStrike(s, { outcome: "evade", timing: "standard", delay: 0.2 });
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: 0.4 }); // tried, mistimed
    s = recordStrike(s, { outcome: "hit", timing: "standard", delay: null }); // never tried
    const sum = summarize(s.byTiming.standard);
    expect(sum).toMatchObject({ strikes: 10, parry: 6, evade: 2, hit: 2, parryPct: 60, evadePct: 20, hitPct: 20 });
    expect(sum.parryOfAttemptedPct).toBeCloseTo((6 / 9) * 100, 0); // 9 strikes had a dodge attempt
    expect(sum.mistimedPct).toBeCloseTo((1 / 9) * 100, 0);
  });

  it("counts dodges", () => {
    const s = recordDodge(recordDodge(emptyStats(T0), "generous"), "generous");
    expect(s.byTiming.generous.dodges).toBe(2);
    expect(s.byTiming.standard.dodges).toBe(0);
  });

  it("does not mutate the previous stats", () => {
    const a = emptyStats(T0);
    recordStrike(a, { outcome: "parry", timing: "standard", delay: 0.05 });
    expect(a.byTiming.standard.parry).toBe(0);
    expect(a.byTiming.standard.delayHistogram.every((n) => n === 0)).toBe(true);
  });

  it("repairs corrupt or partial stored data", () => {
    expect(normalizeStats(null).byTiming.standard.parry).toBe(0);
    const n = normalizeStats({ startedAt: "nope", byTiming: { standard: { parry: -4, evade: "x", dodges: 7.9, delayHistogram: [1, "a", 3] } } });
    expect(n.byTiming.standard).toMatchObject({ parry: 0, evade: 0, dodges: 7, delayHistogram: [1, 0, 3, 0, 0] });
    expect(Number.isNaN(Date.parse(n.startedAt))).toBe(false);
  });
});
