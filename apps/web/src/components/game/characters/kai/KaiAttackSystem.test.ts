import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { KaiAttackSystem } from './KaiAttackSystem';

function createTarget(scene: THREE.Scene, id: string, position: THREE.Vector3) {
  const target = new THREE.Group();
  target.position.copy(position);
  target.userData.combatTarget = true;
  target.userData.targetId = id;
  target.userData.health = 100;
  scene.add(target);
  return target;
}

describe('KaiAttackSystem', () => {
  let scene: THREE.Scene;
  let system: KaiAttackSystem;

  beforeEach(() => {
    scene = new THREE.Scene();
    system = new KaiAttackSystem(scene);
  });

  it('tracks startup, active, recovery and expiration deterministically', () => {
    system.startAttack(
      'light',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      10
    );

    expect(system.getPhase(10.01)).toBe('STARTUP');
    expect(system.getPhase(10.1)).toBe('ACTIVE');
    expect(system.getPhase(10.25)).toBe('RECOVERY');
    expect(system.update(10.41, new THREE.Vector3())).toBeNull();
    expect(system.getPhase(10.41)).toBe('IDLE');
  });

  it('allows one real scene target hit per accepted attack', () => {
    const target = createTarget(scene, 'fang', new THREE.Vector3(0, 0, 1));
    let hits = 0;

    system.startAttack('heavy', new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0);
    system.processActiveHitboxes(0.2, (_object, damage) => {
      target.userData.health -= damage;
      hits += 1;
    });
    system.processActiveHitboxes(0.25, () => { hits += 1; });

    expect(hits).toBe(1);
    expect(target.userData.health).toBe(65);
  });

  it('preserves a heavy hit when a slow render frame crosses the active window', () => {
    createTarget(scene, 'slow-frame-fang', new THREE.Vector3(0, 0, 1));
    const damages: number[] = [];

    system.startAttack('heavy', new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0);

    // Heavy is ACTIVE from 0.15s through 0.35s and expires at 0.75s.
    // A sparse software-WebGL frame arriving after expiration still receives one
    // final deterministic sample for the crossed ACTIVE window.
    expect(system.update(0.8, new THREE.Vector3())).toBeNull();
    system.processActiveHitboxes(0.8, (_target, damage) => damages.push(damage));
    system.processActiveHitboxes(0.9, (_target, damage) => damages.push(damage));

    expect(damages).toEqual([35]);
  });

  it('uses planar range so an elevated Fang mesh center does not erase a ground hit', () => {
    createTarget(scene, 'raised-fang', new THREE.Vector3(0.5, 1.2, 0.5));
    const hits: string[] = [];

    system.startAttack('heavy', new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0);
    system.processActiveHitboxes(0.2, (target) => {
      hits.push(String(target.userData.targetId));
    });

    expect(hits).toEqual(['raised-fang']);
  });

  it('keeps light combo damage progression inside the same hitbox authority', () => {
    const first = system.startAttack(
      'light',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0,
      0
    );
    const second = system.startAttack(
      'light',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      1,
      1
    );
    const third = system.startAttack(
      'light',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      2,
      2
    );

    expect([first.damage, second.damage, third.damage]).toEqual([12, 14, 16]);
  });

  it('ignores non-combat scene geometry', () => {
    const scenery = new THREE.Group();
    scenery.position.set(0, 0, 0.5);
    scene.add(scenery);
    const hits: THREE.Object3D[] = [];

    system.startAttack('ultimate', new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0);
    system.processActiveHitboxes(0.6, (target) => hits.push(target));

    expect(hits).toEqual([]);
  });
});
