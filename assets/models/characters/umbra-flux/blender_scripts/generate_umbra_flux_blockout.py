"""
Umbra-Flux Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Umbra-Flux (Celestial Lupine - Star-Wolf/Lynx)

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
# PHASE 1: CREATE BASE BODY (STREAMLINED LUPINE)
# ============================================

print("Creating Umbra-Flux base body (Celestial Lupine - Beast-Kin Velocity Wraith)...")

# Create streamlined body
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.525,
    location=(0, 0, 0.64),
    scale=(1.75, 1.0, 0.8)  # Horizontal stance, streamlined
)
body = bpy.context.active_object
body.name = "UmbraFlux_Body"

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.75, 1.0, 0.8))  # 3.5 length, 1.05 width, 1.28 height
bpy.ops.object.mode_set(mode='OBJECT')

# ============================================
# PHASE 2: CREATE HEAD
# ============================================

print("Creating head...")

bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.3,
    location=(1.2, 0.3, 0.9),
    scale=(1.2, 0.9, 1.0)  # Wolf snout
)
head = bpy.context.active_object
head.name = "UmbraFlux_Head"

# ============================================
# PHASE 3: CREATE LEGS
# ============================================

print("Creating legs...")

# Front Left
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=1.0,
    location=(0.8, 0.2, 0.3),
    rotation=(math.radians(75), 0, 0)
)
leg_fl = bpy.context.active_object
leg_fl.name = "UmbraFlux_Leg_FL"

# Front Right
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=1.0,
    location=(0.8, -0.2, 0.3),
    rotation=(math.radians(75), 0, 0)
)
leg_fr = bpy.context.active_object
leg_fr.name = "UmbraFlux_Leg_FR"

# Back Left
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=1.0,
    location=(-0.8, 0.2, 0.3),
    rotation=(math.radians(75), 0, 0)
)
leg_bl = bpy.context.active_object
leg_bl.name = "UmbraFlux_Leg_BL"

# Back Right
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=1.0,
    location=(-0.8, -0.2, 0.3),
    rotation=(math.radians(75), 0, 0)
)
leg_br = bpy.context.active_object
leg_br.name = "UmbraFlux_Leg_BR"

# ============================================
# PHASE 4: CREATE 5 ELEMENTAL TAILS
# ============================================

print("Creating 5 elemental tails...")

tails = []
tail_configs = [
    (-1.0, -0.3, 0.7, math.radians(30), math.radians(20), "Blue"),
    (-1.0, -0.1, 0.7, math.radians(30), math.radians(10), "Red"),
    (-1.0, 0.1, 0.7, math.radians(30), 0, "Cyan"),
    (-1.0, 0.1, 0.7, math.radians(30), math.radians(-10), "Violet"),
    (-1.0, 0.3, 0.7, math.radians(30), math.radians(-20), "Gold"),
]

for i, (x, y, z, rx, ry, color) in enumerate(tail_configs):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.1,
        radius2=0.02,
        depth=3.8,  # 7.6 units total
        location=(x, y, z),
        rotation=(rx, ry, 0)
    )
    bpy.context.active_object.name = f"UmbraFlux_Tail_{color}_{i+1}"
    tails.append(bpy.context.active_object)

# ============================================
# PHASE 5: CREATE QUILL-BLADES (BACK)
# ============================================

print("Creating quill-blades...")

quills = []
for i in range(5):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.08,
        radius2=0.01,
        depth=0.4,
        location=(0, 0, 1.0 + i*0.1),
        rotation=(math.radians(90), 0, 0)
    )
    bpy.context.active_object.name = f"UmbraFlux_Quill_{i+1}"
    quills.append(bpy.context.active_object)

# ============================================
# PHASE 6: CREATE EYES (DUAL-PUPIL)
# ============================================

print("Creating eyes (dual-pupil)...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.05,
    location=(1.4, 0.2, 0.95),
    scale=(1.0, 0.8, 1.0)
)
left_eye = bpy.context.active_object
left_eye.name = "UmbraFlux_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.05,
    location=(1.4, -0.2, 0.95),
    scale=(1.0, 0.8, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "UmbraFlux_Eye_R"

# ============================================
# PHASE 7: JOIN ALL PARTS
# ============================================

print("Joining all parts...")

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
head.select_set(True)
leg_fl.select_set(True)
leg_fr.select_set(True)
leg_bl.select_set(True)
leg_br.select_set(True)
left_eye.select_set(True)
right_eye.select_set(True)

for tail in tails:
    tail.select_set(True)

for quill in quills:
    quill.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "UmbraFlux_Blockout"

# ============================================
# PHASE 8: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Matte-White Celestial Lupine)...")

# Body Material (Matte-White Metallic)
body_mat = bpy.data.materials.new(name="MAT_UmbraFlux_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.94, 0.94, 0.94, 1.0)  # Matte-White #f0f0f0
bsdf.inputs["Roughness"].default_value = 0.3  # Matte finish
bsdf.inputs["Metallic"].default_value = 0.4  # Metallic sheen

# Eye Material (Chromatic Aberration Effect)
eye_mat = bpy.data.materials.new(name="MAT_UmbraFlux_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (0.5, 0.5, 1.0, 1.0)  # Blue base
bsdf_e.inputs["Emission Color"].default_value = (0.5, 0.5, 1.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 2.5

# ============================================
# PHASE 9: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 0.64

collection = bpy.data.collections.get("UmbraFlux")
if not collection:
    collection = bpy.data.collections.new("UmbraFlux")
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
print("✅ UMBRA-FLUX BLOCKOUT CREATED! (BEAST-KIN CELESTIAL LUPINE)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Streamlined body (3.5 × 1.05 × 1.28 units) - Celestial Lupine")
print("  ✓ Wolf head")
print("  ✓ 4 legs (quadrupedal)")
print("  ✓ 5 elemental tails (Blue/Red/Cyan/Violet/Gold)")
print("  ✓ 5 quill-blades (back)")
print("  ✓ Dual-pupil eyes")
print("  ✓ Beast-Kin materials (Matte-White Metallic)")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
