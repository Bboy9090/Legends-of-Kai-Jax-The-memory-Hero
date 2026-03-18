# Jaxon Modeling Guide
## Step-by-Step 3D Model Creation

**Character:** Jaxon - The Unstoppable Force 🦔  
**Difficulty:** Beginner-Friendly (Start Here!)  
**Estimated Time:** 40-50 hours

---

## 🎯 Pre-Modeling Checklist

Before starting, ensure you have:
- [ ] Blender 4.0+ installed
- [ ] Read JAXON REFERENCE.md completely
- [ ] Blender scripts loaded (optional but recommended)
- [ ] Reference images ready (if any)
- [ ] Character dimensions memorized

---

## 📐 Phase 1: Blockout (2-4 hours)

### Step 1.1: Create Base Body

1. **Start New Scene**
   - File → New → General
   - Delete default cube (X → Delete)

2. **Create Base Sphere**
   - Shift+A → Mesh → UV Sphere
   - Scale: (0.8, 0.8, 0.9) - Slightly taller than wide
   - This is the body base

3. **Position Body**
   - Move to origin: G → Z → 0.45 (half height)
   - Name: `Jaxon_Body`

### Step 1.2: Add Head

1. **Create Head Sphere**
   - Shift+A → Mesh → UV Sphere
   - Scale: (0.64, 0.64, 0.64) - 0.8x body width
   - Position: Above body, slightly forward

2. **Merge Head to Body**
   - Select both objects
   - Ctrl+J to join
   - Name: `Jaxon_Body_Head`

### Step 1.3: Add Limbs

1. **Create Arms**
   - Shift+A → Mesh → Cylinder
   - Scale: (0.2, 0.2, 0.4) - 0.4 units length
   - Position: Attach to shoulders
   - Duplicate for other arm (Shift+D)

2. **Create Legs**
   - Shift+A → Mesh → Cylinder
   - Scale: (0.25, 0.25, 0.5) - 0.5 units length
   - Position: Attach to body bottom
   - Duplicate for other leg

3. **Join All Parts**
   - Select all body parts
   - Ctrl+J to join
   - Name: `Jaxon_Blockout`

### Step 1.4: Check Proportions

**Target Dimensions:**
- Body length: 0.8 units ✓
- Height: 0.9 units ✓
- Width: 0.6 units ✓

**Check from Multiple Angles:**
- Front view (NumPad 1)
- Side view (NumPad 3)
- Top view (NumPad 7)
- 3/4 view (NumPad 1 + Ctrl+NumPad 3)

**✅ Blockout Complete When:**
- Proportions match REFERENCE.md
- Silhouette is recognizable as hedgehog
- Ready for detail work

---

## 🎨 Phase 2: High-Poly Sculpting (8-16 hours)

### Step 2.1: Subdivision Setup

1. **Add Subdivision Surface**
   - Select Jaxon_Blockout
   - Add Modifier → Subdivision Surface
   - Levels: 2 (Viewport), 3 (Render)

2. **Enter Sculpt Mode**
   - Tab → Edit Mode
   - Or: Mode menu → Sculpt Mode

### Step 2.2: Sculpt Body Details

**Tools to Use:**
- **Grab (G):** Reshape overall form
- **Smooth (Shift):** Smooth out rough areas
- **Inflate (I):** Add volume
- **Crease (K):** Create sharp edges

**Body Sculpting Steps:**
1. **Refine Body Shape**
   - Use Grab to create streamlined form
   - Smooth for organic curves
   - Reference: Hedgehog body shape

2. **Add Fur Direction**
   - Use Draw brush with low strength
   - Create fur flow lines
   - Direction: Back to front, top to bottom

3. **Define Muscle Mass**
   - Subtle definition on arms/legs
   - Speedster physique (lean, athletic)
   - Don't overdo it (stylized, not realistic)

### Step 2.3: Create Quills

**Jaxon has 7 quills:**
- 3 on left side
- 3 on right side
- 1 center (top)

**Method 1: Separate Objects (Recommended)**
1. **Create Quill Base**
   - Shift+A → Mesh → Cone
   - Scale: (0.05, 0.05, 0.4) - Narrow, long
   - Rotate: Point backward/upward

2. **Position First Quill**
   - Place on left side, back
   - Angle: 45° upward, 30° outward

3. **Duplicate and Position**
   - Shift+D to duplicate
   - Rotate and position for each quill
   - Vary angles slightly (natural look)

4. **Quill Positions:**
   ```
   Left Side: 3 quills (angled outward)
   Right Side: 3 quills (angled outward)
   Center: 1 quill (straight up/back)
   ```

5. **Refine Quill Shapes**
   - Enter Edit Mode on each quill
   - Extrude tip for sharper point
   - Add slight curve (not straight)

**Method 2: Sculpt from Body**
- Use Inflate brush on body
- Create quill shapes
- More organic, less control

**✅ Quills Complete When:**
- 7 quills positioned correctly
- Angles look natural
- Ready for rigging

### Step 2.4: Add Facial Features

1. **Eyes**
   - Create two spheres (small)
   - Position: Front of head
   - Scale: (0.08, 0.08, 0.08)
   - Color: Bright Green (#00FF00) for visibility

2. **Mouth/Nose**
   - Use Sculpt → Draw brush
   - Create subtle mouth line
   - Add small nose bump

3. **Expression**
   - Determined, energetic look
   - Slight smile (confident)
   - Eyes forward (focused)

**✅ Sculpting Complete When:**
- Body has organic, streamlined shape
- Quills are positioned and shaped
- Face has character
- Ready for retopology

---

## 🔧 Phase 3: Retopology (4-8 hours)

### Step 3.1: Create Clean Base Mesh

1. **Hide High-Poly**
   - Select high-poly model
   - H to hide (temporary)

2. **Create New Mesh**
   - Shift+A → Mesh → UV Sphere
   - This will be your clean topology

3. **Use Shrinkwrap**
   - Add Modifier → Shrinkwrap
   - Target: High-poly model
   - Mode: Nearest Surface Point
   - Offset: 0.001

### Step 3.2: Build Clean Topology

**Topology Guidelines:**
- **Quads Preferred:** 4-sided faces
- **Edge Loops:** Follow muscle flow
- **Face Loops:** Around eyes, mouth
- **Body Loops:** Horizontal around torso
- **Joint Loops:** Extra loops at shoulders, elbows, knees, hips

**Workflow:**
1. **Start with Base**
   - Use Inset Faces (I) to create loops
   - Extrude (E) to build form
   - Follow high-poly as reference

2. **Add Edge Loops**
   - Ctrl+R for loop cut
   - Add loops at joints
   - Maintain quad topology

3. **Refine Shape**
   - Use Proportional Editing (O)
   - Move vertices to match high-poly
   - Keep topology clean

**Target Polycount:**
- LOD0: 35,000-45,000 tris
- Work in quads, will triangulate on export

### Step 3.3: UV Unwrapping

1. **Mark Seams**
   - Enter Edit Mode
   - Select edges
   - Ctrl+E → Mark Seam
   - **Seam Locations:**
     - Head/body separation
     - Under arms (armpits)
     - Inner legs
     - Around quills

2. **Unwrap**
   - Select all (A)
   - U → Unwrap
   - Check for stretching/distortion

3. **Pack UVs**
   - Select all islands
   - UV → Pack Islands
   - Target: 80-90% UV space usage
   - No overlapping

**✅ Retopology Complete When:**
- Clean quad topology
- UVs unwrapped and packed
- Ready for texturing

---

## 🎨 Phase 4: Texturing (8-16 hours)

### Step 4.1: Bake Maps

1. **Setup for Baking**
   - High-poly: Visible, selected
   - Low-poly: Active, selected
   - Both in same scene

2. **Bake Normal Map**
   - Render Properties → Bake
   - Bake Type: Normal
   - Selected to Active: ✓
   - Resolution: 2048
   - Click "Bake"

3. **Bake AO Map**
   - Bake Type: Ambient Occlusion
   - Resolution: 1024
   - Samples: 128
   - Click "Bake"

4. **Save Maps**
   - Image Editor → Save As
   - `JAXON_Normal.png` (2048x2048)
   - `JAXON_AO.png` (1024x1024)

### Step 4.2: Create Albedo Map

**Option A: Blender Texture Painting**
1. **Setup Texture**
   - Material Properties → New Material
   - Base Color: Add Image Texture
   - Create new image: `JAXON_Albedo` (2048x2048)

2. **Enter Texture Paint Mode**
   - Mode → Texture Paint
   - Select brush
   - Start painting

3. **Paint Base Colors**
   - **Body:** Electric Blue (#0066FF)
   - **Quills:** Electric Blue (#3399FF)
   - **Eyes:** Bright Green (#00FF00)
   - Add color variation (not flat)

**Option B: Substance Painter (Recommended)**
1. **Export Low-Poly**
   - Export as FBX
   - Include UVs and normals

2. **Import to Substance**
   - File → New Project
   - Import FBX
   - Import baked maps

3. **Paint Textures**
   - Use Smart Materials
   - Customize for Jaxon
   - Export PBR set

### Step 4.3: Create Metallic/Roughness Map

**In Blender or Substance:**
- **Metallic:** White for quills (metallic), Black for body (organic)
- **Roughness:** Vary by material
  - Quills: 0.2 (shiny)
  - Body: 0.3 (slightly glossy)
  - Eyes: 0.1 (very shiny)

**Save:** `JAXON_MR.png` (2048x2048)

### Step 4.4: Create Emissive Map

**For Quills and Eyes:**
1. **Create New Image**
   - 1024x1024
   - Black background

2. **Paint Emissive Areas**
   - **Quill Tips:** Cyan (#00D9FF)
   - **Eyes:** Bright Green (#00FF00)
   - Intensity: White = full emission

**Save:** `JAXON_Emissive.png` (1024x1024)

### Step 4.5: Apply Materials

1. **Load Material Presets**
   - Run `create_material_presets.py` script
   - Or create manually from REFERENCE.md

2. **Assign Materials**
   - Select mesh parts
   - Assign material
   - Check in Material Preview

**✅ Texturing Complete When:**
- All texture maps created
- Materials applied correctly
- Looks good in viewport
- Ready for rigging

---

## 🦴 Phase 5: Rigging (4-8 hours)

### Step 5.1: Create Base Rig

**Option A: Use Automation Script**
1. **Run Script**
   - Open `setup_character_rig.py`
   - Set `character_id = "JAXON"`
   - Run Script (Alt+P)

**Option B: Manual Rigify**
1. **Add Meta-Rig**
   - Shift+A → Armature → Human Meta-Rig
   - Scale to match Jaxon

2. **Generate Rig**
   - Pose Mode
   - Generate Rigify Rig
   - Name: `RIG_Jaxon`

### Step 5.2: Add Quill Bones

**Jaxon needs 21 quill bones (7 quills × 3 bones each)**

1. **Enter Edit Mode on Armature**
   - Select armature
   - Tab → Edit Mode

2. **Create Quill Bones**
   - For each of 7 quills:
     - Create 3 bones: base, mid, tip
     - Position at quill location
     - Parent chain: base → mid → tip

3. **Name Convention:**
   - `Quill_01_base`, `Quill_01_mid`, `Quill_01_tip`
   - Repeat for Quill_02 through Quill_07

### Step 5.3: Parent Mesh to Armature

1. **Select Mesh and Armature**
   - Select Jaxon mesh
   - Shift+Select armature
   - Ctrl+P → With Automatic Weights

2. **Check Weight Painting**
   - Enter Weight Paint Mode
   - Check for issues:
     - Shoulders should move arms
     - Hips should move legs
     - Quills should move with quill bones

### Step 5.4: Weight Paint Quills

1. **Select Quill Bone**
   - Pose Mode
   - Select quill bone
   - Weight Paint Mode

2. **Paint Weights**
   - Select corresponding quill mesh
   - Paint weights (Red = 1.0, Blue = 0.0)
   - Base: Full weight on base bone
   - Mid: Gradient from base to mid
   - Tip: Full weight on tip bone

3. **Test Movement**
   - Pose Mode
   - Rotate quill bone
   - Check quill deforms correctly

**✅ Rigging Complete When:**
- All bones properly set up
- Mesh deforms correctly
- Quills move naturally
- Ready for animation

---

## 🎬 Phase 6: Animation (16-32 hours)

### Priority Animations (from REFERENCE.md)

1. **Idle** (120 frames, 2s)
   - Subtle breathing
   - Quills gently sway
   - Occasional foot tap

2. **Walk** (30 frames, 0.5s)
   - Quick, bouncy steps
   - Quills bounce with rhythm
   - Loop seamlessly

3. **Run** (24 frames, 0.4s)
   - Full sprint pose
   - Quills stream backward
   - Speed trails activate

4. **Spin Dash Charge** (60 frames, 1.0s)
   - Crouch into ball
   - Quills extend outward
   - Crimson aura builds

5. **Spin Dash Release** (30 frames, 0.5s)
   - Explosive launch
   - Quills create energy vortex
   - Speed blur effect

6. **Jump** (45 frames, 0.75s)
   - Spring-like launch
   - Quills point upward
   - Air control

7. **Homing Attack** (36 frames, 0.6s)
   - Lock-on pose
   - Dash toward target
   - Quills create energy trail

8. **Multi-Hit Tornado** (90 frames, 1.5s)
   - Stationary spin
   - Quills create damage vortex
   - Multi-hit frames: 30-75

9. **Hit Reaction** (12 frames, 0.2s)
   - Knockback pose
   - Quills flatten
   - Brief invincibility flash

10. **Victory Pose** (180 frames, 3s)
    - Confident stance
    - Quills fan out
    - Speed trail flourish

**Animation Workflow:**
1. **Blocking** - Set key poses
2. **Splining** - Add smooth interpolation
3. **Polish** - Add secondary motion
4. **Looping** - Ensure seamless loops

---

## 📦 Phase 7: LOD Creation (4-8 hours)

### Step 7.1: Create LOD1

1. **Duplicate Model**
   - Select Jaxon model
   - Shift+D to duplicate
   - Name: `Jaxon_LOD1`

2. **Apply Decimate Modifier**
   - Add Modifier → Decimate
   - Ratio: 0.5-0.6 (50-60% reduction)
   - Target: 18,000-25,000 tris

3. **Check Quality**
   - Compare to LOD0
   - Maintain silhouette
   - Acceptable quality loss

### Step 7.2: Create LOD2

1. **Duplicate LOD1**
   - Shift+D
   - Name: `Jaxon_LOD2`

2. **Apply More Decimation**
   - Decimate Ratio: 0.3-0.4 (70-80% total reduction)
   - Target: 8,000-12,000 tris

3. **Simplify Details**
   - Remove small details
   - Simplify quills (fewer segments)
   - Maintain basic shape

---

## 🚀 Phase 8: Export (1-2 hours)

### Step 8.1: Use Export Script

1. **Run Export Script**
   - Open `export_glb.py`
   - Set `character_id = "JAXON"`
   - Run Script (Alt+P)

2. **Or Manual Export**
   - File → Export → glTF 2.0 (.glb)
   - Settings from REFERENCE.md
   - Enable Draco compression

### Step 8.2: Export All LODs

- Export LOD0, LOD1, LOD2
- Save to: `assets/models/characters/jaxon/`
- Names: `JAXON_LOD0.glb`, `JAXON_LOD1.glb`, `JAXON_LOD2.glb`

---

## ✅ Phase 9: Validation (2-4 hours)

### Step 9.1: Use ModelValidator

```typescript
import { validateCharacterModel } from '@legends-of-kai-jax/game/utils/ModelValidator';

const result = await validateCharacterModel(
  'JAXON',
  '/assets/models/characters/jaxon/JAXON_LOD0.glb'
);

if (result.success) {
  console.log('✅ Jaxon validated!');
} else {
  console.error('❌ Validation failed:', result.errors);
}
```

### Step 9.2: Test in Game

1. **Load Model**
   - Use ModelLoader
   - Check console for errors

2. **Test Animations**
   - Play each animation
   - Check for glitches

3. **Test Effects**
   - After-image shadows
   - Speed trails
   - Spin Dash effects

---

## 📋 Final Checklist

Before submitting Jaxon model:

### Model
- [ ] Proportions match REFERENCE.md
- [ ] 7 quills properly positioned
- [ ] Polycount within targets (LOD0/1/2)
- [ ] Clean topology (quads/tris)
- [ ] UVs unwrapped and packed

### Materials
- [ ] Electric Blue body (#0066FF)
- [ ] Metallic quills with emission
- [ ] Bright green eyes
- [ ] All texture maps created
- [ ] PBR workflow correct

### Rigging
- [ ] 21 quill bones (7 × 3)
- [ ] Weight painting smooth
- [ ] Quills deform correctly
- [ ] IK/FK setup works

### Animation
- [ ] All priority animations complete
- [ ] Animations loop cleanly
- [ ] Timing matches frame data
- [ ] Secondary motion added

### Export
- [ ] GLB files load in Three.js
- [ ] Materials display correctly
- [ ] Animations play correctly
- [ ] File size < 50MB
- [ ] LOD versions work

### Integration
- [ ] Model loads in game
- [ ] Animations integrate with state machine
- [ ] After-image system works
- [ ] Performance: 60 FPS
- [ ] No console errors

---

## 🎯 Success Criteria

**Jaxon is complete when:**
- ✅ All checkboxes above are checked
- ✅ ModelValidator passes
- ✅ Performance test passes (≥60 FPS)
- ✅ Looks and feels like "The Unstoppable Force"
- ✅ Ready for production use

---

## 🆘 Troubleshooting

### Issue: Quills look wrong
**Solution:** Check quill bone positions, adjust weight painting

### Issue: Model too large
**Solution:** Enable Draco compression, optimize textures

### Issue: Animations glitchy
**Solution:** Check weight painting, verify bone hierarchy

### Issue: Materials don't show
**Solution:** Check texture paths, verify PBR workflow

---

## 📚 Reference Documents

- **Design Specs:** `REFERENCE.md`
- **Workflow:** `docs/3D_MODEL_CREATION_WORKFLOW.md`
- **Blender Setup:** `BLENDER_TEMPLATE_SETUP.md`
- **Testing:** `docs/MODEL_INTEGRATION_TESTING.md`

---

**Ready to start?** Open Blender and begin with Phase 1: Blockout!

**Questions?** Check REFERENCE.md or workflow documentation.

---

*"Every legendary model starts with a single blockout. Let's build Jaxon!"* 🦔⚡
