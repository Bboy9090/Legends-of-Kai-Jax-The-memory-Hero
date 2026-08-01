# Root Cause Trace Guide — Execute On Your Machine

**Date:** 2026-08-01  
**Purpose:** Step-by-step instructions to capture root cause evidence for three Tier 1 blockers

---

## Overview

The codebase has been instrumented with detailed console logging at each step of the three critical flows. This guide shows you exactly how to trigger each blocker and read the console logs to identify the root cause.

**Why manual testing?** The blockers require runtime observations from the actual browser environment, which is more reliable when done through interactive debugging rather than headless automation.

---

## Prerequisites

- [ ] Code is built: `npm run build` (already done)
- [ ] Preview server running: `npm run preview` on port 4174 (or live Vercel URL)
- [ ] Browser with DevTools: Chrome, Firefox, or Edge
- [ ] Clean console (no leftover logs from previous tests)

---

## BLOCKER A: Versus FIGHT Transition — Root Cause Trace

### What's Being Tested

When user clicks FIGHT button in Versus mode, does the game transition to battle arena?

### Setup (60 seconds)

```
1. Open DevTools (F12)
2. Go to Console tab
3. Type: clear()  (press Enter)
4. Keep DevTools visible during test
```

### Execute Trace (90 seconds)

```
Step 1: Navigate to Versus Mode
  → Open http://localhost:4174/
  → Wait for main menu to load (~3 seconds)
  → Click "VERSUS" button
  → EXPECTED: Character select screen loads with 3D fighter preview

Step 2: Prepare to Click FIGHT
  → Look at console for any initial logs
  → Locate the FIGHT button (large button with fighter's accent color)

Step 3: [CRITICAL] Click FIGHT Button
  → Watch the console in real-time
  → EXPECTED logs (in order):
     [Blocker A Trace] beginMatch invoked { training: false, selectedId: '...' }
     [Blocker A Trace] After resetPhase (1)
     [Blocker A Trace] Fighter assignments complete
     [Blocker A Trace] Opponent assigned: { opponentId: '...' }
     [Blocker A Trace] After resetPhase (2)
     [Blocker A Trace] After start()
     [Blocker A Trace] After setGameState("playing")
     [Blocker A Trace] App render { phase: 'playing', gameState: 'playing', battleCanvasActive: ? }

Step 4: Check Result
  → If you see: battleCanvasActive: true
     ✅ STATE TRANSITION WORKING → battle should be visible
  → If you see: battleCanvasActive: false
     ❌ STATE TRANSITION FAILED → character select stays visible
  → If you see NO [Blocker A Trace] logs at all
     ❌ HANDLER NEVER CALLED → onClick binding broken
```

### Critical Properties to Look For

**In the logs, find this line:**
```
[Blocker A Trace] App render { phase: 'playing', gameState: 'playing', battleCanvasActive: ??? }
```

**What should battleCanvasActive be?**
- `true` → ✅ BattleUI should mount, canvas should render
- `false` → ❌ BattleUI won't mount, battle arena won't show

### Save Evidence

```
Right-click in console → Copy all
Paste into text file: blocker-a-console-logs.txt

Also take screenshot:
  - Focus on the canvas/screen area
  - Show either: battle arena (3D fighters) OR character select still visible
  Save as: blocker-a-screenshot.png
```

### Expected Failure Scenarios

| Scenario | Evidence | Conclusion |
|----------|----------|-----------|
| No [Blocker A Trace] logs | Click didn't trigger handler | onClick event broken |
| Logs stop after start() | State write interrupted | exception or guard blocking |
| battleCanvasActive: false | Condition failed | phase or gameState wrong |
| battleCanvasActive: true but no canvas | Component mount failed | BattleUI has error |

---

## BLOCKER B: Character Model Rendering — Root Cause Trace

### What's Being Tested

Does the character model load and render in Training mode, or only the fallback marker?

### Setup (60 seconds)

```
1. Open DevTools (F12)
2. Go to Console tab  
3. Type: clear()  (press Enter)
4. Keep DevTools visible during test
```

### Execute Trace (90 seconds)

```
Step 1: Navigate to Training Mode
  → Open http://localhost:4174/
  → Wait for main menu to load (~3 seconds)
  → Click "TRAINING" button
  → EXPECTED: Training arena loads with 3D environment

Step 2: Watch Console for Model Loading Logs
  → Console should show (in order):
     [VersusCharacterSelect] Fighter selection trace
     [OptimizedBeastModel] Cloned scene: childrenCount: 1
     [OptimizedBeastModel] Trace: resolvedPath: /models/Meshy_AI_...
     [OptimizedBeastModel] Scene loaded: childrenCount: 1, animationCount: 2
     [OptimizedBeastModel] Mesh visibility update: meshesFound: 1, materialsUpdated: 1
     [OptimizedBeastModel] Bounding box: height: 1.7, isFinite: true
     [OptimizedBeastModel] Scaling applied: scale: 1.294, positionY: 4.832e-8
     [OptimizedBeastModel] Animation setup: selectedAction: Running

Step 3: Check for Critical Property Values
  → Look for these SPECIFIC values (not just status messages):
     opacity: 1.0  (NOT 0, NOT missing)
     visible: true  (NOT false)
     scale: 1.294  (or similar > 0)
     positionY: near 0  (NOT 100+, NOT -100+)

Step 4: Visual Check
  → Look at the canvas/game screen
  → Do you see:
     A) Green circle fallback marker (no model) → ❌ RENDERING FAILED
     B) 3D character model visible → ✅ RENDERING WORKING
     C) Nothing at all → ❌ CANVAS NOT RENDERING
```

### Critical Properties to Extract

**From logs, find and note:**

```
opacity: ___  (should be 1.0, if 0 then material invisible)
visible: ___  (should be true, if false then mesh hidden)
scale: ___    (should be > 0, if 0 then model tiny)
position Y: ___  (should be near 0, if ±100+ then off-screen)
meshesFound: ___  (should be 1 or more, if 0 then mesh extraction failed)
```

### Save Evidence

```
Right-click in console → Copy all
Paste into: blocker-b-console-logs.txt

Also take screenshot:
  - Show the Training arena
  - If you see: green circle fallback → model failed
  - If you see: character model → model rendering
  Save as: blocker-b-training-arena.png
```

### Expected Failure Scenarios

| Scenario | Evidence | Conclusion |
|----------|----------|-----------|
| meshesFound: 0 | Mesh not found in scene | Scene tree doesn't contain mesh |
| opacity: 0 | Material opacity is zero | Material invisible (opacity not set) |
| visible: false | Mesh visibility flag false | Visibility flag not set to true |
| scale: 0 | Scale not applied | Scale application failed |
| positionY: 100+ | Position way off | Camera/position mismatch |
| Fallback marker visible | Model failed to render | One of above issues |

---

## BLOCKER C: Mobile Performance — Requires Live Vercel

### What's Being Tested

On mobile device, is the game responsive (FPS, input latency) and do animations look correct?

### Setup (Deployment Dependent)

```
1. Branch pushed: fix/mobile-live-release-blockers
2. Vercel creates preview deployment (~2 minutes)
3. Get preview URL from GitHub PR comments
4. Test on actual mobile device OR mobile emulation
```

### Execute Trace (Mobile Device)

```
Step 1: Connect Chrome DevTools to Mobile
  → On desktop: Chrome → DevTools
  → In DevTools: F12 → click "..." → More tools → Remote devices
  → Click "Inspect" on the mobile device
  → Navigate to Vercel preview URL

Step 2: Enable Performance Measurements
  → DevTools → Performance tab
  → Enable FPS counter: DevTools ... → More tools → Rendering → FPS meter

Step 3: Start Battle on Mobile
  → Click VERSUS
  → Select any fighter
  → Click FIGHT
  → Enter battle arena

Step 4: Measure Frame Rate (30 seconds)
  → Watch FPS meter
  → Record:
     Average FPS: ___  (target: 60, acceptable: 30, bad: <20)
     Dropped frames: ___ (none = smooth, many = lag)
  → Take screenshot of FPS meter

Step 5: Measure Input Latency
  → Click movement button (walk left/right)
  → In Performance timeline, mark:
     Input event time: ___
     First visual movement: ___
     Latency = difference in milliseconds
  → Target: < 100ms, acceptable: < 200ms, bad: > 200ms

Step 6: Record Animation Quality Video
  → Start recording (30 seconds)
  → Walk the character (watch arm movement)
  → Punch the opponent (watch fist extension)
  → Kick the opponent (watch leg extension)
  → Compare against localhost reference video
  → Save as: blocker-c-animation-quality.mp4
```

### Critical Measurements to Capture

```
FPS Measurement:
  Average: _____ FPS (target 60, acceptable 30, fail <20)
  Min: _____ FPS
  Max: _____ FPS
  Dropped frames: _____ (count)

Input Latency:
  Walk response time: _____ ms (target <100ms)
  Punch response time: _____ ms (target <100ms)
  Kick response time: _____ ms (target <100ms)

Animation Quality (yes/no):
  Walk animation smooth: yes/no
  Arms swing naturally: yes/no
  Punch visually impacts: yes/no
  Kick visually impacts: yes/no
```

### Save Evidence

```
Screenshots:
  - FPS meter showing average FPS: blocker-c-fps-meter.png
  - Performance timeline showing input to render: blocker-c-input-latency.png

Video:
  - 30 second battle showing animations: blocker-c-animation-quality.mp4
  - Comparison: localhost (good reference) vs. Vercel (test)

Notes:
  - Network connection type: 4G/5G/WiFi
  - Device type: iPhone/Android/etc
  - Mobile browser: Chrome/Safari/etc
  - Measurements: into blocker-c-measurements.txt
```

### Expected Failure Scenarios

| Scenario | Evidence | Conclusion |
|----------|----------|-----------|
| FPS < 30 | Performance meter shows low FPS | Render bottleneck (model complexity, shader, canvas resolution) |
| Latency > 200ms | Input event → visual movement takes >200ms | Input processing or state update lag |
| Animation stiff | Arms don't swing, legs don't extend | Animation interpolation broken or FPS too low |
| Punch/kick no impact | Visual impact missing, no knockback | Animation frame/visual disconnect |
| Training model absent | Only fallback marker visible | Same as Blocker B (model rendering fails) |

---

## Summary: What Happens Next

After you complete the traces and save the evidence files:

### Blockers A & B (Localhost Testing)
1. You capture console logs showing exact failure point
2. Share logs and screenshots with development team
3. Developer implements narrow fix
4. Developer tests fix locally and verifies closure

### Blocker C (Mobile Testing)
1. You measure FPS, latency, and record animation quality on live Vercel
2. Share measurements and video with development team
3. Developer identifies bottleneck and implements fix
4. Developer retest on live mobile Vercel to verify

### Root Cause Evidence Checklist

- [ ] **Blocker A**: Console logs showing state transitions and battleCanvasActive value
- [ ] **Blocker A**: Screenshot showing battle arena OR character select after FIGHT
- [ ] **Blocker B**: Console logs showing property values (opacity, visible, scale, position)
- [ ] **Blocker B**: Screenshot showing character model OR fallback marker in training
- [ ] **Blocker C**: FPS measurements from live Vercel mobile
- [ ] **Blocker C**: Input latency measurements from live Vercel mobile
- [ ] **Blocker C**: Video showing animation quality on live Vercel vs localhost
- [ ] **All**: Organized into results directory with clear filenames

### Files to Submit

```
/path/to/trace-results/
├── blocker-a-console-logs.txt
├── blocker-a-screenshot.png
├── blocker-b-console-logs.txt
├── blocker-b-training-arena.png
├── blocker-c-measurements.txt
├── blocker-c-fps-meter.png
├── blocker-c-input-latency.png
├── blocker-c-animation-quality.mp4
└── TRACE_SUMMARY.md  (write-up of findings)
```

---

## How to Read Console Logs

### Filtering Relevant Logs
```
In DevTools Console:
1. Type: filter()  (if your browser supports it)
2. Or, ctrl+f and search for:
   - "[Blocker A Trace]" for Versus route logs
   - "[OptimizedBeastModel]" for model rendering logs
   - "[App render]" for state condition evaluation
```

### Extracting Property Values
```
When you see:
  [OptimizedBeastModel] Scaling applied: scale: 1.294, positionY: 4.832e-8

Extract:
  scale: 1.294
  positionY: 4.832e-8
  
NOT just "scaling applied" (that's not enough detail)
```

### Copying Full Console Output
```
Right-click in console area → Select All
Ctrl+C to copy
Paste into text file
Or: DevTools "Export" feature if available
```

---

## Troubleshooting

### "I don't see any [Blocker X] logs"
- Clear console (type: clear())
- Refresh page (F5)
- Make sure you're testing against the right URL
- Check browser console settings (may be filtering errors)

### "The [logs] appear but are cut off"
- DevTools console has line length limit
- Right-click log → Store as global variable
- Or: Open DevTools Network tab to see raw logs
- Or: Check browser's "Console Storage" settings

### "Character select won't open"
- Make sure `npm run preview` is running on port 4174
- Check browser network tab for 404/500 errors
- Clear browser cache (Ctrl+Shift+Delete)

### "No FIGHT button visible"
- Wait longer for page to load (3-5 seconds)
- Verify browser zoom is 100% (Ctrl+0)
- Try different browser (Chrome, Firefox)
- Check console for JavaScript errors

---

## Final Checklist

Before submitting evidence:

- [ ] Console logs are **complete** (from click through to final state)
- [ ] Property values are **actual numbers** (not just "updated" status)
- [ ] Screenshots are **clear and show the full game screen**
- [ ] Videos are **30 seconds minimum** showing animations
- [ ] All files are **named clearly** with blocker letter and content
- [ ] Evidence is **organized** in single directory
- [ ] Notes explain **what worked and what failed**

---

## Need Help?

If tests are unclear or evidence is ambiguous, refer back to:
- `docs/qa/ROOT_CAUSE_TRACE_REQUIREMENTS.md` — detailed proof standards
- `docs/qa/RELEASE_BLOCKER_BOARD_REVIEW.md` — what each blocker means
- `docs/qa/BOARD_RULING_IMPLEMENTATION_STATUS.md` — next steps after trace

