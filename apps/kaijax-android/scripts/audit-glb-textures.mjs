/**
 * Read-only audit of image payloads embedded in glTF 2.0 binary assets.
 * Identifies malformed buffer views, invalid image dimensions and unusually large
 * textures. This is NOT a runtime WebGL/GPU certification or proof of a mipmap cause.
 *
 * node scripts/audit-glb-textures.mjs [--strict] [--json] [directory]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_MAGIC = Buffer.from('89504e470d0a1a0a', 'hex');
const KTX2_MAGIC = Buffer.from('ab4b5458203230bb0d0a1a0a', 'hex');

export function imageSize(bytes, mimeType = '') {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(PNG_MAGIC)) {
    return { format: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length >= 28 && bytes.subarray(0, 12).equals(KTX2_MAGIC)) {
    return { format: 'ktx2', width: bytes.readUInt32LE(20), height: bytes.readUInt32LE(24) };
  }
  if (bytes.length >= 30 && bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP') {
    const format = bytes.toString('ascii', 12, 16);
    if (format === 'VP8X') {
      const read24 = p => bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16);
      return { format: 'webp', width: 1 + read24(24), height: 1 + read24(27) };
    }
    return { format: 'webp', width: null, height: null };
  }
  if (bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216) {
    let p = 2;
    while (p + 3 < bytes.length) {
      if (bytes[p] !== 255) { p++; continue; }
      const marker = bytes[p + 1]; p += 2;
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (p + 2 > bytes.length) break;
      const length = bytes.readUInt16BE(p);
      if (length < 2 || p + length > bytes.length) break;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker) && length >= 7) {
        return { format: 'jpeg', height: bytes.readUInt16BE(p + 3), width: bytes.readUInt16BE(p + 5) };
      }
      p += length;
    }
    return { format: 'jpeg', width: null, height: null };
  }
  return { format: mimeType || 'unknown', width: null, height: null };
}

export function analyzeGlb(bytes, name = 'asset.glb') {
  const images = [], issues = [];
  if (bytes.length < 20 || bytes.readUInt32LE(0) !== 0x46546c67 ||
      bytes.readUInt32LE(4) !== 2) {
    return { name, images, issues: ['Not a glTF 2.0 binary file'] };
  }
  if (bytes.readUInt32LE(8) !== bytes.length) issues.push('GLB declared length does not match file size');
  let p = 12, doc = null, bin = null;
  while (p + 8 <= bytes.length) {
    const length = bytes.readUInt32LE(p), kind = bytes.readUInt32LE(p + 4);
    p += 8;
    if (length > bytes.length - p) { issues.push('GLB chunk exceeds file bounds'); break; }
    if (kind === 0x4e4f534a && doc === null) {
      try { doc = JSON.parse(bytes.toString('utf8', p, p + length)); }
      catch { issues.push('Invalid glTF JSON chunk'); }
    } else if (kind === 0x004e4942 && bin === null) bin = bytes.subarray(p, p + length);
    p += length;
  }
  if (!doc) {
    if (!issues.length) issues.push('No glTF JSON chunk');
    return { name, images, issues };
  }
  if (!Array.isArray(doc.images)) return { name, images, issues };
  for (let index = 0; index < doc.images.length; index++) {
    const img = doc.images[index];
    let payload = null;
    if (Number.isInteger(img.bufferView)) {
      const view = doc.bufferViews?.[img.bufferView];
      const offset = view?.byteOffset ?? 0, length = view?.byteLength;
      if (!bin || !view || view.buffer !== 0 && view.buffer !== undefined ||
          !Number.isInteger(offset) || !Number.isInteger(length) ||
          offset < 0 || length < 1 || offset + length > bin.length) {
        issues.push('Image ' + index + ': invalid BIN bufferView');
        continue;
      }
      payload = bin.subarray(offset, offset + length);
    } else if (typeof img.uri === 'string' && /^data:[^,]*;base64,/i.test(img.uri)) {
      payload = Buffer.from(img.uri.slice(img.uri.indexOf(',') + 1), 'base64');
    } else if (typeof img.uri === 'string') {
      images.push({ index, format: 'external-uri', width: null, height: null });
      continue;
    } else {
      issues.push('Image ' + index + ': missing URI and bufferView');
      continue;
    }
    const dimension = imageSize(payload, img.mimeType);
    images.push({ index, mimeType: img.mimeType || '', bytes: payload.length, ...dimension });
    if (dimension.width === 0 || dimension.height === 0) {
      issues.push('Image ' + index + ': zero width or height');
    }
  }
  return { name, images, issues };
}

function findGlbs(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...findGlbs(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) files.push(absolute);
  }
  return files.sort();
}

function main() {
  const args = process.argv.slice(2);
  const root = args.find(a => !a.startsWith('--')) ||
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/models');
  const paths = findGlbs(root);
  if (!paths.length) {
    console.error('No GLB assets found under ' + root);
    process.exitCode = 2;
    return;
  }
  const results = paths.map(file => {
    try { return analyzeGlb(fs.readFileSync(file), path.relative(root, file)); }
    catch (e) { return { name: path.relative(root, file), images: [], issues: [String(e)] }; }
  });
  const images = results.flatMap(r => r.images.map(i => ({ asset: r.name, ...i })));
  const invalid = results.filter(r => r.issues.length).map(r => ({ asset: r.name, issues: r.issues }));
  const large = images.filter(i => i.width > 4096 || i.height > 4096);
  const unknown = images.filter(i => i.width === null || i.height === null);
  const summary = {
    assets: results.length, images: images.length, invalid: invalid.length,
    over4096: large.length, unknownDimensions: unknown.length,
    maxWidth: Math.max(0, ...images.map(i => i.width || 0)),
    maxHeight: Math.max(0, ...images.map(i => i.height || 0)),
  };
  if (args.includes('--json')) console.log(JSON.stringify({ summary, invalid, large, unknown }, null, 2));
  else {
    console.log('GLB texture audit: ' + JSON.stringify(summary));
    for (const item of invalid) console.error(item.asset + ': ' + item.issues.join('; '));
    if (large.length) console.warn('Textures over 4096px (check device limits): ' + JSON.stringify(large));
    if (unknown.length) console.warn('Unresolved image dimensions: ' + JSON.stringify(unknown));
  }
  if (args.includes('--strict') && invalid.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
