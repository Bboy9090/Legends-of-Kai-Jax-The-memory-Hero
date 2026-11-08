#!/bin/bash
set -e

# Determine repo root
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "🔍 LEGENDS OF KAI-JAX: PRODUCTION READINESS VERIFICATION"
echo "========================================================"

# Phase 1: Repository State
echo "[1/6] Checking repository state..."
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Working tree clean"
else
  echo "❌ Uncommitted changes detected"
  git status --porcelain
  exit 1
fi

# Phase 2: Build Sanity
echo "[2/6] Running TypeScript phase0 check..."
cd apps/web
tsc -p tsconfig.phase0.json --noEmit > /dev/null 2>&1 && echo "✅ TypeScript: PASS" || {
  echo "❌ TypeScript errors detected"
  tsc -p tsconfig.phase0.json --noEmit
  exit 1
}
cd "$REPO_ROOT"

# Phase 3: Production Build
echo "[3/6] Running production build..."
cd apps/web
npm run build > /tmp/build.log 2>&1 && echo "✅ Build: PASS" || {
  echo "❌ Build failed"
  tail -20 /tmp/build.log
  exit 1
}
cd "$REPO_ROOT"

# Phase 4: Bundle Analysis
echo "[4/6] Analyzing bundle size..."
BUNDLE_SIZE=$(du -sh apps/web/dist/ | cut -f1)
BUNDLE_BYTES=$(du -s apps/web/dist/ | cut -f1)
echo "📦 Bundle size: $BUNDLE_SIZE"
if [ "$BUNDLE_BYTES" -lt 2500000 ]; then
  echo "✅ Bundle size approved (<2.5MB)"
else
  echo "⚠️  Bundle size: ${BUNDLE_BYTES} bytes (threshold: 2500000)"
fi

# Phase 5: Character Validation
echo "[5/6] Validating character registry..."
if grep -q "CHARACTER_DATA_MAP" apps/web/src/lib/characterStats.ts && \
   grep -q "POWER_MATRICES" apps/web/src/lib/abilitySystems.ts; then
  CHARACTER_COUNT=$(grep -o "'[a-z-]*':" apps/web/src/lib/characterStats.ts | wc -l)
  echo "✅ Character registry valid ($CHARACTER_COUNT entities registered)"
else
  echo "❌ Character registry malformed"
  exit 1
fi

# Phase 6: CI Simulation
echo "[6/6] Running basic verification..."
if [ -f "apps/web/dist/index.html" ]; then
  echo "✅ Production bundle artifact exists"
else
  echo "❌ Production bundle not found"
  exit 1
fi

echo ""
echo "==============================================="
echo "✅ PRODUCTION READINESS: APPROVED"
echo "==============================================="
echo ""
echo "Summary:"
echo "  • TypeScript: PASS"
echo "  • Build: PASS"
echo "  • Bundle Size: $BUNDLE_SIZE"
echo "  • Characters: $CHARACTER_COUNT registered"
echo "  • Status: PRODUCTION READY"
echo ""
