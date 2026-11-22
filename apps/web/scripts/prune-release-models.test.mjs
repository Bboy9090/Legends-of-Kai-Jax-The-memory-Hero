import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "prune-release-models.mjs");
const largeBytes = 5 * 1024 * 1024 + 1;

test("prunes unreferenced nested GLBs without touching source artwork or root aliases", (t) => {
  const appRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kai-jax-release-assets-"));
  t.after(() => fs.rmSync(appRoot, { recursive: true, force: true }));

  const writeModel = (relativePath, data) => {
    const file = path.join(appRoot, "dist", "models", relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
    return file;
  };

  const rootModel = writeModel("boss.glb", Buffer.alloc(largeBytes, 0x2a));
  const duplicateNestedModel = writeModel("Meshy_AI_biped/boss.glb", Buffer.alloc(largeBytes, 0x2a));
  const nestedRuntimeModel = writeModel("characters/kai.glb", Buffer.alloc(largeBytes, 0x4b));
  const unusedNestedModel = writeModel("archive/old-export.glb", Buffer.alloc(largeBytes, 0x5c));
  const smallNestedModel = writeModel("archive/small.glb", Buffer.alloc(1024, 0x6d));

  const sourceRegistry = path.join(appRoot, "src", "assets", "registry.ts");
  fs.mkdirSync(path.dirname(sourceRegistry), { recursive: true });
  fs.writeFileSync(
    sourceRegistry,
    'const boss = "/models/boss.glb";\nconst kai = "/models/characters/kai.glb";\n',
  );

  const sourceArt = path.join(appRoot, "public", "models", "archive", "old-export.glb");
  fs.mkdirSync(path.dirname(sourceArt), { recursive: true });
  fs.writeFileSync(sourceArt, Buffer.alloc(largeBytes, 0x5c));

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: appRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(rootModel), "referenced root model must remain");
  assert.ok(fs.existsSync(nestedRuntimeModel), "full-path nested runtime model must remain");
  assert.ok(!fs.existsSync(duplicateNestedModel), "nested basename alias must not inherit root reference");
  assert.ok(!fs.existsSync(unusedNestedModel), "unreferenced large nested export must be pruned");
  assert.ok(fs.existsSync(smallNestedModel), "small nested files remain covered by existing policy");
  assert.ok(fs.existsSync(sourceArt), "pruning generated dist must preserve source artwork");
  assert.match(result.stdout, /nestedPruned=2/);
  assert.match(result.stdout, /nestedKept=2/);
});
