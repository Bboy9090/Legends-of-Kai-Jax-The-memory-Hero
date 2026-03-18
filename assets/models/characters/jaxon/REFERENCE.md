# JAXON Model Reference
## THE UNSTOPPABLE FORCE 🦔

**Character ID:** JAXON  
**Species:** Hedgehog Hero (Speed Demon)  
**Height:** 3.0 feet (0.91 meters)  
**Weight Class:** Light (75 weight units)

---

## Visual Identity (Story Bible Canon)

**Archetype:** Speed Demon / Momentum Master  
**Visual Identity:** Hedgehog-inspired hero with electric blue spines, perpetual motion energy, crimson power-up aura when charged

### Core Design Elements
- **Primary Form:** Streamlined hedgehog build optimized for speed
- **Spines/Quills:** 7 massive electric blue quills that crackle with energy
- **Eyes:** Bright green (#00FF00) with determined expression
- **Body:** Compact, aerodynamic silhouette
- **Energy Aura:** Crimson power-up glow when charged (Spin Dash)

---

## Detailed Specifications

### Dimensions
- **Body Length:** 0.8 units (head to tail base)
- **Height:** 0.9 units (standing)
- **Width:** 0.6 units (at shoulders)
- **Quill Length:** 0.4-0.6 units (varies by quill)
- **Quill Count:** 7 primary quills (3 on each side, 1 center)

### Quill System
Each quill requires:
- **Base Bone:** Root attachment point
- **Mid Bone:** Flex point for motion
- **Tip Bone:** End point for trail effects
- **Trail Effect:** Electric blue energy trail (particle system)

### Color Palette (OMEGA Protocol)
- **Primary Body:** Electric Blue (#0066FF) - Sonic-inspired but distinct
- **Quills:** Electric Blue (#3399FF) with emissive tips (#00D9FF)
- **Eyes:** Bright Green (#00FF00) - determined, energetic
- **Power-Up Aura:** Crimson (#FF4500) when Spin Dash charging
- **Speed Trails:** Cyan (#00CED1) motion blur
- **Gold Rings:** (#FFD700) - collectible aesthetic (optional accessories)

### Material Breakdown

#### Body Fur
- **Type:** Short, sleek fur texture
- **Shader:** Principled BSDF
- **Base Color:** Electric Blue (#0066FF)
- **Roughness:** 0.3 (slightly glossy)
- **Metallic:** 0.0
- **Normal Map:** Subtle fur direction

#### Quills
- **Type:** Hard, metallic spines
- **Shader:** Principled BSDF + Emission
- **Base Color:** Electric Blue (#3399FF)
- **Metallic:** 0.8 (reflective)
- **Roughness:** 0.2 (shiny)
- **Emission:** Cyan (#00D9FF) at tips, intensity 2.0
- **Normal Map:** Sharp edges, angular

#### Eyes
- **Type:** Emissive material
- **Shader:** Emission Shader
- **Color:** Bright Green (#00FF00)
- **Intensity:** 3.0
- **Pupils:** Black, expressive

#### Power-Up Aura
- **Type:** Volumetric effect (particle system)
- **Color:** Crimson (#FF4500)
- **Intensity:** Scales with Spin Dash charge (0-100%)
- **Radius:** 0.1-0.3 units based on charge

---

## Animation Requirements

### Priority Animations (Phase 1)
1. **Idle** (120 frames, 2s loop)
   - Subtle breathing
   - Quills gently sway
   - Occasional foot tap (impatient energy)

2. **Walk Cycle** (30 frames, 0.5s)
   - Quick, bouncy steps
   - Quills bounce with rhythm
   - Speed: 1.8 units/second

3. **Run Cycle** (24 frames, 0.4s)
   - Full sprint pose
   - Quills stream backward
   - Speed trails activate
   - Speed: 3.2 units/second

4. **Spin Dash Charge** (60 frames, 1.0s)
   - Crouch into ball
   - Quills extend outward
   - Crimson aura builds
   - Charge meter visual

5. **Spin Dash Release** (30 frames, 0.5s)
   - Explosive launch
   - Quills create energy vortex
   - Speed blur effect
   - After-image shadows activate

6. **Jump** (45 frames, 0.75s)
   - Spring-like launch
   - Quills point upward
   - Air control animation
   - Height: 13 units

7. **Homing Attack** (36 frames, 0.6s)
   - Lock-on pose
   - Dash toward target
   - Quills create energy trail
   - Impact effect on hit

8. **Multi-Hit Tornado** (90 frames, 1.5s)
   - Stationary spin
   - Quills create damage vortex
   - Multi-hit frames: 30-75
   - Energy particles

9. **Hit Reaction** (12 frames, 0.2s)
   - Knockback pose
   - Quills flatten
   - Brief invincibility flash

10. **Victory Pose** (180 frames, 3s)
    - Confident stance
    - Quills fan out
    - Speed trail flourish

---

## Technical Specifications

### Polycount Targets
- **LOD0 (High Detail):** 35,000-45,000 tris
- **LOD1 (Medium Detail):** 18,000-25,000 tris
- **LOD2 (Low Detail):** 8,000-12,000 tris

### Rigging Requirements
- **Total Bones:** 65-75
- **Body Rig:** Standard biped (30 bones)
- **Quill Bones:** 21 bones (7 quills × 3 bones each)
- **Facial Bones:** 15 bones (expressions)
- **IK Handles:** Feet, hands, quill tips

### Texture Maps (2048x2048)
- [ ] `JAXON_Albedo.png` - Base color map
- [ ] `JAXON_Normal.png` - Surface detail
- [ ] `JAXON_MR.png` - Metallic/Roughness (R=Metallic, G=Roughness)
- [ ] `JAXON_Emissive.png` - Quill tips, eyes (1024x1024)
- [ ] `JAXON_AO.png` - Ambient occlusion (1024x1024)

### Export Settings
- **Format:** GLB (GLTF 2.0) for web
- **Coordinate System:** Y-Up, Right-Handed
- **Scale:** 1 unit = 1 meter
- **Compression:** Draco (mesh compression)
- **Textures:** Embedded in GLB

---

## Special Effects Integration

### Speed Trails (After-Image System)
- **Trigger Speed:** 3.0+ units/second
- **Max After-Images:** 8
- **Trail Color:** Cyan (#00CED1)
- **Fade Rate:** 2.5 alpha/second
- **Blur Intensity:** 1.0

### Spin Dash Effects
- **Charge Particles:** Crimson energy orbs
- **Release Explosion:** Radial energy burst
- **Screen Shake:** Weight-scaled (light = less shake)
- **Hit-Stop:** 0.08s on legendary blows

---

## Design Philosophy

**"The Unstoppable Force"**
- Jaxon represents pure speed and momentum
- Every design element emphasizes forward motion
- Quills create dynamic silhouette even at rest
- Energy effects communicate power and speed
- Crimson aura shows transformation/charge state

**Legally Distinct:**
- Inspired by Sonic but visually distinct
- Electric blue (not classic blue)
- 7 quills (not standard hedgehog)
- Crimson power-up (unique mechanic)
- Original silhouette and proportions

---

## Reference Images & Inspiration

### Primary References
- Story Bible: "Hedgehog-inspired hero with electric blue spines"
- Production Bible: Speed Demon archetype
- Omega Protocol: After-image shadows for speedsters

### Visual Style
- **Art Style:** Stylized low-poly to mid-poly
- **Bronx Grit:** 0.08 opacity asphalt overlay
- **Materials:** PBR workflow with emissive elements
- **Animation:** Snappy, responsive, frame-perfect

---

## Quality Checklist

Before finalizing model:
- [ ] All quills properly rigged and weighted
- [ ] Speed trails integrate with AfterImageSystem
- [ ] Spin Dash charge visual feedback works
- [ ] Materials pass Bronx Grit overlay test
- [ ] File size < 50MB (compressed)
- [ ] Animations loop cleanly
- [ ] LOD versions created and tested
- [ ] Export works in Three.js/React Three Fiber
- [ ] Performance: 60 FPS with effects active

---

**Status:** Design Phase  
**Next Steps:** Create Blender base model, rig quills, texture materials  
**Target Completion:** Phase 1 (Core Model + Priority Animations)

---

*"Gotta go fast—but make it legendary."* ⚡🦔
