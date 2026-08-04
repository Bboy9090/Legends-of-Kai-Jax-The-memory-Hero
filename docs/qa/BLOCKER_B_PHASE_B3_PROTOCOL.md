# Phase B3: Live Device Validation Protocol

**Purpose:** Validate that animation and rendering improvements work correctly on real mobile hardware (not viewport emulation).

**Status:** ⏳ PENDING (BLOCKING GATE FOR MERGE)

---

## Why Phase B3 is Critical

Phase B2 (mobile simulation) proved viewport emulation performance only:
- Chromium headless browser: 56–58 fps
- Consistent frame timing in sandbox environment
- **Does not prove:** Real iOS/Android GPU behavior, thermal throttling, touch latency, Safari/Chrome WebGL driver quirks

Real device testing captures:
- ✅ Physical GPU performance under actual constraints
- ✅ Thermal throttling behavior (FPS drops under sustained load)
- ✅ Touch input latency (input → visual response time)
- ✅ WebGL driver differences (Safari metal vs Chrome Skia)
- ✅ Battery drain patterns
- ✅ Animation smoothness on actual hardware (not emulation)

---

## Device Requirements

### iOS

**Minimum:**
- iPhone SE (2nd gen or newer)
- iOS 14+ (current or recent major version)
- Safari browser (not Chrome wrapper around WebKit)

**Preferred:**
- iPhone 12 or 13 (representative modern hardware)
- Latest iOS available

**Why:** Safari uses Metal-backed WebGL on iOS; Chromium emulation uses software renderer. Behavior differs significantly.

### Android

**Minimum:**
- Mid-range device (Snapdragon 800 series or equivalent)
- Android 10+ (current or recent major version)
- Chrome browser (latest version)

**Preferred:**
- Snapdragon 888 or newer (representative modern hardware)
- Latest Android available

**Why:** GPU drivers vary by manufacturer and chipset. Mid-range hardware represents typical deployment target.

### Tablet (Optional but Recommended)

- iPad (any current generation) OR Android tablet
- Landscape + portrait orientation testing
- Larger viewport = different animation clip selection paths

---

## Test Sequence (Per Device)

### Phase 3A: Load and Navigation

**Procedure:**
1. Clear browser cache
2. Measure time to load main menu from cold start
3. Navigate through main menu
4. Observe for animation hitches, loading spinners, or visual glitches

**Success Criteria:**
- Load time < 8 seconds (cold start)
- Menu navigation smooth (no freezing)
- No WebGL errors in console
- Canvas renders without flickering

**Record:**
- Actual load time
- Any loading stutters or animation interruptions
- Thermal state of device (warm/hot?)

---

### Phase 3B: Training Mode

**Procedure:**
1. Enter Training Mode
2. Observe idle animation (character standing)
3. Tap/click to move character forward
4. Observe walk animation (character moving)
5. Tap attack button (punch)
6. Tap attack button (kick)
7. Tap dodge/evade button
8. Perform 5+ action cycles continuously

**Validation Checklist:**

| Animation | Check | Pass? | Notes |
|-----------|-------|-------|-------|
| Idle | Pose stable, no jitter | ⬜ | Character breathing pose correct? |
| Walk | Natural arm swing, weight shift | ⬜ | Arms swinging with gait, not locked? |
| Punch | Clean execution, no T-pose | ⬜ | Attack responsive to input? |
| Kick | Clean execution, no T-pose | ⬜ | Kick extends visibly, recovers smoothly? |
| Dodge | Smooth evasion, responsive | ⬜ | Dodge animation plays without interruption? |
| Transitions | Smooth clip blending | ⬜ | No abrupt jumps between animations? |

**Success Criteria:**
- All animations play smoothly (≥30 fps perceived)
- No freezing or jitter
- Touch input responsive (input → animation state change < 50ms visible)
- Walk cycle particularly natural (no "nails done" posture)

**Record:**
- Any animation glitches (stutter, freezing, jitter)
- Perceived FPS (smooth = 60fps, choppy = <30fps)
- Touch latency feel (responsive vs sluggish)
- Device temperature (warm up after 5 minutes?)

---

### Phase 3C: Versus Battle Mode

**Procedure:**
1. Enter Versus Mode
2. Select fighters (Kai-Jax vs opponent)
3. Observe both fighters rendered
4. Perform full combat sequence:
   - Both fighters visible
   - Player fighter responds to controls
   - Opponent fighter AI performs actions
   - Attack animations execute
   - Hit reactions visible
   - Battle completes without crashes

**Validation Checklist:**

| Element | Check | Pass? | Notes |
|---------|-------|-------|-------|
| Visibility | Both fighters visible | ⬜ | No missing/invisible fighters? |
| Animation | Both fighters animate | ⬜ | Opponent AI animations play? |
| Responsiveness | Player fighter responds to input | ⬜ | Touch → action < 50ms? |
| Combat | Hit detection works | ⬜ | Damage applies, HP changes visible? |
| Stability | Battle completes without crash | ⬜ | No fatal errors, no black screen? |

**Success Criteria:**
- Both fighters visible and animated
- Player controls responsive
- Battle completes successfully
- No crashes or fatal errors
- Animation smoothness consistent with Training Mode

**Record:**
- Any rendering glitches (missing geometry, invisible fighters)
- Animation responsiveness during combat
- Device behavior under sustained load (thermal, battery)

---

### Phase 3D: Extended Stress Test

**Procedure:**
1. Play continuous battle for 5+ minutes
2. Monitor device thermal behavior
3. Watch for FPS degradation (animation stuttering)
4. Observe battery drain rate (if measurable)
5. Test rapid input (rapid tapping to trigger attacks, dodges)

**Success Criteria:**
- FPS remains consistent (no dramatic drops)
- Device doesn't overheat excessively (device still holdable)
- Animation doesn't degrade under sustained load
- No crashes after extended play

**Record:**
- Device temperature progression (cool → warm → hot?)
- Any FPS degradation timeline (smooth → choppy at X minutes?)
- Battery drain rate (% per minute if measurable)
- Sustained play issues (crashes, freezes, visual glitches)

---

## Adverse Condition Testing

### Thermal Throttling Observation

**Why:** Mobile GPUs throttle under heat. Animation should degrade gracefully, not crash.

**Test:**
1. Play battle for 5 minutes continuously
2. Observe any FPS drops
3. Record timeline of any visible performance degradation
4. Note if device gets too hot to hold

**Pass Criteria:** Animation remains playable (≥30 fps) even under thermal stress. Graceful degradation OK; crashes not OK.

### Touch Latency

**Why:** Touch input latency affects combat feel. Should be <50ms from tap to visible animation state change.

**Test:**
1. Tap attack button
2. Observe time from tap to punch animation starting
3. Repeat for kick and dodge
4. Subjective feel: responsive vs sluggish?

**Pass Criteria:** Attacks feel responsive (no perceivable lag). Animation starts immediately on input.

### Network Simulation (Optional)

If app makes network requests:
1. Throttle network to 3G
2. Test load time and animation behavior
3. Confirm offline fallbacks work if applicable

---

## Documentation Template

Use this format to document results:

```
## Phase B3 Testing Results

**Tester:** [name]
**Date:** [YYYY-MM-DD]
**Device:** [iPhone SE 2nd gen / Snapdragon 888 device / iPad 9th gen]
**OS Version:** [iOS 16.5 / Android 13]
**Browser:** [Safari / Chrome]

### Load Time
- Cold start: X seconds
- Issues: [none / loading stutter / black screen]

### Training Mode
- Idle: [smooth / jittery]
- Walk: [natural / "nails done" / other]
- Punch: [responsive / delayed]
- Kick: [responsive / delayed]
- Dodge: [responsive / delayed]

### Versus Mode
- Both fighters visible: [yes / no]
- Animation smoothness: [smooth / choppy]
- Combat responsive: [yes / no]
- Battle completed: [yes / crashed]

### Extended Play (5 min)
- FPS consistency: [constant / degraded at X min]
- Device temperature: [cool / warm / hot]
- Battery drain: [not measured / X%/min]
- Crashes: [none / at Y minutes]

### Issues Encountered
[List any glitches, crashes, animation anomalies]

### Recommendations
[Any changes needed before production?]
```

---

## Pass/Fail Criteria

### Phase B3 Passes if:

**iOS:**
- ✅ Load time < 8 seconds (cold start)
- ✅ All animations play smoothly (≥30 fps perceived)
- ✅ Walk cycle natural (no "nails done" posture)
- ✅ Versus mode both fighters visible and animated
- ✅ Combat responsive to input
- ✅ No crashes or fatal errors in 10+ minutes play
- ✅ Touch latency acceptable (<50ms perceived)

**Android:**
- ✅ Same criteria as iOS
- ✅ Chrome browser specific tests (WebGL differences)
- ✅ Thermal behavior acceptable (no throttling to unplayable state)

### Phase B3 Fails if:

- ❌ Fighters invisible or rendering glitches
- ❌ Animation stutters/freezes (FPS < 30 for extended periods)
- ❌ Walk cycle unnaturally stiff (arms locked, "nails done" posture persists)
- ❌ Combat unresponsive to input
- ❌ Crashes within 5 minutes
- ❌ Device thermal throttles to unplayable FPS
- ❌ Touch input lag > 100ms perceived

---

## Escalation Path

If Phase B3 uncovers issues:

1. **Animation-specific issues** (walk still unnatural, attack timing off):
   - Document in BLOCKER_B_PHASE_B3_ISSUES.md
   - Fix in OptimizedBeastModel animation logic
   - Retest before proceeding to merge

2. **Rendering issues** (invisible fighters, glitches):
   - Document issue
   - Review Clone component integration
   - Potentially requires revert or fix

3. **Thermal/performance issues** (throttling, crashes):
   - May require code optimization
   - Or acceptable as known limitation depending on severity

---

## Merge Gate Logic

```
Phase B3 Results:

iOS + Android both pass:
→ ✅ APPROVE FOR MERGE to phase1b-production-readiness

iOS passes, Android issues:
→ ❌ BLOCK (must support Android)

Both fail or critical issues:
→ ❌ BLOCK (requires fix + retest)
```

Only after Phase B3 passes on both iOS + Android devices will this branch be eligible for merge.

