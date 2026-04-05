# 🤖 AI-ASSISTED 3D MODEL GENERATION GUIDE
## Beast-Kin Sovereignty: Genesis - Character Models via AI

**Last Updated:** January 2, 2026  
**Status:** Ready for AI Generation  
**Tools:** Meshy.ai, Rodin AI, CSM, Luma AI

---

## 🎯 WORKFLOW OVERVIEW

### Phase 1: AI Generation (This Guide)
1. Use prompts below in AI 3D generation tools
2. Generate base models (30k-50k poly)
3. Download as FBX/GLB/OBJ

### Phase 2: Refinement (Blender)
1. Import AI-generated model
2. Adjust proportions to match specs
3. Retopologize if needed (optimize poly count)
4. Add missing details (tails, special features)

### Phase 3: Texturing (Substance Painter)
1. Bake high-poly details to normal maps
2. Apply PBR materials (Albedo, Metallic, Roughness)
3. Add Bronx Grit overlay (0.08 opacity asphalt)
4. Export texture sets

### Phase 4: Rigging & Animation (Mixamo/Blender)
1. Auto-rig with Mixamo or Rigify
2. Add custom bones (tails, special features)
3. Weight paint
4. Apply animations

### Phase 5: Integration (Three.js)
1. Export as GLB/GLTF 2.0
2. Test import in Three.js
3. Verify textures, animations, performance

---

## 🤖 RECOMMENDED AI TOOLS

| Tool | Best For | Cost | URL |
|------|----------|------|-----|
| **Meshy.ai** | Text-to-3D, fast generation | Free tier + paid | https://www.meshy.ai |
| **Rodin AI** | Image-to-3D, high quality | Free tier + paid | https://hyperhuman.deemos.com/rodin |
| **CSM (Cube)** | Character-focused, rigged | Paid | https://www.csm.ai |
| **Luma AI** | NeRF-based, photorealistic | Free tier + paid | https://lumalabs.ai |
| **Kaedim** | 2D art to 3D model | Paid | https://www.kaedim3d.com |

**Recommended:** Start with Meshy.ai (fastest, free tier available)

---

## 🎨 CHARACTER 1: KAI-JAX (THE MEMORY KING)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of a compact star-slime chimera, hedgehog-lupine fusion. 
Spherical body made of obsidian charcoal material with glowing purple and cyan 
nebula swirls visible inside translucent surface. Three distinct liquid tails 
flowing from back, each 1.5x body length. Jagged electric quills on head and 
spine, glowing blue tips. Large neon-gold eyes with slit pupils. Stubby arms 
and legs. Kirby-esque proportions, 3.5 feet tall. Fantasy sci-fi style, 
videogame character, T-pose. PBR materials, game-ready topology.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Kai-Jax, the Memory King. Compact spherical body 
(1.0 unit diameter) made of semi-transparent obsidian charcoal fur with 
internal swirling nebulae (purple #8b4ff7 to cyan #00d9ff gradient). THREE 
DISTINCT TAILS: Tail 1 (liquid ink with hard-light trail), Tail 2 (thicker 
semi-solid with web pattern), Tail 3 (translucent ghostly appearance). 300% 
extended jagged quills on head/spine with electric blue glow (#3399ff). 
Large sage-mode eyes (neon gold #ffd700, slit pupils). Stubby arms (0.4 units), 
compact legs (0.5 units). Star-wolf and hedgehog fusion. T-pose rigging-ready. 
Weathered battle-damaged surface texture. 30,000 polygons, game-optimized. 
PBR materials: metallic quills, liquid tails, emissive eyes.
```

### Reference Keywords
- Body: `spherical`, `compact`, `Kirby proportions`, `charcoal fur`
- Tails: `three liquid tails`, `flowing`, `different textures`
- Quills: `jagged electric spines`, `hedgehog quills`, `glowing tips`
- Eyes: `large neon gold eyes`, `slit pupils`, `sage mode`
- Style: `fantasy sci-fi`, `platform fighter`, `Nintendo aesthetic`

### Post-Generation Checklist
- [ ] Body is properly spherical (1.0 unit diameter)
- [ ] 3 distinct tails present (each 1.5x body length)
- [ ] Quills are jagged and extended (not rounded)
- [ ] Eyes are large and emissive
- [ ] In T-pose for rigging

---

## 🌙 CHARACTER 2: LUNARA SOLIS (ORACLE SENTINEL)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of an elegant nine-tailed kitsune, celestial feline-avian 
hybrid. Slender anthropomorphic fox body, 5.8 feet tall, digitigrade legs. 
Liquid starlight fur that shifts between gold and silver iridescent colors. 
NINE flowing tails (5 gold solar, 4 silver lunar), each 2x body height. 
Wearing aurora borealis silk robes with flowing cloth. Holographic crown of 
stars floating above head. Dual-colored eyes (left gold, right silver). 
Regal elegant posture, ornate armor details. Fantasy oracle aesthetic, 
videogame character, T-pose. PBR materials, game-ready.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Lunara Solis, Oracle Sentinel. Elegant celestial 
kitsune, 5.8 feet tall. Slender feline body with digitigrade stance (legs 2.8 
units). Iridescent fur shader (shifts gold #ffd700 to silver #c0c0c0 based on 
lighting angle). NINE TAILS CRITICAL: 5 gold solar tails with fire particle 
emitters, 4 silver lunar tails with shimmer effects, each tail 11.6 units long 
(2x height), flowing gracefully. Aurora borealis robes (gradient #ff6ec7 pink 
to #00ffa3 cyan to #3399ff blue) with cloth simulation. Holographic Crown of 
Infinite Stars above head (12 floating star points, translucent). Heterochromia 
eyes: left gold thermal vision, right silver mystical. Ornate armor plates on 
shoulders/chest. Regal pose, T-stance. 40,000 polygons. PBR: iridescent fur, 
silk cloth, holographic crown, emissive eyes.
```

### Reference Keywords
- Body: `elegant kitsune`, `anthropomorphic fox`, `digitigrade legs`, `slender`
- Tails: `nine flowing tails`, `5 gold 4 silver`, `very long`, `twice body height`
- Robes: `aurora borealis`, `silk cloth`, `flowing fabric`, `pink cyan blue gradient`
- Crown: `holographic stars`, `floating crown`, `12 star points`, `translucent`
- Style: `celestial fantasy`, `oracle aesthetic`, `regal posture`

### Post-Generation Checklist
- [ ] 9 distinct tails visible (5 gold, 4 silver)
- [ ] Tails are 2x body height (very long)
- [ ] Aurora robes present with gradient colors
- [ ] Crown floating above head
- [ ] Dual-colored eyes (gold/silver)

---

## ⚡ CHARACTER 3: UMBRA-FLUX (VELOCITY WRAITH)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of a sleek celestial wolf, star-wolf lynx hybrid. 
Streamlined athletic canine body, 4.2 feet tall, horizontal stance. 
Matte-white metallic fur with rainbow iridescent quill-blades on back. 
FIVE ELEMENTAL TAILS in different colors: blue, red, cyan, violet, gold, 
each 1.8x body length with unique energy effects. Dual-pupil eyes with 
chromatic aberration effect. Crystalline razor-edged spines. Hard-light 
energy skates on feet with glow trails. Sleek aerodynamic design, sci-fi 
speedster aesthetic, videogame character, T-pose. PBR materials, game-ready.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Umbra-Flux, Velocity Wraith. Sleek wolf-lynx 
hybrid, 4.2 feet tall. Streamlined athletic body (3.5 units length), 
horizontal quadruped stance. Matte-white metallic fur (#f0f0f0) with 
anisotropic highlights. FIVE DISTINCT TAILS CRITICAL: Tail 1 blue #3399ff 
(speed lines), Tail 2 red #ff3333 (chaos particles), Tail 3 cyan #00ffff 
(psychic glow), Tail 4 violet #aa00ff (time distortion), Tail 5 gold #ffd700 
(reality anchor), each 7.6 units long. Crystalline quill-blades on back 
(transparent with refraction), vibrating motion blur. Dual-pupil eyes with 
chromatic aberration (left sees past, right sees future). Hard-light energy 
roller skates on feet (blue glow, rainbow particle trail). Aerodynamic design, 
sci-fi tech aesthetic. T-pose. 35,000 polygons. PBR: matte-white metal fur, 
crystal quills, emissive tail energy, holographic skates.
```

### Reference Keywords
- Body: `sleek wolf`, `streamlined`, `athletic`, `white metallic fur`, `lynx hybrid`
- Tails: `five colored tails`, `blue red cyan violet gold`, `energy effects`, `glowing`
- Quills: `crystalline blades`, `transparent spines`, `razor-edged`, `vibrating`
- Eyes: `dual pupils`, `chromatic aberration`, `heterochromia effect`
- Style: `sci-fi speedster`, `velocity aesthetic`, `tech fusion`, `Sonic meets Silver`

### Post-Generation Checklist
- [ ] 5 distinct colored tails (blue, red, cyan, violet, gold)
- [ ] Crystalline quill-blades on back
- [ ] White metallic fur (not pure white)
- [ ] Energy skates on feet with glow
- [ ] Dual-pupil eye effect

---

## 🐻 CHARACTER 4: BORYX ZENITH (GUARDIAN KING)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of a massive dragon-bear hybrid, draconic ursine warrior. 
Huge heavyweight build, 7 feet tall, broad shoulders. Mix of brown bear fur 
and bronze metallic dragon scales (50/50 coverage on body). Scales on shoulders, 
forearms, chest. Glowing amber chaos star crystal embedded in chest. Heavy 
brown cape with bronze trim, royal insignia. Boxing stance with wrapped hands 
and brass knuckles. Horned helmet or crown. Muscular thick arms and tree-trunk 
legs. Powerful heavyweight boxer aesthetic, fantasy warrior king, videogame 
character, T-pose. PBR materials, game-ready.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Boryx Zenith, Guardian King. Massive dragon-bear 
hybrid, 7.0 feet tall. Heavyweight boxer build, broad shoulders (3.0 units 
wide). 50/50 coverage: realistic brown bear fur (#5c4033) with subsurface 
scattering + bronze dragon scales (#cd7f32) on shoulders, forearms, chest 
plates. Thick muscular arms (2.5 units), tree-trunk legs (3.2 units). 
Chaos-Infused Source Star: glowing amber crystal (#ffbf00) embedded in chest 
center, pulsating emissive. Heavy brown cape (#8b4513) with bronze trim, 
royal dragon insignia, cloth simulation. Boxing wraps on hands with brass 
knuckles. Amber-red eyes (#ff6600). Gruff weathered face, battle scars. 
Powerful stance, fists ready. T-pose. 50,000 polygons (highest detail). 
PBR: realistic fur, metallic scales, cloth cape, emissive chest star, 
brass knuckles.
```

### Reference Keywords
- Body: `dragon bear hybrid`, `massive heavyweight`, `muscular boxer`, `broad shoulders`
- Fur/Scales: `brown bear fur`, `bronze dragon scales`, `mixed texture`, `half and half`
- Cape: `heavy brown cape`, `bronze trim`, `royal insignia`, `flowing cloth`
- Star: `glowing amber chest crystal`, `chaos star`, `pulsating light`, `embedded gem`
- Style: `heavyweight boxer`, `guardian warrior`, `fantasy king`, `Mario meets Charizard`

### Post-Generation Checklist
- [ ] 7 feet tall, massive build
- [ ] Mixed fur and scales (50/50 coverage)
- [ ] Glowing amber star in chest
- [ ] Heavy cape with bronze trim
- [ ] Boxing stance with wrapped hands

---

## 🦊 CHARACTER 5: SENTINEL VOX (STAR-FORCE KITSUNE)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of a buff anthropomorphic fox pilot, Saiyan-kitsune hybrid. 
Muscular athletic build, 5.5 feet tall. Orange fur with white chest, fluffy 
fox features. Wearing tactical blue leather flight jacket with Star-Force 
patches. Mechanical energy tail-blades (2-9 segmented metallic tails, blue 
glow). Orange-tinted pilot visor over eyes with HUD display. Glowing blue 
whisker scars on cheeks (6 per side). Tactical military pilot aesthetic, 
buff upper body, confident stance. Sci-fi space opera, videogame character, 
T-pose. PBR materials, game-ready.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Sentinel Vox, Star-Force Kitsune. Buff 
anthropomorphic fox, 5.5 feet tall. Muscular upper body (1.2x normal 
proportions), arms 2.2 units, legs 2.8 units. Orange fur (#ff6600) with 
white chest (#ffffff), fluffy fox tail. Tactical blue leather flight jacket 
(#0066cc) with orange trim (#ff6600), Star-Force insignia patches on shoulders, 
cloth simulation. MECHANICAL TAIL-BLADES: 2-9 segmented metallic energy blades 
(#333333 metal with #3399ff blue emissive edges), extendable configuration, 
each blade 8 bones articulation, starts at 2 extends to 9. Retractable pilot 
visor (orange tint #ffaa00, glass shader, HUD overlay texture). Glowing blue 
whisker-scars (#3399ff emissive, 6 per cheek, battle damage aesthetic). 
Confident pilot stance, arms crossed or tactical ready. T-pose. 35,000 polygons. 
PBR: fox fur, leather jacket, metallic tail-blades, glass visor, emissive 
whiskers and blade edges.
```

### Reference Keywords
- Body: `buff fox`, `anthropomorphic`, `muscular`, `orange white fur`, `pilot build`
- Jacket: `tactical flight jacket`, `blue leather`, `Star-Force patches`, `military pilot`
- Tail-blades: `mechanical tails`, `segmented metal`, `blue glow`, `2 to 9 configuration`
- Visor: `pilot visor`, `orange tint`, `HUD display`, `retractable`, `tactical goggles`
- Style: `space pilot`, `Star Fox aesthetic`, `tactical military`, `buff confident`

### Post-Generation Checklist
- [ ] Buff/muscular upper body (not slim)
- [ ] Blue flight jacket with patches
- [ ] Mechanical tail-blades (metal, not organic)
- [ ] Pilot visor with HUD
- [ ] Glowing blue whisker scars

---

## 🦍 CHARACTER 6: KIRO KONG (PRIMAL BREAKER)

### Text-to-3D Prompt (Meshy.ai / Rodin AI)
```
3D character model of a massive augmented gorilla warrior, ape-kin with 
cybernetic enhancements. Huge muscular build, 6.5 feet tall hunched (8 feet 
standing). Dark brown gorilla fur with weathered stone armor plates on 
shoulders, chest, forearms. Mechanical hydraulic pistons visible at arm joints, 
steam vents. Impact-dampening stone plates with cracks and moss growing. 
Amber glowing eyes. Barrel-chested with massive arms (4 units each, 9 foot 
arm span). Knuckle-walk stance or standing upright. Primal warrior with tech 
augmentation, fantasy sci-fi, videogame character, T-pose. PBR materials, 
game-ready.
```

### Advanced Prompt (Detailed)
```
Detailed 3D game character: Kiro Kong, Primal Breaker. Augmented gorilla, 
6.5 feet tall hunched (8.0 standing). MASSIVE BUILD: barrel chest (2.5 units), 
enormous arms (4.0 units each), 9.0 unit arm span, tree-trunk legs (3.0 units). 
Realistic dark brown gorilla fur (#3d2817) with grooming details. Weathered 
stone armor plates: stone gray (#808080) with moss green (#4a7c59) on shoulders, 
chest, forearms. CRACKED DAMAGE STATES: progressive cracks in stone (pristine 
→ minor cracks → major cracks textures). Mechanical augmentation: metallic 
steel hydraulic pistons (#666666) at elbow/shoulder joints with rust (#8b4513), 
steam vents emit particles on heavy attacks. Amber emissive eyes (#ffaa00). 
Intimidating gorilla face, alpha male presence. Knuckle-walk quadruped stance 
or upright chest-beating pose. T-pose. 45,000 polygons (complex detail). 
PBR: realistic gorilla fur, weathered rock armor with moss, rusty metal 
pistons, emissive eyes, damage state layers.
```

### Reference Keywords
- Body: `massive gorilla`, `augmented ape`, `huge muscular`, `barrel chest`, `long arms`
- Armor: `stone plates`, `weathered rock`, `moss covered`, `cracked damage`, `gray stone`
- Mechanical: `hydraulic pistons`, `metal joints`, `steam vents`, `cybernetic`, `rust`
- Eyes: `amber glow`, `intimidating stare`, `alpha presence`
- Style: `primal warrior`, `augmented beast`, `Donkey Kong meets cyberpunk`, `tech-organic`

### Post-Generation Checklist
- [ ] Massive gorilla build (not human-sized)
- [ ] Stone armor plates with cracks/moss
- [ ] Hydraulic pistons at joints
- [ ] 9-foot arm span (very long arms)
- [ ] Amber glowing eyes

---

## 🔧 POST-GENERATION REFINEMENT WORKFLOW

### Step 1: Import to Blender
```python
# Blender Python Script: Import and Scale
import bpy

# Import AI-generated FBX
bpy.ops.import_scene.fbx(filepath="C:/path/to/KAI_JAX_AI.fbx")

# Scale to correct size (1 unit = 1 meter)
obj = bpy.context.selected_objects[0]
obj.scale = (1.0, 1.0, 1.0)  # Adjust based on specs

# Set origin to ground level
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
obj.location.z = 0
```

### Step 2: Topology Check
- Run **Mesh > Clean Up > Merge by Distance** (0.001m threshold)
- Check for **non-manifold geometry** (Select > Select All by Trait > Non Manifold)
- **Triangulate** if needed (Modifier > Triangulate)
- Target poly count: LOD0 = 30k-50k tris

### Step 3: Add Missing Details (If Needed)
- **Tails:** Use Bezier curves + Array modifier
- **Quills:** Particle system or manual placement
- **Cloth elements:** Cloth simulation setup
- **Special features:** Model by hand in Edit Mode

### Step 4: UV Unwrapping
- **Smart UV Project** for quick results
- **Manual seams** for better control
- Check for **overlapping UVs** (except mirrored parts)
- **Pack UVs** with 0.05 margin

### Step 5: Export for Texturing
```
File > Export > FBX
- Apply Modifiers: ON
- Selected Objects: ON
- Forward: -Z Forward
- Up: Y Up
- Apply Scalings: FBX All
- Path Mode: Copy
- Embed Textures: OFF
```

---

## 🎨 TEXTURING WITH SUBSTANCE PAINTER

### Bake Maps
1. Import high-poly mesh
2. Bake all maps: Normal, AO, Curvature, World Space Normal, Thickness
3. Resolution: 2048x2048

### Apply PBR Materials
1. **Base Color (Albedo):** Use AI-generated textures as starting point
2. **Metallic:** Metal parts = 1.0, organic = 0.0
3. **Roughness:** Vary based on material (fur = 0.8, metal = 0.3-0.6)
4. **Normal:** Baked from high-poly details
5. **Emissive:** Eyes, energy effects, glows

### Bronx Grit Overlay
1. Add **Fill Layer** at top of stack
2. Load asphalt/concrete texture
3. Set **Opacity: 0.08**
4. Blend Mode: **Multiply**
5. Add **weathering/dirt/scratches** with Smart Materials

### Export Textures
- Preset: **Three.js / WebGL**
- Format: PNG (lossless)
- Resolution: 2048x2048 (LOD0), 1024x1024 (LOD1)
- Maps: Albedo, Normal, MetallicRoughness (packed), Emissive, AO

---

## 🎬 AUTO-RIGGING WITH MIXAMO

### Upload to Mixamo
1. Go to https://www.mixamo.com
2. Upload FBX (must be in T-pose)
3. Auto-Rig: Place markers on chin, wrists, elbows, knees, groin
4. Click **Rig** → Wait 30-60 seconds

### Apply Animations
1. Browse animation library
2. Select: Idle, Walk, Run, Jump, Punch, Kick, Victory
3. Adjust **character arm spacing** if needed
4. Download **with skin** (FBX)

### Custom Bones (Tails, Special Features)
1. Import Mixamo FBX to Blender
2. Enter **Edit Mode** on armature
3. Add **tail bones** manually (Extrude from hip/spine)
4. Add **IK constraints** for tail tips
5. **Weight paint** tails in Weight Paint mode

---

## ✅ FINAL EXPORT CHECKLIST

### GLB/GLTF Export for Three.js
```
File > Export > glTF 2.0 (.glb/.gltf)
- Format: GLB (embedded)
- Include: Selected Objects
- Transform: +Y Up
- Geometry: Apply Modifiers, UVs, Normals
- Materials: Export
- Animation: Export (if present)
- Compression: Draco (optional, reduces file size 70%)
```

### Quality Checks
- [ ] File size < 50MB (with textures)
- [ ] Animations play smoothly in Blender
- [ ] Textures display correctly
- [ ] No missing UV maps
- [ ] Poly count within target (30k-50k LOD0)
- [ ] Origin at ground level, centered
- [ ] Forward facing -Y or +Y axis

---

## 🚀 INTEGRATION WITH THREE.JS

### Test Loader Script
```javascript
// packages/game/src/utils/ModelLoader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export async function loadCharacter(characterId: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  const path = `/assets/models/characters/${characterId}/${characterId.toUpperCase()}_LOD1.glb`;
  
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve(model);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

// Usage:
const kaiJaxModel = await loadCharacter('kai-jax');
scene.add(kaiJaxModel);
```

---

## 📊 ESTIMATED TIMELINE

| Phase | Time per Character | Total (6 Characters) |
|-------|-------------------|---------------------|
| **AI Generation** | 5-10 minutes | 30-60 minutes |
| **Refinement (Blender)** | 2-4 hours | 12-24 hours |
| **Texturing (Substance)** | 3-5 hours | 18-30 hours |
| **Rigging/Animation** | 2-3 hours | 12-18 hours |
| **Testing/Integration** | 1-2 hours | 6-12 hours |
| **TOTAL** | **8-14 hours** | **48-84 hours** |

**With AI assistance:** 2 weeks (solo) or 3-5 days (team of 3)  
**Without AI (manual):** 3-4 months (solo) or 2-3 weeks (team of 3)

---

## 🎯 PRIORITY ORDER (Start Here)

1. **Kai-Jax** (Simplest: sphere body + 3 tails)
2. **Umbra-Flux** (Moderate: wolf base + 5 tails)
3. **Sentinel Vox** (Moderate: anthropomorphic fox + jacket)
4. **Lunara Solis** (Complex: 9 tails + cloth simulation)
5. **Boryx Zenith** (Complex: mixed fur/scales + cape)
6. **Kiro Kong** (Most Complex: gorilla + stone armor + damage states)

---

**NEXT STEPS:**
1. Copy character prompts above
2. Go to https://www.meshy.ai (or preferred AI tool)
3. Paste prompt for Kai-Jax
4. Generate → Download FBX/GLB
5. Follow refinement workflow

**THE SOURCE REMEMBERS UNITY. GENERATE. 🤖**
