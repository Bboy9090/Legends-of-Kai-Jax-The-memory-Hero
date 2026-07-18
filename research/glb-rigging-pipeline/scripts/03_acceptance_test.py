import bpy
import bmesh
import numpy as np
import json
import math
import mathutils
import os

MODEL = "/home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/public/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb"
CHAINS_JSON = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/rig_chains.json"
KMEANS_JSON = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/tail_kmeans.json"
OUT_DIR = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/acceptance"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(OUT_DIR + "/renders", exist_ok=True)

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

positions_all = np.array([list(mw @ me.vertices[i].co) for i in idxs])
cluster_centroid = {k: positions_all[labels == k].mean(axis=0) for k in tail_labels}
def angle_key(k):
    c = cluster_centroid[k] - hips_pos
    return math.atan2(c[2], c[0])
ordered_clusters = sorted(tail_labels, key=angle_key)
cluster_to_name = {k: f"tail_{rank+1:02d}" for rank, k in enumerate(ordered_clusters)}
name_to_cluster = {v: k for k, v in cluster_to_name.items()}

chain_names = [f"tail_{i:02d}" for i in range(1, 10)]
J = {name: [np.array(p) for p in chains_data[name]["joints"]] for name in chain_names}
seg_len = {name: [np.linalg.norm(J[name][i+1]-J[name][i]) for i in range(3)] for name in chain_names}
cum = {name: [0.0, seg_len[name][0], seg_len[name][0]+seg_len[name][1],
              seg_len[name][0]+seg_len[name][1]+seg_len[name][2]] for name in chain_names}

# --- build bones (same pipeline as v2) ---
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

ROOT_BLEND_S = 0.22
ROOT_BLEND_MAX = 0.45
BOUNDARY_RATIO = 1.7

for vidx in idxs:
    wc = np.array(list(mw @ me.vertices[int(vidx)].co))
    dists, ss = {}, {}
    for name in chain_names:
        d, s = closest_point_s(name, wc)
        dists[name] = d
        ss[name] = s
    ranked = sorted(chain_names, key=lambda n: dists[n])
    n1, n2 = ranked[0], ranked[1]
    d1, d2 = dists[n1], dists[n2]
    if d2 < d1 * BOUNDARY_RATIO and d1 > 1e-9:
        w1, w2 = d2/(d1+d2), d1/(d1+d2)
    else:
        w1, w2 = 1.0, 0.0
    s1 = ss[n1]
    hips_frac = ROOT_BLEND_MAX * (1 - s1/ROOT_BLEND_S) if s1 < ROOT_BLEND_S else 0.0
    tail_frac = 1.0 - hips_frac
    vi = int(vidx)
    if hips_vg is not None:
        try:
            hips_vg.remove([vi])
        except RuntimeError:
            pass
    if hips_frac > 1e-4:
        hips_vg.add([vi], hips_frac, 'REPLACE')
    for name, w_chain in ((n1, w1), (n2, w2)):
        if w_chain <= 1e-4:
            continue
        seg_names = bone_names_per_chain[name]
        s = ss[name]
        bA, bB, bC = tent_weights(s)
        total_w = w_chain * tail_frac
        if bA > 1e-4:
            obj.vertex_groups[seg_names[0]].add([vi], bA*total_w, 'ADD')
        if bB > 1e-4:
            obj.vertex_groups[seg_names[1]].add([vi], bB*total_w, 'ADD')
        if bC > 1e-4:
            obj.vertex_groups[seg_names[2]].add([vi], bC*total_w, 'ADD')

print("weights painted")

# disconnect the baked walk animation entirely so pose bones sit exactly
# wherever this script sets them, with no F-curve influence, and force
# every pose bone (not just the ones this script touches) to identity
# before capturing the rest-state reference -- otherwise the reference
# is whatever frame the importer happened to leave the armature on, not
# a true bind pose, and every downstream strain measurement is bogus.
if arm.animation_data:
    arm.animation_data.action = None
bpy.context.view_layer.objects.active = arm
for o in bpy.context.selected_objects:
    o.select_set(False)
arm.select_set(True)
bpy.ops.object.mode_set(mode='POSE')
for pb in arm.pose.bones:
    pb.rotation_mode = 'XYZ'
    pb.rotation_euler = (0, 0, 0)
    pb.location = (0, 0, 0)
    pb.scale = (1, 1, 1)
bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode='OBJECT')

ALL_BONE_NAMES = [b.name for b in arm.pose.bones]

# --- rest-state reference: edges + positions ---
n_verts = len(me.vertices)
depsgraph_rest = bpy.context.evaluated_depsgraph_get()
depsgraph_rest.update()
obj_eval_rest = obj.evaluated_get(depsgraph_rest)
me_eval_rest = obj_eval_rest.to_mesh()
rest_pos = np.array([list(mw @ v.co) for v in me_eval_rest.vertices])
obj_eval_rest.to_mesh_clear()
edges = np.array([[e.vertices[0], e.vertices[1]] for e in me.edges])
rest_edge_len = np.linalg.norm(rest_pos[edges[:,0]] - rest_pos[edges[:,1]], axis=1)
print(f"verts={n_verts} edges={len(edges)}")

# tail-region vertex mask (only these edges are meaningful strain checks;
# body/limbs are unposed here so should show ~1.0 ratio as a sanity check)
tail_vertex_set = set(int(i) for i in idxs)
is_tail_edge = np.array([
    (int(e[0]) in tail_vertex_set) or (int(e[1]) in tail_vertex_set) for e in edges
])

# subsampled points per tail cluster for clipping distance checks
rng = np.random.default_rng(3)
cluster_sample_idx = {}
for k in tail_labels:
    member = idxs[labels == k]
    n_take = min(150, len(member))
    cluster_sample_idx[k] = rng.choice(member, size=n_take, replace=False)

def min_pairwise_dist(pos_lookup, idx_a, idx_b):
    a = pos_lookup[idx_a]
    b = pos_lookup[idx_b]
    d = np.linalg.norm(a[:, None, :] - b[None, :, :], axis=2)
    return d.min()

rest_pair_mindist = {}
for i in range(len(tail_labels)):
    for j in range(i+1, len(tail_labels)):
        ka, kb = tail_labels[i], tail_labels[j]
        rest_pair_mindist[(ka, kb)] = min_pairwise_dist(
            {ka: rest_pos[cluster_sample_idx[ka]], kb: rest_pos[cluster_sample_idx[kb]]}[ka] if False else rest_pos,
            cluster_sample_idx[ka], cluster_sample_idx[kb]
        )

print("rest reference captured")

# --- pose scenario definitions ---
# rotations expressed as (yaw_deg about Z, pitch_deg about X) applied to Hips/Spine,
# and per-tail (base_deg, mid_deg, tip_deg) rotation about X (primary sway axis).
# Grounded in apps/web/src/game/tuning/{adventure,movement}.json:
#   dodge: distance=5, duration=0.35s ; turnSpeed=8 rad/s (~458 deg/s) ; runSpeed=10
#   heavy attack: startup=10f/60=0.167s, recovery=18f/60=0.3s, superArmor, knockback=6 (biggest committed move)
# NOTE: the source GLB only carries one baked walk animation; the game has no
# per-move baked skeletal animation for this character either (confirmed via
# moveData.ts - only frame/damage timing, no pose data). These are therefore
# kinematically-grounded synthetic stress poses, not a replay of shipped
# animation data. Documented explicitly in the acceptance report.

def tail_pose(base, mid, tip, side=1.0, twist=0.0):
    return (base*side, mid*side, tip*side, twist)

SCENARIOS = {
    "idle": {
        "hips": (0, 0, 0),
        "spine": (0, 0, 0),
        "tails": {name: tail_pose(6*math.sin(i), 4*math.sin(i+0.5), 3*math.sin(i+1))
                  for i, name in enumerate(chain_names)},
    },
    "run": {
        "hips": (0, 12, 0),
        "spine": (0, 6, 0),
        "tails": {name: tail_pose(-18 + 4*math.sin(i*1.7), -24, -20, twist=6*math.sin(i))
                  for i, name in enumerate(chain_names)},
    },
    "dodge": {
        "hips": (45, 8, 20),
        "spine": (20, 4, 8),
        "tails": {name: tail_pose(55, 45, 35, side=-1.0, twist=10)
                  for name in chain_names},
    },
    "heavy_attack": {
        "hips": (45, 5, 0),
        "spine": (35, 8, 0),
        "tails": {name: tail_pose(50, 40, 30, side=-1.0, twist=-8)
                  for name in chain_names},
    },
    "hit_reaction": {
        "hips": (-10, -25, 0),
        "spine": (-6, -22, 0),
        "tails": {name: tail_pose(45, 55, 60, side=1.0, twist=4)
                  for name in chain_names},
    },
    "sharp_direction_change": {
        "hips": (40, 6, 0),
        "spine": (15, 3, 0),
        "tails": {name: tail_pose(-50, -40, -30, side=1.0, twist=-6)
                  for name in chain_names},
    },
    "close_camera": {  # neutral idle pose, camera does the work
        "hips": (0, 0, 0),
        "spine": (0, 0, 0),
        "tails": {name: tail_pose(6*math.sin(i), 4*math.sin(i+0.5), 3*math.sin(i+1))
                  for i, name in enumerate(chain_names)},
    },
    "extreme_tail_spread": {
        "hips": (0, 0, 0),
        "spine": (0, 0, 0),
        "tails": {name: tail_pose(40, 55, 70, side=(1.0 if i % 2 == 0 else -1.0))
                  for i, name in enumerate(chain_names)},
    },
}

def _lerp_pose(pose_a, pose_b, t):
    def lerp3(a, b):
        return tuple(a[i] + (b[i]-a[i])*t for i in range(3))
    out = {"hips": lerp3(pose_a["hips"], pose_b["hips"]),
           "spine": lerp3(pose_a["spine"], pose_b["spine"]), "tails": {}}
    for name in chain_names:
        a = pose_a["tails"][name]
        b = pose_b["tails"][name]
        out["tails"][name] = tuple(a[i] + (b[i]-a[i])*t for i in range(4))
    return out

# animation-blend scenario: this GLB carries no second baked combat
# animation to blend against (only the one walk cycle) and the game itself
# has no per-move baked skeletal animation for this character (moveData.ts
# is frame-timing/damage only), so this approximates what any blend-space
# transition would put the tail rig through: a mid-transition interpolation
# between two structurally different poses (idle -> heavy_attack), which is
# what a real animation blend actually is mathematically (weighted pose
# interpolation), just without production mocap driving the endpoints.
SCENARIOS["animation_blending"] = _lerp_pose(SCENARIOS["idle"], SCENARIOS["heavy_attack"], 0.5)

def apply_pose(scenario):
    hy, hp, hr = scenario["hips"]
    sy, sp, sr = scenario["spine"]
    for bone_name, (y, p, r) in (("Hips", (hy, hp, hr)), ("Spine01", (sy, sp, sr))):
        pb = arm.pose.bones[bone_name]
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = (math.radians(p), math.radians(r), math.radians(y))
    for name, (base, mid, tip, twist) in scenario["tails"].items():
        seg_names = bone_names_per_chain[name]
        for seg, ang in zip(seg_names, (base, mid, tip)):
            pb = arm.pose.bones[seg]
            pb.rotation_mode = 'XYZ'
            pb.rotation_euler = (math.radians(ang), math.radians(twist*0.3), 0)

def clear_pose():
    for bone_name in ALL_BONE_NAMES:
        pb = arm.pose.bones[bone_name]
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = (0, 0, 0)

# --- render setup ---
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

cam_data = bpy.data.cameras.new("cam"); cam_data.type='ORTHO'
cam_obj = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam_obj)
scene.camera = cam_obj
scene.render.resolution_x = 900; scene.render.resolution_y = 900
scene.render.image_settings.file_format = 'PNG'

def render_view(name, direction, ortho_scale, look_at_offset=mathutils.Vector((0,0,0))):
    cam_data.ortho_scale = ortho_scale
    dirvec = mathutils.Vector(direction).normalized()
    target = center + look_at_offset
    cam_obj.location = target + dirvec*(radius*3)
    look_dir = (target - cam_obj.location).normalized()
    cam_obj.rotation_euler = look_dir.to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = f"{OUT_DIR}/renders/{name}.png"
    bpy.ops.render.render(write_still=True)

depsgraph = bpy.context.evaluated_depsgraph_get()

results = {}
bpy.context.view_layer.objects.active = arm
for o in bpy.context.selected_objects:
    o.select_set(False)
arm.select_set(True)
bpy.ops.object.mode_set(mode='POSE')

for scen_name, scen in SCENARIOS.items():
    clear_pose()
    apply_pose(scen)
    bpy.context.view_layer.update()
    depsgraph.update()

    obj_eval = obj.evaluated_get(depsgraph)
    me_eval = obj_eval.to_mesh()
    posed_pos = np.array([list(mw @ v.co) for v in me_eval.vertices])
    obj_eval.to_mesh_clear()

    posed_edge_len = np.linalg.norm(posed_pos[edges[:,0]] - posed_pos[edges[:,1]], axis=1)
    ratio = np.divide(posed_edge_len, rest_edge_len, out=np.ones_like(rest_edge_len), where=rest_edge_len > 1e-9)
    tail_ratio = ratio[is_tail_edge]
    body_ratio = ratio[~is_tail_edge]

    high_strain = tail_ratio[(tail_ratio > 1.6) | (tail_ratio < 0.5)]
    strain_pct = 100.0 * len(high_strain) / max(1, len(tail_ratio))

    # inter-tail clipping heuristic vs rest
    clip_flags = []
    for i in range(len(tail_labels)):
        for j in range(i+1, len(tail_labels)):
            ka, kb = tail_labels[i], tail_labels[j]
            d_posed = min_pairwise_dist(posed_pos, cluster_sample_idx[ka], cluster_sample_idx[kb])
            d_rest = rest_pair_mindist[(ka, kb)]
            if d_posed < 0.03 or (d_rest > 1e-6 and d_posed < d_rest * 0.25):
                clip_flags.append({
                    "pair": [cluster_to_name[ka], cluster_to_name[kb]],
                    "rest_min_dist": round(float(d_rest), 4),
                    "posed_min_dist": round(float(d_posed), 4),
                })

    results[scen_name] = {
        "max_tail_stretch_ratio": round(float(tail_ratio.max()), 3),
        "max_tail_compress_ratio": round(float(tail_ratio.min()), 3),
        "pct_high_strain_tail_edges": round(strain_pct, 3),
        "body_ratio_sanity_max_deviation": round(float(np.abs(body_ratio - 1.0).max()), 4),
        "clipping_flags": clip_flags,
    }
    print(scen_name, results[scen_name])

    if scen_name == "close_camera":
        # tight crop centered on a representative tail-to-torso seam (tail_01 root)
        seam_world = J["tail_01"][0]
        render_view(f"{scen_name}_full", (1, 1, 0.3), radius*2)
        render_view(f"{scen_name}_seam_closeup", (1, 1, 0.3), radius*0.35,
                    look_at_offset=mathutils.Vector(seam_world.tolist()) - center)
    else:
        render_view(f"{scen_name}_back", (0, 1, 0.2), radius*2)
        render_view(f"{scen_name}_side", (1, 0.3, 0.2), radius*2)

bpy.ops.object.mode_set(mode='OBJECT')

with open(OUT_DIR + "/acceptance_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Wrote", OUT_DIR + "/acceptance_results.json")
print("DONE")
