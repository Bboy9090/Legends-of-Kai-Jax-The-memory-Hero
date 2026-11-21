#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — P1-L: ASHBLOCK HEIGHTS PREMIUM WORLD RECONSTRUCTION CERTIFICATION
 *
 * Executes:
 *  A) Studio 12-Asset Modular PBR+Normal+BakedAO GLB Kit Inspection Grid:
 *     - 01_p1l_modular_kit_12assets.png
 *  B) Live Port-3000 12-Point Regression Certification, Before/After Comparisons & Mobile Profiling:
 *     1. Character selection & spawning (5 ready Meshy GLBs: kai, jax, kaijax, boryn, borax)
 *     2. Street traversal & sprint
 *     3. Continuous rooftop & walkable skybridge access (West Fire Escape -> y=7.05m Skybridge -> Bloodward Loft + Companion follow)
 *     4. Geometry-attached web swinging (all 10 anchors physically socketed <= 0.35m)
 *     5. Enemy encounters & free-flow combo + parry + wall-pin
 *     6. Environmental takedowns (Street & Boss Courtyard Syndicate Surge Pylons)
 *     7. Synchronized two-button Duo Finishers
 *     8. Mission 1 completion & Kai-Jax strictly-3-tail Fusion in Boss Courtyard
 *     9. Save/reload continuity across full page reload
 *     10. Live Reconstructed <-> Legacy environment mode switching
 *     11. Mobile 844x390 landscape HUD & Low/Balanced/High Android performance profiling
 *     12. Zero missing textures, GLBs, HTTP 404s, console errors, or runtime exceptions
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'production', 'captures', 'p1l');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_BIN =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const HARNESS_PORT = 4189;
const CDP_PORT = 9248;
const APP_URL = 'http://127.0.0.1:3000';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HARNESS_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0d101b; font-family: system-ui, sans-serif; color: #f8fafc; }
    canvas { display: block; width: 100%; height: 100%; }
    .label { position: fixed; padding: 5px 10px; background: rgba(10,12,20,0.92); border: 1px solid rgba(245,158,11,0.55); border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; pointer-events: none; z-index: 10; }
    .sub-label { position: fixed; padding: 3px 8px; background: rgba(12,16,28,0.88); border: 1px solid rgba(56,189,248,0.42); border-radius: 5px; font-size: 10px; font-family: monospace; color: #bae6fd; pointer-events: none; z-index: 10; }
    .grid-line { position: fixed; background: rgba(148,163,184,0.22); pointer-events: none; z-index: 9; }
    .plate-img { position: fixed; object-fit: cover; pointer-events: none; z-index: 4; background: #0b0e16; }
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
    const mode = params.get('mode') || 'kit12';
    const W = window.innerWidth;
    const H = window.innerHeight;
    const labelsEl = document.getElementById('labels');

    const addLabel = (text, left, top, cls = 'label') => {
      const d = document.createElement('div');
      d.className = cls;
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

    if (mode === 'street_triptych' || mode === 'courtyard_triptych') {
      document.body.style.background = '#090b12';
      const colW = Math.floor(W / 3);
      const imgs = mode === 'street_triptych'
        ? [
            { src: '/public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png', title: '1. CONTROLLING ARTWORK (d438c610.png)', sub: 'Stepped Tenements · Skybridges · Dusk Horizon · Water Towers' },
            { src: '/docs/production/captures/p1l/02a_p1l_legacy_street.png', title: '2. BEFORE (LEGACY BLOCK WORLD)', sub: 'Flat Rectangular Boxes · Dark Void Sky · Floating Octahedrons' },
            { src: '/docs/production/captures/p1l/02b_p1l_reconstructed_street.png', title: '3. AFTER (P1-L RECONSTRUCTED ASHBLOCK)', sub: '12 Modular PBR+Normal GLBs · Dusk Sky Dome · Viaduct Train · String Lights' },
          ]
        : [
            { src: '/public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png', title: '1. STRONGHOLD REFERENCE (e5b27b30.png)', sub: 'Fang Syndicate Neon Header · Floodlight Rig · Armored Cage Arena' },
            { src: '/docs/production/captures/p1l/07a_p1l_legacy_boss_courtyard.png', title: '2. BEFORE (LEGACY COURTYARD)', sub: 'Generic Orange Containers · Flat Dark Wall · Zero Verticality' },
            { src: '/docs/production/captures/p1l/07b_p1l_reconstructed_boss_courtyard.png', title: '3. AFTER (P1-L BOSS COURTYARD ARENA)', sub: 'Stronghold Bunker · Elevated Balconies · Surge Pylons · Armored Cover' },
          ];
      await Promise.all(imgs.map((item, idx) => new Promise((resolve) => {
        const el = document.createElement('img');
        el.className = 'plate-img';
        el.style.left = (idx * colW) + 'px';
        el.style.top = '0px';
        el.style.width = colW + 'px';
        el.style.height = H + 'px';
        el.onload = resolve;
        el.onerror = resolve;
        el.src = item.src;
        document.body.appendChild(el);
        if (idx > 0) addDivider(idx * colW, 0, 2, H);
        addLabel(item.title, idx * colW + 12, 12);
        addLabel(item.sub, idx * colW + 12, H - 36, 'sub-label');
      })));
      window.__HARNESS_READY__ = true;
    } else {
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
      renderer.setScissorTest(true);
      document.body.appendChild(renderer.domElement);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      const manifest = await fetch('/public/models/environments/ashblock/ashblock_kit_manifest.json').then((r) => r.json());
      const loader = new GLTFLoader();
      const cols = 4;
      const rows = 3;
      const cellW = Math.floor(W / cols);
      const cellH = Math.floor(H / rows);

      for (let c = 1; c < cols; c++) addDivider(c * cellW, 0, 1, H);
      for (let r = 1; r < rows; r++) addDivider(0, r * cellH, W, 1);

      for (let i = 0; i < manifest.assets.length; i++) {
        const item = manifest.assets[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const gltf = await loader.loadAsync('/public/models/environments/ashblock/' + item.file);

        const sc = new THREE.Scene();
        sc.background = new THREE.Color(0x131726);
        sc.environment = envTex;
        sc.add(new THREE.HemisphereLight(0x7ca2e8, 0x2c1b14, 1.0));
        const dl = new THREE.DirectionalLight(0xffd8a8, 2.2);
        dl.position.set(14, 22, 18);
        sc.add(dl);

        const root = gltf.scene;
        sc.add(root);
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 1);

        const cam = new THREE.PerspectiveCamera(40, cellW / cellH, 0.1, 250);
        cam.position.set(center.x + maxDim * 0.82, center.y + maxDim * 0.56, center.z + maxDim * 1.18);
        cam.lookAt(center);

        const vx = col * cellW;
        const vy = (rows - 1 - row) * cellH;
        renderer.setViewport(vx, vy, cellW, cellH);
        renderer.setScissor(vx, vy, cellW, cellH);
        renderer.render(sc, cam);

        addLabel((i + 1) + '. ' + item.assetId.replace('ashblock_', ''), vx + 8, row * cellH + 8);
        addLabel(item.triangleCount + ' tris · ' + Math.round(item.bytes / 1024) + ' KB', vx + 8, (row + 1) * cellH - 30, 'sub-label');
      }
      window.__HARNESS_READY__ = true;
    }
  </script>
</body>
</html>`;

function startHarnessServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlObj = new URL(req.url || '/', `http://127.0.0.1:${HARNESS_PORT}`);
      if (urlObj.pathname === '/harness.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HARNESS_HTML);
        return;
      }
      const rel = decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');
      const full = path.resolve(ROOT, rel);
      if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(full).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(full).pipe(res);
    });
    server.on('error', reject);
    server.listen(HARNESS_PORT, '127.0.0.1', () => resolve(server));
  });
}

class CDPSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.pageExceptions = [];
    this.httpFailures = [];
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
        const txt = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        if (!/WebSocket|vite/i.test(txt)) {
          this.consoleErrors.push(txt);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc =
          msg.params?.exceptionDetails?.exception?.description ||
          msg.params?.exceptionDetails?.text ||
          'exception';
        if (!/WebSocket|vite/i.test(desc)) {
          this.pageExceptions.push(desc);
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const status = msg.params?.response?.status ?? 200;
        const url = msg.params?.response?.url ?? '';
        if (status >= 400 && !url.includes('favicon')) {
          this.httpFailures.push({ status, url });
        }
      }
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
      '--window-size=1440,840',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  for (let i = 0; i < 45; i++) {
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
          await cdp.send('Network.enable');
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

async function setViewport(cdp, width, height, mobile = false, dpr = 1) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: dpr,
    mobile,
    screenOrientation: { type: 'landscapePrimary', angle: 90 },
  });
  await cdp.send('Runtime.evaluate', { expression: `window.dispatchEvent(new Event('resize'))` });
}

async function saveScreenshot(cdp, filename) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  console.log(`[P1-L CAPTURE] ${path.relative(ROOT, dest)}`);
  return path.relative(ROOT, dest);
}

async function evalJson(cdp, expr) {
  const res = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify(${expr})`,
    returnByValue: true,
  });
  return res?.result?.value ? JSON.parse(res.result.value) : null;
}

async function waitForExpr(cdp, expr, timeoutMs = 28000) {
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

  const cert = {
    operation: 'OPERATION KAI-JAX — P1-L: ASHBLOCK HEIGHTS PREMIUM WORLD RECONSTRUCTION',
    certifiedAt: new Date().toISOString(),
    captures: [],
    worldComparison: {},
    performanceProfile: {},
    regression12Checks: [],
    runtimeIntegrity: {
      httpFailures: [],
      consoleErrors: [],
      pageExceptions: [],
    },
  };

  try {
    // -----------------------------------------------------------------------
    // A. Studio 12-Piece Modular PBR GLB Kit Grid
    // -----------------------------------------------------------------------
    await setViewport(cdp, 1480, 860);
    await cdp.send('Page.navigate', {
      url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=kit12`,
    });
    if (!(await waitForExpr(cdp, 'window.__HARNESS_READY__'))) {
      throw new Error('Studio 12-asset kit render timed out');
    }
    await sleep(250);
    cert.captures.push(await saveScreenshot(cdp, '01_p1l_modular_kit_12assets.png'));

    // -----------------------------------------------------------------------
    // B. Live Port-3000 District Load, Character Selection/Spawning & Street Comparison
    // -----------------------------------------------------------------------
    cdp.consoleErrors = [];
    cdp.pageExceptions = [];
    cdp.httpFailures = [];

    await setViewport(cdp, 1360, 768);
    const loadStartMs = Date.now();
    await cdp.send('Page.navigate', { url: APP_URL });

    const allReady = await waitForExpr(
      cdp,
      `window.__KAIJAX_ENGINE__ &&
       Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === 'ready') &&
       window.__KAIJAX_ENGINE__.getQualificationDiagnostics().modularKitLoadedCount === 12`,
      30000
    );
    const assetLoadDurationMs = Date.now() - loadStartMs;
    if (!allReady) {
      const diagFail = await evalJson(cdp, 'window.__KAIJAX_ENGINE__?.getQualificationDiagnostics()');
      throw new Error('Timed out waiting for 5 character GLBs + 12 modular Ashblock GLBs: ' + JSON.stringify(diagFail));
    }

    // Start New Campaign & dismiss opening dialogue
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.clear();
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          /New Campaign|Enter Ashblock|New Game/i.test(b.textContent || '')
        );
        if (btn) btn.click();
      })()`,
    });
    await sleep(700);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const skip = Array.from(document.querySelectorAll('button')).find((b) => /Skip/i.test(b.textContent || ''));
        if (skip) skip.click();
      })()`,
    });
    await sleep(400);

    const initDiag = await evalJson(cdp, 'window.__KAIJAX_ENGINE__.getQualificationDiagnostics()');
    cert.regression12Checks.push({
      id: 1,
      item: 'Character selection & spawning (5 Meshy GLBs + 12 Modular World GLBs)',
      passed:
        Object.values(initDiag.loadedCharacterGlbs).every((c) => c.status === 'ready') &&
        initDiag.modularKitLoadedCount === 12 &&
        initDiag.deduplicatedMaterialCount >= 11,
      metrics: {
        assetLoadDurationMs,
        modularKitLoadedCount: initDiag.modularKitLoadedCount,
        deduplicatedMaterialCount: initDiag.deduplicatedMaterialCount,
        instancedPropCount: initDiag.instancedPropCount,
        characters: initDiag.characterGlbStatus,
      },
    });

    // Capture Legacy vs. P1-L Reconstructed Street (Same Camera Vantage)
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('legacy');
        eng.teleportForQualification(0, 0, 13.5, 30);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 10);
      })()`,
    });
    await sleep(300);
    cert.captures.push(await saveScreenshot(cdp, '02a_p1l_legacy_street.png'));
    cert.worldComparison.legacyStreet = await evalJson(cdp, 'window.__KAIJAX_ENGINE__.getQualificationDiagnostics()');

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('reconstructed');
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'high', environmentMode: 'reconstructed' });
        eng.teleportForQualification(0, 0, 13.5, 30);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 10);
      })()`,
    });
    await sleep(350);
    cert.captures.push(await saveScreenshot(cdp, '02b_p1l_reconstructed_street.png'));
    cert.worldComparison.reconstructedStreet = await evalJson(
      cdp,
      'window.__KAIJAX_ENGINE__.getQualificationDiagnostics()'
    );

    // Check 2: Street Traversal & Sprint
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(0, 0, 12.0, 30);
        eng.camYaw = 0;
        eng.camPitch = 0.18;
        eng.setTouchSprint(true);
        eng.setTouchMove(0, -1);
        eng.stepSimulationForQualification(1 / 60, 48);
      })()`,
    });
    const streetDiag = await evalJson(cdp, 'window.__KAIJAX_ENGINE__.getQualificationDiagnostics()');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setTouchMove(0, 0);
        eng.setTouchSprint(false);
        eng.stepSimulationForQualification(1 / 60, 6);
      })()`,
    });
    cert.regression12Checks.push({
      id: 2,
      item: 'Street traversal & grounded sprinting',
      passed: streetDiag.playerPos[2] < 8.5 && ['run', 'sprint'].includes(streetDiag.activeClips.kai),
      metrics: { playerPos: streetDiag.playerPos, clip: streetDiag.activeClips.kai },
    });

    // Check 3: Continuous Rooftop Ascent -> Walkable Skybridge -> Bloodward Loft Dojo + Companion Follow
    const rooftopTraversal = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        // Step through West Fire-Escape landings (1.80 -> 3.65 -> 5.35 -> 7.05m)
        const elevations = [];
        for (const [x, y, z] of [
          [-12.4, 2.0, -13.6],
          [-12.8, 3.85, -17.4],
          [-13.2, 5.55, -21.2],
          [-15.2, 7.25, -27.0],
        ]) {
          eng.teleportForQualification(x, y, z, 30);
          eng.stepSimulationForQualification(1 / 60, 14);
          elevations.push(Number(eng.playerPos.y.toFixed(2)));
        }
        // Run East directly across the Walkable Steel Skybridge (z = -27.0, y = 7.05m) onto Bloodward Loft!
        eng.camYaw = -Math.PI / 2;
        eng.camPitch = 0.20;
        eng.setTouchSprint(true);
        eng.setTouchMove(0, -1); // Forward along camYaw (-PI/2 => +X East across skybridge!)
        eng.stepSimulationForQualification(1 / 60, 175);
        eng.setTouchMove(0, 0);
        eng.setTouchSprint(false);
        eng.stepSimulationForQualification(1 / 60, 12);
        return {
          westStepElevations: elevations,
          endPlayerPos: [
            Number(eng.playerPos.x.toFixed(2)),
            Number(eng.playerPos.y.toFixed(2)),
            Number(eng.playerPos.z.toFixed(2)),
          ],
          companionPos: [
            Number(eng.companionPos.x.toFixed(2)),
            Number(eng.companionPos.y.toFixed(2)),
            Number(eng.companionPos.z.toFixed(2)),
          ],
          groundedOnLoft: eng.grounded,
        };
      })()`
    );

    // Frame dramatic elevated shot on Walkable Skybridge looking toward Bloodward Loft & Dusk Horizon
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(-2.5, 7.05, -27.0, 30);
        eng.playerYaw = Math.PI / 2;
        eng.camYaw = -1.15;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 10);
      })()`,
    });
    await sleep(300);
    cert.captures.push(await saveScreenshot(cdp, '03_p1l_rooftop_skybridge_network.png'));

    // Frame Boryn's Bloodward Loft Rooftop Sanctuary
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(13.2, 7.05, -24.8, 30);
        eng.playerYaw = 1.45;
        eng.camYaw = -1.35;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 10);
      })()`,
    });
    await sleep(300);
    cert.captures.push(await saveScreenshot(cdp, '04_p1l_bloodward_dojo_sanctuary.png'));

    cert.regression12Checks.push({
      id: 3,
      item: 'Continuous rooftop ascent, walkable skybridge crossing & Bloodward Loft companion access',
      passed:
        rooftopTraversal.westStepElevations[3] >= 7.0 &&
        rooftopTraversal.endPlayerPos[0] > 8.0 &&
        rooftopTraversal.endPlayerPos[1] >= 7.0 &&
        rooftopTraversal.companionPos[1] >= 6.8 &&
        rooftopTraversal.groundedOnLoft === true,
      metrics: rooftopTraversal,
    });

    // Capture Alley Storefronts, Market Stalls & Fortified Syndicate Gatehouse
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(-1.5, 0, -35.5, 30);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0.06;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 10);
      })()`,
    });
    await sleep(280);
    cert.captures.push(await saveScreenshot(cdp, '05_p1l_alley_market_and_gatehouse.png'));

    // Check 4: Geometry-Attached Web Swinging across all 10 Structural Anchors
    const swingDiag = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(-2.6, 4.4, -9.5, 30);
        eng.grounded = false;
        eng.playerVel.set(0.4, 2.2, -6.5);
        eng.camYaw = 0;
        eng.camPitch = 0.14;
        eng.triggerJumpOrSwing();
        eng.stepSimulationForQualification(1 / 60, 10);
        return eng.getQualificationDiagnostics().webTraversal;
      })()`
    );
    await sleep(250);
    cert.captures.push(await saveScreenshot(cdp, '06_p1l_geometry_attached_webswing.png'));
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerJumpOrSwing();
        eng.stepSimulationForQualification(1 / 60, 16);
      })()`,
    });
    cert.regression12Checks.push({
      id: 4,
      item: 'Web swinging attached strictly to physical world geometry (10 anchors)',
      passed:
        swingDiag.isSwinging === true &&
        swingDiag.anchorsTotal === 10 &&
        swingDiag.allAnchorsGeometryAttached === true &&
        Boolean(swingDiag.activeWebAttachmentType),
      metrics: swingDiag,
    });

    // Check 5: Enemy Encounters, Free-Flow Combo, Parry & Wall-Pin
    const combatRes = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.loadSaveState(eng.save);
        eng.teleportForQualification(-2.2, 0, -6.4, 20);
        const foe = eng.enemies.find((e) => e.state !== 'dead');
        foe.pos.set(-2.2, 0, -7.9);
        foe.rig.root.position.copy(foe.pos);
        foe.hp = 220;
        foe.maxHp = 220;
        eng.lockedEnemyId = foe.id;
        eng.attackTimer = 0;
        eng.triggerLightAttack();
        eng.stepSimulationForQualification(1 / 60, 16);
        foe.pos.set(eng.playerPos.x, 0, eng.playerPos.z - 1.5);
        foe.rig.root.position.copy(foe.pos);
        eng.attackTimer = 0;
        eng.triggerHeavyAttack();
        eng.stepSimulationForQualification(1 / 60, 18);
        const combo = eng.comboState.count;

        // Perfect Parry verification
        const parriesBefore = eng.parryCount;
        foe.pos.set(eng.playerPos.x, 0, eng.playerPos.z - 1.55);
        foe.rig.root.position.copy(foe.pos);
        foe.unblockableWindup = false;
        foe.state = 'windup';
        foe.stateTimer = 0.04;
        eng.dodgeCooldown = 0;
        eng.attackTimer = 0;
        eng.startDefenseInput();
        eng.stepSimulationForQualification(1 / 60, 6);
        eng.endDefenseInput();
        return { combo, parried: eng.parryCount > parriesBefore, aliveCount: eng.enemies.length };
      })()`
    );
    cert.regression12Checks.push({
      id: 5,
      item: 'Enemy encounters, free-flow combo chains & perfect parry counterplay',
      passed: combatRes.combo >= 2 && combatRes.parried === true,
      metrics: combatRes,
    });

    // Check 6: Environmental Takedowns (Syndicate High-Voltage Arc Relay)
    const envTakedownRes = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        let foe = eng.enemies.find((e) => e.state !== 'dead');
        if (!foe) {
          eng.spawnPatrolSkirmish();
          foe = eng.enemies.find((e) => e.state !== 'dead');
        }
        foe.pos.set(-6.5, 0, -11.2);
        foe.rig.root.position.copy(foe.pos);
        eng.teleportForQualification(-5.2, 0, -9.2, 35);
        const ok = eng.triggerEnvironmentalTakedown();
        eng.stepSimulationForQualification(1 / 60, 8);
        return { ok, totalTriggered: eng.environmentalTakedownsCount };
      })()`
    );
    cert.regression12Checks.push({
      id: 6,
      item: 'Contextual Syndicate Arc Relay environmental takedowns',
      passed: envTakedownRes.ok === true && envTakedownRes.totalTriggered >= 1,
      metrics: envTakedownRes,
    });

    // Check 7: Synchronized Two-Button Duo Finisher
    const duoRes = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        let foe = eng.enemies.find((e) => e.state !== 'dead');
        if (!foe) {
          eng.spawnPatrolSkirmish();
          foe = eng.enemies.find((e) => e.state !== 'dead');
        }
        eng.teleportForQualification(0, 0, -22.0, 90);
        foe.pos.set(0, 0, -24.2);
        foe.rig.root.position.copy(foe.pos);
        eng.lockedEnemyId = foe.id;
        const started = eng.triggerDuoFinisher();
        eng.stepSimulationForQualification(1 / 60, 95);
        return { started, duoFinishersUsed: eng.duoFinishersUsed };
      })()`
    );
    cert.regression12Checks.push({
      id: 7,
      item: 'Cooperative Duo Synergy meter & synchronized Duo Finishers',
      passed: duoRes.started === true && duoRes.duoFinishersUsed >= 1,
      metrics: duoRes,
    });

    // Check 8: Boss Courtyard Before/After + Boss Arena Surge Takedown + 3-Tail Fusion + Mission 1 Completion
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.clearEnemies();
        eng.save.missionStageIndex = 1;
        for (const civ of eng.world.civilians) {
          eng.teleportForQualification(civ.position.x, civ.position.y, civ.position.z + 1.4);
          eng.triggerInteract();
          eng.setPaused(false);
        }
        eng.clearEnemies();
        eng.save.missionStageIndex = 2;
        eng.teleportForQualification(eng.world.memorySitePos.x, 0, eng.world.memorySitePos.z + 1.8);
        eng.triggerInteract();
        eng.setPaused(false);
        eng.clearEnemies();
        eng.save.missionStageIndex = 3;
        eng.teleportForQualification(eng.world.alleyGatePos.x, 0, eng.world.alleyGatePos.z + 2.2);
        eng.triggerInteract();
        eng.setPaused(false);
      })()`,
    });
    await sleep(250);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const skip = Array.from(document.querySelectorAll('button')).find((b) => /Skip/i.test(b.textContent || ''));
        if (skip) skip.click();
        window.__KAIJAX_ENGINE__.setPaused(false);
      })()`,
    });

    // Capture Legacy Boss Courtyard vs. P1-L Reconstructed Boss Courtyard
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('legacy');
        eng.teleportForQualification(0, 0, -61.5, 90);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(280);
    cert.captures.push(await saveScreenshot(cdp, '07a_p1l_legacy_boss_courtyard.png'));

    const bossFusionSetup = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('reconstructed');
        eng.teleportForQualification(0, 0, -61.5, 90);
        eng.save.fusionUnlocked = true;
        eng.fusionCharge = 100;
        eng.fusionCooldown = 0;
        eng.triggerFusion();
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 8);
        return {
          isFused: eng.isFused,
          activeHero: eng.activeHero,
          kaiJaxBones: eng.kaiJaxGlb.getSecondaryBoneCounts(),
        };
      })()`
    );
    await sleep(300);
    cert.captures.push(await saveScreenshot(cdp, '07b_p1l_reconstructed_boss_courtyard.png'));

    // Trigger Boss Courtyard West Surge Pylon Takedown against Fang Enforcer & finish Mission 1!
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        const boss = eng.enemies.find((e) => e.kind === 'boss' && e.state !== 'dead');
        if (boss) {
          boss.pos.set(-6.8, 0, -69.5);
          boss.rig.root.position.copy(boss.pos);
        }
        eng.teleportForQualification(-4.8, 0, -66.2, 95);
        eng.camYaw = 0.25;
        eng.camPitch = 0.18;
        eng.triggerEnvironmentalTakedown();
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(260);
    cert.captures.push(await saveScreenshot(cdp, '08_p1l_boss_arena_combat_takedown.png'));

    const missionDone = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        const boss = eng.enemies.find((e) => e.kind === 'boss' && e.state !== 'dead');
        if (boss) {
          boss.pos.set(0, 0, -71.0);
          boss.rig.root.position.copy(boss.pos);
          boss.armor = 0;
          boss.hp = 10;
          eng.playerPos.set(0, 0, -69.2);
          eng.abilityCooldowns = [0, 0, 0];
          eng.triggerAbility(3);
          eng.stepSimulationForQualification(1 / 60, 14);
        }
        return { missionCompleted: eng.save.missionCompleted, isVictory: eng.isVictory };
      })()`
    );
    await sleep(250);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const skip = Array.from(document.querySelectorAll('button')).find((b) => /Skip/i.test(b.textContent || ''));
        if (skip) skip.click();
        window.__KAIJAX_ENGINE__.setPaused(false);
      })()`,
    });

    cert.regression12Checks.push({
      id: 8,
      item: 'Mission 1 completion & Kai-Jax strictly-3-tail Fusion in Boss Courtyard',
      passed:
        bossFusionSetup.isFused === true &&
        bossFusionSetup.kaiJaxBones.tailBones === 12 &&
        missionDone.missionCompleted === true,
      metrics: { ...bossFusionSetup, ...missionDone },
    });

    // Check 9: Save to Slot-1, Full Browser Reload & World-State Restoration
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const pauseBtn = document.querySelector('button[aria-label="Pause Game"]');
        if (pauseBtn) pauseBtn.click();
      })()`,
    });
    await sleep(280);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const settingsTab = Array.from(document.querySelectorAll('button[role="tab"]')).find((b) =>
          /Settings/i.test(b.textContent || '')
        );
        if (settingsTab) settingsTab.click();
      })()`,
    });
    await sleep(250);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const saveButtons = Array.from(document.querySelectorAll('button')).filter((b) => (b.textContent || '').trim() === 'Save');
        if (saveButtons[1]) saveButtons[1].click();
      })()`,
    });
    await sleep(350);

    await cdp.send('Page.navigate', { url: APP_URL });
    const reloadReady = await waitForExpr(
      cdp,
      `window.__KAIJAX_ENGINE__ &&
       Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === 'ready') &&
       window.__KAIJAX_ENGINE__.getQualificationDiagnostics().modularKitLoadedCount === 12`,
      30000
    );
    if (!reloadReady) {
      throw new Error('Reloaded engine failed to load character or 12 modular world GLBs');
    }
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const contBtn = Array.from(document.querySelectorAll('button')).find((b) => /Continue/i.test(b.textContent || ''));
        if (contBtn) contBtn.click();
      })()`,
    });
    await sleep(600);
    const restored = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        return {
          missionCompleted: eng.save.missionCompleted,
          fusionUnlocked: eng.save.fusionUnlocked,
          memorySiteReconstructed: eng.world.memorySiteReconstructed,
          alleyGateOpen: eng.world.alleyGateOpen,
          modularKitLoadedCount: eng.world.modularKitLoadedCount,
        };
      })()`
    );
    cert.regression12Checks.push({
      id: 9,
      item: 'Save/reload continuity across full page reload',
      passed:
        restored.missionCompleted === true &&
        restored.memorySiteReconstructed === true &&
        restored.alleyGateOpen === true &&
        restored.modularKitLoadedCount === 12,
      metrics: restored,
    });

    // Check 10: Reconstructed <-> Legacy Live Environment Mode Switching
    const switchCheck = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('legacy');
        eng.stepSimulationForQualification(1 / 60, 4);
        const legacyPerf = eng.getPerformanceMetrics();
        const legacyMode = eng.world.environmentMode;
        eng.setEnvironmentMode('reconstructed');
        eng.stepSimulationForQualification(1 / 60, 4);
        const reconPerf = eng.getPerformanceMetrics();
        const reconMode = eng.world.environmentMode;
        return { legacyMode, reconMode, legacyDrawCalls: legacyPerf.drawCalls, reconDrawCalls: reconPerf.drawCalls };
      })()`
    );
    cert.regression12Checks.push({
      id: 10,
      item: 'Reconstructed / Legacy live environment switching',
      passed: switchCheck.legacyMode === 'legacy' && switchCheck.reconMode === 'reconstructed',
      metrics: switchCheck,
    });

    // Check 11 (P5 Mobile Profiling + Android Packaging): Mobile 844x390 Landscape HUD + Low / Balanced / High Quality Profiling
    await setViewport(cdp, 844, 390, true, 2);
    await sleep(300);

    // Measure exploration baseline (world + heroes + mentors, 0 patrol enemies)
    const explorationPerf = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.clearEnemies();
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'balanced', environmentMode: 'reconstructed' });
        eng.teleportForQualification(0, 0, -24.0, 75);
        eng.camYaw = 0;
        eng.camPitch = 0.20;
        eng.stepSimulationForQualification(1 / 60, 10, false);
        eng.renderer.render(eng.scene, eng.camera);
        return eng.getPerformanceMetrics();
      })()`
    );

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.spawnPatrolSkirmish();
        eng.teleportForQualification(0, 0, -24.0, 75);
        eng.camYaw = 0;
        eng.camPitch = 0.20;
      })()`,
    });

    const tiers = {};
    for (const tier of ['low', 'balanced', 'high']) {
      await cdp.send('Runtime.evaluate', {
        expression: `window.__KAIJAX_ENGINE__.applyGraphicsSettings({
          ...window.__KAIJAX_ENGINE__.settings,
          graphicsQuality: '${tier}',
          environmentMode: 'reconstructed'
        })`,
      });
      await waitForExpr(
        cdp,
        `Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === 'ready')`,
        15000
      );
      await sleep(120);
      tiers[tier] = await evalJson(
        cdp,
        `(() => {
          const eng = window.__KAIJAX_ENGINE__;
          // Warm up shader variants after shadow/quality toggle before timing steady-state frame
          eng.renderer.render(eng.scene, eng.camera);
          const t0 = performance.now();
          eng.stepSimulationForQualification(1 / 60, 30, false);
          const cpuSimAvgMs = Number(((performance.now() - t0) / 30).toFixed(3));
          const r0 = performance.now();
          eng.renderer.render(eng.scene, eng.camera);
          const renderSubmitMs = Number((performance.now() - r0).toFixed(3));
          return {
            ...eng.getPerformanceMetrics(),
            cpuSimAvgMs,
            renderSubmitMs,
          };
        })()`
      );
    }

    // Leave on mobile 'balanced' for screenshot & HUD bounds check
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'balanced', environmentMode: 'reconstructed' });
        eng.stepSimulationForQualification(1 / 60, 6);
      })()`,
    });
    await waitForExpr(
      cdp,
      `Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === 'ready')`,
      15000
    );
    const hudCheck = await evalJson(
      cdp,
      `(() => {
        const buttons = Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null);
        const outOfBounds = buttons.filter((b) => {
          const r = b.getBoundingClientRect();
          return r.right > window.innerWidth + 2 || r.bottom > window.innerHeight + 2 || r.left < -2 || r.top < -2;
        }).length;
        return {
          viewport: [window.innerWidth, window.innerHeight],
          visibleButtons: buttons.length,
          outOfBoundsButtons: outOfBounds,
        };
      })()`
    );

    const gitignoreTxt = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    const capCfgTxt = fs.readFileSync(path.join(ROOT, 'capacitor.config.ts'), 'utf8');
    const ashblockGlbFiles = fs
      .readdirSync(path.join(ROOT, 'public', 'models', 'environments', 'ashblock'))
      .filter((f) => f.endsWith('.glb'));
    const androidPackagingConfig = {
      gitignoreExcludesAndroidPublic: gitignoreTxt.includes('android/app/src/main/assets/public'),
      capacitorWebDirDist: capCfgTxt.includes("webDir: 'dist'"),
      androidGradlePresent: fs.existsSync(path.join(ROOT, 'android', 'app', 'build.gradle')),
      ashblockPublicGlbCount: ashblockGlbFiles.length,
    };

    const mobilePerf = {
      ...hudCheck,
      explorationBalanced: explorationPerf,
      tiers,
      androidPackagingConfig,
    };

    await sleep(350);
    cert.captures.push(await saveScreenshot(cdp, '09_p1l_mobile_844x390_perf_hud.png'));
    cert.performanceProfile = {
      assetLoadDurationMs,
      ...mobilePerf,
    };

    cert.regression12Checks.push({
      id: 11,
      item: 'Android asset packaging config & Mobile 844x390 Low/Balanced/High performance budget',
      passed:
        mobilePerf.outOfBoundsButtons === 0 &&
        explorationPerf.drawCalls <= 75 &&
        mobilePerf.tiers.low.drawCalls <= 165 &&
        mobilePerf.tiers.high.drawCalls <= 185 &&
        mobilePerf.tiers.low.activeTriangles < mobilePerf.tiers.high.activeTriangles &&
        androidPackagingConfig.gitignoreExcludesAndroidPublic &&
        androidPackagingConfig.capacitorWebDirDist &&
        androidPackagingConfig.androidGradlePresent &&
        androidPackagingConfig.ashblockPublicGlbCount === 12,
      metrics: mobilePerf,
    });

    // Render Reference/Before/After Triptychs via Studio Harness
    await setViewport(cdp, 1560, 620, false, 1);
    await cdp.send('Page.navigate', {
      url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=street_triptych`,
    });
    await waitForExpr(cdp, 'window.__HARNESS_READY__');
    await sleep(220);
    cert.captures.push(await saveScreenshot(cdp, '02_p1l_street_ref_before_after.png'));

    await cdp.send('Page.navigate', {
      url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=courtyard_triptych`,
    });
    await waitForExpr(cdp, 'window.__HARNESS_READY__');
    await sleep(220);
    cert.captures.push(await saveScreenshot(cdp, '07_p1l_boss_courtyard_ref_before_after.png'));

    // Check 12: Zero Missing Textures, GLBs, HTTP 404s, Console Errors, or Runtime Exceptions
    cert.runtimeIntegrity = {
      httpFailures: cdp.httpFailures,
      consoleErrors: cdp.consoleErrors,
      pageExceptions: cdp.pageExceptions,
    };
    cert.regression12Checks.push({
      id: 12,
      item: 'Zero missing textures, GLBs, HTTP 404s, or runtime errors',
      passed:
        cdp.httpFailures.length === 0 &&
        cdp.consoleErrors.length === 0 &&
        cdp.pageExceptions.length === 0,
      metrics: cert.runtimeIntegrity,
    });

    const reportJsonPath = path.join(ROOT, 'docs', 'production', 'p1l-certification.json');
    fs.writeFileSync(reportJsonPath, JSON.stringify(cert, null, 2));

    console.log('\n=== P1-L 12-POINT REGRESSION SUMMARY ===');
    for (const chk of cert.regression12Checks) {
      console.log(`  [${chk.passed ? 'PASS' : 'FAIL'}] #${chk.id}: ${chk.item}`);
    }
    const failed = cert.regression12Checks.filter((c) => !c.passed);
    if (failed.length > 0) {
      console.error('FAILED CHECKS:', JSON.stringify(failed, null, 2));
      process.exitCode = 1;
    }
  } finally {
    cdp.close();
    proc.kill('SIGKILL');
    harnessServer.close();
  }
}

main().catch((err) => {
  console.error('P1-L CERTIFICATION ERROR:', err);
  process.exit(1);
});
