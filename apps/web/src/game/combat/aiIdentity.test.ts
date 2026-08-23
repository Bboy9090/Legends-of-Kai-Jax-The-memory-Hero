import { describe, expect, it } from 'vitest';
import {
  chooseAttack,
  choosePositionAction,
  getFighterAIIdentity,
  shouldPunish,
} from './aiIdentity';

describe('fighter AI identity', () => {
  it('gives stalkers higher mobility and jump appetite than titans', () => {
    const stalker = getFighterAIIdentity('jaxon');
    const titan = getFighterAIIdentity('behemoth');
    expect(stalker.archetype).toBe('stalker');
    expect(titan.archetype).toBe('titan');
    expect(stalker.moveSpeedMult).toBeGreaterThan(titan.moveSpeedMult);
    expect(stalker.jumpChance).toBeGreaterThan(titan.jumpChance);
  });

  it('makes casters retreat when crowded and hold their preferred zone', () => {
    const caster = getFighterAIIdentity('lunara');
    expect(choosePositionAction(caster, {
      distance: 2,
      opponentHealthRatio: 1,
      playerAttacking: false,
      playerAttackElapsed: 0,
      playerHitStunTimer: 0,
      opponentGrounded: true,
    })).toBe('retreat');

    expect(choosePositionAction(caster, {
      distance: 5.5,
      opponentHealthRatio: 1,
      playerAttacking: false,
      playerAttackElapsed: 0,
      playerHitStunTimer: 0,
      opponentGrounded: true,
    })).toBe('hold');
  });

  it('prioritizes guaranteed punish when the player is in hitstun', () => {
    const identity = getFighterAIIdentity('kaison');
    expect(shouldPunish(identity, 0.99, false, 0.2)).toBe(true);
    expect(choosePositionAction(identity, {
      distance: 2,
      opponentHealthRatio: 0.6,
      playerAttacking: false,
      playerAttackElapsed: 0,
      playerHitStunTimer: 0.2,
      opponentGrounded: true,
    })).toBe('punish');
  });

  it('gives titans a strong heavy-attack bias', () => {
    const titan = getFighterAIIdentity('behemoth');
    expect(chooseAttack(titan, 0.5)).toBe('kick');
  });

  it('gives casters a strong special-attack bias', () => {
    const caster = getFighterAIIdentity('lunara');
    expect(chooseAttack(caster, 0.5)).toBe('special');
  });

  it('falls back to requested personality for unknown roster entries', () => {
    const fallback = getFighterAIIdentity('future-fighter', 'defensive');
    expect(fallback.archetype).toBe('defensive');
  });
});
