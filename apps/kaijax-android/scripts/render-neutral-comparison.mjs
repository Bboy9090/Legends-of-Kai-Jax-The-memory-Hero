#!/usr/bin/env node
/**
 * Neutral-light model sheets: every model is normalised to the same height, lit by the same flat white rig on the same
 * grey background and photographed from the same four angles, so differences are the model's, not the lighting's.
 * Usage: node scripts/render-neutral-comparison.mjs <outDir> <dir/model_master.glb> [...]
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const out = path.resolve(process.argv[2]);
const models = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.resolve('../web/package.json'));
const { chromium } = require('playwright');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json', '.wasm': 'application/wasm' };
const PAGE = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#3a3d44">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<canvas id=c width=1600 height=440></canvas>
<script type=module>
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1600, 440, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
window.renderModel = async (url) => {
  const gltf = await loader.loadAsync(url);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#3a3d44');
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-3, 5, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1.0); fill.position.set(4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(0, 3, -6); scene.add(rim);
  const root = gltf.scene; scene.add(root);
  gltf.scene.traverse((o) => { if (o.isMesh && o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.emissiveIntensity > 1) m.emissiveIntensity = 1; }); } });
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  const s = 2 / size.y; root.scale.setScalar(s); root.position.set(-c.x * s, -box.min.y * s, -c.z * s);
  const cam = new THREE.PerspectiveCamera(28, 400 / 440, 0.1, 50);
  renderer.setScissorTest(true);
  const views = [['front', 0], ['three-quarter', 40], ['side', 90], ['back', 180]];
  views.forEach(([_, deg], i) => {
    const r = 5.6, a = THREE.MathUtils.degToRad(deg);
    cam.position.set(Math.sin(a) * r, 1.15, Math.cos(a) * r); cam.lookAt(0, 0.98, 0);
    renderer.setViewport(i * 400, 0, 400, 440); renderer.setScissor(i * 400, 0, 400, 440); renderer.render(scene, cam);
  });
  let tris = 0; root.traverse((o) => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
  let joints = 0; root.traverse((o) => { if (o.isSkinnedMesh && o.skeleton) joints = Math.max(joints, o.skeleton.bones.length); });
  return { tris: Math.round(tris), joints, clips: gltf.animations.length, height: +size.y.toFixed(2) };
};
window.ready = true;
</script>`;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' ) { res.setHeader('content-type', 'text/html'); res.end(PAGE); return; }
  const f = path.join(root, url.startsWith('/node_modules') ? url : 'public' + url);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; res.end(); return; }
  res.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 440 } });
const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.ready);
const report = {};
for (const m of models) {
  const name = path.basename(m).replace(/_master\.glb$|\.glb$/, '');
  try {
    report[name] = await page.evaluate((u) => window.renderModel(u), '/models/' + m);
    await page.locator('#c').screenshot({ path: path.join(out, name + '.png') });
    console.error('rendered', name, JSON.stringify(report[name]));
  } catch (e) { report[name] = { error: String(e).slice(0, 200) }; console.error('FAILED', name, report[name].error); }
}
fs.writeFileSync(path.join(out, 'render-report.json'), JSON.stringify({ errors: errors.slice(0, 10), models: report }, null, 2));
await browser.close(); server.close();
