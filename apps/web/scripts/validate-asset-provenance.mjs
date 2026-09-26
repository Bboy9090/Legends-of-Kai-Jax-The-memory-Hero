import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const registryPath = path.join(webRoot, 'src', 'assets', 'modelRegistry.ts');
const ledgerPath = path.join(repoRoot, 'docs', 'release', 'ASSET_PROVENANCE_LEDGER.json');
const requireCleared = process.argv.includes('--require-cleared');

const registrySource = fs.readFileSync(registryPath, 'utf8');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const registryPaths = [...new Set(
  [...registrySource.matchAll(/["']([^"']+\.glb)["']/g)].map((match) => match[1])
)].sort();

if (registryPaths.length === 0) {
  console.error('No GLB paths were parsed from modelRegistry.ts; refusing a false provenance pass.');
  process.exit(2);
}

const allowed = new Set(ledger?.policy?.releaseAllowedStatuses ?? ['cleared']);
const explicitAssets = ledger?.assets ?? {};
const rows = registryPaths.map((assetPath) => {
  const entry = explicitAssets[assetPath] ?? null;
  const status = entry?.status ?? ledger?.policy?.defaultStatus ?? 'unverified';
  const evidenceComplete = Boolean(entry?.licenseBasis && entry?.evidenceLocation);
  const cleared = allowed.has(status) && evidenceComplete;
  return { assetPath, status, evidenceComplete, cleared };
});

const cleared = rows.filter((row) => row.cleared);
const unresolved = rows.filter((row) => !row.cleared);
const explicit = rows.filter((row) => Object.prototype.hasOwnProperty.call(explicitAssets, row.assetPath));
const missingExplicit = rows.filter((row) => !Object.prototype.hasOwnProperty.call(explicitAssets, row.assetPath));
const registryPathSet = new Set(registryPaths);
const staleEntries = Object.keys(explicitAssets).filter((assetPath) => !registryPathSet.has(assetPath)).sort();

console.log(`Model registry unique GLB paths: ${rows.length}`);
console.log(`Explicit provenance entries: ${explicit.length}`);
console.log(`Missing explicit inventory entries: ${missingExplicit.length}`);
console.log(`Stale ledger entries: ${staleEntries.length}`);
console.log(`Release-cleared assets: ${cleared.length}`);
console.log(`Unresolved assets: ${unresolved.length}`);

if (missingExplicit.length > 0) {
  console.error('\nINVENTORY COVERAGE GATE: FAIL');
  console.error('Every runtime GLB must have an explicit provenance-ledger entry, even when its commercial rights are still unverified.');
  for (const row of missingExplicit) {
    console.error(`- missing: ${row.assetPath}`);
  }
  process.exit(3);
}

if (staleEntries.length > 0) {
  console.log('\nStale provenance-ledger entries (not referenced by MODEL_REGISTRY):');
  for (const assetPath of staleEntries) {
    console.log(`- stale: ${assetPath}`);
  }
}

console.log('\nINVENTORY COVERAGE GATE: PASS');

if (unresolved.length > 0) {
  console.log('\nUnresolved runtime model provenance:');
  for (const row of unresolved) {
    console.log(`- ${row.assetPath} [${row.status}${row.evidenceComplete ? '' : '; evidence incomplete'}]`);
  }
}

if (requireCleared && unresolved.length > 0) {
  console.error('\nRELEASE PROVENANCE GATE: FAIL');
  console.error('Every runtime GLB must have explicit status=cleared, licenseBasis, and evidenceLocation.');
  process.exit(1);
}

if (requireCleared) {
  console.log('\nRELEASE PROVENANCE GATE: PASS');
} else {
  console.log('\nInventory report complete. Use --require-cleared for the strict release gate.');
}
