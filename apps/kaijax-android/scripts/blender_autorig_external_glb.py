#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-I EXTERNAL MESHY / BLENDER MESH AUTO-RIG, RETARGET & LOD1 COMPILER
Usage:
  blender -b --factory-startup -P scripts/blender_autorig_external_glb.py -- <input_mesh_path> <character_id> <out_dir>

Takes an externally generated 3D character mesh (.glb/.gltf/.fbx/.obj from Meshy AI or Blender):
1. Preserves raw Meshy PBR textures & UVs while normalizing stature and grounding feet (Y=0 in glTF / Z=0 in Blender).
2. Decimates Master mesh cleanly into Phase 6 Master budget (18k-25k tris) and Mobile LOD1 budget (8.5k-11.2k tris).
3. Computes smooth vectorized 4-bone capsule skin weights from the canonical Kai-Jax skeleton (37/32/56/29/29 joints).
4. Attaches all 6 gameplay sockets, 5 expressive facial morph targets (blink, snarl, roar, pain, focus), and 19 NLA animation clips.
5. Compresses embedded PBR textures (1024-2048 Master, 1024 Mobile LOD1 JPEG) for fast WebGL & Android APK loading.
"""
import json
import re
import struct
import sys
from pathlib import Path

import bpy
import mathutils
import numpy as np

for _alias, _builtin in [("bool", bool), ("int", int), ("float", float), ("complex", complex), ("object", object), ("str", str)]:
    if not hasattr(np, _alias):
        setattr(np, _alias, _builtin)

# Total visual height in meters (including dorsal spider tips / storm-mane crests where applicable,
# staying strictly within standingHeightMeters +/- 0.30m certification bounds)
TARGET_TOTAL_HEIGHTS = {
    "kai": 2.08,     # Crown ~1.82m + dorsal spider tips ~2.08m
    "jax": 1.94,     # Crown ~1.88m + storm-mane crest ~1.94m
    "kaijax": 2.28,  # Crown ~2.04m + dorsal spider tips ~2.28m
    "boryn": 2.12,   # Standing height 2.12m
    "borax": 2.20,   # Standing height 2.20m
}

MASTER_MAX_TRIS = {
    "kai": 23500,
    "jax": 23500,
    "kaijax": 25500,
    "boryn": 22000,
    "borax": 23500,
}

LOD1_MAX_TRIS = {
    "kai": 9800,
    "jax": 9800,
    "kaijax": 11200,
    "boryn": 9200,
    "borax": 9800,
}


def parse_args():
    argv = sys.argv
    if "--" not in argv:
        raise RuntimeError("Expected '-- <input_mesh_path> <character_id> <out_dir>'")
    idx = argv.index("--") + 1
    return Path(argv[idx]), argv[idx + 1].lower(), Path(argv[idx + 2])


def import_any_mesh(filepath: Path):
    ext = filepath.suffix.lower()
    before = set(bpy.data.objects)
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=str(filepath))
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=str(filepath))
    elif ext == ".obj":
        bpy.ops.import_scene.obj(filepath=str(filepath))
    else:
        raise RuntimeError(f"Unsupported 3D format: {ext}")
    added = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in added if o.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"No MESH objects found in {filepath}")
    return added, meshes


def join_and_normalize_meshes(meshes, target_height: float, char_id: str):
    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        # Remove any pre-existing armature modifiers or shape keys from re-imports
        for mod in list(m.modifiers):
            if mod.type == "ARMATURE":
                m.modifiers.remove(mod)
        if m.data.shape_keys:
            m.shape_key_clear()
        m.parent = None
        m.select_set(True)

    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    target_mesh = bpy.context.view_layer.objects.active
    target_mesh.name = f"{char_id}_Mesh"

    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Weld duplicate seam vertices slightly while preserving UVs/normals so decimation & smoothing stay watertight
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=0.00015)
    bpy.ops.object.mode_set(mode="OBJECT")

    verts_np = np.array([v.co[:] for v in target_mesh.data.vertices], dtype=np.float64)
    min_xyz = verts_np.min(axis=0)
    max_xyz = verts_np.max(axis=0)

    cur_h = max(1e-4, float(max_xyz[2] - min_xyz[2]))
    scale_f = target_height / cur_h
    cx = float((min_xyz[0] + max_xyz[0]) * 0.5)
    cy = float((min_xyz[1] + max_xyz[1]) * 0.5)
    min_z = float(min_xyz[2])

    for v in target_mesh.data.vertices:
        v.co.x = (v.co.x - cx) * scale_f
        v.co.y = (v.co.y - cy) * scale_f
        v.co.z = (v.co.z - min_z) * scale_f
    target_mesh.data.update()
    return target_mesh


def decimate_to_budget(mesh_obj, max_tris: int):
    mesh_obj.data.calc_loop_triangles()
    cur_tris = len(mesh_obj.data.loop_triangles)
    if cur_tris <= max_tris:
        return cur_tris
    if mesh_obj.data.shape_keys:
        mesh_obj.shape_key_clear()
    ratio = max(0.10, min(0.96, (max_tris * 0.94) / float(cur_tris)))
    dec = mesh_obj.modifiers.new(name="BudgetDecimate", type="DECIMATE")
    dec.ratio = ratio
    bpy.context.view_layer.objects.active = mesh_obj
    bpy.ops.object.modifier_apply(modifier=dec.name)
    mesh_obj.data.calc_loop_triangles()
    return len(mesh_obj.data.loop_triangles)


def assign_smooth_capsule_skin_weights(mesh_obj, arm_obj):
    mesh_obj.vertex_groups.clear()
    bones = list(arm_obj.data.bones)
    bone_names = [b.name for b in bones]
    vgroups = {b.name: mesh_obj.vertex_groups.new(name=b.name) for b in bones}

    arm_mw = arm_obj.matrix_world
    mesh_mw = mesh_obj.matrix_world

    heads = np.array([(arm_mw @ b.head_local)[:] for b in bones], dtype=np.float64)
    tails = np.array([(arm_mw @ b.tail_local)[:] for b in bones], dtype=np.float64)
    verts = np.array([(mesh_mw @ v.co)[:] for v in mesh_obj.data.vertices], dtype=np.float64)
    total_height = max(1e-4, float(verts[:, 2].max() - verts[:, 2].min()))

    ab = tails - heads
    ab_len_sq = np.sum(ab * ab, axis=1) + 1e-8
    ap = verts[:, None, :] - heads[None, :, :]
    t = np.clip(np.sum(ap * ab[None, :, :], axis=2) / ab_len_sq[None, :], 0.0, 1.0)
    closest = heads[None, :, :] + t[:, :, None] * ab[None, :, :]
    dist_sq = np.sum((verts[:, None, :] - closest) ** 2, axis=2)

    # Soft capsule kernel: keeps torso/limbs cohesive without discontinuous polygon jumps
    weights = 1.0 / ((dist_sq + 0.0048) ** 2.25)

    # P1-J Skin-Weight Upgrade:
    # 1. Dampen facial sub-bones so jaw/ears don't shear skull/mane triangles.
    # 2. Enforce bilateral X-hemisphere separation on left/right limbs & spider legs so wide running strides
    #    and claw slashes never tug opposite-thigh or torso vertices.
    # 3. Bound dorsal spider limbs, storm-mane crests, and tails to localized radii so appendages deform cleanly.
    for j, bname in enumerate(bone_names):
        if bname in ("jaw", "ear_L", "ear_R"):
            far_mask = dist_sq[:, j] > (0.085 ** 2)
            weights[far_mask, j] = 0.0
            weights[~far_mask, j] *= 0.30
        elif bname == "root":
            weights[:, j] = 0.0
        else:
            is_sided = (
                bname.endswith("_L")
                or bname.endswith("_R")
                or "_UL_" in bname
                or "_UR_" in bname
                or "_LL_" in bname
                or "_LR_" in bname
                or bname.startswith("tail_ember")
                or bname.startswith("tail_memory")
            )
            if is_sided and abs(float(heads[j, 0])) > 0.02:
                bone_side = 1.0 if heads[j, 0] > 0.0 else -1.0
                cross_dist = np.maximum(0.0, -verts[:, 0] * bone_side - 0.025)
                weights[:, j] *= np.exp(-((cross_dist / 0.035) ** 2))

            if bname.startswith("spider_") or bname.startswith("tail") or bname.startswith("mane_0"):
                # Prevent dorsal/rear appendages from pulling front chest or abdomen mesh
                too_far = dist_sq[:, j] > (0.28 ** 2)
                weights[too_far, j] *= 0.04

            if bname.startswith("upper_arm_") or bname.startswith("forearm_") or bname.startswith("hand_"):
                # Prevent lowered rest-pose arms/hands from grabbing outer coat hem or hip/thigh vertices!
                max_r = 0.155 if bname.startswith("upper_arm_") else 0.128
                arm_far = dist_sq[:, j] > (max_r ** 2)
                weights[arm_far, j] = 0.0
                min_x_frac = 0.115 if bname.startswith("upper_arm_") else 0.152
                inner_coat = (np.abs(verts[:, 0]) < (total_height * min_x_frac)) & (verts[:, 2] < (total_height * 0.65))
                weights[inner_coat, j] = 0.0

    # Pure vectorized Laplacian weight smoothing across mesh edges (zero UI context dependency)
    if len(mesh_obj.data.edges) > 0:
        edges = np.array([[e.vertices[0], e.vertices[1]] for e in mesh_obj.data.edges], dtype=np.int32)
        deg = np.zeros((len(verts), 1), dtype=np.float64)
        np.add.at(deg[:, 0], edges[:, 0], 1.0)
        np.add.at(deg[:, 0], edges[:, 1], 1.0)
        deg = np.maximum(deg, 1.0)
        for _ in range(3):
            nb = np.zeros_like(weights)
            np.add.at(nb, edges[:, 0], weights[edges[:, 1]])
            np.add.at(nb, edges[:, 1], weights[edges[:, 0]])
            weights = 0.55 * weights + 0.45 * (nb / deg)

        # Re-enforce inner coat/thigh protection after smoothing so sleeve-to-coat bridges never tug coat skirts
        for j, bname in enumerate(bone_names):
            if bname.startswith("forearm_") or bname.startswith("hand_"):
                inner_coat = (np.abs(verts[:, 0]) < (total_height * 0.148)) & (verts[:, 2] < (total_height * 0.62))
                weights[inner_coat, j] = 0.0

    # Keep top 4 influences per vertex and normalize strictly to sum == 1.0
    top4_idx = np.argpartition(-weights, kth=min(4, len(bones) - 1), axis=1)[:, :4]
    row_idx = np.arange(len(verts))[:, None]
    top4_w = np.maximum(0.0, weights[row_idx, top4_idx])
    sums = np.sum(top4_w, axis=1, keepdims=True)
    zero_rows = sums[:, 0] <= 1e-12
    if np.any(zero_rows):
        pelvis_idx = bone_names.index("pelvis") if "pelvis" in bone_names else 0
        top4_idx[zero_rows, 0] = pelvis_idx
        top4_w[zero_rows, :] = 0.0
        top4_w[zero_rows, 0] = 1.0
        sums = np.sum(top4_w, axis=1, keepdims=True)
    top4_w = top4_w / sums

    for v_i in range(len(verts)):
        for k in range(top4_idx.shape[1]):
            w_val = float(top4_w[v_i, k])
            if w_val > 1e-6:
                bname = bone_names[int(top4_idx[v_i, k])]
                vgroups[bname].add([v_i], w_val, "REPLACE")

    bpy.context.view_layer.objects.active = mesh_obj
    bpy.ops.object.vertex_group_limit_total(group_select_mode="ALL", limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode="ALL", lock_active=False)


def ensure_five_facial_shape_keys(mesh_obj, total_height: float):
    if mesh_obj.data.shape_keys:
        mesh_obj.shape_key_clear()
    mesh_obj.shape_key_add(name="Basis", from_mix=False)

    verts_np = np.array([v.co[:] for v in mesh_obj.data.vertices], dtype=np.float64)
    head_z_center = total_height * 0.80
    min_y = float(verts_np[:, 1].min())
    y_center = min_y * 0.65

    # Smooth Gaussian falloff around muzzle/brow so dense AI meshes deform organically without step seams
    gz = (verts_np[:, 2] - head_z_center) / 0.085
    gx = verts_np[:, 0] / 0.115
    gy = (verts_np[:, 1] - y_center) / 0.095
    envelope = np.exp(-(gz * gz + gx * gx + gy * gy))

    morph_specs = {
        "blink": (0.0, 0.002, -0.009),
        "snarl": (0.004, -0.006, 0.010),
        "roar": (0.005, -0.008, -0.015),
        "pain": (-0.003, 0.004, -0.008),
        "focus": (0.0, -0.006, -0.006),
    }

    for mname in ("blink", "snarl", "roar", "pain", "focus"):
        dx, dy, dz = morph_specs[mname]
        kb = mesh_obj.shape_key_add(name=mname, from_mix=False)
        for i, v in enumerate(mesh_obj.data.vertices):
            env = float(envelope[i])
            if env > 0.02:
                sx = dx * (1.0 if v.co.x >= 0 else -1.0) * env
                kb.data[i].co = v.co + mathutils.Vector((sx, dy * env, dz * env))


def normalize_glb_animation_names(glb_path: Path, char_id: str):
    raw = glb_path.read_bytes()
    magic, version, _total_len, json_len, json_type = struct.unpack_from("<IIIII", raw, 0)
    if magic != 0x46546C67:
        return
    json_bytes = raw[20 : 20 + json_len]
    bin_rest = raw[20 + json_len :]
    gltf = json.loads(json_bytes.decode("utf-8"))

    seen = {}
    cleaned_anims = []
    suffix_pat = re.compile(rf"_{re.escape(char_id)}_Armature.*$", re.IGNORECASE)
    for anim in gltf.get("animations", []):
        orig_name = anim.get("name", "")
        clean_name = suffix_pat.sub("", orig_name)
        clean_name = re.sub(r"\.\d+$", "", clean_name)
        if clean_name not in seen:
            anim["name"] = clean_name
            seen[clean_name] = True
            cleaned_anims.append(anim)
    gltf["animations"] = cleaned_anims
    gltf.setdefault("asset", {})[
        "generator"
    ] = "Kai-Jax P1-J Mastered Animation + P1-I Meshy Sculpture (Blender 3.4.1 Rig)"

    new_json = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    pad = (4 - (len(new_json) % 4)) % 4
    if pad:
        new_json += b" " * pad
    new_total = 12 + 8 + len(new_json) + len(bin_rest)
    header = struct.pack("<IIIII", magic, version, new_total, len(new_json), json_type)
    glb_path.write_bytes(header + new_json + bin_rest)


def resize_embedded_images(max_dim: int):
    for img in bpy.data.images:
        if img.size[0] > max_dim or img.size[1] > max_dim:
            new_w = min(max_dim, max(64, img.size[0]))
            new_h = min(max_dim, max(64, img.size[1]))
            try:
                img.scale(new_w, new_h)
            except Exception:
                pass


def main():
    in_path, char_id, out_dir = parse_args()
    if char_id not in TARGET_TOTAL_HEIGHTS:
        raise RuntimeError(f"Unsupported or gated character_id '{char_id}'")

    ref_glb = Path("/app/applet/data/checkpoints/p1j-skeleton-templates") / f"{char_id}_template.glb"
    if not ref_glb.exists():
        ref_glb = Path("/app/applet/data/checkpoints/p1i-skeleton-templates") / f"{char_id}_template.glb"
    if not ref_glb.exists():
        ref_glb = Path("/app/applet/public/models/characters/p1i") / f"{char_id}_master.glb"
    if not ref_glb.exists():
        ref_glb = Path("/app/applet/public/models/characters") / f"{char_id}_master.glb"

    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 1. Import certified P1-I skeleton template (skeleton, 6 sockets, 19 NLA actions)
    bpy.ops.import_scene.gltf(filepath=str(ref_glb))
    ref_arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    ref_meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    template_actions = list(bpy.data.actions)

    if ref_arm.animation_data is None:
        ref_arm.animation_data_create()
    ref_arm.animation_data.action = None
    while len(ref_arm.animation_data.nla_tracks) > 0:
        ref_arm.animation_data.nla_tracks.remove(ref_arm.animation_data.nla_tracks[0])

    suffix_pat = re.compile(rf"_{re.escape(char_id)}_Armature.*$", re.IGNORECASE)
    for act in template_actions:
        clean_act_name = suffix_pat.sub("", act.name)
        act.name = clean_act_name
        track = ref_arm.animation_data.nla_tracks.new()
        track.name = clean_act_name
        strip = track.strips.new(clean_act_name, 0, act)
        strip.name = clean_act_name
        track.mute = True

    # Remove template mesh(es) & their unused template images before importing external mesh
    for rm in ref_meshes:
        bpy.data.objects.remove(rm, do_unlink=True)
    for img in list(bpy.data.images):
        if img.users == 0:
            bpy.data.images.remove(img)

    # 2. Import external Meshy/Blender mesh, strip any duplicate armatures/sockets/actions, normalize stature & ground feet
    total_h = TARGET_TOTAL_HEIGHTS[char_id]
    added_objs, ext_meshes = import_any_mesh(in_path)
    for o in added_objs:
        if o not in ext_meshes:
            bpy.data.objects.remove(o, do_unlink=True)
    for act in list(bpy.data.actions):
        if act not in template_actions:
            bpy.data.actions.remove(act)
    ext_mesh = join_and_normalize_meshes(ext_meshes, total_h, char_id)

    # 3. Decimate to Master budget, compute smooth capsule skin weights, bind to Armature, add 5 morphs
    master_tris = decimate_to_budget(ext_mesh, MASTER_MAX_TRIS[char_id])
    assign_smooth_capsule_skin_weights(ext_mesh, ref_arm)

    ext_mesh.parent = ref_arm
    ext_mesh.matrix_parent_inverse = ref_arm.matrix_world.inverted()
    arm_mod = ext_mesh.modifiers.new(name="Armature", type="ARMATURE")
    arm_mod.object = ref_arm

    ensure_five_facial_shape_keys(ext_mesh, total_h)
    resize_embedded_images(1536)

    out_dir.mkdir(parents=True, exist_ok=True)
    master_out = out_dir / f"{char_id}_master.glb"
    lod1_out = out_dir / f"{char_id}_lod1.glb"

    # Configure JPEG quality for compact, crisp PBR textures
    bpy.context.scene.render.image_settings.quality = 88

    # 4. Export Master GLB
    bpy.ops.export_scene.gltf(
        filepath=str(master_out),
        export_format="GLB",
        export_image_format="JPEG",
        export_yup=True,
        export_skins=True,
        export_morph=True,
        export_animations=True,
        export_nla_strips=True,
        export_apply=False,
    )

    # 5. Decimate to Mobile LOD1 budget, scale textures to 1024x1024, re-bind weights & 5 morphs, export LOD1 GLB
    ext_mesh.modifiers.remove(arm_mod)
    lod1_tris = decimate_to_budget(ext_mesh, LOD1_MAX_TRIS[char_id])
    assign_smooth_capsule_skin_weights(ext_mesh, ref_arm)
    arm_mod_lod = ext_mesh.modifiers.new(name="Armature", type="ARMATURE")
    arm_mod_lod.object = ref_arm
    ensure_five_facial_shape_keys(ext_mesh, total_h)
    resize_embedded_images(1024)
    bpy.context.scene.render.image_settings.quality = 82

    bpy.ops.export_scene.gltf(
        filepath=str(lod1_out),
        export_format="GLB",
        export_image_format="JPEG",
        export_yup=True,
        export_skins=True,
        export_morph=True,
        export_animations=True,
        export_nla_strips=True,
        export_apply=False,
    )

    normalize_glb_animation_names(master_out, char_id)
    normalize_glb_animation_names(lod1_out, char_id)

    summary = {
        "characterId": char_id,
        "masterGlb": str(master_out),
        "lod1Glb": str(lod1_out),
        "masterTris": master_tris,
        "lod1Tris": lod1_tris,
        "masterBytes": master_out.stat().st_size,
        "lod1Bytes": lod1_out.stat().st_size,
    }
    print("AUTORIG_SUMMARY_JSON:" + json.dumps(summary))


if __name__ == "__main__":
    main()
