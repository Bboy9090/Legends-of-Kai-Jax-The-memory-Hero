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

export type AIRandom = () => number;

const DEFAULT_IDENTITY: Readonly<FighterAIIdentity> = Object.freeze({
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
});

const IDENTITY_BY_FIGHTER: Readonly<Record<string, Partial<FighterAIIdentity>>> = Object.freeze({
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
});

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function clampAIRoll(roll: number): number {
  return clamp(roll, 0, 0.999999999, 0.5);
}

function normalizeIdentity(identity: FighterAIIdentity): FighterAIIdentity {
  const preferredRange = clamp(identity.preferredRange, 0.5, 12, DEFAULT_IDENTITY.preferredRange);
  const attackRange = clamp(identity.attackRange, 0.4, preferredRange + 2, DEFAULT_IDENTITY.attackRange);
  const retreatRange = clamp(identity.retreatRange, 0, preferredRange, DEFAULT_IDENTITY.retreatRange);
  const punishRange = clamp(identity.punishRange, attackRange, preferredRange + 3, DEFAULT_IDENTITY.punishRange);

  return {
    ...identity,
    preferredRange,
    attackRange,
    retreatRange,
    punishRange,
    moveSpeedMult: clamp(identity.moveSpeedMult, 0.35, 2, DEFAULT_IDENTITY.moveSpeedMult),
    jumpChance: clamp(identity.jumpChance, 0, 1, DEFAULT_IDENTITY.jumpChance),
    punishBias: clamp(identity.punishBias, 0, 1, DEFAULT_IDENTITY.punishBias),
    specialBias: clamp(identity.specialBias, 0, 0.9, DEFAULT_IDENTITY.specialBias),
    heavyBias: clamp(identity.heavyBias, 0, 0.95, DEFAULT_IDENTITY.heavyBias),
  };
}

export function getFighterAIIdentity(fighterId: string, fallback?: OpponentArchetype): FighterAIIdentity {
  const patch = IDENTITY_BY_FIGHTER[fighterId] ?? {};
  return normalizeIdentity({
    ...DEFAULT_IDENTITY,
    ...patch,
    archetype: patch.archetype ?? fallback ?? DEFAULT_IDENTITY.archetype,
  });
}

export function choosePositionAction(identity: FighterAIIdentity, s: AICombatSnapshot): AIAction {
  const distance = Math.max(0, Number.isFinite(s.distance) ? s.distance : identity.preferredRange);
  const healthRatio = clamp(s.opponentHealthRatio, 0, 1, 1);

  if (s.playerHitStunTimer > 0 && distance <= identity.punishRange) return 'punish';

  if (s.playerAttacking && distance <= identity.punishRange) {
    if (identity.archetype === 'defensive' || identity.archetype === 'caster') return 'retreat';
    return 'hold';
  }

  if (identity.archetype === 'caster') {
    if (distance < identity.retreatRange) return 'retreat';
    if (distance > identity.preferredRange + 1.2) return 'chase';
    return 'hold';
  }

  if (identity.archetype === 'titan') {
    return distance > identity.attackRange ? 'chase' : 'hold';
  }

  if (identity.archetype === 'defensive') {
    if (healthRatio < 0.3 && distance < identity.preferredRange) return 'retreat';
    if (distance < identity.retreatRange) return 'retreat';
  }

  if (distance > identity.preferredRange) return 'chase';
  return 'hold';
}

export function chooseAttack(identity: FighterAIIdentity, roll: number, punish = false): AIAttack {
  const r = clampAIRoll(roll);
  const special = Math.min(0.9, identity.specialBias + (punish ? 0.08 : 0));
  const heavy = Math.max(0, Math.min(0.95 - special, identity.heavyBias + (punish ? 0.12 : 0)));
  if (r < special) return 'special';
  if (r < special + heavy) return 'kick';
  return 'punch';
}

export function shouldPunish(
  identity: FighterAIIdentity,
  roll: number,
  playerAttacking: boolean,
  playerHitStunTimer: number
): boolean {
  if (playerHitStunTimer > 0) return true;
  return playerAttacking && clampAIRoll(roll) < identity.punishBias;
}

/** FNV-1a string hash for stable cross-session AI seeds. */
export function hashAISeed(seed: string | number): number {
  const text = String(seed);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG suitable for combat decisions, tests, and replay parity. */
export function createAIRng(seed: string | number): AIRandom {
  let state = hashAISeed(seed) || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
