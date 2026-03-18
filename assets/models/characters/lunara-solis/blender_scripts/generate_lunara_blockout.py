"""
Lunara Solis Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Lunara (9-Tail Oracle - Celestial Kitsune)

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
# PHASE 1: CREATE BASE BODY (TALL ELEGANT KITSUNE)
# ============================================

print("Creating Lunara base body (Celestial Kitsune - Beast-Kin Oracle)...")

# Create tall elegant body
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.25,
    location=(0, 0, 0.885),
    scale=(1.0, 0.75, 2.0)  # Tall, elegant
)
body = bpy.context.active_object
body.name = "Lunara_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.0, 0.5, 1.0))  # 1.5 length, 0.5 width, 1.77 height
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.2,
    location=(0, 0.3, 1.6),
    scale=(1.0, 1.0, 1.0)
)
head = bpy.context.active_object
head.name = "Lunara_Head"

# ============================================
# PHASE 3: CREATE ARMS & LEGS (DIGITIGRADE)
# ============================================

print("Creating limbs (digitigrade stance)...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.08,
    depth=1.0,
    location=(-0.25, 0.2, 1.3),
    rotation=(math.radians(90), 0, math.radians(30))
)
left_arm = bpy.context.active_object
left_arm.name = "Lunara_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.08,
    depth=1.0,
    location=(0.25, 0.2, 1.3),
    rotation=(math.radians(90), 0, math.radians(-30))
)
right_arm = bpy.context.active_object
right_arm.name = "Lunara_Arm_R"

# Left Leg (Digitigrade)
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=1.4,
    location=(-0.15, 0, 0.7),
    rotation=(math.radians(15), 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "Lunara_Leg_L"

# Right Leg (Digitigrade)
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=1.4,
    location=(0.15, 0, 0.7),
    rotation=(math.radians(15), 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "Lunara_Leg_R"

# ============================================
# PHASE 4: CREATE 9 TAILS (5 GOLD + 4 SILVER)
# ============================================

print("Creating 9 tails (5 gold solar + 4 silver lunar)...")

tails = []

# Gold Solar Tails (5)
gold_tail_configs = [
    (-0.3, -0.4, 0.8, math.radians(40), math.radians(25)),
    (-0.15, -0.5, 0.7, math.radians(45), math.radians(15)),
    (0, -0.6, 0.6, math.radians(50), 0),
    (0.15, -0.5, 0.7, math.radians(45), math.radians(-15)),
    (0.3, -0.4, 0.8, math.radians(40), math.radians(-25)),
]

for i, (x, y, z, rx, ry) in enumerate(gold_tail_configs):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.12,
        radius2=0.02,
        depth=5.8,  # 11.6 units total (2x height)
        location=(x, y, z),
        rotation=(rx, ry, 0)
    )
    bpy.context.active_object.name = f"Lunara_Tail_Gold_{i+1}"
    tails.append(bpy.context.active_object)

# Silver Lunar Tails (4)
silver_tail_configs = [
    (-0.22, -0.45, 0.75, math.radians(42), math.radians(20)),
    (-0.08, -0.55, 0.65, math.radians(47), math.radians(8)),
    (0.08, -0.55, 0.65, math.radians(47), math.radians(-8)),
    (0.22, -0.45, 0.75, math.radians(42), math.radians(-20)),
]

for i, (x, y, z, rx, ry) in enumerate(silver_tail_configs):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.1,
        radius2=0.02,
        depth=5.8,
        location=(x, y, z),
        rotation=(rx, ry, 0)
    )
    bpy.context.active_object.name = f"Lunara_Tail_Silver_{i+1}"
    tails.append(bpy.context.active_object)

# ============================================
# PHASE 5: CREATE EYES (DUALITY)
# ============================================

print("Creating eyes (duality - left gold, right silver)...")

# Left Eye (Gold - Thermal)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(-0.06, 0.4, 1.65),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "Lunara_Eye_L_Gold"

# Right Eye (Silver-Blue - Probability)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(0.06, 0.4, 1.65),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "Lunara_Eye_R_Silver"

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

for tail in tails:
    tail.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "Lunara_Blockout"

# ============================================
# PHASE 7: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Celestial Kitsune)...")

# Body Material (Liquid Starlight - Iridescent)
body_mat = bpy.data.materials.new(name="MAT_Lunara_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1.0, 0.84, 0.0, 1.0)  # Gold #FFD700
bsdf.inputs["Roughness"].default_value = 0.3
bsdf.inputs["Metallic"].default_value = 0.2
bsdf.inputs["Subsurface"].default_value = 0.4  # Starlight glow

# Eye Materials
eye_gold_mat = bpy.data.materials.new(name="MAT_Lunara_Eye_Gold")
eye_gold_mat.use_nodes = True
bsdf_eg = eye_gold_mat.node_tree.nodes["Principled BSDF"]
bsdf_eg.inputs["Base Color"].default_value = (1.0, 0.67, 0.0, 1.0)  # Gold #FFAA00
bsdf_eg.inputs["Emission Color"].default_value = (1.0, 0.67, 0.0, 1.0)
bsdf_eg.inputs["Emission Strength"].default_value = 2.5

eye_silver_mat = bpy.data.materials.new(name="MAT_Lunara_Eye_Silver")
eye_silver_mat.use_nodes = True
bsdf_es = eye_silver_mat.node_tree.nodes["Principled BSDF"]
bsdf_es.inputs["Base Color"].default_value = (0.67, 0.87, 1.0, 1.0)  # Silver-Blue #AADDFF
bsdf_es.inputs["Emission Color"].default_value = (0.67, 0.87, 1.0, 1.0)
bsdf_es.inputs["Emission Strength"].default_value = 2.5

# ============================================
# PHASE 8: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 0.885

collection = bpy.data.collections.get("Lunara")
if not collection:
    collection = bpy.data.collections.new("Lunara")
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
print("✅ LUNARA SOLIS BLOCKOUT CREATED! (BEAST-KIN 9-TAIL ORACLE)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Tall elegant body (1.5 × 0.5 × 1.77 units) - Celestial Kitsune")
print("  ✓ Head")
print("  ✓ Digitigrade legs")
print("  ✓ 9 Tails (5 gold solar + 4 silver lunar)")
print("  ✓ Duality eyes (left gold, right silver)")
print("  ✓ Beast-Kin materials (Liquid Starlight)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
