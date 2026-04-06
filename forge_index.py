#!/usr/bin/env python3
"""
forge_index.py — Create a no-loss manifest of a project tree.

Usage:
  python3 tools/forge_index.py <root_dir>

Outputs (in <root_dir>/exports):
  - forge_manifest.json   (all files + metadata + sha256)
  - forge_collisions.json (same filename across different paths; identical hashes)
  - forge_report.md       (human summary)
"""
from __future__ import annotations
import os, sys, json, hashlib
from pathlib import Path
from datetime import datetime

SKIP_DIRS = {".git", ".DS_Store", "__pycache__", "node_modules", ".venv", "dist", "build"}

def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            b = f.read(chunk_size)
            if not b:
                break
            h.update(b)
    return h.hexdigest()

def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 tools/forge_index.py <root_dir>")
        return 2
    root = Path(sys.argv[1]).resolve()
    if not root.exists():
        print(f"Root not found: {root}")
        return 2

    exports = root / "exports"
    exports.mkdir(parents=True, exist_ok=True)

    manifest = {
        "tool": "forge_index.py",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "root": str(root),
        "files": [],
    }

    # Walk project
    for dirpath, dirnames, filenames in os.walk(root):
        # filter dirs in-place
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        # also skip exports to avoid recursion loops
        if Path(dirpath).name in SKIP_DIRS:
            continue
        for fn in filenames:
            if fn in {".DS_Store"}:
                continue
            p = Path(dirpath) / fn
            if not p.is_file():
                continue
            # Skip our own outputs if re-running
            if p.parent.name == "exports" and p.name.startswith("forge_"):
                continue
            try:
                st = p.stat()
                item = {
                    "path": str(p.relative_to(root)),
                    "name": p.name,
                    "ext": p.suffix.lower(),
                    "size": st.st_size,
                    "mtime": datetime.utcfromtimestamp(st.st_mtime).isoformat() + "Z",
                    "sha256": sha256_file(p),
                }
                manifest["files"].append(item)
            except Exception as e:
                manifest["files"].append({
                    "path": str(p.relative_to(root)),
                    "error": str(e),
                })

    # Collision analysis
    by_name = {}
    by_hash = {}
    for f in manifest["files"]:
        if "sha256" not in f:
            continue
        by_name.setdefault(f["name"], []).append(f)
        by_hash.setdefault(f["sha256"], []).append(f)

    collisions = {
        "same_filename_multiple_paths": {k:v for k,v in by_name.items() if len(v) > 1},
        "identical_content_different_paths": {k:v for k,v in by_hash.items() if len(v) > 1},
    }

    (exports / "forge_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (exports / "forge_collisions.json").write_text(json.dumps(collisions, indent=2), encoding="utf-8")

    # Human report
    total_files = len([f for f in manifest["files"] if "sha256" in f])
    total_bytes = sum(f.get("size", 0) for f in manifest["files"] if "size" in f)
    dup_names = len(collisions["same_filename_multiple_paths"])
    dup_hash = len(collisions["identical_content_different_paths"])

    report = []
    report.append("# Forge Index Report\n")
    report.append(f"- Root: `{root}`\n")
    report.append(f"- Files indexed: **{total_files}**\n")
    report.append(f"- Total size: **{total_bytes/1024/1024:.2f} MB**\n")
    report.append(f"- Filename collisions: **{dup_names}**\n")
    report.append(f"- Identical-hash duplicates: **{dup_hash}**\n\n")

    if dup_names:
        report.append("## Filename collisions (review these first)\n")
        for name, items in sorted(collisions["same_filename_multiple_paths"].items()):
            report.append(f"### {name}\n")
            for it in items:
                report.append(f"- `{it['path']}`  ({it.get('size','?')} bytes, {it.get('mtime','?')})\n")
            report.append("\n")

    (exports / "forge_report.md").write_text("".join(report), encoding="utf-8")

    print("✅ Manifest written to:", exports / "forge_manifest.json")
    print("✅ Collisions written to:", exports / "forge_collisions.json")
    print("✅ Report written to:", exports / "forge_report.md")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
