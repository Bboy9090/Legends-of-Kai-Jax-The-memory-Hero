import { describe, expect, it } from "vitest";
import { PARRY, TIMING_PROFILES, parryOutcomeOdds, parryWindowFor, resolveIncomingStrike } from "./parry";

const base = { parryTimer: 0, dodgeTimer: 0, invulnTimer: 0 };

describe("incoming strike resolution", () => {
  it("a well-timed dodge parries", () => expect(resolveIncomingStrike({ parryTimer: 0.1, dodgeTimer: 0.3, invulnTimer: 0.25 })).toBe("parry"));
  it("a late dodge only evades", () => expect(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.15, invulnTimer: 0.1 })).toBe("evade"));
  it("post-hit invulnerability is grace, not a reward", () => expect(resolveIncomingStrike({ ...base, invulnTimer: 0.4 })).toBe("grace"));
  it("everything else connects", () => expect(resolveIncomingStrike(base)).toBe("hit"));
  it("after the i-frames end the strike hits even while the dodge animation finishes", () => expect(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.05, invulnTimer: 0 })).toBe("hit"));
  it("the window is shorter than the dodge's invulnerability", () => expect(PARRY.window).toBeLessThan(16 / 60));
  it("parry pays more than evade", () => expect(PARRY.fusionCharge).toBeGreaterThan(PARRY.evadeFusionCharge));

  it("the generous window is wider but still inside the i-frames", () => {
    expect(parryWindowFor("standard")).toBe(PARRY.window);
    expect(parryWindowFor("generous")).toBe(PARRY.generousWindow);
    expect(PARRY.generousWindow).toBeGreaterThan(PARRY.window);
    expect(PARRY.generousWindow).toBeLessThan(16 / 60);
  });
});

describe("parry window tuning", () => {
  const odds = (w: number, who: keyof typeof TIMING_PROFILES) => parryOutcomeOdds(w, TIMING_PROFILES[who]);

  it("outcome odds always add up to one", () => {
    for (const w of [0.05, 0.1, 0.16, 0.2]) for (const who of ["sharp", "typical", "sloppy"] as const) {
      const o = odds(w, who);
      expect(o.parry + o.evade + o.hit).toBeCloseTo(1, 6);
    }
  });

  it("standard timing: typical players parry most of the time but evade still matters", () => {
    const o = odds(PARRY.window, "typical");
    expect(o.parry).toBeGreaterThan(0.5);
    expect(o.parry).toBeLessThan(0.7);
    expect(o.evade).toBeGreaterThan(0.2); // the safety net exists
    expect(o.hit).toBeLessThan(0.2);
  });

  it("standard timing rewards sharp timing and still lets sloppy players survive", () => {
    expect(odds(PARRY.window, "sharp").parry).toBeGreaterThan(0.75);
    const sloppy = odds(PARRY.window, "sloppy");
    expect(sloppy.parry + sloppy.evade).toBeGreaterThan(0.65); // at least two in three dodges avoid damage
    expect(sloppy.evade).toBeGreaterThan(sloppy.parry * 0.8); // evade is common for them, not a rounding error
  });

  it("the old 0.2s window made parry the default and evade almost impossible", () => {
    expect(odds(0.2, "typical").evade).toBeLessThan(0.03);
    expect(odds(PARRY.window, "typical").evade).toBeGreaterThan(odds(0.2, "typical").evade * 8);
  });

  it("generous timing helps everyone parry more without making dodges any more dangerous", () => {
    for (const who of ["sharp", "typical", "sloppy"] as const) {
      const std = odds(PARRY.window, who);
      const gen = odds(PARRY.generousWindow, who);
      expect(gen.parry).toBeGreaterThan(std.parry);
      expect(gen.hit).toBeCloseTo(std.hit, 6); // the i-frames, not the window, decide whether you are hit
    }
  });

  it("a wider window never reduces parry odds (monotonic)", () => {
    let last = 0;
    for (const w of [0.04, 0.08, 0.12, 0.16, 0.2, 0.26]) {
      const p = odds(w, "typical").parry;
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });
});
