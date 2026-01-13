# Jaxon Visual Reference Sheet
## Quick Visual Guide for Modeling

---

## 🎨 Color Swatches

### Primary Colors
```
Body:        #0066FF  [Electric Blue]
Quills:      #3399FF  [Electric Blue - Lighter]
Quill Tips:  #00D9FF  [Cyan - Emissive]
Eyes:        #00FF00  [Bright Green - Emissive]
Power-Up:    #FF4500  [Crimson - When Charging]
Speed Trail: #00CED1  [Cyan - Motion Blur]
```

### Material Properties
```
Body:
- Base Color: #0066FF
- Metallic: 0.0
- Roughness: 0.3
- Subsurface: 0.0

Quills:
- Base Color: #3399FF
- Metallic: 0.8
- Roughness: 0.2
- Emission: #00D9FF (intensity 2.5)

Eyes:
- Color: #00FF00
- Emission: 3.0 intensity
```

---

## 📐 Dimension Reference

### Body Proportions
```
        [Head: 0.8x body width]
              ╱╲
             ╱  ╲
            ╱    ╲
           ╱      ╲
          ╱        ╲
         ╱          ╲
        ╱            ╲
       ╱              ╲
      ╱                ╲
     ╱                  ╲
    ╱                    ╲
   ╱                      ╲
  ╱                        ╲
 ╱                          ╲
╱____________________________╲
│                            │
│      Body: 0.8 × 0.6       │
│      Height: 0.9           │
│                            │
│  [Arms: 0.4]  [Legs: 0.5] │
└────────────────────────────┘
```

### Quill Layout (Top View)
```
        [Center Quill]
            ╱
           ╱
          ╱
    [L3] ╱ [R3]
     ╱   ╱   ╲
    ╱   ╱     ╲
   ╱   ╱       ╲
  ╱   ╱         ╲
 ╱   ╱           ╲
╱   ╱             ╲
[L2]╱               ╲[R2]
 ╱ ╱                 ╲ ╲
╱ ╱                   ╲ ╲
[L1]                     [R1]

Left Side: 3 quills (L1, L2, L3)
Right Side: 3 quills (R1, R2, R3)
Center: 1 quill
Total: 7 quills
```

### Quill Angles (Side View)
```
        ╱ [Center - Straight up/back]
       ╱
      ╱
     ╱
    ╱ [L3/R3 - 60° upward, 45° outward]
   ╱
  ╱
 ╱
╱ [L2/R2 - 50° upward, 40° outward]
╱
[L1/R1 - 45° upward, 30° outward]

Angles vary slightly for natural look
```

---

## 🎭 Silhouette Reference

### Front View
```
        ╱╲
       ╱  ╲  [Head]
      ╱    ╲
     ╱      ╲
    ╱        ╲
   ╱          ╲
  ╱            ╲
 ╱              ╲
╱                ╲
│                │
│      Body      │
│                │
│  [Arms] [Arms] │
│                │
│  [Legs] [Legs] │
└────────────────┘
```

### Side View
```
        ╱╲
       ╱  ╲
      ╱    ╲
     ╱      ╲
    ╱        ╲
   ╱          ╲
  ╱            ╲
 ╱              ╲
╱                ╲
│                │
│      Body      │
│                │
│      [Arm]     │
│                │
│      [Leg]     │
└────────────────┘
```

### Top View (Quills Visible)
```
    ╱     ╱     ╲     ╲
   ╱     ╱       ╲     ╲
  ╱     ╱         ╲     ╲
 ╱     ╱           ╲     ╲
╱     ╱             ╲     ╲
│     │               │     │
│     │     Body      │     │
│     │               │     │
└─────┘               └─────┘
[L3]  [L2]  [L1]  [C]  [R1]  [R2]  [R3]
```

---

## 🎨 Material Setup (Blender)

### Body Material Node Setup
```
[Image Texture: Albedo] → [Principled BSDF: Base Color]
[Image Texture: Normal] → [Principled BSDF: Normal]
[Image Texture: MR]     → [Principled BSDF: Metallic/Roughness]
[Image Texture: AO]     → [Mix: Multiply with Base Color]
                          ↓
                    [Material Output]
```

### Quill Material Node Setup
```
[Image Texture: Albedo] → [Principled BSDF: Base Color]
[Image Texture: Normal] → [Principled BSDF: Normal]
[Image Texture: MR]     → [Principled BSDF: Metallic/Roughness]
[Image Texture: Emissive] → [Principled BSDF: Emission]
                            ↓
                      [Material Output]
```

### Eye Material Node Setup
```
[Emission Shader]
  Color: #00FF00
  Strength: 3.0
    ↓
[Material Output]
```

---

## 🦴 Bone Structure Reference

### Quill Bone Hierarchy
```
Quill_01_base
  └── Quill_01_mid
      └── Quill_01_tip

Quill_02_base
  └── Quill_02_mid
      └── Quill_02_tip

... (repeat for all 7 quills)
```

### Body Bone Hierarchy
```
Root
  └── Spine_01
      └── Spine_02
          └── Spine_03
              ├── Neck
              │   └── Head
              ├── Shoulder_L
              │   └── Arm_L
              │       └── Hand_L
              ├── Shoulder_R
              │   └── Arm_R
              │       └── Hand_R
              ├── Hip_L
              │   └── Leg_L
              │       └── Foot_L
              └── Hip_R
                  └── Leg_R
                      └── Foot_R
```

---

## 🎬 Animation Timing Reference

### Frame Rates (60 FPS)
```
Idle:           120 frames = 2.0 seconds
Walk:            30 frames = 0.5 seconds
Run:             24 frames = 0.4 seconds
Spin Dash Charge: 60 frames = 1.0 seconds
Spin Dash Release: 30 frames = 0.5 seconds
Jump:            45 frames = 0.75 seconds
Homing Attack:   36 frames = 0.6 seconds
Multi-Hit Tornado: 90 frames = 1.5 seconds
Hit Reaction:     12 frames = 0.2 seconds
Victory Pose:    180 frames = 3.0 seconds
```

---

## 📏 Measurement Guide

### Blender Units = Meters
```
1 Blender Unit = 1 Meter

Jaxon Height: 0.9 units = 0.9 meters = 3.0 feet
Body Length: 0.8 units = 0.8 meters
Body Width: 0.6 units = 0.6 meters
Quill Length: 0.4-0.6 units
```

### Scale Reference
```
Jaxon is SMALL compared to human:
- Human: ~1.7 units tall
- Jaxon: 0.9 units tall
- Ratio: Jaxon is ~53% of human height
```

---

## 🎯 Key Features to Capture

### Speed Demon Aesthetic
- ✅ Streamlined, aerodynamic form
- ✅ Forward-leaning posture (ready to run)
- ✅ Quills angled backward (speed lines)
- ✅ Lean, athletic build

### Electric Blue Identity
- ✅ Vibrant blue (not muted)
- ✅ Slight metallic sheen on quills
- ✅ Cyan energy at quill tips
- ✅ Bright, energetic colors

### Determined Expression
- ✅ Eyes forward (focused)
- ✅ Slight smile (confident)
- ✅ Alert, ready stance
- ✅ Energetic body language

---

## 🔍 Quality Checkpoints

### Blockout Check
- [ ] Proportions match dimensions
- [ ] Silhouette recognizable
- [ ] 7 quills positioned
- [ ] Ready for detail work

### Sculpting Check
- [ ] Organic, streamlined shape
- [ ] Quills properly shaped
- [ ] Face has character
- [ ] Ready for retopology

### Retopology Check
- [ ] Clean quad topology
- [ ] Edge loops follow form
- [ ] UVs unwrapped
- [ ] Ready for texturing

### Texturing Check
- [ ] Electric blue color correct
- [ ] Quills have metallic sheen
- [ ] Eyes glow green
- [ ] Ready for rigging

### Rigging Check
- [ ] 21 quill bones working
- [ ] Weight painting smooth
- [ ] Quills deform correctly
- [ ] Ready for animation

### Animation Check
- [ ] All priority animations complete
- [ ] Animations loop seamlessly
- [ ] Timing matches specs
- [ ] Ready for export

---

## 💡 Pro Tips

1. **Start Simple:** Get the blockout right before adding detail
2. **Reference Often:** Keep REFERENCE.md open while working
3. **Test Early:** Check proportions from all angles frequently
4. **Quills First:** Get quill positions right early (hard to fix later)
5. **Iterate:** Don't be afraid to redo sections for quality

---

## 🎨 Visual Style Reminders

- **Stylized, not realistic** - Exaggerated features OK
- **Electric blue** - Vibrant, not muted
- **Speed-focused** - Every element suggests motion
- **Confident** - Determined, energetic expression
- **Legally distinct** - Original silhouette

---

**Keep this open while modeling for quick reference!** 📋🦔
