import bpy
import numpy as np
import json

MODEL = "/home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/public/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb"
OUT_JSON = "/tmp/claude-0/-home-user-Legends-of-Kai-Jax-The-memory-Hero/c8146ed5-b08d-5c5f-aa72-c6921ac90b70/scratchpad/tail_kmeans.json"

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=MODEL)

obj = bpy.data.objects.get("char1")
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]

def bone_head_world(name):
    pb = arm.pose.bones[name]
    return np.array(arm.matrix_world @ pb.head)

hips_pos = bone_head_world("Hips")
me = obj.data
vg_names = {vg.index: vg.name for vg in obj.vertex_groups}

# gather Hips-dominant vertex indices + world positions
idxs = []
positions = []
mw = obj.matrix_world
for v in me.vertices:
    best_w, best_g = -1.0, None
    for g in v.groups:
        if g.weight > best_w:
            best_w, best_g = g.weight, vg_names.get(g.group)
    if best_g == "Hips":
        wc = mw @ v.co
        idxs.append(v.index)
        positions.append([wc.x, wc.y, wc.z])

positions = np.array(positions)
print("Hips-dominant vertex count:", len(idxs))

# K-means, k=10 (expect: 1 torso core blob + 9 tail lobes)
K = 10
rng = np.random.default_rng(42)
# init centroids: farthest-point sampling from hips_pos for better separation of thin lobes
centroids = [hips_pos.copy()]
for _ in range(K):
    d = np.min([np.linalg.norm(positions - c, axis=1) for c in centroids], axis=0)
    next_idx = np.argmax(d)
    centroids.append(positions[next_idx].copy())
centroids = np.array(centroids[1:])  # drop the hips seed itself, keep K farthest points

for it in range(30):
    dists = np.linalg.norm(positions[:, None, :] - centroids[None, :, :], axis=2)
    labels = np.argmin(dists, axis=1)
    new_centroids = np.array([
        positions[labels == k].mean(axis=0) if np.any(labels == k) else centroids[k]
        for k in range(K)
    ])
    shift = np.linalg.norm(new_centroids - centroids)
    centroids = new_centroids
    if shift < 1e-5:
        break
print(f"K-means converged after {it+1} iterations")

for k in range(K):
    mask = labels == k
    cnt = mask.sum()
    if cnt == 0:
        print(f"cluster {k}: EMPTY")
        continue
    pts = positions[mask]
    mean_r = np.linalg.norm(pts - hips_pos, axis=1).mean()
    centroid = pts.mean(axis=0)
    print(f"cluster {k}: n={cnt:6d} mean_dist_from_hips={mean_r:.3f} centroid={centroid.round(3).tolist()}")

result = {
    "hips": hips_pos.tolist(),
    "vertex_indices": idxs,
    "labels": labels.tolist(),
    "centroids": centroids.tolist(),
}
with open(OUT_JSON, "w") as f:
    json.dump(result, f)
print("wrote", OUT_JSON)
