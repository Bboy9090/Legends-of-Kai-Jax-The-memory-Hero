import type { AttackType } from "./moveData";

export const ATTACK_BUFFER_WINDOW_SEC = 0.2;

export interface BufferedAttack {
  type: AttackType;
  remainingSec: number;
}
/** Keep the newest intent so rapid button changes feel deliberate, not sticky. */
export function queueBufferedAttack(
  type: AttackType,
  windowSec: number = ATTACK_BUFFER_WINDOW_SEC
): BufferedAttack {
  return { type, remainingSec: Math.max(0, windowSec) };
}

/** Advance the buffer in gameplay time; expired inputs are discarded. */
export function tickBufferedAttack(
  buffered: BufferedAttack | null,
  deltaSec: number
): BufferedAttack | null {
  if (!buffered) return null;
  const remainingSec = buffered.remainingSec - Math.max(0, deltaSec);
  return remainingSec > 0 ? { ...buffered, remainingSec } : null;
}
