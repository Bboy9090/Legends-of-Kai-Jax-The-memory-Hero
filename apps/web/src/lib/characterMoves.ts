export type CharacterId = "kai-jax" | "jaxon" | "kaison" | string;

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

const DEFAULT_TUNING: CharacterMoveTuning = {
  punchDamage: 8,
  kickDamage: 12,
  specialDamage: 18,
  ultimateDamage: 30,
  punchRange: 1.5,
  kickRange: 2.0,
  specialRange: 2.6,
  ultimateRange: 3.2,
};

const TUNING_BY_CHARACTER: Record<string, Partial<CharacterMoveTuning>> = {
  "kai-jax": {
    punchDamage: 9,
    kickDamage: 13,
    specialDamage: 20,
    ultimateDamage: 34,
    specialRange: 2.8,
    ultimateRange: 3.4,
  },
  jaxon: {
    punchDamage: 8,
    kickDamage: 12,
    specialDamage: 17,
    ultimateDamage: 28,
    kickRange: 2.1,
  },
  kaison: {
    punchDamage: 8,
    kickDamage: 11,
    specialDamage: 19,
    ultimateDamage: 29,
    specialRange: 2.9,
  },
};

export function getCharacterMoves(characterId: CharacterId): CharacterMoveTuning {
  const patch = TUNING_BY_CHARACTER[characterId] ?? {};
  return { ...DEFAULT_TUNING, ...patch };
}

