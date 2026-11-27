"""Serves Bobby's ACTUAL compiled production SPA bundle + live OS-exclusive APIs."""
from __future__ import annotations
import mimetypes
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
import platform_exclusive

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("application/wasm", ".wasm")

def _resolve_spa_dir(bundle_root: Path) -> Path:
    # Packaged releases must never load a developer machine's stale UI or fallback shell.
    cand = bundle_root / "real_app"
    index = cand / "index.html"
    if not index.is_file() or index.stat().st_size == 0:
        raise FileNotFoundError("Canonical Kai-Jax game bundle missing: real_app/index.html")
    return cand

def create_app(bundle_root: Path, meta: dict):
    app = Flask(__name__)
    spa_dir = _resolve_spa_dir(bundle_root)
    assets_dir = bundle_root / "assets"

    @app.route("/api/health")
    def health():
        return jsonify({"ok": True, "app": meta["title"], "spa_dir": str(spa_dir), "real_bundle": (spa_dir / "index.html").exists()})

    @app.route("/api/platform")
    def plat():
        return jsonify(platform_exclusive.get_system_overview())

    @app.route("/api/usb")
    def api_usb():
        return jsonify(platform_exclusive.scan_usb_hardware())

    @app.route("/api/disks")
    def api_disks():
        return jsonify(platform_exclusive.scan_physical_disks())

    @app.route("/api/clipboard")
    def api_clip():
        return jsonify({"text": platform_exclusive.get_clipboard_text()})

    @app.route("/_nw_assets/<path:f>")
    def nw_assets(f):
        return send_from_directory(assets_dir, f)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        if path == "api" or path.startswith("api/"):
            return jsonify({"error": "API endpoint unavailable"}), 404
        if path:
            target = spa_dir / path
            if target.is_file():
                return send_from_directory(spa_dir, path)
            if path.startswith(("assets/", "models/", "textures/", "audio/")) or Path(path).suffix:
                return jsonify({"error": "Game asset not found"}), 404
        return send_from_directory(spa_dir, "index.html")

    return app


def start_server(port: int, bundle_root: Path, meta: dict):
    create_app(bundle_root, meta).run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
