/**
 * Animation Polish System
 * Transition smoothing, impact reactions, and animation variety configuration
 */

export type ReactionType = 'flinch' | 'knockback' | 'launch' | 'knockdown' | 'stagger';

export interface AnimationTransition {
  from: string;
  to: string;
  blendDurationMs: number;
  interruptible: boolean;
}

export interface ImpactReaction {
  type: ReactionType;
  minDamage: number; // damage threshold to trigger this reaction
  animationKey: string;
  durationMs: number;
  knockbackForce: number;
  invulnerableDuringMs: number;
}

export interface IdleVariation {
  animationKey: string;
  weight: number; // relative probability
  minIdleTimeMs: number; // how long idle before this can play
}

// Blend timing between core animation states — tuned for readable combat
export const ANIMATION_TRANSITIONS: AnimationTransition[] = [
  { from: 'idle', to: 'walk', blendDurationMs: 150, interruptible: true },
  { from: 'walk', to: 'run', blendDurationMs: 120, interruptible: true },
  { from: 'run', to: 'idle', blendDurationMs: 200, interruptible: true },
  { from: 'idle', to: 'attack_light', blendDurationMs: 60, interruptible: false },
  { from: 'attack_light', to: 'attack_light', blendDurationMs: 40, interruptible: false },
  { from: 'attack_light', to: 'attack_heavy', blendDurationMs: 80, interruptible: false },
  { from: 'attack_heavy', to: 'idle', blendDurationMs: 180, interruptible: true },
  { from: 'idle', to: 'jump', blendDurationMs: 80, interruptible: false },
  { from: 'jump', to: 'fall', blendDurationMs: 120, interruptible: true },
  { from: 'fall', to: 'land', blendDurationMs: 50, interruptible: false },
  { from: 'land', to: 'idle', blendDurationMs: 150, interruptible: true },
  { from: 'any', to: 'hit_flinch', blendDurationMs: 40, interruptible: false },
  { from: 'any', to: 'knockdown', blendDurationMs: 60, interruptible: false },
  { from: 'knockdown', to: 'getup', blendDurationMs: 100, interruptible: false },
  { from: 'getup', to: 'idle', blendDurationMs: 150, interruptible: true },
  { from: 'any', to: 'death', blendDurationMs: 80, interruptible: false },
  { from: 'any', to: 'victory', blendDurationMs: 250, interruptible: false },
];

// Damage-scaled hit reactions
export const IMPACT_REACTIONS: ImpactReaction[] = [
  {
    type: 'flinch',
    minDamage: 0,
    animationKey: 'hit_flinch',
    durationMs: 250,
    knockbackForce: 0.5,
    invulnerableDuringMs: 0,
  },
  {
    type: 'stagger',
    minDamage: 15,
    animationKey: 'hit_stagger',
    durationMs: 450,
    knockbackForce: 1.5,
    invulnerableDuringMs: 100,
  },
  {
    type: 'knockback',
    minDamage: 25,
    animationKey: 'hit_knockback',
    durationMs: 600,
    knockbackForce: 3.5,
    invulnerableDuringMs: 200,
  },
  {
    type: 'launch',
    minDamage: 40,
    animationKey: 'hit_launch',
    durationMs: 800,
    knockbackForce: 5,
    invulnerableDuringMs: 300,
  },
  {
    type: 'knockdown',
    minDamage: 55,
    animationKey: 'knockdown',
    durationMs: 1200,
    knockbackForce: 6,
    invulnerableDuringMs: 600,
  },
];

// Idle variety — subtle motion after standing still
export const IDLE_VARIATIONS: IdleVariation[] = [
  { animationKey: 'idle', weight: 6, minIdleTimeMs: 0 },
  { animationKey: 'idle_look_around', weight: 2, minIdleTimeMs: 4000 },
  { animationKey: 'idle_stretch', weight: 1, minIdleTimeMs: 8000 },
  { animationKey: 'idle_taunt', weight: 1, minIdleTimeMs: 12000 },
];

/**
 * Get the blend duration for a state transition (falls back to a default)
 */
export function getTransitionBlend(from: string, to: string): AnimationTransition {
  const exact = ANIMATION_TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (exact) return exact;

  const wildcard = ANIMATION_TRANSITIONS.find((t) => t.from === 'any' && t.to === to);
  if (wildcard) return wildcard;

  return { from, to, blendDurationMs: 150, interruptible: true };
}

/**
 * Select the impact reaction for a given damage amount
 */
export function getImpactReaction(damage: number): ImpactReaction {
  // Reactions are ordered by minDamage ascending; pick the strongest that applies
  let selected = IMPACT_REACTIONS[0];
  for (const reaction of IMPACT_REACTIONS) {
    if (damage >= reaction.minDamage) {
      selected = reaction;
    }
  }
  return selected;
}

/**
 * Pick an idle variation based on how long the character has been idle
 */
export function pickIdleVariation(idleTimeMs: number): IdleVariation {
  const eligible = IDLE_VARIATIONS.filter((v) => idleTimeMs >= v.minIdleTimeMs);
  const totalWeight = eligible.reduce((sum, v) => sum + v.weight, 0);

  let roll = Math.random() * totalWeight;
  for (const variation of eligible) {
    roll -= variation.weight;
    if (roll <= 0) return variation;
  }

  return IDLE_VARIATIONS[0];
}
