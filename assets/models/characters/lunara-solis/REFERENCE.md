# LUNARA SOLIS Model Reference
## THE HARMONY ANCHOR 🌙

**Character ID:** LUNARA_SOLIS  
**Species:** Celestial Kitsune (9-Tailed Oracle)  
**Height:** 5.8 feet (1.77 meters)  
**Weight Class:** Light (78 weight units)

---

## Visual Identity (Story Bible Canon)

**Archetype:** Mystic Support / Harmony Guardian  
**Visual Identity:** Elegant kitsune with liquid starlight fur that shifts between gold and silver. Nine flowing tails and aurora borealis robes with ornate holographic crown.

### Core Design Elements
- **Primary Form:** Tall, elegant kitsune build
- **Nine Tails:** 5 gold solar tails + 4 silver lunar tails
- **Eyes:** Duality eyes (left gold/thermal, right silver/probability)
- **Fur:** Liquid starlight (shifts gold/silver with day/night)
- **Robes:** Aurora borealis gradient with healing particles
- **Crown:** Holographic → solid gold at high resonance

---

## Detailed Specifications

### Dimensions
- **Body Length:** 1.5 units (torso)
- **Height:** 1.77 units (standing, digitigrade)
- **Width:** 0.5 units (at shoulders)
- **Legs:** 2.8 units (digitigrade stance)
- **Arms:** 2.0 units length
- **Tail Length:** 11.6 units each (2x height)
- **Tail Count:** 9 tails (5 gold, 4 silver)

### Nine-Tail System (Solar/Lunar)

**Gold Solar Tails (5):**
- **Meaning:** Fire/Light manipulation, life force
- **Material:** Fire particle emitters, gold gradient
- **Color:** Gold (#FFD700) with orange fire
- **Bones:** 12 bones each (60 bones total)
- **Effect:** Healing particles, solar energy

**Silver Lunar Tails (4):**
- **Meaning:** Precognition, illusion casting, oracle vision
- **Material:** Shimmer effects, silver gradient
- **Color:** Silver (#C0C0C0) with blue shimmer
- **Bones:** 12 bones each (48 bones total)
- **Effect:** After-images, probability threads

**Merged Form (Ultimate):**
- All 9 tails combine into single Titan Tail
- Massive energy form
- Crown becomes solid gold

### Color Palette (OMEGA Protocol)
- **Fur Base:** Gold (#FFD700) ↔ Silver (#C0C0C0) - shifts with lighting
- **Solar Tails:** Gold (#FFD700) with orange fire (#FF8C00)
- **Lunar Tails:** Silver (#C0C0C0) with blue shimmer (#00CED1)
- **Robes:** Aurora gradient (#FF6EC7 → #00FFA3 → #3399FF)
- **Crown:** White (#FFFFFF) holographic → Gold (#FFD700) solid
- **Eyes Left:** Gold (#FFAA00) - thermal/life force
- **Eyes Right:** Silver-Blue (#AADDFF) - probability threads

### Material Breakdown

#### Body Fur (Liquid Starlight)
- **Type:** Iridescent shader with day/night shift
- **Shader:** Principled BSDF + Iridescent
- **Base Color:** Gold (#FFD700) ↔ Silver (#C0C0C0)
- **Roughness:** 0.3 (glossy)
- **Metallic:** 0.2
- **Iridescence:** 1.0 (full shift)
- **Subsurface Scattering:** 0.4 (starlight glow)
- **Normal Map:** Flowing fur direction

#### Solar Tails (5 Gold Tails)
- **Type:** Fire particle emitters
- **Shader:** Principled BSDF + Emission + Particle System
- **Base Color:** Gold (#FFD700)
- **Emission:** Orange fire (#FF8C00), intensity 2.5
- **Particles:** Fire particles at tips
- **Effect:** Healing particles trail

#### Lunar Tails (4 Silver Tails)
- **Type:** Shimmer effects
- **Shader:** Principled BSDF + Emission
- **Base Color:** Silver (#C0C0C0)
- **Emission:** Blue shimmer (#00CED1), intensity 2.0
- **Effect:** After-images, probability visualization

#### Aurora Robes (Aether Silk)
- **Type:** Cloth simulation with aurora gradient
- **Shader:** Principled BSDF + Cloth
- **Base Color:** Aurora gradient texture
- **Roughness:** 0.5
- **Metallic:** 0.0
- **Normal Map:** Silk texture
- **Effect:** Healing particle trails

#### Crown (Infinite Stars)
- **Type:** Holographic → Solid transition
- **Shader:** Mix Shader (Holographic + Metallic)
- **Holographic Color:** White (#FFFFFF)
- **Solid Color:** Gold (#FFD700)
- **Transition:** Based on Resonance (60%+ = solid)
- **Effect:** 12 floating star points at 60%+ Resonance

#### Duality Eyes
- **Left Eye (Gold/Thermal):**
  - **Shader:** Emission Shader
  - **Color:** Gold (#FFAA00)
  - **Intensity:** 3.0
  - **Effect:** Life force visualization

- **Right Eye (Silver/Probability):**
  - **Shader:** Emission Shader
  - **Color:** Silver-Blue (#AADDFF)
  - **Intensity:** 3.0
  - **Effect:** Probability threads visualization

---

## Animation Requirements

### Priority Animations (Phase 1)
1. **Idle** (120 frames, 2s loop)
   - Tails flow gently (solar and lunar)
   - Robes ripple with aurora effect
   - Crown holographic shimmer
   - Fur shifts gold/silver slowly

2. **Walk Cycle** (30 frames, 0.5s)
   - Elegant, graceful steps (digitigrade)
   - Tails maintain flow
   - Robes billow naturally
   - Speed: 1.8 units/second

3. **Run Cycle** (24 frames, 0.4s)
   - Solar tails trail fire
   - Lunar tails create after-images
   - Robes flow dramatically
   - Speed: 2.8 units/second

4. **Harmony Resonance** (90 frames, 1.5s)
   - Healing pulse animation
   - All tails fan out
   - Crown materializes (if < 60% Resonance)
   - Aurora particles expand

5. **Moon Beam** (60 frames, 1.0s)
   - Lunar tails create beam
   - Silver energy projection
   - Probability threads visible

6. **Eclipse Shield** (120 frames, 2.0s)
   - All tails create barrier
   - Solar + Lunar energy combine
   - Protective aura expands

7. **Lunar Flight** (90 frames, 1.5s)
   - Multi-directional flight
   - Tails provide lift
   - Robes billow upward
   - Aurora trail

8. **Titan Tail (Ultimate)** (180 frames, 3.0s)
   - All 9 tails merge
   - Massive energy form
   - Crown becomes solid gold
   - Screen-filling effect

9. **Jump** (45 frames, 0.75s)
   - Graceful leap
   - Tails provide lift
   - Height: 16 units

10. **Hit Reaction** (12 frames, 0.2s)
    - Protective stance
    - Tails wrap defensively
    - Brief invincibility flash

11. **Victory Pose** (180 frames, 3s)
    - All tails fan out majestically
    - Crown solid gold
    - Aurora flourish
    - Healing particles

---

## Technical Specifications

### Polycount Targets
- **LOD0 (High Detail):** 50,000-60,000 tris (9 tails = high complexity)
- **LOD1 (Medium Detail):** 25,000-30,000 tris
- **LOD2 (Low Detail):** 12,000-15,000 tris

### Rigging Requirements
- **Total Bones:** 120-140 (9 tails = high bone count)
- **Body Rig:** Standard biped (30 bones)
- **Tail Bones:** 108 bones (9 tails × 12 bones each)
- **Facial Bones:** 15 bones
- **IK Handles:** Feet, hands, tail tips

### Texture Maps (2048x2048)
- [ ] `LUNARA_Albedo.png` - Base color map
- [ ] `LUNARA_Normal.png` - Surface detail
- [ ] `LUNARA_MR.png` - Metallic/Roughness
- [ ] `LUNARA_Emissive.png` - Tails, eyes, crown (1024x1024)
- [ ] `LUNARA_AO.png` - Ambient occlusion (1024x1024)
- [ ] `LUNARA_Aurora.png` - Aurora robe texture (2048x2048)

### Export Settings
- **Format:** GLB (GLTF 2.0) for web
- **Coordinate System:** Y-Up, Right-Handed
- **Scale:** 1 unit = 1 meter
- **Compression:** Draco (mesh compression)
- **Textures:** Embedded in GLB

---

## Special Effects Integration

### Harmony Resonance System
- **Visual Effect:** Healing pulse from character
- **Particle Count:** 100-200 healing particles
- **Color:** Gold/Silver mix
- **Duration:** 1.5 seconds
- **Integration:** Healing allies, stabilizing timelines

### Aurora Robe Effect
- **Visual Effect:** Aurora gradient on robes
- **Color:** Pink → Green → Blue gradient
- **Animation:** Flowing, shifting colors
- **Particles:** Healing particles trail from robes

### Crown Materialization
- **Base State:** Holographic (transparent white)
- **60%+ Resonance:** Solid gold
- **Visual Effect:** 12 floating star points
- **Integration:** Resonance meter system

### Duality Eyes System
- **Left Eye:** Gold thermal vision (life force)
- **Right Eye:** Silver probability threads (future)
- **Visual Effect:** Different shader per eye
- **Integration:** Oracle vision abilities

---

## Design Philosophy

**"The Harmony Anchor"**
- Lunara represents balance and protection
- Nine tails symbolize completeness (5 solar + 4 lunar)
- Liquid starlight fur shows celestial nature
- Aurora robes show connection to the Weave
- Crown shows power level (Resonance-based)

**Legally Distinct:**
- Original 9-tail kitsune design
- Liquid starlight fur (unique material)
- Duality eyes (original mechanic)
- Aurora robes (original aesthetic)
- Original silhouette and proportions

---

## Character Arc Integration

**Core Drive:** Preserve the Weave, anchor unstable souls  
**Visual Expression:** Crown materializes as Resonance increases  
**Growth Arc:** Tails become more unified, crown becomes permanent

**Nine Tail Meanings:**
- **5 Gold Solar Tails:** Fire/Light, life force, healing
- **4 Silver Lunar Tails:** Precognition, illusions, oracle vision
- **Merged Titan Tail:** Ultimate harmony, all powers combined

---

## Quality Checklist

Before finalizing model:
- [ ] Nine tails properly rigged and weighted
- [ ] Aurora robe effect works (gradient + particles)
- [ ] Crown materialization system integrated
- [ ] Duality eyes display correctly
- [ ] Liquid starlight fur shifts properly
- [ ] Materials pass Bronx Grit overlay test
- [ ] File size < 50MB (compressed)
- [ ] Animations loop cleanly
- [ ] LOD versions created and tested
- [ ] Export works in Three.js/React Three Fiber
- [ ] Performance: 60 FPS with effects active

---

**Status:** Design Phase  
**Next Steps:** Create Blender base model, rig 9 tails, texture materials, implement aurora effect  
**Target Completion:** Phase 2 (Trinity System)

---

*"In harmony, all things find balance. In balance, all things find peace."* 🌙✨
