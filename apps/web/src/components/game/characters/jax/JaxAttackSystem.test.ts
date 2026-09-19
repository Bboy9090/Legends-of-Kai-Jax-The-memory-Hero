import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { JaxAttackSystem } from './JaxAttackSystem';

function createTarget(
  scene: THREE.Scene,
  id: string,
  position: THREE.Vector3,
  options: { lightning?: boolean } = {}
) {
  const target = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial()
  );
  target.position.copy(position);
  target.userData.combatTarget = true;
  target.userData.targetId = id;
  target.userData.isLightningTarget = Boolean(options.lightning);
  scene.add(target);
  return target;
}

describe('JaxAttackSystem', () => {
  let scene: THREE.Scene;
  let system: JaxAttackSystem;

  beforeEach(() => {
    scene = new THREE.Scene();
    system = new JaxAttackSystem(scene);
  });

  it('tracks startup, active, recovery and expiration deterministically', () => {
    system.startAttack(
      'jax_light_combo',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      10
    );

    expect(system.getPhase(10.01)).toBe('STARTUP');
    expect(system.getPhase(10.1)).toBe('ACTIVE');
    expect(system.getPhase(10.3)).toBe('RECOVERY');
    expect(system.update(10.36, new THREE.Vector3())).toBeNull();
    expect(system.getPhase(10.36)).toBe('IDLE');
  });

  it('allows one hit per target per attack, then allows a new attack to hit again', () => {
    const target = createTarget(scene, 'target', new THREE.Vector3(0, 0, 1));
    let hitCount = 0;

    system.startAttack(
      'jax_light_combo',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.1, () => { hitCount += 1; });
    system.processActiveHitboxes(0.15, () => { hitCount += 1; });
    expect(hitCount).toBe(1);

    system.startAttack(
      'jax_light_combo',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      1
    );
    system.processActiveHitboxes(1.1, () => { hitCount += 1; });
    expect(hitCount).toBe(2);

    scene.remove(target);
  });

  it('preserves a heavy hit when one slow render frame crosses the full active window', () => {
    createTarget(scene, 'slow-frame-heavy-target', new THREE.Vector3(1.2, 0, 0));
    const damages: number[] = [];

    system.startAttack(
      'jax_pressure_heavy',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );

    // The pressure-heavy active window is 0.10s -> 0.35s and the full attack
    // expires at 0.50s. A software-WebGL frame can arrive after all three points.
    // update() should truthfully report the lifecycle as expired while retaining
    // one pending hitbox sample so combat does not become render-FPS dependent.
    expect(system.update(0.6, new THREE.Vector3())).toBeNull();
    system.processActiveHitboxes(0.6, (_target, damage) => {
      damages.push(damage);
    });

    expect(damages).toEqual([15]);
    system.processActiveHitboxes(0.7, (_target, damage) => {
      damages.push(damage);
    });
    expect(damages).toEqual([15]);
  });

  it('rejects a light target behind Jax', () => {
    createTarget(scene, 'behind', new THREE.Vector3(0, 0, -1));
    const hits: string[] = [];

    system.startAttack(
      'jax_light_combo',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.1, (target) => {
      hits.push(String(target.userData.targetId));
    });

    expect(hits).toEqual([]);
  });

  it('uses planar range for a ground target with an elevated mesh center', () => {
    createTarget(scene, 'raised-center', new THREE.Vector3(1.2, 0.75, 0.5));
    const hits: string[] = [];

    system.startAttack(
      'jax_light_combo',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.1, (target) => {
      hits.push(String(target.userData.targetId));
    });

    expect(hits).toEqual(['raised-center']);
  });

  it('heavy attack can hit a nearby general combat target', () => {
    createTarget(scene, 'heavy-target', new THREE.Vector3(1.2, 0, 0));
    const damages: number[] = [];

    system.startAttack(
      'jax_pressure_heavy',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.2, (_target, damage) => {
      damages.push(damage);
    });

    expect(damages).toEqual([15]);
  });

  it('lightning special only hits an explicitly lightning-valid target in the forward cone', () => {
    createTarget(scene, 'valid', new THREE.Vector3(0, 0, 2), { lightning: true });
    createTarget(scene, 'behind', new THREE.Vector3(0, 0, -2), { lightning: true });
    createTarget(scene, 'unflagged', new THREE.Vector3(0, 0, 1));
    createTarget(scene, 'far', new THREE.Vector3(0, 0, 6), { lightning: true });

    const hits: string[] = [];
    system.startAttack(
      'jax_lightning_special',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.2, (target) => {
      hits.push(String(target.userData.targetId));
    });

    expect(hits).toEqual(['valid']);
  });

  it('ultimate can hit multiple combat targets in its MVP area', () => {
    createTarget(scene, 'a', new THREE.Vector3(1, 0, 0));
    createTarget(scene, 'b', new THREE.Vector3(-2, 0, 0));
    createTarget(scene, 'far', new THREE.Vector3(8, 0, 0));

    const hits: string[] = [];
    system.startAttack(
      'jax_storm_ultimate',
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0
    );
    system.processActiveHitboxes(0.3, (target) => {
      hits.push(String(target.userData.targetId));
    });

    expect(hits.sort()).toEqual(['a', 'b']);
  });

  it('returns configured knockback in the authored attack direction', () => {
    system.startAttack(
      'jax_pressure_heavy',
      new THREE.Vector3(),
      new THREE.Vector3(1, 0, 0),
      0
    );

    const knockback = system.getKnockbackForce();
    expect(knockback).not.toBeNull();
    expect(knockback?.x).toBeCloseTo(8, 5);
    expect(knockback?.y).toBeCloseTo(0, 5);
    expect(knockback?.z).toBeCloseTo(0, 5);
  });
});
