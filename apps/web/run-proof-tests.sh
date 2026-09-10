#!/bin/bash
echo "=== EXACT PROOF RUNS ==="
echo ""
echo "1. Animation playback verification test:"
npx playwright test e2e/verify-animation-playback.spec.ts 2>&1 | grep -A 10 "Console logs received" | head -15
echo ""
echo "2. Improved lighting test:"
npx playwright test e2e/capture-improved-lighting.spec.ts --reporter=list 2>&1 | tail -5
