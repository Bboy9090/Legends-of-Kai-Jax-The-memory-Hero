import {
  DEFAULT_CHARACTER_MOVESET,
  mergeCharacterMoveset,
  type CharacterMoveTuning,
} from "../game/characters/shared/CharacterMoveset";
import { KAIJAX_MOVESET_PATCH } from "../game/characters/kaijax/KaijaxMoveset";
import { JAXON_MOVESET_PATCH } from "../game/characters/jax/JaxMoveset";
import { KAISON_MOVESET_PATCH } from "../game/characters/kai/KaiMoveset";

export type CharacterId = "kai-jax" | "jaxon" | "kaison" | string;

export type { CharacterMoveTuning };

const TUNING_BY_CHARACTER: Record<string, Partial<CharacterMoveTuning>> = {
  "kai-jax": KAIJAX_MOVESET_PATCH,
  jaxon: JAXON_MOVESET_PATCH,
  kaison: KAISON_MOVESET_PATCH,
};

export function getCharacterMoves(characterId: CharacterId): CharacterMoveTuning {
  const patch = TUNING_BY_CHARACTER[characterId] ?? {};
  return mergeCharacterMoveset(DEFAULT_CHARACTER_MOVESET, patch);
}
