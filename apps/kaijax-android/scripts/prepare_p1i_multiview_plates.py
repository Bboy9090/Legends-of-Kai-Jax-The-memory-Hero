#!/usr/bin/env python3
"""
OPERATION KAI-JAX — P1-I PHASE 1: APPROVED MULTI-VIEW ARTWORK PLATE EXTRACTOR
Extracts clean, alpha-matted, scale-normalized 1024x1024 RGBA orthographic plates:
  - front.png (A-pose front)
  - side.png (Left side profile)
  - back.png (Rear view)
  - three_quarter.png (3/4 hero view)
  - front_dilated.png / back_dilated.png / side_dilated.png (edge-extruded color plates for zero-bleed UV projection)
from the 5 approved 4-view turnaround sheets anchored to the Official Visual Library.
"""

import json
import os
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/app/applet")
OUT_ROOT = ROOT / "public" / "models" / "reconstruction-sheets"

CHARACTER_TURNAROUNDS = {
    "kai": {
        "sheet": ROOT / "src/assets/images/kai_multiview_turnaround_1794700252871.jpg",
        "authority": ["/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png"],
    },
    "jax": {
        "sheet": ROOT / "src/assets/images/jax_multiview_turnaround_1794700254629.jpg",
        "authority": ["/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png"],
    },
    "kaijax": {
        "sheet": ROOT / "src/assets/images/kaijax_multiview_turnaround_1794700259958.jpg",
        "authority": ["/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png"],
    },
    "boryn": {
        "sheet": ROOT / "src/assets/images/boryn_multiview_turnaround_1794700265130.jpg",
        "authority": [
            "/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png",
            "/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png",
        ],
    },
    "borax": {
        "sheet": ROOT / "src/assets/images/borax_multiview_turnaround_1794700263512.jpg",
        "authority": [
            "/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png",
            "/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png",
        ],
    },
}

VIEW_NAMES = ["front", "side", "back", "three_quarter"]


def compute_foreground_alpha(rgb: np.ndarray) -> np.ndarray:
    """
    Computes a clean anti-aliased alpha mask separating the character (including white fur/jackets!)
    from the uniform neutral studio grey background sampled from the image border.
    """
    h, w, _ = rgb.shape
    border_pixels = np.concatenate(
        [
            rgb[:12, :, :].reshape(-1, 3),
            rgb[-12:, :, :].reshape(-1, 3),
            rgb[:, :12, :].reshape(-1, 3),
            rgb[:, -12:, :].reshape(-1, 3),
        ],
        axis=0,
    ).astype(np.float32)
    bg_med = np.median(border_pixels, axis=0)

    rgb_f = rgb.astype(np.float32)
    diff = np.linalg.norm(rgb_f - bg_med[None, None, :], axis=2)
    sat = rgb_f.max(axis=2) - rgb_f.min(axis=2)

    # Local high-frequency texture energy preserves silver-white fur/cloth whose luminance is near grey
    lum = 0.299 * rgb_f[:, :, 0] + 0.587 * rgb_f[:, :, 1] + 0.114 * rgb_f[:, :, 2]
    lum_img = Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8))
    lum_blur = np.asarray(lum_img.filter(ImageFilter.BoxBlur(4)), dtype=np.float32)
    local_detail = np.abs(lum - lum_blur)

    score = diff + sat * 0.85 + local_detail * 1.6

    # Flood-fill background from image border where score is low so interior white fur/eyes stay 100% opaque!
    bg_candidate = score < 16.5
    visited = np.zeros((h, w), dtype=bool)
    stack = []
    for x in range(w):
        if bg_candidate[0, x]:
            visited[0, x] = True
            stack.append((0, x))
        if bg_candidate[h - 1, x]:
            visited[h - 1, x] = True
            stack.append((h - 1, x))
    for y in range(h):
        if bg_candidate[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            stack.append((y, 0))
        if bg_candidate[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            stack.append((y, w - 1))

    while stack:
        cy, cx = stack.pop()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and bg_candidate[ny, nx]:
                visited[ny, nx] = True
                stack.append((ny, nx))

    fg = (~visited).astype(np.float32)
    # Remove tiny isolated studio floor shadow speckles near bottom border
    fg_img = Image.fromarray((fg * 255).astype(np.uint8))
    fg_smooth = fg_img.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.85))
    alpha = np.asarray(fg_smooth, dtype=np.float32)
    alpha = np.clip((alpha - 24.0) / (235.0 - 24.0), 0.0, 1.0)
    return (alpha * 255.0).astype(np.uint8)


def find_four_column_splits(alpha: np.ndarray) -> list[tuple[int, int]]:
    """Finds the 3 cleanest vertical valley splits dividing the 4 character views."""
    h, w = alpha.shape
    col_mass = (alpha > 40).sum(axis=0).astype(np.float32)
    splits = [0]
    for k in (1, 2, 3):
        center = int(w * k / 4)
        win = int(w * 0.075)
        lo = max(10, center - win)
        hi = min(w - 10, center + win)
        # Prefer minimum foreground column mass closest to quarter boundary
        idx_range = np.arange(lo, hi)
        penalty = col_mass[lo:hi] + np.abs(idx_range - center) * 0.08
        best_x = int(lo + np.argmin(penalty))
        splits.append(best_x)
    splits.append(w)
    return [(splits[i], splits[i + 1]) for i in range(4)]


def dilate_rgb_into_background(rgb: np.ndarray, alpha: np.ndarray, iterations: int = 28) -> np.ndarray:
    """Extrudes foreground edge colors outward into transparent pixels so 3D UV projection never samples grey background."""
    out = rgb.astype(np.float32).copy()
    mask = alpha > 140
    for _ in range(iterations):
        if mask.all():
            break
        acc = np.zeros_like(out)
        cnt = np.zeros(mask.shape, dtype=np.float32)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            s_mask = np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
            s_rgb = np.roll(np.roll(out, dy, axis=0), dx, axis=1)
            acc += s_rgb * s_mask[:, :, None]
            cnt += s_mask.astype(np.float32)
        fill = (~mask) & (cnt > 0)
        if not fill.any():
            break
        out[fill] = acc[fill] / cnt[fill][:, None]
        mask = mask | fill
    # Fill any remaining far corners with median foreground color
    if (~mask).any():
        fg_med = np.median(rgb[alpha > 140], axis=0) if (alpha > 140).any() else np.array([128, 128, 128])
        out[~mask] = fg_med
    return np.clip(out, 0, 255).astype(np.uint8)


def process_character(char_id: str, cfg: dict) -> dict:
    src_path: Path = cfg["sheet"]
    assert src_path.exists(), f"Missing turnaround sheet: {src_path}"

    char_dir = OUT_ROOT / char_id
    char_dir.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src_path, char_dir / "turnaround_4view.jpg")

    img = Image.open(src_path).convert("RGB")
    rgb = np.asarray(img, dtype=np.uint8)
    alpha = compute_foreground_alpha(rgb)
    col_ranges = find_four_column_splits(alpha)

    # Determine unified vertical span (top..bottom) across Front, Side, Back so orthographic views share exact Y scale!
    ys_top = []
    ys_bot = []
    crop_boxes = []
    for x0, x1 in col_ranges:
        sub_a = alpha[:, x0:x1]
        ys, xs = np.where(sub_a > 48)
        assert len(ys) > 100, f"{char_id}: empty view column ({x0}..{x1})"
        y_min, y_max = int(ys.min()), int(ys.max())
        x_min, x_max = int(xs.min()) + x0, int(xs.max()) + x0
        ys_top.append(y_min)
        ys_bot.append(y_max)
        crop_boxes.append((x_min, y_min, x_max + 1, y_max + 1))

    # Use Front/Side/Back shared vertical metrics and normalize each view into 1024x1024 with feet at y=980, crown at y=44
    TARGET = 1024
    PAD_TOP = 44
    PAD_BOT = 44
    TARGET_H = TARGET - PAD_TOP - PAD_BOT  # 936 px character height

    views_meta = {}
    for idx, view_name in enumerate(VIEW_NAMES):
        x0, y0, x1, y1 = crop_boxes[idx]
        sub_rgb = rgb[y0:y1, x0:x1]
        sub_a = alpha[y0:y1, x0:x1]
        vh, vw = sub_a.shape

        scale = TARGET_H / float(max(1, vh))
        new_w = min(TARGET - 32, max(1, int(round(vw * scale))))
        new_h = TARGET_H

        rgba_crop = np.dstack([sub_rgb, sub_a])
        pil_rgba = Image.fromarray(rgba_crop, mode="RGBA").resize((new_w, new_h), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (TARGET, TARGET), (0, 0, 0, 0))
        paste_x = (TARGET - new_w) // 2
        paste_y = PAD_TOP
        canvas.paste(pil_rgba, (paste_x, paste_y))

        out_png = char_dir / f"{view_name}.png"
        canvas.save(out_png, format="PNG", optimize=True)

        # Measure anatomical width profile across normalized Y (0=feet, 1=crown) for Blender multi-view fitting
        arr = np.asarray(canvas, dtype=np.uint8)
        a_chan = arr[:, :, 3]
        profile_widths = []
        for s_idx in range(20):
            py = int(PAD_TOP + (1.0 - (s_idx + 0.5) / 20.0) * TARGET_H)
            row_xs = np.where(a_chan[py, :] > 64)[0]
            w_norm = float(row_xs.max() - row_xs.min()) / float(TARGET_H) if len(row_xs) > 2 else 0.0
            profile_widths.append(round(w_norm, 4))

        if view_name in ("front", "side", "back"):
            dilated_rgb = dilate_rgb_into_background(arr[:, :, :3], a_chan, iterations=32)
            Image.fromarray(dilated_rgb, mode="RGB").save(
                char_dir / f"{view_name}_dilated.png", format="PNG", optimize=True
            )

        views_meta[view_name] = {
            "url": f"/models/reconstruction-sheets/{char_id}/{view_name}.png",
            "aspectWidthOverHeight": round(vw / float(max(1, vh)), 4),
            "normalizedWidthSlicesBottomToTop": profile_widths,
        }

    return {
        "characterId": char_id,
        "turnaroundUrl": f"/models/reconstruction-sheets/{char_id}/turnaround_4view.jpg",
        "authoritySheets": cfg["authority"],
        "views": views_meta,
    }


def main():
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    manifest = {"schema": "1.0.0-p1i-multiview", "characters": {}}
    for cid, cfg in CHARACTER_TURNAROUNDS.items():
        meta = process_character(cid, cfg)
        manifest["characters"][cid] = meta
        fw = meta["views"]["front"]["aspectWidthOverHeight"]
        sw = meta["views"]["side"]["aspectWidthOverHeight"]
        bw = meta["views"]["back"]["aspectWidthOverHeight"]
        print(f"[P1-I PLATES] {cid:8s} -> 4x 1024x1024 RGBA plates extracted (W/H front={fw:.3f}, side={sw:.3f}, back={bw:.3f})")

    manifest_path = OUT_ROOT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Saved {manifest_path}")


if __name__ == "__main__":
    main()
