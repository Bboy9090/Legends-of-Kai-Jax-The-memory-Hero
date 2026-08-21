# Phase B3: Live Device Testing - Execution Checklist

**Status:** Ready for execution  
**Blocking Gate:** Gate 5 (must pass before merge)  
**Branch:** `fix/model-rendering-clean` (all code complete, ready to test)

---

## Pre-Execution Setup

### Devices Required

**Minimum:**
- [ ] iOS: iPhone SE or newer with Safari (iOS 14+)
- [ ] Android: Mid-range device with Snapdragon 800+ and Chrome

**Recommended:**
- [ ] iPad or Android tablet (landscape testing)
- [ ] Latest OS versions available

### Access to Build

Option A: Preview Deployment (Recommended)
```bash
# Production build already available at:
# URL: [Vercel preview or staging deployment]
# Or build fresh from branch:
git clone https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero
git checkout fix/model-rendering-clean
npm ci
npm run build
npm run preview
```

Option B: Local Dev Server
```bash
git checkout fix/model-rendering-clean
npm ci
npm run dev
# Access at: http://localhost:5173
```

---

## Test Sequence (Per Device)

### Phase B3A: iOS Safari Testing

**Setup:**
- [ ] Clear Safari cache on device
- [ ] Open URL to build
- [ ] Record test start time

**Sequence:**
1. [ ] **Load** — Measure time to main menu
   - Target: < 8 seconds cold start
   - Record: Actual load time, any loading stutters

2. [ ] **Training Mode**
   - [ ] Enter mode (fighter visible?)
   - [ ] Idle animation (stable posture, no jitter?)
   - [ ] Walk (natural arm swing, weight shift? Or still "nails done"?)
   - [ ] Punch (responsive, clean execution?)
   - [ ] Kick (responsive, clean execution?)
   - [ ] Dodge (smooth evasion?)
   - [ ] Perform 5 action cycles continuously

3. [ ] **Versus Mode**
   - [ ] Enter battle (both fighters visible?)
   - [ ] Player fighter responds to touch (latency feel?)
   - [ ] Opponent fighter animates
   - [ ] Battle completes without crash
   - [ ] Run full battle sequence (3-5 minutes)

4. [ ] **Extended Play** (5+ minutes)
   - [ ] Monitor device temperature (warm? hot? acceptable?)
   - [ ] Watch for FPS degradation (smooth throughout?)
   - [ ] No crashes or visual glitches
   - [ ] Battery drain rate (if measurable)

**Recording:**
- [ ] Load time: _____ seconds
- [ ] Animation smoothness: Excellent / Good / Choppy / Other
- [ ] Walk cycle natural: Yes / No / Partial
- [ ] Touch latency: Responsive / Acceptable / Sluggish
- [ ] Device temp: Cool / Warm / Hot / Too hot
- [ ] Crashes/glitches: None / [describe]
- [ ] Overall feel: Production-ready / Needs work / Unplayable

---

### Phase B3B: Android Chrome Testing

**Setup:**
- [ ] Clear Chrome cache on device
- [ ] Open URL to build
- [ ] Record test start time

**Sequence:** Same as iOS (Training → Versus → Extended Play)

**Recording:** Same format as iOS, plus:
- [ ] Chrome WebGL errors: None / [describe]
- [ ] Shader issues: None / [describe]
- [ ] GPU driver quirks: None / [describe]

---

## Pass/Fail Criteria

### Phase B3 PASSES if:

**Both iOS + Android:**
- ✅ Load time < 8 seconds (cold start)
- ✅ All animations play smoothly (≥30 fps perceived)
- ✅ Walk cycle natural (no "nails done" posture)
- ✅ Touch input responsive (< 50ms perceived latency)
- ✅ Versus mode both fighters visible and animated
- ✅ Combat responsive, no input lag
- ✅ Extended play (5+ min) stable, no crashes
- ✅ Thermal behavior acceptable (no throttling to unplayable state)
- ✅ Animation quality matches Phase B2 baseline (57+ fps equivalent feel)

### Phase B3 FAILS if:

**Either iOS or Android:**
- ❌ Fighters invisible or rendering glitches
- ❌ Animation stutters/freezes (FPS < 30 sustained)
- ❌ Walk cycle still unnaturally stiff ("nails done" still visible)
- ❌ Combat unresponsive to input (input lag > 100ms)
- ❌ Crashes within 5 minutes
- ❌ Device thermal throttles to unplayable state
- ❌ Touch latency > 100ms perceived
- ❌ Any critical bugs preventing gameplay

---

## Issue Reporting

If Phase B3 finds issues:

### Critical Issues (blocks merge)
- Invisible fighters
- Crashes during gameplay
- Unplayable FPS (< 20 fps sustained)
- Combat unresponsive to input
- Thermal throttling to unplayable state

**Action:** Document in BLOCKER_B_PHASE_B3_ISSUES.md, escalate for fix

### Minor Issues (polish)
- Animation clip naming edge cases
- Touch latency at upper acceptable boundary
- Thermal warmth (but still playable)

**Action:** Document, can be addressed in Phase C polish

---

## Testing Report Template

```markdown
# Phase B3 Testing Results

**Tester:** [name]
**Date:** [YYYY-MM-DD]
**iOS Device:** [model/OS version]
**Android Device:** [model/OS version]

## iOS Safari Results

| Criterion | Result | Pass? |
|-----------|--------|-------|
| Load time | X sec | ✅/❌ |
| Walk animation | Natural/Stiff | ✅/❌ |
| Touch latency | Responsive/Sluggish | ✅/❌ |
| Thermal | Cool/Hot/Throttled | ✅/❌ |
| 5+ min play | Stable/Crashed | ✅/❌ |

## Android Chrome Results
[Same format]

## Overall Assessment
- iOS: PASS / FAIL
- Android: PASS / FAIL
- Recommendation: Approve for merge / Needs fixes / Unplayable

## Issues Found
[List any bugs, glitches, or anomalies]

---
```

---

## Decision Gate

After testing both devices:

**Both iOS + Android PASS:**
→ ✅ Gate 5 Complete  
→ ✅ Proceed to Gate 6 (Merge)

**One or both FAIL with critical issues:**
→ ❌ Gate 5 Blocked  
→ ❌ Escalate issues for fix  
→ ❌ Retest after fixes

---

## Next Steps

### If Phase B3 Passes:
1. Document results in BLOCKER_B_PHASE_B3_RESULTS.md
2. Commit results to branch
3. Execute Gate 6: Merge to phase1b-production-readiness
4. Execute Gate 7: Production deployment

### If Phase B3 Fails:
1. Document issues in BLOCKER_B_PHASE_B3_ISSUES.md
2. Identify root causes
3. Fix in OptimizedBeastModel or related code
4. Re-test after fixes

---

## Contacts

- **Code Issues:** See OptimizedBeastModel.tsx (rendering fix, animation logic)
- **Animation Issues:** See animation clip selection and crossfading logic (lines 140-183)
- **Escalation:** Blocker B issue for critical blocking problems

---

## Estimated Time

- iOS testing: 15-20 minutes (load + sequences + extended play)
- Android testing: 15-20 minutes (same)
- **Total:** 30-40 minutes per test cycle
- Report writing: 10 minutes

**Total Phase B3 execution time:** ~1 hour (including both devices + reporting)

---

**Branch ready. Awaiting device testing to complete Gate 5.**
