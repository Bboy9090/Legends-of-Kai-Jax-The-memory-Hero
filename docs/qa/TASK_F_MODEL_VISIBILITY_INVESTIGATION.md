# TASK F: Training Model Visibility - Root Cause Investigation

**Date:** 2026-08-01 UTC  
**Status:** Investigating why models load but don't render

---

## Evidence Summary

### Model Load Pipeline (Confirmed)
```
[OptimizedBeastModel] Cloned scene: childrenCount: 1
[OptimizedBeastModel] Trace: resolvedPath: /models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb
[OptimizedBeastModel] Scene loaded: childrenCount: 1, animationCount: 2
[OptimizedBeastModel] Mesh visibility update: meshesFound: 1, materialsUpdated: 1
[OptimizedBeastModel] Bounding box: height: 1.7, isFinite: true
[OptimizedBeastModel] Scaling applied: scale: 1.294, positionY: 4.832e-8
[OptimizedBeastModel] Animation setup: selectedAction: Running
```

### Visual Result (Confirmed)
- ✅ Green fallback circle marker visible
- ❌ Character mesh NOT visible
- ❌ Character NOT animated

---

## Investigation Points

### 1. Model File Resolution
**Status:** ✅ CONFIRMED WORKING
- Path resolved: `/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb`
- File must exist and be loadable
- **Conclusion:** No 404 error on GLB file (would fail here if missing)

### 2. GLTF Parse Success
**Status:** ✅ CONFIRMED WORKING
- Scene cloned successfully
- Children count: 1 (scene contains object)
- Animations found: 2
- **Conclusion:** GLTF parse and scene graph construction succeeded

### 3. Mesh Extraction
**Status:** ✅ CONFIRMED WORKING
- Log: "Mesh visibility update: meshesFound: 1"
- Material update executed: "materialsUpdated: 1"
- **Conclusion:** Mesh exists and materials were accessed

### 4. Scaling and Position
**Status:** ✅ LOGGED, IMPLEMENTATION UNKNOWN
- Scaling: scale = 1.294 logged
- Position: positionY = 4.832e-8 (essentially zero)
- **Critical Question:** Was scale actually applied to mesh.scale object?
- **Concerns:**
  - Very small Y position could place model at origin
  - If camera positioned far away, won't see model
  - Log shows value, but doesn't prove mesh.scale was modified

### 5. Animation Setup
**Status:** ✅ CONFIRMED WORKING
- Animation actions found
- Action created: "Running"
- **Conclusion:** Animation pipeline works

### 6. Visibility Blocking Issues (UNPROVEN)

#### Issue A: Camera Not Framed
**Hypothesis:** Camera positioned where character not visible
```
Evidence: positionY = 4.832e-8 (near-zero Y)
If camera elsewhere, model won't render
→ REQUIRES: Camera position verification
```

#### Issue B: Material Opacity Still Zero
**Hypothesis:** "materialsUpdated" log doesn't confirm opacity = 1.0
```
Evidence: Only "materialsUpdated: 1" logged, no opacity value shown
Could be material.opacity = 0 or material.transparent = false
→ REQUIRES: Material properties verification
```

#### Issue C: Mesh Visibility Flag False
**Hypothesis:** mesh.visible still false despite "visibility update"
```
Evidence: Log says "visibility update" but not "visible: true"
Could be mesh.visible = false remaining
→ REQUIRES: Explicit visible flag check
```

#### Issue D: Scale Not Actually Applied
**Hypothesis:** scale value logged but not applied to mesh object
```
Evidence: "scale: 1.294" logged, but scale.set() may not have executed
Log shows intended value, not verified state
→ REQUIRES: mesh.scale.x verification
```

#### Issue E: Mesh Not Attached to Scene
**Hypothesis:** Mesh exists but not in active scene graph
```
Evidence: "Cloned scene: childrenCount: 1" suggests child exists
But visible count in render could be zero
→ REQUIRES: scene.children array inspection
```

#### Issue F: Camera Frustum Culling
**Hypothesis:** Model positioned outside camera frustum
```
Evidence: Model could be off-screen or behind camera
Zero Y position makes this likely
→ REQUIRES: Bounding sphere frustum check
```

---

## Key Files to Examine

### 1. OptimizedBeastModel.tsx
**Location:** `apps/web/src/components/game/models/OptimizedBeastModel.tsx`
**Lines to check:**
- Where scale is applied to mesh
- Whether visible flag is set
- Camera position assumptions
- Material opacity assignment
- Scene attachment verification

### 2. AdventureCharacter.tsx  
**Location:** `apps/web/src/components/game/AdventureCharacter.tsx`
**Lines to check:**
- Camera position
- Camera target
- FOV settings
- Near/far clipping planes
- Model position offset

### 3. Three.js Scene Setup
**Check:**
- Canvas dimensions
- Camera initialization
- Render loop
- Scene graph hierarchy

---

## Exact Root Cause Not Yet Proven

Based on evidence, most likely causes (ranked):

1. **Camera positioned where model not visible** (HIGH PROBABILITY)
   - Symptom: positionY = 4.832e-8 suggests model at world origin
   - If camera at wrong position, won't see it
   - PROOF NEEDED: Actual camera.position and camera.target values

2. **Mesh.visible still false** (MEDIUM PROBABILITY)
   - Symptom: Log doesn't explicitly confirm visible = true
   - PROOF NEEDED: Runtime check of mesh.visible property

3. **Material opacity not set to 1.0** (MEDIUM PROBABILITY)
   - Symptom: "materialsUpdated" doesn't show opacity value
   - PROOF NEEDED: Runtime check of material.opacity

4. **Scale not applied to mesh object** (LOW-MEDIUM PROBABILITY)
   - Symptom: Log shows scale value, but assignment may have failed
   - PROOF NEEDED: Runtime check of mesh.scale.x/y/z

5. **Mesh not in scene.children** (LOW PROBABILITY)
   - Symptom: "childrenCount: 1" suggests child exists
   - But could be wrong type of child
   - PROOF NEEDED: scene.children array inspection

---

## Next Steps to Resolve

1. **Add detailed runtime logging:**
   - Log mesh.visible immediately after assignment
   - Log material.opacity after update
   - Log mesh.scale.x/y/z after scaling
   - Log camera.position and camera.target

2. **Verify scene graph:**
   - Inspect scene.children length
   - Check scene.getObjectByName() for mesh
   - Verify mesh is SkinnedMesh or Mesh

3. **Test camera:**
   - Log initial camera position
   - Change camera to known-good position
   - See if model becomes visible

4. **Fallback marker diagnostic:**
   - Fallback renders (green circle visible)
   - Suggests canvas rendering works
   - Issue is specific to model mesh rendering

---

## Code Quality Issue

Log messages in OptimizedBeastModel.tsx show values but don't confirm:
- Whether values were actually applied to objects
- State after application (verify pattern)
- Conditions that could prevent visibility

**Better logging would be:**
```tsx
console.log('Mesh visibility set', { 
  visible: mesh.visible,  // ← confirm actual property
  opacity: material.opacity,  // ← confirm actual opacity
  scale: mesh.scale.x,  // ← confirm scale applied
  position: mesh.position.y,  // ← confirm position
  inScene: scene.children.includes(mesh)  // ← confirm attached
});
```

---

## Confirmed vs. Unproven

✅ **Confirmed Working:**
- File loads
- GLTF parses
- Scene clones
- Mesh found
- Material accessed
- Animation configured
- Fallback renders

❌ **Unproven / Requires Verification:**
- Camera framing model correctly
- Mesh.visible is true
- Material.opacity is 1.0
- Scale actually applied
- Mesh in scene.children

