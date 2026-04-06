/**
 * Jax line — ice / tactical (jaxon roster id).
 */
import type { CharacterMoveTuning } from "../shared/CharacterMoveset";

export const JAXON_MOVESET_PATCH: Partial<CharacterMoveTuning> = {
  punchDamage: 8,
  kickDamage: 12,
  specialDamage: 17,
  ultimateDamage: 28,
  kickRange: 2.1,
};
