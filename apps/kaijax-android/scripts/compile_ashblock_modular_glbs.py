#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-L: ASHBLOCK HEIGHTS 12-PIECE MODULAR PBR GLB COMPILER
Generates 12 game-ready, UV-unwrapped, PBR-textured binary glTF 2.0 (.glb) assets
directly in Y-up Three.js world-meter coordinates (X=right, Y=up, Z=front/+Z) with:
  - BaseColor + Baked Vertical AO / Brick / Corrugation / Stave Atlas (512x512 PNG)
  - MetallicRoughness + Occlusion Packed Map (512x512 PNG, R=AO, G=Roughness, B=Metallic)
  - Tangent-Space Normal Map (512x512 PNG, brick mortar, corrugated iron ribs, steel rivets)
  - Emissive Map (512x512 PNG, warm shoji/tenement windows, cyan arc coils, neon signs)

Zero external runtime dependencies required (uses Python 3.10 stdlib struct + zlib + hashlib).
"""

import hashlib
import json
import math
import os
import struct
import zlib

OUT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "models", "environments", "ashblock")
)
os.makedirs(OUT_DIR, exist_ok=True)


def clamp_u8(v: float) -> int:
    iv = int(round(v * 255.0))
    return 0 if iv < 0 else (255 if iv > 255 else iv)


def encode_png_rgb(width: int, height: int, rgb_bytes: bytes) -> bytes:
    """Encodes top-to-bottom RGB8 byte buffer into a valid compressed PNG binary."""
    stride = width * 3
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # Filter type 0 (None)
        row_start = y * stride
        raw_rows.extend(rgb_bytes[row_start : row_start + stride])

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type)
        crc = zlib.crc32(data, crc) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), level=9)
    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", idat)
        + png_chunk(b"IEND", b"")
    )


def build_pbr_atlas_pngs():
    """
    Generates 4 aligned 512x512 PNG textures (4x4 tile grid, top-to-bottom glTF V=0..1):
      row 0 (V=0.00..0.25): (0,0) Rust brick     (1,0) Warm ochre stucco  (2,0) Corrugated iron    (3,0) Riveted dark steel
      row 1 (V=0.25..0.50): (0,1) Cedar staves   (1,1) Weathered concrete (2,1) Patchwork awning   (3,1) Syndicate hazard armor
      row 2 (V=0.50..0.75): (0,2) Lit windows    (1,2) Cyan arc coil      (2,2) Storefront neon    (3,2) Slate-teal clapboard
      row 3 (V=0.75..1.00): (0,3) HVAC louvers   (1,3) Rooftop greenery   (2,3) Chain-link cage    (3,3) Warm floodlight lens
    """
    size = 512
    tile_px = size // 4
    base_buf = bytearray(size * size * 3)
    mr_buf = bytearray(size * size * 3)
    norm_buf = bytearray(size * size * 3)
    emis_buf = bytearray(size * size * 3)
    height_field = [0.5] * (size * size)

    tiles = {
        (0, 0): ((0.46, 0.21, 0.15), 0.85, 0.05, (0.0, 0.0, 0.0)),   # Rust brick & mortar
        (1, 0): ((0.60, 0.43, 0.26), 0.80, 0.04, (0.0, 0.0, 0.0)),   # Warm ochre stucco
        (2, 0): ((0.33, 0.23, 0.19), 0.54, 0.68, (0.0, 0.0, 0.0)),   # Corrugated rusted iron
        (3, 0): ((0.16, 0.18, 0.22), 0.42, 0.84, (0.0, 0.0, 0.0)),   # Riveted dark steel
        (0, 1): ((0.37, 0.24, 0.14), 0.76, 0.05, (0.0, 0.0, 0.0)),   # Cedar stave timber
        (1, 1): ((0.39, 0.38, 0.36), 0.88, 0.04, (0.0, 0.0, 0.0)),   # Weathered concrete
        (2, 1): ((0.68, 0.17, 0.15), 0.82, 0.03, (0.0, 0.0, 0.0)),   # Patchwork crimson/teal awning
        (3, 1): ((0.20, 0.19, 0.24), 0.46, 0.78, (0.0, 0.0, 0.0)),   # Syndicate armor + hazard chevron
        (0, 2): ((0.98, 0.70, 0.30), 0.24, 0.12, (0.95, 0.58, 0.18)), # Lit apartment / dojo windows
        (1, 2): ((0.22, 0.85, 0.99), 0.18, 0.28, (0.16, 0.78, 0.99)), # Cyan plasma arc coil
        (2, 2): ((0.94, 0.22, 0.36), 0.28, 0.20, (0.88, 0.18, 0.30)), # Storefront neon sign
        (3, 2): ((0.23, 0.36, 0.41), 0.78, 0.08, (0.0, 0.0, 0.0)),   # Slate-teal painted facade
        (0, 3): ((0.31, 0.34, 0.38), 0.48, 0.76, (0.0, 0.0, 0.0)),   # Galvanized HVAC louvers
        (1, 3): ((0.24, 0.40, 0.20), 0.86, 0.02, (0.0, 0.0, 0.0)),   # Rooftop planter greenery
        (2, 3): ((0.18, 0.20, 0.24), 0.50, 0.72, (0.0, 0.0, 0.0)),   # Chain-link cage mesh
        (3, 3): ((0.99, 0.88, 0.62), 0.20, 0.15, (0.98, 0.82, 0.48)), # Warm tungsten floodlight
    }

    for y in range(size):
        row = min(3, y // tile_px)
        ly = y % tile_px
        # In glTF, V=0 is top of tile, V=1 is bottom of tile
        vy_top_down = ly / float(tile_px - 1)
        ao_v = 0.74 + 0.26 * math.sin((1.0 - vy_top_down * 0.82) * math.pi * 0.65)
        edge_y = 0.84 if (ly < 4 or ly > tile_px - 5) else 1.0

        for x in range(size):
            col = min(3, x // tile_px)
            lx = x % tile_px
            rgb, rough, metal, emis = tiles[(col, row)]
            r, g, b = rgb
            ro = rough
            me = metal
            er, eg, eb = emis
            h_val = 0.5
            edge_x = 0.86 if (lx < 4 or lx > tile_px - 5) else 1.0
            shade = ao_v * edge_x * edge_y

            if (col, row) == (0, 0):
                course = ly // 10
                stagger = (course % 2) * 11
                is_mortar = (ly % 10 == 0) or ((lx + stagger) % 22 == 0)
                if is_mortar:
                    r, g, b = 0.23, 0.20, 0.18
                    ro = 0.95
                    h_val = 0.22
                else:
                    bvar = (((course * 13 + (lx + stagger) // 22 * 7) % 9) - 4) * 0.016
                    r += bvar
                    g += bvar * 0.55
                    h_val = 0.65
            elif (col, row) == (1, 0):
                if ly % 32 < 4:
                    r, g, b = 0.43, 0.37, 0.30
                    ro = 0.90
                    h_val = 0.72
                elif (lx + ly * 2) % 29 == 0:
                    shade *= 0.92
                    h_val = 0.40
            elif (col, row) == (2, 0):
                wave = math.sin(lx * (math.pi * 2.0 / 8.0))
                shade *= 0.84 + 0.22 * wave
                h_val = 0.5 + 0.35 * wave
                if ((lx // 8) * 17 + ly // 16) % 5 == 0:
                    r, g, b = 0.46, 0.23, 0.13
                    ro = 0.78
                    me = 0.35
            elif (col, row) == (3, 0):
                if lx < 7 or lx > tile_px - 8 or ly < 7 or ly > tile_px - 8:
                    shade *= 0.80
                    h_val = 0.35
                    if (lx % 12 < 3) and (ly < 6 or ly > tile_px - 7):
                        shade *= 1.28
                        h_val = 0.88
            elif (col, row) == (0, 1):
                if ly in (24, 25, 26, 98, 99, 100):
                    r, g, b = 0.14, 0.15, 0.18
                    me = 0.84
                    ro = 0.44
                    h_val = 0.80
                elif lx % 11 == 0:
                    shade *= 0.76
                    h_val = 0.28
            elif (col, row) == (1, 1):
                if ly % 28 == 0 or lx % 42 == 0:
                    shade *= 0.82
                    h_val = 0.32
            elif (col, row) == (2, 1):
                stripe = (lx // 16) % 4
                if stripe == 2:
                    r, g, b = 0.17, 0.44, 0.48
                elif stripe == 1:
                    r, g, b = 0.80, 0.40, 0.16
                h_val = 0.5 + 0.15 * math.sin(lx * 0.4)
            elif (col, row) == (3, 1):
                if tile_px - 38 <= ly <= tile_px - 16:
                    if ((lx + ly) // 12) % 2 == 0:
                        r, g, b = 0.85, 0.16, 0.18
                        ro = 0.52
                        h_val = 0.65
                    else:
                        r, g, b = 0.11, 0.11, 0.13
                        h_val = 0.45
            elif (col, row) == (0, 2):
                is_frame = (
                    lx < 10 or lx > tile_px - 11 or ly < 10 or ly > tile_px - 11
                    or abs(lx - tile_px // 2) < 5 or abs(ly - tile_px // 2) < 5
                )
                if is_frame:
                    r, g, b = 0.13, 0.12, 0.15
                    er, eg, eb = 0.0, 0.0, 0.0
                    ro, me = 0.62, 0.48
                    h_val = 0.82
                else:
                    wgrad = 0.82 + 0.18 * (1.0 - vy_top_down)
                    er, eg, eb = er * wgrad, eg * wgrad, eb * wgrad
                    h_val = 0.35
            elif (col, row) == (1, 2):
                if ly % 12 < 4:
                    r, g, b = 0.12, 0.16, 0.22
                    er, eg, eb = 0.02, 0.10, 0.16
                    me = 0.84
                    h_val = 0.78
            elif (col, row) == (2, 2):
                if lx < 8 or lx > tile_px - 9 or ly < 8 or ly > tile_px - 9:
                    r, g, b = 0.10, 0.10, 0.13
                    er, eg, eb = 0.0, 0.0, 0.0
                    h_val = 0.80
                elif 44 <= ly <= 84 and (lx % 18 < 12):
                    r, g, b = 0.99, 0.74, 0.25
                    er, eg, eb = 0.94, 0.65, 0.18
                elif not (24 <= ly <= 104):
                    r, g, b = 0.16, 0.12, 0.19
                    er, eg, eb = 0.10, 0.03, 0.08
            elif (col, row) == (3, 2):
                if ly % 9 == 0:
                    shade *= 0.78
                    h_val = 0.28
                else:
                    h_val = 0.58
            elif (col, row) == (0, 3):
                if 14 < lx < tile_px - 14 and 14 < ly < tile_px - 14 and (ly % 7 < 3):
                    shade *= 0.55
                    h_val = 0.22
            elif (col, row) == (1, 3):
                if vy_top_down > 0.62:
                    r, g, b = 0.56, 0.27, 0.18
                    ro = 0.85
                    h_val = 0.68
                else:
                    leaf = (((lx // 6) * 11 + (ly // 6) * 5) % 7 - 3) * 0.024
                    r, g, b = 0.20 + leaf * 0.5, 0.40 + leaf, 0.18 + leaf * 0.4
                    h_val = 0.45 + leaf * 2.5
            elif (col, row) == (2, 3):
                d1 = (lx + ly) % 14
                d2 = (lx - ly) % 14
                if d1 < 2 or d2 < 2:
                    r, g, b = 0.48, 0.52, 0.58
                    me = 0.86
                    ro = 0.36
                    h_val = 0.78
                else:
                    r, g, b = 0.09, 0.10, 0.13
                    me = 0.18
                    ro = 0.92
                    h_val = 0.25

            pidx = (y * size + x) * 3
            height_field[y * size + x] = h_val
            base_buf[pidx] = clamp_u8(r * shade)
            base_buf[pidx + 1] = clamp_u8(g * shade)
            base_buf[pidx + 2] = clamp_u8(b * shade)

            mr_buf[pidx] = clamp_u8(ao_v)
            mr_buf[pidx + 1] = clamp_u8(ro)
            mr_buf[pidx + 2] = clamp_u8(me)

            emis_buf[pidx] = clamp_u8(er)
            emis_buf[pidx + 1] = clamp_u8(eg)
            emis_buf[pidx + 2] = clamp_u8(eb)

    # Compute tangent-space normal map from height_field within each tile
    strength = 2.2
    for y in range(size):
        row_base = (y // tile_px) * tile_px
        ym = row_base + max(0, (y % tile_px) - 1)
        yp = row_base + min(tile_px - 1, (y % tile_px) + 1)
        for x in range(size):
            col_base = (x // tile_px) * tile_px
            xm = col_base + max(0, (x % tile_px) - 1)
            xp = col_base + min(tile_px - 1, (x % tile_px) + 1)
            dx = (height_field[y * size + xp] - height_field[y * size + xm]) * strength
            dy = (height_field[yp * size + x] - height_field[ym * size + x]) * strength
            nx, ny, nz = -dx, dy, 1.0
            inv = 1.0 / math.sqrt(nx * nx + ny * ny + nz * nz)
            pidx = (y * size + x) * 3
            norm_buf[pidx] = clamp_u8(nx * inv * 0.5 + 0.5)
            norm_buf[pidx + 1] = clamp_u8(ny * inv * 0.5 + 0.5)
            norm_buf[pidx + 2] = clamp_u8(nz * inv * 0.5 + 0.5)

    return (
        encode_png_rgb(size, size, bytes(base_buf)),
        encode_png_rgb(size, size, bytes(mr_buf)),
        encode_png_rgb(size, size, bytes(norm_buf)),
        encode_png_rgb(size, size, bytes(emis_buf)),
    )


class MeshBuilder:
    """Builds clean faceted/smooth Y-up glTF 2.0 triangle geometry with atlas tile UVs."""

    def __init__(self):
        self.positions = []  # list of (x, y, z)
        self.normals = []    # list of (nx, ny, nz)
        self.uvs = []        # list of (u, v)
        self.indices = []    # list of int

    @staticmethod
    def _rot_xyz(pt, rx, ry, rz):
        x, y, z = pt
        if rx != 0.0:
            c, s = math.cos(rx), math.sin(rx)
            y, z = y * c - z * s, y * s + z * c
        if ry != 0.0:
            c, s = math.cos(ry), math.sin(ry)
            x, z = x * c + z * s, -x * s + z * c
        if rz != 0.0:
            c, s = math.cos(rz), math.sin(rz)
            x, y = x * c - y * s, x * s + y * c
        return (x, y, z)

    @staticmethod
    def _tile_uvs(col: int, row: int):
        pad = 0.022
        u0 = (col + pad) * 0.25
        u1 = (col + 1.0 - pad) * 0.25
        v0 = (row + pad) * 0.25
        v1 = (row + 1.0 - pad) * 0.25
        return (u0, v1), (u1, v1), (u1, v0), (u0, v0)

    def add_quad(self, p0, p1, p2, p3, nrm, col: int, row: int):
        uv0, uv1, uv2, uv3 = self._tile_uvs(col, row)
        base = len(self.positions)
        self.positions.extend([p0, p1, p2, p3])
        self.normals.extend([nrm, nrm, nrm, nrm])
        self.uvs.extend([uv0, uv1, uv2, uv3])
        self.indices.extend([base, base + 1, base + 2, base, base + 2, base + 3])

    def add_tri(self, p0, p1, p2, nrm, col: int, row: int):
        uv0, uv1, uv2, _ = self._tile_uvs(col, row)
        base = len(self.positions)
        self.positions.extend([p0, p1, p2])
        self.normals.extend([nrm, nrm, nrm])
        self.uvs.extend([uv0, uv1, uv2])
        self.indices.extend([base, base + 1, base + 2])

    def add_box(self, cx, cy, cz, sx, sy, sz, col: int, row: int, rx=0.0, ry=0.0, rz=0.0):
        hx, hy, hz = sx * 0.5, sy * 0.5, sz * 0.5
        faces = [
            # +Z front
            ((-hx, -hy, hz), (hx, -hy, hz), (hx, hy, hz), (-hx, hy, hz), (0.0, 0.0, 1.0)),
            # -Z back
            ((hx, -hy, -hz), (-hx, -hy, -hz), (-hx, hy, -hz), (hx, hy, -hz), (0.0, 0.0, -1.0)),
            # +X right
            ((hx, -hy, hz), (hx, -hy, -hz), (hx, hy, -hz), (hx, hy, hz), (1.0, 0.0, 0.0)),
            # -X left
            ((-hx, -hy, -hz), (-hx, -hy, hz), (-hx, hy, hz), (-hx, hy, -hz), (-1.0, 0.0, 0.0)),
            # +Y top
            ((-hx, hy, hz), (hx, hy, hz), (hx, hy, -hz), (-hx, hy, -hz), (0.0, 1.0, 0.0)),
            # -Y bottom
            ((-hx, -hy, -hz), (hx, -hy, -hz), (hx, -hy, hz), (-hx, -hy, hz), (0.0, -1.0, 0.0)),
        ]
        for v0, v1, v2, v3, n in faces:
            rv = [self._rot_xyz(v, rx, ry, rz) for v in (v0, v1, v2, v3)]
            tv = [(p[0] + cx, p[1] + cy, p[2] + cz) for p in rv]
            rn = self._rot_xyz(n, rx, ry, rz)
            self.add_quad(tv[0], tv[1], tv[2], tv[3], rn, col, row)

    def add_cylinder_y(self, cx, cy, cz, r_bottom, r_top, height, segments: int, col: int, row: int, rx=0.0, rz=0.0):
        hy = height * 0.5
        for i in range(segments):
            a0 = (i / float(segments)) * math.pi * 2.0
            a1 = ((i + 1) / float(segments)) * math.pi * 2.0
            c0, s0 = math.cos(a0), math.sin(a0)
            c1, s1 = math.cos(a1), math.sin(a1)
            p0 = (c0 * r_bottom, -hy, s0 * r_bottom)
            p1 = (c1 * r_bottom, -hy, s1 * r_bottom)
            p2 = (c1 * r_top, hy, s1 * r_top)
            p3 = (c0 * r_top, hy, s0 * r_top)
            nm = ((c0 + c1) * 0.5, 0.0, (s0 + s1) * 0.5)
            nlen = max(1e-6, math.hypot(nm[0], nm[2]))
            nm = (nm[0] / nlen, 0.0, nm[2] / nlen)

            pts = [self._rot_xyz(p, rx, 0.0, rz) for p in (p0, p1, p2, p3)]
            pts = [(p[0] + cx, p[1] + cy, p[2] + cz) for p in pts]
            rnm = self._rot_xyz(nm, rx, 0.0, rz)
            self.add_quad(pts[0], pts[1], pts[2], pts[3], rnm, col, row)

            # Top & bottom caps
            if r_top > 0.01:
                tc = self._rot_xyz((0.0, hy, 0.0), rx, 0.0, rz)
                tc = (tc[0] + cx, tc[1] + cy, tc[2] + cz)
                tn = self._rot_xyz((0.0, 1.0, 0.0), rx, 0.0, rz)
                self.add_tri(tc, pts[2], pts[3], tn, col, row)
            if r_bottom > 0.01:
                bc = self._rot_xyz((0.0, -hy, 0.0), rx, 0.0, rz)
                bc = (bc[0] + cx, bc[1] + cy, bc[2] + cz)
                bn = self._rot_xyz((0.0, -1.0, 0.0), rx, 0.0, rz)
                self.add_tri(bc, pts[1], pts[0], bn, col, row)


def export_glb(mb: MeshBuilder, asset_id: str, filename: str, png_tuple) -> dict:
    base_png, mr_png, norm_png, emis_png = png_tuple

    v_count = len(mb.positions)
    idx_count = len(mb.indices)
    tri_count = idx_count // 3

    min_x = min(p[0] for p in mb.positions)
    max_x = max(p[0] for p in mb.positions)
    min_y = min(p[1] for p in mb.positions)
    max_y = max(p[1] for p in mb.positions)
    min_z = min(p[2] for p in mb.positions)
    max_z = max(p[2] for p in mb.positions)

    pos_bin = struct.pack(f"<{v_count * 3}f", *(c for p in mb.positions for c in p))
    nrm_bin = struct.pack(f"<{v_count * 3}f", *(c for n in mb.normals for c in n))
    uv_bin = struct.pack(f"<{v_count * 2}f", *(c for u in mb.uvs for c in u))
    idx_bin = struct.pack(f"<{idx_count}H", *mb.indices)

    bin_stream = bytearray()
    buffer_views = []

    def append_view(data: bytes, target=None) -> int:
        while len(bin_stream) % 4 != 0:
            bin_stream.append(0)
        offset = len(bin_stream)
        bin_stream.extend(data)
        bv = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target is not None:
            bv["target"] = target
        buffer_views.append(bv)
        return len(buffer_views) - 1

    bv_pos = append_view(pos_bin, 34962)
    bv_nrm = append_view(nrm_bin, 34962)
    bv_uv = append_view(uv_bin, 34962)
    bv_idx = append_view(idx_bin, 34963)
    bv_base_img = append_view(base_png)
    bv_mr_img = append_view(mr_png)
    bv_norm_img = append_view(norm_png)
    bv_emis_img = append_view(emis_png)

    while len(bin_stream) % 4 != 0:
        bin_stream.append(0)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Kai-Jax P1-L Ashblock Modular PBR GLB Compiler v2.0",
        },
        "scene": 0,
        "scenes": [{"name": asset_id, "nodes": [0]}],
        "nodes": [{"name": asset_id, "mesh": 0}],
        "meshes": [
            {
                "name": f"{asset_id}_Mesh",
                "primitives": [
                    {
                        "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                        "indices": 3,
                        "material": 0,
                    }
                ],
            }
        ],
        "materials": [
            {
                "name": "Ashblock_PBR_Atlas",
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": 0},
                    "metallicRoughnessTexture": {"index": 1},
                    "metallicFactor": 1.0,
                    "roughnessFactor": 1.0,
                },
                "normalTexture": {"index": 2, "scale": 1.0},
                "occlusionTexture": {"index": 1, "strength": 0.9},
                "emissiveTexture": {"index": 3},
                "emissiveFactor": [1.0, 1.0, 1.0],
            }
        ],
        "textures": [
            {"sampler": 0, "source": 0},
            {"sampler": 0, "source": 1},
            {"sampler": 0, "source": 2},
            {"sampler": 0, "source": 3},
        ],
        "samplers": [
            {"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}
        ],
        "images": [
            {"name": "Ashblock_BaseColor", "bufferView": bv_base_img, "mimeType": "image/png"},
            {"name": "Ashblock_MetalRough", "bufferView": bv_mr_img, "mimeType": "image/png"},
            {"name": "Ashblock_Normal", "bufferView": bv_norm_img, "mimeType": "image/png"},
            {"name": "Ashblock_Emissive", "bufferView": bv_emis_img, "mimeType": "image/png"},
        ],
        "accessors": [
            {
                "bufferView": bv_pos,
                "componentType": 5126,
                "count": v_count,
                "type": "VEC3",
                "min": [round(min_x, 5), round(min_y, 5), round(min_z, 5)],
                "max": [round(max_x, 5), round(max_y, 5), round(max_z, 5)],
            },
            {"bufferView": bv_nrm, "componentType": 5126, "count": v_count, "type": "VEC3"},
            {"bufferView": bv_uv, "componentType": 5126, "count": v_count, "type": "VEC2"},
            {"bufferView": bv_idx, "componentType": 5123, "count": idx_count, "type": "SCALAR"},
        ],
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_stream)}],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_stream)
    glb_bytes = (
        struct.pack("<III", 0x46546C67, 2, total_len)
        + struct.pack("<II", len(json_bytes), 0x4E4F534A)
        + json_bytes
        + struct.pack("<II", len(bin_stream), 0x004E4942)
        + bytes(bin_stream)
    )

    out_path = os.path.join(OUT_DIR, filename)
    with open(out_path, "wb") as f:
        f.write(glb_bytes)

    sha256 = hashlib.sha256(glb_bytes).hexdigest()
    return {
        "assetId": asset_id,
        "file": filename,
        "bytes": len(glb_bytes),
        "sha256": sha256,
        "vertexCount": v_count,
        "triangleCount": tri_count,
        "dimensionsMeters": {
            "widthX": round(max_x - min_x, 3),
            "heightY": round(max_y - min_y, 3),
            "depthZ": round(max_z - min_z, 3),
        },
    }


# ---------------------------------------------------------------------------
# 1. Tower Variant A: Rust-Brick Stepped Tenement (front faces +Z)
# ---------------------------------------------------------------------------
def build_tenement_facade(pngs):
    mb = MeshBuilder()
    # Ground-floor concrete plinth (y=0..3.4m, front face at z=+2.5m)
    mb.add_box(0.0, 1.7, 0.0, 10.0, 3.4, 5.0, 1, 1)
    # Main 4-story rust-brick massing + asymmetric warm-ochre wing
    mb.add_box(-0.85, 8.6, -0.1, 8.3, 10.4, 4.8, 0, 0)
    mb.add_box(3.25, 7.6, 0.1, 3.5, 8.4, 4.6, 1, 0)
    # Stepped 5th-story stair bulkhead + cornice ledges
    mb.add_box(-1.6, 15.5, -0.2, 6.2, 3.4, 4.4, 0, 0)
    for y_ledge in (3.42, 7.0, 10.4, 13.8):
        mb.add_box(0.0, y_ledge, 2.52, 10.2, 0.26, 0.36, 1, 1)
    mb.add_box(-1.6, 17.25, 2.05, 6.5, 0.28, 0.38, 1, 1)

    # Rooftop corrugated shanty + laundry drying line (d438c610.png)
    mb.add_box(2.55, 12.85, -0.15, 3.4, 2.1, 2.8, 2, 0)
    mb.add_box(2.55, 14.02, -0.15, 3.8, 0.22, 3.2, 3, 0, rx=0.10)
    for lx in (1.1, 3.9):
        mb.add_box(lx, 12.6, 1.55, 0.10, 1.6, 0.10, 3, 0)
    mb.add_box(2.5, 13.25, 1.55, 3.0, 0.06, 0.06, 3, 0)
    mb.add_box(1.9, 12.92, 1.55, 0.72, 0.56, 0.05, 2, 1)
    mb.add_box(3.0, 12.96, 1.55, 0.62, 0.48, 0.05, 3, 2)

    # Street-level shutters, patchwork awning, and storefront neon sign
    for sx in (-2.6, 2.2):
        mb.add_box(sx, 1.5, 2.54, 2.9, 2.35, 0.16, 3, 0)
    mb.add_box(-2.6, 3.05, 3.18, 3.9, 0.16, 1.35, 2, 1, rx=0.22)
    mb.add_box(2.2, 3.05, 2.75, 3.3, 0.58, 0.28, 2, 2)

    # Lit & shuttered tenement windows + exterior AC condensers
    for floor_i, wy in enumerate((5.1, 8.6, 12.0)):
        for col_i, wx in enumerate((-3.4, -1.0, 1.4, 3.5)):
            if floor_i == 2 and wx > 2.2:
                continue
            lit = (floor_i + col_i) % 2 == 0
            mb.add_box(wx, wy, 2.42, 1.25, 1.65, 0.14, 0 if lit else 3, 2 if lit else 0)
            if (floor_i + col_i) % 3 == 0:
                mb.add_box(wx + 0.75, wy - 0.45, 2.66, 0.62, 0.44, 0.44, 0, 3)

    # Exterior iron fire-escape balconies & diagonal stair stringers
    for idx, by in enumerate((4.2, 7.7, 11.2)):
        bx = -1.8 if idx % 2 == 0 else -0.5
        mb.add_box(bx, by, 3.05, 3.5, 0.14, 1.05, 3, 0)
        mb.add_box(bx, by + 0.46, 3.54, 3.5, 0.82, 0.08, 3, 0)
        if idx < 2:
            mb.add_box(-1.15, by + 1.75, 3.12, 0.52, 3.7, 0.12, 3, 0, rz=0.48 if idx == 0 else -0.48)

    # Cantilevered rooftop crane davit web-anchor arm (tip around z=+4.6m, y=17.9m)
    mb.add_box(-2.2, 17.8, 2.0, 0.32, 1.3, 0.32, 3, 0)
    mb.add_box(-2.2, 18.35, 3.35, 0.28, 0.28, 2.8, 3, 0)
    mb.add_box(-2.2, 17.95, 4.55, 0.26, 0.56, 0.26, 1, 2)
    return export_glb(mb, "ashblock_tenement_facade", "ashblock_tenement_facade.glb", pngs)


# ---------------------------------------------------------------------------
# 2. Tower Variant B: Ochre & Slate-Teal Setback Residence (front faces +Z)
# ---------------------------------------------------------------------------
def build_tenement_corner_setback(pngs):
    mb = MeshBuilder()
    # Ground-floor recessed shopfront colonnade
    mb.add_box(0.0, 1.75, -0.35, 10.2, 3.5, 4.3, 1, 1)
    for px in (-4.4, -1.5, 1.5, 4.4):
        mb.add_box(px, 1.75, 2.25, 0.62, 3.5, 0.68, 1, 1)
    mb.add_box(0.0, 3.58, 2.25, 10.5, 0.38, 0.85, 1, 1)

    # Left wing: 3-story warm ochre cantilevered bay-window massing (top y=13.5m)
    mb.add_box(-2.3, 8.5, 0.0, 5.4, 9.6, 4.8, 1, 0)
    mb.add_box(-2.3, 8.6, 2.58, 2.8, 7.8, 0.72, 1, 0)
    mb.add_box(-2.3, 13.45, 0.0, 5.7, 0.34, 5.1, 1, 1)

    # Right wing: 4-story slate-teal setback clapboard tower (top y=16.4m)
    mb.add_box(2.6, 9.9, -0.25, 4.8, 12.6, 4.5, 3, 2)
    mb.add_box(2.6, 16.35, -0.25, 5.1, 0.34, 4.8, 1, 1)

    # Windows + vertical projecting neon blade sign (f9d37a6e.png)
    for wy in (5.5, 8.6, 11.6):
        mb.add_box(-2.3, wy, 2.96, 1.65, 1.55, 0.12, 0, 2)
        mb.add_box(1.5, wy, 2.04, 1.15, 1.5, 0.12, 0, 2)
        mb.add_box(3.6, wy, 2.04, 1.15, 1.5, 0.12, 3, 0)
    mb.add_box(2.55, 14.5, 2.04, 1.9, 1.45, 0.12, 0, 2)
    mb.add_box(4.85, 7.8, 2.85, 0.22, 4.4, 0.95, 2, 2)

    # Rooftop greenery planters on ochre terrace + twin flues (d438c610.png)
    for gx in (-3.6, -1.1):
        mb.add_box(gx, 14.05, 1.5, 1.65, 0.88, 0.95, 1, 3)
    mb.add_cylinder_y(1.4, 17.3, -0.9, 0.28, 0.26, 1.7, 8, 3, 0)
    mb.add_cylinder_y(3.6, 17.6, 0.8, 0.22, 0.20, 2.3, 8, 2, 0)
    return export_glb(mb, "ashblock_tenement_corner_setback", "ashblock_tenement_corner_setback.glb", pngs)


# ---------------------------------------------------------------------------
# 3. 2-Story Alley & Street Storefront Row (front faces +Z)
# ---------------------------------------------------------------------------
def build_alley_shopfront_row(pngs):
    mb = MeshBuilder()
    mb.add_box(0.0, 1.95, 0.0, 9.0, 3.9, 3.6, 0, 0)
    mb.add_box(0.0, 5.55, -0.25, 8.8, 3.3, 3.1, 1, 0)
    mb.add_box(0.0, 3.92, 1.85, 9.3, 0.24, 0.65, 1, 1)
    mb.add_box(0.0, 7.28, -0.25, 9.1, 0.26, 3.4, 1, 1)

    # Illuminated shop windows, recessed cedar doorway, signboard, and sloped canopy
    mb.add_box(-2.4, 1.75, 1.82, 2.5, 1.9, 0.14, 0, 2)
    mb.add_box(0.2, 1.45, 1.74, 1.35, 2.45, 0.18, 0, 1)
    mb.add_box(2.65, 1.75, 1.82, 2.3, 1.9, 0.14, 2, 2)
    mb.add_box(-0.9, 3.28, 2.02, 6.8, 0.56, 0.28, 2, 2)

    mb.add_box(0.0, 2.75, 2.55, 8.6, 0.16, 1.5, 2, 1, rx=0.22)
    for sx in (-3.8, 0.0, 3.8):
        mb.add_box(sx, 2.35, 2.35, 0.10, 0.10, 1.1, 3, 0, rx=-0.42)

    for wx in (-2.8, 0.0, 2.8):
        mb.add_box(wx, 5.55, 1.32, 1.45, 1.45, 0.12, 0, 2)
    mb.add_box(0.0, 7.72, 1.35, 8.9, 0.65, 0.10, 3, 0)
    return export_glb(mb, "ashblock_alley_shopfront_row", "ashblock_alley_shopfront_row.glb", pngs)


# ---------------------------------------------------------------------------
# 4. Spanning Pratt-Truss Steel Skybridge (X=-18.1..+18.1, deck top at y=+0.12)
# ---------------------------------------------------------------------------
def build_skybridge_truss(pngs):
    mb = MeshBuilder()
    span = 36.2
    width = 3.2
    height = 2.7

    # Walkable steel deck + concrete walkway strip (top surface y = +0.14)
    mb.add_box(0.0, 0.0, 0.0, span, 0.22, width, 3, 0)
    mb.add_box(0.0, 0.12, 0.0, span - 0.4, 0.04, width - 0.45, 1, 1)

    for side in (-1.0, 1.0):
        z_pos = side * (width * 0.47)
        mb.add_box(0.0, height, z_pos, span, 0.18, 0.18, 3, 0)
        mb.add_box(0.0, 1.08, z_pos, span, 0.09, 0.09, 2, 0)
        mb.add_box(0.0, 0.56, z_pos, span, 0.07, 0.07, 2, 0)

    bays = 10
    step = span / bays
    for i in range(bays + 1):
        x = -span * 0.5 + i * step
        for side in (-1.0, 1.0):
            z_pos = side * (width * 0.47)
            mb.add_box(x, height * 0.5, z_pos, 0.16, height, 0.16, 3, 0)
            if i < bays:
                diag_len = math.hypot(step, height)
                ang = math.atan2(height, step) * (1 if i % 2 == 0 else -1)
                mb.add_box(x + step * 0.5, height * 0.5, z_pos, diag_len, 0.10, 0.10, 2, 0, rz=ang)
        mb.add_box(x, height, 0.0, 0.16, 0.16, width, 3, 0)

    # Reinforced underside web-anchor girder collar at local (0, -0.36, 0) + warm cage lamps
    mb.add_box(0.0, -0.24, 0.0, 2.4, 0.30, width + 0.35, 3, 0)
    mb.add_box(0.0, -0.44, 0.0, 0.56, 0.24, 0.56, 1, 2)
    for lx in (-9.0, 0.0, 9.0):
        mb.add_box(lx, height - 0.18, 0.0, 0.38, 0.24, 0.38, 3, 3)

    return export_glb(mb, "ashblock_skybridge_truss", "ashblock_skybridge_truss.glb", pngs)


# ---------------------------------------------------------------------------
# 5. Climbable Multi-Tier Fire-Escape & Catwalk Ascent Tower
# ---------------------------------------------------------------------------
def build_fire_escape_tower(pngs):
    mb = MeshBuilder()
    for cx in (-1.6, 1.6):
        for cz in (-2.8, 2.8):
            mb.add_box(cx, 3.65, cz, 0.20, 7.3, 0.20, 3, 0)

    # Landings aligned to walkable step progression: y=1.8m, 3.65m, 5.35m, 7.05m
    landings = [
        (0.0, 1.80, 1.55, 3.3, 2.6),
        (0.0, 3.65, -1.45, 3.3, 2.8),
        (0.0, 5.35, 1.45, 3.3, 2.8),
        (0.0, 7.05, -1.25, 3.4, 3.2),
    ]
    for lx, ly, lz, sx, sz in landings:
        mb.add_box(lx, ly - 0.09, lz, sx, 0.18, sz, 3, 0)
        mb.add_box(lx, ly + 0.45, lz + (sz * 0.46 if lz > 0 else -sz * 0.46), sx, 0.82, 0.08, 2, 0)

    flights = [
        (-0.75, 0.92, 2.15, -0.54),
        (0.75, 2.72, 0.05, 0.54),
        (-0.75, 4.50, 0.0, -0.52),
        (0.75, 6.20, 0.10, 0.52),
    ]
    for fx, fy, fz, rx in flights:
        mb.add_box(fx, fy, fz, 1.15, 0.14, 3.2, 2, 0, rx=rx)

    mb.add_box(-1.6, 7.48, -2.8, 0.30, 0.32, 0.30, 3, 3)
    return export_glb(mb, "ashblock_fire_escape_tower", "ashblock_fire_escape_tower.glb", pngs)


# ---------------------------------------------------------------------------
# 6. Rooftop Cedar Water Tower & Hoist Davit (d438c610.png & f9d37a6e.png)
# ---------------------------------------------------------------------------
def build_rooftop_watertower(pngs):
    mb = MeshBuilder()
    leg_h = 3.0
    for sx in (-1.05, 1.05):
        for sz in (-1.05, 1.05):
            mb.add_box(sx, leg_h * 0.5, sz, 0.18, leg_h, 0.18, 3, 0)
    mb.add_box(0.0, leg_h, 0.0, 2.75, 0.22, 2.75, 3, 0)
    mb.add_box(0.0, leg_h * 0.5, 1.05, 2.5, 0.10, 0.10, 3, 0, rz=0.68)
    mb.add_box(0.0, leg_h * 0.5, -1.05, 2.5, 0.10, 0.10, 3, 0, rz=-0.68)

    mb.add_cylinder_y(0.0, leg_h + 1.45, 0.0, 1.32, 1.32, 2.65, 12, 0, 1)
    for hy in (leg_h + 0.55, leg_h + 1.45, leg_h + 2.30):
        mb.add_cylinder_y(0.0, hy, 0.0, 1.36, 1.36, 0.10, 12, 3, 0)
    mb.add_cylinder_y(0.0, leg_h + 3.28, 0.0, 1.48, 0.08, 1.05, 12, 2, 0)

    # Inspection ladder + cantilevered hoist davit web-anchor arm (tip at +1.98, y=5.28, z=0)
    mb.add_box(-1.38, leg_h + 1.2, 0.0, 0.08, 3.2, 0.42, 3, 0)
    mb.add_box(1.28, leg_h + 2.55, 0.0, 1.65, 0.18, 0.18, 3, 0)
    mb.add_box(1.98, leg_h + 2.28, 0.0, 0.24, 0.40, 0.24, 1, 2)
    return export_glb(mb, "ashblock_rooftop_watertower", "ashblock_rooftop_watertower.glb", pngs)


# ---------------------------------------------------------------------------
# 7. Rooftop Mechanical HVAC & Radio Mast Cluster (d438c610.png skyline)
# ---------------------------------------------------------------------------
def build_rooftop_mech_cluster(pngs):
    mb = MeshBuilder()
    mb.add_box(0.0, 0.12, 0.0, 4.4, 0.24, 3.2, 1, 1)
    mb.add_box(-0.85, 1.05, 0.0, 2.3, 1.65, 1.8, 0, 3)
    for fx in (-1.4, -0.3):
        mb.add_cylinder_y(fx, 1.95, 0.0, 0.42, 0.42, 0.18, 10, 3, 0)

    mb.add_box(0.95, 1.35, -0.55, 1.4, 0.68, 0.68, 0, 3)
    mb.add_box(1.45, 0.65, -0.55, 0.65, 1.15, 0.68, 0, 3)
    mb.add_box(1.35, 0.85, 0.85, 0.95, 1.3, 0.75, 3, 1)

    mb.add_box(1.35, 3.65, 0.85, 0.22, 4.4, 0.22, 3, 0)
    mb.add_box(1.35, 4.6, 0.85, 1.4, 0.08, 0.08, 3, 0)
    mb.add_box(1.35, 5.3, 0.85, 0.95, 0.08, 0.08, 3, 0)
    mb.add_cylinder_y(1.0, 3.9, 0.85, 0.48, 0.48, 0.14, 10, 1, 1, rz=1.25)
    mb.add_box(1.35, 5.98, 0.85, 0.24, 0.26, 0.24, 2, 2)
    return export_glb(mb, "ashblock_rooftop_mech_cluster", "ashblock_rooftop_mech_cluster.glb", pngs)


# ---------------------------------------------------------------------------
# 8. Boryn's Bloodward Loft Rooftop Dojo (d2fb286b.png, front faces +Z)
# ---------------------------------------------------------------------------
def build_bloodward_dojo(pngs):
    mb = MeshBuilder()
    mb.add_box(0.0, 0.18, 0.0, 9.0, 0.36, 7.2, 0, 1)
    for rx in (-4.35, 4.35):
        mb.add_box(rx, 0.62, 0.0, 0.14, 0.55, 7.0, 3, 0)

    mb.add_box(0.0, 2.15, -0.95, 6.6, 3.6, 4.3, 2, 0)
    for px in (-3.25, 0.0, 3.25):
        mb.add_box(px, 2.15, 1.22, 0.30, 3.6, 0.30, 0, 1)
    for wx in (-1.65, 1.65):
        mb.add_box(wx, 2.25, 1.22, 1.9, 1.65, 0.14, 0, 2)
    mb.add_box(0.0, 1.55, 1.20, 1.2, 2.4, 0.16, 0, 1)

    # Pitched corrugated gable roof + white Beast-Kin emblem ridge
    mb.add_box(-1.85, 4.48, -0.95, 4.1, 0.22, 5.0, 2, 0, rz=0.34)
    mb.add_box(1.85, 4.48, -0.95, 4.1, 0.22, 5.0, 2, 0, rz=-0.34)
    mb.add_box(0.0, 5.18, -0.95, 0.36, 0.26, 5.15, 1, 1)
    mb.add_box(-1.35, 4.66, 0.85, 1.6, 0.08, 1.6, 3, 3, rz=0.34)

    # Twin rope-wrapped makiwara posts + hanging heavy training bag + crimson banners
    for mx in (-2.85, 2.85):
        mb.add_cylinder_y(mx, 1.35, 2.35, 0.22, 0.22, 2.1, 10, 0, 1)
        mb.add_cylinder_y(mx, 1.62, 2.35, 0.25, 0.25, 0.78, 10, 1, 0)
    mb.add_cylinder_y(-3.55, 2.05, -0.8, 0.34, 0.34, 1.55, 10, 2, 1)
    mb.add_box(-3.55, 3.15, -0.8, 0.08, 0.75, 0.08, 3, 0)
    for bx in (-3.6, 3.6):
        mb.add_box(bx, 2.45, 1.35, 0.55, 2.1, 0.06, 2, 1)
    return export_glb(mb, "ashblock_bloodward_dojo", "ashblock_bloodward_dojo.glb", pngs)


# ---------------------------------------------------------------------------
# 9. Fang Syndicate High-Voltage Arc Relay Pylon (Environmental Takedown)
# ---------------------------------------------------------------------------
def build_syndicate_relay(pngs):
    mb = MeshBuilder()
    mb.add_cylinder_y(0.0, 0.22, 0.0, 0.98, 0.92, 0.44, 8, 3, 1)
    mb.add_box(0.0, 1.38, 0.0, 1.12, 1.95, 0.92, 3, 0)
    for rx in (-0.64, 0.64):
        mb.add_box(rx, 1.48, 0.0, 0.16, 2.15, 1.16, 2, 0)
    for cy in (0.95, 1.48, 2.02):
        mb.add_cylinder_y(0.0, cy, 0.0, 0.64, 0.64, 0.18, 12, 1, 2)
    mb.add_cylinder_y(0.0, 2.82, 0.0, 0.10, 0.05, 1.05, 8, 3, 0)
    mb.add_box(0.0, 2.48, 0.0, 1.42, 0.16, 0.16, 1, 2)
    return export_glb(mb, "ashblock_syndicate_relay", "ashblock_syndicate_relay.glb", pngs)


# ---------------------------------------------------------------------------
# 10. Beast-Kin Street Market Awning Stall (front faces +Z)
# ---------------------------------------------------------------------------
def build_market_awning_stall(pngs):
    mb = MeshBuilder()
    for sx in (-1.65, 1.65):
        for sz in (-1.05, 1.05):
            mb.add_box(sx, 1.25, sz, 0.12, 2.5, 0.12, 0, 1)
    mb.add_box(0.0, 0.48, 0.82, 3.2, 0.96, 0.78, 0, 1)
    mb.add_box(-0.85, 0.34, -0.45, 0.92, 0.68, 0.78, 1, 0)
    mb.add_box(0.95, 0.42, -0.35, 0.82, 0.84, 0.82, 2, 0)
    mb.add_box(0.0, 2.58, 0.12, 3.85, 0.14, 2.75, 2, 1, rx=0.20)
    mb.add_box(0.0, 2.15, 1.15, 0.28, 0.34, 0.28, 3, 3)
    return export_glb(mb, "ashblock_market_awning_stall", "ashblock_market_awning_stall.glb", pngs)


# ---------------------------------------------------------------------------
# 11. Fang Syndicate Fortified Alley Gatehouse (e5b27b30.png, front faces +Z)
# ---------------------------------------------------------------------------
def build_syndicate_gatehouse(pngs):
    mb = MeshBuilder()
    for side in (-1.0, 1.0):
        bx = side * 6.5
        mb.add_box(bx, 2.6, 0.0, 5.2, 5.2, 3.6, 3, 1)
        mb.add_box(side * 4.15, 3.4, 1.65, 0.85, 6.8, 0.85, 3, 0)
        mb.add_box(side * 8.2, 4.2, 0.0, 2.2, 3.4, 0.22, 2, 3)
        mb.add_box(side * 5.6, 3.2, 1.88, 0.85, 2.8, 0.08, 2, 1)

    # Walkable overhead guard gantry spanning entire 18.4m width (top at y = 5.20m)
    mb.add_box(0.0, 5.02, 0.0, 18.4, 0.36, 3.4, 3, 0)
    mb.add_box(0.0, 5.68, 1.62, 18.4, 0.96, 0.14, 2, 3)
    mb.add_box(0.0, 5.68, -1.62, 18.4, 0.96, 0.14, 3, 0)

    mb.add_box(0.0, 6.85, 1.72, 8.6, 1.35, 0.44, 2, 2)
    for lx in (-4.15, 4.15):
        mb.add_box(lx, 6.95, 1.95, 0.72, 0.52, 0.48, 3, 3, rx=0.35)
    return export_glb(mb, "ashblock_syndicate_gatehouse", "ashblock_syndicate_gatehouse.glb", pngs)


# ---------------------------------------------------------------------------
# 12. Fang Stronghold Boss Courtyard Backdrop & Floodlight Rig (front faces +Z)
# ---------------------------------------------------------------------------
def build_courtyard_stronghold_arena(pngs):
    mb = MeshBuilder()
    mb.add_box(0.0, 4.8, 0.0, 22.0, 9.6, 4.6, 3, 0)
    mb.add_box(0.0, 11.4, -0.4, 14.6, 3.8, 3.8, 3, 1)

    for bx in (-9.2, -4.6, 4.6, 9.2):
        mb.add_box(bx, 4.6, 2.45, 0.95, 9.2, 1.4, 3, 1, rx=-0.10)

    mb.add_box(0.0, 2.6, 2.35, 6.2, 5.2, 0.38, 2, 3)
    mb.add_box(0.0, 6.15, 2.55, 8.4, 1.55, 0.48, 2, 2)

    mb.add_box(0.0, 7.6, 3.15, 18.4, 0.24, 1.5, 3, 0)
    mb.add_box(0.0, 8.15, 3.85, 18.4, 0.92, 0.12, 2, 3)
    for sx in (-6.8, 6.8):
        mb.add_box(sx, 4.2, 2.55, 1.05, 3.8, 0.08, 2, 1)

    # Cantilevered overhead arena spotlight truss + central web-anchor collar at (0, 11.42, +6.35)
    mb.add_box(0.0, 11.8, 4.85, 12.8, 0.32, 3.6, 3, 0)
    for lx in (-4.8, 0.0, 4.8):
        mb.add_box(lx, 11.55, 6.45, 0.85, 0.55, 0.55, 3, 3, rx=0.42)
    mb.add_box(0.0, 11.42, 6.35, 0.56, 0.36, 0.56, 1, 2)
    return export_glb(
        mb, "ashblock_courtyard_stronghold_arena", "ashblock_courtyard_stronghold_arena.glb", pngs
    )


def main():
    pngs = build_pbr_atlas_pngs()
    items = [
        build_tenement_facade(pngs),
        build_tenement_corner_setback(pngs),
        build_alley_shopfront_row(pngs),
        build_skybridge_truss(pngs),
        build_fire_escape_tower(pngs),
        build_rooftop_watertower(pngs),
        build_rooftop_mech_cluster(pngs),
        build_bloodward_dojo(pngs),
        build_syndicate_relay(pngs),
        build_market_awning_stall(pngs),
        build_syndicate_gatehouse(pngs),
        build_courtyard_stronghold_arena(pngs),
    ]

    total_tris = sum(i["triangleCount"] for i in items)
    total_bytes = sum(i["bytes"] for i in items)
    manifest = {
        "operation": "KAI-JAX P1-L — ASHBLOCK HEIGHTS 12-PIECE MODULAR PBR KIT",
        "pipeline": "Operation Kai-Jax P1-L Y-Up Binary glTF 2.0 PBR + Normal + Baked-AO Compiler",
        "visualAuthoritySheets": [
            "ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png",
            "ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png",
            "ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png",
            "ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png",
        ],
        "pbrMaps": [
            "BaseColor+BakedAO (512x512)",
            "MetallicRoughness+Occlusion (512x512)",
            "TangentSpaceNormal (512x512)",
            "Emissive (512x512)",
        ],
        "runtimeMaterialDeduplicated": True,
        "assetCount": len(items),
        "totalTrianglesPerKitSet": total_tris,
        "totalBytes": total_bytes,
        "assets": items,
    }

    manifest_path = os.path.join(OUT_DIR, "ashblock_kit_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"P1-L ASHBLOCK 12-PIECE MODULAR KIT BUILT: {len(items)} GLBs | {total_tris} tris | {total_bytes:,} bytes")
    for it in items:
        d = it["dimensionsMeters"]
        print(
            f"  {it['file']:42s} {it['triangleCount']:4d} tris | {it['bytes']:8,d} B | "
            f"{d['widthX']}x{d['heightY']}x{d['depthZ']}m"
        )


if __name__ == "__main__":
    main()
