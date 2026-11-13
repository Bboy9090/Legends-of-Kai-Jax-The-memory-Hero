/**
 * Canon-gated Kai-Jax fusion (ported from the zip prototype's rules, adapted to this game).
 *  - Locked until the story awakening in Mission 1.
 *  - Only the base brothers (Kai or Jax) can fuse; Kai-Jax is already the fused form.
 *  - A 0–100 gauge fills from landed hits and dodged attacks; a full gauge fuses for a limited time,
 *    then a cooldown applies. Fusing again early cancels it.
 * Pure functions so the rules are unit-testable without React or a renderer.
 */
export const FUSION = {
  duration: 22,
  cooldown: 14,
  hitCharge: 7,
  /** Gauge for a clean evade; a parry pays PARRY.fusionCharge (see lib/parry.ts). */
  dodgeCharge: 8,
  damageMult: 1.4,
  speedMult: 1.18,
  burst: { damage: 65, radius: 6.5, stun: 2 },
  formId: "kai-jax",
  /** The mission whose climax awakens fusion. */
  awakeningMissionId: "story_act1_m1",
} as const;

export const FUSION_BASE_HEROES: readonly string[] = ["kai", "jax"];

export interface FusionState {
  charge: number;
  timeLeft: number;
  cooldown: number;
  /** Fighter to return to when the form ends; null while not fused. */
  baseFighterId: string | null;
}

export const initialFusion = (): FusionState => ({ charge: 0, timeLeft: 0, cooldown: 0, baseFighterId: null });

export type FusionStatus = "unavailable" | "locked" | "cooldown" | "charging" | "ready" | "active";
export type FusionEvent = "started" | "cancelled" | "locked" | "need-charge" | "cooldown" | "unavailable";

export const isFused = (s: FusionState) => s.baseFighterId !== null;
export const canFuse = (fighterId: string) => FUSION_BASE_HEROES.includes(fighterId);

export function fusionStatus(s: FusionState, unlocked: boolean, fighterId: string): FusionStatus {
  if (isFused(s)) return "active";
  if (!canFuse(fighterId)) return "unavailable";
  if (!unlocked) return "locked";
  if (s.cooldown > 0) return "cooldown";
  return s.charge >= 100 ? "ready" : "charging";
}

/** Gauge only fills while unlocked and not fused (the form itself earns nothing). */
export function addCharge(s: FusionState, amount: number, unlocked: boolean): FusionState {
  if (!unlocked || isFused(s) || amount <= 0) return s;
  const charge = Math.min(100, s.charge + amount);
  return charge === s.charge ? s : { ...s, charge };
}

export function toggleFusion(s: FusionState, unlocked: boolean, fighterId: string): { state: FusionState; event: FusionEvent } {
  if (isFused(s)) return { state: endFusion(s), event: "cancelled" };
  if (!canFuse(fighterId)) return { state: s, event: "unavailable" };
  if (!unlocked) return { state: s, event: "locked" };
  if (s.cooldown > 0) return { state: s, event: "cooldown" };
  if (s.charge < 100) return { state: s, event: "need-charge" };
  return { state: { charge: 0, timeLeft: FUSION.duration, cooldown: 0, baseFighterId: fighterId }, event: "started" };
}

export function endFusion(s: FusionState): FusionState {
  return { ...s, timeLeft: 0, cooldown: FUSION.cooldown, baseFighterId: null };
}

export function stepFusion(s: FusionState, dt: number): { state: FusionState; expired: boolean } {
  if (dt <= 0) return { state: s, expired: false };
  if (isFused(s)) {
    const timeLeft = s.timeLeft - dt;
    return timeLeft <= 0 ? { state: endFusion(s), expired: true } : { state: { ...s, timeLeft }, expired: false };
  }
  return s.cooldown > 0 ? { state: { ...s, cooldown: Math.max(0, s.cooldown - dt) }, expired: false } : { state: s, expired: false };
}

export const damageMultiplier = (s: FusionState) => (isFused(s) ? FUSION.damageMult : 1);
export const speedMultiplier = (s: FusionState) => (isFused(s) ? FUSION.speedMult : 1);

export const FUSION_AWAKENING_LINES: { speaker: string; text: string; side: "left" | "right"; emotion: "determined" }[] = [
  { speaker: "Jax", text: "Kai — the whole arena is locking down! My storm and your threads are resonating!", side: "right", emotion: "determined" },
  { speaker: "Kai", text: "Ember, Storm, and Memory... three threads, one will. Grab on, brother — NOW!", side: "left", emotion: "determined" },
  { speaker: "Kai-Jax", text: "We remember what you tried to erase. Press F — or the fusion button — to become one.", side: "left", emotion: "determined" },
];
