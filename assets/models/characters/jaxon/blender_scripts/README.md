# Jaxon Blender Scripts
## Quick Automation for Jaxon Modeling

---

## 🚀 Quick Start Script

### `generate_jaxon_blockout.py`

**What it does:**
- Creates complete Jaxon blockout automatically
- Generates body, head, arms, legs, 7 quills, eyes
- Applies basic materials (Electric Blue)
- Sets up proper dimensions
- Ready for sculpting!

**Usage:**
1. Open Blender 4.0+
2. Text Editor → New
3. Open `generate_jaxon_blockout.py`
4. Run Script (Alt+P)
5. **Done!** Blockout created in seconds

**What you get:**
- ✅ Body sphere (correct dimensions)
- ✅ Head sphere
- ✅ 2 Arms (cylinders)
- ✅ 2 Legs (cylinders)
- ✅ 7 Quills (cones, positioned correctly)
- ✅ 2 Eyes (spheres)
- ✅ All parts joined
- ✅ Basic materials applied

**Time saved:** 1-2 hours of manual blockout work!

---

## 📋 What the Script Creates

### Geometry
- **Body:** UV Sphere, scaled to 0.8 × 0.6 × 0.9
- **Head:** UV Sphere, 0.8x body width
- **Arms:** Cylinders, 0.4 units length
- **Legs:** Cylinders, 0.5 units length
- **Quills:** 7 cones, positioned and angled
- **Eyes:** 2 spheres, positioned on head

### Materials
- **MAT_Jaxon_Body:** Electric Blue (#0066FF)
- **MAT_Jaxon_Quills:** Metallic Blue with Cyan emission
- **MAT_Jaxon_Eyes:** Bright Green emission

### Organization
- All parts joined into single mesh
- Named: "Jaxon_Blockout"
- Added to "Jaxon" collection
- Origin set to bottom

---

## 🎯 After Running Script

### Immediate Next Steps

1. **Check Proportions**
   - Front view (NumPad 1)
   - Side view (NumPad 3)
   - Top view (NumPad 7)
   - Verify dimensions match REFERENCE.md

2. **Refine Blockout**
   - Enter Edit Mode (Tab)
   - Adjust proportions if needed
   - Smooth rough edges

3. **Begin Sculpting**
   - Add Subdivision Surface modifier
   - Enter Sculpt Mode
   - Follow Phase 2 in MODELING_GUIDE.md

---

## 🔧 Customization

### Adjust Quill Positions
Edit the `quill_configs` array in the script:
```python
quill_configs = [
    {"pos": (x, y, z), "rot": (rx, ry, rz), "name": "Quill_L1"},
    # ... modify positions/angles
]
```

### Adjust Dimensions
Modify scale values:
```python
# Body scale
scale=(1.0, 0.75, 1.0)  # Adjust for width/length

# Head size
radius=0.32  # Adjust head size
```

### Add More Detail
- Run script to get base
- Enter Edit Mode
- Add loop cuts (Ctrl+R)
- Refine shape
- Then proceed to sculpting

---

## ⚠️ Notes

- **Script creates blockout only** - You still need to:
  - Sculpt details (Phase 2)
  - Retopology (Phase 3)
  - Texture (Phase 4)
  - Rig (Phase 5)
  - Animate (Phase 6)

- **Materials are basic** - You'll need to:
  - Create proper texture maps
  - Set up PBR workflow
  - Add normal maps, etc.

- **Quills are separate** - You may want to:
  - Keep them separate for easier rigging
  - Or join them for unified sculpting

---

## 🎨 Tips

1. **Save Immediately**
   - File → Save As → `Jaxon_Blockout_v1.blend`
   - Keep versions as you progress

2. **Test from All Angles**
   - Rotate view (Middle Mouse)
   - Check silhouette
   - Verify proportions

3. **Refine Before Sculpting**
   - Get blockout perfect first
   - Easier to fix now than later

---

## 🚀 Advanced Usage

### Create Multiple Versions
```python
# Run script
# Save as: Jaxon_Blockout_v1.blend
# Modify script (adjust dimensions)
# Run again
# Save as: Jaxon_Blockout_v2.blend
# Compare and choose best
```

### Export Blockout for Reference
```python
# After running script
# File → Export → glTF 2.0
# Use as reference in other software
```

---

**Ready?** Run the script and start sculpting! 🦔⚡
