# Board Ruling Implementation Status — 2026-08-01

**Board Decision:** NO-GO on current pre-alpha state  
**Release Classification:** PRE-ALPHA / INTERNAL ALPHA  
**Status:** Implementing corrections and root cause trace plan

---

## What Was Corrected

### 1. Release Blocker Report ✅ CORRECTED
**File:** `docs/qa/RELEASE_BLOCKER_BOARD_REVIEW.md`

**Changes made:**
- Corrected roster math: 157 total, 22 registry, 135 without registry (not 149)
- Changed "8 verified playable" to "8 asset-backed candidates, runtime not verified"
- Removed all work time estimates (2-3 hours, 2-3 weeks, etc.)
- Restored six missing Tier 1 mobile blockers (lag, animation, training absent, versus absent)
- Clarified that Versus FIGHT root cause is UNKNOWN (not assumed)
- Clarified that model visibility cause is UNKNOWN (not assumed camera/material/scale)
- Defined Tier 1 release roster: 4 fighters (1 Story, 1 Training, 2 Versus)
- Documented core hero model aliases (kai, jax, kaijax, jaxon, kaison all have registry entries)

**Status:** ✅ Committed and pushed

### 2. Clean Branch Strategy ✅ DEFINED
**File:** `docs/CLEAN_BRANCH_STRATEGY.md`

**Defined:**
- Create fresh branch from `phase1b-production-readiness @ 038d88d0`
- Do NOT merge forensic branch (`claude/kai-jax-consolidation-dkfv1r`)
- Cherry-pick only approved atomic fixes
- Each commit must have proven root cause
- No temporary audit scripts in final branch

**Status:** ✅ Committed and pushed

### 3. Root Cause Trace Requirements ✅ DEFINED
**File:** `docs/qa/ROOT_CAUSE_TRACE_REQUIREMENTS.md`

**Defined for each blocker:**

**Blocker A (Versus Route):**
- 10-step sequence from onClick through BattleUI mount
- 5 failure point candidates
- Console log expectations
- DOM inspection checklist

**Blocker B (Model Rendering):**
- 13-step sequence from model ID through frustum check
- 7 failure point candidates
- Property value logging requirements (NOT just state names)
- Screenshot proof requirements

**Blocker C (Mobile Performance):**
- 10-measurement sequence
- 6 bottleneck candidates
- Mobile DevTools setup
- Video evidence requirements

**Status:** ✅ Committed and pushed

### 4. Tracing Logging Added ✅ IMPLEMENTED
**Files Modified:**
- `apps/web/src/components/game/VersusCharacterSelect.tsx`
- `apps/web/src/App.tsx`

**Added:**
- Console.log at each state transition in beginMatch()
- Console.log for App.tsx battleCanvasActive evaluation
- Traces will identify exact failure point

**Status:** ✅ Committed and pushed

---

## What Still Needs to Be Done (Immediate Actions)

### NEXT IMMEDIATE PRIORITY: Root Cause Tracing

**Blocker A: Versus FIGHT Transition**
- [ ] Run live Versus flow with DevTools console open
- [ ] Click FIGHT button
- [ ] Capture console output showing state transitions
- [ ] Identify exact failure point (one of 5 candidates)
- [ ] Document: which step fails, what value is wrong
- [ ] Record screenshot of failure state

**Blocker B: Character Model Rendering**
- [ ] Run Training mode with detailed property logging enabled
- [ ] Select character and enter arena
- [ ] Capture console showing each pipeline step
- [ ] Check actual property values (opacity, visible, scale, position)
- [ ] Identify exact failure point (one of 7 candidates)
- [ ] Record screenshot showing fallback only (no model)
- [ ] Also take screenshot from localhost if model works there

**Blocker C: Mobile Performance**
- [ ] Deploy to live Vercel preview build
- [ ] Open on mobile device with DevTools
- [ ] Measure FPS (target: 60, acceptable: 30)
- [ ] Measure input latency (target: <100ms)
- [ ] Record video of walk/punch/kick animations
- [ ] Compare against localhost reference
- [ ] Identify bottleneck (render, animation, input, network, bundle, or GC)
- [ ] Record measurement data with timestamp

### After Root Causes Proven

**For each blocker:**
1. Understand exact root cause
2. Design minimal fix (not rewrite)
3. Implement narrow change only
4. Test locally and verify fix
5. Screenshot fix in action
6. Commit with "fix: [blocker]" message
7. Retest on live mobile Vercel

### Tier 1 Fighter Selection

- [ ] Choose 4 fighters for MVP (1 Story, 1 Training, 2 Versus)
- [ ] Verify each fighter:
  - [ ] Model registry entry exists
  - [ ] Model file exists
  - [ ] Preview renders without fallback
  - [ ] Battle arena renders character
  - [ ] Animations play (idle, walk, attack)
  - [ ] No lag on mobile
- [ ] Hide or mark "Coming Soon" all other 153 fighters

---

## Classification System (Corrected)

### Roster Categories

| Category | Count | Definition | Example |
|----------|-------|-----------|---------|
| ROSTER DEFINED | 157 | Defined in code | All EXTRA_LEGENDS + COMPLETE_BEAST_ROSTER |
| REGISTRY ENTRY EXISTS | 22 | Has MODEL_REGISTRY key | kai, jax, kaijax, voltage-fang, ashen-tiger |
| ASSET FILE EXISTS | 8 | GLB file on disk | voltage-fang, ashen-tiger, blazing-fox, etc. |
| ASSET-BACKED CANDIDATES | 8 | File verified, runtime untested | Same 8 fighters |
| REGISTRY-BACKED UNAUDITED | 14 | Entry exists, file not checked | 22 - 8 = 14 entries |
| NO REGISTRY COVERAGE | 135 | No registry entry | 157 - 22 = 135 fighters |
| RUNTIME-VERIFIED PLAYABLE | 0 | Actually works in game | None yet proven |

### Evidence Hierarchy (Corrected)

| Level | Proof | Example |
|-------|-------|---------|
| **Code Present** | File exists, identifier defined | characters.ts has "kaijax" fighter definition |
| **Registry Entry** | MODEL_REGISTRY key found | modelRegistry.ts has "kaijax" entry |
| **Asset File Exists** | GLB on disk with 200 status | /models/Meshy_AI_...glb exists |
| **Asset Request Success** | HTTP 200, file downloaded | Network tab shows 200 OK |
| **GLTF Parse Success** | Scene created, children > 0 | Console: "parse success, scenes: 1" |
| **Mesh Found** | SkinnedMesh in scene tree | Console: "mesh found, type: SkinnedMesh" |
| **Material Visible** | opacity = 1.0, visible = true | Console: "opacity: 1.0, visible: true" (actual values) |
| **Scale Applied** | mesh.scale = [N, N, N] | Console: "scale applied: x=1.294, y=1.294, z=1.294" |
| **Position Applied** | mesh.position in scene | Console: "position: x=0, y=-8e-8, z=0" |
| **Camera Framing** | Mesh in frustum bounds | Console: "frustum check: visible" |
| **PREVIEW VISIBLE** | Screenshot shows 3D model | Versus character select shows model, not fallback |
| **BATTLE VISIBLE** | Screenshot shows model in arena | Battle arena shows both fighters, no fallback |
| **ANIMATION WORKS** | Animation plays and looks correct | Video shows walk/punch/kick animations smooth |
| **COMBAT VERIFIED** | Full attack exchange works | Video shows hit damage, knockback, no errors |
| **VERIFIED PLAYABLE** | All above + mobile responsive | Fighter confirmed playable in all modes |

**Key Rule:** Each level requires ACTUAL EVIDENCE, not inference.

---

## Current Status Summary

### ✅ Complete
- Board ruling received and understood
- Release blocker report corrected
- Clean branch strategy documented
- Root cause trace requirements defined
- Tracing logging added to code
- All changes committed and pushed

### ⏳ In Progress
- Awaiting root cause trace execution
- Need actual console logs from live tests
- Need screenshots showing failures
- Need mobile performance measurements

### ⛔ Blocked (Cannot Start Until Root Causes Known)
- Implementation of fixes
- Tier 1 fighter selection
- UI updates to hide unproven fighters
- Performance optimization
- Release validation

---

## Release Go/No-Go Checklist

**Current Status: NO-GO (all blockers unresolved)**

```
Blocker A: Versus FIGHT Transition
  [❌] Root cause traced
  [❌] Fix implemented
  [❌] Local test screenshot
  [❌] Mobile Vercel test screenshot

Blocker B: Character Model Rendering
  [❌] Root cause traced
  [❌] Fix implemented
  [❌] Training mode screenshot
  [❌] Versus preview screenshot
  [❌] Versus battle screenshot

Blocker C: Mobile Performance
  [❌] FPS measured (target: 60)
  [❌] Input latency measured (target: <100ms)
  [❌] Animation quality video recorded
  [❌] Bottleneck identified
  [❌] Performance fix implemented
  [❌] Live Vercel retest complete

Blocker D: Roster Truth
  [❌] Only Tier 1 fighters exposed
  [❌] Unproven fighters hidden or Coming Soon
  [❌] UI updated to show realistic options

Blocker E: Duplicate KAIJAX
  [❌] Canonical stats identified
  [❌] Duplicate entry deleted
  [❌] No React key conflicts

Tier 1 Release Roster
  [❌] 4 fighters selected
  [❌] All 4 runtime-verified playable
  [❌] Story character works
  [❌] Training character works
  [❌] Versus character 1 works
  [❌] Versus character 2 works
```

**Cannot move to GO until all boxes checked.**

---

## Next Checkpoints

**Checkpoint 1: Root Causes Proven**
- Console logs show exact failure points for Blockers A, B, C
- Measurements show performance bottleneck
- Timeline: 2–4 hours of testing and data collection

**Checkpoint 2: Fixes Implemented**
- Each proven cause has narrow fix
- Local tests pass
- Timeline: 4–8 hours depending on complexity

**Checkpoint 3: Tier 1 Verified**
- 4 fighters confirmed working
- All modes tested locally
- Timeline: 1–2 hours

**Checkpoint 4: Live Mobile Retest**
- Vercel deployment tested on mobile device
- All fixes confirmed working on live build
- Timeline: 1 hour

**Checkpoint 5: Release Ready**
- All checks green
- Clean branch ready for PR
- Timeline: 0.5 hours for PR/merge

**Total Estimated (After Root Causes Proven): 8–16 hours**

---

## Important Reminders

✅ **Do:**
- Use actual property values in logs, not just state names
- Test on live Vercel deployment for mobile issues
- Take screenshots of both success and failure states
- Measure performance with instruments, not impressions
- Prove each hypothesis before fixing

❌ **Don't:**
- Estimate time to fix before root cause proven
- Assume camera/material/scale without logging values
- Call fighters "playable" without runtime battle screenshot
- Accept menu screenshots as gameplay proof
- Merge forensic branch into production code
- Work on roster expansion until Tier 1 verified

---

## Questions for User (If Needed)

Before implementing fixes:
1. Which 4 fighters should be Tier 1 (1 Story, 1 Training, 2 Versus)?
2. Should unproven fighters show "Coming Soon" or be completely hidden?
3. Is the mobile lag acceptable if input latency < 200ms, or must be < 100ms?
4. Should core heroes (kai, jax, kaijax) definitely be in Tier 1, or should selection be based on animation quality?

