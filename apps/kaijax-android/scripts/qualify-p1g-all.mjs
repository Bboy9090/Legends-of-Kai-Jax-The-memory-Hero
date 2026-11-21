#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — P1-G Comprehensive Qualification & Visual Evidence Harness
 *
 * Captures & Programmatically Verifies:
 *  1) 4-View Studio Character Mastering Sheets (3/4 Front, Orthographic Side Profile,
 *     Head/Muzzle/Fangs Close-Up, Rear Dorsal Rig) for kai, jax, kaijax, boryn, borax + 5-hero lineup
 *  2) Responsive HUD Zero-Clipping & Zero-Overlap Audit across 844x390, 915x412, 1180x820, 1440x900
 *     for both Kai and Jax, plus Active Duo Finisher Prompt zero-center-obstruction audit
 *  3) Live Ashblock Heights Gameplay Combat & Vertical Traversal Sequence:
 *     - Buffered Light/Heavy Free-Flow Combo
 *     - Kai Web Pull / Wall Pin
 *     - Smooth Hero Switch to Jax + Electric Launcher
 *     - Duo Finisher Partner Sync & Midpoint Camera Framing
 *     - Elevated Catwalk Perch & Canon Street Signage ("WE ROAR AS ONE", "BEAST-KIN MARKET")
 *  4) Real WebGL renderer.info (draw calls, active triangles, geometries, textures), JS Heap,
 *     input-to-engine dispatch latency, and honest SwiftShader software-WebGL frame pacing telemetry
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'production', 'captures', 'p1g-after');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_BIN =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const HARNESS_PORT = 4181;
const CDP_PORT = 9237;
const APP_URL = 'http://127.0.0.1:3000';
const MODEL_DIR = path.join(ROOT, 'public', 'models', 'characters');

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
    .label { position: fixed; padding: 5px 10px; background: rgba(10,12,18,0.88); border: 1px solid rgba(212,175,55,0.38); border-radius: 7px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; pointer-events: none; }
    .grid-line { position: fixed; background: rgba(148,163,184,0.18); pointer-events: none; }
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
    scene.background = new THREE.Color(0x131722);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e1b2e, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4e0, 2.4);
    key.position.set(3.4, 5.4, 4.6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x93c5fd, 1.15);
    fill.position.set(-3.8, 2.9, 2.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc4b5fd, 1.5);
    rim.position.set(0, 4.0, -4.4);
    scene.add(rim);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.0, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0x1c2230, roughness: 0.65, metalness: 0.25 })
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
    const addDivider = (left, top, w, h) => {
      const d = document.createElement('div');
      d.className = 'grid-line';
      d.style.left = left + 'px';
      d.style.top = top + 'px';
      d.style.width = w + 'px';
      d.style.height = h + 'px';
      labelsEl.appendChild(d);
    };

    async function run() {
      if (charId === 'lineup') {
        const order = [
          { id: 'boryn', x: -2.6, rot: 0.16 },
          { id: 'kai', x: -1.28, rot: 0.08 },
          { id: 'kaijax', x: 0.0, rot: 0.0 },
          { id: 'jax', x: 1.28, rot: -0.08 },
          { id: 'borax', x: 2.6, rot: -0.16 },
        ];
        for (const item of order) {
          const gltf = await loadModel(item.id + '_master.glb');
          gltf.scene.position.set(item.x, 0, 0);
          gltf.scene.rotation.y = item.rot;
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            const idle = gltf.animations.find((c) => c.name === 'idle') || gltf.animations[0];
            mixer.clipAction(idle).play();
            mixer.update(0.25);
          }
          scene.add(gltf.scene);
        }
        const cam = new THREE.PerspectiveCamera(34, W / H, 0.1, 50);
        cam.position.set(0, 1.52, 7.75);
        cam.lookAt(0, 1.06, 0);
        renderer.setViewport(0, 0, W, H);
        renderer.setScissor(0, 0, W, H);
        renderer.render(scene, cam);
        addLabel('P1-G MASTERED 5-CHARACTER CANON LINEUP — BORYN · KAI · KAI-JAX (3 TAILS) · JAX · BORAX', 18, 16);
      } else {
        const gltf = await loadModel(charId + '_master.glb');
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          const idle = gltf.animations.find((c) => c.name === 'idle') || gltf.animations[0];
          mixer.clipAction(idle).play();
          mixer.update(0.2);
        }
        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const h = Math.max(1.65, box.max.y - box.min.y);
        const headY = h * 0.805;

        // 4-Quadrant Mastering Sheet:
        // Q1 (Top-Left, 38% W x 100% H): 3/4 Front Full-Body
        // Q2 (Mid, 28% W x 100% H): Orthographic Side Profile (Muzzle Wedge + Tail/Limb Sweep)
        // Q3 (Top-Right, 34% W x 50% H): Head / Sabertooth Fangs / Eyes Close-Up
        // Q4 (Bottom-Right, 34% W x 50% H): Rear / Dorsal Rig & Silhouette
        const w1 = Math.floor(W * 0.38);
        const w2 = Math.floor(W * 0.28);
        const w3 = W - w1 - w2;
        const halfH = Math.floor(H * 0.5);

        // Panel 1: 3/4 Front Full Body
        const camFront = new THREE.PerspectiveCamera(33, w1 / H, 0.1, 50);
        camFront.position.set(0.88, h * 0.54, h * 1.92);
        camFront.lookAt(0, h * 0.49, 0);
        renderer.setViewport(0, 0, w1, H);
        renderer.setScissor(0, 0, w1, H);
        renderer.render(scene, camFront);

        // Panel 2: Side Profile (Right-side profile showing muzzle protrusion, dorsal rig & tail sweep)
        const camSide = new THREE.PerspectiveCamera(33, w2 / H, 0.1, 50);
        camSide.position.set(h * 2.02, h * 0.53, 0.18);
        camSide.lookAt(0, h * 0.49, -0.04);
        renderer.setViewport(w1, 0, w2, H);
        renderer.setScissor(w1, 0, w2, H);
        renderer.render(scene, camSide);

        // Panel 3 (Top-Right): Head / Muzzle / Fangs / Iris Close-up
        const camHead = new THREE.PerspectiveCamera(25, w3 / (H - halfH), 0.05, 50);
        camHead.position.set(0.28, headY + 0.04, h * 0.68);
        camHead.lookAt(0, headY - 0.02, 0.06);
        renderer.setViewport(w1 + w2, halfH, w3, H - halfH);
        renderer.setScissor(w1 + w2, halfH, w3, H - halfH);
        renderer.render(scene, camHead);

        // Panel 4 (Bottom-Right): Rear Dorsal Silhouette
        const camBack = new THREE.PerspectiveCamera(35, w3 / halfH, 0.1, 50);
        camBack.position.set(-1.05, h * 0.56, -h * 1.88);
        camBack.lookAt(0, h * 0.48, 0);
        renderer.setViewport(w1 + w2, 0, w3, halfH);
        renderer.setScissor(w1 + w2, 0, w3, halfH);
        renderer.render(scene, camBack);

        addDivider(w1, 0, 1, H);
        addDivider(w1 + w2, 0, 1, H);
        addDivider(w1 + w2, halfH, w3, 1);

        addLabel(charId.toUpperCase() + ' MASTER v3.0 — 3/4 FRONT', 12, 12);
        addLabel('SIDE PROFILE (MUZZLE & DORSAL)', w1 + 12, 12);
        addLabel('HEAD / FANGS / CORNEA CLOSE-UP', w1 + w2 + 12, 12);
        addLabel('REAR DORSAL SILHOUETTE', w1 + w2 + 12, halfH + 12);
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

async function setViewport(cdp, width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 90 },
  });
  await cdp.send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new Event('resize'))`,
  });
}

async function saveScreenshot(cdp, filename) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  console.log(`[CAPTURED] ${path.relative(ROOT, dest)}`);
}

async function evalJson(cdp, expr) {
  const res = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify(${expr})`,
    returnByValue: true,
  });
  return res?.result?.value ? JSON.parse(res.result.value) : null;
}

async function waitForExpr(cdp, expr, timeoutMs = 18000) {
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

async function auditHudViewport(cdp, label) {
  return evalJson(
    cdp,
    `(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const clipped = [];
      const overflowViewport = [];
      const undersizedTouch = [];

      const hudRoot = document.querySelector('.safe-area-pad');
      if (!hudRoot) return { label: ${JSON.stringify(label)}, error: 'missing_hud_root' };

      // Check all visible text/button descendants inside HUD
      const elements = Array.from(hudRoot.querySelectorAll('button, span, div'));
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Check horizontal ellipsis/clipping on leaf text nodes or nowrap labels
        if (
          el.children.length === 0 &&
          (el.textContent || '').trim().length > 0 &&
          el.scrollWidth > el.clientWidth + 2
        ) {
          clipped.push({
            text: (el.textContent || '').trim(),
            clientWidth: Math.round(el.clientWidth),
            scrollWidth: Math.round(el.scrollWidth),
          });
        }

        if (el.tagName === 'BUTTON') {
          if (rect.left < -1 || rect.top < -1 || rect.right > vw + 1.5 || rect.bottom > vh + 1.5) {
            overflowViewport.push({
              text: (el.textContent || el.getAttribute('aria-label') || '').trim(),
              rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)],
            });
          }
          if (rect.height < 35.5) {
            undersizedTouch.push({
              text: (el.textContent || el.getAttribute('aria-label') || '').trim(),
              height: Math.round(rect.height),
            });
          }
        }
      }

      // Check Left Joystick vs Right Combat Cluster clearance
      const joy = hudRoot.querySelector('[aria-label="Movement Joystick"]');
      const sprintBtn = Array.from(hudRoot.querySelectorAll('button')).find((b) => /Sprint/i.test(b.textContent || ''));
      const skill1Btn = Array.from(hudRoot.querySelectorAll('button')).find((b) =>
        /Venom Strike|Displacement Burst|Ember Venom/i.test(b.textContent || '')
      );
      const vitalsCard = hudRoot.querySelector('[role="progressbar"][aria-label="Hero Health"]')?.closest('div.rounded-xl')?.parentElement;

      const leftMaxX = Math.max(
        joy ? joy.getBoundingClientRect().right : 0,
        sprintBtn ? sprintBtn.getBoundingClientRect().right : 0
      );
      const rightMinX = skill1Btn ? skill1Btn.getBoundingClientRect().left : vw;
      const topLeftBottomY = vitalsCard ? vitalsCard.getBoundingClientRect().bottom : 0;
      const joyTopY = joy ? joy.getBoundingClientRect().top : vh;

      // Check if Duo Finisher button (if visible) obstructs center 3D combat zone [0.34*vw..0.66*vw, 0.22*vh..0.76*vh]
      const duoBtn = Array.from(hudRoot.querySelectorAll('button')).find((b) => /Duo Finisher/i.test(b.textContent || ''));
      let duoCenterOverlap = false;
      let duoRect = null;
      if (duoBtn) {
        const r = duoBtn.getBoundingClientRect();
        duoRect = [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
        const cLeft = vw * 0.34, cRight = vw * 0.66, cTop = vh * 0.22, cBot = vh * 0.76;
        duoCenterOverlap = !(r.right < cLeft || r.left > cRight || r.bottom < cTop || r.top > cBot);
      }

      return {
        label: ${JSON.stringify(label)},
        viewport: [vw, vh],
        clippedCount: clipped.length,
        clipped,
        overflowCount: overflowViewport.length,
        overflowViewport,
        undersizedTouchCount: undersizedTouch.length,
        horizontalClusterGapPx: Math.round(rightMinX - leftMaxX),
        verticalLeftGapPx: Math.round(joyTopY - topLeftBottomY),
        duoPromptVisible: Boolean(duoBtn),
        duoRect,
        duoCenterOverlap,
      };
    })()`
  );
}

async function main() {
  const harnessServer = await startHarnessServer();
  const { proc, cdp } = await launchChrome();
  const telemetry = {
    timestamp: new Date().toISOString(),
    gpuBackend: null,
    characterTurnaroundsCaptured: [],
    hudAudits: [],
    combatSequenceEvents: [],
    performanceSnapshots: {},
    inputDispatchLatencyMs: null,
  };

  try {
    // 1. Capture 4-Panel Mastered Character Sheets (1440x860)
    await setViewport(cdp, 1440, 860);
    for (const ch of ['kai', 'jax', 'kaijax', 'boryn', 'borax', 'lineup']) {
      await cdp.send('Page.navigate', {
        url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?char=${ch}`,
      });
      await waitForExpr(cdp, 'window.__HARNESS_READY__ || window.__HARNESS_ERROR__', 18000);
      await sleep(250);
      const fn = `char_${ch}.png`;
      await saveScreenshot(cdp, fn);
      telemetry.characterTurnaroundsCaptured.push(fn);
    }

    // 2. Launch Live App & Capture Title Showcase + GPU Renderer Info (wait until all 5 GLBs render!)
    await setViewport(cdp, 1440, 900);
    await cdp.send('Page.navigate', { url: APP_URL });
    await waitForExpr(
      cdp,
      'window.__KAIJAX_ENGINE__ && Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().characterGlbStatus).every((s) => s === "ready") && window.__KAIJAX_ENGINE__.getQualificationDiagnostics().perf.activeTriangles > 20000',
      22000
    );
    await sleep(450);

    telemetry.gpuBackend = await evalJson(
      cdp,
      `(() => {
        const gl = document.querySelector('canvas')?.getContext('webgl2');
        const ext = gl?.getExtension('WEBGL_debug_renderer_info');
        return {
          renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER),
          vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl?.getParameter(gl.VENDOR),
        };
      })()`
    );
    telemetry.performanceSnapshots.titleShowcase = await evalJson(
      cdp,
      `(() => ({
        diag: window.__KAIJAX_ENGINE__.getQualificationDiagnostics(),
        heapUsedMB: performance.memory ? Number((performance.memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
      }))()`
    );
    await saveScreenshot(cdp, 'title_desktop_1440x900.png');

    await setViewport(cdp, 844, 390);
    await sleep(450);
    await saveScreenshot(cdp, 'title_mobile_844x390.png');
    telemetry.hudAudits.push(await auditHudViewport(cdp, 'title_mobile_844x390'));

    // Enter Ashblock Heights Gameplay
    await setViewport(cdp, 1440, 900);
    await sleep(300);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find((b) => /Enter Ashblock|New Game|New Campaign/i.test(b.textContent || ''));
        if (startBtn) startBtn.click();
      })()`,
    });
    await sleep(1100);

    // Capture Mobile Landscape Dialogue + HUD Coexistence, then Skip Scene
    await setViewport(cdp, 844, 390);
    await sleep(450);
    await saveScreenshot(cdp, 'hud_dialogue_mobile_844x390.png');

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const skipBtn = btns.find((b) => /Skip Scene/i.test(b.textContent || ''));
        if (skipBtn) skipBtn.click();
      })()`,
    });
    await sleep(500);

    // 3. Audit & Capture All 4 Responsive Viewports (Kai + Jax Longest Ability Labels!)
    const viewports = [
      { name: 'mobile_844x390', w: 844, h: 390 },
      { name: 'android_915x412', w: 915, h: 412 },
      { name: 'tablet_1180x820', w: 1180, h: 820 },
      { name: 'desktop_1440x900', w: 1440, h: 900 },
    ];
    for (const vp of viewports) {
      await setViewport(cdp, vp.w, vp.h);
      await sleep(420);
      await saveScreenshot(cdp, `hud_${vp.name}.png`);
      telemetry.hudAudits.push(await auditHudViewport(cdp, `kai_${vp.name}`));
    }

    // Switch to JAX (longest ability labels: Displacement Burst / Storm Pressure / Lightning Channeling) and audit 844x390!
    await setViewport(cdp, 844, 390);
    await sleep(250);
    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.triggerSwitchHero()`,
    });
    await sleep(450);
    await saveScreenshot(cdp, 'hud_jax_mobile_844x390.png');
    telemetry.hudAudits.push(await auditHudViewport(cdp, 'jax_mobile_844x390'));

    // Switch back to KAI for Combat Sequence Certification
    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.triggerSwitchHero()`,
    });
    await sleep(300);

    // Measure Touch/Pointer Dispatch Latency on Attack Button
    telemetry.inputDispatchLatencyMs = await evalJson(
      cdp,
      `(() => {
        const atkBtn = Array.from(document.querySelectorAll('button')).find((b) => /Attack|Counter/i.test(b.textContent || ''));
        if (!atkBtn) return null;
        const t0 = performance.now();
        atkBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
        const t1 = performance.now();
        return Number((t1 - t0).toFixed(3));
      })()`
    );

    // 4. Live Combat Feel, Buffering, Duo Prompt & Camera Framing Certification
    // Teleport close to Stage 0 Fang Brawler (-3, 0, -8) with Duo Synergy = 85 so Duo Finisher [G] prompt appears!
    await setViewport(cdp, 844, 390);
    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.teleportForQualification(-2.2, 0, -4.6, 85)`,
    });
    await sleep(450);
    await saveScreenshot(cdp, 'hud_duo_prompt_844x390.png');
    telemetry.hudAudits.push(await auditHudViewport(cdp, 'duo_prompt_mobile_844x390'));

    // Step into 1280x720 HD gameplay capture for the 4-frame Combat Certification Sequence
    await setViewport(cdp, 1280, 720);
    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.teleportForQualification(-2.6, 0, -5.8, 55)`,
    });
    await sleep(380);

    // Combat Frame 1: Free-Flow Light Attack + Buffered Second Light Strike
    const c1 = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerLightAttack();
        eng.triggerLightAttack(); // Pressed mid-swing -> enters combatBuffer!
        return eng.getQualificationDiagnostics();
      })()`
    );
    telemetry.combatSequenceEvents.push({ step: '1_light_and_buffer', diag: c1 });
    await sleep(350);
    await saveScreenshot(cdp, 'combat_01_freeflow_combo.png');

    // Combat Frame 2: Kai Tactical Web Pull / Wall Pin
    await sleep(320);
    const c2 = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerTacticalAction();
        return eng.getQualificationDiagnostics();
      })()`
    );
    telemetry.combatSequenceEvents.push({ step: '2_kai_web_tactical', diag: c2 });
    await sleep(350);
    await saveScreenshot(cdp, 'combat_02_web_wallpin.png');

    // Combat Frame 3: Smooth Brother Switch to Jax + Electric Launcher
    const c3 = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerSwitchHero();
        eng.triggerTacticalAction();
        return eng.getQualificationDiagnostics();
      })()`
    );
    telemetry.combatSequenceEvents.push({ step: '3_jax_switch_and_launcher', diag: c3 });
    await sleep(380);
    await saveScreenshot(cdp, 'combat_03_jax_switch_launcher.png');

    // Record Combat Performance Snapshot
    telemetry.performanceSnapshots.activeCombat = await evalJson(
      cdp,
      `(() => ({
        diag: window.__KAIJAX_ENGINE__.getQualificationDiagnostics(),
        heapUsedMB: performance.memory ? Number((performance.memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
      }))()`
    );

    // Combat Frame 4: Trigger Duo Finisher & Verify Midpoint Camera + Peripheral Banner
    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.teleportForQualification(1.8, 0, -9.2, 90)`,
    });
    await sleep(350);
    const c4 = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        const accepted = eng.triggerDuoFinisher();
        return { accepted, diag: eng.getQualificationDiagnostics() };
      })()`
    );
    telemetry.combatSequenceEvents.push({ step: '4_duo_finisher', ...c4 });
    await sleep(420);
    await saveScreenshot(cdp, 'combat_04_duo_finisher.png');

    telemetry.performanceSnapshots.duoFinisher = await evalJson(
      cdp,
      `(() => ({
        diag: window.__KAIJAX_ENGINE__.getQualificationDiagnostics(),
        heapUsedMB: performance.memory ? Number((performance.memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
      }))()`
    );

    // 5. Ashblock Heights Vertical Catwalk Perch & Street Storytelling Capture (1440x900)
    await setViewport(cdp, 1440, 900);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        // Place hero on the West Elevated Scaffolding Catwalk (-14.2, 3.68, -9.5) overlooking Ashblock Row!
        eng.teleportForQualification(-14.2, 3.68, -9.5, 55);
      })()`,
    });
    await sleep(650);
    await saveScreenshot(cdp, 'ashblock_vertical_catwalk_1440x900.png');

    telemetry.performanceSnapshots.verticalCatwalk = await evalJson(
      cdp,
      `(() => ({
        diag: window.__KAIJAX_ENGINE__.getQualificationDiagnostics(),
        heapUsedMB: performance.memory ? Number((performance.memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
      }))()`
    );

    // Save structured telemetry report
    const telemetryPath = path.join(ROOT, 'docs', 'production', 'p1g-telemetry.json');
    fs.writeFileSync(telemetryPath, JSON.stringify(telemetry, null, 2));
    console.log(`[SAVED TELEMETRY] ${path.relative(ROOT, telemetryPath)}`);

    // Print concise HUD audit summary
    for (const a of telemetry.hudAudits) {
      console.log(
        `[HUD AUDIT] ${a.label}: clipped=${a.clippedCount}, overflow=${a.overflowCount}, hGap=${a.horizontalClusterGapPx}px, vGap=${a.verticalLeftGapPx}px, duoCenterOverlap=${a.duoCenterOverlap}`
      );
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
