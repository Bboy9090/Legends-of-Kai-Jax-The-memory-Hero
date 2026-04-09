import {
  DEFAULT_CHARACTER_MOVESET,
  mergeCharacterMoveset,
  type CharacterMoveTuning,
} from "../game/characters/shared/CharacterMoveset";
import { KAIJAX_MOVESET_PATCH } from "../game/characters/kaijax/KaijaxMoveset";
import { JAXON_MOVESET_PATCH } from "../game/characters/jax/JaxMoveset";
import { KAISON_MOVESET_PATCH } from "../game/characters/kai/KaiMoveset";
import { resolveMovesetKey } from "../game/characters/shared/LineageRoster";

export type CharacterId = "kai-jax" | "jaxon" | "kaison" | string;

export type { CharacterMoveTuning };

/** Keys are lineage tuning ids (jax + jaxon share `jaxon`; kai + kaison share `kaison`). */
const TUNING_BY_LINEAGE_KEY: Record<string, Partial<CharacterMoveTuning>> = {
  "kai-jax": KAIJAX_MOVESET_PATCH,
  jaxon: JAXON_MOVESET_PATCH,
  kaison: KAISON_MOVESET_PATCH,
};

export function getCharacterMoves(characterId: CharacterId): CharacterMoveTuning {
  const key = resolveMovesetKey(characterId);
  const patch = TUNING_BY_LINEAGE_KEY[key] ?? {};
  return mergeCharacterMoveset(DEFAULT_CHARACTER_MOVESET, patch);
}
