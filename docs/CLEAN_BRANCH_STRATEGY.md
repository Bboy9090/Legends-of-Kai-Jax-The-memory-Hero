# Clean Branch Strategy — Release Blocker Fixes

**Date:** 2026-08-01  
**Status:** Planning phase  
**Board Decision:** NO-GO on current branch, create clean implementation branch

---

## Current State

**Branch:** `claude/kai-jax-consolidation-dkfv1r` (forensic audit branch)  
**Commits:** 13+ exploratory/diagnostic  
**Contents:** Audit scripts, investigation notes, temporary fixes  
**Status:** DO NOT MERGE TO MAIN

**Release Base:** `phase1b-production-readiness @ 038d88d0`

---

## Clean Branch Plan

### Step 1: Create Clean Branch

```bash
git fetch origin phase1b-production-readiness
git checkout -b fix/mobile-live-release-blockers-clean origin/phase1b-production-readiness
```

This creates a fresh branch from the last known good baseline, NOT carrying forensic commits.

### Step 2: Cherry-Pick Approved Fixes Only

**Approved for cherry-pick:**
- Branding fixes (Memory Hero title)
- Blocker root cause fixes (once proven)
- Roster UI corrections (hide unproven fighters)
- Model visibility fixes (once cause proven)
- Animation corrections (once Tier 1 fighter identified)
- Performance fixes (once bottleneck identified)
- Clean test additions
- Final QA documentation

**NOT approved (do not cherry-pick):**
- Temporary audit scripts (task2-scene-trace.mjs, task4-roster-audit.mjs, etc.)
- Exploratory console.log additions
- Forensic console trace outputs
- Investigation notes in code comments
- Intermediate report versions
- Speculative root cause comments

### Step 3: Commit Structure

Each fix should be a **single, atomic, focused commit** with clear lineage:

```
fix(branding): restore canonical Memory Hero title

- Correct app/web/index.html title
- Verify title matches canonical product name
- Confirm no other references changed

Closes: (no PR yet)
Evidence: (local build confirmed)
```

```
fix(versus): repair battle transition FIGHT button

Root cause: [exact failure point traced]

- Handler invoked: [proof]
- State transitions: [proof]
- BattleUI mounts: [proof]
- Camera renders: [screenshot]

Closes: Blocker A
Evidence: Local Versus mode full flow, screenshot in arena
```

### Step 4: Testing Before Push

Each commit should have passing local verification:

```bash
# Before committing
npm run build  # No build errors
npm run test   # Relevant tests pass
npm run play   # Manual smoke test of affected feature

# Record evidence
# Screenshot or video of the fix working
# Console logs showing correct state transitions
# No new warnings or errors
```

### Step 5: Push to Clean Branch

```bash
git push -u origin fix/mobile-live-release-blockers-clean
```

### Step 6: Create Minimal PR (After Root Causes Proven)

PR body template:

```markdown
## Release Blocker Fixes - Tier 1 Verification

Fixes:
- [x] Blocker A: Versus arena transition
- [x] Blocker B: Character model rendering
- [x] Blocker C: Mobile performance
- [x] Blocker D: Roster UI truth
- [x] Blocker E: Duplicate kaijax

Verified on:
- [x] Local build
- [x] Local Versus full flow (screenshot)
- [x] Local Training full flow (screenshot)
- [x] Local mobile viewport (screenshot)
- [ ] Live Vercel deployment (pending)

Root cause traces: see docs/qa/RELEASE_BLOCKER_BOARD_REVIEW.md

Test evidence: docs/qa/TIER_1_VERIFICATION.md (pending)
```

---

## Blocker-by-Blocker Fix Plan

### Blocker A: Versus FIGHT Transition

**Current Status:** UNKNOWN CAUSE

**Step 1: Trace Root Cause**
- Add console.log at onClick handler entry point
- Log after resetPhase(), start(), setGameState()
- Log final gameState and phase values
- Verify App.tsx battleCanvasActive condition evaluates true
- Screenshot showing BattleUI present in DOM

**Step 2: Fix (Once Cause Identified)**
- Narrow fix to exact failure point
- Example: If start() doesn't set phase, add phase write
- Example: If guard prevents state, identify and remove guard
- Do not rewrite entire state machine

**Step 3: Verify**
- FIGHT button → click → state changes → BattleUI visible
- Screenshot in arena with camera rendering
- No console errors

---

### Blocker B: Character Model Rendering

**Current Status:** PIPELINE EXECUTES, RENDER FAILS

**Step 1: Trace Render Failure**
- Add console.log for each pipeline step:
  - mesh.visible (actual value, not just log message)
  - material.opacity (actual value)
  - mesh.scale (x/y/z actual values)
  - scene.children.includes(mesh) (true/false)
  - camera.position (actual values)
  - mesh position (actual world coordinates)

**Step 2: Identify Failure Point**
- Which check fails? (visible, opacity, scale, scene, camera, etc.)
- What is the actual value preventing render?

**Step 3: Fix (Once Cause Identified)**
- Set missing property to correct value
- Example: If mesh.visible is false, set to true
- Example: If opacity is 0, set to 1
- Example: If mesh not in scene.children, add it

**Step 4: Verify**
- Training mode character visible in screenshot
- Animation plays (walk or idle visible)
- No fallback marker visible
- No console errors

---

### Blocker C: Mobile Performance

**Current Status:** SEVERE LAG, ANIMATION ERRORS CONFIRMED

**Step 1: Profile on Mobile**
- Deploy to Vercel
- Open DevTools on mobile viewport
- Measure frame rate (target: 60 FPS)
- Identify largest bottleneck (model loading, rendering, animation, state updates)

**Step 2: Measure Input Latency**
- Test walk input (tap movement button)
- Measure time from tap to visual movement (target: <100ms)
- Identify delay source

**Step 3: Audit Animations**
- Record walk animation (should match skeleton)
- Record punch animation (should show visual impact)
- Compare to working reference (if available)

**Step 4: Fix Largest Bottleneck**
- Once profiling identifies cause, make narrow fix
- Example: If model loading blocks render, add streaming
- Example: If animation interpolation is wrong, fix timeline
- Example: If rendering is inefficient, optimize draw calls

**Step 5: Verify on Live Mobile**
- Retest on Vercel deployment
- Confirm frame rate improved
- Confirm animation visual quality improved
- Screenshot or video evidence

---

### Blocker D: Roster UI Truth

**Fix:** Hide or mark "Coming Soon" all fighters except Tier 1 verified

**Step 1: Select Tier 1 Roster**
- Identify which 4 fighters will be proven playable
- Confirm models, animations, and mobile performance for each

**Step 2: Update Fighter Selection UI**
- Only show Tier 1 fighters in Versus character select
- Mark all others as "Coming Soon" or hide completely
- Update any roster display showing 93 or 157 options

**Step 3: Update Story/Training**
- Confirm only verified fighters assignable to missions
- Hide unproven fighters from training selection

**Step 4: Verify**
- Character select shows only Tier 1 fighters
- "Coming Soon" message visible for others
- No player can select unproven fighters
- No console errors or warnings

---

### Blocker E: Duplicate KAIJAX

**Fix:** Resolve canonical stats, delete duplicate

**Step 1: Identify Canonical Record**
- Compare entry 1 (power: 88, speed: 85, defense: 82) vs entry 2 (power: 92, speed: 90, defense: 88)
- Check model registry for which stats are associated
- Check mission/story usage for stat context
- Check saved profile compatibility concerns

**Step 2: Keep Canonical, Delete Duplicate**
- Update characters.ts line 266-273 OR line 32-39 (delete one)
- Verify model registry points to correct entry
- Verify no mission references broken

**Step 3: Verify**
- characters.ts has only one kaijax entry
- Model registry lookup returns single match
- No React key collisions in character lists

---

## Forensic Branch Disposition

**Branch:** `claude/kai-jax-consolidation-dkfv1r`  
**Status:** Keep for reference, do not merge  
**Archive:** Link in docs for post-release audit trail

The forensic branch provides valuable diagnostic history for understanding what was investigated. It should be preserved as a separate reference but not merged into production code.

---

## Go/No-Go Checklist

**Before creating PR on clean branch:**

- [ ] Blocker A root cause traced and proven
- [ ] Blocker A fix implemented and locally verified
- [ ] Blocker B root cause traced and proven
- [ ] Blocker B fix implemented and locally verified
- [ ] Blocker C profiling complete and bottleneck identified
- [ ] Blocker C fix implemented and mobile-verified
- [ ] Blocker D roster UI updated to show only Tier 1
- [ ] Blocker E duplicate kaijax resolved
- [ ] All commits atomic and focused
- [ ] No temporary audit scripts in tree
- [ ] No console.log removals or forensic comments
- [ ] All tests passing locally
- [ ] No new warnings or errors
- [ ] Tier 1 fighters verified playable in all modes
- [ ] Live Vercel deployment retested
- [ ] Screenshots/videos of fixes recorded

**Before merging to main:**

- [ ] PR reviewed
- [ ] All Tier 1 verification evidence recorded
- [ ] No other commits merged meanwhile
- [ ] CI passes
- [ ] Release ready for limited internal alpha testing

---

## Timeline Estimate

**Only after root causes proven:**

- Branding fix: <30 min
- Versus route fix: 1–2 hours (depends on cause complexity)
- Model visibility fix: 1–4 hours (depends on cause complexity)
- Mobile performance fix: 2–6 hours (depends on bottleneck type)
- Roster UI fix: 1 hour
- Duplicate ID fix: 30 min
- Testing and verification: 2–3 hours
- **Total estimate: 8–16 hours of focused implementation**

**Do not begin implementation until all root causes are proven.**

