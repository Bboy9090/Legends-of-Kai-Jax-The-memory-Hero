# Root Cause Trace Requirements — Blocker Evidence Standards

**Date:** 2026-08-01  
**Purpose:** Define exact proof needed to close each Tier 1 blocker

---

## Blocker A: Versus Arena Route Cannot Reach Battle

### Failure Status: CONFIRMED

User reports FIGHT button does not transition to battle arena. Character select screen remains visible instead of switching to 3D battle scene.

### Root Cause: UNKNOWN

Code review shows beginMatch() handler and state setters appear correct, but actual runtime failure not yet traced to specific step.

### Required Evidence Sequence

**Each step must be proven with console logs, DOM inspection, or screenshot:**

```
Step 1: Handler Invocation
├─ User clicks FIGHT button
├─ Console log: '[Blocker A Trace] beginMatch invoked'
└─ Proof: REQUIRED - must see log in console

Step 2: Initial Reset
├─ resetPhase() called (first)
├─ Console log: '[Blocker A Trace] After resetPhase (1)'
├─ Expected state: phase = "ready"
└─ Proof: REQUIRED - verify phase value in console

Step 3: Fighter Setup
├─ setTrainingSession(false)
├─ setCharacter(selectedId)
├─ setPlayerFighter(selectedId)
├─ Console log: '[Blocker A Trace] Fighter assignments complete'
└─ Proof: REQUIRED - selected fighter confirmed logged

Step 4: Opponent Assignment
├─ Select random opponent
├─ setOpponentFighter(opponentId)
├─ Console log: '[Blocker A Trace] Opponent assigned: {opponentId}'
└─ Proof: REQUIRED - opponent ID confirmed

Step 5: Second Reset
├─ resetPhase() called (second)
├─ Console log: '[Blocker A Trace] After resetPhase (2)'
├─ Expected state: phase = "ready"
└─ Proof: REQUIRED - verify phase value

Step 6: Start Battle Phase
├─ start() called
├─ Console log: '[Blocker A Trace] After start()'
├─ Expected state: phase = "playing"
└─ Proof: REQUIRED - verify phase is "playing"

Step 7: Game State Write
├─ setGameState("playing") called
├─ Console log: '[Blocker A Trace] After setGameState("playing")'
├─ Expected state: gameState = "playing"
└─ Proof: REQUIRED - verify gameState value

Step 8: App Render Check
├─ App.tsx evaluates mount condition
├─ Console log: '[Blocker A Trace] App render {phase, gameState, battleCanvasActive}'
├─ Expected state: battleCanvasActive = true
└─ Proof: REQUIRED - see battleCanvasActive become true

Step 9: BattleUI Mount
├─ BattleUI component renders (if battleCanvasActive)
├─ Expected: BattleUI exists in DOM
└─ Proof: REQUIRED - screenshot showing BattleUI or Canvas element

Step 10: Canvas Render
├─ Canvas element renders with Three.js scene
├─ Expected: 3D arena visible with two fighters
└─ Proof: REQUIRED - screenshot showing battle arena
```

### Failure Point Candidates

**Which step fails?**

**Candidate A: Handler Never Called**
- Evidence: No '[Blocker A Trace] beginMatch invoked' log
- Suggests: onClick handler not wired, event not firing
- Fix: Check FIGHT button onClick binding

**Candidate B: State Not Written**
- Evidence: Logs show handler executing, but later logs missing
- Example: See "After start()" but not "After setGameState()"
- Suggests: State write blocked, exception thrown, or component unmounted
- Fix: Add try/catch, check store state actions

**Candidate C: App Condition False**
- Evidence: Logs show state written correctly
- But: App render log shows battleCanvasActive = false
- Suggests: State value mismatch or condition logic error
- Fix: Verify phase and gameState values in condition evaluation

**Candidate D: BattleUI Mount Fails**
- Evidence: battleCanvasActive = true but no BattleUI visible
- Suggests: Component render error, CSS hidden, or suspension fallback
- Fix: Check BattleUI component for errors, CSS display, Suspense fallback

**Candidate E: Canvas Render Fails**
- Evidence: BattleUI mounts but canvas blank or shows error
- Suggests: BattleScene load fails, camera misconfigured, or models missing
- Fix: Check BattleScene logs, camera setup, model loading

### How to Capture Proof

**1. Run with Dev Tools Open**
```bash
npm run preview  # Start preview server
# Open browser Dev Tools → Console tab
# Navigate to Versus mode
# Click FIGHT button
# Look for '[Blocker A Trace]' console messages
# Capture screenshot of console
```

**2. Check for Errors**
```
Look for red error messages between state transitions.
Example error patterns:
- "Cannot read property 'playing' of undefined"
- "setState is not a function"
- "BattleUI failed to mount"
- Network 404 errors for assets
```

**3. Inspect DOM After Click**
```
Right-click → Inspect Element
Look for:
- Canvas element present? 
- BattleUI div elements?
- BattleScene component mounted?
Verify with F5 refresh that state carries after reload.
```

**4. Record Video Evidence**
```
- Open DevTools Console
- Click FIGHT button
- Watch state transitions log in real-time
- Capture video from click through to either:
  a) Battle arena appears, OR
  b) Error/failure point identified
```

---

## Blocker B: Character Models Not Visibly Rendering

### Failure Status: CONFIRMED

User reports Training mode and live Versus mode show:
- Fallback marker visible (green circle in Training, cyan sphere in Versus)
- Character model NOT visible
- NO character movement
- NO character animation

### Root Cause: UNKNOWN

Model pipeline logs show parsing and setup succeeds, but render output fails. Unknown which step blocks visibility.

### Required Evidence Sequence

**Each step must be proven with specific property values and screenshots:**

```
Step 1: Model ID Resolution
├─ Fighter selected (e.g., "kai-jax" or "kaijax")
├─ Model registry lookup executed
├─ Registry returns: path = "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb"
├─ Console logs: Resolved path value
└─ Proof: REQUIRED - log shows correct path, no 404

Step 2: Asset Request Success
├─ HTTP GET to /models/[filename].glb
├─ Response: 200 OK (success)
├─ Response size: > 0 bytes (file downloaded)
├─ Console log: Model file size
└─ Proof: REQUIRED - DevTools Network tab shows 200, file size confirmed

Step 3: GLTF Parse Success
├─ GLTFLoader parses binary buffer
├─ Result: Scene object created
├─ Scene.children.length > 0 (has content)
├─ Animations found: > 0 (if present)
├─ Console log: 'GLTF parse success, scenes: N, animations: M'
└─ Proof: REQUIRED - log shows parse completed

Step 4: Scene Clone Success
├─ Original scene cloned to new instance
├─ Clone children count verified
├─ Console log: 'Scene cloned, children: N'
└─ Proof: REQUIRED - confirm clone created

Step 5: Mesh Extraction
├─ traverse() walks scene tree
├─ Finds SkinnedMesh or Mesh objects
├─ Count: at least 1 mesh found
├─ Console log: 'Mesh found, type: SkinnedMesh, name: xyz'
└─ Proof: REQUIRED - identify mesh and its type

Step 6: Material Visibility
├─ Material.transparent set (if needed)
├─ Material.opacity set to 1.0 (NOT 0.0)
├─ Material.visible set to true (if property exists)
├─ Console log: 'Material opacity: 1.0, transparent: false'
└─ Proof: REQUIRED - show opacity value, not just "updated"

Step 7: Mesh Visibility Flag
├─ mesh.visible = true
├─ Console log: 'Mesh.visible after setup: true'
├─ Also log: 'Mesh.visible before setup: X'
└─ Proof: REQUIRED - confirm actual boolean value

Step 8: Scale Applied
├─ mesh.scale.set(scaleValue, scaleValue, scaleValue)
├─ Console log: 'Scale applied: mesh.scale = {x: N, y: N, z: N}'
├─ Not just logged value, but actual mesh.scale property
└─ Proof: REQUIRED - verify scale.x/y/z actual values

Step 9: Position Applied
├─ mesh.position.set(x, y, z)
├─ Console log: 'Position applied: mesh.position = {x: N, y: N, z: N}'
├─ Check Y value especially (should not be massive offset)
└─ Proof: REQUIRED - verify actual x/y/z position values

Step 10: Mesh in Scene Graph
├─ Check: scene.children.includes(mesh)
├─ Check: mesh.parent === scene or ancestor
├─ Console log: 'Mesh parent: Y, scene.children includes: boolean'
└─ Proof: REQUIRED - confirm mesh is attached to active scene

Step 11: Camera Position
├─ Camera.position values logged
├─ Console log: 'Camera position: {x: N, y: N, z: N}'
├─ Camera.target or controls checked
├─ Camera should face toward (0, 0, 0) or mesh center
└─ Proof: REQUIRED - show actual camera coordinates

Step 12: Frustum Check
├─ Mesh bounding sphere computed
├─ Check if bounding sphere intersects camera frustum
├─ Console log: 'Bounding sphere center: {x, y, z}, radius: N'
├─ Console log: 'Camera frustum test: visible or not visible'
└─ Proof: REQUIRED - verify mesh within viewable area

Step 13: Render Output
├─ One or more frames rendered
├─ Mesh should appear in canvas
├─ NO fallback marker visible (not pink/green/cyan)
├─ Screenshot: 3D model clearly visible
└─ Proof: REQUIRED - screenshot showing character model in scene
```

### Failure Point Candidates

**Which step fails?**

**Candidate A: Asset Request 404**
- Evidence: Network tab shows GET /models/[file].glb returns 404
- Suggests: File not deployed, wrong filename, path mismatch
- Fix: Verify asset file exists at public/models/, check registry path

**Candidate B: GLTF Parse Error**
- Evidence: Console shows parse error, or scenes/children = 0
- Suggests: File corrupt, wrong format, or GLTF version issue
- Fix: Validate GLB file, check GLTF loader version

**Candidate C: Mesh Not Found**
- Evidence: Parse succeeds, but "Mesh found" log never appears
- Suggests: Scene tree doesn't contain expected mesh
- Fix: Inspect GLB file structure, check animation rig

**Candidate D: Opacity = 0 or Visibility = False**
- Evidence: Mesh exists, but opacity logged as 0 or visible = false
- Suggests: Material setup incomplete or overwritten
- Fix: Check material assignment, look for state that resets opacity

**Candidate E: Scale Not Applied**
- Evidence: Scale value logged, but mesh.scale.x still 0 or unchanged
- Suggests: Assignment failed, wrong property path, or timing issue
- Fix: Verify scale.set() syntax, check if mesh replaced after scaling

**Candidate F: Camera Frustum Culling**
- Evidence: Mesh visible = true, opacity = 1.0, but not rendered
- Mesh center far from camera or outside frustum
- Suggests: Camera position wrong, mesh positioned off-screen
- Fix: Adjust camera position, move mesh into view

**Candidate G: Render Loop Not Running**
- Evidence: All setup correct, but canvas blank
- Suggests: Canvas context lost, renderer not running, or frame drops
- Fix: Check renderer.render() called, canvas attached to DOM

### How to Capture Proof

**1. Add Property Logging**
```tsx
// In OptimizedBeastModel.tsx, add after each state mutation:
console.log('After opacity update:', {
  opacity: material.opacity,  // Actual value, not "updated"
  visible: mesh.visible,      // Actual boolean
  scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
  position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
  inScene: scene.children.includes(mesh)
});
```

**2. Camera Position Logging**
```tsx
// In AdventureArena or BattleScene:
console.log('Camera setup:', {
  position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
  target: controls?.target || 'no target',
  fov: camera.fov
});
```

**3. Frustum Check**
```tsx
// After mesh loaded:
const sphere = new THREE.Sphere();
mesh.geometry.computeBoundingSphere();
sphere.copy(mesh.geometry.boundingSphere);
sphere.applyMatrix4(mesh.matrixWorld);
const visible = camera.frustum.intersectsSphere(sphere);
console.log('Frustum test:', { sphere, visible });
```

**4. Screenshot Proof**
- Load Training mode
- Select fighter
- Take screenshot showing:
  - Fallback marker visible or not
  - If fallback visible, model invisible (FAIL)
  - If neither fallback nor model visible (FAIL)
  - If model visible (PASS)

---

## Blocker C: Mobile Deployment Severe Performance and Animation Issues

### Failure Status: CONFIRMED

User reports on live Vercel deployment:
- Severe lag (frame rate unknown)
- Delayed input response (movement sluggish)
- Incorrect walk pose (arms/hands unnatural)
- Punch animation visually wrong (no impact)
- Kick animation visually wrong (no impact)
- Training character absent
- Versus fighters absent

### Root Cause: UNKNOWN

Multiple possible sources: model loading, animation timeline mismatch, shader overhead, input buffering lag, or asset optimization state.

### Required Evidence Sequence

**Each measurement must come from live Vercel deployment mobile test:**

```
Step 1: Frame Rate Measurement
├─ Deploy to Vercel (production build)
├─ Open on mobile device with DevTools
├─ Enable FPS counter (Three.js stats.js or Chrome DevTools)
├─ Play Versus battle for 30 seconds
├─ Record: average FPS, minimum FPS, dropped frames
├─ Target: 60 FPS consistent (minimum 30 FPS playable)
├─ Console log: 'FPS: avg=X, min=Y, drops=Z'
└─ Proof: REQUIRED - FPS measurement with timestamp

Step 2: Input Latency Measurement
├─ Open DevTools → Performance tab
├─ Click "movement" button (walk right)
├─ Measure time from click to visual character movement
├─ Record: input-to-render latency in milliseconds
├─ Target: < 100ms (imperceptible)
├─ Acceptable: < 200ms (slightly sluggish but playable)
├─ Current: > 200ms (lag confirmed)
├─ Console log: 'Input latency: Xms from tap to first frame movement'
└─ Proof: REQUIRED - DevTools timeline showing input event to render

Step 3: Walk Animation Pose
├─ Record video of character walking
├─ Observe: Arm position during walk
├─ Normal walk: arms swing naturally with legs
├─ Bug evidence: arms held stiff/unnaturally, hands at wrong height
├─ Compare: record same character on localhost vs. Vercel
├─ Screenshot or video: Character walk pose (side view)
└─ Proof: REQUIRED - video evidence of pose difference

Step 4: Punch Animation Visual Impact
├─ Record video of character punching
├─ Observe: Fist trajectory and impact
├─ Normal punch: fist extends, hits target, knockback visible
├─ Bug evidence: fist moves but no impact, no knockback, slow motion
├─ Compare: punch on localhost vs. Vercel
├─ Screenshot: Punch frame showing fist position and impact
└─ Proof: REQUIRED - video showing punch animation mismatch

Step 5: Kick Animation Visual Impact
├─ Record video of character kicking
├─ Observe: Leg extension and impact
├─ Normal kick: leg fully extends, hits target, knockback visible
├─ Bug evidence: leg moves but slow/weak, no impact, wrong angle
├─ Compare: kick on localhost vs. Vercel
├─ Screenshot: Kick frame showing leg position and impact
└─ Proof: REQUIRED - video showing kick animation mismatch

Step 6: Model Visibility on Mobile
├─ Navigate to Versus character select on mobile Vercel build
├─ Select fighter
├─ Expected: 3D model preview visible in character select
├─ Expected: Model visible in battle arena
├─ Bug evidence: Only fallback marker visible, no model
├─ Screenshot: Character select with/without model visible
└─ Proof: REQUIRED - screenshot of versus character select

Step 7: Training Mode on Mobile
├─ Navigate to Training Mode on mobile Vercel build
├─ Expected: Character visible in arena
├─ Bug evidence: Only fallback marker visible, no character model
├─ Screenshot: Training arena showing character or fallback
└─ Proof: REQUIRED - screenshot of training arena

Step 8: Memory Usage
├─ Open DevTools → Memory tab (on mobile or emulated mobile)
├─ Start battle
├─ Record: initial memory, peak memory, memory after 1 minute
├─ Target: < 150 MB for mobile
├─ Concern: memory spike causing GC pauses
├─ Console log: 'Memory: used=XMB, limit=YMB'
└─ Proof: REQUIRED - memory timeline

Step 9: Asset Download Performance
├─ DevTools → Network tab
├─ Start Versus battle
├─ Record: which assets load, load times
├─ Concern: Model GLBs loading slowly (e.g., > 5s)
├─ Check: throttled vs. unthrottled network
├─ Console log: 'Model load time: Xms'
└─ Proof: REQUIRED - network waterfall showing asset timings

Step 10: Bundle Size
├─ Check production build size
├─ Compare: localhost build vs. Vercel deployed build
├─ Concern: Production optimization disabled, debug code included
├─ Console log: 'Bundle: app.js=NMB, vendor=NMB'
└─ Proof: REQUIRED - production build analysis
```

### Failure Point Candidates

**What is the bottleneck?**

**Candidate A: Frame Rate (Render Bound)**
- Evidence: FPS < 20 consistently
- Suggests: Too many triangles, complex shaders, or canvas resolution too high
- Fix: Reduce model polygon count, simplify materials, lower canvas resolution on mobile

**Candidate B: Animation Interpolation (Animation Timing Wrong)**
- Evidence: Animations play but at wrong speed or wrong frames
- Punch/kick visually weak despite logs showing animation setup OK
- Suggests: Animation frame rate mismatch or timeline not normalized for mobile
- Fix: Check animation playback speed, ensure animation targets device FPS

**Candidate C: Input Buffering (Delayed Input)**
- Evidence: Input-to-render latency > 200ms
- Suggests: Event loop blocked, state updates batched, or render scheduled late
- Fix: Move expensive ops off main thread, batch state updates differently

**Candidate D: Asset Download (Network Bound)**
- Evidence: Models take 5+ seconds to load on mobile 4G
- Suggests: GLB files not optimized, no compression, or serial loading
- Fix: Gzip GLBs, reduce file size, parallel loading

**Candidate E: Bundle Size (JavaScript Overhead)**
- Evidence: Production bundle includes debug code or unnecessary dependencies
- Suggests: Build optimization disabled or Tree-shaking not working
- Fix: Verify production build flags, check webpack/vite config

**Candidate F: Memory Pressure (GC Pauses)**
- Evidence: Memory usage spike, then frame drop as GC runs
- Suggests: Too many allocations per frame or memory leak
- Fix: Reuse object instances, profile garbage collection

### How to Capture Proof

**1. Deploy to Vercel for Testing**
```bash
git push origin fix/mobile-live-release-blockers-clean
# (assumes branch configured with Vercel)
# Wait for preview deploy
# Get preview URL
# Test on mobile device or mobile emulation
```

**2. Enable Mobile DevTools**
```
Desktop Chrome:
- F12 → DevTools
- Ctrl+Shift+M (mobile emulation)
- Simulate Slow 4G network

Actual Mobile:
- Connect USB to PC
- chrome://inspect
- Open DevTools on phone
- Perform tests, capture DevTools logs
```

**3. Measure FPS**
```javascript
// Add to app initialization
let frames = 0;
let startTime = performance.now();
const measureFPS = () => {
  frames++;
  const elapsed = performance.now() - startTime;
  if (elapsed > 1000) {
    console.log(`FPS: ${(frames / elapsed * 1000).toFixed(1)}`);
    frames = 0;
    startTime = performance.now();
  }
  requestAnimationFrame(measureFPS);
};
measureFPS();
```

**4. Measure Input Latency**
```javascript
// Add to input handler
window.inputTimestamp = performance.now();
// In render loop:
if (window.inputTimestamp) {
  const latency = performance.now() - window.inputTimestamp;
  console.log(`Input latency: ${latency.toFixed(1)}ms`);
  delete window.inputTimestamp;
}
```

**5. Record Video Evidence**
```
Mobile device → Side-by-side comparison:
Column 1: Localhost Versus (working reference)
Column 2: Vercel Versus (showing lag/animation issues)

Record 30 seconds of:
- Character walk (show arm/hand pose)
- Character punch (show impact)
- Character kick (show impact)
- Frame rate (visually obvious if under 30 FPS)
```

---

## Summary: What Counts as Root Cause Proof

| Blocker | Proven When | NOT Proven When |
|---------|-------------|-----------------|
| **A: Versus Route** | Console shows exact state transition failure point | Code looks correct but not tested |
| **B: Model Rendering** | Screenshot shows model MISSING and logs show property X = bad value | Logs show "updated" without actual property values |
| **C: Mobile Perf** | Measurement shows FPS/latency value with timestamp on live deployment | Observation "feels slow" or localhost profiling |

**Stop doing this:**
- Estimating time to fix before root cause proven
- Assuming camera position without logging it
- Calling 8 fighters "verified playable" without runtime battle screenshot
- Accepting "fallback renders" as proof model works
- Using menu screenshots as gameplay proof

**Start doing this:**
- Logging actual property values, not just state names
- Proving each pipeline step with evidence
- Running tests on live Vercel deployment, not just localhost
- Taking screenshots of both success and failure states
- Measuring performance with instruments, not impressions

