# RELEASE BLOCKER BOARD REVIEW — 2026-08-01

**Release Classification:** PRE-ALPHA / INTERNAL ALPHA  
**Release Decision:** NO-GO  
**PR #222:** DO NOT MERGE  
**Tag:** DO NOT CREATE  
**Public Release:** DO NOT PUBLISH

---

## Board Ruling Summary

The game is not ready for public release. Multiple Tier 1 blockers prevent gameplay validation:

1. **Versus arena route broken** (failure confirmed, root cause unknown)
2. **Character models not rendering** (failure confirmed in Training and live Versus, root cause unknown)
3. **Mobile deployment severe lag and animation errors** (confirmed by user on live deployment)
4. **Roster UI misleads players** (exposes unplayable fighters as selectable)
5. **Core fighter ID mapping incomplete** (Kai/Jax/Kai-Jax/Jaxon/Kaison alias traces required)

**Minimum corrective action:** Prove root causes before implementation. Make one small, honest, visible game slice work instead of attempting full roster.

---

## Roster Classification (Corrected)

### Accurate Breakdown

```
Total Roster Definitions:        157 fighters
Registry-Backed Candidates:       22 entries
  ├─ Asset-Backed Verified:        8 files confirmed to exist
  ├─ Registry-Backed Unaudited:    14 entries not file-verified
  └─ Core Heroes with Aliases:      5 entries (kai, jax, kaijax, jaxon, kaison)

No Registry Coverage:           135 fighters
Runtime-Verified Playable:        0 currently proven
```

### Fighter Classification (by Evidence Level)

| Level | Count | Examples |
|-------|-------|----------|
| ROSTER DEFINED | 157 | All EXTRA_LEGENDS + COMPLETE_BEAST_ROSTER |
| REGISTRY ENTRY EXISTS | 22 | kai, jax, kaijax, jaxon, kaison, voltage-fang, ashen-tiger, blazing-fox, etc. |
| ASSET FILE EXISTS | 8 | voltage-fang, ashen-tiger, blazing-fox, marble-gladiator, granite-colossus, sandstone-sentinel, hyena-scout, rift-drone |
| ASSET-BACKED CANDIDATES | 8 | Above 8 fighters (file presence, not runtime verified) |
| PREVIEW VISUALLY VERIFIED | 0 | None yet screenshotted in Versus preview |
| BATTLE VISUALLY VERIFIED | 0 | None yet confirmed rendering in mission/battle scene |
| ANIMATION VERIFIED | 0 | None yet confirmed playing walk/attack animations |
| VERIFIED PLAYABLE | 0 | None yet proven: selectable → model renders → combat works |

**Critical:** Do not call eight fighters "verified playable." They are asset-backed candidates with unproven runtime visibility and animation.

### Core Heroes Alias Map (Required Proof)

| Roster ID | Registry Lookup | Alias Variants | Asset Path | Request Status |
|-----------|-----------------|-----------------|-----------|-----------------|
| kai | kai | kai_jax, kai-jax | /models/Meshy_AI_Meshy_Merged_Animations4KAI.glb | UNVERIFIED |
| jax | jax | jax_kaijax | /models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb | UNVERIFIED |
| kaijax | kaijax (3 aliases) | kai-jax, kai_jax, KaiJax | /models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb | UNVERIFIED |
| jaxon | jaxon | jaxon-fox (unknown) | /models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb | UNVERIFIED |
| kaison | kaison | kaison-ember (unknown) | /models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb | UNVERIFIED |

**Status:** Registry entries exist for all five core heroes, but runtime model loading is UNVERIFIED.

---

## Tier 1 Blockers (Proven Runtime Failures)

### Blocker A: Versus Arena Route Cannot Reach Battle

**Status:** Confirmed by user (FIGHT button does not transition to battle scene)  
**Root Cause:** UNKNOWN (handler reviewed, exact failure point not traced)  
**Evidence Level:** RUNTIME FAILURE CONFIRMED

**What is proven:**
- FIGHT button clicked → state should change
- beginMatch() handler exists and is called
- Handler writes gameState = "playing"

**What is unknown:**
- Does start() complete successfully?
- Does phase transition to "playing"?
- Does state get overwritten after setGameState()?
- Is there a guard preventing the state branch?
- Does App.tsx mount BattleUI after state write?

**Required Root Cause Trace:**
```
User clicks FIGHT
→ onClick handler invoked (confirm: console.log at entry)
→ resetPhase() called (confirm: phase state)
→ start() called (confirm: result, phase state after)
→ setGameState("playing") called (confirm: gameState state after)
→ App.tsx evaluates battleCanvasActive condition (confirm: line 83-84 evaluates true)
→ BattleUI mounts (confirm: exists in DOM)
→ Camera renders scene (confirm: canvas visible)
```

**Classification:** Do not estimate 2-3 hour fix until exact failure point is known.

---

### Blocker B: Character Models Not Visibly Rendering

**Status:** Confirmed by user in Training mode and live Versus deployment  
**Root Cause:** UNKNOWN (model pipeline partially executes, render failure unproven)  
**Evidence Level:** RUNTIME FAILURE CONFIRMED, CAUSE HYPOTHETICAL

**What is proven (from logs):**
- Model file path resolved correctly
- GLTF file loaded and parsed
- Scene cloned successfully
- Mesh found and material accessed
- Scale and position logged
- Animation configured

**What is NOT proven (required next):
- mesh.visible === true after setup
- material.opacity === 1.0 after update
- mesh is in scene.children (not orphaned)
- mesh.scale actually applied to geometry
- camera positioned to view model
- model within camera frustum
- no other render blocking condition

**Unproven Hypotheses (do not implement fixes for these yet):**
- Camera position mismatch (positionY: 4.832e-8 suggests origin, but camera position unknown)
- Material opacity remains 0 (log shows "materialsUpdated" but not opacity value)
- Mesh visibility flag false despite log (log says "visibility update" not "visible: true")
- Scale not applied (logged value ≠ confirmed applied state)

**Required Root Cause Trace:**
```
Fighter selected (kai-jax)
→ model ID resolved (kaijax)
→ registry lookup executed (returns path: "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb")
→ asset request made (confirm: network tab shows 200)
→ GLTF parsing succeeds (confirm: no parse errors in logs)
→ scene cloned (confirm: childrenCount > 0)
→ mesh extracted (confirm: mesh type and name)
→ materials updated (confirm: opacity = 1.0, not 0)
→ visibility flag set (confirm: mesh.visible === true)
→ scale applied (confirm: mesh.scale.x/y/z actual values)
→ position applied (confirm: mesh.position values)
→ attached to scene (confirm: scene.children.includes(mesh))
→ camera positioned (confirm: camera.position and camera.target)
→ camera frustum check (confirm: bounding sphere visible in frustum)
→ render called (confirm: mesh appears in screenshot)
```

**Classification:** Do not claim camera/material/scale is the issue. Prove which step fails.

---

### Blocker C: Live Mobile Deployment Severe Performance and Animation Issues

**Status:** Confirmed by user on deployed Vercel build  
**Root Cause:** UNKNOWN  
**Evidence Level:** RUNTIME FAILURE CONFIRMED ON LIVE DEPLOYMENT

**User-Observed Symptoms (Tier 1):**
- Severe lag on mobile (frames per second not measured)
- Delayed or ineffective character movement (movement input lag unquantified)
- Incorrect walk pose (arms/hands held unnaturally)
- Punch animations do not visually punch (visual impact missing)
- Kick animations do not visually kick (visual impact missing)
- Training character absent on deployed build
- Versus fighters absent on deployed build
- Wrong campaign/product copy displayed

**Classification:** These are gameplay-critical issues affecting mobile users. Must be measured and fixed before any release.

**Required Investigation:**
- Mobile frame rate measurement (target: 60 FPS, actual: unknown)
- Input-to-render latency (expected: <100ms, actual: unknown)
- Animation timeline vs. visual impact (walk/punch/kick should match skeleton)
- Deployed build vs. localhost differences (bundling, asset paths, optimization state)
- Model loading and streaming on mobile (concurrent requests, memory pressure)

---

### Blocker D: Roster Truth is False

**Status:** Confirmed  
**Root Cause:** UI exposes far more selectable fighters than have proven models  
**Evidence Level:** DESIGN FAILURE CONFIRMED

**Current UI State:**
- Shows 93 or 157 selectable fighters
- Only 0 proven playable in battle
- Only 8 asset files verified to exist
- User can select any fighter and will see fallback or nothing

**Minimum Correction:**
```
Only runtime-proven fighters selectable
All others hidden or marked "Coming Soon"
Do not display 157 or 93 fighters as options
```

---

### Blocker E: Duplicate KAIJAX Entry

**Status:** Confirmed in characters.ts lines 32-39 and 266-273  
**Root Cause:** Two conflicting stat definitions  
**Evidence Level:** CODE BUG CONFIRMED

**Duplicate Details:**
```
Entry 1 (lines 32-39):   power: 88,  speed: 85,  defense: 82
Entry 2 (lines 266-273): power: 92,  speed: 90,  defense: 88
```

**Impact:** React key collision, canonical record unclear

**Required Action:** Identify which stats are canonical, delete duplicate, update model registry if needed.

---

### Blocker F: React Key Warnings for jaxon and kaison

**Status:** Warnings observed in console  
**Root Cause:** UNKNOWN (possible duplicate entries in COMPLETE_BEAST_ROSTER)  
**Evidence Level:** CODE WARNING CONFIRMED

**Investigation Required:**
- Search COMPLETE_BEAST_ROSTER for jaxon and kaison entries
- Confirm whether BEAST_WARS_FIGHTERS contains duplicates
- If duplicates exist, merge stats or remove one

---

## Proven Facts

✅ **Confirmed Working:**
- Mission selection and CTA visible
- Campaign map renders
- Training mode launches
- Menu navigation functional
- Mission briefing displays

❌ **Confirmed Broken:**
- Versus arena transition (route failure)
- Training character model rendering (fallback visible only)
- Live mobile performance (lag and animation errors)
- Roster UI honesty (exposes unplayable fighters)

❓ **Unproven (Hypotheses, Not Facts):**
- Specific camera position causes invisibility
- Material opacity causes invisibility
- Model attachment or visibility flag causes failure
- Performance bottleneck is model loading vs. animation processing vs. rendering

---

## Work Estimates

**REMOVED:** Guessed timelines (2-3 weeks, 2-3 hours, 4-8 hours, 8+ hours).

**Correct approach:** Prove root causes first, then estimate fixes.

---

## Minimum Tier 1 Release Roster

Do not attempt to make all 157 fighters work. For the first honest MVP candidate:

### Required Fighters (4 slots, overlap allowed)

```
Story Mode:
  - One canonical player character (must render, move, attack)
  
Training Mode:
  - One visible fighter (must render, move, attack)
  
Versus Mode:
  - Exactly two visible fighters
  - Must both render in preview and battle
  - Must complete one attack exchange
  - Must exit safely
```

### Verification Checklist (Per Tier 1 Fighter)

- [ ] Selectable in UI without error
- [ ] Model request succeeds (200 status)
- [ ] Preview screenshot shows character visible
- [ ] Battle screenshot shows character visible
- [ ] Idle animation plays
- [ ] Walk animation plays
- [ ] Light attack animation plays
- [ ] Heavy attack animation plays
- [ ] No fatal console errors
- [ ] Mobile input responsive
- [ ] No lag spike on selection

---

## Implementation Priority (Proven Blockers Only)

1. **Prove Versus FIGHT transition root cause** (Required: exact failure point, not hypothesis)
2. **Prove Training model visibility root cause** (Required: which step fails in render pipeline)
3. **Prove mobile performance bottleneck** (Required: frame rate measurement, profiling data)
4. **Resolve core fighter ID/alias mapping** (Required: confirm kai/jax/kaijax/jaxon/kaison resolve correctly)
5. **Select and verify Tier 1 roster** (Required: 4 fighters max that pass all checks)
6. **Hide or Coming Soon all unverified fighters** (Required: UI change to match reality)
7. **Fix duplicate KAIJAX entry** (Required: canonical stats identified)
8. **Fix duplicate jaxon/kaison warnings** (Required: BEAST_WARS_ROSTER audit)
9. **Make one fighter locomotion/combat visually correct** (Required: walk/punch/kick animations match visual impact)
10. **Measure and fix largest performance bottleneck** (Required: profiling data, not guesses)
11. **Retest all Tier 1 flows on live mobile Vercel** (Required: screenshot or video evidence)

---

## Stop Conditions (Critical)

❌ **DO NOT:**
- Attempt 157-character full roster work
- Add new missions beyond current set
- Add new combat mechanics
- Create release tag
- Merge this branch to main
- Claim "fully playable" without runtime proof
- Use menu screenshots as gameplay proof

✅ **DO:**
- Trace exact root causes with evidence
- Make narrow, proven fixes only
- Screenshot/video all fixes in action
- Retest locally after each fix
- Retest live mobile deployment before claiming ready
- Hide unproven fighters from UI

---

## Clean Implementation Branch Strategy

### Branch Plan

**Create:** `fix/mobile-live-release-blockers-clean`  
**From:** `phase1b-production-readiness @ 038d88d0`  
**Do NOT merge:** `claude/kai-jax-consolidation-dkfv1r` (forensic branch)

### Approved Commits (Cherry-Pick Only)

```
1. fix(branding): restore canonical Memory Hero title
2. fix(versus): repair battle transition (after root cause proven)
3. fix(roster): expose only runtime-supported fighters
4. fix(models): restore visible Tier 1 fighter rendering (after cause proven)
5. fix(animation): align Tier 1 locomotion and attacks
6. fix(performance): remove measured gameplay bottleneck
7. fix(duplicate-kaijax): resolve canonical stats
8. test(release): add Tier 1 gameplay regression coverage
9. docs(qa): record live blocker retest evidence
```

### NOT Cherry-Picked

- Temporary audit scripts (task2-scene-trace.mjs, task4-roster-audit.mjs, etc.)
- Exploratory console.log additions
- Forensic comments or investigation notes
- Intermediate report edits

---

## Next Immediate Actions

1. Root cause trace for Versus FIGHT transition (exact failure point)
2. Root cause trace for Training model visibility (which pipeline step fails)
3. Mobile performance profiling (frame rate, input latency)
4. Tier 1 fighter selection (confirm which 4 fighters to focus on)
5. Create clean branch and cherry-pick approved fixes

**Do not begin implementation until root causes are proven.**

