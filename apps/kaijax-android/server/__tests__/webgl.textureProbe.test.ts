import test from 'node:test';
import assert from 'node:assert/strict';
import { installWebGLTextureProbe } from '../../src/game/engine/WebGLTextureProbe';

function fakeGl() {
  let nextError = 0;
  const operations: string[] = [];
  const gl = {
    NO_ERROR: 0,
    getError() { const current = nextError; nextError = 0; return current; },
    bindTexture(_target: number) { operations.push('bindTexture'); },
    texImage2D(_target: number, _level: number, _internalFormat: number,
      _width: number, _height: number, _border: number, _format: number,
      _type: number, _pixels: Uint8Array | null) { operations.push('texImage2D'); },
    generateMipmap(_target: number) { operations.push('generateMipmap'); },
  };
  return {
    gl,
    operations,
    injectError(error: number) { nextError = error; },
  };
}

test('opt-in WebGL probe logs bounded metadata without image pixels', () => {
  const { gl, injectError, operations } = fakeGl();
  const original = gl.texImage2D;
  const observed: number[] = [];
  const probe = installWebGLTextureProbe(gl, (event) => observed.push(event.errorCode));
  gl.bindTexture(3553);
  injectError(1281);
  gl.texImage2D(3553, 0, 6408, 128, 64, 0, 6408, 5121, new Uint8Array(16));
  gl.generateMipmap(3553);
  const result = probe.snapshot();
  assert.deepEqual(operations, ['bindTexture', 'texImage2D', 'generateMipmap']);
  assert.equal(result.operationsObserved, 3);
  assert.equal(result.errorsObserved, 1);
  assert.deepEqual(observed, [1281]);
  assert.equal(result.anomalies[0].afterOperation.operation, 'texImage2D');
  assert.equal(result.anomalies[0].afterOperation.width, 128);
  assert.equal(result.anomalies[0].afterOperation.height, 64);
  assert.ok(!JSON.stringify(result).includes('Uint8Array'));
  probe.uninstall();
  assert.equal(gl.texImage2D, original, 'Uninstall must restore original WebGL method');
  probe.uninstall(); // idempotent
});

test('probe can inspect native source dimension metadata without source bytes', () => {
  const { gl, injectError } = fakeGl();
  const probe = installWebGLTextureProbe(gl);
  // Type-only cast models the six-parameter ImageSource overload.
  injectError(1282);
  (gl.texImage2D as (...args: unknown[]) => void)(3553, 0, 6408, 6408, 5121,
    { width: 256, height: 128, constructor: { name: 'HTMLCanvasElement' } });
  const operation = probe.snapshot().anomalies[0].afterOperation;
  assert.equal(operation.width, 256);
  assert.equal(operation.height, 128);
  assert.equal(operation.sourceType, 'HTMLCanvasElement');
  probe.uninstall();
});

test('probe never claims an error was caused by the immediately preceding operation', () => {
  const { gl, injectError } = fakeGl();
  const probe = installWebGLTextureProbe(gl);
  gl.bindTexture(3553);
  injectError(1281); // intentionally injected before mipmap call
  gl.generateMipmap(3553);
  const event = probe.snapshot().anomalies[0];
  assert.equal(event.afterOperation.operation, 'generateMipmap');
  assert.equal(event.precedingOperations[0].operation, 'bindTexture');
  probe.uninstall();
});
