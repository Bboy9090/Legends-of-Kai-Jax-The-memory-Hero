"""
Blender helper: add/repair canonical Kai-Jax GLB anchors.

What this does:
- Creates or reuses empties named exactly:
  root, spine, head, tail_01..tail_09
- Parents anchors under the first Armature if one exists, otherwise under a root empty.
- Places tail anchors in a readable crescent behind the character.
- Warns about duplicate Blender .001-style names that will break validation.
- Exports a GLB with empties included as nodes.

How to use:
1. Open your Kai-Jax .blend in Blender.
2. Go to Scripting > New.
3. Paste this file and run it, or run from terminal:
   blender your_file.blend --python tools/blender/add_kai_jax_canonical_anchors.py
4. Confirm the console says VALIDATION PASSED.
5. Commit the exported GLB to:
   apps/web/public/models/Meshy_AI_Character_output9TAILSKAIJAX.glb
"""

import bpy
import math
import os
from mathutils import Vector

REQUIRED_ANCHORS = ["root", "spine", "head"] + [f"tail_{i:02d}" for i in range(1, 10)]
EXPORT_RELATIVE_PATH = "apps/web/public/models/Meshy_AI_Character_output9TAILSKAIJAX.glb"


def scene_root_dir():
    if bpy.data.filepath:
        return os.path.dirname(bpy.data.filepath)
    return os.getcwd()


def find_armature():
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    return armatures[0] if armatures else None


def find_object_exact(name):
    return bpy.data.objects.get(name)


def ensure_empty(name, location, parent=None):
    obj = find_object_exact(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        obj.empty_display_type = "PLAIN_AXES"
        obj.empty_display_size = 0.18
        bpy.context.collection.objects.link(obj)
        print(f"[create] {name}")
    else:
        print(f"[reuse]  {name}")
        if obj.name != name:
            obj.name = name
        if obj.type != "EMPTY":
            print(f"[warn] {name} exists but is type={obj.type}; validator only cares node name, but empties are recommended.")

    obj.location = Vector(location)
    obj.rotation_euler = (0.0, 0.0, 0.0)
    obj.scale = (1.0, 1.0, 1.0)

    if parent is not None:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()

    return obj


def apply_transforms_safe(obj):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    except Exception as exc:
        print(f"[warn] could not apply transforms on {obj.name}: {exc}")


def detect_bad_duplicates():
    bad = []
    for obj in bpy.data.objects:
        base = obj.name.split(".")[0]
        if base in REQUIRED_ANCHORS and obj.name != base:
            bad.append(obj.name)
    return bad


def create_anchor_layout(parent):
    # Basic human/beast readable placement. Adjust in Blender after creation if needed.
    root = ensure_empty("root", (0.0, 0.95, 0.0), parent)
    spine = ensure_empty("spine", (0.0, 1.55, 0.0), parent)
    head = ensure_empty("head", (0.0, 2.15, 0.08), parent)

    # Crescent behind the body: x fan, z rear offset, y stagger.
    for i in range(1, 10):
        t = (i - 1) / 8.0
        x = (t - 0.5) * 1.8
        y = 1.05 + math.sin(t * math.pi) * 0.45
        z = -0.55 - abs(t - 0.5) * 0.25
        ensure_empty(f"tail_{i:02d}", (x, y, z), parent)

    return root, spine, head


def validate_scene():
    missing = []
    wrong_suffix = detect_bad_duplicates()
    for name in REQUIRED_ANCHORS:
        if find_object_exact(name) is None:
            missing.append(name)

    print("\n=== Kai-Jax Canonical Anchor Validation ===")
    if missing:
        print("[fail] Missing anchors:", ", ".join(missing))
    else:
        print("[ok] All required anchors exist.")

    if wrong_suffix:
        print("[fail] Duplicate/suffixed anchor-like names found:", ", ".join(wrong_suffix))
        print("       Rename or delete these. Blender .001 suffixes will fail exact CI checks.")
    else:
        print("[ok] No .001-style anchor duplicates detected.")

    for name in REQUIRED_ANCHORS:
        obj = find_object_exact(name)
        if obj:
            p = obj.parent.name if obj.parent else "<none>"
            print(f"  {name:8s} type={obj.type:8s} parent={p:20s} loc=({obj.location.x:.3f}, {obj.location.y:.3f}, {obj.location.z:.3f})")

    return not missing and not wrong_suffix


def export_glb():
    root_dir = scene_root_dir()
    # If the .blend is inside repo, this lands correctly. Otherwise it lands beside the .blend in the same relative path.
    export_path = os.path.join(root_dir, EXPORT_RELATIVE_PATH)
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    print(f"\n[export] Writing GLB to: {export_path}")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_animations=True,
    )
    print("[export] Done.")
    return export_path


def main():
    print("=== Kai-Jax canonical anchor repair/export ===")
    armature = find_armature()
    if armature:
        print(f"[parent] Using armature parent: {armature.name}")
        apply_transforms_safe(armature)
        parent = armature
    else:
        print("[parent] No armature found; using/creating root empty as top parent.")
        parent = None

    create_anchor_layout(parent)

    ok = validate_scene()
    if not ok:
        raise SystemExit("VALIDATION FAILED inside Blender. Fix names before export.")

    export_path = export_glb()
    print("\nVALIDATION PASSED inside Blender.")
    print(f"Exported: {export_path}")
    print("Next: run `node apps/web/scripts/validate-registry.mjs` from the repo root.")


if __name__ == "__main__":
    main()
