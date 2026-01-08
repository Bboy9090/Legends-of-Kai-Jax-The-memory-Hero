# Blender Workspace Setup for Jaxon
## Optimal Configuration for Character Modeling

---

## 🎯 Workspace Layout

### Recommended Layout
```
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
│  3D View    │  Outliner   │  Properties  │
│  (Main)     │             │             │
│             │             │             │
├─────────────┼─────────────┼─────────────┤
│             │             │             │
│  Material   │  UV Editor  │  Timeline   │
│  Properties │             │             │
│             │             │             │
└─────────────┴─────────────┴─────────────┘
```

### Setup Steps
1. **Split Views:**
   - Right-click viewport border → Split
   - Create 6 panels as shown above

2. **Assign Editors:**
   - Top Left: 3D Viewport
   - Top Middle: Outliner
   - Top Right: Properties
   - Bottom Left: Shader Editor
   - Bottom Middle: UV Editor
   - Bottom Right: Timeline

3. **Save Layout:**
   - Window → Save Current Layout
   - Name: "Character Modeling"

---

## ⚙️ Scene Settings

### Units Configuration
```
Scene Properties → Units
├── Unit System: Metric
├── Unit Scale: 1.000
└── Length: Meters
```

### Grid Settings
```
Overlays → Grid
├── Scale: 1.0
├── Subdivisions: 10
└── Location: Floor
```

### Viewport Settings
```
Viewport Shading → Material Preview
├── Backface Culling: ✓ (for silhouette check)
├── Cavity: ✓ (for detail visibility)
└── Shadow: ✓ (for depth perception)
```

---

## 🎨 Material Preview Setup

### Quick Material Test
1. **Create Test Material:**
   - Material Properties → New
   - Name: "Jaxon_Test"
   - Base Color: #0066FF (Electric Blue)

2. **Assign to Mesh:**
   - Select mesh
   - Assign material

3. **Check in Viewport:**
   - Should see electric blue color
   - Verify material preview mode

---

## 📐 Reference Setup

### Add Reference Images (Optional)
1. **Import Reference:**
   - Shift+A → Image → Reference
   - Load REFERENCE.md or concept art

2. **Position Reference:**
   - Front view: NumPad 1
   - Side view: NumPad 3
   - Adjust position/scale

### Add Measurement Guides
1. **Create Empty Objects:**
   - Shift+A → Empty → Plain Axes
   - Position at key points:
     - Height: 0.9 units
     - Width: 0.6 units
     - Length: 0.8 units

---

## 🛠️ Tool Setup

### Enable Addons
```
Edit → Preferences → Add-ons
├── ✅ Rigify (Auto-rigging)
├── ✅ Import-Export: glTF 2.0
├── ✅ Mesh: F2 (Fast face creation)
└── ✅ Mesh: LoopTools
```

### Customize Toolbar
1. **Edit Mode Tools:**
   - Extrude
   - Inset Faces
   - Loop Cut
   - Knife
   - Smooth

2. **Sculpt Mode Tools:**
   - Draw
   - Grab
   - Smooth
   - Inflate
   - Crease

---

## ⌨️ Custom Shortcuts (Optional)

### Recommended Shortcuts
```
[Custom Shortcuts]
├── Shift+Q: Quick Export (GLB)
├── Shift+R: Quick Rig Setup
├── Shift+M: Material Presets
└── Shift+V: Validate Model
```

### Setup Custom Shortcuts
1. Edit → Preferences → Keymap
2. Search for action
3. Assign custom key
4. Save preferences

---

## 📋 Workspace Checklist

Before starting Jaxon:

- [ ] Blender 4.0+ installed
- [ ] Units set to Metric (1 unit = 1 meter)
- [ ] Grid scale: 1.0
- [ ] Viewport: Material Preview
- [ ] Backface Culling enabled
- [ ] Essential addons enabled
- [ ] Workspace layout saved
- [ ] REFERENCE.md open (external)
- [ ] MODELING_GUIDE.md open (external)
- [ ] CHECKLIST.md open (external)

---

## 🎯 Quick Actions

### Switch Views
```
NumPad 1: Front
NumPad 3: Side
NumPad 7: Top
NumPad 5: Orthographic/Perspective toggle
NumPad 0: Camera view
```

### Navigation
```
Middle Mouse: Rotate view
Shift+Middle Mouse: Pan
Scroll Wheel: Zoom
```

### Selection
```
A: Select All
Alt+A: Deselect All
B: Box Select
C: Circle Select
```

---

## 💾 Save Settings

### Auto-Save Setup
```
File → Preferences → Save & Load
├── Auto Save: ✓
├── Timer: 2 minutes
└── Versions: 2
```

### Project File Structure
```
jaxon/
├── Jaxon_Blockout.blend
├── Jaxon_HighPoly.blend
├── Jaxon_Retopo.blend
├── Jaxon_Rigged.blend
├── Jaxon_Animated.blend
└── Jaxon_Final.blend
```

**Save frequently!** Use version numbers for major milestones.

---

## 🚀 Ready to Model?

Once workspace is set up:
1. ✅ All settings configured
2. ✅ Reference documents open
3. ✅ Workspace layout saved
4. ✅ Ready to start Phase 1: Blockout

**Next:** Open `MODELING_GUIDE.md` and begin!

---

*"Proper setup saves hours. Start right, finish legendary."* ⚙️🦔
