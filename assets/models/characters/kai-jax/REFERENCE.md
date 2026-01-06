# KAI-JAX Model Reference
## THE MEMORY HERO ⚡🦊🦔

**Character ID:** KAI_JAX  
**Species:** Star-Slime Chimera (Hedgehog-Lupine Fusion)  
**Height:** 3.5 feet (1.07 meters)  
**Weight Class:** Balanced (100 weight units)

---

## Visual Identity (Story Bible Canon)

**Archetype:** Fusion Ascendant / Three-Tailed Guardian / Echo Walker  
**Visual Identity:** Majestic fusion with three distinct tails—gold (courage/speed), blue (strength/guardianship), white (harmony/hope). Iridescent aura shifts with emotional state. Living memorial to fallen heroes.

### Core Design Elements
- **Primary Form:** Compact, spherical body (Kirby-esque) with swirling internal nebulae
- **Three Tails:** Distinct memory tails representing fusion components
- **Eyes:** Neon-gold with slit pupils, expressive and wise
- **Quills:** Jagged electric quills (hedgehog heritage)
- **Aura:** Iridescent energy that shifts with emotional state

---

## Detailed Specifications

### Dimensions
- **Body Diameter:** 1.0 unit (spherical base)
- **Height:** 1.07 units (standing with quills)
- **Width:** 1.0 unit (spherical)
- **Head:** 0.8x body width (integrated, not separate)
- **Arms:** 0.4 units length
- **Legs:** 0.5 units length
- **Tail Length:** 1.5 units each (three distinct tails)

### Three-Tail System (Memory Tails)

Each tail represents a core aspect of the fusion:

1. **Tail 1 - Gold (Velocity/Jaxon)**
   - **Meaning:** Speed and Courage (Jaxon's core)
   - **Material:** Liquid ink with hard-light echo trail
   - **Color:** Gold (#FFD700) with energy particles
   - **Bones:** 10 bones (base → tip)
   - **Effect:** Speed trails, momentum-based

2. **Tail 2 - Blue (Shielding/Kaison)**
   - **Meaning:** Strength and Guardianship (Kaison's core)
   - **Material:** Thicker, semi-solid with web-tether capability
   - **Color:** Blue (#0066FF) with protective energy
   - **Bones:** 10 bones (base → tip)
   - **Effect:** Defensive barriers, guardian aura

3. **Tail 3 - White (Harmony/Hope)**
   - **Meaning:** Harmony and Hope (Unity of both plus fallen heroes)
   - **Material:** Translucent, ghostly appearance
   - **Color:** White (#FFFFFF) with iridescent shift
   - **Bones:** 10 bones (base → tip)
   - **Effect:** Memory echoes, temporal effects

### Color Palette (OMEGA Protocol)
- **Base Body:** Obsidian Charcoal (#1A1A1A) - dark, mysterious
- **Internal Nebula:** Purple (#8B4FF7) → Cyan (#00D9FF) gradient
- **Quills:** Electric Blue (#3399FF) with emissive tips
- **Eyes:** Neon Gold (#FFD700) with slit pupils
- **Tail 1 (Gold):** Gold (#FFD700) with energy particles
- **Tail 2 (Blue):** Blue (#0066FF) with protective glow
- **Tail 3 (White):** White (#FFFFFF) with iridescent shift
- **Aura:** Iridescent (shifts: gold/blue/white based on emotion)

### Material Breakdown

#### Body (Star-Slime Chimera)
- **Type:** Dual-layer shader (opaque + translucent)
- **Shader:** Principled BSDF + Volume Shader
- **Base Color:** Obsidian Charcoal (#1A1A1A)
- **Roughness:** 0.6 (semi-matte)
- **Metallic:** 0.0
- **Subsurface Scattering:** 0.3 (nebula glow)
- **Volume:** Nebula effect (purple → cyan gradient)
- **Normal Map:** Subtle surface detail

#### Internal Nebula
- **Type:** Volume shader (internal effect)
- **Shader:** Volume Scatter + Volume Absorption
- **Color:** Purple (#8B4FF7) → Cyan (#00D9FF) gradient
- **Density:** 0.1-0.3 (pulsing effect)
- **Animated:** 2-second heartbeat rhythm

#### Quills (Electric)
- **Type:** Metallic with emissive tips
- **Shader:** Principled BSDF + Emission
- **Base Color:** Electric Blue (#3399FF)
- **Metallic:** 0.8 (reflective)
- **Roughness:** 0.2 (shiny)
- **Emission:** Blue (#00D9FF) at tips, intensity 2.5
- **Normal Map:** Jagged, angular edges

#### Eyes (Neon-Gold)
- **Type:** Emissive material
- **Shader:** Emission Shader
- **Color:** Neon Gold (#FFD700)
- **Intensity:** 3.5 (bright, wise)
- **Pupils:** Slit pupils (fusion of fox/hedgehog)
- **Expression:** Wise, burdened, hopeful

#### Three Tails (Memory System)

**Tail 1 - Gold (Liquid Ink)**
- **Shader:** Principled BSDF + Emission + Transparency
- **Base Color:** Gold (#FFD700)
- **Metallic:** 0.4
- **Roughness:** 0.1 (glossy liquid)
- **Emission:** Gold particles, intensity 2.0
- **Alpha:** 0.8 (semi-transparent)
- **Effect:** Hard-light echo trail

**Tail 2 - Blue (Semi-Solid)**
- **Shader:** Principled BSDF + Emission
- **Base Color:** Blue (#0066FF)
- **Metallic:** 0.3
- **Roughness:** 0.4 (matte rubber)
- **Emission:** Blue glow, intensity 1.5
- **Effect:** Web-tether capability (defensive)

**Tail 3 - White (Ghostly)**
- **Shader:** Emission + Transparent BSDF
- **Base Color:** White (#FFFFFF)
- **Emission:** Iridescent (shifts color), intensity 2.0
- **Alpha:** 0.5-0.7 (highly transparent)
- **Effect:** Memory echo visualization

#### Iridescent Aura
- **Type:** Volumetric effect (particle system)
- **Color:** Shifts based on emotional state:
  - **Neutral:** Gold/Blue/White mix
  - **Angry/Determined:** Gold (Jaxon's courage)
  - **Protective:** Blue (Kaison's guardianship)
  - **Hopeful/Unified:** White (harmony)
- **Intensity:** 0.3-0.8 (scales with emotion)
- **Radius:** 0.2-0.5 units

---

## Animation Requirements

### Priority Animations (Phase 1)
1. **Idle** (120 frames, 2s loop)
   - Nebulae pulse with 2-second heartbeat rhythm
   - Tails gently sway (memory echoes)
   - Quills subtly crackle with energy
   - Aura shifts color slowly

2. **Walk Cycle** (30 frames, 0.5s)
   - Confident, balanced steps
   - Tails maintain harmony
   - Speed: 1.65 units/second

3. **Run Cycle** (24 frames, 0.4s)
   - Full sprint with fusion power
   - Gold tail creates speed trail
   - Blue tail provides stability
   - White tail shows memory echoes
   - Speed: 2.8 units/second

4. **Hyper Fusion Dash** (30 frames, 0.5s)
   - Ultimate speed burst
   - All three tails create energy wake
   - Combines fox agility + hedgehog power
   - Speed: 5.6 units/second (2x run speed)

5. **Fusion Blaster Barrage** (60 frames, 1.0s)
   - Triple-tail rapid-fire energy volley
   - Each tail fires different colored projectiles
   - Can fire while moving
   - Muzzle flash effects

6. **Triple Tail Tornado (Recovery)** (90 frames, 1.5s)
   - Helicopter-style recovery
   - All three tails create upward thrust
   - Sustained altitude
   - Energy vortex effect

7. **Memory Echo Dive** (120 frames, 2.0s)
   - Phase into past timelines
   - White tail creates temporal portal
   - Character becomes semi-transparent
   - Echo effects around body

8. **Echo Fusion Strike** (45 frames, 0.75s)
   - Channel fallen allies' moves
   - Tails morph to show different heroes
   - Multi-hit combo
   - Memory particle effects

9. **Jump** (45 frames, 0.75s)
   - High, controlled jump
   - Tails whip upward for momentum
   - Excellent air control
   - Height: 15 units

10. **Hit Reaction** (12 frames, 0.2s)
    - Protective stance
    - Blue tail wraps defensively
    - Brief invincibility flash

11. **Victory Pose** (180 frames, 3s)
    - Majestic fusion stance
    - All three tails fan out
    - Iridescent aura flourish
    - Memory echo particles

---

## Technical Specifications

### Polycount Targets
- **LOD0 (High Detail):** 40,000-50,000 tris
- **LOD1 (Medium Detail):** 20,000-25,000 tris
- **LOD2 (Low Detail):** 10,000-15,000 tris

### Rigging Requirements
- **Total Bones:** 85-95
- **Body Rig:** Standard biped (30 bones)
- **Tail Bones:** 30 bones (3 tails × 10 bones each)
- **Facial Bones:** 15 bones (expressions)
- **IK Handles:** Feet, hands, tail tips

### Texture Maps (2048x2048)
- [ ] `KAIJAX_Albedo.png` - Base color map
- [ ] `KAIJAX_Normal.png` - Surface detail
- [ ] `KAIJAX_MR.png` - Metallic/Roughness
- [ ] `KAIJAX_Emissive.png` - Eyes, quills, tails (1024x1024)
- [ ] `KAIJAX_AO.png` - Ambient occlusion (1024x1024)
- [ ] `KAIJAX_Nebula.png` - Internal nebula texture (1024x1024)

### Export Settings
- **Format:** GLB (GLTF 2.0) for web
- **Coordinate System:** Y-Up, Right-Handed
- **Scale:** 1 unit = 1 meter
- **Compression:** Draco (mesh compression)
- **Textures:** Embedded in GLB

---

## Special Effects Integration

### Memory Echo System
- **Visual Effect:** White tail creates temporal portals
- **Particle Count:** 100-200 memory particles
- **Color:** Iridescent white with hero color hints
- **Duration:** 2.0 seconds
- **Integration:** Memory Echo Dive ability

### Three-Tail Energy Trails
- **Gold Tail:** Speed trails (cyan/gold)
- **Blue Tail:** Defensive barriers (blue energy)
- **White Tail:** Memory echoes (iridescent particles)
- **Trail Length:** 2.0 units
- **Fade Rate:** 2.0 alpha/second

### Iridescent Aura System
- **Base Intensity:** 0.3 (always active)
- **Emotional Boost:** +0.5 based on state
- **Color Shift:** Gold/Blue/White based on emotion
- **Visual Effect:** Volumetric glow around character
- **Radius:** Scales with intensity (0.2-0.5 units)

---

## Design Philosophy

**"The Memory Hero"**
- Kai-Jax represents unity through fusion
- Three tails symbolize the three core aspects: speed, strength, harmony
- Iridescent aura shows emotional complexity
- Internal nebula represents the memories within
- Every design element emphasizes the fusion nature

**Legally Distinct:**
- Unique three-tail system (not standard)
- Star-slime chimera form (original)
- Iridescent aura (unique mechanic)
- Memory echo system (original)
- Original silhouette and proportions

---

## Reference Images & Inspiration

### Primary References
- Story Bible: "Majestic fusion with three distinct tails"
- Production Bible: Fusion Ascendant archetype
- Omega Protocol: After-image shadows, memory mechanics

### Visual Style
- **Art Style:** Stylized low-poly to mid-poly
- **Bronx Grit:** 0.08 opacity asphalt overlay
- **Materials:** PBR workflow with emissive/volumetric elements
- **Animation:** Majestic, fusion-focused, memory-driven

---

## Character Arc Integration

**Core Wound:** Born from loss; exists because others died  
**Visual Expression:** Aura shifts based on emotional state, memory echoes intensify  
**Growth Arc:** Aura becomes more stable, tails become more unified over time

**Three Tail Meanings (Story Bible Canon):**
- **Gold Tail:** Speed and Courage (Jaxon's core)
- **Blue Tail:** Strength and Guardianship (Kaison's core)
- **White Tail:** Harmony and Hope (Unity of both plus fallen heroes)

---

## Quality Checklist

Before finalizing model:
- [ ] Three tails properly rigged and weighted
- [ ] Internal nebula effect works (volume shader)
- [ ] Iridescent aura shifts with emotional state
- [ ] Memory echo system integrates properly
- [ ] Materials pass Bronx Grit overlay test
- [ ] File size < 50MB (compressed)
- [ ] Animations loop cleanly
- [ ] LOD versions created and tested
- [ ] Export works in Three.js/React Three Fiber
- [ ] Performance: 60 FPS with effects active

---

**Status:** Design Phase  
**Next Steps:** Create Blender base model, rig three tails, texture materials, implement nebula effect  
**Target Completion:** Phase 1 (Core Model + Priority Animations)

---

*"When two become one, the Memory Hero wakes."* ⚡🦊🦔

