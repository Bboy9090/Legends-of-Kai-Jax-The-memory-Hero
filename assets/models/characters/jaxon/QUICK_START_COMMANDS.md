# Jaxon Quick Start - Copy/Paste Commands
## Blender Commands for Immediate Start

---

## 🚀 Option 1: Use Automation Script (Fastest)

### Step 1: Load Script
1. Open Blender
2. Text Editor → New
3. Open: `blender_scripts/generate_jaxon_blockout.py`
4. Run Script: **Alt+P**
5. **Done!** Blockout created

**Time:** 30 seconds

---

## 🚀 Option 2: Manual Blockout (Learning)

### Copy/Paste These Commands in Blender Console

```python
import bpy
from mathutils import Vector
import math

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create body
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(0,0,0.45), scale=(1,0.75,1.125))
body = bpy.context.active_object
body.name = "Jaxon_Body"

# Create head
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(0,0.35,0.8))
head = bpy.context.active_object
head.name = "Jaxon_Head"

# Create left arm
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.4, location=(-0.35,0.2,0.65), rotation=(math.radians(90),0,math.radians(45)))
left_arm = bpy.context.active_object
left_arm.name = "Jaxon_Arm_L"

# Create right arm
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.4, location=(0.35,0.2,0.65), rotation=(math.radians(90),0,math.radians(-45)))
right_arm = bpy.context.active_object
right_arm.name = "Jaxon_Arm_R"

# Create left leg
bpy.ops.mesh.primitive_cylinder_add(radius=0.125, depth=0.5, location=(-0.15,0,0.25))
left_leg = bpy.context.active_object
left_leg.name = "Jaxon_Leg_L"

# Create right leg
bpy.ops.mesh.primitive_cylinder_add(radius=0.125, depth=0.5, location=(0.15,0,0.25))
right_leg = bpy.context.active_object
right_leg.name = "Jaxon_Leg_R"

# Create quills (7 total)
quill_positions = [
    (-0.25, -0.3, 0.7, math.radians(45), math.radians(30)),
    (-0.2, -0.4, 0.75, math.radians(50), math.radians(40)),
    (-0.15, -0.5, 0.8, math.radians(60), math.radians(45)),
    (0, -0.5, 0.85, math.radians(90), 0),
    (0.15, -0.5, 0.8, math.radians(60), math.radians(-45)),
    (0.2, -0.4, 0.75, math.radians(50), math.radians(-40)),
    (0.25, -0.3, 0.7, math.radians(45), math.radians(-30)),
]

for i, (x, y, z, rx, ry) in enumerate(quill_positions):
    bpy.ops.mesh.primitive_cone_add(radius1=0.05, radius2=0.01, depth=0.5, location=(x,y,z), rotation=(rx,ry,0))
    bpy.context.active_object.name = f"Jaxon_Quill_{i+1}"

# Create eyes
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=(-0.08,0.5,0.82), scale=(1,0.8,1))
bpy.context.active_object.name = "Jaxon_Eye_L"

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=(0.08,0.5,0.82), scale=(1,0.8,1))
bpy.context.active_object.name = "Jaxon_Eye_R"

# Join all
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "Jaxon_Blockout"

print("✅ Jaxon blockout created!")
```

**Time:** 2-3 minutes

---

## 🎨 Quick Material Setup

### Copy/Paste in Blender Console

```python
# Create body material
body_mat = bpy.data.materials.new(name="MAT_Jaxon_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.0, 0.4, 1.0, 1.0)  # Electric Blue
bsdf.inputs["Roughness"].default_value = 0.3

# Create quill material
quill_mat = bpy.data.materials.new(name="MAT_Jaxon_Quills")
quill_mat.use_nodes = True
bsdf_q = quill_mat.node_tree.nodes["Principled BSDF"]
bsdf_q.inputs["Base Color"].default_value = (0.2, 0.6, 1.0, 1.0)  # Lighter Blue
bsdf_q.inputs["Metallic"].default_value = 0.8
bsdf_q.inputs["Roughness"].default_value = 0.2
bsdf_q.inputs["Emission Color"].default_value = (0.0, 0.85, 1.0, 1.0)  # Cyan
bsdf_q.inputs["Emission Strength"].default_value = 2.5

# Create eye material
eye_mat = bpy.data.materials.new(name="MAT_Jaxon_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (0.0, 1.0, 0.0, 1.0)  # Bright Green
bsdf_e.inputs["Emission Color"].default_value = (0.0, 1.0, 0.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 3.0

print("✅ Materials created! Assign them in Material Properties.")
```

---

## 📐 Quick Dimension Check

### Verify Proportions

```python
# Select Jaxon blockout
obj = bpy.context.active_object

# Get dimensions
dimensions = obj.dimensions
print(f"Dimensions: X={dimensions.x:.2f}, Y={dimensions.y:.2f}, Z={dimensions.z:.2f}")
print(f"Target: X=0.6, Y=0.8, Z=0.9")

# Check if correct
if abs(dimensions.x - 0.6) < 0.1 and abs(dimensions.y - 0.8) < 0.1 and abs(dimensions.z - 0.9) < 0.1:
    print("✅ Dimensions correct!")
else:
    print("⚠️  Dimensions need adjustment")
```

---

## 🎯 Next Steps After Blockout

### 1. Add Subdivision
```
Select Jaxon_Blockout
Add Modifier → Subdivision Surface
Levels: 2 (Viewport), 3 (Render)
```

### 2. Enter Sculpt Mode
```
Tab → Edit Mode
Or: Mode → Sculpt Mode
```

### 3. Start Sculpting
- Use Grab tool (G) to reshape
- Use Smooth (Shift) to smooth
- Follow Phase 2 in MODELING_GUIDE.md

---

## 💡 Pro Tips

1. **Save Immediately**
   - File → Save As → `Jaxon_Blockout.blend`

2. **Test from All Angles**
   - NumPad 1: Front
   - NumPad 3: Side
   - NumPad 7: Top

3. **Use Reference**
   - Keep REFERENCE.md open
   - Compare proportions

---

**Ready?** Run the script and start building! 🦔⚡
