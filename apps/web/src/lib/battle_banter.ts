/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES
 * Battle banter: taunts, smirks, encouragement
 * Fighters taunt each other, smirk, and encourage one another during battles.
 */

export type BanterType = 'taunt' | 'smirk' | 'encourage';

export interface BattleBanterLine {
  type: BanterType;
  text: string;
  /** When to show: 'on_hit' | 'on_taunt' | 'on_low_hp' | 'on_win' | 'on_combo' | 'idle' */
  trigger: string;
}

/** Taunts — bold, competitive */
export const TAUNTS: string[] = [
  "You're already done.",
  "That all you got?",
  "Stay down.",
  "Too slow.",
  "See you in the memory stream.",
  "Flawless. You're not.",
  "My turn. Your loss.",
  "Arm, feet, fists. You've got none.",
  "Smirk all you want—you're still losing.",
  "God blessed these hands. Not yours.",
];

/** Smirk / cocky one-liners */
export const SMIRKS: string[] = [
  "… Nice try.",
  "Did you feel that?",
  "Mm. Flawless.",
  "Right on time.",
  "Exactly when it was supposed to.",
  "Yeah. That's the upgrade.",
  "… Encouraged? Don't be.",
  "Clean.",
  "Like we practised.",
  "Blessed.",
];

/** Encouragement — to self or ally */
export const ENCOURAGEMENT: string[] = [
  "Let's go!",
  "We've got this!",
  "Nice one!",
  "Keep it up!",
  "That's it!",
  "Beautiful!",
  "Together!",
  "You're doing great!",
  "Stay sharp!",
  "Almost there!",
];

export function getRandomTaunt(): string {
  return TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
}

export function getRandomSmirk(): string {
  return SMIRKS[Math.floor(Math.random() * SMIRKS.length)];
}

export function getRandomEncouragement(): string {
  return ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
}

export function getBanterForTrigger(trigger: 'on_hit' | 'on_taunt' | 'on_low_hp' | 'on_win' | 'on_combo' | 'idle', type: BanterType): string {
  if (type === 'taunt') return getRandomTaunt();
  if (type === 'smirk') return getRandomSmirk();
  return getRandomEncouragement();
}
