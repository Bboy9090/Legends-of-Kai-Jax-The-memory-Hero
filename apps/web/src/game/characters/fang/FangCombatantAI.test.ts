import { describe, expect, it } from 'vitest';
import {
  FANG_COMBATANT_CONFIG,
  applyFangKnockback,
  createFangCombatant,
  damageFangCombatant,
} from './FangCombatantContract';
import { updateFangCombatantAI } from './FangCombatantAI';

const PLAYER = { x: 0, y: 0, z: 0 };

describe('FangCombatantAI', () => {
  it('idles outside aggro range', () => {
    const fang = createFangCombatant('fang_ai_idle');
    fang.position.z = FANG_COMBATANT_CONFIG.aggroRange + 5;

    const result = updateFangCombatantAI(fang, PLAYER, 0.016, 0);

    expect(result.behavior).toBe('IDLE');
    expect(result.attackResolved).toBe(false);
    expect(fang.position.z).toBeGreaterThan(FANG_COMBATANT_CONFIG.aggroRange);
  });

  it('chases a player inside aggro range', () => {
    const fang = createFangCombatant('fang_ai_chase');
    fang.position.z = 10;
    const before = fang.position.z;

    const result = updateFangCombatantAI(fang, PLAYER, 0.05, 0);

    expect(result.behavior).toBe('CHASE');
    expect(fang.position.z).toBeLessThan(before);
  });

  it('starts a windup instead of dealing instant damage', () => {
    const fang = createFangCombatant('fang_ai_windup');
    fang.position.z = 1.5;

    const result = updateFangCombatantAI(fang, PLAYER, 0.016, 0);

    expect(result.behavior).toBe('WINDUP');
    expect(result.attackResolved).toBe(false);
    expect(result.attackDamage).toBe(0);
    expect(fang.attackWindupTimer).toBeGreaterThan(0);
  });

  it('resolves one attack after windup while the player remains in range', () => {
    const fang = createFangCombatant('fang_ai_attack');
    fang.position.z = 1.5;

    updateFangCombatantAI(fang, PLAYER, 0.016, 0);

    let resolved = false;
    let damage = 0;
    let time = 0.016;
    for (let i = 0; i < 20; i += 1) {
      time += 0.05;
      const result = updateFangCombatantAI(fang, PLAYER, 0.05, time);
      if (result.attackResolved) {
        resolved = true;
        damage = result.attackDamage;
        break;
      }
    }

    expect(resolved).toBe(true);
    expect(damage).toBe(FANG_COMBATANT_CONFIG.attackDamage);
    expect(fang.lastAttackTime).toBeGreaterThanOrEqual(0);
  });

  it('cannot immediately start another attack during cooldown', () => {
    const fang = createFangCombatant('fang_ai_cooldown');
    fang.position.z = 1.5;

    updateFangCombatantAI(fang, PLAYER, 0.016, 0);
    let time = 0.016;
    for (let i = 0; i < 20 && fang.lastAttackTime === -Infinity; i += 1) {
      time += 0.05;
      updateFangCombatantAI(fang, PLAYER, 0.05, time);
    }

    const result = updateFangCombatantAI(fang, PLAYER, 0.05, time + 0.1);

    expect(result.attackResolved).toBe(false);
    expect(fang.attackWindupTimer).toBe(0);
    expect(result.behavior).toBe('RECOVERY');
  });

  it('whiffs if the player leaves attack range during windup', () => {
    const fang = createFangCombatant('fang_ai_whiff');
    fang.position.z = 1.5;

    updateFangCombatantAI(fang, PLAYER, 0.016, 0);

    const farPlayer = { x: 0, y: 0, z: -10 };
    let result = updateFangCombatantAI(fang, farPlayer, 0.05, 0.05);
    for (let i = 0; i < 20 && fang.attackWindupTimer > 0; i += 1) {
      result = updateFangCombatantAI(fang, farPlayer, 0.05, 0.1 + i * 0.05);
    }

    expect(result.attackResolved).toBe(false);
    expect(result.attackDamage).toBe(0);
    expect(fang.lastAttackTime).toBeGreaterThanOrEqual(0);
  });

  it('stagger cancels a pending windup', () => {
    const fang = createFangCombatant('fang_ai_stagger');
    fang.position.z = 1.5;

    updateFangCombatantAI(fang, PLAYER, 0.016, 0);
    expect(fang.attackWindupTimer).toBeGreaterThan(0);

    damageFangCombatant(fang, FANG_COMBATANT_CONFIG.staggerThreshold, 0.02);
    const result = updateFangCombatantAI(fang, PLAYER, 0.05, 0.07);

    expect(result.behavior).toBe('STAGGER');
    expect(fang.attackWindupTimer).toBe(0);
    expect(result.attackResolved).toBe(false);
  });

  it('dead combatants never move or attack', () => {
    const fang = createFangCombatant('fang_ai_dead');
    fang.position.z = 5;
    damageFangCombatant(fang, 999, 0);
    const before = { ...fang.position };

    const result = updateFangCombatantAI(fang, PLAYER, 0.05, 1);

    expect(result.behavior).toBe('DEAD');
    expect(result.attackResolved).toBe(false);
    expect(fang.position).toEqual(before);
  });

  it('applies and damps external knockback', () => {
    const fang = createFangCombatant('fang_ai_knockback');
    fang.position.z = 8;
    applyFangKnockback(fang, { x: 4, y: 0, z: 0 });

    const beforeX = fang.position.x;
    const beforeVelocity = fang.velocity.x;
    updateFangCombatantAI(fang, { x: 0, y: 0, z: 8 }, 0.05, 0);

    expect(fang.position.x).toBeGreaterThan(beforeX);
    expect(fang.velocity.x).toBeGreaterThan(0);
    expect(fang.velocity.x).toBeLessThan(beforeVelocity);
  });
});
