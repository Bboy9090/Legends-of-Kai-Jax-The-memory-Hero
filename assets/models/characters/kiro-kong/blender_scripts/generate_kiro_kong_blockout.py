"""
Kiro Kong Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Kiro Kong (Augmented Ape-Kin - Primal Breaker)

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
# PHASE 1: CREATE BASE BODY (MASSIVE GORILLA)
# ============================================

print("Creating Kiro Kong base body (Augmented Ape-Kin - Beast-Kin Primal Breaker)...")

# Create massive gorilla body (hunched posture)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.65,
    location=(0, 0, 3.25),
    scale=(1.5, 1.2, 1.0)  # Barrel-chested, hunched
)
body = bpy.context.active_object
body.name = "KiroKong_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.5, 1.2, 1.0))  # 2.5 width, 2.0 length, 6.5 height (hunched)
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.4,
    location=(0, 0.5, 5.0),
    scale=(1.2, 1.0, 1.0)  # Gorilla head
)
head = bpy.context.active_object
head.name = "KiroKong_Head"

# ============================================
# PHASE 3: CREATE ARMS (MASSIVE - 4.0 UNITS)
# ============================================

print("Creating massive arms...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.3,
    depth=2.0,
    location=(-1.0, 0.3, 4.0),
    rotation=(math.radians(90), 0, math.radians(20))
)
left_arm = bpy.context.active_object
left_arm.name = "KiroKong_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.3,
    depth=2.0,
    location=(1.0, 0.3, 4.0),
    rotation=(math.radians(90), 0, math.radians(-20))
)
right_arm = bpy.context.active_object
right_arm.name = "KiroKong_Arm_R"

# ============================================
# PHASE 4: CREATE LEGS (3.0 UNITS)
# ============================================

print("Creating legs...")

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.35,
    depth=1.5,
    location=(-0.4, 0, 2.5),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "KiroKong_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.35,
    depth=1.5,
    location=(0.4, 0, 2.5),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "KiroKong_Leg_R"

# ============================================
# PHASE 5: CREATE STONE ARMOR PLATES
# ============================================

print("Creating stone armor plates...")

# Chest Plate
bpy.ops.mesh.primitive_cube_add(
    size=0.8,
    location=(0, 0.4, 4.2),
    scale=(1.0, 0.3, 1.2)
)
chest_plate = bpy.context.active_object
chest_plate.name = "KiroKong_ChestPlate"

# Shoulder Plates
bpy.ops.mesh.primitive_cube_add(
    size=0.4,
    location=(-0.8, 0.5, 4.5),
    scale=(1.0, 0.5, 1.0)
)
shoulder_l = bpy.context.active_object
shoulder_l.name = "KiroKong_Shoulder_L"

bpy.ops.mesh.primitive_cube_add(
    size=0.4,
    location=(0.8, 0.5, 4.5),
    scale=(1.0, 0.5, 1.0)
)
shoulder_r = bpy.context.active_object
shoulder_r.name = "KiroKong_Shoulder_R"

# ============================================
# PHASE 6: CREATE EYES
# ============================================

print("Creating eyes (amber glow)...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.06,
    location=(-0.1, 0.7, 5.1),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "KiroKong_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.06,
    location=(0.1, 0.7, 5.1),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "KiroKong_Eye_R"

# ============================================
# PHASE 7: JOIN ALL PARTS
# ============================================

print("Joining all parts...")

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
head.select_set(True)
left_arm.select_set(True)
right_arm.select_set(True)
left_leg.select_set(True)
right_leg.select_set(True)
chest_plate.select_set(True)
shoulder_l.select_set(True)
shoulder_r.select_set(True)
left_eye.select_set(True)
right_eye.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "KiroKong_Blockout"

# ============================================
# PHASE 8: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Augmented Ape-Kin)...")

# Body Material (Dark Brown Gorilla Fur)
body_mat = bpy.data.materials.new(name="MAT_KiroKong_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.24, 0.16, 0.09, 1.0)  # Dark Brown #3d2817
bsdf.inputs["Roughness"].default_value = 0.7  # Fur texture
bsdf.inputs["Metallic"].default_value = 0.0

# Eye Material (Amber Glow)
eye_mat = bpy.data.materials.new(name="MAT_KiroKong_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (1.0, 0.67, 0.0, 1.0)  # Amber #ffaa00
bsdf_e.inputs["Emission Color"].default_value = (1.0, 0.67, 0.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 2.5

# ============================================
# PHASE 9: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 3.25

collection = bpy.data.collections.get("KiroKong")
if not collection:
    collection = bpy.data.collections.new("KiroKong")
    bpy.context.scene.collection.children.link(collection)

bpy.context.scene.collection.objects.unlink(body)
collection.objects.link(body)

# Add Subdivision
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

subdiv_mod = body.modifiers.new(name="Subdivision", type='SUBSURF')
subdiv_mod.levels = 2
subdiv_mod.render_levels = 3

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

bpy.ops.object.shade_smooth()
body.data.materials.append(body_mat)

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.shading.type = 'MATERIAL'
                space.shading.use_scene_world = False

print("\n" + "="*50)
print("✅ KIRO KONG BLOCKOUT CREATED! (BEAST-KIN AUGMENTED APE-KIN)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Massive body (2.5 × 2.0 × 6.5 units hunched) - Augmented Ape-Kin")
print("  ✓ Gorilla head")
print("  ✓ Massive arms (4.0 units each)")
print("  ✓ Legs (3.0 units)")
print("  ✓ Stone armor plates (chest, shoulders)")
print("  ✓ Eyes (amber glow)")
print("  ✓ Beast-Kin materials (Dark Brown Fur)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
