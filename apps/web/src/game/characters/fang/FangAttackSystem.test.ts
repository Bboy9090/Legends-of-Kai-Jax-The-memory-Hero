/**
 * Fang Attack System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { FangAttackSystem, chooseRandomFangAttack, FANG_ATTACK_CONFIG } from './FangAttackSystem';

describe('FangAttackSystem', () => {
  let attackSystem: FangAttackSystem;
  let fangPos: THREE.Vector3;
  let direction: THREE.Vector3;

  beforeEach(() => {
    attackSystem = new FangAttackSystem();
    fangPos = new THREE.Vector3(0, 0.5, 0);
    direction = new THREE.Vector3(1, 0, 0);
  });

  describe('Attack Lifecycle', () => {
    it('starts with no active attack', () => {
      expect(attackSystem.getCurrentAttack(0)).toBeNull();
      expect(attackSystem.isAttackActive(0)).toBe(false);
    });

    it('starts a strike attack', () => {
      attackSystem.startAttack('fang_strike', fangPos, direction, 0);
      const attack = attackSystem.getCurrentAttack(0);
      expect(attack).not.toBeNull();
      expect(attack?.type).toBe('fang_strike');
      expect(attack?.damage).toBe(10);
    });

    it('starts a grab attack', () => {
      attackSystem.startAttack('fang_grab', fangPos, direction, 0);
      const attack = attackSystem.getCurrentAttack(0);
      expect(attack?.type).toBe('fang_grab');
      expect(attack?.damage).toBe(15);
    });
  });

  describe('Attack Active Window', () => {
    it('activates during active window for strike (0.08-0.28)', () => {
      attackSystem.startAttack('fang_strike', fangPos, direction, 0);
      expect(attackSystem.isAttackActive(0.05)).toBe(false); // Before active
      expect(attackSystem.isAttackActive(0.15)).toBe(true);   // During active
      expect(attackSystem.isAttackActive(0.35)).toBe(false);  // After active
    });

    it('activates during active window for grab (0.12-0.4)', () => {
      attackSystem.startAttack('fang_grab', fangPos, direction, 0);
      expect(attackSystem.isAttackActive(0.1)).toBe(false);   // Before active
      expect(attackSystem.isAttackActive(0.25)).toBe(true);   // During active
      expect(attackSystem.isAttackActive(0.5)).toBe(false);   // After active
    });
  });

  describe('Attack Duration', () => {
    it('strike duration is 0.4s', () => {
      attackSystem.startAttack('fang_strike', fangPos, direction, 0);
      expect(attackSystem.getCurrentAttack(0.2)).not.toBeNull();
      expect(attackSystem.getCurrentAttack(0.41)).toBeNull();
    });

    it('grab duration is 0.6s', () => {
      attackSystem.startAttack('fang_grab', fangPos, direction, 0);
      expect(attackSystem.getCurrentAttack(0.3)).not.toBeNull();
      expect(attackSystem.getCurrentAttack(0.61)).toBeNull();
    });
  });

  describe('Hit Tracking', () => {
    it('allows hit against new target', () => {
      expect(attackSystem.canHitTarget('player')).toBe(true);
    });

    it('prevents duplicate hits on same target', () => {
      expect(attackSystem.canHitTarget('player')).toBe(true);
      attackSystem.registerHit('player');
      expect(attackSystem.canHitTarget('player')).toBe(false);
    });

    it('allows hits on different targets', () => {
      attackSystem.registerHit('player1');
      expect(attackSystem.canHitTarget('player2')).toBe(true);
    });

    it('clears hit targets on reset', () => {
      attackSystem.registerHit('player');
      attackSystem.reset();
      expect(attackSystem.canHitTarget('player')).toBe(true);
    });
  });

  describe('Attack Properties', () => {
    it('strike has correct damage and knockback', () => {
      const config = FANG_ATTACK_CONFIG.fang_strike;
      expect(config.damage).toBe(10);
      expect(config.knockback).toBe(4.0);
      expect(config.radius).toBe(1.8);
    });

    it('grab has more damage and knockback than strike', () => {
      const strike = FANG_ATTACK_CONFIG.fang_strike;
      const grab = FANG_ATTACK_CONFIG.fang_grab;
      expect(grab.damage).toBeGreaterThan(strike.damage);
      expect(grab.knockback).toBeGreaterThan(strike.knockback);
      expect(grab.radius).toBeGreaterThan(strike.radius);
    });
  });

  describe('Attack Direction', () => {
    it('normalizes attack direction', () => {
      const unnormalized = new THREE.Vector3(3, 0, 4); // Not normalized
      attackSystem.startAttack('fang_strike', fangPos, unnormalized, 0);
      const attack = attackSystem.getCurrentAttack(0);
      const length = attack!.direction.length();
      expect(length).toBeCloseTo(1, 5);
    });
  });

  describe('Random Attack Selection', () => {
    it('chooses valid attack types', () => {
      for (let i = 0; i < 20; i++) {
        const type = chooseRandomFangAttack();
        expect(['fang_strike', 'fang_grab']).toContain(type);
      }
    });
  });
});
