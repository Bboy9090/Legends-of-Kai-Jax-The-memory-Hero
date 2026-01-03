# 🎨 3D CHARACTER MODEL SPECIFICATIONS
## Beast-Kin Sovereignty: Genesis - AETERNA COVENANT V1.3

**Project:** PROJECT OMEGA  
**Scope:** Books 1-3 Genesis (6 Playable Characters)  
**Art Direction:** Bronx Grit + PBR Realism + Celestial Fantasy  
**Target Platform:** PC/Web (Three.js), Mobile (optimized LODs)  

---

## 📐 TECHNICAL REQUIREMENTS

### Polycount Standards
| LOD Level | Triangle Count | Use Case |
|-----------|---------------|----------|
| **LOD0** (High Detail) | 30,000 - 50,000 | Close-up cinematics, character select |
| **LOD1** (Medium) | 15,000 - 25,000 | Gameplay, 1v1 matches |
| **LOD2** (Low) | 5,000 - 10,000 | Mobile, distant shots |
| **LOD3** (Very Low) | 2,000 - 4,000 | Background NPCs, far distance |

### Texture Resolution
- **Albedo (Diffuse):** 2048x2048 (LOD0), 1024x1024 (LOD1)
- **Normal Map:** 2048x2048 (LOD0), 1024x1024 (LOD1)
- **Metallic/Roughness:** 2048x2048 (packed R=Metallic, G=Roughness)
- **Emissive Map:** 1024x1024 (for glowing elements)
- **Ambient Occlusion:** 1024x1024 (baked)

### Rigging Requirements
- **Bone Count:** Max 80 bones per character (including facial rig)
- **Spine:** 5 bones (hips → chest)
- **Limbs:** 3 bones per limb (upper, lower, hand/foot)
- **Fingers:** 4 bones per finger (15 total per hand)
- **Tails:** 8-12 bones per tail (depends on character)
- **Face:** 30-40 bones (eyes, jaw, ears, nose, brows)
- **IK Controllers:** Hands, feet, tail tips

### Animation Standards
- **Frame Rate:** 60fps
- **Idle Animation:** 120 frames (2 seconds loop)
- **Walk Cycle:** 30 frames (0.5 seconds)
- **Run Cycle:** 24 frames (0.4 seconds)
- **Jump:** 45 frames (0.75 seconds)
- **Attack (Light):** 18 frames (0.3 seconds)
- **Attack (Heavy):** 36 frames (0.6 seconds)
- **Hit Reaction:** 12 frames (0.2 seconds)
- **Victory Pose:** 180 frames (3 seconds)

---

## 🎭 CHARACTER 1: KAI-JAX (THE MEMORY KING)

### Visual Identity
**Species:** Star-Slime Chimera (Hedgehog-Lupine Fusion)  
**Height:** 3.5 feet (compact, Kirby-esque proportions)  
**Color Palette:** Obsidian charcoal base, internal nebulae (purple/cyan swirls)  
**Silhouette:** Rounded body, 3 distinct tails, jagged electric quills

### Key Features
1. **Three Memory Tails:**
   - Tail 1 (Velocity): Liquid ink with hard-light echo trail
   - Tail 2 (Shielding): Thicker, semi-solid with web-tether capability
   - Tail 3 (Father's Strand): Translucent, ghostly appearance
   - Each tail: 10 bones, 1.5x body length
   
2. **Sage-Mode Eyes:**
   - Neon-gold slit pupils
   - Glowing emissive shader
   - Animatable glow intensity (0-100% based on Resonance)

3. **Quills:**
   - 300% extended length from base hedgehog
   - Jagged, electric appearance
   - 24 primary quills (procedurally animated)
   - Blue electric particles when charged

4. **Internal Nebulae:**
   - Visible through semi-transparent charcoal fur
   - Animated scrolling texture (purple → cyan gradient)
   - Pulsates with heartbeat rhythm

### Material Breakdown
- **Fur Shader:** Dual-layer (opaque charcoal + translucent nebula)
- **Quills:** Metallic shader with emissive tips
- **Tails:** Liquid shader with refraction (Tail 1), matte rubber (Tail 2), ghostly transparency (Tail 3)
- **Eyes:** Emissive shader with bloom post-processing

### Proportions
- Body: 1.0 unit diameter (sphere base)
- Head: 0.8x body width
- Arms: 0.4 units long (stubby)
- Legs: 0.5 units long (compact)
- Tails: 1.5 units each

---

## 🌙 CHARACTER 2: LUNARA SOLIS (ORACLE SENTINEL)

### Visual Identity
**Species:** Celestial Feline-Avian Hybrid (9-tailed Kitsune)  
**Height:** 5.8 feet (elegant, regal posture)  
**Color Palette:** Liquid starlight (gold in sunlight, silver in moonlight)  
**Silhouette:** Slender feline body, 9 flowing tails, ornate armor

### Key Features
1. **Nine Sovereign Tails:**
   - 5 Gold Solar Tails: Fire particle emitters
   - 4 Silver Lunar Tails: Shimmer/illusion effects
   - Each tail: 12 bones, 2x body length
   - Merge into single Titan Tail (ultimate form)

2. **Duality Eyes:**
   - Left Eye (Gold): Thermal vision shader
   - Right Eye (Silver): Probability thread wireframe overlay
   - Oracle Mode: Both glow bright white

3. **Crown of Infinite Stars:**
   - Holographic projection (appears at 60%+ Resonance)
   - 12 floating star points
   - Becomes solid matter at 100% Resonance

4. **Aether Silk Robes:**
   - Aurora borealis flowing cloth simulation
   - Leaves healing aura trails (VFX particles)
   - Can solidify into shields/whips

### Material Breakdown
- **Fur:** Iridescent shader (gold/silver shift based on lighting)
- **Robes:** Cloth simulation with aurora gradient texture
- **Crown:** Holographic shader (alpha blend) → solid metal (phase transition)
- **Tails:** Silk shader with particle emitters

### Proportions
- Height: 5.8 units
- Torso: 1.5 units
- Legs: 2.8 units (digitigrade stance)
- Arms: 2.0 units
- Tails: 11.6 units each (2x height)

---

## ⚡ CHARACTER 3: UMBRA-FLUX (VELOCITY WRAITH)

### Visual Identity
**Species:** Celestial Lupine (Star-Wolf/Lynx Hybrid)  
**Height:** 4.2 feet (athletic, streamlined)  
**Color Palette:** Matte-white metallic, iridescent quills (blue/red/cyan/violet/gold)  
**Silhouette:** Sleek canine body, 5 elemental tails, floating chrono-shards

### Key Features
1. **Five Elemental Tails:**
   - Tail 1 (Blue/Sonic): Light-speed after-images
   - Tail 2 (Red/Shadow): Teleportation anchor particles
   - Tail 3 (Cyan/Silver): Psychokinetic object trails
   - Tail 4 (Violet/Hypersonic): Time distortion blur
   - Tail 5 (Gold/Celestial): Reality anchor shimmer
   - Each tail: 10 bones, 1.8x body length

2. **Dual-Pupil Eyes:**
   - Left: Sees 5 seconds into past (trails behind objects)
   - Right: Sees 5 seconds into future (ghost projections)
   - Shader: Layered vision effect with chromatic aberration

3. **Quill-Blades:**
   - Crystalline, razor-edged spines
   - Vibrate at hypersonic frequency (motion blur shader)
   - Fire as psychokinetic projectiles

4. **Hard-Light Echo Skates:**
   - Light trail VFX on feet
   - Hovering 2cm above ground
   - Rainbow gradient particle trail

### Material Breakdown
- **Fur:** Matte-white metallic with anisotropic highlights
- **Quills:** Crystal shader with refraction
- **Tails:** Each tail has unique shader (speed lines, chaos particles, telekinesis glow, time warp, reality anchor)
- **Skates:** Hard-light emissive shader

### Proportions
- Height: 4.2 units
- Body length: 3.5 units (horizontal stance)
- Legs: 2.0 units
- Tails: 7.6 units each

---

## 🐻 CHARACTER 4: BORYX ZENITH (GUARDIAN KING)

### Visual Identity
**Species:** Draconic Ursine (Dragon-Bear)  
**Height:** 7.0 feet (massive, heavyweight)  
**Color Palette:** Bronx brown fur, bronze dragon scales, amber chaos star  
**Silhouette:** Heavyweight boxer build, aero-cape, horned helm

### Key Features
1. **Chaos-Infused Source Star:**
   - Embedded in chest
   - Glowing amber core (pulsates with power)
   - Emits particle burst on special attacks

2. **Aero-Cape:**
   - Cloth simulation (heavy fabric)
   - Bronze trim with royal insignia
   - Flares during attacks

3. **Dragon Scales:**
   - Mixed with bear fur (50/50 coverage)
   - Scales on shoulders, forearms, chest
   - Metallic PBR shader

4. **Boxing Gloves:**
   - Bronx street fighter aesthetic
   - Wrapped hands with brass knuckles

### Material Breakdown
- **Fur:** Realistic bear fur with subsurface scattering
- **Scales:** Dragon scales (metallic PBR)
- **Cape:** Heavy cloth with bronze trim
- **Source Star:** Emissive amber with particle system

### Proportions
- Height: 7.0 units
- Shoulder width: 3.0 units (broad)
- Arms: 2.5 units (thick)
- Legs: 3.2 units (tree trunks)
- Weight: 110 (heaviest character)

---

## 🦊 CHARACTER 5: SENTINEL VOX (STAR-FORCE KITSUNE)

### Visual Identity
**Species:** Saiyan-Kitsune (Buff Fox-Alien)  
**Height:** 5.5 feet (muscular, tactical)  
**Color Palette:** Orange fur, white chest, tactical blue flight jacket  
**Silhouette:** Buff fox with mechanical tail-blades, pilot aesthetic

### Key Features
1. **Mechanical Energy Tail-Blades:**
   - 2-9 configuration (starts with 2, extends to 9)
   - Metallic segmented design
   - Glows blue when charged
   - Each blade: 8 bones

2. **Tactical Star-Force Flight Jacket:**
   - Blue leather with orange trim
   - Star-Force insignia patches
   - Cloth simulation with wind effects

3. **Glowing Whisker-Scars:**
   - 6 whiskers per side
   - Emissive blue glow
   - Battle damage aesthetic

4. **Pilot Visor:**
   - Retractable HUD display
   - Orange tinted glass
   - Heads-up tactical info overlay

### Material Breakdown
- **Fur:** Fox fur shader (orange/white)
- **Jacket:** Leather PBR with cloth simulation
- **Tail-Blades:** Metallic with emissive edges
- **Visor:** Glass shader with HUD overlay texture

### Proportions
- Height: 5.5 units
- Upper body: Buff/muscular (1.2x normal)
- Arms: 2.2 units
- Legs: 2.8 units
- Tail-blades: 3.0 units when extended

---

## 🦍 CHARACTER 6: KIRO KONG (PRIMAL BREAKER)

### Visual Identity
**Species:** Augmented Ape-Kin  
**Height:** 6.5 feet (hunched), 8.0 feet (standing)  
**Color Palette:** Dark brown fur, stone gray armor, amber eyes  
**Silhouette:** Gorilla build with impact-dampening stone plates

### Key Features
1. **Impact-Dampening Stone Armor:**
   - Stone plates on shoulders, chest, forearms
   - Cracks when damaged (damage state textures)
   - Regenerates over time (procedural crack healing)

2. **Augmented Arms:**
   - Mechanical enhancement under stone plating
   - Hydraulic pistons visible at joints
   - Steam vents on heavy attacks

3. **Ground Slam Effects:**
   - Dust/debris particle burst
   - Screen shake trigger point
   - Shockwave ring VFX

4. **Primal Roar Animation:**
   - Chest-beating idle
   - Intimidation aura (red particle field)

### Material Breakdown
- **Fur:** Gorilla fur with realistic grooming
- **Stone Armor:** Weathered rock PBR with moss details
- **Mechanical Parts:** Metallic pistons with rust/wear
- **Eyes:** Amber emissive

### Proportions
- Height: 6.5 units (hunched)
- Arm span: 9.0 units (massive reach)
- Arms: 4.0 units each
- Legs: 3.0 units
- Torso: 2.5 units (barrel-chested)

---

## 🎨 BRONX GRIT VISUAL PHILOSOPHY

### Core Aesthetic Rules
1. **0.08 Opacity Asphalt Texture Overlay** on all models
2. **Weathering & Battle Damage:** No pristine surfaces
3. **Metallic PBR:** All metals show wear, scratches, rust
4. **Emissive Elements:** Glows should feel earned, not flashy
5. **Cloth Simulation:** Heavy fabrics, realistic draping
6. **Particle Systems:** Gritty dust, sparks, debris (not sparkles)

### Lighting Setup (for Previews)
- **Key Light:** 45° angle, warm amber (matches game lighting)
- **Fill Light:** Soft cyan (Resonance color)
- **Rim Light:** Blue-white (separates from background)
- **Environment:** HDRI with Bronx urban skyline

---

## 📦 ASSET DELIVERY FORMAT

### Export Requirements
- **Format:** FBX 2020, GLB/GLTF 2.0 (for Three.js)
- **Coordinates:** Y-Up, Right-Handed
- **Units:** Meters (1 unit = 1 meter)
- **Pivot Point:** Ground level, centered
- **Textures:** PNG (lossless), BC7 compression for runtime

### File Naming Convention
```
[CharacterID]_[LOD]_[Variant].[ext]

Examples:
KAI_JAX_LOD0_Default.fbx
LUNARA_SOLIS_LOD1_Oracle_Mode.fbx
UMBRA_FLUX_LOD2_Mobile.glb
```

### Directory Structure
```
assets/models/characters/
├── kai-jax/
│   ├── KAI_JAX_LOD0.fbx
│   ├── KAI_JAX_LOD1.fbx
│   ├── textures/
│   │   ├── KAI_JAX_Albedo.png
│   │   ├── KAI_JAX_Normal.png
│   │   └── KAI_JAX_MR.png (Metallic/Roughness)
│   └── animations/
│       ├── KAI_JAX_Idle.fbx
│       └── KAI_JAX_Attack_Light.fbx
├── lunara-solis/
├── umbra-flux/
├── boryx-zenith/
├── sentinel-vox/
└── kiro-kong/
```

---

## 🛠️ RECOMMENDED TOOLS

### 3D Modeling Software
- **Blender 4.0+** (Free, open-source, excellent for PBR)
- **Maya 2024** (Industry standard, rigging powerhouse)
- **ZBrush** (Sculpting details, normal map baking)

### Texturing
- **Substance Painter** (PBR texturing, industry standard)
- **Quixel Mixer** (Free, photorealistic materials)

### Rigging
- **Blender Rigify** (Auto-rigging addon)
- **Advanced Skeleton (Maya)** (Professional rigging tool)

### Animation
- **Blender NLA Editor** (Non-linear animation)
- **Mixamo** (Auto-rigging + animation library)

---

## ✅ QUALITY CHECKLIST

Before final delivery, ensure:
- [ ] All polygons are quads or tris (no n-gons)
- [ ] UV maps are non-overlapping (except for mirrored parts)
- [ ] Normals are consistent (no flipped faces)
- [ ] Textures are power-of-2 resolution (1024, 2048, 4096)
- [ ] Rig passes bind test (deformation looks correct)
- [ ] Animations loop cleanly (first frame = last frame)
- [ ] File size < 50MB per character (LOD0 + textures)
- [ ] Passes Bronx Grit filter test (looks good with asphalt overlay)

---

**THE SOURCE REMEMBERS UNITY. MODEL.**
