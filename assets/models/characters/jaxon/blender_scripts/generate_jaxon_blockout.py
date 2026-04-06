"""
Jaxon Blockout Generator
Automatically creates the base blockout for Jaxon character

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
# PHASE 1: CREATE BASE BODY
# ============================================

print("Creating Jaxon base body...")

# Create body sphere
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.4,
    location=(0, 0, 0.45),
    scale=(1.0, 1.0, 1.125)  # Slightly taller (0.9 units height)
)
body = bpy.context.active_object
body.name = "Jaxon_Body"

# Enter Edit Mode to refine
bpy.ops.object.mode_set(mode='EDIT')

# Scale body to correct dimensions
bpy.ops.transform.resize(value=(1.0, 0.75, 1.0))  # 0.8 length, 0.6 width

# Add Subdivision for smoother shape
bpy.ops.object.mode_set(mode='OBJECT')
body.modifiers.new(name="Subdivision", type='SUBSURF')
body.modifiers["Subdivision"].levels = 2

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

# Create head sphere (0.8x body width = 0.64 units)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.32,
    location=(0, 0.35, 0.8),
    scale=(1.0, 1.0, 1.0)
)
head = bpy.context.active_object
head.name = "Jaxon_Head"

# ============================================
# PHASE 3: CREATE ARMS
# ============================================

print("Creating arms...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(-0.35, 0.2, 0.65),
    rotation=(math.radians(90), 0, math.radians(45))
)
left_arm = bpy.context.active_object
left_arm.name = "Jaxon_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(0.35, 0.2, 0.65),
    rotation=(math.radians(90), 0, math.radians(-45))
)
right_arm = bpy.context.active_object
right_arm.name = "Jaxon_Arm_R"

# ============================================
# PHASE 4: CREATE LEGS
# ============================================

print("Creating legs...")

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.125,
    depth=0.5,
    location=(-0.15, 0, 0.25),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "Jaxon_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.125,
    depth=0.5,
    location=(0.15, 0, 0.25),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "Jaxon_Leg_R"

# ============================================
# PHASE 5: CREATE QUILLS (7 total)
# ============================================

print("Creating 7 quills...")

quills = []

# Quill positions and angles
quill_configs = [
    # Left side quills (3)
    {"pos": (-0.25, -0.3, 0.7), "rot": (math.radians(45), math.radians(30), 0), "name": "Quill_L1"},
    {"pos": (-0.2, -0.4, 0.75), "rot": (math.radians(50), math.radians(40), 0), "name": "Quill_L2"},
    {"pos": (-0.15, -0.5, 0.8), "rot": (math.radians(60), math.radians(45), 0), "name": "Quill_L3"},
    
    # Center quill (1)
    {"pos": (0, -0.5, 0.85), "rot": (math.radians(90), 0, 0), "name": "Quill_Center"},
    
    # Right side quills (3)
    {"pos": (0.15, -0.5, 0.8), "rot": (math.radians(60), math.radians(-45), 0), "name": "Quill_R3"},
    {"pos": (0.2, -0.4, 0.75), "rot": (math.radians(50), math.radians(-40), 0), "name": "Quill_R2"},
    {"pos": (0.25, -0.3, 0.7), "rot": (math.radians(45), math.radians(-30), 0), "name": "Quill_R1"},
]

for i, config in enumerate(quill_configs):
    # Create cone for quill
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.05,
        radius2=0.01,
        depth=0.5,
        location=config["pos"],
        rotation=config["rot"]
    )
    quill = bpy.context.active_object
    quill.name = f"Jaxon_{config['name']}"
    quills.append(quill)

# ============================================
# PHASE 6: CREATE EYES
# ============================================

print("Creating eyes...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(-0.08, 0.5, 0.82),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "Jaxon_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(0.08, 0.5, 0.82),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "Jaxon_Eye_R"

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

for quill in quills:
    quill.select_set(True)

# Set body as active
bpy.context.view_layer.objects.active = body

# Join all
bpy.ops.object.join()

# Rename final object
body.name = "Jaxon_Blockout"

# ============================================
# PHASE 8: APPLY BASIC MATERIALS
# ============================================

print("Creating materials...")

# Body Material (Electric Blue)
body_mat = bpy.data.materials.new(name="MAT_Jaxon_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.0, 0.4, 1.0, 1.0)  # Electric Blue #0066FF
bsdf.inputs["Roughness"].default_value = 0.3
bsdf.inputs["Metallic"].default_value = 0.0

# Quill Material (Electric Blue with Emission)
quill_mat = bpy.data.materials.new(name="MAT_Jaxon_Quills")
quill_mat.use_nodes = True
bsdf_quill = quill_mat.node_tree.nodes["Principled BSDF"]
bsdf_quill.inputs["Base Color"].default_value = (0.2, 0.6, 1.0, 1.0)  # #3399FF
bsdf_quill.inputs["Metallic"].default_value = 0.8
bsdf_quill.inputs["Roughness"].default_value = 0.2
bsdf_quill.inputs["Emission Color"].default_value = (0.0, 0.85, 1.0, 1.0)  # Cyan #00D9FF
bsdf_quill.inputs["Emission Strength"].default_value = 2.5

# Eye Material (Bright Green Emission)
eye_mat = bpy.data.materials.new(name="MAT_Jaxon_Eyes")
eye_mat.use_nodes = True
bsdf_eye = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_eye.inputs["Base Color"].default_value = (0.0, 1.0, 0.0, 1.0)  # Bright Green #00FF00
bsdf_eye.inputs["Emission Color"].default_value = (0.0, 1.0, 0.0, 1.0)
bsdf_eye.inputs["Emission Strength"].default_value = 3.0

# Assign materials (you'll need to select faces and assign manually)
# This is a starting point - materials are created and ready

# ============================================
# PHASE 9: FINAL SETUP
# ============================================

print("Final setup...")

# Set origin to bottom
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Move origin to ground
body.location.z = 0.45  # Half height

# Add to collection
collection = bpy.data.collections.get("Jaxon")
if not collection:
    collection = bpy.data.collections.new("Jaxon")
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
bpy.ops.mesh.faces_select_all(action='SELECT')
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
print("✅ JAXON BLOCKOUT CREATED!")
print("="*50)
print("\nWhat was created:")
print("  ✓ Body (0.8 × 0.6 × 0.9 units)")
print("  ✓ Head (0.8x body width)")
print("  ✓ 2 Arms (0.4 units each)")
print("  ✓ 2 Legs (0.5 units each)")
print("  ✓ 7 Quills (positioned and angled)")
print("  ✓ 2 Eyes (bright green)")
print("  ✓ Basic materials (Electric Blue)")
print("\nNext steps:")
print("  1. Enter Edit Mode to refine shape")
print("  2. Sculpt details (Phase 2)")
print("  3. Follow MODELING_GUIDE.md")
print("\nMaterials created:")
print("  - MAT_Jaxon_Body (Electric Blue)")
print("  - MAT_Jaxon_Quills (Metallic with Emission)")
print("  - MAT_Jaxon_Eyes (Bright Green Emission)")
print("\n" + "="*50)

# Select the blockout
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
print("\n" + "="*50)
print("QUICK START SCULPTING:")
print("="*50)
print("1. Press Tab to enter Edit Mode")
print("2. Or: Mode menu → Sculpt Mode")
print("3. Use Grab (G) to reshape body")
print("4. Use Smooth (Shift) to smooth areas")
print("5. Press F to adjust brush size")
print("6. Follow Phase 2 in MODELING_GUIDE.md")
print("="*50)