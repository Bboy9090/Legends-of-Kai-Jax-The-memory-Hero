# KAISON Model Reference
## THE SWIFT GUARDIAN 🦊

**Character ID:** KAISON  
**Species:** Fox Hero (Tactical Striker)  
**Height:** 3.2 feet (0.98 meters)  
**Weight Class:** Light (80 weight units)

---

## Visual Identity (Story Bible Canon)

**Archetype:** Speed Fighter / Tactical Striker  
**Visual Identity:** Fox-inspired hero with golden-orange aura, sleek aerodynamic design, twin tail energy trails

### Core Design Elements
- **Primary Form:** Streamlined fox build optimized for agility
- **Tails:** Two distinct energy tails (twin tail system)
- **Eyes:** Intelligent amber/orange with protective expression
- **Body:** Lean, athletic silhouette
- **Aura:** Golden-orange energy that intensifies with emotion

---

## Detailed Specifications

### Dimensions
- **Body Length:** 0.85 units (head to tail base)
- **Height:** 0.95 units (standing)
- **Width:** 0.55 units (at shoulders)
- **Tail Length:** 1.2 units each (twin tails)
- **Tail Count:** 2 primary tails (guardian energy)

### Twin Tail System
Each tail requires:
- **Base Bone:** Root attachment point
- **Mid Bones:** 4 flex points for fluid motion
- **Tip Bone:** End point for energy trails
- **Energy Trail:** Golden-orange energy particles

### Color Palette (OMEGA Protocol)
- **Primary Body:** Golden-Orange (#FF8C00) - warm, protective
- **Fur Accents:** Bright Orange (#FF6600) highlights
- **Tails:** Energy form - golden (#FFD700) to orange (#FF8C00) gradient
- **Eyes:** Amber (#FF8C00) with protective glow
- **Aura:** Golden-Orange (#FFA500) - intensifies with emotion
- **Energy Trails:** Orange (#FF6600) with gold sparks

### Material Breakdown

#### Body Fur
- **Type:** Sleek, aerodynamic fur
- **Shader:** Principled BSDF
- **Base Color:** Golden-Orange (#FF8C00)
- **Roughness:** 0.4 (natural fur)
- **Metallic:** 0.0
- **Normal Map:** Fur direction, sleek texture
- **Subsurface Scattering:** 0.2 (warm glow)

#### Twin Tails (Energy Form)
- **Type:** Semi-transparent energy
- **Shader:** Principled BSDF + Emission + Transparency
- **Base Color:** Golden (#FFD700) to Orange (#FF8C00) gradient
- **Metallic:** 0.3
- **Roughness:** 0.1 (glossy energy)
- **Emission:** Orange (#FF6600), intensity 2.5
- **Alpha:** 0.7-0.9 (semi-transparent)
- **Normal Map:** Energy flow patterns

#### Eyes
- **Type:** Emissive material with intelligence
- **Shader:** Emission Shader
- **Color:** Amber (#FF8C00)
- **Intensity:** 2.5
- **Pupils:** Dark brown, expressive, protective

#### Guardian Aura
- **Type:** Volumetric effect
- **Color:** Golden-Orange (#FFA500)
- **Intensity:** Scales with emotional state (0-100%)
- **Radius:** 0.15-0.4 units based on intensity
- **Effect:** Protective energy field

---

## Animation Requirements

### Priority Animations (Phase 1)
1. **Idle** (120 frames, 2s loop)
   - Alert, watchful stance
   - Tails gently sway (guardian awareness)
   - Occasional head turn (scanning for threats)

2. **Walk Cycle** (30 frames, 0.5s)
   - Confident, tactical steps
   - Tails maintain balance
   - Speed: 1.5 units/second

3. **Run Cycle** (24 frames, 0.4s)
   - Full sprint with tactical form
   - Tails stream backward
   - Golden-orange speed trails
   - Speed: 2.4 units/second

4. **Fox Dash** (30 frames, 0.5s)
   - Lightning-fast horizontal burst
   - Tails create energy wake
   - Momentum preservation
   - Speed: 4.8 units/second (2x run speed)

5. **Fox Blaster** (45 frames, 0.75s)
   - Rapid energy projectiles
   - Can fire while moving
   - Tails stabilize aim
   - Muzzle flash effects

6. **Fox Fire (Recovery)** (60 frames, 1.0s)
   - Multi-directional recovery
   - Tails create upward thrust
   - Golden-orange energy burst
   - Air control animation

7. **Fox Reflector** (90 frames, 1.5s)
   - Defensive barrier activation
   - Tails create shield energy
   - Reflective surface effect
   - Counter window: frames 20-40

8. **Jump** (45 frames, 0.75s)
   - High, controlled jump
   - Tails provide lift
   - Air control excellent
   - Height: 14 units

9. **Hit Reaction** (12 frames, 0.2s)
   - Protective stance
   - Tails wrap defensively
   - Brief invincibility flash

10. **Victory Pose** (180 frames, 3s)
    - Guardian stance
    - Tails fan out protectively
    - Golden aura flourish

---

## Technical Specifications

### Polycount Targets
- **LOD0 (High Detail):** 30,000-40,000 tris
- **LOD1 (Medium Detail):** 15,000-20,000 tris
- **LOD2 (Low Detail):** 7,000-10,000 tris

### Rigging Requirements
- **Total Bones:** 70-80
- **Body Rig:** Standard biped (30 bones)
- **Tail Bones:** 20 bones (2 tails × 10 bones each)
- **Facial Bones:** 15 bones (expressions)
- **IK Handles:** Feet, hands, tail tips

### Texture Maps (2048x2048)
- [ ] `KAISON_Albedo.png` - Base color map
- [ ] `KAISON_Normal.png` - Surface detail
- [ ] `KAISON_MR.png` - Metallic/Roughness
- [ ] `KAISON_Emissive.png` - Tails, eyes, aura (1024x1024)
- [ ] `KAISON_AO.png` - Ambient occlusion (1024x1024)

### Export Settings
- **Format:** GLB (GLTF 2.0) for web
- **Coordinate System:** Y-Up, Right-Handed
- **Scale:** 1 unit = 1 meter
- **Compression:** Draco (mesh compression)
- **Textures:** Embedded in GLB

---

## Special Effects Integration

### Energy Trails (Twin Tails)
- **Trail Type:** Golden-orange energy particles
- **Particle Count:** 50-100 per tail
- **Trail Length:** 1.5 units
- **Fade Rate:** 3.0 alpha/second
- **Color Gradient:** Gold → Orange → Transparent

### Guardian Aura System
- **Base Intensity:** 0.3 (always active)
- **Emotional Boost:** +0.7 when protecting allies
- **Visual Effect:** Warm, protective glow
- **Radius:** Scales with intensity

### Speed Effects
- **After-Image Threshold:** 2.4+ units/second
- **Trail Color:** Golden-orange (#FFA500)
- **Blur Intensity:** 0.8 (slightly less than Jaxon)

---

## Design Philosophy

**"The Swift Guardian"**
- Kaison represents protection through speed
- Twin tails symbolize dual nature: speed + guardianship
- Golden-orange conveys warmth and protection
- Every design element emphasizes tactical awareness
- Aura system shows emotional investment in protecting others

**Legally Distinct:**
- Inspired by Tails but visually distinct
- Twin tails (not single)
- Golden-orange (not yellow/orange)
- Guardian archetype (not just sidekick)
- Original silhouette and energy system

---

## Reference Images & Inspiration

### Primary References
- Story Bible: "Fox-inspired hero with golden-orange aura"
- Production Bible: Tactical Striker archetype
- Omega Protocol: After-image shadows for speedsters

### Visual Style
- **Art Style:** Stylized low-poly to mid-poly
- **Bronx Grit:** 0.08 opacity asphalt overlay
- **Materials:** PBR workflow with emissive elements
- **Animation:** Tactical, precise, guardian-focused

---

## Quality Checklist

Before finalizing model:
- [ ] Twin tails properly rigged and weighted
- [ ] Energy trails integrate with particle system
- [ ] Guardian aura scales with emotional state
- [ ] Materials pass Bronx Grit overlay test
- [ ] File size < 50MB (compressed)
- [ ] Animations loop cleanly
- [ ] LOD versions created and tested
- [ ] Export works in Three.js/React Three Fiber
- [ ] Performance: 60 FPS with effects active

---

## Character Arc Integration

**Core Wound:** Lost mentor in dimensional collapse  
**Visual Expression:** Guardian aura intensifies when protecting others  
**Growth Arc:** Aura becomes more stable, less reactive over time

---

**Status:** Design Phase  
**Next Steps:** Create Blender base model, rig twin tails, texture materials  
**Target Completion:** Phase 1 (Core Model + Priority Animations)

---

*"Speed is nothing without purpose. Protection is everything."* 🦊⚡
