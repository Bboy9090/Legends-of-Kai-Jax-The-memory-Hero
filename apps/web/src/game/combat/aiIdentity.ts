export type OpponentArchetype = 'aggressive' | 'defensive' | 'stalker' | 'titan' | 'caster';
export type AIAction = 'chase' | 'retreat' | 'hold' | 'punish' | 'attack' | 'jump';
export type AIAttack = 'punch' | 'kick' | 'special';

export interface FighterAIIdentity {
  archetype: OpponentArchetype;
  preferredRange: number;
  attackRange: number;
  retreatRange: number;
  punishRange: number;
  moveSpeedMult: number;
  jumpChance: number;
  punishBias: number;
  specialBias: number;
  heavyBias: number;
}

export interface AICombatSnapshot {
  distance: number;
  opponentHealthRatio: number;
  playerAttacking: boolean;
  playerAttackElapsed: number;
  playerHitStunTimer: number;
  opponentGrounded: boolean;
}

const DEFAULT_IDENTITY: FighterAIIdentity = {
  archetype: 'aggressive',
  preferredRange: 3,
  attackRange: 2.2,
  retreatRange: 1.15,
  punishRange: 2.6,
  moveSpeedMult: 1,
  jumpChance: 0.08,
  punishBias: 0.55,
  specialBias: 0.2,
  heavyBias: 0.4,
};

const IDENTITY_BY_FIGHTER: Record<string, Partial<FighterAIIdentity>> = {
  'kai-jax': { archetype: 'aggressive', preferredRange: 2.5, punishBias: 0.8, specialBias: 0.35, heavyBias: 0.45 },
  jaxon: { archetype: 'stalker', preferredRange: 3.2, moveSpeedMult: 1.22, jumpChance: 0.28, punishBias: 0.72, specialBias: 0.22, heavyBias: 0.28 },
  jax: { archetype: 'stalker', preferredRange: 3.2, moveSpeedMult: 1.22, jumpChance: 0.28, punishBias: 0.72, specialBias: 0.22, heavyBias: 0.28 },
  kaison: { archetype: 'defensive', preferredRange: 3.6, retreatRange: 1.5, punishBias: 0.82, specialBias: 0.28, heavyBias: 0.52 },
  kai: { archetype: 'defensive', preferredRange: 3.6, retreatRange: 1.5, punishBias: 0.82, specialBias: 0.28, heavyBias: 0.52 },
  'voltage-fang': { archetype: 'titan', preferredRange: 2.2, attackRange: 2.5, moveSpeedMult: 0.78, jumpChance: 0.01, heavyBias: 0.78, specialBias: 0.12 },
  steelwolf: { archetype: 'titan', preferredRange: 2.4, attackRange: 2.5, moveSpeedMult: 0.8, jumpChance: 0.02, heavyBias: 0.74 },
  'ashen-tiger': { archetype: 'aggressive', preferredRange: 2.4, moveSpeedMult: 1.08, punishBias: 0.7, heavyBias: 0.58 },
  velocity: { archetype: 'stalker', preferredRange: 3.4, moveSpeedMult: 1.35, jumpChance: 0.22, punishBias: 0.74, heavyBias: 0.2 },
  lunara: { archetype: 'caster', preferredRange: 5.8, attackRange: 2.4, retreatRange: 3.8, specialBias: 0.72, heavyBias: 0.2 },
  voidonus: { archetype: 'caster', preferredRange: 5.4, attackRange: 2.6, retreatRange: 3.5, punishBias: 0.75, specialBias: 0.68, heavyBias: 0.35 },
  malakor: { archetype: 'aggressive', preferredRange: 2.6, punishBias: 0.78, specialBias: 0.42, heavyBias: 0.62 },
  behemoth: { archetype: 'titan', preferredRange: 2.1, attackRange: 2.8, moveSpeedMult: 0.68, jumpChance: 0, heavyBias: 0.86, specialBias: 0.18 },
};

export function getFighterAIIdentity(fighterId: string, fallback?: OpponentArchetype): FighterAIIdentity {
  const patch = IDENTITY_BY_FIGHTER[fighterId] ?? {};
  return {
    ...DEFAULT_IDENTITY,
    ...patch,
    archetype: patch.archetype ?? fallback ?? DEFAULT_IDENTITY.archetype,
  };
}

export function choosePositionAction(identity: FighterAIIdentity, s: AICombatSnapshot): AIAction {
  if (s.playerHitStunTimer > 0 && s.distance <= identity.punishRange) return 'punish';

  if (s.playerAttacking && s.distance <= identity.punishRange) {
    if (identity.archetype === 'defensive' || identity.archetype === 'caster') return 'retreat';
    return 'hold';
  }

  if (identity.archetype === 'caster') {
    if (s.distance < identity.retreatRange) return 'retreat';
    if (s.distance > identity.preferredRange + 1.2) return 'chase';
    return 'hold';
  }

  if (identity.archetype === 'titan') {
    return s.distance > identity.attackRange ? 'chase' : 'hold';
  }

  if (s.distance < identity.retreatRange && identity.archetype === 'defensive') return 'retreat';
  if (s.distance > identity.preferredRange) return 'chase';
  return 'hold';
}

export function chooseAttack(identity: FighterAIIdentity, roll: number, punish = false): AIAttack {
  const special = Math.min(0.9, identity.specialBias + (punish ? 0.08 : 0));
  const heavy = Math.min(0.95 - special, identity.heavyBias + (punish ? 0.12 : 0));
  if (roll < special) return 'special';
  if (roll < special + heavy) return 'kick';
  return 'punch';
}

export function shouldPunish(identity: FighterAIIdentity, roll: number, playerAttacking: boolean, playerHitStunTimer: number): boolean {
  if (playerHitStunTimer > 0) return true;
  return playerAttacking && roll < identity.punishBias;
}
