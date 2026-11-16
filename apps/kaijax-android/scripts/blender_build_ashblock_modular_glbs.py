#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-L: ASHBLOCK HEIGHTS 12-PIECE MODULAR PBR GLB KIT GENERATOR
Generates 12 game-ready, UV-unwrapped, baked-AO PBR binary glTF 2.0 (.glb) architectural
and interactive combat/traversal assets in public/models/environments/ashblock/.

Visual Library Controlling References:
  1. ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png (Ashblock Heights District)
  2. ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png (Bloodward Loft Sanctuary)
  3. ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png (The Raging City Street/Viaduct)
  4. ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png (Fang Syndicate Stronghold)
"""

import json
import math
import os
import bmesh
import bpy

OUT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "models", "environments", "ashblock")
)
os.makedirs(OUT_DIR, exist_ok=True)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def clamp01(v: float) -> float:
    return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


def build_pbr_atlas_images():
    """
    Creates a 4x4 tiled 512x512 PBR atlas (BaseColor with baked mortar/rib/AO gradients,
    MetallicRoughness, and Emissive) so all 12 modular GLBs share a single compact texture
    layout (~35-50 KB compressed per GLB, deduplicated to 1 GPU material in WorldBuilder).

    Tile layout (col, row) from bottom-left (0..3, 0..3):
      (0,0) Rust-brick & mortar       (1,0) Warm ochre stucco       (2,0) Corrugated rust iron    (3,0) Riveted dark steel
      (0,1) Aged cedar stave wood     (1,1) Weathered concrete      (2,1) Crimson/teal awning     (3,1) Syndicate hazard armor
      (0,2) Warm lit window mullions  (1,2) Thryxen cyan arc coil   (2,2) Neon storefront sign    (3,2) Slate-teal clapboard
      (0,3) Galvanized HVAC louvers   (1,3) Rooftop shrub planter   (2,3) Chain-link cage mesh    (3,3) Warm floodlight lens
    """
    size = 512
    tile_px = size // 4
    base_img = bpy.data.images.new("Ashblock_BaseColor", width=size, height=size, alpha=False)
    mr_img = bpy.data.images.new("Ashblock_MetalRough", width=size, height=size, alpha=False)
    mr_img.colorspace_settings.name = "Non-Color"
    emis_img = bpy.data.images.new("Ashblock_Emissive", width=size, height=size, alpha=False)

    tiles = {
        (0, 0): ((0.44, 0.21, 0.15), 0.86, 0.05, (0.0, 0.0, 0.0)),   # Rust brick
        (1, 0): ((0.58, 0.42, 0.25), 0.82, 0.04, (0.0, 0.0, 0.0)),   # Warm ochre stucco
        (2, 0): ((0.31, 0.22, 0.19), 0.56, 0.68, (0.0, 0.0, 0.0)),   # Corrugated rusted iron
        (3, 0): ((0.15, 0.17, 0.21), 0.44, 0.84, (0.0, 0.0, 0.0)),   # Riveted structural steel
        (0, 1): ((0.35, 0.23, 0.14), 0.78, 0.05, (0.0, 0.0, 0.0)),   # Cedar stave timber
        (1, 1): ((0.37, 0.36, 0.35), 0.90, 0.04, (0.0, 0.0, 0.0)),   # Weathered concrete
        (2, 1): ((0.64, 0.16, 0.14), 0.84, 0.03, (0.0, 0.0, 0.0)),   # Patchwork market awning
        (3, 1): ((0.20, 0.18, 0.22), 0.48, 0.76, (0.0, 0.0, 0.0)),   # Syndicate armor + hazard trim
        (0, 2): ((0.96, 0.68, 0.28), 0.26, 0.10, (0.94, 0.56, 0.18)), # Lit window panes
        (1, 2): ((0.20, 0.82, 0.98), 0.20, 0.25, (0.14, 0.76, 0.98)), # Cyan arc coil
        (2, 2): ((0.92, 0.20, 0.34), 0.30, 0.18, (0.86, 0.16, 0.28)), # Storefront neon sign
        (3, 2): ((0.22, 0.34, 0.39), 0.79, 0.08, (0.0, 0.0, 0.0)),   # Slate-teal painted facade
        (0, 3): ((0.30, 0.33, 0.36), 0.50, 0.74, (0.0, 0.0, 0.0)),   # Galvanized HVAC louvers
        (1, 3): ((0.24, 0.36, 0.19), 0.88, 0.02, (0.0, 0.0, 0.0)),   # Rooftop greenery + planter
        (2, 3): ((0.18, 0.20, 0.24), 0.52, 0.70, (0.0, 0.0, 0.0)),   # Chain-link cage mesh
        (3, 3): ((0.99, 0.86, 0.58), 0.22, 0.12, (0.98, 0.80, 0.44)), # Warm floodlight emitter
    }

    base_px = [1.0] * (size * size * 4)
    mr_px = [1.0] * (size * size * 4)
    emis_px = [0.0, 0.0, 0.0, 1.0] * (size * size)

    for y in range(size):
        row = min(3, y // tile_px)
        ly = y % tile_px
        vy = ly / float(tile_px - 1)
        # Baked vertical ambient-occlusion & damp-base gradient
        ao_v = 0.76 + 0.24 * math.sin(vy * math.pi * 0.85)
        edge_y = 0.84 if (ly < 4 or ly > tile_px - 5) else 1.0

        for x in range(size):
            col = min(3, x // tile_px)
            lx = x % tile_px
            vx = lx / float(tile_px - 1)
            rgb, rough, metal, emis = tiles[(col, row)]

            r, g, b = rgb
            ro = rough
            me = metal
            er, eg, eb = emis
            edge_x = 0.86 if (lx < 4 or lx > tile_px - 5) else 1.0
            shade = ao_v * edge_x * edge_y

            if (col, row) == (0, 0):
                # Staggered brick courses + mortar lines
                course = ly // 10
                stagger = (course % 2) * 11
                is_mortar = (ly % 10 == 0) or ((lx + stagger) % 22 == 0)
                if is_mortar:
                    r, g, b = 0.24, 0.21, 0.19
                    ro = 0.95
                else:
                    brick_var = (((course * 13 + (lx + stagger) // 22 * 7) % 9) - 4) * 0.015
                    r += brick_var
                    g += brick_var * 0.6
            elif (col, row) == (1, 0):
                # Ochre plaster with floor-slab cornice bands
                if ly % 32 < 4:
                    r, g, b = 0.42, 0.36, 0.29
                    ro = 0.90
                elif (lx + ly * 2) % 29 == 0:
                    shade *= 0.93
            elif (col, row) == (2, 0):
                # Corrugated iron ribs + rust streaks
                rib = 0.82 + 0.24 * math.sin(lx * (math.pi * 2.0 / 8.0))
                shade *= rib
                if ((lx // 8) * 17 + ly // 16) % 5 == 0:
                    r, g, b = 0.45, 0.23, 0.13
                    ro = 0.78
                    me = 0.35
            elif (col, row) == (3, 0):
                # Structural steel plate seams & rivets
                if lx < 7 or lx > tile_px - 8 or ly < 7 or ly > tile_px - 8:
                    shade *= 0.80
                    if (lx % 12 < 3) and (ly < 6 or ly > tile_px - 7):
                        shade *= 1.25
            elif (col, row) == (0, 1):
                # Cedar wood staves + iron barrel hoops
                if ly in (22, 23, 24, 98, 99, 100):
                    r, g, b = 0.14, 0.15, 0.17
                    me = 0.82
                    ro = 0.46
                elif lx % 11 == 0:
                    shade *= 0.78
            elif (col, row) == (2, 1):
                # Patchwork crimson / burnt-amber / teal market awning stripes
                stripe = (lx // 16) % 4
                if stripe == 2:
                    r, g, b = 0.17, 0.42, 0.46
                elif stripe == 1:
                    r, g, b = 0.76, 0.38, 0.15
                if ly % 16 == 0:
                    shade *= 0.85
            elif (col, row) == (3, 1):
                # Fang Syndicate dark armor + crimson & amber hazard band
                if 14 <= ly <= 34:
                    if ((lx + ly) // 12) % 2 == 0:
                        r, g, b = 0.82, 0.16, 0.18
                        ro = 0.55
                    else:
                        r, g, b = 0.12, 0.12, 0.14
            elif (col, row) == (0, 2):
                # Mullioned apartment / shoji window frame (dark mullions, glowing warm panes)
                is_frame = (
                    lx < 10 or lx > tile_px - 11 or ly < 10 or ly > tile_px - 11
                    or abs(lx - tile_px // 2) < 5 or abs(ly - tile_px // 2) < 5
                )
                if is_frame:
                    r, g, b = 0.13, 0.12, 0.14
                    er, eg, eb = 0.0, 0.0, 0.0
                    ro, me = 0.65, 0.45
                else:
                    warm_grad = 0.85 + 0.15 * vy
                    er, eg, eb = er * warm_grad, eg * warm_grad, eb * warm_grad
            elif (col, row) == (1, 2):
                # High-voltage coil ribs
                if ly % 12 < 4:
                    r, g, b = 0.12, 0.16, 0.22
                    er, eg, eb = 0.02, 0.10, 0.16
                    me = 0.82
            elif (col, row) == (2, 2):
                # Storefront signboard with border & glowing neon bars
                if lx < 8 or lx > tile_px - 9 or ly < 8 or ly > tile_px - 9:
                    r, g, b = 0.10, 0.10, 0.13
                    er, eg, eb = 0.0, 0.0, 0.0
                elif 44 <= ly <= 84 and (lx % 18 < 12):
                    r, g, b = 0.98, 0.72, 0.24
                    er, eg, eb = 0.92, 0.62, 0.16
                elif not (24 <= ly <= 104):
                    r, g, b = 0.16, 0.12, 0.18
                    er, eg, eb = 0.08, 0.03, 0.06
            elif (col, row) == (3, 2):
                # Slate-teal clapboard siding
                if ly % 9 == 0:
                    shade *= 0.80
            elif (col, row) == (0, 3):
                # Galvanized HVAC louvers
                if 16 < lx < tile_px - 16 and 16 < ly < tile_px - 16 and (ly % 7 < 3):
                    shade *= 0.58
            elif (col, row) == (1, 3):
                # Terracotta planter base + green rooftop foliage top
                if vy < 0.36:
                    r, g, b = 0.54, 0.26, 0.17
                    ro = 0.85
                else:
                    leaf = (((lx // 6) * 11 + (ly // 6) * 5) % 7 - 3) * 0.022
                    r, g, b = 0.20 + leaf * 0.5, 0.38 + leaf, 0.17 + leaf * 0.4
            elif (col, row) == (2, 3):
                # Diamond chain-link cage over dark backing
                d1 = (lx + ly) % 14
                d2 = (lx - ly) % 14
                if d1 < 2 or d2 < 2:
                    r, g, b = 0.46, 0.50, 0.55
                    me = 0.85
                    ro = 0.38
                else:
                    r, g, b = 0.09, 0.10, 0.13
                    me = 0.20
                    ro = 0.92

            idx = (y * size + x) * 4
            base_px[idx] = clamp01(r * shade)
            base_px[idx + 1] = clamp01(g * shade)
            base_px[idx + 2] = clamp01(b * shade)
            base_px[idx + 3] = 1.0

            # glTF 2.0 MetallicRoughness packing: R=AO, G=Roughness, B=Metallic
            mr_px[idx] = clamp01(ao_v)
            mr_px[idx + 1] = clamp01(ro)
            mr_px[idx + 2] = clamp01(me)
            mr_px[idx + 3] = 1.0

            emis_px[idx] = clamp01(er)
            emis_px[idx + 1] = clamp01(eg)
            emis_px[idx + 2] = clamp01(eb)
            emis_px[idx + 3] = 1.0

    base_img.pixels.foreach_set(base_px)
    base_img.pack()
    mr_img.pixels.foreach_set(mr_px)
    mr_img.pack()
    emis_img.pixels.foreach_set(emis_px)
    emis_img.pack()
    return base_img, mr_img, emis_img


def create_atlas_material(base_img, mr_img, emis_img):
    mat = bpy.data.materials.new(name="Ashblock_PBR_Atlas")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out_node = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])

    tex_base = nt.nodes.new("ShaderNodeTexImage")
    tex_base.image = base_img
    nt.links.new(tex_base.outputs["Color"], bsdf.inputs["Base Color"])

    tex_mr = nt.nodes.new("ShaderNodeTexImage")
    tex_mr.image = mr_img
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(tex_mr.outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
    nt.links.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])

    tex_emis = nt.nodes.new("ShaderNodeTexImage")
    tex_emis.image = emis_img
    if "Emission Color" in bsdf.inputs:
        nt.links.new(tex_emis.outputs["Color"], bsdf.inputs["Emission Color"])
    elif "Emission" in bsdf.inputs:
        nt.links.new(tex_emis.outputs["Color"], bsdf.inputs["Emission"])
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = 1.55

    return mat


def map_bm_faces_to_tile(bm, faces, col: int, row: int):
    uv_layer = bm.loops.layers.uv.verify()
    pad = 0.018
    u0 = (col + pad) * 0.25
    u1 = (col + 1.0 - pad) * 0.25
    v0 = (row + pad) * 0.25
    v1 = (row + 1.0 - pad) * 0.25
    uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
    for f in faces:
        for i, loop in enumerate(f.loops):
            loop[uv_layer].uv = uvs[i % 4]


def add_box(bm, cx, cy, cz, sx, sy, sz, tile_col, tile_row, rot_x=0.0, rot_y=0.0, rot_z=0.0):
    ret = bmesh.ops.create_cube(bm, size=1.0)
    verts = ret["verts"]
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=verts)
    if rot_x != 0.0:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=math_rot_x(rot_x), verts=verts)
    if rot_y != 0.0:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=math_rot_y(rot_y), verts=verts)
    if rot_z != 0.0:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=math_rot_z(rot_z), verts=verts)
    bmesh.ops.translate(bm, vec=(cx, cy, cz), verts=verts)
    faces = list({f for v in verts for f in v.link_faces})
    map_bm_faces_to_tile(bm, faces, tile_col, tile_row)


def add_cylinder(bm, cx, cy, cz, radius, depth, segments, tile_col, tile_row, rot_x=0.0, rot_y=0.0):
    ret = bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=True,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
    )
    verts = ret["verts"]
    if rot_x != 0.0:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=math_rot_x(rot_x), verts=verts)
    if rot_y != 0.0:
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=math_rot_y(rot_y), verts=verts)
    bmesh.ops.translate(bm, vec=(cx, cy, cz), verts=verts)
    faces = list({f for v in verts for f in v.link_faces})
    map_bm_faces_to_tile(bm, faces, tile_col, tile_row)


def math_rot_x(angle):
    import mathutils
    return mathutils.Matrix.Rotation(angle, 3, "X")


def math_rot_y(angle):
    import mathutils
    return mathutils.Matrix.Rotation(angle, 3, "Y")


def math_rot_z(angle):
    import mathutils
    return mathutils.Matrix.Rotation(angle, 3, "Z")


def finalize_and_export(bm, obj_name: str, filename: str, mat) -> dict:
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    mesh = bpy.data.meshes.new(obj_name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    mesh.materials.append(mat)
    obj = bpy.data.objects.new(obj_name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    out_path = os.path.join(OUT_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )

    tris = len(mesh.polygons)
    verts = len(mesh.vertices)
    size_bytes = os.path.getsize(out_path)
    bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.meshes.remove(mesh, do_unlink=True)
    return {
        "id": obj_name,
        "file": filename,
        "triangles": tris,
        "triangleCount": tris,
        "vertices": verts,
        "bytes": size_bytes,
    }


# ---------------------------------------------------------------------------
# 1. Tower Variant A: Rust-Brick Stepped Tenement (d438c610.png)
# ---------------------------------------------------------------------------
def build_tenement_facade(mat):
    bm = bmesh.new()
    # Ground-floor concrete plinth + rust-brick lower 3 stories + stepped upper 2 stories
    add_box(bm, 0.0, 0.0, 1.6, 10.0, 5.0, 3.2, 1, 1)
    add_box(bm, -0.8, 0.0, 8.2, 8.4, 4.8, 10.0, 0, 0)
    add_box(bm, 3.2, 0.15, 7.2, 3.4, 4.5, 8.0, 1, 0)
    # Offset upper 5th-story stair/elevator penthouse + cornice ledges
    add_box(bm, -1.6, -0.1, 14.8, 6.2, 4.4, 3.4, 0, 0)
    for z_ledge in (3.25, 6.8, 10.2, 13.2):
        add_box(bm, 0.0, 2.52, z_ledge, 10.2, 0.34, 0.24, 1, 1)
    add_box(bm, -1.6, 2.22, 16.55, 6.5, 0.36, 0.26, 1, 1)

    # Rooftop corrugated shanty + laundry drying rack (d438c610.png)
    add_box(bm, 2.5, -0.2, 12.25, 3.4, 2.8, 2.1, 2, 0)
    add_box(bm, 2.5, -0.2, 13.45, 3.8, 3.2, 0.24, 3, 0, rot_x=0.10)
    for lx in (0.9, 3.9):
        add_box(bm, lx, 1.5, 12.0, 0.10, 0.10, 1.6, 3, 0)
    add_box(bm, 2.4, 1.5, 12.65, 3.1, 0.06, 0.06, 3, 0)
    add_box(bm, 1.8, 1.5, 12.35, 0.7, 0.05, 0.55, 2, 1)
    add_box(bm, 2.9, 1.5, 12.38, 0.6, 0.05, 0.48, 3, 2)

    # Storefront shutters & patchwork canopy at street level
    for sx in (-2.6, 2.2):
        add_box(bm, sx, 2.52, 1.45, 2.9, 0.16, 2.3, 3, 0)
    add_box(bm, -2.6, 3.15, 2.95, 3.8, 1.35, 0.18, 2, 1, rot_x=0.22)
    add_box(bm, 2.2, 2.75, 2.95, 3.2, 0.32, 0.58, 2, 2)

    # Apartment windows (warm lit vs dark shutters) + AC condenser boxes
    for floor_i, z_win in enumerate((4.9, 8.3, 11.6)):
        for col_i, wx in enumerate((-3.4, -1.0, 1.4, 3.5)):
            if floor_i == 2 and wx > 2.2:
                continue
            lit = (floor_i + col_i) % 2 == 0
            add_box(bm, wx, 2.45, z_win, 1.25, 0.14, 1.65, 0 if lit else 3, 2 if lit else 0)
            if (floor_i + col_i) % 3 == 0:
                add_box(bm, wx + 0.75, 2.68, z_win - 0.45, 0.62, 0.44, 0.44, 0, 3)

    # Exterior iron fire-escape balconies & angled stair runs
    for idx, z_bal in enumerate((4.1, 7.5, 10.9)):
        bx = -1.8 if idx % 2 == 0 else -0.6
        add_box(bm, bx, 3.05, z_bal, 3.4, 1.05, 0.14, 3, 0)
        add_box(bm, bx, 3.54, z_bal + 0.46, 3.4, 0.08, 0.82, 3, 0)
        if idx < 2:
            add_box(bm, -1.2, 3.12, z_bal + 1.7, 0.55, 0.12, 3.6, 3, 0, rot_y=0.52 if idx == 0 else -0.52)

    # Cantilevered rooftop crane davit arm (validated web-anchor support)
    add_box(bm, -2.2, 2.4, 17.1, 0.32, 0.32, 1.3, 3, 0)
    add_box(bm, -2.2, 3.55, 17.65, 0.28, 2.6, 0.28, 3, 0)
    add_box(bm, -2.2, 4.65, 17.32, 0.26, 0.26, 0.55, 1, 2)
    return finalize_and_export(bm, "AshblockTenementFacade", "ashblock_tenement_facade.glb", mat)


# ---------------------------------------------------------------------------
# 2. Tower Variant B: Ochre & Slate-Teal Setback Residence (d438c610.png)
# ---------------------------------------------------------------------------
def build_tenement_corner_setback(mat):
    bm = bmesh.new()
    # Ground-floor colonnade arcade
    add_box(bm, 0.0, -0.35, 1.75, 10.2, 4.3, 3.5, 1, 1)
    for px in (-4.4, -1.5, 1.5, 4.4):
        add_box(bm, px, 2.25, 1.75, 0.62, 0.68, 3.5, 1, 1)
    add_box(bm, 0.0, 2.25, 3.55, 10.5, 0.85, 0.38, 1, 1)

    # Left wing: 3-story warm ochre bay-window projection (max Z = 13.4m)
    add_box(bm, -2.3, 0.0, 8.4, 5.4, 4.8, 9.6, 1, 0)
    add_box(bm, -2.3, 2.58, 8.5, 2.8, 0.72, 7.8, 1, 0)
    add_box(bm, -2.3, 0.0, 13.35, 5.7, 5.1, 0.34, 1, 1)

    # Right wing: 4-story slate-teal setback clapboard tower (max Z = 16.2m)
    add_box(bm, 2.6, -0.25, 9.8, 4.8, 4.5, 12.6, 3, 2)
    add_box(bm, 2.6, -0.25, 16.25, 5.1, 4.8, 0.34, 1, 1)

    # Windows + vertical neon blade sign ("IRON" / "ECHOES" motif from f9d37a6e.png)
    for z_w in (5.4, 8.5, 11.5):
        add_box(bm, -2.3, 2.96, z_w, 1.65, 0.12, 1.55, 0, 2)
        add_box(bm, 1.5, 2.04, z_w, 1.15, 0.12, 1.5, 0, 2)
        add_box(bm, 3.6, 2.04, z_w, 1.15, 0.12, 1.5, 3, 0)
    add_box(bm, 2.55, 2.04, 14.4, 1.9, 0.12, 1.45, 0, 2)
    add_box(bm, 4.85, 2.85, 7.6, 0.22, 0.95, 4.4, 2, 2)

    # Rooftop greenery planters on ochre terrace + twin brick/metal flues (d438c610.png)
    for gx in (-3.6, -1.1):
        add_box(bm, gx, 1.5, 13.92, 1.65, 0.95, 0.85, 1, 3)
    add_cylinder(bm, 1.4, -1.0, 17.2, 0.28, 1.7, 8, 3, 0)
    add_cylinder(bm, 3.6, 0.8, 17.5, 0.22, 2.3, 8, 2, 0)
    return finalize_and_export(
        bm, "AshblockTenementCornerSetback", "ashblock_tenement_corner_setback.glb", mat
    )


# ---------------------------------------------------------------------------
# 3. 2-Story Alley & Street Storefront Row (f9d37a6e.png)
# ---------------------------------------------------------------------------
def build_alley_shopfront_row(mat):
    bm = bmesh.new()
    # Lower storefront block + recessed doorway + upper workshop loft (top at 7.2m)
    add_box(bm, 0.0, 0.0, 1.95, 9.0, 3.6, 3.9, 0, 0)
    add_box(bm, 0.0, -0.25, 5.55, 8.8, 3.1, 3.3, 1, 0)
    add_box(bm, 0.0, 1.85, 3.92, 9.3, 0.65, 0.24, 1, 1)
    add_box(bm, 0.0, -0.25, 7.28, 9.1, 3.4, 0.26, 1, 1)

    # Illuminated Beast-Kin shop display windows, doorway & rolled shutter hood
    add_box(bm, -2.4, 1.82, 1.75, 2.5, 0.14, 1.9, 0, 2)
    add_box(bm, 0.2, 1.74, 1.45, 1.35, 0.18, 2.45, 0, 1)
    add_box(bm, 2.65, 1.82, 1.75, 2.3, 0.14, 1.9, 2, 2)
    add_box(bm, -0.9, 2.02, 3.25, 6.8, 0.28, 0.56, 2, 2)

    # Patchwork sloped corrugated awning + support struts
    add_box(bm, 0.0, 2.55, 2.75, 8.6, 1.5, 0.16, 2, 1, rot_x=0.24)
    for sx in (-3.8, 0.0, 3.8):
        add_box(bm, sx, 2.35, 2.35, 0.10, 1.1, 0.10, 3, 0, rot_x=-0.45)

    # Upper workshop windows + rooftop parapet rail
    for wx in (-2.8, 0.0, 2.8):
        add_box(bm, wx, 1.32, 5.55, 1.45, 0.12, 1.45, 0, 2)
    add_box(bm, 0.0, 1.35, 7.72, 8.9, 0.10, 0.65, 3, 0)
    return finalize_and_export(bm, "AshblockAlleyShopfrontRow", "ashblock_alley_shopfront_row.glb", mat)


# ---------------------------------------------------------------------------
# 4. Spanning Pratt-Truss Steel Skybridge (d438c610.png & f9d37a6e.png)
# ---------------------------------------------------------------------------
def build_skybridge_truss(mat):
    bm = bmesh.new()
    span = 28.0
    width = 3.1
    height = 2.6

    # Walkable steel deck (top at z = +0.11 in Blender -> y = +0.11 in Three.js)
    add_box(bm, 0.0, 0.0, 0.0, span, width, 0.22, 3, 0)
    add_box(bm, 0.0, 0.0, 0.13, span - 0.4, width - 0.45, 0.05, 1, 1)

    # Top chords & safety handrails
    for side in (-1.0, 1.0):
        y_pos = side * (width * 0.47)
        add_box(bm, 0.0, y_pos, height, span, 0.18, 0.18, 3, 0)
        add_box(bm, 0.0, y_pos, 1.05, span, 0.09, 0.09, 2, 0)
        add_box(bm, 0.0, y_pos, 0.55, span, 0.07, 0.07, 2, 0)

    # Vertical posts, overhead crossbeams, and diagonal Pratt-truss braces
    bays = 8
    step = span / bays
    for i in range(bays + 1):
        x = -span * 0.5 + i * step
        for side in (-1.0, 1.0):
            y_pos = side * (width * 0.47)
            add_box(bm, x, y_pos, height * 0.5, 0.16, 0.16, height, 3, 0)
            if i < bays:
                diag_len = math.hypot(step, height)
                ang = math.atan2(height, step) * (1 if i % 2 == 0 else -1)
                add_box(bm, x + step * 0.5, y_pos, height * 0.5, diag_len, 0.10, 0.10, 2, 0, rot_y=ang)
        add_box(bm, x, 0.0, height, 0.16, width, 0.16, 3, 0)

    # Underside central web-anchor girder collar + warm utility cage lanterns
    add_box(bm, 0.0, 0.0, -0.24, 2.2, width + 0.35, 0.30, 3, 0)
    add_box(bm, 0.0, 0.0, -0.44, 0.52, 0.52, 0.22, 1, 2)
    for lx in (-7.0, 0.0, 7.0):
        add_box(bm, lx, 0.0, height - 0.18, 0.36, 0.36, 0.24, 3, 3)

    return finalize_and_export(bm, "AshblockSkybridgeTruss", "ashblock_skybridge_truss.glb", mat)


# ---------------------------------------------------------------------------
# 5. Climbable Multi-Tier Fire-Escape & Catwalk Tower
# ---------------------------------------------------------------------------
def build_fire_escape_tower(mat):
    bm = bmesh.new()
    # 4 corner steel H-columns up to 7.2m
    for cx in (-1.55, 1.55):
        for cy in (-2.75, 2.75):
            add_box(bm, cx, cy, 3.65, 0.20, 0.20, 7.3, 3, 0)

    # Stepped grated landings matching walkable gameplay step heights (1.8m, 3.65m, 5.35m, 7.05m)
    landings = [
        (0.0, 1.55, 1.80, 3.3, 2.6),
        (0.0, -1.45, 3.65, 3.3, 2.8),
        (0.0, 1.45, 5.35, 3.3, 2.8),
        (0.0, -1.25, 7.05, 3.4, 3.2),
    ]
    for lx, ly, lz, sx, sy in landings:
        add_box(bm, lx, ly, lz - 0.09, sx, sy, 0.18, 3, 0)
        add_box(bm, lx, ly, lz + 0.45, sx, 0.08, 0.82, 2, 0)

    # Diagonal stair flights connecting tiers
    flights = [
        (-0.7, 2.2, 0.92, -0.56),
        (0.7, 0.05, 2.72, 0.54),
        (-0.7, 0.0, 4.50, -0.52),
        (0.7, 0.1, 6.20, 0.52),
    ]
    for fx, fy, fz, rx in flights:
        add_box(bm, fx, fy, fz, 1.15, 3.2, 0.14, 2, 0, rot_x=rx)

    # Warm safety beacon at top landing
    add_box(bm, -1.55, -2.75, 7.45, 0.30, 0.30, 0.32, 3, 3)
    return finalize_and_export(bm, "AshblockFireEscapeTower", "ashblock_fire_escape_tower.glb", mat)


# ---------------------------------------------------------------------------
# 6. Rooftop Cedar Water Tower & Hoist Davit (d438c610.png & f9d37a6e.png)
# ---------------------------------------------------------------------------
def build_rooftop_watertower(mat):
    bm = bmesh.new()
    leg_h = 3.0
    for sx in (-1.05, 1.05):
        for sy in (-1.05, 1.05):
            add_box(bm, sx, sy, leg_h * 0.5, 0.18, 0.18, leg_h, 3, 0)
    add_box(bm, 0.0, 0.0, leg_h, 2.75, 2.75, 0.22, 3, 0)
    add_box(bm, 0.0, 1.05, leg_h * 0.5, 2.5, 0.10, 0.10, 3, 0, rot_y=0.68)
    add_box(bm, 0.0, -1.05, leg_h * 0.5, 2.5, 0.10, 0.10, 3, 0, rot_y=-0.68)

    # Cedar barrel staves + iron tension hoops + conical metal roof
    add_cylinder(bm, 0.0, 0.0, leg_h + 1.45, 1.32, 2.65, 12, 0, 1)
    for hz in (leg_h + 0.55, leg_h + 1.45, leg_h + 2.30):
        add_cylinder(bm, 0.0, 0.0, hz, 1.36, 0.10, 12, 3, 0)
    cone_ret = bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=True, segments=12, radius1=1.48, radius2=0.08, depth=1.05
    )
    bmesh.ops.translate(bm, vec=(0.0, 0.0, leg_h + 3.28), verts=cone_ret["verts"])
    map_bm_faces_to_tile(bm, list({f for v in cone_ret["verts"] for f in v.link_faces}), 2, 0)

    # Inspection ladder + cantilevered hoist davit web-anchor arm
    add_box(bm, -1.38, 0.0, leg_h + 1.2, 0.08, 0.42, 3.2, 3, 0)
    add_box(bm, 1.28, 0.0, leg_h + 2.55, 1.65, 0.18, 0.18, 3, 0)
    add_box(bm, 1.98, 0.0, leg_h + 2.28, 0.24, 0.24, 0.40, 1, 2)
    return finalize_and_export(bm, "AshblockRooftopWatertower", "ashblock_rooftop_watertower.glb", mat)


# ---------------------------------------------------------------------------
# 7. Rooftop Mechanical HVAC & Radio Mast Cluster (d438c610.png skyline)
# ---------------------------------------------------------------------------
def build_rooftop_mech_cluster(mat):
    bm = bmesh.new()
    # Concrete equipment pad + twin louvered HVAC chiller cabinet
    add_box(bm, 0.0, 0.0, 0.12, 4.4, 3.2, 0.24, 1, 1)
    add_box(bm, -0.85, 0.0, 1.05, 2.3, 1.8, 1.65, 0, 3)
    for fx in (-1.4, -0.3):
        add_cylinder(bm, fx, 0.0, 1.95, 0.42, 0.18, 10, 3, 0)

    # Sheet-metal L-ductwork + transformer junction cabinet
    add_box(bm, 0.95, -0.55, 1.35, 1.4, 0.68, 0.68, 0, 3)
    add_box(bm, 1.45, -0.55, 0.65, 0.65, 0.68, 1.15, 0, 3)
    add_box(bm, 1.35, 0.85, 0.85, 0.95, 0.75, 1.3, 3, 1)

    # Lattice radio antenna spire + communications dish + red warning beacon
    add_box(bm, 1.35, 0.85, 3.65, 0.22, 0.22, 4.4, 3, 0)
    add_box(bm, 1.35, 0.85, 4.6, 1.4, 0.08, 0.08, 3, 0)
    add_box(bm, 1.35, 0.85, 5.3, 0.95, 0.08, 0.08, 3, 0)
    add_cylinder(bm, 1.0, 0.85, 3.9, 0.48, 0.14, 10, 1, 1, rot_y=1.25)
    add_box(bm, 1.35, 0.85, 5.98, 0.24, 0.24, 0.26, 2, 2)
    return finalize_and_export(bm, "AshblockRooftopMechCluster", "ashblock_rooftop_mech_cluster.glb", mat)


# ---------------------------------------------------------------------------
# 8. Boryn's Bloodward Loft Rooftop Dojo (d2fb286b.png)
# ---------------------------------------------------------------------------
def build_bloodward_dojo(mat):
    bm = bmesh.new()
    # Elevated cedar sparring deck + low perimeter rail
    add_box(bm, 0.0, 0.0, 0.18, 9.0, 7.2, 0.36, 0, 1)
    for rx in (-4.35, 4.35):
        add_box(bm, rx, 0.0, 0.62, 0.14, 7.0, 0.55, 3, 0)

    # Dojo sanctuary cabin (corrugated rusted walls + warm shoji industrial windows)
    add_box(bm, 0.0, -0.95, 2.15, 6.6, 4.3, 3.6, 2, 0)
    for px in (-3.25, 0.0, 3.25):
        add_box(bm, px, 1.22, 2.15, 0.30, 0.30, 3.6, 0, 1)
    for wx in (-1.65, 1.65):
        add_box(bm, wx, 1.22, 2.25, 1.9, 0.14, 1.65, 0, 2)
    add_box(bm, 0.0, 1.20, 1.55, 1.2, 0.16, 2.4, 0, 1)

    # Pitched corrugated gable roof + white Beast-Kin emblem ridge bar (d2fb286b.png)
    add_box(bm, -1.85, -0.95, 4.48, 4.1, 5.0, 0.22, 2, 0, rot_y=0.34)
    add_box(bm, 1.85, -0.95, 4.48, 4.1, 5.0, 0.22, 2, 0, rot_y=-0.34)
    add_box(bm, 0.0, -0.95, 5.18, 0.36, 5.15, 0.26, 1, 1)
    add_box(bm, -1.35, 0.85, 4.65, 1.6, 1.6, 0.08, 3, 3, rot_y=0.34)

    # Twin rope-wrapped makiwara posts + hanging heavy training bag + crimson banners
    for mx in (-2.85, 2.85):
        add_cylinder(bm, mx, 2.35, 1.35, 0.22, 2.1, 10, 0, 1)
        add_cylinder(bm, mx, 2.35, 1.62, 0.25, 0.78, 10, 1, 0)
    add_cylinder(bm, -3.55, -0.8, 2.05, 0.34, 1.55, 10, 2, 1)
    add_box(bm, -3.55, -0.8, 3.15, 0.08, 0.08, 0.75, 3, 0)
    for bx in (-3.6, 3.6):
        add_box(bm, bx, 1.35, 2.45, 0.55, 0.06, 2.1, 2, 1)
    return finalize_and_export(bm, "AshblockBloodwardDojo", "ashblock_bloodward_dojo.glb", mat)


# ---------------------------------------------------------------------------
# 9. Fang Syndicate High-Voltage Arc Relay Pylon (Environmental Takedown)
# ---------------------------------------------------------------------------
def build_syndicate_relay(mat):
    bm = bmesh.new()
    add_cylinder(bm, 0.0, 0.0, 0.22, 0.98, 0.44, 8, 3, 1)
    add_box(bm, 0.0, 0.0, 1.38, 1.12, 0.92, 1.95, 3, 0)
    for rx in (-0.64, 0.64):
        add_box(bm, rx, 0.0, 1.48, 0.16, 1.16, 2.15, 2, 0)
    for cz in (0.95, 1.48, 2.02):
        add_cylinder(bm, 0.0, 0.0, cz, 0.64, 0.18, 12, 1, 2)
    add_cylinder(bm, 0.0, 0.0, 2.82, 0.10, 1.05, 8, 3, 0)
    add_box(bm, 0.0, 0.0, 2.48, 1.42, 0.16, 0.16, 1, 2)
    return finalize_and_export(bm, "AshblockSyndicateRelay", "ashblock_syndicate_relay.glb", mat)


# ---------------------------------------------------------------------------
# 10. Beast-Kin Street Market Awning Stall (d438c610.png & f9d37a6e.png)
# ---------------------------------------------------------------------------
def build_market_awning_stall(mat):
    bm = bmesh.new()
    for sx in (-1.65, 1.65):
        for sy in (-1.05, 1.05):
            add_box(bm, sx, sy, 1.25, 0.12, 0.12, 2.5, 0, 1)
    add_box(bm, 0.0, 0.82, 0.48, 3.2, 0.78, 0.96, 0, 1)
    add_box(bm, -0.85, -0.45, 0.34, 0.92, 0.78, 0.68, 1, 0)
    add_box(bm, 0.95, -0.35, 0.42, 0.82, 0.82, 0.84, 2, 0)
    add_box(bm, 0.0, 0.12, 2.58, 3.85, 2.75, 0.14, 2, 1, rot_x=0.20)
    add_box(bm, 0.0, 1.15, 2.15, 0.28, 0.28, 0.34, 3, 3)
    return finalize_and_export(bm, "AshblockMarketAwningStall", "ashblock_market_awning_stall.glb", mat)


# ---------------------------------------------------------------------------
# 11. Fang Syndicate Fortified Alley Gatehouse (e5b27b30.png)
# ---------------------------------------------------------------------------
def build_syndicate_gatehouse(mat):
    bm = bmesh.new()
    # Heavy flanking riveted steel blast bunkers leaving 7.6m central breach portal
    for side in (-1.0, 1.0):
        bx = side * 6.4
        add_box(bm, bx, 0.0, 2.6, 5.2, 3.6, 5.2, 3, 1)
        add_box(bm, side * 4.15, 1.65, 3.4, 0.85, 0.85, 6.8, 3, 0)
        # Chain-link outer security wing + crimson Syndicate banner
        add_box(bm, side * 8.2, 0.0, 4.2, 2.2, 0.22, 3.4, 2, 3)
        add_box(bm, side * 5.6, 1.88, 3.2, 0.85, 0.08, 2.8, 2, 1)

    # Walkable overhead guard gantry spanning entire 18m width (top at z = 5.20m!)
    add_box(bm, 0.0, 0.0, 5.02, 18.2, 3.4, 0.36, 3, 0)
    add_box(bm, 0.0, 1.62, 5.68, 18.2, 0.14, 0.96, 2, 3)
    add_box(bm, 0.0, -1.62, 5.68, 18.2, 0.14, 0.96, 3, 0)

    # Overhead Fang Syndicate neon header arch + twin floodlight pods
    add_box(bm, 0.0, 1.72, 6.85, 8.6, 0.44, 1.35, 2, 2)
    for lx in (-4.15, 4.15):
        add_box(bm, lx, 1.95, 6.95, 0.72, 0.48, 0.52, 3, 3, rot_x=0.35)
    return finalize_and_export(bm, "AshblockSyndicateGatehouse", "ashblock_syndicate_gatehouse.glb", mat)


# ---------------------------------------------------------------------------
# 12. Fang Stronghold Boss Courtyard Backdrop & Floodlight Rig (e5b27b30.png)
# ---------------------------------------------------------------------------
def build_courtyard_stronghold_arena(mat):
    bm = bmesh.new()
    # Monumental tiered Stronghold command bunker wall (width 22m, height 13.6m)
    add_box(bm, 0.0, 0.0, 4.8, 22.0, 4.6, 9.6, 3, 0)
    add_box(bm, 0.0, -0.4, 11.4, 14.6, 3.8, 3.8, 3, 1)

    # Angled armored buttress ribs
    for bx in (-9.2, -4.6, 4.6, 9.2):
        add_box(bm, bx, 2.45, 4.6, 0.95, 1.4, 9.2, 3, 1, rot_x=-0.10)

    # Recessed Stronghold blast portal + crimson neon header ("FANG SYNDICATE")
    add_box(bm, 0.0, 2.25, 2.6, 6.2, 0.38, 5.2, 2, 3)
    add_box(bm, 0.0, 2.55, 6.15, 8.4, 0.48, 1.55, 2, 2)

    # Elevated lookout catwalks + chain-link arena panels + crimson banners
    add_box(bm, 0.0, 3.15, 7.6, 18.4, 1.5, 0.24, 3, 0)
    add_box(bm, 0.0, 3.85, 8.15, 18.4, 0.12, 0.92, 2, 3)
    for sx in (-6.8, 6.8):
        add_box(bm, sx, 2.55, 4.2, 1.05, 0.08, 3.8, 2, 1)

    # Cantilevered overhead arena spotlight truss + central web-anchor collar
    add_box(bm, 0.0, 4.85, 11.8, 12.8, 3.6, 0.32, 3, 0)
    for lx in (-4.8, 0.0, 4.8):
        add_box(bm, lx, 6.45, 11.55, 0.85, 0.55, 0.55, 3, 3, rot_x=0.42)
    add_box(bm, 0.0, 6.35, 11.42, 0.56, 0.56, 0.36, 1, 2)
    return finalize_and_export(
        bm, "AshblockCourtyardStrongholdArena", "ashblock_courtyard_stronghold_arena.glb", mat
    )


def main():
    clear_scene()
    base_img, mr_img, emis_img = build_pbr_atlas_images()
    mat = create_atlas_material(base_img, mr_img, emis_img)

    manifest_items = [
        build_tenement_facade(mat),
        build_tenement_corner_setback(mat),
        build_alley_shopfront_row(mat),
        build_skybridge_truss(mat),
        build_fire_escape_tower(mat),
        build_rooftop_watertower(mat),
        build_rooftop_mech_cluster(mat),
        build_bloodward_dojo(mat),
        build_syndicate_relay(mat),
        build_market_awning_stall(mat),
        build_syndicate_gatehouse(mat),
        build_courtyard_stronghold_arena(mat),
    ]

    total_tris = sum(i["triangles"] for i in manifest_items)
    total_bytes = sum(i["bytes"] for i in manifest_items)

    manifest = {
        "district": "ashblock-heights",
        "pipeline": "Operation Kai-Jax P1-L Blender 3.4.1 Modular PBR GLB Kit (12 Assets)",
        "controllingSheets": [
            "ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png",
            "ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png",
            "ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png",
            "ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png",
        ],
        "pbrAtlas": {
            "resolution": "512x512",
            "maps": ["BaseColor+BakedAO", "MetallicRoughness", "Emissive"],
            "runtimeDeduplicated": True,
        },
        "totalUniqueTriangles": total_tris,
        "totalBytes": total_bytes,
        "assets": manifest_items,
    }
    manifest_path = os.path.join(OUT_DIR, "ashblock_kit_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("P1-L ASHBLOCK 12-ASSET MODULAR GLB KIT COMPLETE:")
    print(f"  TOTAL UNIQUE TRIS: {total_tris} | TOTAL BYTES: {total_bytes:,}")
    for item in manifest_items:
        print(f"  {item['file']}: {item['triangles']} tris | {item['bytes']:,} bytes")


if __name__ == "__main__":
    main()
