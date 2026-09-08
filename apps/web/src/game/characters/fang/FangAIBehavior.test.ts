/**
 * Fang AI Behavior Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
  createFangAIState,
  updateFangAI,
  calculateFangMovementDirection,
  type FangAction,
} from './FangAIBehavior';
import { createFangCombatant } from './FangCombatantContract';

describe('FangAIBehavior', () => {
  let fangState: ReturnType<typeof createFangCombatant>;
  let aiState: ReturnType<typeof createFangAIState>;
  let playerPos: THREE.Vector3;

  beforeEach(() => {
    fangState = createFangCombatant('fang_01');
    aiState = createFangAIState();
    playerPos = new THREE.Vector3(0, 0.5, 10); // Far away initially
  });

  describe('AI State Creation', () => {
    it('initializes with idle action', () => {
      expect(aiState.action).toBe('idle');
    });

    it('has no target initially', () => {
      expect(aiState.targetPos).toBeNull();
    });
  });

  describe('Action Selection', () => {
    it('idles when player is out of range (>15 units)', () => {
      playerPos.z = 20;
      const action = updateFangAI(fangState, aiState, playerPos, 0);
      expect(action).toBe('idle');
    });

    it('pursues when player is in range but too far to attack (<15, >2.5)', () => {
      playerPos.z = 8; // Distance ~6 units
      const action = updateFangAI(fangState, aiState, playerPos, 0);
      expect(action).toBe('pursue');
      expect(aiState.targetPos).not.toBeNull();
    });

    it('staggered action overrides other decisions', () => {
      fangState.isStaggered = true;
      playerPos.z = 2;
      const action = updateFangAI(fangState, aiState, playerPos, 0);
      expect(action).toBe('staggered');
    });

    it('dead action overrides all other decisions', () => {
      fangState.isDead = true;
      playerPos.z = 2;
      const action = updateFangAI(fangState, aiState, playerPos, 0);
      expect(action).toBe('dead');
    });
  });

  describe('Decision Interval', () => {
    it('respects decision interval (0.3s)', () => {
      playerPos.z = 5;
      const action1 = updateFangAI(fangState, aiState, playerPos, 0);
      expect(action1).toBe('pursue');

      // Change player position
      playerPos.z = 20;

      // Immediate update should not reconsider (still pursues)
      const action2 = updateFangAI(fangState, aiState, playerPos, 0.1);
      expect(action2).toBe('pursue');

      // After interval passes, should update
      const action3 = updateFangAI(fangState, aiState, playerPos, 0.35);
      expect(action3).toBe('idle');
    });
  });

  describe('Attack Range', () => {
    it('can attack when player is within 2.5 units', () => {
      playerPos.set(0, 0.5, 2.3); // 2.3 units away
      let attackOccurred = false;
      for (let i = 0; i < 20; i++) {
        const action = updateFangAI(fangState, aiState, playerPos, i * 0.4);
        if (action === 'attack') {
          attackOccurred = true;
          break;
        }
      }
      // Attack should occur with 50-80% probability
      expect(attackOccurred).toBe(true);
    });
  });

  describe('Health-Based Behavior', () => {
    it('increases attack frequency at low health', () => {
      playerPos.z = 2.3;
      let attacks = 0;
      const trials = 20;

      // High health: count attacks
      for (let i = 0; i < trials; i++) {
        const action = updateFangAI(fangState, aiState, playerPos, i * 0.4);
        if (action === 'attack') attacks++;
      }
      const highHealthAttacks = attacks;

      // Reset
      fangState.health = 20; // 20% health
      aiState.lastDecisionTime = -Infinity;
      attacks = 0;

      // Low health: count attacks
      for (let i = 0; i < trials; i++) {
        const action = updateFangAI(fangState, aiState, playerPos, 100 + i * 0.4);
        if (action === 'attack') attacks++;
      }
      const lowHealthAttacks = attacks;

      // Low health should attack more often
      expect(lowHealthAttacks).toBeGreaterThan(highHealthAttacks);
    });
  });

  describe('Movement Direction', () => {
    it('pursues directly toward player', () => {
      const fangPos = new THREE.Vector3(0, 0.5, 0);
      playerPos = new THREE.Vector3(5, 0.5, 0);
      const direction = calculateFangMovementDirection(fangPos, playerPos, 'pursue');
      expect(direction.x).toBeGreaterThan(0.7); // Mostly toward player
      expect(Math.abs(direction.y)).toBeLessThan(0.1); // Minimal vertical
    });

    it('slows down during attack', () => {
      const fangPos = new THREE.Vector3(0, 0.5, 0);
      playerPos = new THREE.Vector3(5, 0.5, 0);
      const pursueDir = calculateFangMovementDirection(fangPos, playerPos, 'pursue');
      const attackDir = calculateFangMovementDirection(fangPos, playerPos, 'attack');
      expect(attackDir.length()).toBeLessThan(pursueDir.length());
    });

    it('stops during idle', () => {
      const fangPos = new THREE.Vector3(0, 0.5, 0);
      playerPos = new THREE.Vector3(5, 0.5, 0);
      const direction = calculateFangMovementDirection(fangPos, playerPos, 'idle');
      expect(direction.length()).toBeLessThan(0.01);
    });
  });
});
