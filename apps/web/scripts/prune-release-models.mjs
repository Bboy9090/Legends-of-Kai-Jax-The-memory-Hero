import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const srcRoot = path.join(appRoot, "src");
const modelsDir = path.join(appRoot, "dist", "models");
const LARGE_MODEL_BYTES = 5 * 1024 * 1024;

function collectTextFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectTextFiles(full));
      continue;
    }
    if (/\.(ts|tsx|js|jsx|json|css|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function collectGlbFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectGlbFiles(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".glb")) {
      out.push(full);
    }
  }
  return out;
}

if (!fs.existsSync(modelsDir)) {
  console.log("[release-assets] No dist/models directory; nothing to prune.");
  process.exit(0);
}

const sourceCorpus = collectTextFiles(srcRoot)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

let removedBytes = 0;
let keptBytes = 0;
let removedCount = 0;
let keptCount = 0;
let nestedRemovedBytes = 0;
let nestedRemovedCount = 0;
let nestedKeptCount = 0;

for (const full of collectGlbFiles(modelsDir)) {
  const relativePath = path.relative(modelsDir, full).split(path.sep).join("/");
  const isNestedAsset = relativePath.includes("/");
  const stat = fs.statSync(full);
  const filename = path.basename(relativePath);
  const basename = filename.slice(0, -4);

  // Root-level assets support the existing /models/${id}.glb runtime
  // convention. Nested files must have their full relative path in source;
  // matching only a repeated basename can accidentally retain test exports
  // when a different root-level asset is the one used at runtime.
  const referenced = isNestedAsset
    ? sourceCorpus.includes(relativePath)
    : sourceCorpus.includes(filename) ||
      (basename.length >= 6 && sourceCorpus.includes(basename));

  if (stat.size > LARGE_MODEL_BYTES && !referenced) {
    fs.unlinkSync(full);
    removedBytes += stat.size;
    removedCount += 1;
    if (isNestedAsset) {
      nestedRemovedBytes += stat.size;
      nestedRemovedCount += 1;
    }
    console.log(
      "[release-assets] pruned unused large model: " +
        relativePath +
        " (" +
        (stat.size / 1024 / 1024).toFixed(2) +
        " MB)"
    );
  } else {
    keptBytes += stat.size;
    keptCount += 1;
    if (isNestedAsset) nestedKeptCount += 1;
  }
}

console.log(
  "[release-assets] models kept=" +
    keptCount +
    " pruned=" +
    removedCount +
    " keptMB=" +
    (keptBytes / 1024 / 1024).toFixed(2) +
    " removedMB=" +
    (removedBytes / 1024 / 1024).toFixed(2) +
    " nestedPruned=" +
    nestedRemovedCount +
    " nestedPrunedMB=" +
    (nestedRemovedBytes / 1024 / 1024).toFixed(2) +
    " nestedKept=" +
    nestedKeptCount
);
