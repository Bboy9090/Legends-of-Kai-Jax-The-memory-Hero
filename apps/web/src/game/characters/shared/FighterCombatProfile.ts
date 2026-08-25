import { MOVEMENT_TUNING } from "../../tuning/movementTuning";

export type FighterArchetype = "rushdown" | "punish" | "hybrid" | "zoner" | "heavy";
export type HitReactionClass = "light" | "medium" | "heavy";

export interface FighterMovementProfile {
  walkSpeedMult: number;
  sprintSpeedMult: number;
  accelerationMult: number;
  decelerationMult: number;
  airControlMult: number;
  jumpVelocityMult: number;
  gravityMult: number;
  fastFallMult: number;
  coyoteTimeMult: number;
  jumpBufferMult: number;
  wallKickHorizontalMult: number;
  wallKickVerticalMult: number;
  pounceHorizontalMult: number;
  pounceVerticalMult: number;
}

export interface FighterDefenseProfile {
  maxStaminaMult: number;
  staminaRegenMult: number;
  dodgeDistanceMult: number;
  dodgeDurationMult: number;
  dodgeCostMult: number;
  parryWindowMult: number;
  guardPressureTakenMult: number;
  chipDamageTakenMult: number;
}

export interface FighterAerialProfile {
  aerialDamageMult: number;
  aerialHitstunMult: number;
  landingLagMult: number;
  fastFallControlMult: number;
  airDodgeEnabled: boolean;
  recoveryCharges: number;
}

export interface FighterReactionProfile {
  weight: number;
  hitstunTakenMult: number;
  knockbackTakenMult: number;
  launchResistance: number;
  reactionClass: HitReactionClass;
}

export interface FighterComboRoute {
  id: string;
  inputs: readonly ("punch" | "kick" | "special" | "ultimate")[];
  cancelAfterStep: number;
  finisher: "launch" | "damage" | "position" | "meter";
  notes: string;
}

export interface FighterComboProfile {
  maxLightChain: number;
  cancelWindowMult: number;
  whiffRecoveryMult: number;
  hitConfirmWindowMult: number;
  routes: readonly FighterComboRoute[];
}

export interface FighterCombatProfile {
  id: string;
  archetype: FighterArchetype;
  movement: FighterMovementProfile;
  defense: FighterDefenseProfile;
  aerial: FighterAerialProfile;
  reaction: FighterReactionProfile;
  combo: FighterComboProfile;
}

const DEFAULT_MOVEMENT: FighterMovementProfile = {
  walkSpeedMult: 1,
  sprintSpeedMult: 1,
  accelerationMult: 1,
  decelerationMult: 1,
  airControlMult: 1,
  jumpVelocityMult: 1,
  gravityMult: 1,
  fastFallMult: 1,
  coyoteTimeMult: 1,
  jumpBufferMult: 1,
  wallKickHorizontalMult: 1,
  wallKickVerticalMult: 1,
  pounceHorizontalMult: 1,
  pounceVerticalMult: 1,
};

const DEFAULT_DEFENSE: FighterDefenseProfile = {
  maxStaminaMult: 1,
  staminaRegenMult: 1,
  dodgeDistanceMult: 1,
  dodgeDurationMult: 1,
  dodgeCostMult: 1,
  parryWindowMult: 1,
  guardPressureTakenMult: 1,
  chipDamageTakenMult: 1,
};

const DEFAULT_AERIAL: FighterAerialProfile = {
  aerialDamageMult: 1,
  aerialHitstunMult: 1,
  landingLagMult: 1,
  fastFallControlMult: 1,
  airDodgeEnabled: false,
  recoveryCharges: 1,
};

const DEFAULT_REACTION: FighterReactionProfile = {
  weight: 100,
  hitstunTakenMult: 1,
  knockbackTakenMult: 1,
  launchResistance: 0,
  reactionClass: "medium",
};

const DEFAULT_COMBO: FighterComboProfile = {
  maxLightChain: 3,
  cancelWindowMult: 1,
  whiffRecoveryMult: 1,
  hitConfirmWindowMult: 1,
  routes: [],
};

function profile(
  id: string,
  archetype: FighterArchetype,
  patch: Partial<Omit<FighterCombatProfile, "id" | "archetype">>
): FighterCombatProfile {
  return Object.freeze({
    id,
    archetype,
    movement: Object.freeze({ ...DEFAULT_MOVEMENT, ...(patch.movement ?? {}) }),
    defense: Object.freeze({ ...DEFAULT_DEFENSE, ...(patch.defense ?? {}) }),
    aerial: Object.freeze({ ...DEFAULT_AERIAL, ...(patch.aerial ?? {}) }),
    reaction: Object.freeze({ ...DEFAULT_REACTION, ...(patch.reaction ?? {}) }),
    combo: Object.freeze({
      ...DEFAULT_COMBO,
      ...(patch.combo ?? {}),
      routes: Object.freeze([...(patch.combo?.routes ?? [])]),
    }),
  });
}

export const DEFAULT_FIGHTER_COMBAT_PROFILE = profile("default", "hybrid", {});

export const FIGHTER_COMBAT_PROFILES: Readonly<Record<string, FighterCombatProfile>> = Object.freeze({
  jaxon: profile("jaxon", "rushdown", {
    movement: {
      walkSpeedMult: 1.08,
      sprintSpeedMult: 1.12,
      accelerationMult: 1.14,
      decelerationMult: 1.08,
      airControlMult: 1.2,
      jumpVelocityMult: 1.08,
      gravityMult: 0.96,
      fastFallMult: 1.08,
      coyoteTimeMult: 1.08,
      jumpBufferMult: 1.08,
      wallKickHorizontalMult: 1.18,
      wallKickVerticalMult: 1.08,
      pounceHorizontalMult: 1.15,
      pounceVerticalMult: 0.96,
    },
    defense: {
      maxStaminaMult: 0.94,
      staminaRegenMult: 1.1,
      dodgeDistanceMult: 1.14,
      dodgeDurationMult: 0.92,
      dodgeCostMult: 0.95,
      parryWindowMult: 0.92,
      guardPressureTakenMult: 1.08,
      chipDamageTakenMult: 1.04,
    },
    aerial: {
      aerialDamageMult: 1.04,
      aerialHitstunMult: 1.08,
      landingLagMult: 0.88,
      fastFallControlMult: 1.12,
      airDodgeEnabled: true,
      recoveryCharges: 1,
    },
    reaction: {
      weight: 92,
      hitstunTakenMult: 1.04,
      knockbackTakenMult: 1.08,
      launchResistance: 0.02,
      reactionClass: "light",
    },
    combo: {
      maxLightChain: 4,
      cancelWindowMult: 1.12,
      whiffRecoveryMult: 0.92,
      hitConfirmWindowMult: 1.1,
      routes: [
        { id: "frost-rush", inputs: ["punch", "punch", "kick"], cancelAfterStep: 2, finisher: "position", notes: "Fast confirm that carries the target forward." },
        { id: "sky-chase", inputs: ["punch", "kick", "special"], cancelAfterStep: 2, finisher: "launch", notes: "Primary launcher route into aerial pursuit." },
      ],
    },
  }),
  kaison: profile("kaison", "punish", {
    movement: {
      walkSpeedMult: 0.96,
      sprintSpeedMult: 0.94,
      accelerationMult: 0.92,
      decelerationMult: 1.08,
      airControlMult: 0.9,
      jumpVelocityMult: 0.96,
      gravityMult: 1.04,
      fastFallMult: 1.02,
      coyoteTimeMult: 1,
      jumpBufferMult: 1,
      wallKickHorizontalMult: 0.92,
      wallKickVerticalMult: 0.96,
      pounceHorizontalMult: 1,
      pounceVerticalMult: 1,
    },
    defense: {
      maxStaminaMult: 1.12,
      staminaRegenMult: 1.02,
      dodgeDistanceMult: 0.94,
      dodgeDurationMult: 1.04,
      dodgeCostMult: 1,
      parryWindowMult: 1.18,
      guardPressureTakenMult: 0.88,
      chipDamageTakenMult: 0.9,
    },
    aerial: {
      aerialDamageMult: 0.98,
      aerialHitstunMult: 1,
      landingLagMult: 1.04,
      fastFallControlMult: 0.96,
      airDodgeEnabled: false,
      recoveryCharges: 1,
    },
    reaction: {
      weight: 108,
      hitstunTakenMult: 0.94,
      knockbackTakenMult: 0.92,
      launchResistance: 0.1,
      reactionClass: "heavy",
    },
    combo: {
      maxLightChain: 3,
      cancelWindowMult: 0.94,
      whiffRecoveryMult: 1.04,
      hitConfirmWindowMult: 1.16,
      routes: [
        { id: "ember-check", inputs: ["punch", "kick"], cancelAfterStep: 1, finisher: "damage", notes: "Compact punish confirm with low execution risk." },
        { id: "anchor-break", inputs: ["kick", "special"], cancelAfterStep: 1, finisher: "launch", notes: "High-commitment guard and recovery punish route." },
      ],
    },
  }),
  "kai-jax": profile("kai-jax", "hybrid", {
    movement: {
      walkSpeedMult: 1.04,
      sprintSpeedMult: 1.05,
      accelerationMult: 1.04,
      decelerationMult: 1.04,
      airControlMult: 1.06,
      jumpVelocityMult: 1.03,
      gravityMult: 1,
      fastFallMult: 1.05,
      coyoteTimeMult: 1.05,
      jumpBufferMult: 1.05,
      wallKickHorizontalMult: 1.06,
      wallKickVerticalMult: 1.04,
      pounceHorizontalMult: 1.08,
      pounceVerticalMult: 1,
    },
    defense: {
      maxStaminaMult: 1.08,
      staminaRegenMult: 1.06,
      dodgeDistanceMult: 1.04,
      dodgeDurationMult: 0.98,
      dodgeCostMult: 0.96,
      parryWindowMult: 1.06,
      guardPressureTakenMult: 0.94,
      chipDamageTakenMult: 0.94,
    },
    aerial: {
      aerialDamageMult: 1.08,
      aerialHitstunMult: 1.08,
      landingLagMult: 0.96,
      fastFallControlMult: 1.08,
      airDodgeEnabled: true,
      recoveryCharges: 1,
    },
    reaction: {
      weight: 104,
      hitstunTakenMult: 0.96,
      knockbackTakenMult: 0.94,
      launchResistance: 0.08,
      reactionClass: "medium",
    },
    combo: {
      maxLightChain: 4,
      cancelWindowMult: 1.08,
      whiffRecoveryMult: 0.96,
      hitConfirmWindowMult: 1.1,
      routes: [
        { id: "resonance-chain", inputs: ["punch", "punch", "kick", "special"], cancelAfterStep: 3, finisher: "meter", notes: "Flexible fusion pressure route with strong meter payoff." },
        { id: "memory-breaker", inputs: ["kick", "special", "ultimate"], cancelAfterStep: 2, finisher: "damage", notes: "Resource-heavy finisher route for confirmed openings." },
      ],
    },
  }),
});

const ALIASES: Readonly<Record<string, string>> = Object.freeze({
  jax: "jaxon",
  kai: "kaison",
});

export function resolveCombatProfileId(fighterId: string): string {
  const normalized = fighterId.trim().toLowerCase();
  return ALIASES[normalized] ?? normalized;
}

export function getFighterCombatProfile(fighterId: string): FighterCombatProfile {
  const id = resolveCombatProfileId(fighterId);
  return FIGHTER_COMBAT_PROFILES[id] ?? DEFAULT_FIGHTER_COMBAT_PROFILE;
}

export function getResolvedMovementTuning(fighterId: string) {
  const base = MOVEMENT_TUNING.battle;
  const p = getFighterCombatProfile(fighterId).movement;
  return {
    walkMaxSpeed: base.walkMaxSpeed * p.walkSpeedMult,
    sprintMaxSpeed: base.sprintMaxSpeed * p.sprintSpeedMult,
    accel: base.accel * p.accelerationMult,
    decel: base.decel * p.decelerationMult,
    airControlMult: base.airControlMult * p.airControlMult,
    jumpVelocity: base.jumpVelocity * p.jumpVelocityMult,
    gravity: base.gravity * p.gravityMult,
    fastFallAccel: base.fastFallAccel * p.fastFallMult,
    coyoteTimeSec: base.coyoteTimeSec * p.coyoteTimeMult,
    jumpBufferSec: base.jumpBufferSec * p.jumpBufferMult,
    wallKickHorizontalMult: base.wallKickHorizontalMult * p.wallKickHorizontalMult,
    wallKickVerticalMult: base.wallKickVerticalMult * p.wallKickVerticalMult,
    pounceHorizontalMult: base.pounceHorizontalMult * p.pounceHorizontalMult,
    pounceVerticalMult: base.pounceVerticalMult * p.pounceVerticalMult,
  } as const;
}
