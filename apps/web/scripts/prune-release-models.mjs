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

for (const entry of fs.readdirSync(modelsDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".glb")) continue;

  const full = path.join(modelsDir, entry.name);
  const stat = fs.statSync(full);
  const basename = entry.name.slice(0, -4);

  // Keep all small models. For large models, retain when runtime source
  // references either the full filename or its basename (covers registry
  // paths and dynamic /models/${id}.glb resolution).
  const referenced =
    sourceCorpus.includes(entry.name) ||
    (basename.length >= 6 && sourceCorpus.includes(basename));

  if (stat.size > LARGE_MODEL_BYTES && !referenced) {
    fs.unlinkSync(full);
    removedBytes += stat.size;
    removedCount += 1;
    console.log(`[release-assets] pruned unused large model: ${entry.name} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    keptBytes += stat.size;
    keptCount += 1;
  }
}

console.log(
  `[release-assets] models kept=${keptCount} pruned=${removedCount} keptMB=${(keptBytes / 1024 / 1024).toFixed(2)} removedMB=${(removedBytes / 1024 / 1024).toFixed(2)}`
);
