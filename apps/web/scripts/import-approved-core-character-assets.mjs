#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const IDS = ['kai', 'jax', 'kai-jax'];

export function validateGlbBuffer(buffer, label = 'asset') {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    throw new Error(`${label}: file is too small to be a GLB`);
  }
  if (buffer.toString('ascii', 0, 4) !== 'glTF') {
    throw new Error(`${label}: missing GLB glTF magic header`);
  }
  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  if (version !== 2) throw new Error(`${label}: GLB version ${version} is unsupported; expected 2`);
  if (declaredLength !== buffer.length) {
    throw new Error(`${label}: GLB length header ${declaredLength} does not match file length ${buffer.length}`);
  }
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function buildApprovedManifest(current, assets, provenance, approvalReceipt) {
  const characters = { ...(current.characters || {}) };
  for (const id of IDS) {
    const asset = assets[id];
    if (!asset) throw new Error(`missing asset metadata for ${id}`);
    characters[id] = {
      approved: true,
      path: `/models/canonical/${id}.glb`,
      sha256: asset.sha256,
      provenance,
      approvalReceipt,
    };
  }
  return {
    ...current,
    schemaVersion: current.schemaVersion || 1,
    releaseAuthority: 'approved-current',
    characters,
  };
}

function parseArgs(argv) {
  const values = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (key === 'approve-current' || key === 'dry-run') {
      values[key] = true;
      continue;
    }
    values[key] = argv[++i];
  }
  return values;
}

export function prepareImport({
  root,
  sources,
  provenance,
  approvalReceipt,
  approveCurrent,
}) {
  if (!approveCurrent) {
    throw new Error('refusing to approve core assets without --approve-current');
  }
  if (!provenance?.trim()) throw new Error('--provenance is required');
  if (!approvalReceipt?.trim()) throw new Error('--approval-receipt is required');

  const assets = {};
  for (const id of IDS) {
    const source = sources[id];
    if (!source) throw new Error(`--${id} is required`);
    const buffer = readFileSync(resolve(source));
    validateGlbBuffer(buffer, id);
    assets[id] = {
      source: resolve(source),
      buffer,
      sha256: sha256(buffer),
      destination: resolve(root, 'public', 'models', 'canonical', `${id}.glb`),
    };
  }
  return assets;
}

export function runImport(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const root = resolve(scriptDir, '..');
  const manifestPath = resolve(root, 'src', 'assets', 'core-character-assets.release.json');
  const assets = prepareImport({
    root,
    sources: {
      kai: args.kai,
      jax: args.jax,
      'kai-jax': args['kai-jax'],
    },
    provenance: args.provenance,
    approvalReceipt: args['approval-receipt'],
    approveCurrent: Boolean(args['approve-current']),
  });

  const current = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const manifest = buildApprovedManifest(
    current,
    Object.fromEntries(IDS.map(id => [id, { sha256: assets[id].sha256 }])),
    args.provenance.trim(),
    args['approval-receipt'].trim(),
  );

  if (args['dry-run']) {
    console.log(JSON.stringify({ manifest, assets: Object.fromEntries(IDS.map(id => [id, {
      source: basename(assets[id].source),
      destination: assets[id].destination,
      sha256: assets[id].sha256,
    }])) }, null, 2));
    return;
  }

  for (const id of IDS) {
    mkdirSync(dirname(assets[id].destination), { recursive: true });
    copyFileSync(assets[id].source, assets[id].destination);
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('[asset-import] imported approved Kai, Jax, and Kai-Jax GLBs');
  for (const id of IDS) console.log(`[asset-import] ${id}: ${assets[id].sha256}`);
  console.log('[asset-import] run: node apps/web/scripts/validate-core-character-assets.mjs');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  try {
    runImport();
  } catch (error) {
    console.error(`[asset-import] BLOCKED — ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
