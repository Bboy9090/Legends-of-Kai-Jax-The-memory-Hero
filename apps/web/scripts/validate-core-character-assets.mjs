#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = resolve(root, "src/assets/core-character-assets.release.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const ids = ["kai", "jax", "kai-jax"];

let failed = false;

for (const id of ids) {
  const entry = manifest.characters?.[id];
  if (!entry) {
    console.error(`[asset-authority] missing manifest entry: ${id}`);
    failed = true;
    continue;
  }

  if (!entry.approved) {
    console.error(`[asset-authority] ${id}: BLOCKED — approved asset not imported`);
    failed = true;
    continue;
  }

  for (const field of ["path", "sha256", "provenance", "approvalReceipt"]) {
    if (!entry[field] || typeof entry[field] !== "string") {
      console.error(`[asset-authority] ${id}: missing required field ${field}`);
      failed = true;
    }
  }
  if (failed) continue;

  const relative = entry.path.replace(/^\//, "");
  const assetPath = resolve(root, "public", relative.startsWith("models/") ? relative : `models/${relative}`);
  if (!existsSync(assetPath)) {
    console.error(`[asset-authority] ${id}: approved path does not exist: ${entry.path}`);
    failed = true;
    continue;
  }

  const digest = createHash("sha256").update(readFileSync(assetPath)).digest("hex");
  if (digest !== entry.sha256.toLowerCase()) {
    console.error(`[asset-authority] ${id}: SHA-256 mismatch`);
    failed = true;
    continue;
  }

  console.log(`[asset-authority] ${id}: PASS ${digest}`);
}

if (manifest.releaseAuthority !== "approved-current") {
  console.error("[asset-authority] releaseAuthority is not approved-current");
  failed = true;
}

process.exitCode = failed ? 1 : 0;
