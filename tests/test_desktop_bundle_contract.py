"""Desktop bundle routing tests; synthetic assets are isolated test fixtures."""
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "desktop_suite"))
import app_engine

class DesktopBundleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.bundle = Path(self.temp.name)
        (self.bundle / "ui").mkdir()
        (self.bundle / "ui" / "index.html").write_text("<html>wrong shell</html>", encoding="utf-8")

    def make_bundle(self):
        game = self.bundle / "real_app"
        game.mkdir()
        (game / "index.html").write_text("<html>canonical fixture</html>", encoding="utf-8")
        (game / "assets").mkdir()
        (game / "assets" / "model.glb").write_bytes(b"glTF fixture")
        return app_engine.create_app(self.bundle, {"title": "Test fixture"}).test_client()

    def test_missing_game_never_falls_back(self):
        with self.assertRaises(FileNotFoundError):
            app_engine.create_app(self.bundle, {"title": "Test fixture"})

    def test_empty_index_rejected(self):
        (self.bundle / "real_app").mkdir()
        (self.bundle / "real_app" / "index.html").touch()
        with self.assertRaises(FileNotFoundError):
            app_engine.create_app(self.bundle, {"title": "Test fixture"})

    def test_canonical_index_selected(self):
        client = self.make_bundle()
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"canonical fixture", response.data)
        self.assertNotIn(b"wrong shell", response.data)
        self.assertTrue(client.get("/api/health").json["real_bundle"])

    def test_existing_model_delivered_as_bytes(self):
        client = self.make_bundle()
        r = client.get("/assets/model.glb")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data, b"glTF fixture")
        self.assertEqual(r.mimetype, "model/gltf-binary")

    def test_missing_model_is_not_html(self):
        client = self.make_bundle()
        for path in ("/assets/missing.glb", "/models/missing", "/textures/missing.png", "/missing.js"):
            with self.subTest(path=path):
                r = client.get(path)
                self.assertEqual(r.status_code, 404)
                self.assertTrue(r.is_json)

    def test_unknown_api_is_not_html(self):
        r = self.make_bundle().get("/api/missing")
        self.assertEqual(r.status_code, 404)
        self.assertTrue(r.is_json)

    def test_client_route_remains_available(self):
        r = self.make_bundle().get("/campaign")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"canonical fixture", r.data)

if __name__ == "__main__":
    unittest.main()
