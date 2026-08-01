# Blocker C: Mobile Performance Testing Guide

**Date:** 2026-08-01  
**Purpose:** Measure FPS, input latency, and animation quality on live Vercel mobile deployment

---

## Quick Start

1. **Get Vercel Preview URL**
   - Option A: From GitHub PR checks/comments
   - Option B: From Vercel dashboard
   - Option C: Run `vercel env pull && vercel preview` locally

2. **Test on Mobile Device or Chrome DevTools Mobile Emulation**
   - Follow testing sequence below
   - Record measurements in template provided
   - Save screenshots/videos as evidence

3. **What to Test**
   - Versus FIGHT transition (now fixed)
   - Battle arena FPS and responsiveness
   - Character movement input latency
   - Animation quality (walk, punch, kick)

---

## Test Environment Setup

### Prerequisites
- Live Vercel deployment URL (preview or production)
- Mobile device OR desktop with Chrome DevTools mobile emulation
- Stopwatch or Performance API access for timing measurements
- Screenshot/video capability

### Device Options

**Option 1: Actual Mobile Device**
- iPhone/iPad (Safari or Chrome)
- Android (Chrome)
- Recommended for authentic performance metrics

**Option 2: Chrome DevTools Mobile Emulation**
- Desktop Chrome with DevTools open
- Emulates: Pixel 5, iPhone 12, iPad, etc.
- Enables: throttling, FPS counter, Performance tab
- Limitation: CPU/GPU throttling may not match real device

**Option 3: Remote Mobile Debugging**
- Connect physical mobile to desktop via USB
- Chrome DevTools remotely inspect mobile browser
- Access: chrome://inspect on desktop
- Best for real device + full DevTools access

---

## Testing Sequence (30-45 minutes)

### Phase 1: Navigation & Load (5 min)

**Setup:** Navigate to Vercel URL on mobile device

1. Open Vercel preview URL in mobile browser
2. Wait for app to load (note load time)
3. Verify menu loads correctly
4. Screenshot: Main menu on mobile viewport

**Record:**
- Load time: _____ seconds
- Menu visible: Yes / No
- No JavaScript errors in console: Yes / No

---

### Phase 2: FPS Measurement (10 min)

**Setup:** Enable FPS counter and start battle sequence

#### Using Chrome DevTools Mobile Emulation (Desktop)
```
1. Open Chrome on desktop
2. Press F12 to open DevTools
3. Click "..." → More tools → Rendering → Show FPS meter
4. Navigate to Vercel URL
5. Emulate mobile device (F12 → Device toolbar icon)
```

#### Using Mobile Device + Remote Debug
```
1. On Android: Enable Developer Options → USB Debugging
2. Connect via USB cable
3. On desktop Chrome: chrome://inspect
4. Click "Inspect" on target device
5. In DevTools: More tools → Rendering → Show FPS meter
```

#### Using Chrome Performance API (In-Browser Measurement)
```JavaScript
// Open mobile browser console and paste:
const fps = [];
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
  const now = performance.now();
  const delta = now - lastTime;
  
  if (delta >= 1000) {
    fps.push(frameCount);
    console.log(`FPS: ${frameCount} (${(frameCount / (delta/1000)).toFixed(1)} avg)`);
    frameCount = 0;
    lastTime = now;
  } else {
    frameCount++;
  }
  
  requestAnimationFrame(measureFPS);
}

measureFPS();

// After 30 seconds, check console output
// Calculate: average FPS = sum(fps) / fps.length
```

**Battle Sequence:**
1. Click VERSUS button
2. Select character (any fighter)
3. Click FIGHT to enter battle
4. Wait 30 seconds while observing FPS counter
5. Record peak, minimum, and average FPS

**Record:**
- Average FPS: _____ (target: 60, acceptable: 30, fail: <20)
- Peak FPS: _____ 
- Minimum FPS: _____ 
- Dropped frames: _____ (count of frames <30 FPS)
- FPS chart: [Save screenshot or description]

---

### Phase 3: Input Latency Measurement (10 min)

**Setup:** Measure time from button click to visual response

#### Using DevTools Performance Timeline (Recommended)
```
1. Open DevTools on mobile or remote debug
2. Go to Performance tab
3. Click record (red circle)
4. Click movement button (left/right arrow) once
5. Stop recording after 2-3 seconds
6. In timeline, find:
   - "click" event at position X
   - First "paint" or "renderstart" after click at position Y
   - Latency = Y - X (in milliseconds)
```

#### Manual Stopwatch Method
```
1. Have stopwatch/timer app ready
2. Start timer when pressing input button
3. Stop timer when character visibly moves
4. Record latency
5. Repeat 3 times, calculate average
```

**Test Inputs:**
- Walk left/right: Click directional input
- Punch: Click punch button
- Kick: Click kick button

**Record for each input:**
- Walk response time: _____ ms (target: <100ms)
- Punch response time: _____ ms (target: <100ms)
- Kick response time: _____ ms (target: <100ms)
- Average latency: _____ ms

---

### Phase 4: Animation Quality (10 min)

**Setup:** Visual inspection and video recording

#### Part A: Walk Animation
```
1. In battle, hold left movement button for 3 seconds
2. Observe character walk animation
3. Check:
   - Arms swing naturally left/right: Yes / No
   - Legs alternate smoothly: Yes / No
   - Upper body posture correct: Yes / No
   - Animation loops without stuttering: Yes / No
4. If possible, record 5-second video
```

**Record:**
- Walk animation smooth: Yes / No
- Arms swing naturally: Yes / No
- Legs move correctly: Yes / No
- Comments: _______________________

#### Part B: Punch Animation
```
1. Position character near opponent
2. Click punch button
3. Observe punch animation
4. Check:
   - Fist extends toward opponent: Yes / No
   - Visual impact feedback (knockback): Yes / No
   - Animation completes without interruption: Yes / No
   - Return to idle position smooth: Yes / No
5. Record video if possible
```

**Record:**
- Punch visually impacts: Yes / No
- Knockback visible: Yes / No
- Animation smooth: Yes / No
- Comments: _______________________

#### Part C: Kick Animation
```
1. Position character near opponent
2. Click kick button
3. Observe kick animation
4. Check:
   - Leg extends with full range: Yes / No
   - Visual impact feedback: Yes / No
   - Animation completes smoothly: Yes / No
   - Balance maintained: Yes / No
5. Record video if possible
```

**Record:**
- Kick visually impacts: Yes / No
- Knockback visible: Yes / No
- Animation smooth: Yes / No
- Comments: _______________________

#### Part D: Overall Animation Quality (Comparison)
```
Compare mobile performance to:
1. If tested on localhost: Compare FPS and smoothness
2. Reference video: Compare to expected quality baseline
```

**Record:**
- Mobile matches localhost quality: Yes / Partial / No
- Animations are "acceptable" for mobile: Yes / No
- Major issues observed: _______________________

---

### Phase 5: Performance Profile Summary (5 min)

**System Information**
- Device: _____________________ (iPhone 12, Pixel 6, etc.)
- Mobile browser: _____________________ (Safari, Chrome)
- Network connection: _____________________ (WiFi, 4G, 5G)
- Network speed: _____________________ (Mbps down/up if measurable)

**Key Metrics**
```
FPS Performance:
  Average: _____ (✅ >60 / ⚠️  30-60 / ❌ <30)
  Minimum: _____ 
  Dropped frames: _____
  
Input Latency:
  Walk: _____ ms (✅ <100 / ⚠️  100-200 / ❌ >200)
  Punch: _____ ms (✅ <100 / ⚠️  100-200 / ❌ >200)
  Kick: _____ ms (✅ <100 / ⚠️  100-200 / ❌ >200)
  
Animation Quality:
  Walk: ✅ Good / ⚠️  Acceptable / ❌ Poor
  Punch: ✅ Good / ⚠️  Acceptable / ❌ Poor
  Kick: ✅ Good / ⚠️  Acceptable / ❌ Poor
```

---

## Evidence Capture

### Screenshots to Take
1. `blocker-c-mobile-menu.png` — Main menu on mobile viewport
2. `blocker-c-character-select.png` — Character selection screen
3. `blocker-c-battle-arena.png` — Battle in progress
4. `blocker-c-fps-meter.png` — FPS counter showing average
5. `blocker-c-devtools-performance.png` — Performance timeline latency measurement

### Videos to Record (30 seconds each)
1. `blocker-c-walk-animation.mp4` — Character walking, showing arm/leg movement
2. `blocker-c-punch-animation.mp4` — Character punching opponent
3. `blocker-c-kick-animation.mp4` — Character kicking opponent
4. `blocker-c-full-battle-30sec.mp4` — Full battle sequence showing all animations and FPS

### Console Logs (if available)
- Screenshot or copy of browser console
- Any errors or warnings related to rendering/performance

---

## Measurement Template

Copy and fill this template with your results:

```
═══════════════════════════════════════════════════════════════
BLOCKER C: MOBILE PERFORMANCE MEASUREMENTS
═══════════════════════════════════════════════════════════════

Test Date: _______________________
Device: _______________________
Browser: _______________________
Network: _______________________

FPS METRICS
───────────────────────────────────────────────────────────────
Average FPS: _____  Status: ✅ / ⚠️  / ❌
Peak FPS: _____
Minimum FPS: _____
Dropped frames: _____
Assessment: ________________________________________

INPUT LATENCY METRICS
───────────────────────────────────────────────────────────────
Walk latency: _____ ms  Status: ✅ / ⚠️  / ❌
Punch latency: _____ ms  Status: ✅ / ⚠️  / ❌
Kick latency: _____ ms  Status: ✅ / ⚠️  / ❌
Average latency: _____ ms
Assessment: ________________________________________

ANIMATION QUALITY
───────────────────────────────────────────────────────────────
Walk animation: ✅ Good / ⚠️  Acceptable / ❌ Poor
  - Arms swing naturally: Yes / No
  - Legs move correctly: Yes / No
  - Smooth transitions: Yes / No

Punch animation: ✅ Good / ⚠️  Acceptable / ❌ Poor
  - Visually impacts: Yes / No
  - Knockback visible: Yes / No
  - Returns to idle smooth: Yes / No

Kick animation: ✅ Good / ⚠️  Acceptable / ❌ Poor
  - Visually impacts: Yes / No
  - Knockback visible: Yes / No
  - Full range extension: Yes / No

Overall quality vs localhost: ✅ Matches / ⚠️  Degraded / ❌ Poor

ISSUES IDENTIFIED
───────────────────────────────────────────────────────────────
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

PASS/FAIL VERDICT
───────────────────────────────────────────────────────────────
FPS Target Met (avg ≥60): ⭐ Yes / ⭕ No
Latency Target Met (avg <100ms): ⭐ Yes / ⭕ No
Animation Quality Acceptable: ⭐ Yes / ⭕ No
Game Playable on Mobile: ⭐ Yes / ⭕ No

OVERALL BLOCKER C STATUS: ✅ PASS / ⚠️  CONDITIONAL / ❌ FAIL

Comments: ________________________________________
═══════════════════════════════════════════════════════════════
```

---

## Interpretation Guide

### FPS Results
| Average FPS | Status | Meaning |
|---|---|---|
| ≥60 | ✅ PASS | Smooth, fluid motion |
| 30-59 | ⚠️  ACCEPTABLE | Playable but noticeably less fluid |
| <30 | ❌ FAIL | Unplayable, severe stuttering |

### Input Latency Results
| Average Latency | Status | Meaning |
|---|---|---|
| <100ms | ✅ PASS | Responsive, no noticeable delay |
| 100-200ms | ⚠️  ACCEPTABLE | Slight delay but playable |
| >200ms | ❌ FAIL | Input feels unresponsive |

### Animation Quality
| Status | Meaning |
|---|---|
| ✅ Good | Animations smooth, natural, match desktop |
| ⚠️  Acceptable | Some jitter or reduced smoothness but playable |
| ❌ Poor | Significant stuttering, unnatural motion, poor impact |

---

## Release Criteria for Blocker C

**PASS Criteria (All must be true):**
- [ ] Average FPS ≥ 30 (target 60)
- [ ] Average input latency < 200ms (target <100ms)
- [ ] Walk animation smooth and natural
- [ ] Punch animation visually impacts
- [ ] Kick animation visually impacts
- [ ] No crashes or console errors
- [ ] Game is playable end-to-end

**FAIL Criteria (Any true = FAIL):**
- [ ] Average FPS < 20 (unplayable)
- [ ] Average input latency > 300ms (input unusable)
- [ ] Animations frozen or unresponsive
- [ ] Game crashes during testing
- [ ] Character falls through arena
- [ ] Opponent doesn't respond to hits

---

## Troubleshooting

### FPS Meter Not Showing
- Chrome: DevTools → Rendering → Check "Show frames per second"
- Mobile: Use Performance API method above
- Fallback: Use Safari Web Inspector on iOS

### Performance Measurements Unreliable
- Clear browser cache
- Close other tabs/apps
- Disable Chrome extensions
- Test multiple times, average results

### Animations Look Different on Mobile
- This is expected due to FPS/GPU differences
- Compare to 30fps baseline, not 60fps
- Check if motion is coherent, not jerky

### Input Doesn't Work
- Verify touch controls visible on mobile
- Check DevTools console for JavaScript errors
- Test in different mobile browser
- Try portrait vs landscape orientation

---

## Comparison: Localhost vs Vercel Mobile

**Expected Differences:**
- Localhost: Better FPS, faster response (development environment)
- Vercel Mobile: Slightly lower FPS, network latency added
- Normal ratio: Vercel ~70-80% of localhost performance

**What's Acceptable:**
- FPS drop: 60fps → 40-50fps acceptable
- Latency increase: 30ms → 80-120ms acceptable
- Animation quality: Slight smoothness loss acceptable

**What's NOT Acceptable:**
- Frame drops from 60fps to <20fps
- Latency >300ms (feels broken to user)
- Animations becoming choppy/jittery
- Complete loss of responsiveness

---

## Next Steps

1. **Execute Testing:** Use this guide on live Vercel deployment
2. **Record Results:** Fill measurement template completely
3. **Save Evidence:** Capture screenshots and videos
4. **Analyze:** Compare to pass/fail criteria
5. **Report:** Document findings in Blocker C summary
6. **Decide:** Release-ready or requires optimization

---

## Files to Submit After Testing

```
blocker-c-results/
├── measurements.txt (filled template)
├── blocker-c-mobile-menu.png
├── blocker-c-battle-arena.png
├── blocker-c-fps-meter.png
├── blocker-c-devtools-performance.png
├── blocker-c-walk-animation.mp4
├── blocker-c-punch-animation.mp4
├── blocker-c-kick-animation.mp4
└── blocker-c-full-battle-30sec.mp4
```

---

**Status:** Ready for live Vercel mobile testing
**Target:** Complete testing within 1-2 hours
**Output:** Performance verdict (PASS/FAIL) for release decision
