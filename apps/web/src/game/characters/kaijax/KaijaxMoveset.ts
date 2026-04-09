/**
 * Kai-Jax line — fusion / primary hero identity (move tuning patch).
 */
import type { CharacterMoveTuning } from "../shared/CharacterMoveset";

export const KAIJAX_MOVESET_PATCH: Partial<CharacterMoveTuning> = {
  punchDamage: 9,
  kickDamage: 13,
  specialDamage: 20,
  ultimateDamage: 34,
  specialRange: 2.8,
  ultimateRange: 3.4,
};
