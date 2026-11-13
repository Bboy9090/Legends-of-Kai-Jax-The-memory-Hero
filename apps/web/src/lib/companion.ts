/**
 * Companion AI (ported from the zip prototype's `updateCompanionAI`, adapted to this game's arena).
 * When you play Kai, Jax fights beside you (and vice versa). The companion is a support character:
 *  - ENGAGE: runs at the nearest threat in range, holds at melee distance and strikes on a cooldown.
 *  - FOLLOW: with nothing to fight, trails at a flank offset and snaps back if left far behind.
 * It cannot be hurt and never blocks the mission objective; it only adds damage. Pure functions,
 * so the behaviour is unit-testable without React or a renderer.
 */
export const COMPANION = {
  engageRange: 12,
  meleeRange: 2.3,
  engageSpeed: 6.5,
  followSpeed: 7.6,
  followArrive: 1.4,
  flankDistance: 2.1,
  teleportDistance: 14,
  attackCooldown: 1.45,
  strikeRadius: 2.2,
  /** Share of the player's Skill damage dealt per strike (a support, not a second hero). */
  damageFactor: 0.65,
  boundary: 32,
  /** How long the attack pose lasts after a strike. */
  strikePose: 0.45,
} as const;

export interface CompanionState {
  x: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  attackCd: number;
  /** Seconds of attack pose remaining. */
  strikeTimer: number;
  mode: "follow" | "engage";
}

export interface CompanionTarget {
  id: string;
  x: number;
  z: number;
}
export interface CompanionInput {
  dt: number;
  player: { x: number; z: number; rotY: number };
  enemies: readonly CompanionTarget[];
}
export interface CompanionStrike {
  targetId: string;
  hitIds: string[];
}

export const companionHeroFor = (playerFighterId: string): "kai" | "jax" | null =>
  playerFighterId === "kai" ? "jax" : playerFighterId === "jax" ? "kai" : null;

export const companionStrikeDamage = (skillDamage: number) => Math.max(1, Math.round(skillDamage * COMPANION.damageFactor));

/** Exponential smoothing toward a target, frame-rate independent. */
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp = (n: number, lim: number) => Math.min(lim, Math.max(-lim, n));

/** The spot beside the player where the companion waits. */
export function flankPoint(player: { x: number; z: number; rotY: number }) {
  return { x: player.x - Math.cos(player.rotY) * COMPANION.flankDistance, z: player.z + Math.sin(player.rotY) * COMPANION.flankDistance };
}

export function initialCompanion(player: { x: number; z: number; rotY: number }): CompanionState {
  const f = flankPoint(player);
  return { x: f.x, z: f.z, vx: 0, vz: 0, yaw: player.rotY, attackCd: 0, strikeTimer: 0, mode: "follow" };
}

export function nearestTarget(from: { x: number; z: number }, enemies: readonly CompanionTarget[], range: number): CompanionTarget | null {
  let best: CompanionTarget | null = null;
  let bestD = range;
  for (const e of enemies) {
    const d = Math.hypot(e.x - from.x, e.z - from.z);
    if (d <= bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

export function stepCompanion(prev: CompanionState, input: CompanionInput): { state: CompanionState; strike: CompanionStrike | null } {
  const { dt, player, enemies } = input;
  if (!(dt > 0)) return { state: prev, strike: null };
  const s: CompanionState = { ...prev, attackCd: Math.max(0, prev.attackCd - dt), strikeTimer: Math.max(0, prev.strikeTimer - dt) };
  let strike: CompanionStrike | null = null;

  // Threats are measured from the player, so the companion stays in the fight the player is in.
  const target = nearestTarget(player, enemies, COMPANION.engageRange);

  if (target) {
    s.mode = "engage";
    const dx = target.x - s.x;
    const dz = target.z - s.z;
    const dist = Math.hypot(dx, dz);
    s.yaw = Math.atan2(dx, dz);
    if (dist > COMPANION.meleeRange) {
      s.vx = damp(s.vx, (dx / dist) * COMPANION.engageSpeed, 8, dt);
      s.vz = damp(s.vz, (dz / dist) * COMPANION.engageSpeed, 8, dt);
    } else {
      s.vx = damp(s.vx, 0, 12, dt);
      s.vz = damp(s.vz, 0, 12, dt);
      if (s.attackCd <= 0) {
        s.attackCd = COMPANION.attackCooldown;
        s.strikeTimer = COMPANION.strikePose;
        const hitIds = enemies.filter((e) => Math.hypot(e.x - target.x, e.z - target.z) <= COMPANION.strikeRadius).map((e) => e.id);
        strike = { targetId: target.id, hitIds };
      }
    }
  } else {
    s.mode = "follow";
    const f = flankPoint(player);
    const dx = f.x - s.x;
    const dz = f.z - s.z;
    const dist = Math.hypot(dx, dz);
    if (dist > COMPANION.teleportDistance) {
      s.x = f.x;
      s.z = f.z;
      s.vx = s.vz = 0;
    } else if (dist > COMPANION.followArrive) {
      s.vx = damp(s.vx, (dx / dist) * COMPANION.followSpeed, 8, dt);
      s.vz = damp(s.vz, (dz / dist) * COMPANION.followSpeed, 8, dt);
      s.yaw = Math.atan2(s.vx, s.vz);
    } else {
      s.vx = damp(s.vx, 0, 12, dt);
      s.vz = damp(s.vz, 0, 12, dt);
    }
  }

  s.x = clamp(s.x + s.vx * dt, COMPANION.boundary);
  s.z = clamp(s.z + s.vz * dt, COMPANION.boundary);
  return { state: s, strike };
}
