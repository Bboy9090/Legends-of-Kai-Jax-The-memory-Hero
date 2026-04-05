"""
Kaison Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Kaison character (Fox Hero)

Usage:
1. Open Blender
2. Text Editor → New
3. Paste this script
4. Run Script (Alt+P)
"""

import bpy
import bmesh
from mathutils import Vector
import math

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ============================================
# PHASE 1: CREATE BASE BODY (BEAST-KIN FOX)
# ============================================

print("Creating Kaison base body (Beast-Kin Fox Hero)...")

# Create body sphere (slightly taller than Jaxon)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.425,
    location=(0, 0, 0.475),
    scale=(1.0, 0.85, 1.0)  # 0.85 length, 0.55 width, 0.95 height
)
body = bpy.context.active_object
body.name = "Kaison_Body"

# Enter Edit Mode to refine
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.0, 0.65, 1.0))  # 0.85 length, 0.55 width
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

# Create head sphere (fox snout shape)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.34,
    location=(0, 0.4, 0.85),
    scale=(1.0, 1.2, 1.0)  # Elongated snout
)
head = bpy.context.active_object
head.name = "Kaison_Head"

# ============================================
# PHASE 3: CREATE ARMS
# ============================================

print("Creating arms...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(-0.3, 0.15, 0.7),
    rotation=(math.radians(90), 0, math.radians(40))
)
left_arm = bpy.context.active_object
left_arm.name = "Kaison_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(0.3, 0.15, 0.7),
    rotation=(math.radians(90), 0, math.radians(-40))
)
right_arm = bpy.context.active_object
right_arm.name = "Kaison_Arm_R"

# ============================================
# PHASE 4: CREATE LEGS
# ============================================

print("Creating legs...")

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.5,
    location=(-0.12, 0, 0.25),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "Kaison_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.5,
    location=(0.12, 0, 0.25),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "Kaison_Leg_R"

# ============================================
# PHASE 5: CREATE TWIN TAILS (2 ENERGY TAILS)
# ============================================

print("Creating 2 energy tails (Beast-Kin twin tail system)...")

tails = []

# Twin tail positions
tail_configs = [
    # Left Tail
    {"pos": (-0.15, -0.4, 0.6), "rot": (math.radians(45), math.radians(20), 0), "name": "Tail_L"},
    # Right Tail
    {"pos": (0.15, -0.4, 0.6), "rot": (math.radians(45), math.radians(-20), 0), "name": "Tail_R"},
]

for i, config in enumerate(tail_configs):
    # Create elongated cone for energy tail
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.08,
        radius2=0.02,
        depth=1.2,  # 1.2 units length
        location=config["pos"],
        rotation=config["rot"]
    )
    tail = bpy.context.active_object
    tail.name = f"Kaison_{config['name']}"
    tails.append(tail)

# ============================================
# PHASE 6: CREATE EYES
# ============================================

print("Creating eyes...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.045,
    location=(-0.06, 0.55, 0.88),
    scale=(1.0, 0.9, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "Kaison_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.045,
    location=(0.06, 0.55, 0.88),
    scale=(1.0, 0.9, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "Kaison_Eye_R"

# ============================================
# PHASE 7: JOIN ALL PARTS
# ============================================

print("Joining all parts...")

# Select all parts
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
head.select_set(True)
left_arm.select_set(True)
right_arm.select_set(True)
left_leg.select_set(True)
right_leg.select_set(True)
left_eye.select_set(True)
right_eye.select_set(True)

for tail in tails:
    tail.select_set(True)

# Set body as active
bpy.context.view_layer.objects.active = body

# Join all
bpy.ops.object.join()

# Rename final object
body.name = "Kaison_Blockout"

# ============================================
# PHASE 8: APPLY BASIC MATERIALS (BEAST-KIN)
# ============================================

print("Creating Beast-Kin materials...")

# Body Material (Golden-Orange - Beast-Kin Fox)
body_mat = bpy.data.materials.new(name="MAT_Kaison_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1.0, 0.55, 0.0, 1.0)  # Golden-Orange #FF8C00
bsdf.inputs["Roughness"].default_value = 0.4  # Natural fur
bsdf.inputs["Metallic"].default_value = 0.0
bsdf.inputs["Subsurface"].default_value = 0.2  # Warm glow

# Tail Material (Energy Form - Golden-Orange)
tail_mat = bpy.data.materials.new(name="MAT_Kaison_Tails")
tail_mat.use_nodes = True
bsdf_tail = tail_mat.node_tree.nodes["Principled BSDF"]
bsdf_tail.inputs["Base Color"].default_value = (1.0, 0.8, 0.0, 1.0)  # Gold #FFD700
bsdf_tail.inputs["Metallic"].default_value = 0.3
bsdf_tail.inputs["Roughness"].default_value = 0.1  # Glossy energy
bsdf_tail.inputs["Emission Color"].default_value = (1.0, 0.4, 0.0, 1.0)  # Orange #FF6600
bsdf_tail.inputs["Emission Strength"].default_value = 2.5
bsdf_tail.inputs["Alpha"].default_value = 0.8  # Semi-transparent energy

# Enable transparency
tail_mat.blend_method = 'BLEND'

# Eye Material (Amber - Protective Glow)
eye_mat = bpy.data.materials.new(name="MAT_Kaison_Eyes")
eye_mat.use_nodes = True
bsdf_eye = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_eye.inputs["Base Color"].default_value = (1.0, 0.55, 0.0, 1.0)  # Amber #FF8C00
bsdf_eye.inputs["Emission Color"].default_value = (1.0, 0.55, 0.0, 1.0)
bsdf_eye.inputs["Emission Strength"].default_value = 2.5

# ============================================
# PHASE 9: FINAL SETUP
# ============================================

print("Final setup...")

# Set origin to bottom
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Move origin to ground
body.location.z = 0.475  # Half height

# Add to collection
collection = bpy.data.collections.get("Kaison")
if not collection:
    collection = bpy.data.collections.new("Kaison")
    bpy.context.scene.collection.children.link(collection)

# Move to collection
bpy.context.scene.collection.objects.unlink(body)
collection.objects.link(body)

# ============================================
# PHASE 10: ADD SUBDIVISION & SCULPTING SETUP
# ============================================

print("Adding subdivision and sculpting setup...")

# Ensure body is selected and active
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

# Add Subdivision Surface modifier
if "Subdivision" not in [mod.name for mod in body.modifiers]:
    subdiv_mod = body.modifiers.new(name="Subdivision", type='SUBSURF')
    subdiv_mod.levels = 2  # Viewport
    subdiv_mod.render_levels = 3  # Render
    print("  ✓ Subdivision Surface added (Level 2/3)")

# Apply basic smoothing
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

# Set up for sculpting
bpy.ops.object.shade_smooth()
print("  ✓ Smooth shading enabled")

# Assign body material
if body.data.materials:
    body.data.materials[0] = body_mat
else:
    body.data.materials.append(body_mat)
print("  ✓ Body material assigned")

# Set viewport to Material Preview
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.shading.type = 'MATERIAL'
                space.shading.use_scene_world = False
print("  ✓ Viewport set to Material Preview")

# ============================================
# COMPLETE!
# ============================================

print("\n" + "="*50)
print("✅ KAISON BLOCKOUT CREATED! (BEAST-KIN FORM)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Body (0.85 × 0.55 × 0.95 units) - Beast-Kin Fox")
print("  ✓ Head (elongated snout)")
print("  ✓ 2 Arms (0.4 units each)")
print("  ✓ 2 Legs (0.5 units each)")
print("  ✓ 2 Energy Tails (1.2 units each) - Twin Tail System")
print("  ✓ 2 Eyes (amber)")
print("  ✓ Beast-Kin materials (Golden-Orange)")
print("\nNext steps:")
print("  1. Enter Sculpt Mode (Tab)")
print("  2. Sculpt details (Phase 2)")
print("  3. Follow MODELING_GUIDE.md")
print("\nMaterials created:")
print("  - MAT_Kaison_Body (Golden-Orange - Beast-Kin Fox)")
print("  - MAT_Kaison_Tails (Energy Form - Golden-Orange)")
print("  - MAT_Kaison_Eyes (Amber - Protective Glow)")
print("\n" + "="*50)

# Select the blockout
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
print("\n" + "="*50)
print("QUICK START SCULPTING:")
print("="*50)
print("1. Press Tab to enter Sculpt Mode")
print("2. Use Grab (G) to reshape body")
print("3. Use Smooth (Shift) to smooth areas")
print("4. Press F to adjust brush size")
print("5. Follow Phase 2 in MODELING_GUIDE.md")
print("="*50)
