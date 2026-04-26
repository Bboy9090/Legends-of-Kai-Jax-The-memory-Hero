/**
 * Sprint 1 Validation — Hurtbox kernel tests
 * Asserts AABB intersection, damage application, and death flag.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as THREE from "three";
import { Hurtbox } from "./Hurtbox";

// Stub setTimeout used inside takeDamage's color flash so jest-style timers don't leak.
beforeEach(() => {
  vi.useFakeTimers();
});

function makeScene() {
  return new THREE.Scene();
}

describe("Hurtbox kernel", () => {
  it("initialises with full health (100/100)", () => {
    const hb = new Hurtbox(makeScene(), 0.8, 1.6);
    expect(hb.getHealth()).toBe(100);
    expect(hb.maxHealth).toBe(100);
    expect(hb.isDead()).toBe(false);
  });

  it("setPosition writes through to mesh", () => {
    const hb = new Hurtbox(makeScene(), 0.8, 1.6);
    hb.setPosition(2, 0.8, -1);
    expect(hb.mesh.position.x).toBe(2);
    expect(hb.mesh.position.y).toBe(0.8);
    expect(hb.mesh.position.z).toBe(-1);
  });

  it("takeDamage subtracts hp and triggers isDead at <= 0", () => {
    const hb = new Hurtbox(makeScene(), 0.8, 1.6);
    hb.takeDamage(40);
    expect(hb.getHealth()).toBe(60);
    expect(hb.isDead()).toBe(false);
    hb.takeDamage(60);
    expect(hb.getHealth()).toBe(0);
    expect(hb.isDead()).toBe(true);
  });

  it("isDead is true even on overkill (negative hp)", () => {
    const hb = new Hurtbox(makeScene(), 0.8, 1.6);
    hb.takeDamage(150);
    expect(hb.getHealth()).toBe(-50);
    expect(hb.isDead()).toBe(true);
  });

  it("AABB Box3 intersection vs an overlapping hitbox returns true", () => {
    const scene = makeScene();
    const hb = new Hurtbox(scene, 0.8, 1.6);
    hb.setPosition(0, 0.8, 0);

    // Force matrix update so Box3.setFromObject reads correct world bounds.
    hb.mesh.updateMatrixWorld(true);

    const hitGeo = new THREE.BoxGeometry(0.6, 0.5, 1);
    const hitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial());
    hitMesh.position.set(0.3, 1.0, 0);
    hitMesh.updateMatrixWorld(true);

    const hitBB = new THREE.Box3().setFromObject(hitMesh);
    const hurtBB = new THREE.Box3().setFromObject(hb.mesh);
    expect(hitBB.intersectsBox(hurtBB)).toBe(true);
  });

  it("AABB Box3 intersection vs a far hitbox returns false", () => {
    const scene = makeScene();
    const hb = new Hurtbox(scene, 0.8, 1.6);
    hb.setPosition(0, 0.8, 0);
    hb.mesh.updateMatrixWorld(true);

    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshBasicMaterial(),
    );
    hitMesh.position.set(10, 0.8, 0);
    hitMesh.updateMatrixWorld(true);

    const hitBB = new THREE.Box3().setFromObject(hitMesh);
    const hurtBB = new THREE.Box3().setFromObject(hb.mesh);
    expect(hitBB.intersectsBox(hurtBB)).toBe(false);
  });
});
