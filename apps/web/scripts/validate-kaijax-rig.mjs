#!/usr/bin/env node
/**
 * Strict Kai-Jax production-rig certification.
 *
 * This lane intentionally has NO canonical-anchor waiver. The fusion model is
 * production-certifiable only when its registered GLB is valid, animated, and
 * exposes the literal socket contract used by gameplay:
 *
 *   root / spine / head / tail_01 ... tail_09
 *
 * The required anchors must also participate in a skin joint set so future
 * bone-socket hitboxes/attachments are driven by the animated skeleton rather
 * than by decorative scene nodes.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const PUBLIC_ROOT = join(APP_ROOT, 'public');
const REGISTRY_PATH = join(APP_ROOT, 'src', 'assets', 'modelRegistry.ts');
const FIGHTER_ID = 'kai_jax';
const REQUIRED_ANCHORS = [
  'root',
  'spine',
  'head',
  ...Array.from({ length: 9 }, (_, index) => `tail_${String(index + 1).padStart(2, '0')}`),
];

function fail(message, evidence = {}) {
  console.error('\n=== KAI-JAX RIG CERTIFICATION: FAIL ===');
  console.error(message);
  console.error(JSON.stringify({ ok: false, fighter: FIGHTER_ID, ...evidence }, null, 2));
  process.exit(1);
}

function registryPathFor(id) {
  const source = readFileSync(REGISTRY_PATH, 'utf8');
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(`(?:["']${escaped}["']|\\b${escaped})\\s*:\\s*\\{[\\s\\S]*?path:\\s*["']([^"']+)["']`);
  const match = source.match(matcher);
  return match?.[1] ?? null;
}

function parseGLB(path) {
  const buffer = readFileSync(path);
  if (buffer.length < 20) throw new Error('file too small to contain a GLB JSON chunk');
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('invalid GLB magic');

  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  if (version !== 2) throw new Error(`unsupported GLB version ${version}`);
  if (declaredLength !== buffer.length) {
    throw new Error(`GLB length mismatch: header=${declaredLength} actual=${buffer.length}`);
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + chunkLength;
    if (end > buffer.length) throw new Error('GLB chunk exceeds file length');
    if (chunkType === 0x4e4f534a) {
      const json = buffer.toString('utf8', start, end).replace(/\0+$/, '').trim();
      return JSON.parse(json);
    }
    offset = end;
  }

  throw new Error('GLB JSON chunk not found');
}

function exactNameIndex(nodes) {
  const byLowerName = new Map();
  nodes.forEach((node, index) => {
    if (typeof node?.name !== 'string') return;
    const lower = node.name.toLowerCase();
    if (!byLowerName.has(lower)) byLowerName.set(lower, []);
    byLowerName.get(lower).push(index);
  });
  return byLowerName;
}

function collectSkinJointIndices(gltf) {
  const joints = new Set();
  for (const skin of gltf.skins ?? []) {
    for (const joint of skin?.joints ?? []) {
      if (Number.isInteger(joint)) joints.add(joint);
    }
  }
  return joints;
}

function collectNodeNames(nodes, indices) {
  return [...indices]
    .map((index) => nodes[index]?.name)
    .filter((name) => typeof name === 'string');
}

function certify() {
  const registryPath = registryPathFor(FIGHTER_ID);
  if (!registryPath) fail(`MODEL_REGISTRY has no ${FIGHTER_ID} path`);
  if (!registryPath.startsWith('/models/')) {
    fail(`${FIGHTER_ID} registry path must live under /models/`, { registryPath });
  }

  const absolutePath = join(PUBLIC_ROOT, registryPath);
  if (!existsSync(absolutePath)) {
    fail('Registered Kai-Jax GLB does not exist', { registryPath, absolutePath });
  }

  let gltf;
  try {
    gltf = parseGLB(absolutePath);
  } catch (error) {
    fail('Registered Kai-Jax asset is not a valid GLB 2.0 file', {
      registryPath,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  const names = exactNameIndex(nodes);
  const jointIndices = collectSkinJointIndices(gltf);
  const jointNames = collectNodeNames(nodes, jointIndices);
  const jointNameSet = new Set(jointNames.map((name) => name.toLowerCase()));
  const animationNames = (gltf.animations ?? []).map((animation, index) =>
    typeof animation?.name === 'string' && animation.name.trim()
      ? animation.name
      : `<unnamed-${index}>`
  );

  const missingNodes = [];
  const missingSkinJoints = [];
  const duplicateCanonicalNames = [];

  for (const anchor of REQUIRED_ANCHORS) {
    const matchingIndices = names.get(anchor.toLowerCase()) ?? [];
    if (matchingIndices.length === 0) missingNodes.push(anchor);
    if (matchingIndices.length > 1) duplicateCanonicalNames.push(anchor);
    if (!jointNameSet.has(anchor.toLowerCase())) missingSkinJoints.push(anchor);
  }

  const tailNodes = nodes
    .map((node) => node?.name)
    .filter((name) => typeof name === 'string' && /^tail[_ .:-]?\d+/i.test(name));

  const evidence = {
    registryPath,
    bytes: statSync(absolutePath).size,
    nodeCount: nodes.length,
    skinCount: Array.isArray(gltf.skins) ? gltf.skins.length : 0,
    uniqueSkinJointCount: jointIndices.size,
    animationCount: animationNames.length,
    animationNames,
    requiredAnchors: REQUIRED_ANCHORS,
    missingNodes,
    missingSkinJoints,
    duplicateCanonicalNames,
    discoveredTailLikeNodes: tailNodes,
  };

  console.log('\n=== Kai-Jax Production Rig Evidence ===');
  console.log(JSON.stringify(evidence, null, 2));

  if (nodes.length === 0) fail('GLB contains no nodes', evidence);
  if (jointIndices.size === 0) fail('GLB contains no skin joints', evidence);
  if (animationNames.length === 0) fail('GLB contains no animation clips', evidence);
  if (missingNodes.length > 0) {
    fail(`Missing canonical scene nodes: ${missingNodes.join(', ')}`, evidence);
  }
  if (missingSkinJoints.length > 0) {
    fail(`Canonical anchors are not all animated skin joints: ${missingSkinJoints.join(', ')}`, evidence);
  }
  if (duplicateCanonicalNames.length > 0) {
    fail(`Canonical anchor names are ambiguous/duplicated: ${duplicateCanonicalNames.join(', ')}`, evidence);
  }

  console.log('\n=== KAI-JAX RIG CERTIFICATION: PASS ===');
  console.log(JSON.stringify({ ok: true, fighter: FIGHTER_ID, ...evidence }, null, 2));
}

certify();
