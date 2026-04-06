# SILVER Model Reference
## THE TIME FIXER ⏱️

**Character ID:** SILVER  
**Species:** Psychic Hedgehog (Temporal Sage)  
**Height:** 3.3 feet (1.0 meters)  
**Weight Class:** Light-Medium (85 weight units)

---

## Visual Identity (Story Bible Canon)

**Archetype:** Mystic Controller / Temporal Mentor  
**Visual Identity:** Platinum-furred hedgehog with cyan eyes, psychokinetic energy aura, temporal distortion effects

### Core Design Elements
- **Primary Form:** Streamlined hedgehog build with psychic energy
- **Quills:** 6 platinum quills that glow with temporal energy
- **Eyes:** Cyan (#00FFFF) with future-vision glow
- **Body:** Lean, mystical silhouette
- **Aura:** Temporal distortion field (time-warp visual effect)

---

## Detailed Specifications

### Dimensions
- **Body Length:** 0.85 units
- **Height:** 1.0 units (standing)
- **Width:** 0.6 units (at shoulders)
- **Quill Length:** 0.5-0.7 units (varies)
- **Quill Count:** 6 primary quills (3 on each side)

### Quill System (Temporal Energy)
Each quill requires:
- **Base Bone:** Root attachment
- **Mid Bone:** Flex point
- **Tip Bone:** Temporal energy emitter
- **Effect:** Time-warp particles at tips

### Color Palette (OMEGA Protocol)
- **Primary Body:** Platinum Silver (#C0C0C0) - distinct from standard silver
- **Quills:** Platinum (#E5E5E5) with cyan energy tips (#00FFFF)
- **Eyes:** Cyan (#00FFFF) with future-vision glow
- **Psychic Aura:** Cyan (#00CED1) temporal distortion
- **Time Effects:** Purple (#8B4FF7) → Cyan (#00FFFF) gradient

### Material Breakdown

#### Body Fur
- **Type:** Sleek, metallic fur
- **Shader:** Principled BSDF
- **Base Color:** Platinum Silver (#C0C0C0)
- **Roughness:** 0.4
- **Metallic:** 0.3 (subtle metallic sheen)
- **Normal Map:** Sleek fur direction

#### Quills (Temporal Energy)
- **Type:** Metallic with temporal energy
- **Shader:** Principled BSDF + Emission
- **Base Color:** Platinum (#E5E5E5)
- **Metallic:** 0.7
- **Roughness:** 0.2
- **Emission:** Cyan (#00FFFF) at tips, intensity 2.5
- **Effect:** Time-warp particles

#### Eyes (Future Vision)
- **Type:** Emissive with temporal effect
- **Shader:** Emission Shader
- **Color:** Cyan (#00FFFF)
- **Intensity:** 3.0
- **Effect:** Shows probability threads (visual effect)

#### Psychic Aura
- **Type:** Temporal distortion field
- **Color:** Cyan (#00CED1)
- **Effect:** Time-warp visual (space distortion)
- **Intensity:** Scales with power usage
- **Radius:** 0.2-0.4 units

---

## Animation Requirements

### Priority Animations (Phase 1)
1. **Idle** (120 frames, 2s loop)
   - Quills gently float (psychic energy)
   - Temporal aura pulses
   - Eyes occasionally glow (future vision)

2. **Walk Cycle** (30 frames, 0.5s)
   - Confident, mystical steps
   - Quills maintain temporal energy
   - Speed: 1.6 units/second

3. **Run Cycle** (24 frames, 0.4s)
   - Psychic-assisted movement
   - Temporal distortion trail
   - Speed: 2.6 units/second

4. **Psychokinesis** (45 frames, 0.75s)
   - Lift objects with psychic energy
   - Quills extend with energy
   - Temporal particles

5. **Time Stop** (60 frames, 1.0s)
   - Freeze localized time
   - Temporal field expands
   - Cyan energy burst

6. **Time Rewind** (90 frames, 1.5s)
   - Rewind localized events
   - Purple → Cyan energy gradient
   - Temporal portal effect

7. **Future Vision** (30 frames, 0.5s)
   - Eyes glow intensely
   - Probability threads visible
   - Temporal particles around head

8. **Jump** (45 frames, 0.75s)
   - Psychic-assisted launch
   - Quills create temporal lift
   - Height: 14 units

9. **Hit Reaction** (12 frames, 0.2s)
   - Temporal shield activates
   - Brief time distortion

10. **Victory Pose** (180 frames, 3s)
    - Temporal energy flourish
    - Future vision effect
    - Time particles

---

## Technical Specifications

### Polycount Targets
- **LOD0 (High Detail):** 35,000-45,000 tris
- **LOD1 (Medium Detail):** 18,000-25,000 tris
- **LOD2 (Low Detail):** 8,000-12,000 tris

### Rigging Requirements
- **Total Bones:** 70-80
- **Body Rig:** Standard biped (30 bones)
- **Quill Bones:** 18 bones (6 quills × 3 bones each)
- **Facial Bones:** 15 bones
- **IK Handles:** Feet, hands, quill tips

### Texture Maps (2048x2048)
- [ ] `SILVER_Albedo.png` - Base color map
- [ ] `SILVER_Normal.png` - Surface detail
- [ ] `SILVER_MR.png` - Metallic/Roughness
- [ ] `SILVER_Emissive.png` - Quills, eyes (1024x1024)
- [ ] `SILVER_AO.png` - Ambient occlusion (1024x1024)

### Export Settings
- **Format:** GLB (GLTF 2.0) for web
- **Coordinate System:** Y-Up, Right-Handed
- **Scale:** 1 unit = 1 meter
- **Compression:** Draco (mesh compression)
- **Textures:** Embedded in GLB

---

## Special Effects Integration

### Temporal Distortion System
- **Visual Effect:** Space-warp around character
- **Particle Count:** 50-100 temporal particles
- **Color:** Cyan (#00CED1) with purple hints
- **Duration:** Continuous (scales with power)
- **Integration:** Time manipulation abilities

### Future Vision Effect
- **Visual Effect:** Probability threads from eyes
- **Color:** Cyan (#00FFFF)
- **Intensity:** 3.0
- **Duration:** 0.5 seconds (ability activation)

### Time-Warp Particles
- **Quill Tips:** Emit temporal particles
- **Color:** Purple → Cyan gradient
- **Trail Length:** 1.5 units
- **Fade Rate:** 2.0 alpha/second

---

## Design Philosophy

**"The Time Fixer"**
- Silver represents temporal mastery and responsibility
- Platinum fur distinguishes from standard silver
- Cyan energy shows future/time connection
- Temporal effects communicate power
- Mystical, mentor-like presence

**Legally Distinct:**
- Platinum fur (not standard silver)
- Cyan eyes (not blue)
- 6 quills (not standard hedgehog)
- Temporal distortion (unique mechanic)
- Original silhouette and proportions

---

## Character Arc Integration

**Core Drive:** Prevent catastrophic timeline collapses  
**Visual Expression:** Temporal aura intensifies when fixing timelines  
**Growth Arc:** Aura becomes more controlled, less chaotic over time

---

**Status:** Design Phase  
**Next Steps:** Create Blender base model, rig quills, texture materials  
**Target Completion:** Phase 2 (Trinity System)

---

*"Time is not a river. It's an ocean. And I navigate its currents."* ⏱️⚡
