/**
 * Picks which authored animation clip to play for a character state.
 *
 * The rigged masters (kai, jax, kai-jax, borax, boryn) ship the same 19 clips:
 *   ability_cast attack_1 attack_2 attack_3 breathing defeat dodge fall heavy_strike hit_reaction idle jump
 *   landing parry roar run sprint victory walk
 * Older models carry one or two loosely named clips (e.g. "Armature|walking_man|baselayer"), so when the new names are
 * absent we fall back to the original name matching. Returning null means "no authored clip: use the procedural pose".
 */
export type AttackKind = "light1" | "light2" | "light3" | "heavy" | "skill" | "punch" | "kick" | "special" | "ultimate" | null;
export type LocomotionPose = "neutral" | "dodge" | "block" | "parry" | "hitstun" | "airborne";
export type ClipPose = "victory" | "defeat" | "roar" | null;

export interface ClipRequest {
  available: readonly string[];
  isAttacking: boolean;
  attackType: AttackKind;
  isMoving: boolean;
  isRunning: boolean;
  locomotion?: LocomotionPose;
  pose?: ClipPose;
  /** Rotates through multiple matching legacy clips (kick variants). */
  variant?: number;
}

export interface ClipChoice {
  clip: string;
  /** "once" clips hold their last frame; "repeat" clips loop. */
  loop: "once" | "repeat";
  /** Drives playback speed scaling for locomotion clips. */
  kind: "idle" | "walk" | "run" | "attack" | "reaction";
}

export const RIGGED_CLIPS = [
  "ability_cast", "attack_1", "attack_2", "attack_3", "breathing", "defeat", "dodge", "fall", "heavy_strike",
  "hit_reaction", "idle", "jump", "landing", "parry", "roar", "run", "sprint", "victory", "walk",
] as const;

const has = (available: readonly string[], name: string) => available.includes(name);

/** True when the model carries the rigged-master clip set. */
export const isRiggedClipSet = (available: readonly string[]) => has(available, "idle") && has(available, "attack_1") && has(available, "run");

const ATTACK_CLIP: Record<Exclude<AttackKind, null>, string> = {
  light1: "attack_1",
  light2: "attack_2",
  light3: "attack_3",
  punch: "attack_1",
  kick: "attack_2",
  heavy: "heavy_strike",
  skill: "ability_cast",
  special: "ability_cast",
  ultimate: "roar",
};

export function selectClip(r: ClipRequest): ClipChoice | null {
  const { available } = r;
  if (available.length === 0) return null;

  if (isRiggedClipSet(available)) {
    if (r.pose === "victory" && has(available, "victory")) return { clip: "victory", loop: "repeat", kind: "idle" };
    if (r.pose === "defeat" && has(available, "defeat")) return { clip: "defeat", loop: "once", kind: "reaction" };
    if (r.pose === "roar" && has(available, "roar")) return { clip: "roar", loop: "once", kind: "attack" };
    // Reactions outrank everything else: being hit or dodging must read instantly.
    if (r.locomotion === "hitstun") return { clip: "hit_reaction", loop: "once", kind: "reaction" };
    if (r.locomotion === "parry") return { clip: "parry", loop: "once", kind: "reaction" };
    if (r.locomotion === "dodge") return { clip: "dodge", loop: "once", kind: "reaction" };
    if (r.isAttacking) {
      const clip = ATTACK_CLIP[r.attackType ?? "light1"] ?? "attack_1";
      return { clip, loop: "once", kind: "attack" };
    }
    if (r.locomotion === "airborne") return { clip: "jump", loop: "once", kind: "reaction" };
    if (r.isMoving) return r.isRunning ? { clip: "run", loop: "repeat", kind: "run" } : { clip: "walk", loop: "repeat", kind: "walk" };
    // "idle" is the stance; "breathing" is only a fallback so the stance never gets replaced by it.
    return { clip: "idle", loop: "repeat", kind: "idle" };
  }

  return selectLegacyClip(r);
}

/** The original name-based matching, kept for models that have not been swapped to the rigged clip set. */
function selectLegacyClip(r: ClipRequest): ClipChoice | null {
  const { available } = r;
  if (r.isAttacking) {
    const t = r.attackType;
    const pattern =
      t === "kick" || t === "heavy" ? /kick|heavy/i
      : t === "special" || t === "skill" ? /special|skill|slash|strike/i
      : t === "ultimate" ? /ultimate|super|finisher/i
      : /punch|jab|light|attack/i;
    const matches = available.filter((n) => pattern.test(n));
    if (matches.length === 0) return null;
    const pick = (t === "kick" || t === "heavy") && matches.length > 1 ? matches[(r.variant ?? 0) % matches.length] : matches[0];
    return { clip: pick, loop: "once", kind: "attack" };
  }
  if (r.isMoving) {
    const clip = r.isRunning ? available.find((n) => /run|sprint/i.test(n)) : available.find((n) => /walk|locomotion/i.test(n));
    return clip ? { clip, loop: "repeat", kind: r.isRunning ? "run" : "walk" } : null;
  }
  const idle = available.find((n) => /idle|breath|stand/i.test(n));
  return idle ? { clip: idle, loop: "repeat", kind: "idle" } : null;
}
