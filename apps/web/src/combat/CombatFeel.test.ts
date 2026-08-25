import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { MovePlayer } from './MovePlayer';
import { Hurtbox } from './Hurtbox';
import type { MoveSpec } from '../types/MoveSpec';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

function rig(hurtX = 2) {
  const scene = new THREE.Scene();
  const hurtbox = new Hurtbox(scene, 0.8, 1.6);
  hurtbox.setPosition(hurtX, 0.8, 0);
  hurtbox.mesh.updateMatrixWorld(true);
  const player = new MovePlayer(scene, hurtbox, new THREE.Vector3(0, 0.9, 0));
  return { player, hurtbox };
}

function swing(overrides: Partial<MoveSpec> = {}): MoveSpec {
  return {
    id: 'combat_feel_swing',
    startup: 1,
    active: 4,
    recovery: 2,
    shield_damage: 5,
    di_resist: 0.2,
    hitstopOnHit: 0,
    hitstopOnBlock: 0,
    hits: [{
      startF: 1,
      endF: 4,
      offX: 2,
      offY: 1.2,
      halfW: 1.2,
      halfH: 0.6,
      kbX: 2,
      kbY: 0.5,
      dmg: 10,
      usedOnce: false,
      isGrab: false,
    }],
    ...overrides,
  };
}

describe('combat feel layer', () => {
  it('connects an authored hit only once even when overlap lasts multiple active frames', () => {
    const { player, hurtbox } = rig();
    const onHit = vi.fn();
    player.setCallbacks({ onHit });
    player.startMove(swing());
    for (let i = 0; i < 5; i++) player.update();
    expect(onHit).toHaveBeenCalledTimes(1);
    expect(hurtbox.getHealth()).toBe(90);
  });

  it('builds combo count and damage across separate move executions', () => {
    const { player } = rig();
    player.startMove(swing());
    for (let i = 0; i < 8; i++) player.update();
    player.hurtbox.setPosition(2, 0.8, 0);
    player.hurtbox.mesh.updateMatrixWorld(true);
    player.startMove(swing());
    for (let i = 0; i < 2; i++) player.update();
    expect(player.getComboState().count).toBe(2);
    expect(player.getComboState().damage).toBe(20);
  });

  it('grants dodge invulnerability and lets attacks whiff through it', () => {
    const { player, hurtbox } = rig();
    expect(player.startDodge(6)).toBe(true);
    player.startMove(swing());
    for (let i = 0; i < 4; i++) player.update();
    expect(hurtbox.getHealth()).toBe(100);
  });

  it('applies hitstun after a clean hit', () => {
    const { player } = rig();
    player.startMove(swing());
    player.update();
    expect(player.isInHitstun()).toBe(true);
    expect(player.hitstunFrames).toBeGreaterThanOrEqual(6);
  });

  it('directional influence changes horizontal launch while respecting resistance', () => {
    const neutral = rig();
    neutral.player.startMove(swing());
    neutral.player.update();
    const neutralX = neutral.hurtbox.mesh.position.x;

    const influenced = rig();
    influenced.player.setDirectionalInfluence(-1);
    influenced.player.startMove(swing());
    influenced.player.update();
    const influencedX = influenced.hurtbox.mesh.position.x;

    expect(influencedX).toBeLessThan(neutralX);
  });
});
