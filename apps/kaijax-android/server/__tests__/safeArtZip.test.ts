import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { decodeSafeArtZip } from '../safeArtZip.js';

const caps = { maxCompressedBytes: 1_000_000, maxExtractedBytes: 200_000, maxEntries: 20 };
type Member = { name: string; data: Buffer; method?: 0 | 8; mode?: number; flags?: number; wrongCrc?: boolean };
const CRC = Uint32Array.from({ length: 256 }, (_, value) => {
  let c = value;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(data: Buffer): number {
  let c = 0xffffffff;
  for (const byte of data) c = CRC[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeZip(entries: Member[]): Buffer {
  const locals: Buffer[] = [], centrals: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name);
    const method = e.method ?? 8;
    const flags = e.flags ?? 0x0800;
    const packed = method === 8 ? deflateRawSync(e.data) : e.data;
    const crc = e.wrongCrc ? 0 : crc32(e.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, packed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(flags, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(e.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((e.mode ?? 0o100644) * 65536, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + packed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

test('valid nested PNG and GLB entries pass size and CRC', () => {
  const zip = makeZip([
    { name: 'sheets/kai_front.png', data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    { name: 'models/jax.glb', data: Buffer.from('glTF'), method: 0 },
    { name: 'docs/readme.txt', data: Buffer.from('skip') },
  ]);
  const got = decodeSafeArtZip(zip, caps);
  assert.deepEqual(got.map(x => x.name), ['sheets/kai_front.png', 'models/jax.glb']);
});

test('Unix symlink is skipped but safe art is imported', () => {
  const got = decodeSafeArtZip(makeZip([
    { name: 'sheets/kai_front.png', data: Buffer.from('image') },
    { name: 'sheets/stolen.png', data: Buffer.from('/private/secret'), mode: 0o120777 },
  ]), caps);
  assert.deepEqual(got.map(x => x.name), ['sheets/kai_front.png']);
});

test('rejects traversal, absolute paths, duplicates, encryption and corrupt CRC', () => {
  for (const name of ['../../secret.png', '/tmp/secret.png', 'C:/escape.png', 'a\\b.png']) {
    assert.throws(() => decodeSafeArtZip(makeZip([{ name, data: Buffer.from('x') }]), caps), /Unsafe ZIP/);
  }
  assert.throws(() => decodeSafeArtZip(makeZip([
    { name: 'Sheets/KAI.PNG', data: Buffer.from('a') },
    { name: 'sheets/kai.png', data: Buffer.from('b') },
  ]), caps), /Duplicate/);
  assert.throws(() => decodeSafeArtZip(makeZip([
    { name: 'sheet.png', data: Buffer.from('x'), flags: 0x0801 },
  ]), caps), /Encrypted/);
  assert.throws(() => decodeSafeArtZip(makeZip([
    { name: 'sheet.png', data: Buffer.from('corrupt'), wrongCrc: true },
  ]), caps), /CRC/);
});

test('rejects claimed ZIP bombs, bad local offsets and truncated directory', () => {
  const zip = makeZip([{ name: 'sheet.png', data: Buffer.from('okay') }]);
  const at = zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  const bomb = Buffer.from(zip);
  bomb.writeUInt32LE(caps.maxExtractedBytes + 1, at + 24);
  assert.throws(() => decodeSafeArtZip(bomb, caps), /size|ratio/i);
  const badOffset = Buffer.from(zip);
  badOffset.writeUInt32LE(0xffffffff, at + 42);
  assert.throws(() => decodeSafeArtZip(badOffset, caps), /metadata/);
  assert.throws(() => decodeSafeArtZip(zip.subarray(0, zip.length - 2), caps), /end record/);
});
