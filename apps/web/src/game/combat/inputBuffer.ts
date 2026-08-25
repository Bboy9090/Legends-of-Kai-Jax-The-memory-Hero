import type { AttackType } from "./moveData";
import { COMBAT_INPUT } from "../tuning/combatTuning";

export const ATTACK_BUFFER_WINDOW_SEC = COMBAT_INPUT.attackBufferSec;

export interface BufferedAttack {
  type: AttackType;
  remainingSec: number;
  ageSec: number;
}

function finiteNonNegative(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/**
 * Keep the newest intent so rapid button changes feel deliberate, not sticky.
 * Buffer state is immutable so it can be safely inspected by tests and tooling.
 */
export function queueBufferedAttack(
  type: AttackType,
  windowSec: number = ATTACK_BUFFER_WINDOW_SEC
): BufferedAttack {
  return {
    type,
    remainingSec: finiteNonNegative(windowSec, ATTACK_BUFFER_WINDOW_SEC),
    ageSec: 0,
  };
}

/** Advance the buffer in gameplay time; expired inputs are discarded. */
export function tickBufferedAttack(
  buffered: BufferedAttack | null,
  deltaSec: number
): BufferedAttack | null {
  if (!buffered) return null;

  const dt = finiteNonNegative(deltaSec);
  const remainingSec = buffered.remainingSec - dt;
  if (remainingSec <= 0) return null;

  return {
    ...buffered,
    remainingSec,
    ageSec: buffered.ageSec + dt,
  };
}

/** True while an intent is still valid for consumption. */
export function isBufferedAttackActive(buffered: BufferedAttack | null): buffered is BufferedAttack {
  return !!buffered && buffered.remainingSec > 0;
}
