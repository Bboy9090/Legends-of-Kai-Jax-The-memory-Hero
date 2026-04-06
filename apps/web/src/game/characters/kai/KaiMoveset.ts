/**
 * Kai line — ember / panther (kaison roster id).
 */
import type { CharacterMoveTuning } from "../shared/CharacterMoveset";

export const KAISON_MOVESET_PATCH: Partial<CharacterMoveTuning> = {
  punchDamage: 8,
  kickDamage: 11,
  specialDamage: 19,
  ultimateDamage: 29,
  specialRange: 2.9,
};
