import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { DisplacementController } from './DisplacementSystem';
import { StormAirSystem } from './StormAirSystem';

function traversalInput(overrides: Partial<{
  traversal: boolean;
  moveX: number;
  moveY: number;
  aiming: THREE.Vector3;
}> = {}) {
  return {
    traversal: false,
    moveX: 0,
    moveY: 0,
    aiming: new THREE.Vector3(0, 0, 1),
    ...overrides,
  };
}

function addWall(scene: THREE.Scene, x: number, width = 0.1) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, 4, 4),
    new THREE.MeshBasicMaterial()
  );
  wall.position.set(x, 0, 0);
  wall.userData.isWall = true;
  wall.userData.isCollider = true;
  scene.add(wall);
  scene.updateMatrixWorld(true);
  return wall;
}

describe('DisplacementController', () => {
  let scene: THREE.Scene;
  let controller: DisplacementController;

  beforeEach(() => {
    scene = new THREE.Scene();
    controller = new DisplacementController(scene);
  });

  it('consumes a ground charge when displacement starts', () => {
    const position = new THREE.Vector3();
    const result = controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    expect(result).not.toBeNull();
    expect(controller.isDisplacing()).toBe(true);
    expect(controller.getState().groundCharges).toBe(0);
  });

  it('recharges the ground charge after the cooldown while grounded', () => {
    const position = new THREE.Vector3();
    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    for (let i = 0; i < 35; i++) {
      controller.update(0.016, traversalInput(), position, false);
    }

    const state = controller.getState();
    expect(state.cooldown).toBe(0);
    expect(state.groundCharges).toBe(1);
  });

  it('keeps the air charge spent until landing', () => {
    const position = new THREE.Vector3(0, 5, 0);
    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      true
    );
    expect(controller.getState().airCharges).toBe(0);

    for (let i = 0; i < 15; i++) {
      controller.update(0.016, traversalInput(), position, true);
    }
    expect(controller.getState().airCharges).toBe(0);

    controller.onLanded();
    expect(controller.getState().airCharges).toBe(1);
  });

  it('sweeps the full dash segment and stops before a wall halfway through', () => {
    addWall(scene, 3);
    const position = new THREE.Vector3();

    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    const result = controller.update(0.1, traversalInput(), position, false);
    expect(result).not.toBeNull();
    expect(controller.getState().blocked).toBe(true);
    expect(result!.x).toBeGreaterThan(2);
    expect(result!.x).toBeLessThan(3);
  });

  it('does not tunnel through a very thin wall', () => {
    addWall(scene, 3, 0.01);
    const position = new THREE.Vector3();

    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    const result = controller.update(0.1, traversalInput(), position, false);
    expect(controller.getState().blocked).toBe(true);
    expect(result!.x).toBeLessThan(3);
  });

  it('ignores a wall behind the displacement direction', () => {
    addWall(scene, -3);
    const position = new THREE.Vector3();

    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    const result = controller.update(0.1, traversalInput(), position, false);
    expect(controller.getState().blocked).toBe(false);
    expect(result!.x).toBeGreaterThan(0);
  });

  it('does not block against a wall beyond the authored dash distance', () => {
    addWall(scene, 7);
    const position = new THREE.Vector3();

    controller.update(
      0.016,
      traversalInput({ traversal: true, moveX: 1 }),
      position,
      false
    );

    let lastResult: THREE.Vector3 | null = position;
    for (let i = 0; i < 8; i++) {
      const result = controller.update(0.016, traversalInput(), position, false);
      if (result) lastResult = result;
    }

    expect(controller.getState().blocked).toBe(false);
    expect(lastResult!.x).toBeLessThanOrEqual(6.01);
  });

  it('falls back to a safe forward direction instead of consuming a zero vector', () => {
    const position = new THREE.Vector3();
    controller.update(
      0.016,
      traversalInput({ traversal: true, aiming: new THREE.Vector3() }),
      position,
      false
    );

    const result = controller.update(0.05, traversalInput(), position, false);
    expect(result).not.toBeNull();
    expect(result!.z).toBeGreaterThan(0);
  });

  it('returns cloned velocity/state data so callers cannot mutate internal state', () => {
    const first = controller.getState();
    first.lastDisplacementVelocity.set(99, 99, 99);
    expect(controller.getState().lastDisplacementVelocity.length()).toBe(0);
  });
});

describe('StormAirSystem', () => {
  let system: StormAirSystem;

  beforeEach(() => {
    system = new StormAirSystem();
  });

  it('accelerates toward bounded horizontal air speed', () => {
    let velocity = new THREE.Vector3();
    for (let i = 0; i < 120; i++) {
      velocity = system.updateAirControl(
        1 / 60,
        { moveX: 1, moveY: 0, jump: false, traversal: false },
        velocity,
        true
      );
    }

    expect(velocity.x).toBeGreaterThan(0);
    expect(Math.hypot(velocity.x, velocity.z)).toBeLessThanOrEqual(6.001);
  });

  it('uses one terminal velocity and never accelerates downward without bound', () => {
    let velocity = new THREE.Vector3();
    for (let i = 0; i < 240; i++) {
      velocity = system.updateAirControl(
        1 / 60,
        { moveX: 0, moveY: 0, jump: false, traversal: false },
        velocity,
        true
      );
    }

    expect(velocity.y).toBeCloseTo(-12, 4);
  });

  it('hover reduces downward speed compared with ordinary falling', () => {
    const normal = new StormAirSystem();
    const hover = new StormAirSystem();
    const initial = new THREE.Vector3(0, -5, 0);

    const normalVelocity = normal.updateAirControl(
      0.1,
      { moveX: 0, moveY: 0, jump: false, traversal: false },
      initial,
      true
    );
    const hoverVelocity = hover.updateAirControl(
      0.1,
      { moveX: 0, moveY: 0, jump: true, traversal: false },
      initial,
      true
    );

    expect(hover.isHoveringNow()).toBe(true);
    expect(hoverVelocity.y).toBeGreaterThan(normalVelocity.y);
  });

  it('produces the same terminal fall result at 30 and 60 FPS', () => {
    const simulate = (step: number, frames: number) => {
      const sim = new StormAirSystem();
      let velocity = new THREE.Vector3();
      for (let i = 0; i < frames; i++) {
        velocity = sim.updateAirControl(
          step,
          { moveX: 0, moveY: 0, jump: false, traversal: false },
          velocity,
          true
        );
      }
      return velocity.y;
    };

    expect(simulate(1 / 30, 30)).toBeCloseTo(simulate(1 / 60, 60), 4);
  });

  it('calculates bounded pressure falloff away from the origin', () => {
    const pressure = system.calculatePressure(
      'heavy',
      new THREE.Vector3(),
      new THREE.Vector3(1, 0, 0)
    );
    const near = system.applyPressureForce(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(),
      pressure
    );
    const far = system.applyPressureForce(
      new THREE.Vector3(3, 0, 0),
      new THREE.Vector3(),
      pressure
    );

    expect(near).not.toBeNull();
    expect(far).not.toBeNull();
    expect(near!.length()).toBeGreaterThan(far!.length());
    expect(near!.length()).toBeLessThanOrEqual(pressure.intensity);
  });

  it('returns null for zero-distance and out-of-range pressure targets', () => {
    const pressure = system.calculatePressure(
      'light',
      new THREE.Vector3(),
      new THREE.Vector3(1, 0, 0)
    );

    expect(system.applyPressureForce(
      new THREE.Vector3(),
      new THREE.Vector3(),
      pressure
    )).toBeNull();
    expect(system.applyPressureForce(
      new THREE.Vector3(100, 0, 0),
      new THREE.Vector3(),
      pressure
    )).toBeNull();
  });
});
