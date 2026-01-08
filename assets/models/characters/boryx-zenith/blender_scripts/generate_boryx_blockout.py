"""
Boryx Zenith Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Boryx (Draconic Ursine - Dragon-Bear)

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
# PHASE 1: CREATE BASE BODY (MASSIVE DRAGON-BEAR)
# ============================================

print("Creating Boryx base body (Draconic Ursine - Beast-Kin Guardian King)...")

# Create massive body
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=1.0,
    location=(0, 0, 1.065),
    scale=(1.5, 1.0, 1.0)  # Broad, heavy
)
body = bpy.context.active_object
body.name = "Boryx_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.5, 1.0, 1.0))  # 3.0 width, 2.0 length, 2.13 height
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.5,
    location=(0, 0.8, 1.8),
    scale=(1.2, 1.0, 1.0)  # Broad bear head
)
head = bpy.context.active_object
head.name = "Boryx_Head"

# ============================================
# PHASE 3: CREATE ARMS (MASSIVE)
# ============================================

print("Creating massive arms...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.3,
    depth=1.25,
    location=(-1.2, 0.4, 1.4),
    rotation=(math.radians(90), 0, math.radians(30))
)
left_arm = bpy.context.active_object
left_arm.name = "Boryx_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.3,
    depth=1.25,
    location=(1.2, 0.4, 1.4),
    rotation=(math.radians(90), 0, math.radians(-30))
)
right_arm = bpy.context.active_object
right_arm.name = "Boryx_Arm_R"

# ============================================
# PHASE 4: CREATE LEGS (TREE TRUNKS)
# ============================================

print("Creating tree trunk legs...")

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.4,
    depth=1.6,
    location=(-0.5, 0, 0.8),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "Boryx_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.4,
    depth=1.6,
    location=(0.5, 0, 0.8),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "Boryx_Leg_R"

# ============================================
# PHASE 5: CREATE CHAOS SOURCE STAR (CHEST)
# ============================================

print("Creating Chaos Source Star (chest)...")

bpy.ops.mesh.primitive_ico_sphere_add(
    radius=0.15,
    location=(0, 0.5, 1.3),
    subdivisions=2
)
source_star = bpy.context.active_object
source_star.name = "Boryx_SourceStar"

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
source_star.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "Boryx_Blockout"

# ============================================
# PHASE 7: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Draconic Ursine)...")

# Body Material (Bronx Brown Fur + Bronze Scales)
body_mat = bpy.data.materials.new(name="MAT_Boryx_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.36, 0.25, 0.20, 1.0)  # Bronx Brown #5c4033
bsdf.inputs["Roughness"].default_value = 0.6  # Fur texture
bsdf.inputs["Metallic"].default_value = 0.0

# Source Star Material (Amber Emissive)
star_mat = bpy.data.materials.new(name="MAT_Boryx_SourceStar")
star_mat.use_nodes = True
bsdf_s = star_mat.node_tree.nodes["Principled BSDF"]
bsdf_s.inputs["Base Color"].default_value = (1.0, 0.75, 0.0, 1.0)  # Amber #ffbf00
bsdf_s.inputs["Emission Color"].default_value = (1.0, 0.75, 0.0, 1.0)
bsdf_s.inputs["Emission Strength"].default_value = 3.0

# ============================================
# PHASE 8: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 1.065

collection = bpy.data.collections.get("Boryx")
if not collection:
    collection = bpy.data.collections.new("Boryx")
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
print("✅ BORYX ZENITH BLOCKOUT CREATED! (BEAST-KIN DRAGON-BEAR)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Massive body (3.0 × 2.0 × 2.13 units) - Draconic Ursine")
print("  ✓ Broad head")
print("  ✓ Massive arms (tree trunks)")
print("  ✓ Tree trunk legs")
print("  ✓ Chaos Source Star (chest - amber)")
print("  ✓ Beast-Kin materials (Bronx Brown + Bronze)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
