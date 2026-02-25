/**
 * Per-character special and ultimate move config.
 * Specials = unique signature moves. Ultimates = flashiest, most powerful.
 */

export interface CharacterMoveConfig {
  specialDamage: number;
  specialRange: number;
  specialName: string;
  ultimateDamage: number;
  ultimateRange: number;
  ultimateName: string;
  /** Extra screen shake for ultimate (0-1 scale) */
  ultimateShakeBonus?: number;
  /** Extra hit stop for ultimate (seconds) */
  ultimateStopBonus?: number;
}

const DEFAULT: CharacterMoveConfig = {
  specialDamage: 20,
  specialRange: 3,
  specialName: "Special",
  ultimateDamage: 40,
  ultimateRange: 5,
  ultimateName: "Ultimate",
};

export const CHARACTER_MOVES: Record<string, Partial<CharacterMoveConfig>> = {
  "kai-jax": {
    specialDamage: 24,
    specialRange: 3.5,
    specialName: "Memory Lock",
    ultimateDamage: 50,
    ultimateRange: 6,
    ultimateName: "9-Tail Sovereign",
    ultimateShakeBonus: 0.5,
    ultimateStopBonus: 0.05,
  },
  kai: {
    specialDamage: 22,
    specialRange: 3.2,
    specialName: "Inferno Whip",
    ultimateDamage: 45,
    ultimateRange: 5.5,
    ultimateName: "Hellfire Lash",
    ultimateShakeBonus: 0.3,
    ultimateStopBonus: 0.03,
  },
  jax: {
    specialDamage: 20,
    specialRange: 3.5,
    specialName: "Frost Shield",
    ultimateDamage: 42,
    ultimateRange: 5.2,
    ultimateName: "Crystal Lock",
    ultimateShakeBonus: 0.25,
  },
  jaxon: {
    specialDamage: 21,
    specialRange: 3.2,
    specialName: "Ice Spike",
    ultimateDamage: 44,
    ultimateRange: 5.5,
    ultimateName: "Arctic Blitz",
    ultimateShakeBonus: 0.3,
  },
  kaison: {
    specialDamage: 23,
    specialRange: 3.0,
    specialName: "Ember Strike",
    ultimateDamage: 46,
    ultimateRange: 5.5,
    ultimateName: "Volcanic Surge",
    ultimateShakeBonus: 0.35,
    ultimateStopBonus: 0.02,
  },
  kaxon: {
    specialDamage: 24,
    specialRange: 2.8,
    specialName: "Law Strike",
    ultimateDamage: 48,
    ultimateRange: 5.2,
    ultimateName: "Sabertooth Judgment",
    ultimateShakeBonus: 0.4,
    ultimateStopBonus: 0.04,
  },
  boryn: {
    specialDamage: 26,
    specialRange: 2.5,
    specialName: "Guardian Roar",
    ultimateDamage: 55,
    ultimateRange: 5.5,
    ultimateName: "Father's Sacrifice",
    ultimateShakeBonus: 0.6,
    ultimateStopBonus: 0.06,
  },
  "voltage-fang": {
    specialDamage: 22,
    specialRange: 3.5,
    specialName: "Thunder Spike",
    ultimateDamage: 46,
    ultimateRange: 6,
    ultimateName: "Storm Chain",
  },
  steelwolf: {
    specialDamage: 20,
    specialRange: 3.0,
    specialName: "Exosuit Slam",
    ultimateDamage: 42,
    ultimateRange: 5,
    ultimateName: "Mech Overdrive",
  },
  "ashen-tiger": {
    specialDamage: 25,
    specialRange: 3.2,
    specialName: "Memory Corruption",
    ultimateDamage: 50,
    ultimateRange: 5.5,
    ultimateName: "Echo Devour",
    ultimateShakeBonus: 0.45,
  },
};

export function getCharacterMoves(fighterId: string): CharacterMoveConfig {
  const cfg = CHARACTER_MOVES[fighterId];
  return cfg ? { ...DEFAULT, ...cfg } : DEFAULT;
}
