"""
Silver Blockout Generator - BEAST-KIN FORM (CHRONOS SERE)
Automatically creates the base blockout for Silver (Matte-White Lupine - Time Fixer)

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
# PHASE 1: CREATE BASE BODY (MATTE-WHITE LUPINE)
# ============================================

print("Creating Silver base body (Matte-White Lupine - Beast-Kin Time Fixer)...")

# Create body sphere
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.425,
    location=(0, 0, 0.5),
    scale=(1.0, 0.7, 1.0)  # 0.85 length, 0.6 width, 1.0 height
)
body = bpy.context.active_object
body.name = "Silver_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.0, 0.7, 1.0))
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.34,
    location=(0, 0.35, 0.9),
    scale=(1.0, 1.1, 1.0)  # Slightly elongated
)
head = bpy.context.active_object
head.name = "Silver_Head"

# ============================================
# PHASE 3: CREATE ARMS & LEGS
# ============================================

print("Creating limbs...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(-0.3, 0.15, 0.7),
    rotation=(math.radians(90), 0, math.radians(40))
)
left_arm = bpy.context.active_object
left_arm.name = "Silver_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=0.4,
    location=(0.3, 0.15, 0.7),
    rotation=(math.radians(90), 0, math.radians(-40))
)
right_arm = bpy.context.active_object
right_arm.name = "Silver_Arm_R"

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.5,
    location=(-0.12, 0, 0.25),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "Silver_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.5,
    location=(0.12, 0, 0.25),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "Silver_Leg_R"

# ============================================
# PHASE 4: CREATE 6 QUILLS (TEMPORAL ENERGY)
# ============================================

print("Creating 6 quills (temporal energy)...")

quills = []
quill_configs = [
    (-0.2, -0.3, 0.75, math.radians(50), math.radians(30)),
    (-0.15, -0.4, 0.8, math.radians(60), math.radians(40)),
    (-0.1, -0.5, 0.85, math.radians(70), math.radians(45)),
    (0.1, -0.5, 0.85, math.radians(70), math.radians(-45)),
    (0.15, -0.4, 0.8, math.radians(60), math.radians(-40)),
    (0.2, -0.3, 0.75, math.radians(50), math.radians(-30)),
]

for i, (x, y, z, rx, ry) in enumerate(quill_configs):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.05,
        radius2=0.01,
        depth=0.6,
        location=(x, y, z),
        rotation=(rx, ry, 0)
    )
    bpy.context.active_object.name = f"Silver_Quill_{i+1}"
    quills.append(bpy.context.active_object)

# ============================================
# PHASE 5: CREATE EYES
# ============================================

print("Creating eyes (cyan future vision)...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.045,
    location=(-0.08, 0.5, 0.92),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "Silver_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.045,
    location=(0.08, 0.5, 0.92),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "Silver_Eye_R"

# ============================================
# PHASE 6: JOIN ALL PARTS
# ============================================

print("Joining all parts...")

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

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "Silver_Blockout"

# ============================================
# PHASE 7: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Matte-White Lupine)...")

# Body Material (Platinum Silver - Matte)
body_mat = bpy.data.materials.new(name="MAT_Silver_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.75, 0.75, 0.75, 1.0)  # Platinum #C0C0C0
bsdf.inputs["Roughness"].default_value = 0.4  # Matte finish
bsdf.inputs["Metallic"].default_value = 0.3  # Subtle metallic

# Quill Material (Platinum with Cyan Energy)
quill_mat = bpy.data.materials.new(name="MAT_Silver_Quills")
quill_mat.use_nodes = True
bsdf_q = quill_mat.node_tree.nodes["Principled BSDF"]
bsdf_q.inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1.0)  # Platinum #E5E5E5
bsdf_q.inputs["Metallic"].default_value = 0.7
bsdf_q.inputs["Roughness"].default_value = 0.2
bsdf_q.inputs["Emission Color"].default_value = (0.0, 1.0, 1.0, 1.0)  # Cyan #00FFFF
bsdf_q.inputs["Emission Strength"].default_value = 2.5

# Eye Material (Cyan Future Vision)
eye_mat = bpy.data.materials.new(name="MAT_Silver_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (0.0, 1.0, 1.0, 1.0)  # Cyan #00FFFF
bsdf_e.inputs["Emission Color"].default_value = (0.0, 1.0, 1.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 3.0

# ============================================
# PHASE 8: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 0.5

collection = bpy.data.collections.get("Silver")
if not collection:
    collection = bpy.data.collections.new("Silver")
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
print("✅ SILVER BLOCKOUT CREATED! (BEAST-KIN MATTE-WHITE LUPINE)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Body (0.85 × 0.6 × 1.0 units) - Matte-White Lupine")
print("  ✓ Head")
print("  ✓ Arms and legs")
print("  ✓ 6 quills (temporal energy)")
print("  ✓ 2 eyes (cyan future vision)")
print("  ✓ Beast-Kin materials (Platinum Silver)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
