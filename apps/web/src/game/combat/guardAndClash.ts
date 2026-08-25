/**
 * Guard pressure and attack-clash priority.
 *
 * These are pure deterministic rules. Keep balance data declarative so combat,
 * AI evaluation, tests, replay tooling, and future netcode all consume one table.
 */
import type { AttackType } from "./moveData";

export const GUARD_PRESSURE_BY_ATTACK: Readonly<Record<AttackType, number>> = Object.freeze({
  punch: 12,
  kick: 22,
  special: 40,
  ultimate: 55,
});

export const CLASH_PRIORITY_BY_ATTACK: Readonly<Record<AttackType, number>> = Object.freeze({
  punch: 1,
  kick: 2,
  special: 3,
  ultimate: 4,
});

export function attackBreaksGuard(type: AttackType): number {
  return GUARD_PRESSURE_BY_ATTACK[type];
}

export function getClashPriority(type: AttackType | null | undefined): number {
  return type ? CLASH_PRIORITY_BY_ATTACK[type] : 0;
}
