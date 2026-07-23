import bpy
import numpy as np
import json
import math
import mathutils

MODEL = "/home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/public/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb"
CHAINS_JSON = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/rig_chains.json"
KMEANS_JSON = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/tail_kmeans.json"
OUT_DIR = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/renders"
OUT_GLB = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/kaijax_tail_rig_prototype_v2.glb"

with open(CHAINS_JSON) as f:
    chains_data = json.load(f)
with open(KMEANS_JSON) as f:
    kdata = json.load(f)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=MODEL)

obj = bpy.data.objects.get("char1")
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
me = obj.data
mw = obj.matrix_world
arm_inv = arm.matrix_world.inverted()

hips_pos = np.array(kdata["hips"])
idxs = np.array(kdata["vertex_indices"])
labels = np.array(kdata["labels"])
TORSO_LABEL = 7
tail_labels = [k for k in range(10) if k != TORSO_LABEL]

# reconstruct cluster->chain-name mapping the same way as v1 (angle order)
positions_all = np.array([list(mw @ me.vertices[i].co) for i in idxs])
cluster_centroid = {k: positions_all[labels == k].mean(axis=0) for k in tail_labels}
def angle_key(k):
    c = cluster_centroid[k] - hips_pos
    return math.atan2(c[2], c[0])
ordered_clusters = sorted(tail_labels, key=angle_key)
cluster_to_name = {k: f"tail_{rank+1:02d}" for rank, k in enumerate(ordered_clusters)}

chain_names = [f"tail_{i:02d}" for i in range(1, 10)]
J = {name: [np.array(p) for p in chains_data[name]["joints"]] for name in chain_names}
seg_len = {name: [np.linalg.norm(J[name][i+1]-J[name][i]) for i in range(3)] for name in chain_names}
cum = {name: [0.0, seg_len[name][0], seg_len[name][0]+seg_len[name][1],
              seg_len[name][0]+seg_len[name][1]+seg_len[name][2]] for name in chain_names}

# --- create bones (same as v1) ---
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
ebones = arm.data.edit_bones
hips_ebone = ebones["Hips"]
bone_names_per_chain = {}
for name in chain_names:
    joints_local = [arm_inv @ mathutils.Vector(p.tolist()) for p in J[name]]
    seg_names = [name, f"{name}_mid", f"{name}_tip"]
    prev_bone = None
    for si in range(3):
        eb = ebones.new(seg_names[si])
        eb.head = joints_local[si]
        eb.tail = joints_local[si+1]
        if (eb.tail - eb.head).length < 1e-5:
            eb.tail = eb.head + mathutils.Vector((0,0,0.01))
        if prev_bone is None:
            eb.parent = hips_ebone
            eb.use_connect = False
        else:
            eb.parent = prev_bone
            eb.use_connect = True
        prev_bone = eb
    bone_names_per_chain[name] = seg_names
bpy.ops.object.mode_set(mode='OBJECT')
print("bones created")

for vg_name in [n for c in bone_names_per_chain.values() for n in c]:
    if vg_name not in obj.vertex_groups:
        obj.vertex_groups.new(name=vg_name)
hips_vg = obj.vertex_groups.get("Hips")

def closest_point_s(name, wc):
    Jn = J[name]
    best_d, best_s = 1e18, 0.0
    total_len = cum[name][3] if cum[name][3] > 1e-6 else 1.0
    for i in range(3):
        a, b = Jn[i], Jn[i+1]
        ab = b - a
        ab_len2 = np.dot(ab, ab)
        t = 0.0 if ab_len2 < 1e-12 else np.clip(np.dot(wc - a, ab) / ab_len2, 0.0, 1.0)
        proj = a + t*ab
        d = np.linalg.norm(wc - proj)
        if d < best_d:
            best_d, best_s = d, (cum[name][i] + t*seg_len[name][i]) / total_len
    return best_d, best_s

def tent_weights(s):
    wA = max(0.0, 1 - abs(s-0.0)/0.5)
    wB = max(0.0, 1 - abs(s-0.5)/0.5)
    wC = max(0.0, 1 - abs(s-1.0)/0.5)
    tot = wA+wB+wC
    if tot < 1e-9:
        return 1.0, 0.0, 0.0
    return wA/tot, wB/tot, wC/tot

ROOT_BLEND_S = 0.22       # below this arclength fraction, blend some weight back to Hips
ROOT_BLEND_MAX = 0.45     # max fraction given to Hips right at the very base (s=0)
BOUNDARY_RATIO = 1.7      # if 2nd-nearest chain distance < 1st * this, blend between them

member_idx = idxs  # all tail-candidate vertices (all 9 clusters combined)
n_processed = 0
for vidx in member_idx:
    wc = np.array(list(mw @ me.vertices[int(vidx)].co))
    dists = {}
    ss = {}
    for name in chain_names:
        d, s = closest_point_s(name, wc)
        dists[name] = d
        ss[name] = s
    ranked = sorted(chain_names, key=lambda n: dists[n])
    n1, n2 = ranked[0], ranked[1]
    d1, d2 = dists[n1], dists[n2]

    if d2 < d1 * BOUNDARY_RATIO and d1 > 1e-9:
        w1 = d2 / (d1 + d2)
        w2 = d1 / (d1 + d2)
    else:
        w1, w2 = 1.0, 0.0

    s1 = ss[n1]
    hips_frac = 0.0
    if s1 < ROOT_BLEND_S:
        hips_frac = ROOT_BLEND_MAX * (1 - s1 / ROOT_BLEND_S)
    tail_frac = 1.0 - hips_frac

    vert_idx_int = int(vidx)
    if hips_vg is not None:
        try:
            hips_vg.remove([vert_idx_int])
        except RuntimeError:
            pass
    if hips_frac > 1e-4:
        hips_vg.add([vert_idx_int], hips_frac, 'REPLACE')

    for name, w_chain in ((n1, w1), (n2, w2)):
        if w_chain <= 1e-4:
            continue
        seg_names = bone_names_per_chain[name]
        s = ss[name]
        bA, bB, bC = tent_weights(s)
        total_w = w_chain * tail_frac
        if bA > 1e-4:
            obj.vertex_groups[seg_names[0]].add([vert_idx_int], bA*total_w, 'ADD')
        if bB > 1e-4:
            obj.vertex_groups[seg_names[1]].add([vert_idx_int], bB*total_w, 'ADD')
        if bC > 1e-4:
            obj.vertex_groups[seg_names[2]].add([vert_idx_int], bC*total_w, 'ADD')
    n_processed += 1

print(f"weight painting v2 complete, processed {n_processed} vertices")

# supplementary smoothing pass (helps within-island continuity)
bpy.context.view_layer.objects.active = obj
for o in bpy.context.selected_objects:
    o.select_set(False)
obj.select_set(True)
bpy.ops.object.mode_set(mode='OBJECT')
for c in bone_names_per_chain.values():
    for vg_name in c:
        vg = obj.vertex_groups.get(vg_name)
        if vg is None:
            continue
        obj.vertex_groups.active_index = vg.index
        try:
            with bpy.context.temp_override(object=obj, active_object=obj):
                bpy.ops.object.vertex_group_smooth(group_select_mode='ACTIVE', factor=0.5, repeat=3)
        except RuntimeError as e:
            print("smooth skipped for", vg_name, e)

print("smoothing pass complete")

# --- pose test: same angles as v1 for a fair comparison ---
bpy.context.view_layer.objects.active = arm
for o in bpy.context.selected_objects:
    o.select_set(False)
arm.select_set(True)
bpy.ops.object.mode_set(mode='POSE')
for i, name in enumerate(chain_names):
    seg_names = bone_names_per_chain[name]
    ang1 = math.radians(25 + 10*math.sin(i))
    ang2 = math.radians(15 + 8*math.cos(i*1.3))
    pb0 = arm.pose.bones[seg_names[0]]
    pb1 = arm.pose.bones[seg_names[1]]
    pb0.rotation_mode = 'XYZ'
    pb1.rotation_mode = 'XYZ'
    pb0.rotation_euler = (ang1*(1 if i%2==0 else -1), 0, 0)
    pb1.rotation_euler = (ang2*(1 if i%2==0 else -1), 0, 0)
bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode='OBJECT')
print("pose applied")

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
light_data = bpy.data.lights.new(name="key", type='SUN')
light_data.energy = 2.5
light_obj = bpy.data.objects.new(name="key", object_data=light_data)
bpy.context.collection.objects.link(light_obj)
light_obj.rotation_euler = (math.radians(60), 0, math.radians(45))

min_co = mathutils.Vector((1e9,1e9,1e9)); max_co = mathutils.Vector((-1e9,-1e9,-1e9))
for corner in obj.bound_box:
    wc = obj.matrix_world @ mathutils.Vector(corner)
    min_co.x=min(min_co.x,wc.x); min_co.y=min(min_co.y,wc.y); min_co.z=min(min_co.z,wc.z)
    max_co.x=max(max_co.x,wc.x); max_co.y=max(max_co.y,wc.y); max_co.z=max(max_co.z,wc.z)
center=(min_co+max_co)/2; size=max_co-min_co; radius=max(size.x,size.y,size.z)*1.3

cam_data = bpy.data.cameras.new("cam"); cam_data.type='ORTHO'; cam_data.ortho_scale=radius*2
cam_obj = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam_obj)
scene.camera = cam_obj
scene.render.resolution_x = 900; scene.render.resolution_y = 900
scene.render.image_settings.file_format = 'PNG'

for name, direction in {"back": (0,1,0), "right": (1,0,0)}.items():
    dirvec = mathutils.Vector(direction).normalized()
    cam_obj.location = center + dirvec*(radius*3)
    look_dir = (center-cam_obj.location).normalized()
    cam_obj.rotation_euler = look_dir.to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = f"{OUT_DIR}/rigged_v2_after_{name}.png"
    bpy.ops.render.render(write_still=True)
    print("rendered v2 after", name)

bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB')
print("Exported v2 prototype GLB to", OUT_GLB)
print("DONE")
