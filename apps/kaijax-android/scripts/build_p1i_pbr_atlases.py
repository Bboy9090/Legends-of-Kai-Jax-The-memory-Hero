#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-I HYBRID ARTWORK-PROJECTED PBR ATLAS COMPILER
Usage:
  python3 scripts/build_p1i_pbr_atlases.py <character_id> <tier:master|lod1> <out_dir>

Builds 4 spec-compliant PNG maps (baseColor.png, orm.png, normal.png, emissive.png) at:
  - 2048x2048 for Master
  - 1024x1024 for Mobile LOD1

Atlas Layout (glTF UV space, V=0 at top):
  - Top-Left  [U: 0.0..0.5, V: 0.0..0.5]: Front Orthographic Artwork Plate (front_dilated.png)
  - Top-Right [U: 0.5..1.0, V: 0.0..0.5]: Rear Orthographic Artwork Plate (back_dilated.png)
  - Bottom    [U: 0.0..1.0, V: 0.5..1.0]: 16 Dedicated Appendage & Parallax Material Tiles (4 cols x 4 rows)
"""
import math
import sys
from pathlib import Path
import numpy as np
from PIL import Image

RECON_ROOT = Path("/app/applet/public/models/reconstruction-sheets")

PALETTES = {
    "kai": {
        "furPrimary": (238, 243, 250),
        "furStripe": (53, 43, 77),
        "furSecondary": (226, 217, 243),
        "eyeLeft": (192, 132, 252),
        "eyeRight": (192, 132, 252),
        "jacketMain": (244, 247, 251),
        "jacketAccent": (91, 33, 182),
        "jacketGlow": (168, 85, 247),
        "innerShirt": (203, 213, 225),
        "pants": (23, 26, 36),
        "sneaker": (248, 250, 252),
        "armorTrim": (245, 158, 11),
        "sash": (109, 40, 217),
    },
    "jax": {
        "furPrimary": (22, 27, 38),
        "furStripe": (11, 14, 21),
        "furSecondary": (38, 49, 71),
        "eyeLeft": (56, 189, 248),
        "eyeRight": (56, 189, 248),
        "jacketMain": (18, 22, 32),
        "jacketAccent": (29, 78, 216),
        "jacketGlow": (56, 189, 248),
        "innerShirt": (26, 34, 52),
        "pants": (20, 24, 34),
        "sneaker": (24, 31, 46),
        "armorTrim": (56, 189, 248),
        "sash": (37, 99, 235),
    },
    "kaijax": {
        "furPrimary": (239, 244, 252),
        "furStripe": (34, 29, 53),
        "furSecondary": (20, 24, 36),
        "eyeLeft": (56, 189, 248),
        "eyeRight": (245, 158, 11),
        "jacketMain": (22, 20, 38),
        "jacketAccent": (109, 40, 217),
        "jacketGlow": (168, 85, 247),
        "innerShirt": (241, 245, 249),
        "pants": (20, 23, 34),
        "sneaker": (28, 23, 48),
        "armorTrim": (212, 175, 55),
        "sash": (248, 250, 252),
    },
    "boryn": {
        "furPrimary": (224, 122, 36),
        "furStripe": (22, 17, 14),
        "furSecondary": (246, 232, 213),
        "eyeLeft": (245, 158, 11),
        "eyeRight": (245, 158, 11),
        "jacketMain": (36, 28, 25),
        "jacketAccent": (70, 50, 37),
        "jacketGlow": (249, 115, 22),
        "innerShirt": (224, 122, 36),
        "pants": (29, 31, 38),
        "sneaker": (44, 34, 28),
        "armorTrim": (198, 142, 69),
        "sash": (202, 90, 24),
    },
    "borax": {
        "furPrimary": (158, 149, 138),
        "furStripe": (87, 80, 73),
        "furSecondary": (230, 237, 247),
        "eyeLeft": (245, 158, 11),
        "eyeRight": (245, 158, 11),
        "jacketMain": (22, 36, 60),
        "jacketAccent": (30, 58, 95),
        "jacketGlow": (56, 189, 248),
        "innerShirt": (244, 241, 234),
        "pants": (18, 29, 48),
        "sneaker": (28, 36, 52),
        "armorTrim": (212, 175, 55),
        "sash": (29, 53, 87),
    },
}


def build_plate_pbr_quadrant(rgb_img: np.ndarray, cid: str, is_back: bool) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Derives crisp BaseColor, ORM, HeightField, and Emissive maps from an orthographic artwork plate."""
    h, w, _ = rgb_img.shape
    rgb = rgb_img.astype(np.float32)

    # On Kai-Jax's rear view, suppress bright orange/cyan/violet 2D tail pixels crossing over the trousers
    # (y in 51%..84% of plate height) so the 3D legs stay clean dark obsidian/purple behind the 3 real 3D tails!
    if cid == "kaijax" and is_back:
        yy = np.linspace(0.0, 1.0, h)[:, None]
        xx = np.linspace(0.0, 1.0, w)[None, :]
        r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        # Bright fiery orange, bright electric cyan, or bright glowing violet tail pixels over trouser band
        is_tail_paint = (
            (yy > 0.50)
            & (yy < 0.86)
            & (xx > 0.30)
            & (xx < 0.70)
            & (
                ((r > 155) & (r - b > 60))
                | ((b > 175) & (g > 110) & (b - r > 55))
                | ((b > 165) & (r > 105) & (b - g > 55))
            )
        )
        trouser_col = np.array([28.0, 26.0, 44.0], dtype=np.float32)
        rgb[is_tail_paint] = rgb[is_tail_paint] * 0.18 + trouser_col * 0.82

    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]
    lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = (max_c - min_c) / np.maximum(1.0, max_c)

    # Gold/Bronze/Silver metallic trim classification
    is_gold = (r > 145) & (g > 105) & (b < 115) & ((r - b) > 48)
    is_silver_hw = (lum > 0.58) & (sat < 0.12) & (cid in ("boryn", "jax"))
    metal = np.where(is_gold, 212.0, np.where(is_silver_hw, 165.0, 18.0))
    rough = np.where(is_gold, 68.0, np.where(lum < 0.18, 168.0, 152.0 - lum * 28.0))
    ao = np.clip(178.0 + lum * 78.0, 145.0, 252.0)

    orm = np.zeros((h, w, 3), dtype=np.uint8)
    orm[:, :, 0] = np.clip(ao, 0, 255).astype(np.uint8)
    orm[:, :, 1] = np.clip(rough, 32, 235).astype(np.uint8)
    orm[:, :, 2] = np.clip(metal, 0, 255).astype(np.uint8)

    # Selective emissive glow on electric cyan storm veins (Jax/Borax) & vibrant violet runes (Kai/Kai-Jax)
    emis = np.zeros((h, w, 3), dtype=np.float32)
    if cid in ("jax", "borax", "kaijax"):
        cyan_glow = (b > 175) & (g > 115) & ((b - r) > 65)
        emis[cyan_glow, 0] = r[cyan_glow] * 0.45
        emis[cyan_glow, 1] = g[cyan_glow] * 0.75
        emis[cyan_glow, 2] = b[cyan_glow] * 0.92
    if cid in ("kai", "kaijax"):
        violet_glow = (b > 160) & (r > 105) & ((b - g) > 55) & (lum > 0.38)
        emis[violet_glow, 0] = r[violet_glow] * 0.55
        emis[violet_glow, 1] = g[violet_glow] * 0.35
        emis[violet_glow, 2] = b[violet_glow] * 0.72

    height_f = 0.5 + (lum - 0.5) * 0.65
    return np.clip(rgb, 0, 255).astype(np.uint8), orm, height_f.astype(np.float32), np.clip(emis, 0, 255).astype(np.uint8)


def build_bottom_material_tiles(cid: str, width: int, half_h: int) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Vectorized synthesis of the 4x4 appendage & parallax material tiles in the bottom half [V: 0.5..1.0]."""
    pal = PALETTES[cid]
    tw = width // 4
    th = half_h // 4

    base = np.zeros((half_h, width, 3), dtype=np.uint8)
    orm = np.zeros((half_h, width, 3), dtype=np.uint8)
    hfield = np.full((half_h, width), 0.5, dtype=np.float32)
    emis = np.zeros((half_h, width, 3), dtype=np.uint8)

    u_grid = (np.arange(tw, dtype=np.float32) + 0.5) / tw
    v_grid = (np.arange(th, dtype=np.float32) + 0.5) / th
    U, V = np.meshgrid(u_grid, v_grid)

    fur_strand = np.cos(U * math.pi * 42.0 + np.sin(V * 20.0) * 2.0) * 0.4 + np.cos(U * math.pi * 88.0 - V * 26.0) * 0.22
    weave = np.cos(U * math.pi * 60.0) * np.sin(V * math.pi * 60.0) * 0.25

    def put_tile(col: int, row: int, b_rgb, ao_v, r_v, m_v, h_v, e_rgb=None):
        y0, y1 = row * th, (row + 1) * th
        x0, x1 = col * tw, (col + 1) * tw
        base[y0:y1, x0:x1] = np.clip(b_rgb, 0, 255).astype(np.uint8)
        orm[y0:y1, x0:x1, 0] = np.clip(ao_v, 0, 255).astype(np.uint8)
        orm[y0:y1, x0:x1, 1] = np.clip(r_v, 0, 255).astype(np.uint8)
        orm[y0:y1, x0:x1, 2] = np.clip(m_v, 0, 255).astype(np.uint8)
        hfield[y0:y1, x0:x1] = h_v
        if e_rgb is not None:
            emis[y0:y1, x0:x1] = np.clip(e_rgb, 0, 255).astype(np.uint8)

    def solid_shaded(c_rgb, wave, amp=18.0):
        arr = np.empty((th, tw, 3), dtype=np.float32)
        arr[:, :, 0] = c_rgb[0] + wave * amp
        arr[:, :, 1] = c_rgb[1] + wave * amp
        arr[:, :, 2] = c_rgb[2] + wave * amp
        return arr

    # Row 0: FUR_PRIMARY [0,0], FUR_SECONDARY [1,0], IVORY_FANG [2,0], EYE_LEFT [3,0]
    f1 = solid_shaded(pal["furPrimary"], fur_strand, 18.0)
    if cid == "boryn":
        st = np.sin(V * math.pi * 10.0 + np.cos(U * math.pi * 6.0) * 0.5) > 0.35
        f1[st] = pal["furStripe"]
    put_tile(0, 0, f1, 226 + fur_strand * 18, 194, 8, 0.5 + fur_strand * 0.35)
    put_tile(1, 0, solid_shaded(pal["furSecondary"], fur_strand, 16.0), 228 + fur_strand * 16, 188, 10, 0.5 + fur_strand * 0.34)

    # IVORY_FANG [2,0]
    root_k = np.clip(1.0 - V * 1.55, 0.0, 1.0)[:, :, None]
    fang_rgb = np.array([250.0, 246.0, 238.0]) * (1.0 - root_k * 0.38) + np.array([182.0, 152.0, 118.0]) * (root_k * 0.38)
    put_tile(2, 0, fang_rgb, 242, 36 + root_k[:, :, 0] * 34, 24, 0.5 + np.cos(U * math.pi * 8.0) * 0.04)

    # Glowing Predator Eyes: EYE_LEFT [3,0] and EYE_RIGHT [3,1]
    for r_idx, ecol in ((0, np.array(pal["eyeLeft"], dtype=np.float32)), (1, np.array(pal["eyeRight"], dtype=np.float32))):
        dx = (U - 0.5) * 2.0
        dy = (V - 0.5) * 2.0
        rad = np.hypot(dx, dy)
        slit = (np.abs(dx) < (0.105 * (1.0 - np.minimum(1.0, np.abs(dy) * 1.18)) + 0.018)) & (np.abs(dy) < 0.64)
        spec_hi = (np.hypot(dx + 0.22, dy + 0.24) < 0.14) | (np.hypot(dx - 0.18, dy - 0.20) < 0.06)
        iris_glow = np.clip(1.0 - rad / 0.88 + np.sin(np.arctan2(dy, dx) * 30.0) * 0.08, 0.0, 1.0)[:, :, None]
        eye_b = ecol * (0.55 + 0.45 * iris_glow) + np.array([255.0, 252.0, 244.0]) * (iris_glow * 0.48)
        eye_e = ecol * (0.50 + 0.45 * iris_glow) + 80.0 * iris_glow
        eye_b[rad >= 0.86] = [14.0, 12.0, 20.0]
        eye_e[rad >= 0.86] = ecol * 0.18
        eye_b[slit] = [10.0, 8.0, 16.0]
        eye_e[slit] = ecol * 0.15
        eye_b[spec_hi] = [255.0, 255.0, 255.0]
        eye_e[spec_hi] = [255.0, 255.0, 255.0]
        put_tile(3, r_idx, eye_b, 250, 14, 12, 0.5, eye_e)

    # Row 1: JACKET_MAIN [0,1], JACKET_ACCENT [1,1], INNER_SHIRT [2,1]
    put_tile(0, 1, solid_shaded(pal["jacketMain"], weave, 14.0), 234, 142, 22, 0.5 + weave * 0.26)
    put_tile(1, 1, solid_shaded(pal["jacketAccent"], weave, 14.0), 234, 148, 28, 0.5 + weave * 0.24)
    put_tile(2, 1, solid_shaded(pal["innerShirt"], weave, 12.0), 236, 168, 14, 0.5 + weave * 0.20)

    # Row 2: PANTS_CARGO [0,2], SNEAKER_BODY [1,2], ARMOR_GOLD [2,2], SASH_TABARD [3,2]
    put_tile(0, 2, solid_shaded(pal["pants"], weave, 12.0), 232, 184, 12, 0.5 + weave * 0.28)
    put_tile(1, 2, solid_shaded(pal["sneaker"], weave, 14.0), 234, 112, 26, 0.5 + weave * 0.22)

    edge_d = np.minimum(np.minimum(U, 1.0 - U), np.minimum(V, 1.0 - V))
    gold_b = solid_shaded(pal["armorTrim"], np.cos(U * math.pi * 60.0) * 0.08, 20.0)
    gold_b[edge_d < 0.09] = gold_b[edge_d < 0.09] * 0.65 + np.array([255.0, 250.0, 224.0]) * 0.35
    put_tile(2, 2, gold_b, 240, 56, 232, 0.5 + (edge_d < 0.09).astype(np.float32) * 0.25)
    put_tile(3, 2, solid_shaded(pal["sash"], weave, 14.0), 234, 144, 24, 0.5 + weave * 0.24)

    # Row 3: SPIDER_CHITIN [0,3], STORM_MANE [1,3], TAIL_EMBER [2,3], TAIL_MEMORY [3,3]
    gold_ring = (np.abs(V - 0.33) < 0.036) | (np.abs(V - 0.67) < 0.034) | (V < 0.055)
    vein = (np.abs(U - 0.5) < 0.068) | (V > 0.88)
    dorsal = (U < 0.22) | (U > 0.78)
    sp_b = np.full((th, tw, 3), [26.0, 24.0, 41.0], dtype=np.float32)
    sp_b[dorsal] = [58.0, 57.0, 82.0]
    sp_b[vein] = [185.0, 103.0, 255.0]
    sp_b[gold_ring] = pal["armorTrim"]
    sp_e = np.zeros((th, tw, 3), dtype=np.float32)
    sp_e[vein & (~gold_ring)] = [196.0, 128.0, 255.0]
    put_tile(
        0,
        3,
        sp_b,
        236,
        np.where(gold_ring, 52, 46),
        np.where(gold_ring, 238, 204),
        0.5 + gold_ring.astype(np.float32) * 0.30 + dorsal.astype(np.float32) * 0.14,
        sp_e,
    )

    # STORM_MANE [1,3]
    t_m = np.power(V, 0.82)[:, :, None]
    arc = np.abs(np.sin(U * math.pi * 8.0 - V * 14.0)) > 0.92
    mane_b = np.array([29.0, 78.0, 216.0]) * (1.0 - t_m) + np.array([125.0, 211.0, 252.0]) * t_m
    mane_b[arc] = [232.0, 248.0, 255.0]
    mane_e = np.array([29.0, 78.0, 216.0]) * 0.55 + np.array([56.0, 189.0, 248.0]) * (t_m * 0.72)
    mane_e[arc] = [186.0, 230.0, 253.0]
    put_tile(1, 3, mane_b, 238, 76, 24, 0.5 + fur_strand * 0.40, mane_e)

    # TAIL_EMBER [2,3] (Kai-Jax fiery Ember tail; Boryn striped tiger tail; Borax silver-tipped lion tail)
    if cid == "kaijax":
        fl = (np.cos(U * math.pi * 10.0 + V * 20.0) * 0.5 + 0.5)[:, :, None]
        tk = np.power(V, 0.72)[:, :, None] * (0.7 + fl * 0.3)
        te_b = np.array([217.0, 70.0, 15.0]) * (1.0 - tk) + np.array([254.0, 240.0, 138.0]) * tk
        te_e = np.array([234.0, 88.0, 12.0]) * 0.65 + np.array([253.0, 224.0, 71.0]) * (tk * 0.55)
        put_tile(2, 3, te_b, 238, 82, 20, 0.5 + fur_strand * 0.36, te_e)
    elif cid == "boryn":
        ring = (np.sin(V * math.pi * 10.0 + np.cos(U * math.pi * 4.0) * 0.35) > 0.12) | (V > 0.88)
        tb = solid_shaded(pal["furPrimary"], fur_strand, 16.0)
        tb[ring] = [22.0, 16.0, 13.0]
        put_tile(2, 3, tb, 228, 192, 8, 0.5 + fur_strand * 0.36)
    else:
        tb = solid_shaded(pal["furPrimary"], fur_strand, 16.0)
        tb[V > 0.72] = solid_shaded(pal["furSecondary"], fur_strand, 16.0)[V > 0.72]
        put_tile(2, 3, tb, 230, 188, 8, 0.5 + fur_strand * 0.36)

    # TAIL_MEMORY [3,3] (u < 0.5 Storm Current cyan-blue tail; u >= 0.5 Memory Weave violet tail)
    lat = (np.abs(np.sin(U * 44.0 + V * 32.0)) > 0.90) | (np.abs(np.sin(U * 44.0 - V * 32.0)) > 0.90)
    tm_k = np.power(V, 0.74)[:, :, None]
    storm_b = np.array([3.0, 105.0, 161.0]) * (1.0 - tm_k) + np.array([125.0, 211.0, 252.0]) * tm_k
    mem_b = np.array([88.0, 28.0, 135.0]) * (1.0 - tm_k) + np.array([216.0, 180.0, 254.0]) * tm_k
    tm_b = np.where((U < 0.5)[:, :, None], storm_b, mem_b)
    tm_b[lat] = np.where((U < 0.5)[:, :, None], [224.0, 242.0, 254.0], [250.0, 232.0, 255.0])[lat]
    tm_e = tm_b * 0.78
    put_tile(3, 3, tm_b, 238, 80, 30, 0.5 + fur_strand * 0.34 + lat.astype(np.float32) * 0.18, tm_e)

    return base, orm, hfield, emis


def height_to_normal_rgb(hfield: np.ndarray, scale: float) -> np.ndarray:
    dx = (np.roll(hfield, -1, axis=1) - np.roll(hfield, 1, axis=1)) * scale
    dy = (np.roll(hfield, -1, axis=0) - np.roll(hfield, 1, axis=0)) * scale
    # Zero gradients along quadrant seams so normal maps never bleed across boundaries
    h, w = hfield.shape
    dx[:, [0, w // 2 - 1, w // 2, w - 1]] = 0.0
    dy[[0, h // 2 - 1, h // 2, h - 1], :] = 0.0
    nx = -dx
    ny = dy
    nz = np.ones_like(hfield)
    inv_len = 1.0 / np.maximum(1e-6, np.sqrt(nx * nx + ny * ny + nz * nz))
    norm = np.empty((h, w, 3), dtype=np.uint8)
    norm[:, :, 0] = np.clip((nx * inv_len * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    norm[:, :, 1] = np.clip((ny * inv_len * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    norm[:, :, 2] = np.clip((nz * inv_len * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    return norm


def main():
    cid = sys.argv[1].lower()
    tier = sys.argv[2].lower()
    out_dir = Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)

    size = 2048 if tier == "master" else 1024
    quad = size // 2

    char_dir = RECON_ROOT / cid
    front_pil = Image.open(char_dir / "front_dilated.png").convert("RGB").resize((quad, quad), Image.Resampling.LANCZOS)
    back_pil = Image.open(char_dir / "back_dilated.png").convert("RGB").resize((quad, quad), Image.Resampling.LANCZOS)

    f_base, f_orm, f_h, f_em = build_plate_pbr_quadrant(np.array(front_pil), cid, is_back=False)
    b_base, b_orm, b_h, b_em = build_plate_pbr_quadrant(np.array(back_pil), cid, is_back=True)
    m_base, m_orm, m_h, m_em = build_bottom_material_tiles(cid, size, quad)

    full_base = np.zeros((size, size, 3), dtype=np.uint8)
    full_orm = np.zeros((size, size, 3), dtype=np.uint8)
    full_h = np.full((size, size), 0.5, dtype=np.float32)
    full_em = np.zeros((size, size, 3), dtype=np.uint8)

    # Top-Left: Front Plate | Top-Right: Rear Plate | Bottom Half: 16 Dedicated Appendage/Parallax Tiles
    full_base[:quad, :quad] = f_base
    full_base[:quad, quad:] = b_base
    full_base[quad:, :] = m_base

    full_orm[:quad, :quad] = f_orm
    full_orm[:quad, quad:] = b_orm
    full_orm[quad:, :] = m_orm

    full_h[:quad, :quad] = f_h
    full_h[:quad, quad:] = b_h
    full_h[quad:, :] = m_h

    full_em[:quad, :quad] = f_em
    full_em[:quad, quad:] = b_em
    full_em[quad:, :] = m_em

    full_norm = height_to_normal_rgb(full_h, scale=2.6 if tier == "master" else 2.1)

    Image.fromarray(full_base, mode="RGB").save(out_dir / f"{cid}_{tier}_baseColor.png", compress_level=6)
    Image.fromarray(full_orm, mode="RGB").save(out_dir / f"{cid}_{tier}_orm.png", compress_level=6)
    Image.fromarray(full_norm, mode="RGB").save(out_dir / f"{cid}_{tier}_normal.png", compress_level=6)
    Image.fromarray(full_em, mode="RGB").save(out_dir / f"{cid}_{tier}_emissive.png", compress_level=6)


if __name__ == "__main__":
    main()
