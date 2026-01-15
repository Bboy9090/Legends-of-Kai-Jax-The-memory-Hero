# Blender Automation Scripts
## OMEGA PROTOCOL - Character Model Automation

This directory contains Python scripts to automate common character modeling tasks in Blender.

---

## 📋 Available Scripts

### 1. `export_glb.py`
**Purpose:** Automated GLB export with OMEGA PROTOCOL settings

**Features:**
- Exports with Draco compression
- Creates LOD versions (0, 1, 2)
- Applies all export settings automatically
- Validates output

**Usage:**
```python
# In Blender Text Editor:
# 1. Open script
# 2. Modify character_id if needed
# 3. Run Script (Alt+P)
```

**Output:**
- `[CHARACTER]_LOD0.glb`
- `[CHARACTER]_LOD1.glb`
- `[CHARACTER]_LOD2.glb`

---

### 2. `setup_character_rig.py`
**Purpose:** Automated rigging setup for character types

**Features:**
- Creates base Rigify rig
- Adds character-specific bones (quills/tails)
- Configures bone hierarchy
- Supports: Jaxon, Kaison, Kai-Jax, Silver, Lunara

**Usage:**
```python
# In Blender Text Editor:
# 1. Open script
# 2. Set character_id = "JAXON" (or other)
# 3. Run Script (Alt+P)
```

**Output:**
- Complete armature with character-specific bones
- Ready for weight painting

---

### 3. `create_material_presets.py`
**Purpose:** Creates PBR material presets for characters

**Features:**
- Pre-configured materials for all characters
- PBR workflow (Principled BSDF)
- Emission materials for eyes/quills
- Transparency support for energy effects

**Usage:**
```python
# In Blender Text Editor:
# 1. Open script
# 2. Run Script (Alt+P)
# 3. Materials appear in Material Library
```

**Output:**
- Material library with all character materials
- Ready to assign to meshes

---

## 🚀 Quick Start

### Install Scripts in Blender

1. **Copy Scripts:**
   - Copy scripts to Blender's addons directory, OR
   - Keep in project folder and load as text

2. **Load Script:**
   - Blender → Text Editor
   - Open → Select script file
   - Run Script (Alt+P)

3. **Use Materials:**
   - Materials appear in Material Library
   - Assign to meshes via Material Properties

---

## 📝 Script Customization

### Adding New Characters

**For `setup_character_rig.py`:**
```python
RIG_CONFIGS['NEW_CHAR'] = {
    'quills': 5,  # or 'tails': 3
    'quill_bones_per_quill': 3,
    'base_rig': 'human_meta_rig',
}
```

**For `create_material_presets.py`:**
```python
MATERIAL_PRESETS['NEW_CHAR'] = {
    'body': {
        'name': 'MAT_NewChar_Body',
        'base_color': (1.0, 0.0, 0.0, 1.0),  # RGBA
        'metallic': 0.0,
        'roughness': 0.5,
    },
    # ... more materials
}
```

---

## 🔧 Advanced Usage

### Batch Export
```python
# Export multiple characters
characters = ['JAXON', 'KAISON', 'KAIJAX']
for char in characters:
    export_all_lods(char)
```

### Custom Material Creation
```python
# Create custom material
preset = {
    'name': 'MAT_Custom',
    'base_color': (0.5, 0.5, 0.5, 1.0),
    'metallic': 0.5,
    'roughness': 0.5,
}
mat = create_material(preset)
```

---

## ⚠️ Requirements

- **Blender 4.0+**
- **Rigify Addon** (for rigging script)
- **glTF 2.0 Export Addon** (for export script)

---

## 🐛 Troubleshooting

### Script Not Running
- Check Blender version (4.0+)
- Verify addons are enabled
- Check console for errors (Window → Toggle System Console)

### Export Fails
- Ensure mesh is selected
- Check file path permissions
- Verify Draco compression is available

### Rig Not Generating
- Ensure Rigify addon is enabled
- Check mesh is in correct location
- Verify bone naming doesn't conflict

---

## 📚 Next Steps

After running scripts:
1. **Weight Paint** (manual step)
2. **Create Animations** (manual step)
3. **Export GLB** (use export script)
4. **Test in Game** (use integration tests)

---

*"Automate the repetitive. Focus on the creative."* 🤖🎨
