"""
Sentinel Vox Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Sentinel Vox (Saiyan-Kitsune - Buff Fox-Alien)

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
# PHASE 1: CREATE BASE BODY (MUSCULAR FOX)
# ============================================

print("Creating Sentinel Vox base body (Saiyan-Kitsune - Beast-Kin Star-Force Pilot)...")

# Create muscular body (1.2x normal proportions)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.42,
    location=(0, 0, 0.84),
    scale=(1.2, 1.0, 1.0)  # Muscular upper body
)
body = bpy.context.active_object
body.name = "SentinelVox_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.2, 1.0, 1.0))  # Muscular build
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.25,
    location=(0, 0.4, 1.45),
    scale=(1.0, 1.1, 1.0)  # Fox snout
)
head = bpy.context.active_object
head.name = "SentinelVox_Head"

# ============================================
# PHASE 3: CREATE ARMS (MUSCULAR)
# ============================================

print("Creating muscular arms...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.15,
    depth=1.1,
    location=(-0.5, 0.2, 1.3),
    rotation=(math.radians(90), 0, math.radians(30))
)
left_arm = bpy.context.active_object
left_arm.name = "SentinelVox_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.15,
    depth=1.1,
    location=(0.5, 0.2, 1.3),
    rotation=(math.radians(90), 0, math.radians(-30))
)
right_arm = bpy.context.active_object
right_arm.name = "SentinelVox_Arm_R"

# ============================================
# PHASE 4: CREATE LEGS
# ============================================

print("Creating legs...")

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.18,
    depth=1.4,
    location=(-0.2, 0, 0.7),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "SentinelVox_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.18,
    depth=1.4,
    location=(0.2, 0, 0.7),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "SentinelVox_Leg_R"

# ============================================
# PHASE 5: CREATE TAIL-BLADES (2-9 CONFIGURATION)
# ============================================

print("Creating tail-blades (mechanical, 2-9 configuration)...")

tail_blades = []

# Start with 2 tail-blades (can extend to 9)
for i in range(2):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.1,
        radius2=0.02,
        depth=1.5,
        location=(0, -0.3 - i*0.1, 0.8),
        rotation=(math.radians(45), 0, 0)
    )
    bpy.context.active_object.name = f"SentinelVox_TailBlade_{i+1}"
    tail_blades.append(bpy.context.active_object)

# ============================================
# PHASE 6: CREATE EYES
# ============================================

print("Creating eyes...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(-0.06, 0.5, 1.5),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "SentinelVox_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.04,
    location=(0.06, 0.5, 1.5),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "SentinelVox_Eye_R"

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
left_eye.select_set(True)
right_eye.select_set(True)

for blade in tail_blades:
    blade.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "SentinelVox_Blockout"

# ============================================
# PHASE 8: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Saiyan-Kitsune)...")

# Body Material (Orange/White Fox Fur)
body_mat = bpy.data.materials.new(name="MAT_SentinelVox_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1.0, 0.4, 0.0, 1.0)  # Orange #ff6600
bsdf.inputs["Roughness"].default_value = 0.5  # Fur texture
bsdf.inputs["Metallic"].default_value = 0.0

# Eye Material
eye_mat = bpy.data.materials.new(name="MAT_SentinelVox_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (1.0, 0.67, 0.0, 1.0)  # Orange tint
bsdf_e.inputs["Emission Color"].default_value = (1.0, 0.67, 0.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 2.0

# ============================================
# PHASE 9: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 0.84

collection = bpy.data.collections.get("SentinelVox")
if not collection:
    collection = bpy.data.collections.new("SentinelVox")
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
print("✅ SENTINEL VOX BLOCKOUT CREATED! (BEAST-KIN SAIYAN-KITSUNE)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Muscular body (1.2x proportions) - Saiyan-Kitsune")
print("  ✓ Fox head")
print("  ✓ Muscular arms")
print("  ✓ Legs")
print("  ✓ 2 Tail-blades (can extend to 9)")
print("  ✓ Eyes")
print("  ✓ Beast-Kin materials (Orange/White Fox)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
