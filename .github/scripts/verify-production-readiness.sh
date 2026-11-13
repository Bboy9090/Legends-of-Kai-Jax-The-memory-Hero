#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
WEB="$REPO_ROOT/apps/web"
MAX_JS_GZIP_BYTES=$((2500 * 1024))        # 2.5 MB gzipped JS
MAX_MODELS_BYTES=$((100 * 1024 * 1024))   # 100 MB of shipped GLBs
EXPECTED_HEROES=15
EXPECTED_ABILITIES=105

echo "LEGENDS OF KAI-JAX: PRODUCTION READINESS VERIFICATION"
echo "====================================================="

echo "[1/6] Repository state"
if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY:-0}" != "1" ]; then
  echo "FAIL: uncommitted changes (set ALLOW_DIRTY=1 to bypass locally)"
  git status --porcelain
  exit 1
fi
echo "PASS"

echo "[2/6] TypeScript (tsc -b)"
(cd "$WEB" && npx tsc -b)
echo "PASS"

echo "[3/6] Production build"
(cd "$WEB" && npm run build > "${TMPDIR:-/tmp}/kj-build.log" 2>&1) || { tail -30 "${TMPDIR:-/tmp}/kj-build.log"; echo "FAIL: build"; exit 1; }
echo "PASS"

echo "[4/6] Bundle size (gzipped JS in dist/assets, shipped GLBs)"
js_gzip_total=0
for f in "$WEB"/dist/assets/*.js; do
  js_gzip_total=$((js_gzip_total + $(gzip -9 -c "$f" | wc -c)))
done
models_total=$(find "$WEB/dist/models" -type f -name '*.glb' -printf '%s\n' 2>/dev/null | awk '{s+=$1} END {print s+0}')
awk -v b="$js_gzip_total" 'BEGIN { printf "gzipped JS: %.2f MB (limit 2.50 MB)\n", b / 1048576 }'
awk -v b="$models_total" 'BEGIN { printf "shipped GLBs: %.1f MB (limit 100 MB)\n", b / 1048576 }'
[ "$js_gzip_total" -lt "$MAX_JS_GZIP_BYTES" ] || { echo "FAIL: gzipped JS over 2.5 MB"; exit 1; }
[ "$models_total" -lt "$MAX_MODELS_BYTES" ] || { echo "FAIL: shipped GLBs over 100 MB"; exit 1; }
echo "PASS"

echo "[5/6] Roster and ability registry"
npx tsx -e "
import { CHARACTER_DATA_MAP } from './apps/web/src/lib/characterStats.ts';
import { POWER_MATRICES } from './apps/web/src/lib/abilitySystems.ts';
const ids = Object.keys(CHARACTER_DATA_MAP);
const errors = [];
let total = 0;
if (ids.length !== $EXPECTED_HEROES) errors.push('expected $EXPECTED_HEROES heroes, found ' + ids.length);
for (const id of ids) {
  const m = POWER_MATRICES[id];
  if (!m) { errors.push(id + ': missing power matrix'); continue; }
  const t1 = m.abilities.filter(a => a.tier === 1).length;
  const t2 = m.abilities.filter(a => a.tier === 2).length;
  const other = m.abilities.length - t1 - t2;
  if (t1 !== 2 || t2 !== 2 || other !== 0) errors.push(id + ': tiers T1=' + t1 + ' T2=' + t2 + ' other=' + other);
  if (m.passives.length !== 2) errors.push(id + ': passives=' + m.passives.length);
  if (!m.ultimate) errors.push(id + ': missing ultimate');
  total += m.abilities.length + m.passives.length + (m.ultimate ? 1 : 0);
}
if (total !== $EXPECTED_ABILITIES) errors.push('expected $EXPECTED_ABILITIES abilities, found ' + total);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(ids.length + ' heroes, ' + total + ' abilities');
"
echo "PASS"

echo "[6/6] Artifact"
[ -f "$WEB/dist/index.html" ] || { echo "FAIL: dist/index.html missing"; exit 1; }
echo "PASS"

echo "PRODUCTION READINESS: APPROVED"
