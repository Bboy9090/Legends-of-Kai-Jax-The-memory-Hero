import assert from 'node:assert/strict';
import test from 'node:test';
import { withEarlyWebGL2ContextCapture } from '../../src/game/engine/EarlyWebGLContextCapture';

test('captures WebGL2 before renderer initialization and restores getContext afterward', () => {
  const fakeGl = { getError: () => 0 };
  class FakeCanvas {
    getContext(id: string) { return id === 'webgl2' ? fakeGl : null; }
  }
  const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLCanvasElement');
  const originalMethod = FakeCanvas.prototype.getContext;
  Object.defineProperty(globalThis, 'HTMLCanvasElement', { configurable: true, value: FakeCanvas });
  try {
    let captured = 0;
    const result = withEarlyWebGL2ContextCapture(
      () => {
        const gl = new FakeCanvas().getContext('webgl2');
        assert.equal(captured, 1, 'Hook must run during, not after, renderer construction');
        return gl;
      },
      (gl) => { assert.equal(gl, fakeGl); captured++; },
    );
    assert.equal(result, fakeGl);
    assert.equal(captured, 1);
    assert.equal(FakeCanvas.prototype.getContext, originalMethod);
  } finally {
    if (globalDescriptor) Object.defineProperty(globalThis, 'HTMLCanvasElement', globalDescriptor);
    else Reflect.deleteProperty(globalThis, 'HTMLCanvasElement');
  }
});

test('always restores the canvas method even if engine construction throws', () => {
  class FakeCanvas {
    getContext(_id: string) { return null; }
  }
  const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLCanvasElement');
  const originalMethod = FakeCanvas.prototype.getContext;
  Object.defineProperty(globalThis, 'HTMLCanvasElement', { configurable: true, value: FakeCanvas });
  try {
    assert.throws(
      () => withEarlyWebGL2ContextCapture(() => { throw Error('intentional startup failure'); }, () => {}),
      /intentional startup failure/,
    );
    assert.equal(FakeCanvas.prototype.getContext, originalMethod);
  } finally {
    if (globalDescriptor) Object.defineProperty(globalThis, 'HTMLCanvasElement', globalDescriptor);
    else Reflect.deleteProperty(globalThis, 'HTMLCanvasElement');
  }
});

test('non-WebGL requests are never intercepted', () => {
  class FakeCanvas {
    getContext(id: string) { return id === '2d' ? { context2d: true } : null; }
  }
  const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLCanvasElement');
  Object.defineProperty(globalThis, 'HTMLCanvasElement', { configurable: true, value: FakeCanvas });
  try {
    let captured = 0;
    withEarlyWebGL2ContextCapture(() => new FakeCanvas().getContext('2d'), () => { captured++; });
    assert.equal(captured, 0);
  } finally {
    if (globalDescriptor) Object.defineProperty(globalThis, 'HTMLCanvasElement', globalDescriptor);
    else Reflect.deleteProperty(globalThis, 'HTMLCanvasElement');
  }
});
