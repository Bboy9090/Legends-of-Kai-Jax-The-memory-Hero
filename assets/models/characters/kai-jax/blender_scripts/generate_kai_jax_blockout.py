"""
Kai-Jax Blockout Generator - BEAST-KIN FORM
Automatically creates the base blockout for Kai-Jax (Memory Hero - 3-Tail Fusion)

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
# PHASE 1: CREATE BASE BODY (SPHERICAL - STAR-SLIME CHIMERA)
# ============================================

print("Creating Kai-Jax base body (Star-Slime Chimera - Beast-Kin Fusion)...")

# Create spherical body (Kirby-esque but Beast-Kin)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.5,
    location=(0, 0, 0.5),
    scale=(1.0, 1.0, 1.07)  # 1.0 diameter, 1.07 height
)
body = bpy.context.active_object
body.name = "KaiJax_Body"

# ============================================
# PHASE 2: CREATE ARMS & LEGS
# ============================================

print("Creating limbs...")

# Left Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.4,
    location=(-0.4, 0.15, 0.6),
    rotation=(math.radians(90), 0, math.radians(45))
)
left_arm = bpy.context.active_object
left_arm.name = "KaiJax_Arm_L"

# Right Arm
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12,
    depth=0.4,
    location=(0.4, 0.15, 0.6),
    rotation=(math.radians(90), 0, math.radians(-45))
)
right_arm = bpy.context.active_object
right_arm.name = "KaiJax_Arm_R"

# Left Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.15,
    depth=0.5,
    location=(-0.2, 0, 0.25),
    rotation=(0, 0, 0)
)
left_leg = bpy.context.active_object
left_leg.name = "KaiJax_Leg_L"

# Right Leg
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.15,
    depth=0.5,
    location=(0.2, 0, 0.25),
    rotation=(0, 0, 0)
)
right_leg = bpy.context.active_object
right_leg.name = "KaiJax_Leg_R"

# ============================================
# PHASE 3: CREATE QUILLS (HEDGEHOG HERITAGE)
# ============================================

print("Creating quills (hedgehog heritage)...")

quills = []
quill_configs = [
    (-0.2, -0.3, 0.8, math.radians(50), math.radians(30)),
    (-0.15, -0.4, 0.85, math.radians(60), math.radians(40)),
    (-0.1, -0.5, 0.9, math.radians(70), math.radians(45)),
    (0.1, -0.5, 0.9, math.radians(70), math.radians(-45)),
    (0.15, -0.4, 0.85, math.radians(60), math.radians(-40)),
    (0.2, -0.3, 0.8, math.radians(50), math.radians(-30)),
]

for i, (x, y, z, rx, ry) in enumerate(quill_configs):
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.06,
        radius2=0.01,
        depth=0.5,
        location=(x, y, z),
        rotation=(rx, ry, 0)
    )
    bpy.context.active_object.name = f"KaiJax_Quill_{i+1}"
    quills.append(bpy.context.active_object)

# ============================================
# PHASE 4: CREATE THREE MEMORY TAILS
# ============================================

print("Creating 3 memory tails (Gold/Blue/White)...")

tails = []

# Tail 1 - Gold (Velocity/Jaxon)
bpy.ops.mesh.primitive_cone_add(
    radius1=0.1,
    radius2=0.02,
    depth=1.5,
    location=(-0.2, -0.5, 0.4),
    rotation=(math.radians(45), math.radians(20), 0)
)
tail_gold = bpy.context.active_object
tail_gold.name = "KaiJax_Tail_Gold"
tails.append(tail_gold)

# Tail 2 - Blue (Shielding/Kaison)
bpy.ops.mesh.primitive_cone_add(
    radius1=0.12,
    radius2=0.03,
    depth=1.5,
    location=(0, -0.5, 0.4),
    rotation=(math.radians(45), 0, 0)
)
tail_blue = bpy.context.active_object
tail_blue.name = "KaiJax_Tail_Blue"
tails.append(tail_blue)

# Tail 3 - White (Harmony/Hope)
bpy.ops.mesh.primitive_cone_add(
    radius1=0.1,
    radius2=0.02,
    depth=1.5,
    location=(0.2, -0.5, 0.4),
    rotation=(math.radians(45), math.radians(-20), 0)
)
tail_white = bpy.context.active_object
tail_white.name = "KaiJax_Tail_White"
tails.append(tail_white)

# ============================================
# PHASE 5: CREATE EYES
# ============================================

print("Creating eyes (neon-gold with slit pupils)...")

# Left Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.06,
    location=(-0.1, 0.4, 0.85),
    scale=(1.0, 0.6, 1.0)  # Slit pupil shape
)
left_eye = bpy.context.active_object
left_eye.name = "KaiJax_Eye_L"

# Right Eye
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.06,
    location=(0.1, 0.4, 0.85),
    scale=(1.0, 0.6, 1.0)
)
right_eye = bpy.context.active_object
right_eye.name = "KaiJax_Eye_R"

# ============================================
# PHASE 6: JOIN ALL PARTS
# ============================================

print("Joining all parts...")

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
left_arm.select_set(True)
right_arm.select_set(True)
left_leg.select_set(True)
right_leg.select_set(True)
left_eye.select_set(True)
right_eye.select_set(True)

for quill in quills:
    quill.select_set(True)

for tail in tails:
    tail.select_set(True)

bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "KaiJax_Blockout"

# ============================================
# PHASE 7: APPLY BEAST-KIN MATERIALS
# ============================================

print("Creating Beast-Kin materials (Star-Slime Chimera)...")

# Body Material (Obsidian Charcoal with Nebula)
body_mat = bpy.data.materials.new(name="MAT_KaiJax_Body")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.1, 0.1, 0.1, 1.0)  # Obsidian #1A1A1A
bsdf.inputs["Roughness"].default_value = 0.6
bsdf.inputs["Metallic"].default_value = 0.0
bsdf.inputs["Subsurface"].default_value = 0.3  # Nebula glow

# Quill Material (Electric Blue)
quill_mat = bpy.data.materials.new(name="MAT_KaiJax_Quills")
quill_mat.use_nodes = True
bsdf_q = quill_mat.node_tree.nodes["Principled BSDF"]
bsdf_q.inputs["Base Color"].default_value = (0.2, 0.6, 1.0, 1.0)  # Electric Blue #3399FF
bsdf_q.inputs["Metallic"].default_value = 0.8
bsdf_q.inputs["Roughness"].default_value = 0.2
bsdf_q.inputs["Emission Color"].default_value = (0.0, 0.85, 1.0, 1.0)  # Cyan #00D9FF
bsdf_q.inputs["Emission Strength"].default_value = 2.5

# Tail Materials
tail_gold_mat = bpy.data.materials.new(name="MAT_KaiJax_Tail_Gold")
tail_gold_mat.use_nodes = True
bsdf_tg = tail_gold_mat.node_tree.nodes["Principled BSDF"]
bsdf_tg.inputs["Base Color"].default_value = (1.0, 0.84, 0.0, 1.0)  # Gold #FFD700
bsdf_tg.inputs["Emission Color"].default_value = (1.0, 0.84, 0.0, 1.0)
bsdf_tg.inputs["Emission Strength"].default_value = 2.0
tail_gold_mat.blend_method = 'BLEND'
bsdf_tg.inputs["Alpha"].default_value = 0.8

tail_blue_mat = bpy.data.materials.new(name="MAT_KaiJax_Tail_Blue")
tail_blue_mat.use_nodes = True
bsdf_tb = tail_blue_mat.node_tree.nodes["Principled BSDF"]
bsdf_tb.inputs["Base Color"].default_value = (0.0, 0.4, 1.0, 1.0)  # Blue #0066FF
bsdf_tb.inputs["Emission Color"].default_value = (0.0, 0.4, 1.0, 1.0)
bsdf_tb.inputs["Emission Strength"].default_value = 1.5

tail_white_mat = bpy.data.materials.new(name="MAT_KaiJax_Tail_White")
tail_white_mat.use_nodes = True
bsdf_tw = tail_white_mat.node_tree.nodes["Principled BSDF"]
bsdf_tw.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)  # White #FFFFFF
bsdf_tw.inputs["Emission Color"].default_value = (1.0, 1.0, 1.0, 1.0)
bsdf_tw.inputs["Emission Strength"].default_value = 2.0
tail_white_mat.blend_method = 'BLEND'
bsdf_tw.inputs["Alpha"].default_value = 0.6

# Eye Material (Neon Gold)
eye_mat = bpy.data.materials.new(name="MAT_KaiJax_Eyes")
eye_mat.use_nodes = True
bsdf_e = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf_e.inputs["Base Color"].default_value = (1.0, 0.84, 0.0, 1.0)  # Neon Gold #FFD700
bsdf_e.inputs["Emission Color"].default_value = (1.0, 0.84, 0.0, 1.0)
bsdf_e.inputs["Emission Strength"].default_value = 3.5

# ============================================
# PHASE 8: FINAL SETUP
# ============================================

print("Final setup...")

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
body.location.z = 0.5

collection = bpy.data.collections.get("KaiJax")
if not collection:
    collection = bpy.data.collections.new("KaiJax")
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
print("✅ KAI-JAX BLOCKOUT CREATED! (BEAST-KIN FUSION)")
print("="*50)
print("\nWhat was created:")
print("  ✓ Spherical body (1.0 × 1.0 × 1.07 units) - Star-Slime Chimera")
print("  ✓ Arms and legs")
print("  ✓ 6 quills (hedgehog heritage)")
print("  ✓ 3 Memory Tails (Gold/Blue/White)")
print("  ✓ 2 eyes (neon-gold, slit pupils)")
print("  ✓ Beast-Kin materials")
print("\n" + "="*50)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body

print("\n🎉 Ready to sculpt! Switch to Sculpt Mode (Tab) and begin Phase 2!")
