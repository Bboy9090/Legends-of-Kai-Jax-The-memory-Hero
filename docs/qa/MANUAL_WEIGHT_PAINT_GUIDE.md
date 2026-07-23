# Phase A Step 2–3: Manual Weight-Paint Cleanup Guide

**Target GLB**: `kaijax_tail_rig_prototype_v3.glb`  
**Estimated Time**: 2–4 hours (can be done iteratively)  
**Skill Level**: Intermediate (Blender weight-painting experience helpful)

---

## Overview

This guide walks through manual weight-painting cleanup for the Kai-Jax tail rig. The goal is to smooth weight transitions at two problem locations:

1. **Tail-to-torso root** (all 9 tails): Extend Hips influence to ~35% of tail length
2. **Tail-to-tail boundaries** (6 pairs): Smooth 60/40 blends between adjacent tails

After cleanup and proper export, the rig will deform correctly under bone rotation and pass acceptance re-test.

---

## Step 0: Setup in Blender

### Import the GLB

```
File > Import > glTF 2.0 (.glb/.gltf)
→ Select: kaijax_tail_rig_prototype_v3.glb
```

This will load:
- **Armature**: Skeleton with 51 bones (Hips, Spine, 9 tail chains with base/mid/tip)
- **Mesh**: char1 (159K vertices, sculpted from Meshy)
- **Vertex Groups**: 51 groups (one per bone, named by bone)

### Enable Weight-Paint Mode

1. Select the **char1 mesh** (click it in the viewport or outliner)
2. Switch to **Weight Paint** mode (top-right dropdown, or press `Ctrl+Tab`)
3. Select the **Armature** in outliner and expand it to show bones
4. You're now ready to paint

### Useful Controls

- **LMB (left-click)**: Paint weight (add)
- **LMB + Shift**: Erase weight (subtract)
- **Scroll wheel**: Adjust brush size
- **[ / ]** (brackets): Decrease/increase brush radius
- **F**: Adjust brush strength (0–1)
- **X**: Toggle add/subtract mode
- **Alt+LMB**: Sample weight from surface

---

## Step 1: Tail-to-Torso Root Blending (All 9 Tails)

**Goal**: Extend Hips weight influence to the root 35% of each tail (up from ~20%).

### For Each Tail (tail_01 through tail_09):

#### 1a. Identify the root zone

- The tails extend downward (negative Z direction) from the Hips bone
- Measure ~35% of the tail length from the root (where it attaches to the torso)
- Visualize this as a band around the base of each tail

#### 1b. Select the tail bone to reference

1. In the **Outliner**, expand the **Armature**
2. Find the tail in question (e.g., `tail_01`)
3. Click it (don't select-all bones; just the base bone you're working on)
4. The mesh will highlight vertices weighted to that bone (they become brighter in weight-paint mode)

#### 1c. Paint Hips influence into the root zone

1. In the **Outliner**, find the **Hips** bone
2. Click it to select it as your active paint target (you'll paint Hips weight)
3. Set brush **strength** to **0.15** (15% Hips influence)
4. Paint a smooth band around the tail base (the root ~35% zone identified in 1a)
   - Use a soft brush (not hard-edge)
   - Paint multiple light strokes to build up weight smoothly
   - Fade the weight away as you move down the tail (tapering from 15% at root to 0% at the 35% mark)

#### 1d. Verify no over-weighting

- Total weight per vertex must = 1.0
- If a vertex now has Hips=0.15 + tail_bone=0.85, that's correct (sums to 1.0)
- Check: Weight-paint viewport should show smooth gradients, not hard edges

#### 1e. Repeat for all 9 tails

Apply the same process to tail_02, tail_03, ..., tail_09.

**Checkpoint**: After Step 1, all 9 tails have smoothly-blended Hips influence at their roots.

---

## Step 2: Tail-to-Tail Boundary Blending (6 Problem Pairs)

**Goal**: Smooth 60/40 weight splits at boundaries between adjacent tail clusters.

**Problem Pairs** (from acceptance report):
1. tail_06 ↔ tail_07
2. tail_04 ↔ tail_05
3. tail_09 ↔ tail_01
4. tail_01 ↔ tail_02
5. tail_03 ↔ tail_04
6. tail_08 ↔ tail_09

### For Each Pair:

#### 2a. Identify the boundary

- The tails are arranged in a fan around the torso
- The boundary between two tails is the region where their meshes nearly touch
- Zoom in and visually identify this shared edge/seam

#### 2b. Paint 60/40 blend at boundary

For pair `tail_06 ↔ tail_07`:

1. Select **tail_06** bone as the active paint target
2. Set brush strength to **0.60** (60% influence)
3. Paint along the boundary region shared with tail_07 (vertices that are close to both)
4. Then select **tail_07** bone
5. Set brush strength to **0.40** (40% influence on the tail_07 side)
6. Paint the same boundary region
   - Result: vertices at boundary now split 60/40 instead of 100/0

Repeat for pairs 2–6 with the same 60/40 logic (alternate which tail gets 60% vs 40% if desired, but consistency helps).

**Checkpoint**: After Step 2, tail-to-tail seams have smooth weight gradients (no hard cutoff).

---

## Step 3: Test Deformation

### Rotate a bone and observe mesh deformation

1. Switch to **Pose Mode** (Object Mode → Pose Mode, or press `Ctrl+Tab` again)
2. Select the **tail_01** bone
3. Rotate it: Press `R` (rotate), then `Y` (rotate around Y axis), then type `1.5` and press Enter
   - The tail should deform, following the bone rotation
   - The root should move smoothly (Hips blend preventing abrupt tearing)
4. Press `Z` to undo the rotation and return to rest pose

**Expected result**: Smooth, natural deformation without pinching or tearing at the root/seams.

---

## Step 4: Export with Proper glTF Settings

### Export to GLB

1. **File > Export As > glTF 2.0 (.glb/.gltf)**
2. **In the export panel, enable**:
   - ✅ **Animation**
   - ✅ **All Influences** (critical! includes all bone weights per vertex)
   - ✅ **Materials**
   - ✅ **Skins** (if available as a checkbox)
3. **Filename**: `kaijax_tail_rig_prototype_v3_cleaned_hand_painted.glb`
4. **Click Export**

### Critical Setting: "All Influences"

In Blender 4.0's glTF exporter, there is often a limit on how many bone influences per vertex are exported (default 4). Since we may have added Hips + tail chains, we need to ensure all influences are included:

- Look for a parameter like **"Include All Bone Influences"** or **"All influences"**
- Check the **Blender manual** for your version if the setting is not obvious
- Alternatively, export to **FBX**, then convert FBX → GLB using an online tool (Babylon.js Sandbox, etc.)

---

## Step 5: Verification

### Re-import and test deformation

1. **File > Import > glTF 2.0**
2. Select the newly exported `kaijax_tail_rig_prototype_v3_cleaned_hand_painted.glb`
3. Switch to **Pose Mode**
4. Rotate **tail_01** again (press `R`, `Y`, `1.5`, Enter)
   - **Expected**: Mesh deforms smoothly (vertices follow bone rotation)
   - **Problem**: Mesh doesn't move → export didn't include weights (re-check export settings)
5. Test a few more bones (tail_04, tail_07) to verify seam blending

---

## Step 6: Re-test Acceptance

Once verified, run the acceptance harness:

```bash
blender --background --python acceptance_test_v4.py --glb kaijax_tail_rig_prototype_v3_cleaned_hand_painted.glb
```

Expected improvement (compared to v3):
- Clipping metrics in heavy_attack, dodge, hit_reaction should drop by 15–30%
- Strain percentages should decrease or stay flat
- At least one scenario should move from "FAIL" to "PASS" (e.g., dodge or heavy_attack)

---

## Troubleshooting

### Issue: Vertices still not deforming after export

**Possible causes**:
1. Export settings didn't include all influences → re-check "All Influences" setting
2. Mesh doesn't have Armature modifier → add one manually in Blender (Modifier panel > Add Modifier > Armature)
3. Weight values are not normalized (sum != 1.0) → clean up with `Shift+W` "Normalize All Weights"

**Solution**: Try FBX export instead:
1. **File > Export As > FBX (.fbx)**
2. Export to `kaijax_tail_rig_prototype_v3_cleaned.fbx`
3. Convert FBX → GLB using an online tool (Babylon.js Sandbox: https://sandbox.babylonjs.com/)
4. Re-import and test

### Issue: Brush is too strong/weak

- Adjust brush **strength** in the top-right panel (0.0 = no change, 1.0 = full weight)
- For fine control, use 0.10–0.20
- Multiple light strokes are better than one strong stroke

### Issue: Can't find boundary between tails

- Zoom in close (scroll wheel or middle-mouse + drag)
- Switch to a wireframe or edge-view to see topology clearly
- Overlay bone names (Viewport Overlay > Bones) to see which bones are active

---

## Tips

1. **Save incremental versions**: After each tail, save the Blender file as `kaijax_v3_step1_complete.blend`, etc.
2. **Use the 3D viewport shading**: Switch to "Material Preview" or "Rendered" mode to see how deformation looks
3. **Paint both sides**: Some seams may need weight adjustment on both tail sides (not just one)
4. **Test iteratively**: After painting each tail, rotate it briefly to check deformation quality
5. **Undo-friendly**: Press `Ctrl+Z` to undo individual paint strokes, or `Ctrl+Alt+Z` to undo the last operation

---

## Success Criteria

✅ Hand weight-paint cleanup is complete when:
- All 9 tails have Hips blending in the root 35% zone
- All 6 tail-to-tail boundaries have smooth 60/40 weight splits
- Re-imported GLB shows mesh deformation under bone rotation
- Acceptance_test_v4 shows 15–30% improvement in clipping metrics

---

## Next Steps After Export

1. Copy the cleaned GLB to: `/tmp/claude-0/.../scratchpad/kaijax_tail_rig_prototype_v3_hand_cleaned.glb`
2. Run: `blender --background --python acceptance_test_v4.py` on the cleaned GLB
3. Compare results to v3 baseline
4. If improvement is ≥15%, rig is approved for production
5. If not, iterate on weight-paint (likely need more aggressive Hips blending or boundary smoothing)

---

**Estimated Time**: 45 min (roots) + 90 min (boundaries) + 15 min (testing/verification) = 2.5 hours
