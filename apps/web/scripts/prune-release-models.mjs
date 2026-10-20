import fs from "node:fs";
import path from "node:path";
import {
  RELEASE_MODEL_BUDGET_MB,
  RELEASE_MODEL_FILES,
} from "./release-model-manifest.mjs";

const appRoot = process.cwd();
const modelsDir = path.join(appRoot, "dist", "models");
const allowed = new Set(RELEASE_MODEL_FILES.map((file) => file.replaceAll("\\", "/")));

function listGlbFiles(dir, root = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listGlbFiles(full, root));
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".glb")) continue;
    out.push({
      full,
      relative: path.relative(root, full).replaceAll("\\", "/"),
      bytes: fs.statSync(full).size,
    });
  }
  return out;
}

function removeEmptyDirectories(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    removeEmptyDirectories(child);
    if (fs.readdirSync(child).length === 0) fs.rmdirSync(child);
  }
}

if (!fs.existsSync(modelsDir)) {
  throw new Error("[release-assets] dist/models is missing; release model manifest cannot be certified.");
}

const before = listGlbFiles(modelsDir);
const existing = new Set(before.map((file) => file.relative));
const missing = [...allowed].filter((file) => !existing.has(file));
if (missing.length > 0) {
  throw new Error(
    "[release-assets] Required Gold Slice models are missing from dist/models: " + missing.join(", "),
  );
}

let keptBytes = 0;
let removedBytes = 0;
let keptCount = 0;
let removedCount = 0;

for (const file of before) {
  if (allowed.has(file.relative)) {
    keptBytes += file.bytes;
    keptCount += 1;
    continue;
  }

  fs.unlinkSync(file.full);
  removedBytes += file.bytes;
  removedCount += 1;
  console.log(
    "[release-assets] pruned non-Gold-Slice model: " + file.relative + " (" + (file.bytes / 1024 / 1024).toFixed(2) + " MB)",
  );
}

removeEmptyDirectories(modelsDir);

const keptMB = keptBytes / 1024 / 1024;
const removedMB = removedBytes / 1024 / 1024;
const beforeMB = (keptBytes + removedBytes) / 1024 / 1024;

console.log(
  "[release-assets] Gold Slice manifest kept=" + keptCount
    + " pruned=" + removedCount
    + " beforeMB=" + beforeMB.toFixed(2)
    + " keptMB=" + keptMB.toFixed(2)
    + " removedMB=" + removedMB.toFixed(2)
    + " budgetMB=" + RELEASE_MODEL_BUDGET_MB,
);

const finalFiles = listGlbFiles(modelsDir);
const unexpected = finalFiles
  .map((file) => file.relative)
  .filter((file) => !allowed.has(file));
if (unexpected.length > 0) {
  throw new Error("[release-assets] Unexpected GLBs survived release pruning: " + unexpected.join(", "));
}

if (keptMB > RELEASE_MODEL_BUDGET_MB) {
  throw new Error(
    "[release-assets] Gold Slice model payload " + keptMB.toFixed(2)
      + " MB exceeds " + RELEASE_MODEL_BUDGET_MB + " MB budget.",
  );
}
