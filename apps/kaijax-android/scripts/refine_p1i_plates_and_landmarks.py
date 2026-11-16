#!/usr/bin/env python3
"""
Refines the Phase 1 1024x1024 RGBA orthographic plates & computes Silhouette-Conforming Row Spans:
  1. Removes faint neutral-grey studio floor shadows beneath the boots/sneakers (y > 790).
  2. Isolates the primary central character connected component.
  3. Strips outer anti-aliased white/grey studio-sheet card halo pixels (5px erosion + border halo filter)
     so background edge dilation carries ONLY pure interior fur/leather/garment pigment (zero white halo!).
  4. Computes 128-row horizontal interior silhouette spans (`frontSpans128`, `backSpans128`) in
     `public/models/reconstruction-sheets/manifest.json` so every 3D limb, mane, sleeve, and trouser leg
     maps strictly onto interior artwork pixels!
"""
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

OUT_ROOT = Path("/app/applet/public/models/reconstruction-sheets")
MANIFEST_PATH = OUT_ROOT / "manifest.json"


def keep_central_component(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    ds = 2
    sm = mask[::ds, ::ds]
    sh, sw = sm.shape
    svis = np.zeros_like(sm, dtype=bool)
    kept_small = np.zeros_like(sm, dtype=bool)

    comps = []
    for y in range(sh):
        for x in range(sw):
            if sm[y, x] and not svis[y, x]:
                q = deque([(y, x)])
                svis[y, x] = True
                pts = []
                min_x, max_x = x, x
                min_y, max_y = y, y
                while q:
                    cy, cx = q.popleft()
                    pts.append((cy, cx))
                    if cx < min_x:
                        min_x = cx
                    if cx > max_x:
                        max_x = cx
                    if cy < min_y:
                        min_y = cy
                    if cy > max_y:
                        max_y = cy
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            if dy == 0 and dx == 0:
                                continue
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < sh and 0 <= nx < sw and sm[ny, nx] and not svis[ny, nx]:
                                svis[ny, nx] = True
                                q.append((ny, nx))
                comps.append((len(pts), min_x, max_x, min_y, max_y, pts))

    if not comps:
        return mask

    comps.sort(key=lambda c: c[0], reverse=True)
    _, mx0, mx1, _, _, main_pts = comps[0]
    for cy, cx in main_pts:
        kept_small[cy, cx] = True

    for clen, x0, x1, y0, _, pts in comps[1:]:
        touches_side_margin = (x1 >= int(sw * 0.76) or x0 <= int(sw * 0.24)) and y0 > int(sh * 0.65)
        if not touches_side_margin and clen > 25 and x0 >= mx0 - 6 and x1 <= mx1 + 6:
            for cy, cx in pts:
                kept_small[cy, cx] = True

    up = np.repeat(np.repeat(kept_small, ds, axis=0), ds, axis=1)[:h, :w]
    return mask & up


def erode_mask(mask: np.ndarray, steps: int) -> np.ndarray:
    cur = mask.copy()
    for _ in range(steps):
        nxt = (
            cur
            & np.roll(cur, 1, axis=0)
            & np.roll(cur, -1, axis=0)
            & np.roll(cur, 1, axis=1)
            & np.roll(cur, -1, axis=1)
        )
        nxt[0, :] = False
        nxt[-1, :] = False
        nxt[:, 0] = False
        nxt[:, -1] = False
        if nxt.sum() < 800:
            break
        cur = nxt
    return cur


def compute_clean_interior_mask(cid: str, rgba: np.ndarray) -> np.ndarray:
    """Builds a 5px-eroded interior mask free of bright neutral studio-card edge halos."""
    h, w, _ = rgba.shape
    raw_fg = rgba[:, :, 3] > 215
    eroded_5 = erode_mask(raw_fg, 5)
    deep_12 = erode_mask(raw_fg, 12)
    border_ring = eroded_5 & (~deep_12)

    r = rgba[:, :, 0].astype(np.float32)
    g = rgba[:, :, 1].astype(np.float32)
    b = rgba[:, :, 2].astype(np.float32)
    lum = (r + g + b) / 3.0
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    yy = np.arange(h)[:, None]

    # Strip bright white/grey card-border pixels in the outer 5..12px ring on dark garments/fur
    if cid in ("jax", "boryn"):
        card_halo = border_ring & (lum > 180.0) & (sat < 30.0)
    elif cid == "borax":
        # Borax has silver-white lion head/mane at y < 270, dark indigo kimono/boots below y >= 270
        card_halo = border_ring & (((yy >= 270) & (lum > 180.0) & (sat < 30.0)) | ((yy < 270) & (lum > 236.0) & (sat < 14.0)))
    else:
        # Kai & Kai-Jax have white fur/jackets on upper body, dark trousers at y in [545..865]
        card_halo = border_ring & (((yy >= 545) & (yy <= 865) & (lum > 175.0) & (sat < 28.0)) | (lum > 244.0) & (sat < 10.0))

    clean = eroded_5 & (~card_halo)
    return clean if clean.sum() > 800 else eroded_5


def dilate_rgb_into_transparent(cid: str, rgba: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Flood-fills all non-interior pixels strictly from halo-free interior character pigment."""
    h, w, _ = rgba.shape
    valid = compute_clean_interior_mask(cid, rgba)
    rgb = np.where(valid[:, :, None], rgba[:, :, :3].astype(np.float32), 0.0)

    # Multi-scale pyramid: 128x128 full-canvas flood (160 steps fills 100% of 128x128!), then 14 crisp full-res border steps
    small_img = Image.fromarray(
        np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (valid.astype(np.uint8) * 255)]),
        mode="RGBA",
    ).resize((128, 128), Image.Resampling.NEAREST)
    sm = np.array(small_img)
    s_rgb = sm[:, :, :3].astype(np.float32)
    s_val = sm[:, :, 3] > 128
    for _ in range(160):
        inv = ~s_val
        if not np.any(inv):
            break
        acc = np.zeros_like(s_rgb)
        cnt = np.zeros(s_val.shape, dtype=np.float32)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            sv = np.roll(np.roll(s_val, dy, axis=0), dx, axis=1)
            sr = np.roll(np.roll(s_rgb, dy, axis=0), dx, axis=1)
            m = inv & sv
            acc[m] += sr[m]
            cnt[m] += 1.0
        fill = inv & (cnt > 0)
        if not np.any(fill):
            break
        s_rgb[fill] = acc[fill] / cnt[fill, None]
        s_val[fill] = True

    coarse_up = np.array(
        Image.fromarray(np.clip(s_rgb, 0, 255).astype(np.uint8), mode="RGB").resize((w, h), Image.Resampling.BILINEAR)
    ).astype(np.float32)

    cur_val = valid.copy()
    for _ in range(14):
        inv = ~cur_val
        if not np.any(inv):
            break
        acc = np.zeros_like(rgb)
        cnt = np.zeros(cur_val.shape, dtype=np.float32)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            sv = np.roll(np.roll(cur_val, dy, axis=0), dx, axis=1)
            sr = np.roll(np.roll(rgb, dy, axis=0), dx, axis=1)
            m = inv & sv
            acc[m] += sr[m]
            cnt[m] += 1.0
        fill = inv & (cnt > 0)
        rgb[fill] = acc[fill] / cnt[fill, None]
        cur_val[fill] = True

    rgb[~cur_val] = coarse_up[~cur_val]
    res = np.zeros_like(rgba)
    res[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    res[:, :, 3] = 255
    return res, valid


def refine_plate(cid: str, path: Path) -> np.ndarray:
    arr = np.array(Image.open(path).convert("RGBA"))
    h, w, _ = arr.shape
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    a = arr[:, :, 3]

    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    lum = (r + g + b) / 3.0

    yy = np.arange(h)[:, None]
    xx = np.arange(w)[None, :]
    # Strip studio floor shadow & white/grey floor pedestal pixels below y > 785
    is_floor_shadow = (
        (yy > 785)
        & (sat < 22)
        & (lum > 135)
        & (
            (xx < 355)
            | (xx > 668)
            | ((xx > 466) & (xx < 558) & (yy > 845))
            | (yy > 964)
            | ((cid in ("jax", "boryn", "borax")) & (yy > 875) & (lum > 165))
        )
    )
    a = np.where(is_floor_shadow, 0, a)

    fg = keep_central_component(a > 48)
    arr[:, :, 3] = np.where(fg, a, 0).astype(np.uint8)
    Image.fromarray(arr, mode="RGBA").save(path)
    return arr


def build_128_row_spans(cid: str, interior_mask: np.ndarray, crown_y: int, foot_y: int) -> list[list[int]]:
    """
    Returns 128 rows of [fullL, fullR, negMin, negMax, posMin, posMax] in 0..1023 pixel coordinates
    for the humanoid body/limbs (excluding supernatural dorsal spider legs/tails outside core bounds).
    """
    h, w = interior_mask.shape
    body_h = max(1, foot_y - crown_y)
    spans: list[list[int] | None] = [None] * 128

    for r in range(128):
        y0 = int(r * h / 128)
        y1 = max(y0 + 1, int((r + 1) * h / 128))
        ymid = (y0 + y1) * 0.5
        rel_y = (ymid - crown_y) / body_h

        band = interior_mask[y0:y1, :].any(axis=0).copy()
        # Exclude wide dorsal spider legs on Kai & Kai-Jax (and wide side tail sweeps on Kai-Jax)
        if cid in ("kai", "kaijax"):
            if rel_y < 0.28:
                # Head/ears band: exclude high arching spider legs outside [396..628]
                band[:396] = False
                band[628:] = False
            elif rel_y < 0.62:
                # Shoulder/sleeve/hand band: exclude outer spider tips outside [334..690]
                band[:334] = False
                band[690:] = False
            else:
                # Hip/trouser/sneaker band: exclude sweeping side tails on Kai-Jax outside [368..656]
                band[:368] = False
                band[656:] = False
        elif cid == "jax" and rel_y < 0.26:
            # Exclude wide outer storm-mane spikes outside head/hood [395..629]
            band[:395] = False
            band[629:] = False

        xs = np.where(band)[0]
        if len(xs) < 4:
            continue

        full_l = int(xs.min())
        full_r = int(xs.max())
        neg_xs = xs[xs <= 512]
        pos_xs = xs[xs >= 512]
        neg_min = int(neg_xs.min()) if len(neg_xs) > 0 else full_l
        neg_max = int(neg_xs.max()) if len(neg_xs) > 0 else 512
        pos_min = int(pos_xs.min()) if len(pos_xs) > 0 else 512
        pos_max = int(pos_xs.max()) if len(pos_xs) > 0 else full_r
        spans[r] = [full_l, full_r, neg_min, neg_max, pos_min, pos_max]

    # Propagate nearest non-empty row into top/bottom padding rows
    valid_indices = [i for i, s in enumerate(spans) if s is not None]
    if not valid_indices:
        return [[400, 624, 400, 500, 524, 624] for _ in range(128)]

    filled: list[list[int]] = []
    for r in range(128):
        if spans[r] is not None:
            filled.append(spans[r])  # type: ignore[arg-type]
        else:
            nearest = min(valid_indices, key=lambda vi: abs(vi - r))
            filled.append(list(spans[nearest]))  # type: ignore[arg-type]
    return filled


def measure_landmarks(cid: str, front_mask: np.ndarray, back_mask: np.ndarray) -> dict:
    f_ys, _ = np.where(front_mask)
    b_ys, _ = np.where(back_mask)
    foot_y = int(max(f_ys.max(), b_ys.max()))

    center_fa = front_mask[:, 468:556]
    cf_ys, _ = np.where(center_fa)
    crown_y = int(cf_ys.min())
    if cid == "jax":
        crown_y = int(cf_ys.min() + 52)
    elif cid == "kaijax":
        crown_y = int(cf_ys.min() + 26)

    body_h = max(1, foot_y - crown_y)
    wrist_y0 = int(crown_y + body_h * 0.46)
    wrist_y1 = int(crown_y + body_h * 0.58)
    band = front_mask[wrist_y0:wrist_y1, :].copy()
    if cid in ("kai", "kaijax"):
        band[:, :334] = False
        band[:, 690:] = False
    _, band_xs = np.where(band)
    half_span_px = float(max(512 - band_xs.min(), band_xs.max() - 512)) if len(band_xs) > 0 else 185.0

    hip_y = int(crown_y + body_h * 0.60)
    hip_band = front_mask[max(0, hip_y - 10) : min(1024, hip_y + 10), 360:664]
    _, hip_xs = np.where(hip_band)
    hip_half_px = float(max(512 - (hip_xs.min() + 360), (hip_xs.max() + 360) - 512)) if len(hip_xs) > 0 else 115.0

    return {
        "crownY": crown_y,
        "footY": foot_y,
        "centerX": 512,
        "armHalfSpanPx": round(half_span_px, 1),
        "hipHalfSpanPx": round(hip_half_px, 1),
        "frontSpans128": build_128_row_spans(cid, front_mask, crown_y, foot_y),
        "backSpans128": build_128_row_spans(cid, back_mask, crown_y, foot_y),
    }


def main():
    manifest = json.loads(MANIFEST_PATH.read_text())
    for cid, entry in manifest["characters"].items():
        char_dir = OUT_ROOT / cid
        interior_masks = {}
        for vname in ("front", "side", "back", "three_quarter"):
            p = char_dir / f"{vname}.png"
            arr = refine_plate(cid, p)
            if vname in ("front", "side", "back"):
                dil, clean_mask = dilate_rgb_into_transparent(cid, arr)
                interior_masks[vname] = clean_mask
                Image.fromarray(dil, mode="RGBA").save(char_dir / f"{vname}_dilated.png")

        lm = measure_landmarks(cid, interior_masks["front"], interior_masks["back"])
        entry["projectionLandmarks"] = lm
        print(
            f"[REFINED+SPANS] {cid:7s} -> crownY={lm['crownY']:3d} footY={lm['footY']:3d} "
            f"armHalfPx={lm['armHalfSpanPx']:5.1f} hipHalfPx={lm['hipHalfSpanPx']:5.1f}"
        )

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2))
    print("Updated", MANIFEST_PATH)


if __name__ == "__main__":
    main()
