/**
 * Canonical move tuning shape (battle range + damage scalars used by useBattle).
 * Per-lineage patches live in `kai/`, `jax/`, `kaijax/`.
 */

export interface CharacterMoveTuning {
  punchDamage: number;
  kickDamage: number;
  specialDamage: number;
  ultimateDamage: number;

  punchRange: number;
  kickRange: number;
  specialRange: number;
  ultimateRange: number;
}

export const DEFAULT_CHARACTER_MOVESET: CharacterMoveTuning = {
  punchDamage: 8,
  kickDamage: 12,
  specialDamage: 18,
  ultimateDamage: 30,
  punchRange: 1.5,
  kickRange: 2.0,
  specialRange: 2.6,
  ultimateRange: 3.2,
};

export function mergeCharacterMoveset(
  base: CharacterMoveTuning,
  patch: Partial<CharacterMoveTuning>
): CharacterMoveTuning {
  return { ...base, ...patch };
}
