import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createSemanticTailSockets } from './GLBCharacterLoader';

describe('Kai-Jax semantic tail sockets', () => {
  it('creates exactly nine deterministic gameplay sockets when the source rig has none', () => {
    const hips = new THREE.Object3D();
    hips.name = 'Hips';

    const result = createSemanticTailSockets(hips);

    expect(result.created).toBe(9);
    expect(result.tails).toHaveLength(9);
    expect(hips.children).toHaveLength(9);

    result.tails.forEach((tail, index) => {
      expect(tail).not.toBeNull();
      expect(tail?.name).toBe(`semantic_tail_${String(index + 1).padStart(2, '0')}`);
      expect(tail?.userData.semanticSocket).toBe(true);
      expect(tail?.userData.canonicalSocket).toBe(`tail_${String(index + 1).padStart(2, '0')}`);
      expect(tail?.parent).toBe(hips);
    });
  });

  it('preserves native tail nodes and only fills missing attachment slots', () => {
    const hips = new THREE.Object3D();
    const nativeTail = new THREE.Bone();
    nativeTail.name = 'tail_01';
    hips.add(nativeTail);

    const existing = Array.from<THREE.Object3D | null>({ length: 9 }).fill(null);
    existing[0] = nativeTail;

    const result = createSemanticTailSockets(hips, existing);

    expect(result.created).toBe(8);
    expect(result.tails[0]).toBe(nativeTail);
    expect(result.tails.slice(1).every((tail) => tail?.userData.semanticSocket === true)).toBe(true);
  });

  it('inherits animated parent transforms so socket-authored hitboxes can follow the body', () => {
    const scene = new THREE.Scene();
    const hips = new THREE.Object3D();
    hips.position.set(3, 2, 1);
    scene.add(hips);

    const { tails } = createSemanticTailSockets(hips);
    const center = tails[4];
    expect(center).not.toBeNull();

    scene.updateMatrixWorld(true);
    const before = new THREE.Vector3();
    center?.getWorldPosition(before);

    hips.position.x += 5;
    hips.position.y += 1;
    scene.updateMatrixWorld(true);
    const after = new THREE.Vector3();
    center?.getWorldPosition(after);

    expect(after.x - before.x).toBeCloseTo(5, 6);
    expect(after.y - before.y).toBeCloseTo(1, 6);
  });
});
