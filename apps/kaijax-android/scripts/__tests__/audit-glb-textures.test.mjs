import test from 'node:test';
import assert from 'node:assert/strict';
import { imageSize, analyzeGlb } from '../audit-glb-textures.mjs';

const png = Buffer.alloc(32);
Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
png.writeUInt32BE(2048, 16);
png.writeUInt32BE(1024, 20);

function makeGlb(image, overrideView) {
  const doc = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: image.length }],
    bufferViews: [overrideView || { buffer: 0, byteOffset: 0, byteLength: image.length }],
    images: [{ bufferView: 0, mimeType: 'image/png' }],
  };
  const jsonText = Buffer.from(JSON.stringify(doc));
  const jsonChunk = Buffer.alloc(Math.ceil(jsonText.length / 4) * 4, 32);
  jsonText.copy(jsonChunk);
  const binChunk = Buffer.alloc(Math.ceil(image.length / 4) * 4);
  image.copy(binChunk);
  const size = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
  const glb = Buffer.alloc(size);
  glb.writeUInt32LE(0x46546c67, 0);
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(size, 8);
  glb.writeUInt32LE(jsonChunk.length, 12);
  glb.writeUInt32LE(0x4e4f534a, 16);
  jsonChunk.copy(glb, 20);
  const off = 20 + jsonChunk.length;
  glb.writeUInt32LE(binChunk.length, off);
  glb.writeUInt32LE(0x004e4942, off + 4);
  binChunk.copy(glb, off + 8);
  return glb;
}

test('reads embedded PNG image dimensions without decoding the image', () => {
  const report = analyzeGlb(makeGlb(png), 'fixture.glb');
  assert.deepEqual(report.issues, []);
  assert.equal(report.images.length, 1);
  assert.equal(report.images[0].width, 2048);
  assert.equal(report.images[0].height, 1024);
});

test('detects invalid embedded bufferView offsets', () => {
  const report = analyzeGlb(makeGlb(png, { buffer: 0, byteOffset: 9999, byteLength: 32 }));
  assert.match(report.issues.join(', '), /invalid BIN bufferView/);
});

test('detects invalid or truncated GLB header', () => {
  assert.match(analyzeGlb(Buffer.from('not a glb')).issues[0], /Not a glTF/);
  const glb = makeGlb(png);
  glb.writeUInt32LE(900000, 8);
  assert.match(analyzeGlb(glb).issues[0], /length/);
});

test('detects image dimensions that are zero', () => {
  const invalid = Buffer.from(png);
  invalid.writeUInt32BE(0, 16);
  const report = analyzeGlb(makeGlb(invalid));
  assert.match(report.issues[0], /zero width or height/);
});

test('does not falsely reject unknown formats as malformed', () => {
  const report = imageSize(Buffer.from([1,2,3,4]), 'image/custom');
  assert.equal(report.format, 'image/custom');
  assert.equal(report.width, null);
});
