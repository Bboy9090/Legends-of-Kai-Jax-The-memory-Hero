import { describe, expect, it } from "vitest";
import {
  FIGHTER_COMBAT_PROFILES,
  getFighterCombatProfile,
  getResolvedMovementTuning,
  resolveCombatProfileId,
} from "./FighterCombatProfile";

describe("FighterCombatProfile", () => {
  it("resolves lineage aliases to the canonical fighter profile", () => {
    expect(resolveCombatProfileId("JAX")).toBe("jaxon");
    expect(resolveCombatProfileId("kai")).toBe("kaison");
    expect(getFighterCombatProfile("jax")).toBe(getFighterCombatProfile("jaxon"));
    expect(getFighterCombatProfile("kai")).toBe(getFighterCombatProfile("kaison"));
  });

  it("keeps the primary trio mechanically distinct", () => {
    const jaxon = getFighterCombatProfile("jaxon");
    const kaison = getFighterCombatProfile("kaison");
    const kaiJax = getFighterCombatProfile("kai-jax");

    expect(jaxon.archetype).toBe("rushdown");
    expect(kaison.archetype).toBe("punish");
    expect(kaiJax.archetype).toBe("hybrid");

    expect(jaxon.movement.sprintSpeedMult).toBeGreaterThan(kaison.movement.sprintSpeedMult);
    expect(kaison.defense.parryWindowMult).toBeGreaterThan(jaxon.defense.parryWindowMult);
    expect(kaiJax.combo.routes.length).toBeGreaterThan(0);
  });

  it("gives Jaxon the strongest air mobility of the primary trio", () => {
    const jaxon = getResolvedMovementTuning("jaxon");
    const kaison = getResolvedMovementTuning("kaison");
    const kaiJax = getResolvedMovementTuning("kai-jax");

    expect(jaxon.airControlMult).toBeGreaterThan(kaison.airControlMult);
    expect(jaxon.airControlMult).toBeGreaterThan(kaiJax.airControlMult);
    expect(jaxon.jumpVelocity).toBeGreaterThan(kaison.jumpVelocity);
  });

  it("gives Kaison greater launch resistance and defensive efficiency", () => {
    const jaxon = getFighterCombatProfile("jaxon");
    const kaison = getFighterCombatProfile("kaison");

    expect(kaison.reaction.launchResistance).toBeGreaterThan(jaxon.reaction.launchResistance);
    expect(kaison.reaction.knockbackTakenMult).toBeLessThan(jaxon.reaction.knockbackTakenMult);
    expect(kaison.defense.guardPressureTakenMult).toBeLessThan(jaxon.defense.guardPressureTakenMult);
  });

  it("falls back safely for future roster entries", () => {
    const future = getFighterCombatProfile("future-hero");
    expect(future.id).toBe("default");
    expect(future.movement.walkSpeedMult).toBe(1);
    expect(future.combo.maxLightChain).toBe(3);
  });

  it("keeps canonical profile tables immutable", () => {
    expect(Object.isFrozen(FIGHTER_COMBAT_PROFILES)).toBe(true);
    expect(Object.isFrozen(getFighterCombatProfile("jaxon"))).toBe(true);
    expect(Object.isFrozen(getFighterCombatProfile("jaxon").movement)).toBe(true);
    expect(Object.isFrozen(getFighterCombatProfile("jaxon").combo.routes)).toBe(true);
  });
});
