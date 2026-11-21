#!/usr/bin/env node
/**
 * Deterministic Headless WebGL Visual Capture Tool for P1-E
 * Captures:
 *  1) Multi-angle studio 3D turnarounds (3/4 front, head close-up, back silhouette)
 *     for all 5 approved characters (kai, jax, kaijax, boryn, borax) + 5-hero lineup
 *  2) Live running app Title & Gameplay HUD / Ashblock Heights captures across:
 *     - 844x390 (Mobile Phone Landscape)
 *     - 915x412 (Android Flagship Landscape)
 *     - 1180x820 (Tablet Landscape)
 *     - 1440x900 (Desktop)
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const mode = process.argv[2] === 'after' ? 'after' : 'before';
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'production', 'captures', mode);
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_BIN =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const HARNESS_PORT = 4179;
const CDP_PORT = 9233;
const APP_URL = 'http://127.0.0.1:3000';

const MODEL_DIR =
  mode === 'before'
    ? path.join(ROOT, 'data', 'checkpoints', 'p1e-baseline', 'models')
    : path.join(ROOT, 'public', 'models', 'characters');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
};

const HARNESS_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #10131c; font-family: system-ui, sans-serif; color: #f8fafc; }
    canvas { display: block; width: 100%; height: 100%; }
    .label { position: fixed; padding: 6px 12px; background: rgba(10,12,18,0.86); border: 1px solid rgba(148,163,184,0.28); border-radius: 8px; font-size: 12px; letter-spacing: 0.04em; pointer-events: none; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "three": "/node_modules/three/build/three.module.js",
      "three/addons/": "/node_modules/three/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <div id="labels"></div>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

    const params = new URLSearchParams(location.search);
    const charId = params.get('char') || 'kai';
    const modeName = params.get('mode') || 'studio';

    const W = window.innerWidth;
    const H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setScissorTest(true);
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141824);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e1b2e, 1.05);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4e0, 2.35);
    key.position.set(3.2, 5.2, 4.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x93c5fd, 1.05);
    fill.position.set(-3.6, 2.8, 2.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc4b5fd, 1.45);
    rim.position.set(0, 3.8, -4.2);
    scene.add(rim);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.0, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0x1e2433, roughness: 0.65, metalness: 0.25 })
    );
    ped.position.y = -0.04;
    scene.add(ped);

    const loader = new GLTFLoader();
    const loadModel = (file) => new Promise((resolve, reject) => {
      loader.load('/models/' + file, resolve, undefined, reject);
    });

    const labelsEl = document.getElementById('labels');
    const addLabel = (text, left, top) => {
      const d = document.createElement('div');
      d.className = 'label';
      d.style.left = left + 'px';
      d.style.top = top + 'px';
      d.textContent = text;
      labelsEl.appendChild(d);
    };

    async function run() {
      if (charId === 'lineup') {
        const order = [
          { id: 'boryn', x: -2.55, rot: 0.18 },
          { id: 'kai', x: -1.25, rot: 0.1 },
          { id: 'kaijax', x: 0.0, rot: 0.0 },
          { id: 'jax', x: 1.25, rot: -0.1 },
          { id: 'borax', x: 2.55, rot: -0.18 },
        ];
        for (const item of order) {
          const gltf = await loadModel(item.id + '_master.glb');
          gltf.scene.position.set(item.x, 0, 0);
          gltf.scene.rotation.y = item.rot;
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            const idle = gltf.animations.find((c) => c.name === 'idle_combat' || c.name === 'idle') || gltf.animations[0];
            const act = mixer.clipAction(idle);
            act.play();
            mixer.update(0.25);
          }
          scene.add(gltf.scene);
        }
        const cam = new THREE.PerspectiveCamera(34, W / H, 0.1, 50);
        cam.position.set(0, 1.55, 7.65);
        cam.lookAt(0, 1.08, 0);
        renderer.setViewport(0, 0, W, H);
        renderer.setScissor(0, 0, W, H);
        renderer.render(scene, cam);
        addLabel('5-CHARACTER CANON LINEUP (' + modeName.toUpperCase() + ') — BORYN · KAI · KAI-JAX · JAX · BORAX', 18, 16);
      } else {
        const gltf = await loadModel(charId + '_master.glb');
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          const idle = gltf.animations.find((c) => c.name === 'idle_combat' || c.name === 'idle') || gltf.animations[0];
          const act = mixer.clipAction(idle);
          act.play();
          mixer.update(0.2);
        }
        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const h = Math.max(1.6, box.max.y - box.min.y);
        const headY = h * 0.80;

        // Left half: 3/4 Front Full Body
        const leftW = Math.floor(W * 0.54);
        const rightW = W - leftW;
        const halfH = Math.floor(H * 0.5);

        const camFront = new THREE.PerspectiveCamera(34, leftW / H, 0.1, 50);
        camFront.position.set(0.95, h * 0.56, h * 1.95);
        camFront.lookAt(0, h * 0.50, 0);
        renderer.setViewport(0, 0, leftW, H);
        renderer.setScissor(0, 0, leftW, H);
        renderer.render(scene, camFront);

        // Top-right: Head & Upper Torso Close-up
        const camHead = new THREE.PerspectiveCamera(28, rightW / halfH, 0.05, 50);
        camHead.position.set(0.32, headY + 0.05, h * 0.78);
        camHead.lookAt(0, headY - 0.03, 0.04);
        renderer.setViewport(leftW, halfH, rightW, H - halfH);
        renderer.setScissor(leftW, halfH, rightW, H - halfH);
        renderer.render(scene, camHead);

        // Bottom-right: Back / Dorsal Silhouette (Tails / Limbs / Mane)
        const camBack = new THREE.PerspectiveCamera(36, rightW / halfH, 0.1, 50);
        camBack.position.set(-1.15, h * 0.58, -h * 1.92);
        camBack.lookAt(0, h * 0.48, 0);
        renderer.setViewport(leftW, 0, rightW, halfH);
        renderer.setScissor(leftW, 0, rightW, halfH);
        renderer.render(scene, camBack);

        addLabel(charId.toUpperCase() + ' MASTER GLB (' + modeName.toUpperCase() + ') — 3/4 FULL BODY', 16, 14);
        addLabel('HEAD / MUZZLE / FANGS CLOSE-UP', leftW + 14, 14);
        addLabel('REAR / DORSAL RIG & SILHOUETTE', leftW + 14, halfH + 14);
      }
      window.__HARNESS_READY__ = true;
    }
    run().catch((err) => {
      console.error(err);
      window.__HARNESS_ERROR__ = String(err);
    });
  </script>
</body>
</html>`;

function startHarnessServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlObj = new URL(req.url, `http://127.0.0.1:${HARNESS_PORT}`);
      if (urlObj.pathname === '/harness.html') {
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        res.end(HARNESS_HTML);
        return;
      }
      let diskPath = null;
      if (urlObj.pathname.startsWith('/models/')) {
        diskPath = path.join(MODEL_DIR, path.basename(urlObj.pathname));
      } else if (urlObj.pathname.startsWith('/node_modules/')) {
        diskPath = path.join(ROOT, urlObj.pathname);
      }
      if (diskPath && fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
        const ext = path.extname(diskPath);
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
        });
        fs.createReadStream(diskPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(HARNESS_PORT, '127.0.0.1', () => resolve(server));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDPSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() {
    this.ws.close();
  }
}

async function launchChrome() {
  const proc = spawn(
    CHROME_BIN,
    [
      '--headless',
      `--remote-debugging-port=${CDP_PORT}`,
      '--remote-allow-origins=*',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (r.ok) {
        const list = await r.json();
        const page = list.find((t) => t.type === 'page');
        if (page?.webSocketDebuggerUrl) {
          const cdp = new CDPSession(page.webSocketDebuggerUrl);
          await cdp.connect();
          await cdp.send('Page.enable');
          await cdp.send('Runtime.enable');
          return { proc, cdp };
        }
      }
    } catch {
      // retry
    }
    await sleep(200);
  }
  proc.kill('SIGKILL');
  throw new Error('Failed to connect to headless Chrome CDP');
}

async function setViewport(cdp, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenOrientation: { type: 'landscapePrimary', angle: 90 },
  });
}

async function saveScreenshot(cdp, filename) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  console.log(`[CAPTURED] ${path.relative(ROOT, dest)}`);
}

async function waitForExpr(cdp, expr, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await cdp.send('Runtime.evaluate', {
      expression: `Boolean(${expr})`,
      returnByValue: true,
    });
    if (res?.result?.value === true) return true;
    await sleep(200);
  }
  return false;
}

async function main() {
  const harnessServer = await startHarnessServer();
  const { proc, cdp } = await launchChrome();

  try {
    // 1. Capture deterministic 3D character studio turnarounds
    await setViewport(cdp, 1360, 820, false);
    for (const ch of ['kai', 'jax', 'kaijax', 'boryn', 'borax', 'lineup']) {
      await cdp.send('Page.navigate', {
        url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?char=${ch}&mode=${mode}`,
      });
      await waitForExpr(cdp, 'window.__HARNESS_READY__ || window.__HARNESS_ERROR__', 15000);
      await sleep(250);
      await saveScreenshot(cdp, `char_${ch}.png`);
    }

    // 2. Capture live app Title Screen & Gameplay HUD / Ashblock Heights
    await setViewport(cdp, 1440, 900, false);
    await cdp.send('Page.navigate', { url: APP_URL });
    await waitForExpr(cdp, 'document.querySelector("button") && document.querySelector("canvas")', 15000);
    await sleep(3900); // Allow all 5 GLB showcase models on title pedestal to finish loading & rendering
    await saveScreenshot(cdp, 'title_desktop_1440x900.png');

    await setViewport(cdp, 844, 390, false);
    await sleep(650);
    await saveScreenshot(cdp, 'title_mobile_844x390.png');

    // Start New Campaign to enter Ashblock Heights gameplay
    await setViewport(cdp, 1440, 900, false);
    await sleep(450);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find((b) => /Enter Ashblock|New Game|New Campaign/i.test(b.textContent || ''));
        if (startBtn) startBtn.click();
        return Boolean(startBtn);
      })()`,
    });
    await sleep(1800);

    if (mode === 'after') {
      // Capture Dialogue + HUD coexistence on compact mobile landscape (844x390) before closing dialogue
      await setViewport(cdp, 844, 390, false);
      await sleep(650);
      await saveScreenshot(cdp, 'hud_dialogue_mobile_844x390.png');

      // Dismiss intro dialogue via Skip Scene so live combat/traversal HUD is unobstructed
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const skipBtn = btns.find((b) => /Skip Scene/i.test(b.textContent || ''));
          if (skipBtn) skipBtn.click();
          return Boolean(skipBtn);
        })()`,
      });
      await sleep(650);
    }

    // Desktop 1440x900 HUD + Ashblock spawn vista
    await setViewport(cdp, 1440, 900, false);
    await sleep(650);
    await saveScreenshot(cdp, 'hud_desktop_1440x900.png');

    // Tablet 1180x820
    await setViewport(cdp, 1180, 820, false);
    await sleep(650);
    await saveScreenshot(cdp, 'hud_tablet_1180x820.png');

    // Android Flagship Landscape 915x412
    await setViewport(cdp, 915, 412, false);
    await sleep(650);
    await saveScreenshot(cdp, 'hud_android_915x412.png');

    // Compact Phone Landscape 844x390
    await setViewport(cdp, 844, 390, false);
    await sleep(650);
    await saveScreenshot(cdp, 'hud_mobile_844x390.png');

    // Walk forward into Ashblock Heights street/market plaza to capture environment mid-street
    await setViewport(cdp, 1440, 900, false);
    await sleep(350);
    await cdp.send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' }))`,
    });
    await sleep(2100);
    await cdp.send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w' }))`,
    });
    await sleep(550);
    await saveScreenshot(cdp, 'ashblock_street_1440x900.png');

    if (mode === 'after') {
      // Toggle Clean Viewport / Zen HUD to capture unobstructed Ashblock architectural vista
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const zenBtn = document.querySelector('button[aria-label*="HUD"]');
          if (zenBtn) zenBtn.click();
          return Boolean(zenBtn);
        })()`,
      });
      await sleep(450);
      await saveScreenshot(cdp, 'ashblock_vista_clean_1440x900.png');
    }
  } finally {
    cdp.close();
    proc.kill('SIGKILL');
    harnessServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
