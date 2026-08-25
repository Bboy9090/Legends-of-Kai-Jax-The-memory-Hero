import { describe, expect, it } from 'vitest';
import {
  chooseAttack,
  choosePositionAction,
  createAIRng,
  getFighterAIIdentity,
  hashAISeed,
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

  it('makes defensive fighters disengage earlier at critical health', () => {
    const identity = getFighterAIIdentity('kaison');
    expect(choosePositionAction(identity, {
      distance: 2.5,
      opponentHealthRatio: 0.2,
      playerAttacking: false,
      playerAttackElapsed: 0,
      playerHitStunTimer: 0,
      opponentGrounded: true,
    })).toBe('retreat');
  });

  it('gives titans a strong heavy-attack bias', () => {
    const titan = getFighterAIIdentity('behemoth');
    expect(chooseAttack(titan, 0.5)).toBe('kick');
  });

  it('gives casters a strong special-attack bias', () => {
    const caster = getFighterAIIdentity('lunara');
    expect(chooseAttack(caster, 0.5)).toBe('special');
  });

  it('clamps invalid random rolls instead of leaking undefined behavior', () => {
    const caster = getFighterAIIdentity('lunara');
    expect(chooseAttack(caster, Number.NaN)).toMatch(/punch|kick|special/);
    expect(chooseAttack(caster, -100)).toBe('special');
  });

  it('falls back to requested personality for unknown roster entries', () => {
    const fallback = getFighterAIIdentity('future-fighter', 'defensive');
    expect(fallback.archetype).toBe('defensive');
  });
});

describe('deterministic AI random stream', () => {
  it('hashes the same seed identically', () => {
    expect(hashAISeed('jaxon:4:hard')).toBe(hashAISeed('jaxon:4:hard'));
    expect(hashAISeed('jaxon:4:hard')).not.toBe(hashAISeed('jaxon:5:hard'));
  });

  it('replays the same decision sequence for the same seed', () => {
    const a = createAIRng('memory-hero-round-1');
    const b = createAIRng('memory-hero-round-1');
    const seqA = Array.from({ length: 12 }, () => a());
    const seqB = Array.from({ length: 12 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('keeps values inside [0, 1)', () => {
    const rng = createAIRng('range-proof');
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
