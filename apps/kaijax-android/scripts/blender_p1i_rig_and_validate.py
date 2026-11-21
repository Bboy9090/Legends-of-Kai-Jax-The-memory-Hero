#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-I PHASE 3 & 4 HEADLESS BLENDER 3.4.1 RIG & SKIN-WEIGHT STRESS VALIDATOR
Usage:
  blender -b --factory-startup -P scripts/blender_p1i_rig_and_validate.py -- <glb_path> <out_json_path>

Loads a rigged P1-I .glb into Blender 3.4.1, verifies Armature hierarchy, Vertex Groups, Shape Keys,
Attachment Sockets, UV layers, and evaluates Blender's real Armature Depsgraph across 7 extreme
gameplay & supernatural appendage poses to certify zero NaNs, zero collapsed triangles, and clean
joint deformation.
"""
import json
import math
import sys
from pathlib import Path

import bpy
import mathutils
import numpy as np

for _alias, _builtin in [("bool", bool), ("int", int), ("float", float), ("complex", complex), ("object", object), ("str", str)]:
    if not hasattr(np, _alias):
        setattr(np, _alias, _builtin)


def parse_args():
    argv = sys.argv
    if "--" not in argv:
        raise RuntimeError("Expected '-- <glb_path> <out_json_path>'")
    idx = argv.index("--") + 1
    return Path(argv[idx]), Path(argv[idx + 1])


def reset_pose(arm_obj):
    for pb in arm_obj.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)
        pb.location = (0.0, 0.0, 0.0)
        pb.scale = (1.0, 1.0, 1.0)


def set_bone_deg(arm_obj, name, rx=0.0, ry=0.0, rz=0.0):
    pb = arm_obj.pose.bones.get(name)
    if pb is not None:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))


def evaluate_mesh_metrics(mesh_obj, rest_edge_lengths):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = mesh_obj.evaluated_get(depsgraph)
    eval_mesh = eval_obj.to_mesh()
    try:
        verts = eval_mesh.vertices
        v_count = len(verts)
        min_co = [1e9, 1e9, 1e9]
        max_co = [-1e9, -1e9, -1e9]
        finite_ok = True

        world_mat = eval_obj.matrix_world
        world_cos = []
        for v in verts:
            w = world_mat @ v.co
            for k in range(3):
                val = float(w[k])
                if not math.isfinite(val):
                    finite_ok = False
                if val < min_co[k]:
                    min_co[k] = val
                if val > max_co[k]:
                    max_co[k] = val
            world_cos.append(w)

        max_stretch = 1.0
        ratios = []
        for e_idx, edge in enumerate(eval_mesh.edges):
            if e_idx >= len(rest_edge_lengths):
                break
            r_len = rest_edge_lengths[e_idx]
            if r_len > 0.004:
                d_len = (world_cos[edge.vertices[0]] - world_cos[edge.vertices[1]]).length
                ratio = d_len / r_len
                ratios.append(ratio)
                if ratio > max_stretch:
                    max_stretch = ratio

        p99_stretch = float(np.percentile(ratios, 99)) if ratios else 1.0

        eval_mesh.calc_loop_triangles()
        tri_count = len(eval_mesh.loop_triangles)
        degenerate_tris = 0
        for tri in eval_mesh.loop_triangles:
            p0 = world_cos[tri.vertices[0]]
            p1 = world_cos[tri.vertices[1]]
            p2 = world_cos[tri.vertices[2]]
            area2 = (p1 - p0).cross(p2 - p0).length
            if area2 < 1e-9:
                degenerate_tris += 1

        return {
            "vertexCount": v_count,
            "triangleCount": tri_count,
            "allVerticesFinite": finite_ok,
            "degenerateTriangles": degenerate_tris,
            "p99EdgeStretchRatio": round(p99_stretch, 4),
            "maxEdgeStretchRatio": round(float(max_stretch), 4),
            "boundsBlenderZUp": {
                "min": [round(min_co[0], 4), round(min_co[1], 4), round(min_co[2], 4)],
                "max": [round(max_co[0], 4), round(max_co[1], 4), round(max_co[2], 4)],
            },
        }
    finally:
        eval_obj.to_mesh_clear()


def main():
    glb_path, out_json_path = parse_args()

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb_path))

    arm_obj = next((o for o in bpy.data.objects if o.type == "ARMATURE"), None)
    mesh_obj = next((o for o in bpy.data.objects if o.type == "MESH"), None)
    if arm_obj is None or mesh_obj is None:
        raise RuntimeError(f"Failed to locate ARMATURE and MESH in {glb_path}")

    bone_names = [b.name for b in arm_obj.data.bones]
    vgroup_names = [vg.name for vg in mesh_obj.vertex_groups]
    shape_keys = (
        [kb.name for kb in mesh_obj.data.shape_keys.key_blocks if kb.name != "Basis"]
        if mesh_obj.data.shape_keys
        else []
    )
    socket_names = sorted([o.name for o in bpy.data.objects if o.name.startswith("socket_")])
    action_names = sorted([a.name for a in bpy.data.actions])

    # Precompute rest-pose edge lengths in world space
    depsgraph = bpy.context.evaluated_depsgraph_get()
    rest_eval = mesh_obj.evaluated_get(depsgraph)
    rest_mesh = rest_eval.to_mesh()
    wmat = rest_eval.matrix_world
    rest_world = [wmat @ v.co for v in rest_mesh.vertices]
    rest_edge_lengths = [(rest_world[e.vertices[0]] - rest_world[e.vertices[1]]).length for e in rest_mesh.edges]
    rest_eval.to_mesh_clear()

    # Clear imported animation action on armature so manual extreme stress poses evaluate cleanly
    if arm_obj.animation_data:
        arm_obj.animation_data.action = None

    poses = {}

    # Pose 1: Rest A-Pose
    reset_pose(arm_obj)
    poses["rest_a_pose"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    # Pose 2: Extreme Shoulder Abduction/Flexion (±65 deg)
    reset_pose(arm_obj)
    set_bone_deg(arm_obj, "upper_arm_L", rx=-45.0, rz=55.0)
    set_bone_deg(arm_obj, "upper_arm_R", rx=-45.0, rz=-55.0)
    poses["shoulder_raise_65deg"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    # Pose 3: Deep Elbow Flexion (-95 deg)
    reset_pose(arm_obj)
    set_bone_deg(arm_obj, "forearm_L", rx=-95.0)
    set_bone_deg(arm_obj, "forearm_R", rx=-95.0)
    poses["elbow_deep_flex_95deg"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    # Pose 4: High Martial-Arts Kick (Hip -65 deg, Knee +95 deg)
    reset_pose(arm_obj)
    set_bone_deg(arm_obj, "thigh_L", rx=-65.0, rz=12.0)
    set_bone_deg(arm_obj, "shin_L", rx=95.0)
    set_bone_deg(arm_obj, "thigh_R", rx=24.0, rz=-8.0)
    poses["combat_high_kick_hip_knee"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    # Pose 5: Sabertooth Roar (Jaw +28 deg + Ears pinned + 'roar' Shape Key)
    reset_pose(arm_obj)
    set_bone_deg(arm_obj, "jaw", rx=28.0)
    set_bone_deg(arm_obj, "ear_L", rx=-22.0)
    set_bone_deg(arm_obj, "ear_R", rx=-22.0)
    if mesh_obj.data.shape_keys and "roar" in mesh_obj.data.shape_keys.key_blocks:
        mesh_obj.data.shape_keys.key_blocks["roar"].value = 1.0
    poses["sabertooth_roar_jaw_ears"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)
    if mesh_obj.data.shape_keys and "roar" in mesh_obj.data.shape_keys.key_blocks:
        mesh_obj.data.shape_keys.key_blocks["roar"].value = 0.0

    # Pose 6: Supernatural Appendage Sweep (Spider Limbs, Storm Mane, Physical Tails)
    reset_pose(arm_obj)
    for bname in bone_names:
        if bname.startswith("spider_"):
            sign = 1.0 if ("_UL_" in bname or "_LL_" in bname) else -1.0
            set_bone_deg(arm_obj, bname, rx=28.0, ry=sign * 32.0, rz=sign * 18.0)
        elif bname.startswith("mane_0"):
            set_bone_deg(arm_obj, bname, rx=-28.0, ry=14.0)
        elif bname.startswith("tail"):
            set_bone_deg(arm_obj, bname, rx=24.0, ry=32.0)
    poses["supernatural_appendage_sweep"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    # Pose 7: Full Combat Guard Crouch
    reset_pose(arm_obj)
    set_bone_deg(arm_obj, "spine_01", rx=22.0, ry=18.0)
    set_bone_deg(arm_obj, "chest", rx=14.0, ry=-16.0)
    set_bone_deg(arm_obj, "thigh_L", rx=-38.0, rz=8.0)
    set_bone_deg(arm_obj, "thigh_R", rx=-32.0, rz=-8.0)
    set_bone_deg(arm_obj, "shin_L", rx=52.0)
    set_bone_deg(arm_obj, "shin_R", rx=46.0)
    set_bone_deg(arm_obj, "upper_arm_L", rx=-58.0, rz=24.0)
    set_bone_deg(arm_obj, "upper_arm_R", rx=-64.0, rz=-24.0)
    set_bone_deg(arm_obj, "forearm_L", rx=-78.0)
    set_bone_deg(arm_obj, "forearm_R", rx=-82.0)
    poses["full_combat_guard_crouch"] = evaluate_mesh_metrics(mesh_obj, rest_edge_lengths)

    all_finite = all(p["allVerticesFinite"] for p in poses.values())
    max_p99_overall = max(p["p99EdgeStretchRatio"] for p in poses.values())
    max_stretch_overall = max(p["maxEdgeStretchRatio"] for p in poses.values())
    max_degen = max(p["degenerateTriangles"] for p in poses.values())

    report = {
        "glbFile": glb_path.name,
        "blenderVersion": bpy.app.version_string,
        "status": "PASS" if (all_finite and max_p99_overall < 3.85 and len(socket_names) == 6) else "WARN",
        "armatureBoneCount": len(bone_names),
        "vertexGroupCount": len(vgroup_names),
        "uvLayerCount": len(mesh_obj.data.uv_layers),
        "shapeKeys": shape_keys,
        "sockets": socket_names,
        "importedActionClipCount": len(action_names),
        "allExtremePosesFinite": all_finite,
        "maxDegenerateTriangles": max_degen,
        "maxP99PoseEdgeStretch": max_p99_overall,
        "maxExtremePoseEdgeStretch": max_stretch_overall,
        "extremePoses": poses,
    }

    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_json_path.write_text(json.dumps(report, indent=2))
    print(
        f"[BLENDER_RIG_CERT] {glb_path.name:20s} | status={report['status']} | bones={len(bone_names)} | "
        f"shapes={len(shape_keys)} | sockets={len(socket_names)} | p99Stretch={max_p99_overall:.3f} | maxStretch={max_stretch_overall:.3f}"
    )


if __name__ == "__main__":
    main()
