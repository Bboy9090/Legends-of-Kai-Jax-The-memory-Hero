import { inflateRawSync } from 'node:zlib';

export interface SafeArtZipLimits {
  maxCompressedBytes: number;
  maxExtractedBytes: number;
  maxEntries: number;
}

export interface SafeArtZipEntry {
  name: string;
  bytes: Buffer;
}

// Strict ZIP32 central-directory reader. No archive member is written to disk,
// so forged symlinks, traversal paths and duplicate entries cannot escape.
const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END = 0x06054b50;
const ALLOWED_ART = /\.(png|jpe?g|webp|glb|gltf)$/i;
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let c = value;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function assertRange(bytes: Buffer, offset: number, length: number): void {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
      offset < 0 || length < 0 || offset + length > bytes.length) {
    throw new Error('Invalid ZIP directory or data offset');
  }
}

function entryName(raw: Buffer, flags: number): string {
  if (!(flags & 0x0800) && raw.some(byte => byte > 0x7f)) {
    throw new Error('Unsupported ZIP filename encoding');
  }
  const name = raw.toString('utf8');
  if (!name || name.includes('\ufffd') || name.includes('\0') ||
      name.includes('\\') || name.startsWith('/') ||
      /^[A-Za-z]:/.test(name) || name.includes('//')) {
    throw new Error('Unsafe ZIP entry path');
  }
  const parts = name.replace(/\/$/, '').split('/');
  if (parts.some(part => !part || part === '.' || part === '..') ||
      name.length > 512) {
    throw new Error('Unsafe ZIP entry path segments');
  }
  return name;
}

export function decodeSafeArtZip(bytes: Buffer, limits: SafeArtZipLimits): SafeArtZipEntry[] {
  if (!Buffer.isBuffer(bytes) || bytes.length > limits.maxCompressedBytes) {
    throw new Error('ZIP input exceeds compressed-size limit');
  }
  if (bytes.length < 22) throw new Error('Incomplete ZIP end record');

  let end = -1;
  const earliest = Math.max(0, bytes.length - 22 - 65535);
  for (let i = bytes.length - 22; i >= earliest; i--) {
    if (bytes.readUInt32LE(i) === END &&
        i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('ZIP end record missing');
  if (bytes.readUInt16LE(end + 4) !== 0 || bytes.readUInt16LE(end + 6) !== 0) {
    throw new Error('Multi-disk ZIP archives are not supported');
  }
  const count = bytes.readUInt16LE(end + 10);
  if (count !== bytes.readUInt16LE(end + 8) || count === 0xffff ||
      count > limits.maxEntries) throw new Error('ZIP entry-count limit exceeded');
  const directorySize = bytes.readUInt32LE(end + 12);
  const directoryOffset = bytes.readUInt32LE(end + 16);
  if (directorySize === 0xffffffff || directoryOffset === 0xffffffff ||
      directoryOffset + directorySize !== end) {
    throw new Error('Unsupported ZIP64 or malformed central directory');
  }
  assertRange(bytes, directoryOffset, directorySize);

  const found: SafeArtZipEntry[] = [];
  const seen = new Set<string>();
  let totalExtracted = 0;
  let at = directoryOffset;
  for (let index = 0; index < count; index++) {
    assertRange(bytes, at, 46);
    if (bytes.readUInt32LE(at) !== CENTRAL) throw new Error('Invalid ZIP central header');
    const unixHost = (bytes.readUInt16LE(at + 4) >>> 8) === 3;
    const flags = bytes.readUInt16LE(at + 8);
    const method = bytes.readUInt16LE(at + 10);
    const expectedCrc = bytes.readUInt32LE(at + 16);
    const compressedSize = bytes.readUInt32LE(at + 20);
    const extractedSize = bytes.readUInt32LE(at + 24);
    const nameLength = bytes.readUInt16LE(at + 28);
    const extraLength = bytes.readUInt16LE(at + 30);
    const commentLength = bytes.readUInt16LE(at + 32);
    const externalMode = bytes.readUInt32LE(at + 38) >>> 16;
    const localOffset = bytes.readUInt32LE(at + 42);
    const next = at + 46 + nameLength + extraLength + commentLength;
    if (next > end || compressedSize === 0xffffffff ||
        extractedSize === 0xffffffff || localOffset === 0xffffffff) {
      throw new Error('Invalid ZIP entry metadata');
    }
    assertRange(bytes, at + 46, nameLength);
    const filename = bytes.subarray(at + 46, at + 46 + nameLength);
    const name = entryName(filename, flags);
    const unique = name.toLowerCase();
    if (seen.has(unique)) throw new Error('Duplicate ZIP member: ' + name);
    seen.add(unique);
    at = next;
    if (flags & (0x0001 | 0x0040)) throw new Error('Encrypted ZIP member rejected');
    const kind = externalMode & 0o170000;
    if (unixHost && kind === 0o120000) continue; // skip symlink, never materialize
    if (name.endsWith('/')) continue;
    if (unixHost && kind !== 0 && kind !== 0o100000) {
      throw new Error('Special ZIP member rejected');
    }
    const segments = name.split('/');
    if (segments.some(seg => seg === '__MACOSX') || segments.at(-1)?.startsWith('._') ||
        !ALLOWED_ART.test(name)) continue;

    if (method !== 0 && method !== 8) throw new Error('Unsupported ZIP compression');
    if (extractedSize > limits.maxExtractedBytes ||
        totalExtracted + extractedSize > limits.maxExtractedBytes ||
        (compressedSize === 0 && extractedSize !== 0) ||
        (compressedSize > 0 && extractedSize / compressedSize > 300)) {
      throw new Error('ZIP extracted-size or compression-ratio limit exceeded');
    }
    assertRange(bytes, localOffset, 30);
    if (localOffset >= directoryOffset || bytes.readUInt32LE(localOffset) !== LOCAL) {
      throw new Error('Missing ZIP local file header');
    }
    const localFlags = bytes.readUInt16LE(localOffset + 6);
    const localMethod = bytes.readUInt16LE(localOffset + 8);
    const localNameSize = bytes.readUInt16LE(localOffset + 26);
    const localExtraSize = bytes.readUInt16LE(localOffset + 28);
    const localNameStart = localOffset + 30;
    const payloadStart = localNameStart + localNameSize + localExtraSize;
    if (localFlags !== flags || localMethod !== method ||
        localNameSize !== nameLength || payloadStart + compressedSize > directoryOffset) {
      throw new Error('ZIP local/central mismatch');
    }
    assertRange(bytes, localNameStart, localNameSize);
    if (!bytes.subarray(localNameStart, localNameStart + localNameSize).equals(filename)) {
      throw new Error('ZIP local/central filename mismatch');
    }

    const compressed = bytes.subarray(payloadStart, payloadStart + compressedSize);
    const content = method === 0
      ? Buffer.from(compressed)
      : inflateRawSync(compressed, { maxOutputLength: Math.max(1, extractedSize) });
    if (content.length !== extractedSize || crc32(content) !== expectedCrc) {
      throw new Error('ZIP file length or CRC mismatch');
    }
    totalExtracted += content.length;
    found.push({ name, bytes: content });
  }
  if (at !== end) throw new Error('Unconsumed ZIP central-directory bytes');
  return found;
}
