# Blender Template Setup Guide
## Quick Start for Character Modeling

This guide helps you set up Blender with the optimal settings for creating Legends of Kai-Jax character models.

---

## 🚀 Initial Setup

### 1. Download Blender
- **Version:** 4.0 or higher
- **Download:** https://www.blender.org/download/
- **Install:** Standard installation

### 2. Enable Essential Addons

Open Blender → Edit → Preferences → Add-ons

Enable these addons:
- ✅ **Rigify** (Auto-rigging)
- ✅ **Import-Export: glTF 2.0** (GLB export)
- ✅ **Mesh: F2** (Fast face creation)
- ✅ **Mesh: LoopTools** (Advanced modeling)
- ✅ **Animation: Animation Nodes** (Optional, for complex setups)

---

## 📐 Scene Setup

### Unit System
```
Scene Properties → Units
├── Unit System: Metric
├── Unit Scale: 1.000
└── Length: Meters
```

### Viewport Settings
```
Viewport Shading → Material Preview
├── Enable: Backface Culling (for silhouette check)
└── Enable: Cavity (for detail visibility)
```

### Grid & Measurements
```
Overlays → Grid
├── Scale: 1.0 (1 unit = 1 meter)
└── Subdivisions: 10
```

---

## 🎨 Material Setup Template

### Create Material Library

1. **Base PBR Material**
   - Name: `MAT_Character_Base`
   - Shader: Principled BSDF
   - Settings:
     - Base Color: [Connect Albedo texture]
     - Metallic: [Connect MR texture - Red]
     - Roughness: [Connect MR texture - Green]
     - Normal: [Connect Normal texture]
     - AO: [Connect AO texture - Multiply]

2. **Emissive Material**
   - Name: `MAT_Character_Emissive`
   - Shader: Emission
   - Settings:
     - Color: [Character-specific]
     - Strength: 2.0-3.0

3. **Energy/Trail Material**
   - Name: `MAT_Character_Energy`
   - Shader: Mix Shader
   - Mix: Principled BSDF + Emission
   - Settings:
     - Alpha: 0.7-0.9
     - Emission Strength: 2.5

---

## 🦴 Rigging Template

### Rigify Setup

1. **Install Rigify Meta-Rig**
   - Add → Armature → Human Meta-Rig
   - Scale to match character

2. **Generate Rig**
   - Select meta-rig
   - Pose Mode → Generate Rig
   - Name: `RIG_[CharacterName]`

3. **Custom Bones (Character-Specific)**

**For Jaxon (Quills):**
```
RIG_Jaxon
├── Quill_01 (3 bones: base, mid, tip)
├── Quill_02 (3 bones)
├── ...
└── Quill_07 (3 bones)
```

**For Kaison (Twin Tails):**
```
RIG_Kaison
├── Tail_Left (10 bones: base → tip)
└── Tail_Right (10 bones: base → tip)
```

**For Kai-Jax (Three Tails):**
```
RIG_KaiJax
├── Tail_Gold (10 bones)
├── Tail_Blue (10 bones)
└── Tail_White (10 bones)
```

---

## 📦 Export Template

### GLB Export Settings

```
File → Export → glTF 2.0 (.glb/.gltf)

Format: glTF Binary (.glb)
Include:
├── ✓ Selected Objects
├── ✓ Visible Objects
└── ✓ Render Objects

Transform:
├── +Y Up
└── Apply Modifiers: ✓

Geometry:
├── ✓ UVs
├── ✓ Normals
├── ✓ Vertex Colors
└── ✓ Tangents

Armature:
├── ✓ Export
└── ✓ Deformation Bones Only

Animation:
├── Export: All Actions
└── NLA Strips: ✓

Compression:
├── Draco: ✓ (Mesh compression)
└── KTX2/Basis: ✓ (Texture compression)
```

---

## 🎬 Animation Template

### Timeline Setup
```
Timeline:
├── Frame Rate: 60 FPS
├── Start Frame: 1
└── End Frame: [Animation length]
```

### Keyframe Settings
```
Keyframe Interpolation:
├── Default: Bezier
├── Easing: Ease In/Out
└── Auto Handle: ✓
```

### Animation Naming Convention
```
[CHARACTER]_[ACTION]_[VARIANT]

Examples:
- JAXON_Idle_Default
- KAISON_Run_Fast
- KAIJAX_Attack_Heavy
```

---

## 🔧 Useful Shortcuts

### Modeling
- `Tab`: Toggle Edit/Object mode
- `G`: Grab/Move
- `R`: Rotate
- `S`: Scale
- `E`: Extrude
- `Ctrl+R`: Loop Cut
- `Alt+Click`: Select Loop
- `Shift+D`: Duplicate

### Sculpting
- `F`: Brush Size
- `Shift+F`: Brush Strength
- `X`: Mirror X-axis
- `Ctrl`: Invert brush (smooth)

### Weight Painting
- `1-5`: Brush weight (0.1-0.5)
- `Shift`: Smooth
- `Ctrl`: Subtract

### Animation
- `I`: Insert Keyframe
- `Alt+A`: Play Animation
- `Alt+Shift+A`: Stop Animation
- `,`: Previous Keyframe
- `.`: Next Keyframe

---

## 📋 Scene Checklist

Before starting work:
- [ ] Units set to Metric (1 unit = 1 meter)
- [ ] Grid scale: 1.0
- [ ] Viewport shading: Material Preview
- [ ] Backface culling enabled
- [ ] Essential addons enabled
- [ ] Material library created
- [ ] Export settings configured

---

## 🎯 Character-Specific Templates

### Jaxon Template
- Base: Sphere (0.8 units diameter)
- Quills: 7 separate objects (3 bones each)
- Material: Electric blue with emissive quills

### Kaison Template
- Base: Fox body (streamlined)
- Tails: 2 separate objects (10 bones each)
- Material: Golden-orange with energy tails

### Kai-Jax Template
- Base: Spherical (1.0 unit diameter)
- Tails: 3 separate objects (10 bones each)
- Material: Charcoal with nebula effect

---

## 🚨 Common Blender Issues

### Issue: Model appears too small/large
**Fix:** Check unit scale (should be 1.0), verify export scale

### Issue: Textures not showing
**Fix:** Check texture paths, use relative paths, pack textures

### Issue: Rigify not generating
**Fix:** Ensure meta-rig is selected, check for errors in console

### Issue: Export creates huge file
**Fix:** Enable compression (Draco), optimize textures, remove unused data

---

## 📚 Learning Resources

### Blender Basics
- [Blender Fundamentals](https://www.blender.org/support/tutorials/)
- [Blender Guru Donut Tutorial](https://www.youtube.com/watch?v=TPrnSACiTJ4)

### Character Modeling
- [Character Modeling Playlist](https://www.youtube.com/results?search_query=blender+character+modeling)

### Rigging
- [Rigify Tutorial](https://www.youtube.com/results?search_query=blender+rigify)

### PBR Workflow
- [PBR Material Guide](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html)

---

**Ready to start?** Open Blender, follow this setup, then begin with the Jaxon REFERENCE.md!

---

*"Every great model starts with proper setup."* 🎨
