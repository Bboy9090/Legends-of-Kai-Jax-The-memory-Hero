import { describe, expect, it } from "vitest";
import { PARRY, resolveIncomingStrike } from "./parry";

const base = { parryTimer: 0, dodgeTimer: 0, invulnTimer: 0 };

describe("incoming strike resolution", () => {
  it("a well-timed dodge parries", () => expect(resolveIncomingStrike({ parryTimer: 0.1, dodgeTimer: 0.3, invulnTimer: 0.25 })).toBe("parry"));
  it("a late dodge only evades", () => expect(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.15, invulnTimer: 0.1 })).toBe("evade"));
  it("post-hit invulnerability is grace, not a reward", () => expect(resolveIncomingStrike({ ...base, invulnTimer: 0.4 })).toBe("grace"));
  it("everything else connects", () => expect(resolveIncomingStrike(base)).toBe("hit"));
  it("after the i-frames end the strike hits even while the dodge animation finishes", () => expect(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.05, invulnTimer: 0 })).toBe("hit"));
  it("the window is shorter than the dodge's invulnerability", () => expect(PARRY.window).toBeLessThan(16 / 60));
  it("parry pays more than evade", () => expect(PARRY.fusionCharge).toBeGreaterThan(PARRY.evadeFusionCharge));
});
