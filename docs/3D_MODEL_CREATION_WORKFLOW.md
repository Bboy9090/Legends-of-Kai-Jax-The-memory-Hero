# 3D Model Creation Workflow
## OMEGA PROTOCOL - Character Model Pipeline

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2025

---

## 🎯 Overview

This document outlines the complete workflow for creating 3D character models for Legends of Kai-Jax: The Memory Hero. Follow this pipeline to ensure consistency, quality, and proper integration with the game engine.

---

## 📋 Pre-Production Checklist

Before starting any 3D work:

- [ ] **Design Reference Complete**
  - Character REFERENCE.md reviewed
  - Story Bible visual description confirmed
  - Color palette finalized
  - Dimensions and proportions locked

- [ ] **Technical Specs Confirmed**
  - Polycount targets set (LOD0/1/2)
  - Bone count requirements known
  - Texture resolution decided (2048x2048)
  - Export format confirmed (GLB/GLTF 2.0)

- [ ] **Asset Structure Ready**
  - Character folder created in `assets/models/characters/[character-id]/`
  - Subfolders: `textures/`, `animations/`
  - Naming convention documented

---

## 🛠️ Phase 1: Base Model Creation

### Step 1: Blockout (2-4 hours)

**Goal:** Establish proportions and silhouette

1. **Create Base Mesh**
   - Start with primitive (sphere, cube, cylinder)
   - Use proportional editing for organic shapes
   - Focus on silhouette first, details later

2. **Establish Proportions**
   - Reference: Character REFERENCE.md dimensions
   - Use Blender's measurement tools
   - Create reference planes for height/width

3. **Check Silhouette**
   - Render silhouette view (Material Preview → Backface Culling)
   - Ensure character is recognizable from outline
   - Test from multiple angles (front, side, 3/4)

**Deliverable:** Blockout mesh with correct proportions

---

### Step 2: High-Poly Sculpting (8-16 hours)

**Goal:** Create detailed LOD0 model

1. **Subdivision Modeling**
   - Add Subdivision Surface modifier
   - Work in stages: 2→3→4 subdivisions
   - Maintain quad topology

2. **Detail Sculpting**
   - Switch to Sculpting mode
   - Add character-specific details:
     - Fur direction (for furry characters)
     - Quill/spine placement
     - Facial features
     - Clothing wrinkles

3. **Topology Optimization**
   - Use Retopology tools (Blender's Shrinkwrap)
   - Maintain edge loops for animation
   - Keep quads, avoid n-gons
   - Target: 30k-50k tris for LOD0

**Deliverable:** High-poly sculpted model

---

### Step 3: Retopology (4-8 hours)

**Goal:** Create clean, animatable topology

1. **Create Base Mesh**
   - Start fresh with clean topology
   - Use high-poly as reference (Shrinkwrap modifier)
   - Follow edge loop guidelines:
     - Face loops around eyes/mouth
     - Body loops for deformation
     - Joint loops (shoulders, elbows, knees)

2. **Edge Flow**
   - Ensure smooth deformation
   - Add edge loops at joints
   - Maintain consistent edge density

3. **UV Unwrapping**
   - Mark seams strategically:
     - Hidden areas (armpits, inner legs)
     - Natural breaks (head/body, limbs)
   - Unwrap with minimal distortion
   - Pack UVs efficiently (no overlapping)
   - Target: 80-90% UV space usage

**Deliverable:** Clean retopologized mesh with UVs

---

## 🎨 Phase 2: Texturing

### Step 4: Texture Baking (2-4 hours)

**Goal:** Transfer high-poly details to low-poly

1. **Bake Normal Maps**
   - High-poly → Low-poly
   - Resolution: 2048x2048
   - Settings: Ray Distance 0.1, Extrusion 0.05

2. **Bake Ambient Occlusion**
   - Resolution: 1024x1024
   - Samples: 128
   - Use for shadow details

3. **Bake Curvature Map**
   - For material variation
   - Use in Substance Painter (if using)

**Deliverable:** Baked normal, AO, curvature maps

---

### Step 5: Texture Painting (8-16 hours)

**Goal:** Create PBR texture set

**Option A: Blender Texture Painting**
1. **Base Colors**
   - Paint Albedo map
   - Use reference colors from REFERENCE.md
   - Add color variation (not flat colors)

2. **Material Details**
   - Create Metallic/Roughness map
   - Metallic: White for metal, black for organic
   - Roughness: Vary by material type

3. **Emissive Elements**
   - Eyes, energy effects, quills
   - Use separate Emissive map (1024x1024)

**Option B: Substance Painter (Recommended)**
1. **Import Model**
   - Export low-poly with UVs
   - Import baked maps

2. **Smart Materials**
   - Use Substance's material library
   - Customize for character
   - Add wear/damage (Bronx Grit)

3. **Export Textures**
   - Use Three.js preset
   - Export: Albedo, Normal, Metallic/Roughness, Emissive, AO

**Deliverable:** Complete PBR texture set

---

## 🦴 Phase 3: Rigging

### Step 6: Armature Creation (4-8 hours)

**Goal:** Create animation-ready rig

1. **Base Skeleton**
   - Use Rigify addon (Blender) or manual
   - Standard biped structure:
     - Spine (5-7 bones)
     - Arms (shoulder, upper, lower, hand)
     - Legs (hip, upper, lower, foot)
     - Head/neck

2. **Character-Specific Bones**
   - **Jaxon:** 7 quill bones (3 bones each)
   - **Kaison:** 2 tail bones (10 bones each)
   - **Kai-Jax:** 3 tail bones (10 bones each)
   - Facial bones (if needed)

3. **IK/FK Setup**
   - IK handles for feet (ground contact)
   - IK handles for hands (grabbing)
   - FK for natural movement

**Deliverable:** Complete armature with IK/FK

---

### Step 7: Weight Painting (4-6 hours)

**Goal:** Smooth skin deformation

1. **Automatic Weights**
   - Use "Automatic Weights" first
   - Check for issues

2. **Manual Refinement**
   - Fix problem areas:
     - Shoulders (arm rotation)
     - Hips (leg rotation)
     - Joints (knees, elbows)
   - Use gradient brushes
   - Test with pose mode

3. **Special Elements**
   - Quills: Weight to quill bones
   - Tails: Smooth gradient along tail
   - Energy effects: Separate weight groups

**Deliverable:** Fully weighted model

---

## 🎬 Phase 4: Animation

### Step 8: Animation Creation (16-32 hours)

**Goal:** Create priority animations

**Priority List (from REFERENCE.md):**
1. Idle (120 frames, 2s)
2. Walk Cycle (30 frames, 0.5s)
3. Run Cycle (24 frames, 0.4s)
4. Jump (45 frames, 0.75s)
5. Attack Light (18 frames, 0.3s)
6. Attack Heavy (36 frames, 0.6s)
7. Special Move (character-specific)
8. Hit Reaction (12 frames, 0.2s)
9. Victory Pose (180 frames, 3s)

**Animation Workflow:**
1. **Blocking**
   - Set key poses (start, middle, end)
   - Use stepped interpolation

2. **Splining**
   - Convert to smooth interpolation
   - Adjust timing

3. **Polish**
   - Add secondary motion
   - Refine arcs
   - Add anticipation/overshoot

4. **Looping**
   - Ensure seamless loops
   - Match start/end frames

**Deliverable:** Animated character with priority animations

---

## 📦 Phase 5: LOD Creation

### Step 9: LOD Generation (4-8 hours)

**Goal:** Create performance-optimized versions

1. **LOD1 (Medium Detail)**
   - Decimate modifier: 50-60% reduction
   - Target: 15k-25k tris
   - Maintain silhouette

2. **LOD2 (Low Detail)**
   - Decimate modifier: 70-80% reduction
   - Target: 5k-10k tris
   - Simplify details, keep shape

3. **Texture Optimization**
   - LOD1: 1024x1024 textures
   - LOD2: 512x512 textures
   - Use texture atlasing if needed

**Deliverable:** Three LOD versions (LOD0/1/2)

---

## 🚀 Phase 6: Export & Integration

### Step 10: GLB Export (1-2 hours)

**Goal:** Export game-ready model

1. **Export Settings (Blender)**
   - Format: glTF Binary (.glb)
   - Include: Selected Objects, Visible Objects
   - Transform: +Y Up
   - Geometry:
     - Apply Modifiers: ✓
     - UVs: ✓
     - Normals: ✓
     - Vertex Colors: ✓
   - Armature: Export (for animations)
   - Animation: All Actions

2. **Compression**
   - Use Draco compression (mesh)
   - Use KTX2/Basis (textures)
   - Target: < 50MB per character

3. **Validation**
   - Test import in Three.js
   - Check materials
   - Verify animations
   - Test LOD switching

**Deliverable:** Game-ready GLB files

---

### Step 11: Integration Testing (2-4 hours)

**Goal:** Ensure proper game integration

1. **Model Loading**
   - Test in `ModelLoader.ts`
   - Verify path resolution
   - Check cache system

2. **Animation System**
   - Test animation playback
   - Verify state machine integration
   - Check transition blending

3. **Effects Integration**
   - After-image shadows (speedsters)
   - Energy trails
   - Aura systems
   - Particle effects

4. **Performance**
   - Test at 60 FPS
   - Check memory usage
   - Verify LOD switching works

**Deliverable:** Fully integrated character

---

## 📁 File Organization

```
assets/models/characters/[character-id]/
├── [CHARACTER]_LOD0.glb          # High detail
├── [CHARACTER]_LOD1.glb          # Medium detail
├── [CHARACTER]_LOD2.glb          # Low detail
├── textures/
│   ├── [CHARACTER]_Albedo.png
│   ├── [CHARACTER]_Normal.png
│   ├── [CHARACTER]_MR.png
│   ├── [CHARACTER]_Emissive.png
│   └── [CHARACTER]_AO.png
├── animations/
│   ├── [CHARACTER]_Idle.fbx
│   ├── [CHARACTER]_Walk.fbx
│   ├── [CHARACTER]_Run.fbx
│   └── ... (other animations)
└── REFERENCE.md                  # Design specs
```

---

## 🎨 Material Setup (Blender)

### Standard PBR Material

```glsl
Shader: Principled BSDF
├── Base Color: [Albedo texture]
├── Metallic: [MR texture - Red channel]
├── Roughness: [MR texture - Green channel]
├── Normal: [Normal texture]
├── Emission: [Emissive texture] (for eyes/quills)
└── AO: [AO texture] (multiply with base color)
```

### Energy/Emissive Materials

```glsl
Shader: Emission + Transparent BSDF
├── Emission Color: [Character-specific]
├── Emission Strength: 2.0-3.0
├── Alpha: 0.7-0.9 (semi-transparent)
└── Mix Shader: Blend with Principled BSDF
```

---

## ✅ Quality Checklist

Before final submission:

### Model
- [ ] Polycount within targets (LOD0/1/2)
- [ ] All faces are quads or tris (no n-gons)
- [ ] UVs non-overlapping, efficient packing
- [ ] Normals consistent (no flipped faces)
- [ ] Silhouette recognizable from all angles

### Rigging
- [ ] All bones properly named
- [ ] Weight painting smooth, no artifacts
- [ ] IK/FK switches work correctly
- [ ] Special elements (quills/tails) properly weighted

### Textures
- [ ] All textures power-of-2 resolution
- [ ] PBR workflow (Metallic/Roughness)
- [ ] Emissive elements properly set up
- [ ] Bronx Grit overlay applied (0.08 opacity)

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
- [ ] Effects systems work (after-images, auras)
- [ ] Performance: 60 FPS maintained
- [ ] No console errors

---

## 🚨 Common Issues & Solutions

### Issue: Model too large
**Solution:** Use Draco compression, optimize textures, create LODs

### Issue: Animations not playing
**Solution:** Check armature export settings, verify animation names

### Issue: Materials look wrong
**Solution:** Check texture paths, verify PBR workflow, test in Three.js

### Issue: Weight painting artifacts
**Solution:** Use gradient brushes, check bone hierarchy, test poses

### Issue: Performance issues
**Solution:** Create LOD versions, optimize textures, reduce polycount

---

## 📚 Resources

### Software
- **Blender 4.0+** (Free): https://www.blender.org/
- **Substance Painter** (Paid): https://www.substance3d.com/
- **Mixamo** (Free): https://www.mixamo.com/ (rigging/animations)

### Tutorials
- Blender Character Modeling: [YouTube Search]
- PBR Workflow: [YouTube Search]
- Rigging with Rigify: [Blender Documentation]
- GLB Export: [Three.js GLTFLoader Docs]

### Assets
- **Quixel Megascans**: Free PBR textures
- **Blender Market**: Addons, models, materials
- **Poly Haven**: Free 3D assets

---

## 🎯 Next Steps

1. **Start with Jaxon** (simplest: hedgehog form)
2. **Then Kaison** (adds twin tails complexity)
3. **Finally Kai-Jax** (most complex: 3 tails, fusion form)

Each character builds on the previous one's techniques.

---

**Status:** Production Ready  
**Maintained By:** 3D Art Team  
**Questions?** Check REFERENCE.md for character-specific details

---

*"Model with purpose. Animate with soul. Export with precision."* 🎨🦴⚡
