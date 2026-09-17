#!/usr/bin/env node
/**
 * Strict Kai-Jax production-rig certification.
 *
 * This lane intentionally has NO nine-tail waiver. The fusion model is
 * production-certifiable only when its registered GLB is valid, skinned,
 * animated, has a usable humanoid body root, and exposes the literal gameplay
 * tail contract:
 *
 *   body-root-equivalent / spine / head / tail_01 ... tail_09
 *
 * Meshy/Mixamo humanoids commonly name the animated body root `Hips` or
 * `Armature`; those are accepted as equivalent body roots. Tail names are NOT
 * aliased: tail_01..tail_09 must exist literally and participate in a skin.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const PUBLIC_ROOT = join(APP_ROOT, 'public');
const REGISTRY_PATH = join(APP_ROOT, 'src', 'assets', 'modelRegistry.ts');
const FIGHTER_ID = 'kai_jax';
const ROOT_ALIASES = ['root', 'hips', 'armature', 'char1', 'mixamorig:hips', 'bip01'];
const REQUIRED_BODY_ANCHORS = ['spine', 'head'];
const REQUIRED_TAILS = Array.from(
  { length: 9 },
  (_, index) => `tail_${String(index + 1).padStart(2, '0')}`
);

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

function firstMatchingAlias(nameIndex, aliases) {
  for (const alias of aliases) {
    const matches = nameIndex.get(alias.toLowerCase()) ?? [];
    if (matches.length > 0) return { alias, indices: matches };
  }
  return null;
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

  const rootMatch = firstMatchingAlias(names, ROOT_ALIASES);
  const rootJointAlias = rootMatch && jointNameSet.has(rootMatch.alias.toLowerCase())
    ? rootMatch.alias
    : null;

  const missingNodes = [];
  const missingSkinJoints = [];
  const duplicateCanonicalNames = [];

  if (!rootMatch) missingNodes.push('body-root-equivalent');
  if (!rootJointAlias) missingSkinJoints.push('body-root-equivalent');
  if (rootMatch && rootMatch.indices.length > 1) duplicateCanonicalNames.push(rootMatch.alias);

  for (const anchor of REQUIRED_BODY_ANCHORS) {
    const matchingIndices = names.get(anchor.toLowerCase()) ?? [];
    if (matchingIndices.length === 0) missingNodes.push(anchor);
    if (matchingIndices.length > 1) duplicateCanonicalNames.push(anchor);
    if (!jointNameSet.has(anchor.toLowerCase())) missingSkinJoints.push(anchor);
  }

  for (const tail of REQUIRED_TAILS) {
    const matchingIndices = names.get(tail) ?? [];
    if (matchingIndices.length === 0) missingNodes.push(tail);
    if (matchingIndices.length > 1) duplicateCanonicalNames.push(tail);
    if (!jointNameSet.has(tail)) missingSkinJoints.push(tail);
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
    acceptedRootAliases: ROOT_ALIASES,
    resolvedBodyRoot: rootMatch?.alias ?? null,
    resolvedBodyRootIsSkinJoint: Boolean(rootJointAlias),
    requiredBodyAnchors: REQUIRED_BODY_ANCHORS,
    requiredNativeTails: REQUIRED_TAILS,
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
  if (!rootJointAlias) fail('GLB has no usable animated body-root equivalent', evidence);
  if (missingNodes.length > 0) {
    fail(`Missing required production nodes: ${missingNodes.join(', ')}`, evidence);
  }
  if (missingSkinJoints.length > 0) {
    fail(`Required production anchors are not all animated skin joints: ${missingSkinJoints.join(', ')}`, evidence);
  }
  if (duplicateCanonicalNames.length > 0) {
    fail(`Production anchor names are ambiguous/duplicated: ${duplicateCanonicalNames.join(', ')}`, evidence);
  }

  console.log('\n=== KAI-JAX RIG CERTIFICATION: PASS ===');
  console.log(JSON.stringify({ ok: true, fighter: FIGHTER_ID, ...evidence }, null, 2));
}

certify();
