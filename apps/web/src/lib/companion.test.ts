import { describe, expect, it } from "vitest";
import { COMPANION, companionHeroFor, companionStrikeDamage, flankPoint, initialCompanion, nearestTarget, stepCompanion, type CompanionState, type CompanionTarget } from "./companion";

const player = { x: 0, z: 0, rotY: 0 };
const run = (state: CompanionState, enemies: CompanionTarget[], seconds: number, p = player, dt = 1 / 60) => {
  const strikes: Array<{ at: number; hitIds: string[] }> = [];
  let s = state;
  for (let t = 0; t < seconds; t += dt) {
    const r = stepCompanion(s, { dt, player: p, enemies });
    s = r.state;
    if (r.strike) strikes.push({ at: t, hitIds: r.strike.hitIds });
  }
  return { s, strikes };
};

describe("companion AI", () => {
  it("pairs Kai with Jax and Jax with Kai, and nobody else", () => {
    expect(companionHeroFor("kai")).toBe("jax");
    expect(companionHeroFor("jax")).toBe("kai");
    expect(companionHeroFor("kai-jax")).toBeNull();
    expect(companionHeroFor("boryn")).toBeNull();
  });

  it("follows to the flank point and stops there with nothing to fight", () => {
    const start = { ...initialCompanion(player), x: 9, z: 9 };
    const { s } = run(start, [], 6);
    const f = flankPoint(player);
    expect(s.mode).toBe("follow");
    expect(Math.hypot(s.x - f.x, s.z - f.z)).toBeLessThan(COMPANION.followArrive);
    expect(Math.hypot(s.vx, s.vz)).toBeLessThan(0.5);
  });

  it("teleports back when left far behind", () => {
    const start = { ...initialCompanion(player), x: 25, z: 25 };
    const { state } = stepCompanion(start, { dt: 1 / 60, player, enemies: [] });
    const f = flankPoint(player);
    expect(Math.hypot(state.x - f.x, state.z - f.z)).toBeLessThan(0.5);
  });

  it("engages the nearest enemy in range, closes to melee, and strikes on a 1.45s cadence", () => {
    const enemies = [{ id: "far", x: 11, z: 0 }, { id: "near", x: 6, z: 3 }];
    expect(nearestTarget(player, enemies, COMPANION.engageRange)!.id).toBe("near");
    const { s, strikes } = run(initialCompanion(player), enemies, 6);
    expect(s.mode).toBe("engage");
    expect(strikes.length).toBeGreaterThanOrEqual(3);
    expect(strikes.every((k) => k.hitIds.includes("near"))).toBe(true);
    for (let i = 1; i < strikes.length; i++) expect(strikes[i].at - strikes[i - 1].at).toBeGreaterThanOrEqual(COMPANION.attackCooldown - 0.05);
    expect(Math.hypot(s.x - 6, s.z - 3)).toBeLessThanOrEqual(COMPANION.meleeRange + 0.3);
  });

  it("ignores enemies beyond the engage range", () => {
    const { s, strikes } = run(initialCompanion(player), [{ id: "e", x: 40, z: 0 }], 4);
    expect(s.mode).toBe("follow");
    expect(strikes).toHaveLength(0);
  });

  it("a strike hits every enemy inside the strike radius of its target, and no one outside", () => {
    const enemies = [{ id: "a", x: 4, z: 0 }, { id: "b", x: 5, z: 1 }, { id: "c", x: 9, z: 0 }];
    const { strikes } = run({ ...initialCompanion(player), x: 3, z: 0 }, enemies, 3);
    expect(strikes[0].hitIds.sort()).toEqual(["a", "b"]);
  });

  it("stays inside the arena and is deterministic, with sane damage", () => {
    const { s } = run({ ...initialCompanion(player), x: 31, z: 31 }, [{ id: "e", x: 100, z: 100 }], 3, { x: 31, z: 31, rotY: 0 });
    expect(Math.abs(s.x)).toBeLessThanOrEqual(COMPANION.boundary);
    expect(Math.abs(s.z)).toBeLessThanOrEqual(COMPANION.boundary);
    expect(stepCompanion(initialCompanion(player), { dt: 0, player, enemies: [] }).strike).toBeNull();
    expect(companionStrikeDamage(22)).toBe(14);
    expect(companionStrikeDamage(0)).toBe(1);
  });
});
