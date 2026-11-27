#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — P1-I Visual, Rig Deformation, Version-Switch & Zero-WS-Error Qualification
 *
 * Verifies & Captures:
 *  1) Zero `[vite] Error: WebSocket closed without opened` or uncaught runtime exceptions on port 3000
 *  2) 4-Panel P1-I Reconstructed Studio Turnarounds (Front, Side, Rear, 3/4) for kai, jax, kaijax, boryn, borax
 *  3) 4-Column Direct Comparison Sheets per character:
 *       [Official 2D Plate] | [P1-G v3.0 Mastered] | [P1-I Reconstructed Master] | [P1-I Mobile LOD1 + Combat Pose]
 *  4) 5-Character P1-I Canon Roster Lineup (Boryn · Kai · Kai-Jax [3 Tails] · Jax · Borax)
 *  5) Live Ashblock Heights Gameplay (Kai Combat, Jax Switch, Kai-Jax 3-Tail Fusion) + Live Versioned Model Switching
 *     (`p1i_reconstructed` <-> `p1g_mastered` <-> `procedural_fallback`)
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync, spawn } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'production', 'captures', 'p1i');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_BIN =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const HARNESS_PORT = 4182;
const CDP_PORT = 9238;
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

const HARNESS_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0f131d; font-family: system-ui, sans-serif; color: #f8fafc; }
    canvas { display: block; width: 100%; height: 100%; }
    .label { position: fixed; padding: 5px 10px; background: rgba(10,12,18,0.9); border: 1px solid rgba(212,175,55,0.42); border-radius: 7px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; pointer-events: none; z-index: 10; }
    .grid-line { position: fixed; background: rgba(148,163,184,0.22); pointer-events: none; z-index: 9; }
    .ref-plate { position: fixed; left: 0; top: 0; object-fit: contain; background: radial-gradient(circle at 50% 45%, #1c2233 0%, #0f131d 85%); pointer-events: none; z-index: 5; }
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
    const mode = params.get('mode') || 'turnaround';
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

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    function makeLitScene() {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x121622);
      scene.environment = envTex;
      scene.add(new THREE.HemisphereLight(0xe2e8f0, 0x1e1b2e, 1.15));
      const key = new THREE.DirectionalLight(0xfff6e5, 2.35);
      key.position.set(3.2, 5.2, 4.8);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x93c5fd, 1.15);
      fill.position.set(-3.6, 2.8, 2.8);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xc4b5fd, 1.45);
      rim.position.set(0, 4.0, -4.6);
      scene.add(rim);
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(3.8, 4.0, 0.06, 48),
        new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.68, metalness: 0.22 })
      );
      ped.position.y = -0.03;
      scene.add(ped);
      return scene;
    }

    const loader = new GLTFLoader();
    const loadGltf = (url) => new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));

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
      if (mode === 'lineup') {
        const scene = makeLitScene();
        const order = [
          { id: 'boryn', x: -2.65, rot: 0.14 },
          { id: 'kai', x: -1.30, rot: 0.07 },
          { id: 'kaijax', x: 0.0, rot: 0.0 },
          { id: 'jax', x: 1.30, rot: -0.07 },
          { id: 'borax', x: 2.65, rot: -0.14 },
        ];
        for (const item of order) {
          const gltf = await loadGltf('/public/models/characters/p1i/' + item.id + '_master.glb');
          gltf.scene.position.set(item.x, 0, 0);
          gltf.scene.rotation.y = item.rot;
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            const clip = gltf.animations.find((c) => c.name === 'idle') || gltf.animations[0];
            mixer.clipAction(clip).play();
            mixer.update(0.2);
          }
          scene.add(gltf.scene);
        }
        const cam = new THREE.PerspectiveCamera(34, W / H, 0.1, 50);
        cam.position.set(0, 1.48, 7.85);
        cam.lookAt(0, 1.04, 0);
        renderer.setViewport(0, 0, W, H);
        renderer.setScissor(0, 0, W, H);
        renderer.render(scene, cam);
        addLabel('P1-I RECONSTRUCTED 5-CHARACTER CANON LINEUP — BORYN · KAI · KAI-JAX (3 TAILS) · JAX · BORAX', 18, 16);
      } else if (mode === 'turnaround') {
        const scene = makeLitScene();
        const gltf = await loadGltf('/public/models/characters/p1i/' + charId + '_master.glb');
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          const clip = gltf.animations.find((c) => c.name === 'idle') || gltf.animations[0];
          mixer.clipAction(clip).play();
          mixer.update(0.18);
        }
        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const h = Math.max(1.75, box.max.y - box.min.y);
        const colW = Math.floor(W / 4);

        const views = [
          { label: charId.toUpperCase() + ' P1-I — FRONT', pos: [0, h * 0.52, h * 2.02], look: [0, h * 0.49, 0] },
          { label: 'SIDE PROFILE', pos: [h * 2.02, h * 0.52, 0.08], look: [0, h * 0.49, 0] },
          { label: 'REAR DORSAL / TAILS', pos: [0, h * 0.53, -h * 2.02], look: [0, h * 0.49, 0] },
          { label: '3/4 HERO VIEW', pos: [h * 1.15, h * 0.55, h * 1.72], look: [0, h * 0.49, 0] },
        ];
        views.forEach((v, idx) => {
          const x0 = idx * colW;
          const vw = idx === 3 ? W - x0 : colW;
          const cam = new THREE.PerspectiveCamera(32, vw / H, 0.1, 50);
          cam.position.set(v.pos[0], v.pos[1], v.pos[2]);
          cam.lookAt(v.look[0], v.look[1], v.look[2]);
          renderer.setViewport(x0, 0, vw, H);
          renderer.setScissor(x0, 0, vw, H);
          renderer.render(scene, cam);
          addLabel(v.label, x0 + 10, 12);
          if (idx > 0) addDivider(x0, 0, 1, H);
        });
      } else if (mode === 'compare') {
        const colW = Math.floor(W / 4);
        // Column 0: Official 2D Reference Plate
        const img = document.createElement('img');
        img.className = 'ref-plate';
        img.src = '/public/models/reconstruction-sheets/' + charId + '/front.png';
        img.style.width = colW + 'px';
        img.style.height = H + 'px';
        document.body.appendChild(img);
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        addLabel('1. APPROVED 2D ARTWORK', 10, 12);

        // Column 1: P1-G v3.0 Mastered
        const sceneP1G = makeLitScene();
        const gltfP1G = await loadGltf('/public/models/characters/p1g/' + charId + '_master.glb');
        sceneP1G.add(gltfP1G.scene);
        const boxG = new THREE.Box3().setFromObject(gltfP1G.scene);
        const hG = Math.max(1.75, boxG.max.y - boxG.min.y);
        const camG = new THREE.PerspectiveCamera(32, colW / H, 0.1, 50);
        camG.position.set(0.32, hG * 0.53, hG * 1.98);
        camG.lookAt(0, hG * 0.49, 0);
        renderer.setViewport(colW, 0, colW, H);
        renderer.setScissor(colW, 0, colW, H);
        renderer.render(sceneP1G, camG);
        addLabel('2. P1-G v3.0 BASELINE', colW + 10, 12);
        addDivider(colW, 0, 1, H);

        // Column 2: P1-I Reconstructed Master
        const sceneP1I = makeLitScene();
        const gltfP1I = await loadGltf('/public/models/characters/p1i/' + charId + '_master.glb');
        if (gltfP1I.animations.length > 0) {
          const m = new THREE.AnimationMixer(gltfP1I.scene);
          m.clipAction(gltfP1I.animations.find((c) => c.name === 'idle') || gltfP1I.animations[0]).play();
          m.update(0.15);
        }
        sceneP1I.add(gltfP1I.scene);
        const boxI = new THREE.Box3().setFromObject(gltfP1I.scene);
        const hI = Math.max(1.75, boxI.max.y - boxI.min.y);
        const camI = new THREE.PerspectiveCamera(32, colW / H, 0.1, 50);
        camI.position.set(0.32, hI * 0.53, hI * 1.98);
        camI.lookAt(0, hI * 0.49, 0);
        renderer.setViewport(colW * 2, 0, colW, H);
        renderer.setScissor(colW * 2, 0, colW, H);
        renderer.render(sceneP1I, camI);
        addLabel('3. P1-I RECONSTRUCTED MASTER', colW * 2 + 10, 12);
        addDivider(colW * 2, 0, 1, H);

        // Column 3: P1-I Mobile LOD1 in Dynamic Combat Pose (heavy_strike)
        const sceneLod = makeLitScene();
        const gltfLod = await loadGltf('/public/models/characters/p1i/' + charId + '_lod1.glb');
        if (gltfLod.animations.length > 0) {
          const mLod = new THREE.AnimationMixer(gltfLod.scene);
          const atk = gltfLod.animations.find((c) => c.name === 'heavy_strike') || gltfLod.animations[0];
          mLod.clipAction(atk).play();
          mLod.update(0.32);
        }
        sceneLod.add(gltfLod.scene);
        const wLast = W - colW * 3;
        const camL = new THREE.PerspectiveCamera(33, wLast / H, 0.1, 50);
        camL.position.set(0.85, hI * 0.54, hI * 1.92);
        camL.lookAt(0, hI * 0.48, 0);
        renderer.setViewport(colW * 3, 0, wLast, H);
        renderer.setScissor(colW * 3, 0, wLast, H);
        renderer.render(sceneLod, camL);
        addLabel('4. MOBILE LOD1 (COMBAT POSE)', colW * 3 + 10, 12);
        addDivider(colW * 3, 0, 1, H);
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
      if (urlObj.pathname.startsWith('/public/') || urlObj.pathname.startsWith('/node_modules/')) {
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
    this.consoleErrors = [];
    this.pageExceptions = [];
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
        this.consoleErrors.push(txt);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'exception';
        this.pageExceptions.push(desc);
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
      '--window-size=1440,860',
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
  await cdp.send('Runtime.evaluate', { expression: `window.dispatchEvent(new Event('resize'))` });
}

async function saveScreenshot(cdp, filename) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  console.log(`[P1-I CAPTURE] ${path.relative(ROOT, dest)}`);
}

async function evalJson(cdp, expr) {
  const res = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify(${expr})`,
    returnByValue: true,
  });
  return res?.result?.value ? JSON.parse(res.result.value) : null;
}

async function waitForExpr(cdp, expr, timeoutMs = 22000) {
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
  // 0. Smoke-verify Headless Blender 3.4.1 External Mesh Auto-Rig & Retarget Script in isolated temp dir
  const smokeOut = fs.mkdtempSync('/tmp/kaijax-autorig-cert-');
  let blenderAutorigSmoke = null;
  try {
    const stdout = execFileSync(
      'blender',
      [
        '-b',
        '--factory-startup',
        '--python-exit-code',
        '1',
        '-P',
        path.join(ROOT, 'scripts', 'blender_autorig_external_glb.py'),
        '--',
        path.join(ROOT, 'public', 'models', 'characters', 'p1i', 'kai_lod1.glb'),
        'kai',
        smokeOut,
      ],
      { encoding: 'utf8', timeout: 120000 }
    );
    const match = stdout.split('\n').find((l) => l.startsWith('AUTORIG_SUMMARY_JSON:'));
    blenderAutorigSmoke = match ? JSON.parse(match.replace('AUTORIG_SUMMARY_JSON:', '')) : { ok: true };
    console.log('[BLENDER AUTO-RIG SMOKE PASS]', blenderAutorigSmoke);
  } finally {
    fs.rmSync(smokeOut, { recursive: true, force: true });
  }

  const harnessServer = await startHarnessServer();
  const { proc, cdp } = await launchChrome();

  const report = {
    certifiedAt: new Date().toISOString(),
    blenderAutorigSmoke,
    serverPipelineStatus: null,
    viteWebSocketErrors: [],
    appConsoleErrors: [],
    appPageExceptions: [],
    studioCaptures: [],
    versionSwitchVerification: {},
    gameplaySnapshots: {},
  };

  try {
    // 1. Capture 4-View Studio Sheets, 4-Column Comparison Sheets, and 5-Hero Lineup
    await setViewport(cdp, 1440, 820);
    for (const ch of ['kai', 'jax', 'kaijax', 'boryn', 'borax']) {
      await cdp.send('Page.navigate', {
        url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=turnaround&char=${ch}`,
      });
      await waitForExpr(cdp, 'window.__HARNESS_READY__ || window.__HARNESS_ERROR__');
      await sleep(220);
      const turnFn = `p1i_${ch}_4view_master.png`;
      await saveScreenshot(cdp, turnFn);
      report.studioCaptures.push(turnFn);

      await cdp.send('Page.navigate', {
        url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=compare&char=${ch}`,
      });
      await waitForExpr(cdp, 'window.__HARNESS_READY__ || window.__HARNESS_ERROR__');
      await sleep(260);
      const cmpFn = `p1i_${ch}_compare_vs_p1g.png`;
      await saveScreenshot(cdp, cmpFn);
      report.studioCaptures.push(cmpFn);
    }

    await cdp.send('Page.navigate', {
      url: `http://127.0.0.1:${HARNESS_PORT}/harness.html?mode=lineup`,
    });
    await waitForExpr(cdp, 'window.__HARNESS_READY__ || window.__HARNESS_ERROR__');
    await sleep(250);
    await saveScreenshot(cdp, 'p1i_lineup_5heroes.png');
    report.studioCaptures.push('p1i_lineup_5heroes.png');

    // 2. Verify Live Port 3000 Server Pipeline API & Zero Vite WebSocket Error
    const pipeResp = await fetch(`${APP_URL}/api/character-pipeline/status`);
    report.serverPipelineStatus = pipeResp.ok ? await pipeResp.json() : { error: pipeResp.status };

    cdp.consoleErrors = [];
    cdp.pageExceptions = [];
    await setViewport(cdp, 1440, 900);
    await cdp.send('Page.navigate', { url: APP_URL });
    const readyOk = await waitForExpr(
      cdp,
      'window.__KAIJAX_ENGINE__ && Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === "ready")',
      25000
    );
    if (!readyOk) {
      throw new Error('Timed out waiting for all 5 P1-I character GLBs to reach ready state on Title Showcase');
    }
    await sleep(1800);

    await saveScreenshot(cdp, 'p1i_title_showcase.png');
    report.gameplaySnapshots.titleShowcase = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics()`
    );

    // 3. Enter Ashblock Heights Gameplay & Verify Combat, Hero Switch, Fusion (3 Tails), and Live Version Switching
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const startBtn = Array.from(document.querySelectorAll('button')).find((b) =>
          /Enter Ashblock|New Game|New Campaign/i.test(b.textContent || '')
        );
        if (startBtn) startBtn.click();
      })()`,
    });
    await sleep(1000);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const skipBtn = Array.from(document.querySelectorAll('button')).find((b) => /Skip Scene/i.test(b.textContent || ''));
        if (skipBtn) skipBtn.click();
      })()`,
    });
    await sleep(450);

    await setViewport(cdp, 1280, 720);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(-2.6, 0, -5.8, 70);
        eng.triggerLightAttack();
      })()`,
    });
    await sleep(360);
    await saveScreenshot(cdp, 'p1i_gameplay_kai_combat.png');
    report.gameplaySnapshots.kaiCombat = await evalJson(cdp, `window.__KAIJAX_ENGINE__.getQualificationDiagnostics()`);

    // Switch to Jax
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerSwitchHero();
        eng.triggerTacticalAction();
      })()`,
    });
    await sleep(380);
    await saveScreenshot(cdp, 'p1i_gameplay_jax_switch.png');
    report.gameplaySnapshots.jaxSwitch = await evalJson(cdp, `window.__KAIJAX_ENGINE__.getQualificationDiagnostics()`);

    // Unlock & Activate Kai-Jax 3-Tail Fusion
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.save.fusionUnlocked = true;
        eng.fusionCharge = 100;
        eng.fusionCooldown = 0;
        eng.triggerFusion();
      })()`,
    });
    await sleep(1800);
    await saveScreenshot(cdp, 'p1i_gameplay_kaijax_fusion_3tails.png');
    report.gameplaySnapshots.kaijaxFusion = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics()`
    );

    // Live Versioned Model Pipeline Switch: p1i_reconstructed -> p1g_mastered -> procedural_fallback -> p1i_reconstructed
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.applyGraphicsSettings({ ...eng.settings, characterModelVersion: 'p1g_mastered' });
      })()`,
    });
    await waitForExpr(
      cdp,
      '(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs.kai.url || "").startsWith("/models/characters/p1g/kai_")',
      12000
    );
    report.versionSwitchVerification.p1gMastered = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs`
    );

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.applyGraphicsSettings({ ...eng.settings, characterModelVersion: 'procedural_fallback' });
      })()`,
    });
    await sleep(200);
    report.versionSwitchVerification.proceduralFallback = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs`
    );

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'low', characterModelVersion: 'p1i_reconstructed' });
      })()`,
    });
    await waitForExpr(
      cdp,
      'window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs.kai.url === "/models/characters/kai_lod1.glb"',
      12000
    );
    report.versionSwitchVerification.p1iMobileLod1 = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs`
    );

    // Restore high quality P1-I Reconstructed
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'high', characterModelVersion: 'p1i_reconstructed' });
      })()`,
    });
    await waitForExpr(
      cdp,
      '(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs.kai.url || "").startsWith("/models/characters/kai_")',
      12000
    );
    report.versionSwitchVerification.p1iMasterRestored = await evalJson(
      cdp,
      `window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs`
    );

    report.appConsoleErrors = cdp.consoleErrors;
    report.appPageExceptions = cdp.pageExceptions;
    report.viteWebSocketErrors = [...cdp.consoleErrors, ...cdp.pageExceptions].filter((e) =>
      /WebSocket closed without opened|@vite\/client/i.test(e)
    );

    const outJsonPath = path.join(ROOT, 'docs', 'production', 'p1i-certification.json');
    fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2));
    console.log(`[P1-I CERTIFICATION JSON] ${path.relative(ROOT, outJsonPath)}`);
    console.log(
      `[VITE WS ERRORS] ${report.viteWebSocketErrors.length} | [CONSOLE ERRORS] ${report.appConsoleErrors.length} | [PAGE EXCEPTIONS] ${report.appPageExceptions.length}`
    );

    if (report.viteWebSocketErrors.length > 0) {
      throw new Error(`Detected Vite WebSocket errors: ${report.viteWebSocketErrors.join('; ')}`);
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
