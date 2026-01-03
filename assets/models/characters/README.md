# 3D Character Models - Quick Start Guide

## 🎯 Getting Started

This directory contains specifications and assets for the 6 main Genesis characters. Use the [3D_CHARACTER_SPECIFICATIONS.md](../../docs/3D_CHARACTER_SPECIFICATIONS.md) as your master reference.

## 📁 Directory Structure

```
characters/
├── kai-jax/           # The Memory King (3-tail Star-Slime)
├── lunara-solis/      # Oracle Sentinel (9-tail Kitsune)
├── umbra-flux/        # Velocity Wraith (5-tail Celestial Lupine)
├── boryx-zenith/      # Guardian King (Dragon-Bear)
├── sentinel-vox/      # Star-Force Kitsune (Saiyan-Fox)
└── kiro-kong/         # Primal Breaker (Augmented Ape)
```

Each character folder contains:
- `textures/` - PBR texture maps (Albedo, Normal, Metallic/Roughness, Emissive, AO)
- `animations/` - Animation FBX files
- `[CHARACTER]_LOD0.fbx` - High detail model (30k-50k tris)
- `[CHARACTER]_LOD1.fbx` - Medium detail model (15k-25k tris)
- `[CHARACTER]_LOD2.fbx` - Low detail model (5k-10k tris)
- `[CHARACTER]_LOD0.glb` - Web-optimized version (Three.js)

## 🛠️ Recommended Workflow

### Option 1: Blender (Free)
1. Download [Blender 4.0+](https://www.blender.org/download/)
2. Use Rigify addon for auto-rigging
3. Export as FBX 2020 and GLB/GLTF 2.0
4. Texture in Blender's Shader Editor (PBR workflow)

### Option 2: Blender + Substance Painter
1. Model in Blender
2. Bake maps in Blender (Normal, AO, Curvature)
3. Export to Substance Painter for texturing
4. Export PBR textures (use Three.js preset)
5. Import back to Blender for rigging/animation

### Option 3: AI-Assisted Generation
**Coming Soon:** Integration with AI 3D generation tools
- Meshy.ai (text-to-3D)
- Rodin AI (concept art to 3D)
- CSM (Character Shape Model)

## 📐 Technical Specs Summary

| Spec | Value |
|------|-------|
| **LOD0 Polycount** | 30k-50k tris |
| **Texture Resolution** | 2048x2048 (Albedo/Normal) |
| **Max Bones** | 80 per character |
| **Tail Bones** | 8-12 per tail |
| **Export Format** | FBX 2020, GLB/GLTF 2.0 |
| **Coordinate System** | Y-Up, Right-Handed |
| **Unit Scale** | 1 unit = 1 meter |

## 🎨 Visual Standards

**Bronx Grit Philosophy:**
- 0.08 opacity asphalt texture overlay
- Weathered/battle-damaged surfaces
- No pristine materials
- Heavy cloth simulation
- Gritty particle effects (dust, debris, sparks)

**Color Palettes:**
- **Kai-Jax:** Obsidian charcoal + purple/cyan nebulae
- **Lunara:** Liquid starlight (gold/silver shift)
- **Umbra-Flux:** Matte-white metallic + rainbow quills
- **Boryx:** Bronx brown + bronze dragon scales
- **Sentinel Vox:** Orange fur + tactical blue jacket
- **Kiro Kong:** Dark brown + stone gray armor

## 🎬 Animation Requirements

### Priority Animations (Phase 1)
- Idle (120 frames, 2s loop)
- Walk Cycle (30 frames, 0.5s)
- Run Cycle (24 frames, 0.4s)
- Jump (45 frames, 0.75s)
- Attack Light (18 frames, 0.3s)
- Attack Heavy (36 frames, 0.6s)
- Hit Reaction (12 frames, 0.2s)
- Victory Pose (180 frames, 3s)

### Special Animations (Phase 2)
- Character-specific special moves
- Transformation sequences
- Cinematic intro/outro
- Taunt animations

## 📤 Export Checklist

Before submitting models:
- [ ] All faces are quads or tris (no n-gons)
- [ ] UV maps non-overlapping
- [ ] Normals consistent (no flipped faces)
- [ ] Textures power-of-2 (1024, 2048, 4096)
- [ ] Rig binds correctly
- [ ] Animations loop cleanly
- [ ] File size < 50MB per character
- [ ] Passes Bronx Grit overlay test

## 🚀 Quick Start: Model Kai-Jax in Blender

```bash
# 1. Create base sphere (Shift+A > Mesh > UV Sphere)
# 2. Subdivide to 30k tris
# 3. Add 3 tail objects (Shift+D to duplicate)
# 4. Rig with Rigify (search "Rigify" in addons)
# 5. Weight paint tails (Weight Paint mode)
# 6. Add Shader Editor materials:
#    - Charcoal fur (Principled BSDF)
#    - Nebula effect (Volume Shader + Noise Texture)
#    - Quills (Emission + Noise for electricity)
# 7. Export as FBX (File > Export > FBX)
#    - Check "Apply Modifiers"
#    - Set "Path Mode" to "Copy"
#    - Include armature
```

## 📚 Resources

### Tutorials
- [Blender PBR Workflow](https://www.youtube.com/results?search_query=blender+pbr+workflow)
- [Substance Painter for Games](https://www.youtube.com/results?search_query=substance+painter+game+character)
- [Three.js GLB Import](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

### Assets
- [Quixel Megascans](https://quixel.com/megascans) - Free PBR textures
- [Mixamo](https://www.mixamo.com/) - Free rigging + animations
- [Blender Market](https://blendermarket.com/) - Addons/models

## 🤝 Contribution Guidelines

If creating models for this project:
1. Follow specs in [3D_CHARACTER_SPECIFICATIONS.md](../../docs/3D_CHARACTER_SPECIFICATIONS.md)
2. Use naming convention: `[CharacterID]_[LOD]_[Variant].[ext]`
3. Place textures in `textures/` subfolder
4. Include separate animation FBX files in `animations/`
5. Test import in Blender and Three.js before submitting

---

**Questions?** Check the [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md) or create an issue.

**THE SOURCE REMEMBERS UNITY. MODEL. 🏛️**
