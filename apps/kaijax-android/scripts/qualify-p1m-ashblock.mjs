#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — P1-M: ASHBLOCK HEIGHTS FINAL GAMEPLAY, VISUAL & ANDROID QUALIFICATION
 *
 * Measures and certifies:
 *  - Priority 1: Gameplay Feel (accel/brake curve, sprint-to-jump + coyote + jump buffer,
 *    pendulum web swing momentum, guided zip-to-anchor, aerial combo + slam recovery,
 *    free-flow targeting, parry input latency, dodge attack-cancel, wall pinning,
 *    companion flanking, duo meter/finisher, Kai-Jax 3-tail fusion + unfuse)
 *  - Priority 2: Visual Fidelity before/after artwork comparison triptychs & close-ups
 *  - Priority 4: Release-candidate screenshots, character deformation proof,
 *    Mobile 844x390 simultaneous multi-touch test, performance profiling & runtime audit
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'production', 'captures', 'p1m');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_BIN =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const HARNESS_PORT = 4192;
const CDP_PORT = 9251;
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
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #090b12; font-family: system-ui, sans-serif; color: #f8fafc; }
    .label { position: fixed; padding: 5px 10px; background: rgba(10,12,20,0.92); border: 1px solid rgba(245,158,11,0.55); border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; pointer-events: none; z-index: 10; }
    .sub-label { position: fixed; padding: 3px 8px; background: rgba(12,16,28,0.88); border: 1px solid rgba(56,189,248,0.42); border-radius: 5px; font-size: 10px; font-family: monospace; color: #bae6fd; pointer-events: none; z-index: 10; }
    .grid-line { position: fixed; background: rgba(148,163,184,0.22); pointer-events: none; z-index: 9; }
    .plate-img { position: fixed; object-fit: cover; pointer-events: none; z-index: 4; background: #0b0e16; }
  </style>
</head>
<body>
  <div id="labels"></div>
  <script type="module">
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'street_triptych';
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

    const plates =
      mode === 'street_triptych'
        ? [
            { src: '/public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png', title: '1. REFERENCE ART (d438c610.png)', sub: 'Ashblock District · Monoliths · Warm Streetlamps · Damp Asphalt' },
            { src: '/docs/production/captures/p1m/01a_p1m_legacy_street.png', title: '2. BEFORE (LEGACY BLOCK WORLD)', sub: 'Flat Rectangular Primitives · Dark Void Sky · Unlit Blocks' },
            { src: '/docs/production/captures/p1m/01b_p1m_street.png', title: '3. AFTER (P1-M RECONSTRUCTED STREET)', sub: 'Balanced Damp Tarmac · Beast-God Silhouettes · 12 Modular GLBs' },
          ]
        : mode === 'bloodward_pair'
          ? [
              { src: '/public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png', title: '1. BLOODWARD LOFT ART (f9d37a6e.png)', sub: 'Rooftop Training Terrace · Warm Lantern Bokeh · Skyline Overlook' },
              { src: '/docs/production/captures/p1m/02b_p1m_bloodward_dojo.png', title: '2. AFTER (P1-M BLOODWARD SANCTUARY)', sub: 'Open-Sightline Stanchions · Boryn Mentor · Skybridge Access' },
            ]
          : [
              { src: '/public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png', title: '1. STRONGHOLD ART (e5b27b30.png)', sub: 'Fang Syndicate Fight Pit · Floodlight Rig · Armored Perimeter' },
              { src: '/docs/production/captures/p1m/03a_p1m_legacy_courtyard.png', title: '2. BEFORE (LEGACY COURTYARD)', sub: 'Generic Containers · Flat Wall · No Verticality' },
              { src: '/docs/production/captures/p1m/03b_p1m_stronghold_courtyard.png', title: '3. AFTER (P1-M STRONGHOLD ARENA)', sub: 'Floodlight Gantry · Clean Boss Framing · Surge Pylons · Balconies' },
            ];

    const colW = Math.floor(W / plates.length);
    await Promise.all(
      plates.map(
        (item, idx) =>
          new Promise((resolve) => {
            const el = document.createElement('img');
            el.className = 'plate-img';
            el.style.left = idx * colW + 'px';
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
          })
      )
    );
    window.__HARNESS_READY__ = true;
  </script>
</body>
</html>`;

let activeHarnessPort = 4192;

function startHarnessServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlObj = new URL(req.url || '/', `http://127.0.0.1:${activeHarnessPort}`);
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
    server.listen(0, '127.0.0.1', () => {
      activeHarnessPort = server.address().port;
      resolve(server);
    });
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
        if (!/WebSocket|vite/i.test(txt)) this.consoleErrors.push(txt);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc =
          msg.params?.exceptionDetails?.exception?.description ||
          msg.params?.exceptionDetails?.text ||
          'exception';
        if (!/WebSocket|vite/i.test(desc)) this.pageExceptions.push(desc);
      }
      if (msg.method === 'Network.responseReceived') {
        const status = msg.params?.response?.status ?? 200;
        const url = msg.params?.response?.url ?? '';
        if (status >= 400 && !url.includes('favicon')) this.httpFailures.push({ status, url });
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}, timeoutMs = 25000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout after ${timeoutMs}ms on ${method}`));
        }
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
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
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, 45000);
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  console.error(`[P1-M CAPTURE] ${path.relative(ROOT, dest)}`);
  return path.relative(ROOT, dest);
}

async function evalJson(cdp, expr) {
  const res = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify(${expr})`,
    returnByValue: true,
  });
  return res?.result?.value ? JSON.parse(res.result.value) : null;
}

async function waitForExpr(cdp, expr, timeoutMs = 30000) {
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

  const report = {
    operation: 'OPERATION KAI-JAX — P1-M: ASHBLOCK HEIGHTS FINAL GAMEPLAY, VISUAL & ANDROID QUALIFICATION',
    executedAt: new Date().toISOString(),
    captures: [],
    priority1GameplayFeel: {},
    priority2VisualFidelity: {},
    priority3MobileAndPerformance: {},
    runtimeIntegrity: {
      httpFailures: [],
      consoleErrors: [],
      pageExceptions: [],
    },
  };

  try {
    console.error('[P1-M] Navigating to app...');
    await setViewport(cdp, 1360, 768);
    const loadT0 = Date.now();
    await cdp.send('Page.navigate', { url: APP_URL });
    console.error('[P1-M] Waiting for GLBs & modular kit...');

    const ready = await waitForExpr(
      cdp,
      `window.__KAIJAX_ENGINE__ &&
       Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every((c) => c.status === 'ready') &&
       window.__KAIJAX_ENGINE__.getQualificationDiagnostics().modularKitLoadedCount === 12`,
      45000
    );
    const initialLoadMs = Date.now() - loadT0;
    console.error(`[P1-M] Ready=${ready} in ${initialLoadMs}ms`);
    if (!ready) {
      const diag = await evalJson(cdp, 'window.__KAIJAX_ENGINE__?.getQualificationDiagnostics()');
      console.error('Diagnostics:', JSON.stringify({
        diag,
        consoleErrors: cdp.consoleErrors,
        pageExceptions: cdp.pageExceptions,
        httpFailures: cdp.httpFailures,
      }, null, 2));
      throw new Error('Timed out waiting for character & world GLBs');
    }

    // Start fresh campaign & skip opening dialogue
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.clear();
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          /New Campaign|Enter Ashblock|New Game/i.test(b.textContent || '')
        );
        if (btn) btn.click();
      })()`,
    });
    await sleep(650);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const skip = Array.from(document.querySelectorAll('button')).find((b) => /Skip/i.test(b.textContent || ''));
        if (skip) skip.click();
        window.__KAIJAX_ENGINE__.setPaused(false);
      })()`,
    });
    await sleep(300);

    // -------------------------------------------------------------------------
    // PRIORITY 1: MEASURED GAMEPLAY FEEL CERTIFICATIONS
    // -------------------------------------------------------------------------
    // 1A. Grounded Acceleration & Snappy Braking Curve
    const accelBrake = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(0, 0, 12.0, 30);
        eng.camYaw = 0;
        eng.setTouchSprint(true);
        eng.setTouchMove(0, -1);
        const accelCurve = [];
        for (let f = 1; f <= 20; f++) {
          eng.stepSimulationForQualification(1 / 60, 1, false);
          if (f === 3 || f === 6 || f === 12 || f === 20) {
            accelCurve.push({ frame: f, speed: Number(Math.hypot(eng.playerVel.x, eng.playerVel.z).toFixed(2)) });
          }
        }
        eng.setTouchMove(0, 0);
        eng.setTouchSprint(false);
        const brakeCurve = [];
        for (let f = 1; f <= 16; f++) {
          eng.stepSimulationForQualification(1 / 60, 1, false);
          if (f === 4 || f === 8 || f === 16) {
            brakeCurve.push({ frame: f, speed: Number(Math.hypot(eng.playerVel.x, eng.playerVel.z).toFixed(2)) });
          }
        }
        return { accelCurve, brakeCurve, peakSprintSpeed: accelCurve[3].speed, stopSpeedFrame16: brakeCurve[2].speed };
      })()`
    );

    // 1B. Sprint-to-Jump Vault + Coyote Time + Pre-Landing Jump Buffer
    const jumpFeel = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(0, 0, 10.0, 30);
        eng.camYaw = 0;
        eng.setTouchSprint(true);
        eng.setTouchMove(0, -1);
        eng.stepSimulationForQualification(1 / 60, 18, false);
        const preJumpSpeed = Math.hypot(eng.playerVel.x, eng.playerVel.z);
        eng.triggerJumpOrSwing();
        const sprintJumpVy = Number(eng.playerVel.y.toFixed(2));
        const jumpInputResponseMs = Number(eng.lastInputResponseMs.toFixed(4));
        const sprintJumpHoriz = Number(Math.hypot(eng.playerVel.x, eng.playerVel.z).toFixed(2));
        // Step near ground, queue jump buffer, land and ensure buffered jump auto-fires!
        eng.stepSimulationForQualification(1 / 60, 46, false);
        eng.playerPos.y = 0.25;
        eng.playerVel.y = -6.0;
        eng.jumpsUsed = 2; // Exhaust air jumps so pressing jump queues jumpBufferTimer
        eng.triggerJumpOrSwing();
        const bufferedSet = eng.jumpBufferTimer > 0;
        eng.stepSimulationForQualification(1 / 60, 4, false);
        const bufferedAutoJumped = eng.playerVel.y > 5.0;

        // Coyote time verification after stepping off terrace y = 7.05m
        eng.teleportForQualification(-16.8, 7.05, -27.0, 30);
        eng.stepSimulationForQualification(1 / 60, 5, false);
        eng.grounded = false; // Simulate just walked off edge while coyoteTimer > 0
        eng.jumpsUsed = 0;
        eng.coyoteTimer = 0.11;
        eng.triggerJumpOrSwing();
        const coyoteJumpVy = Number(eng.playerVel.y.toFixed(2));
        eng.setTouchMove(0, 0);
        eng.setTouchSprint(false);
        return {
          preJumpSpeed: Number(preJumpSpeed.toFixed(2)),
          sprintJumpHoriz,
          sprintJumpVy,
          jumpInputResponseMs,
          bufferedSet,
          bufferedAutoJumped,
          coyoteJumpVy,
        };
      })()`
    );

    // 1C. Momentum Pendulum Web Swinging + Screenshot
    const swingMetrics = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.swingPeakSpeed = 0;
        eng.teleportForQualification(0, 5.2, -3.0, 30);
        eng.grounded = false;
        eng.coyoteTimer = 0;
        eng.playerYaw = Math.PI;
        eng.playerVel.set(0, -1.5, -6.0);
        eng.camYaw = 0;
        eng.camPitch = 0.14;
        eng.triggerJumpOrSwing(); // Attaches to wb-south-skybridge (0, 9.56, -7.0)
        const attached = eng.isSwinging;
        const ropeLen = Number(eng.swingRopeLength.toFixed(2));
        eng.stepSimulationForQualification(1 / 60, 18); // Swing through bottom of pendulum arc!
        const midArcSpeed = Number(Math.hypot(eng.playerVel.x, eng.playerVel.y, eng.playerVel.z).toFixed(2));
        return {
          attached,
          ropeLen,
          midArcSpeed,
          diag: eng.getQualificationDiagnostics().webTraversal,
        };
      })()`
    );
    await sleep(220);
    report.captures.push(await saveScreenshot(cdp, '04_p1m_pendulum_swing.png'));
    const swingRelease = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerJumpOrSwing(); // Release swing with tangential boost
        const releaseVel = Number(Math.hypot(eng.playerVel.x, eng.playerVel.y, eng.playerVel.z).toFixed(2));
        eng.stepSimulationForQualification(1 / 60, 20);
        return { releaseVel, swingPeakSpeed: eng.swingPeakSpeed };
      })()`
    );

    // 1D. Guided Zip-to-Anchor Perch Landing onto Bloodward Loft Terrace + Screenshot
    const zipMetrics = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.tacticalCooldown = 0;
        eng.clearEnemies();
        eng.teleportForQualification(5.5, 1.8, -15.5, 30);
        eng.grounded = false;
        eng.camYaw = -0.25;
        eng.camPitch = 0.14;
        eng.triggerTacticalAction(); // Triggers guided zip onto east crane perch -> Bloodward Loft
        const started = eng.zipActive;
        eng.stepSimulationForQualification(1 / 60, 14);
        return { started, midZipPos: eng.playerPos.toArray().map((n) => Number(n.toFixed(2))) };
      })()`
    );
    await sleep(200);
    report.captures.push(await saveScreenshot(cdp, '05_p1m_zip_landing.png'));
    const zipArrived = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.stepSimulationForQualification(1 / 60, 48, false);
        return {
          zipCompletedCount: eng.zipCompletedCount,
          landedY: Number(eng.playerPos.y.toFixed(2)),
          grounded: eng.grounded,
        };
      })()`
    );

    console.log('[P1-M STEP] 1D zipArrived:', JSON.stringify(zipArrived));

    // 1E. Free-Flow Targeting, Dodge-Cancel, Perfect Parry, Aerial Combo Slam, Wall-Pin, Companion Flank & Duo Finisher
    console.log('[P1-M STEP] Running 1E combatMetrics...');
    const combatMetrics = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.loadSaveState(eng.save);
        eng.teleportForQualification(-2.2, 0, -6.0, 20);
        const foe = eng.enemies.find((e) => e.state !== 'dead' && e.kind !== 'boss');
        foe.pos.set(-2.2, 0, -8.2);
        foe.rig.root.position.copy(foe.pos);
        foe.hp = 260;
        foe.maxHp = 260;
        eng.lockedEnemyId = foe.id;

        // Aerial 3-step combo -> slam landing recovery
        eng.playerPos.set(-2.2, 2.8, -7.2);
        eng.grounded = false;
        eng.attackTimer = 0;
        eng.attackComboStep = 0;
        eng.triggerLightAttack();
        eng.stepSimulationForQualification(1 / 60, 14, false);
        eng.attackTimer = 0;
        eng.triggerLightAttack();
        eng.stepSimulationForQualification(1 / 60, 14, false);
        eng.attackTimer = 0;
        eng.triggerLightAttack(); // Step 3 air slam
        eng.stepSimulationForQualification(1 / 60, 26, false);
        const slamLanded = eng.grounded;

        // Heavy whiff -> Dodge Cancel during recovery window (attackTimer <= 0.28s)
        const cancelsBefore = eng.dodgeCancelCount;
        eng.dodgeCooldown = 0;
        eng.attackTimer = 0;
        eng.triggerHeavyAttack();
        eng.stepSimulationForQualification(1 / 60, 12, false);
        eng.triggerDodgeOrParry();
        const dodgeCancelCount = eng.dodgeCancelCount - cancelsBefore;

        // Perfect Parry responsiveness
        const parriesBefore = eng.parryCount;
        foe.pos.set(eng.playerPos.x, 0, eng.playerPos.z - 1.5);
        foe.rig.root.position.copy(foe.pos);
        foe.unblockableWindup = false;
        foe.state = 'windup';
        foe.stateTimer = 0.03;
        eng.dodgeCooldown = 0;
        eng.attackTimer = 0;
        eng.startDefenseInput();
        const parryResponseMs = Number(eng.lastInputResponseMs.toFixed(4));
        eng.stepSimulationForQualification(1 / 60, 6, false);
        eng.endDefenseInput();
        const parried = eng.parryCount > parriesBefore;

        // Web Throw + Environmental Wall Pin against unobstructed East building wall (x = 18.2) + Companion Flanking
        foe.pos.set(15.2, 0, 6.0);
        foe.rig.root.position.copy(foe.pos);
        foe.snareTimer = 1.5;
        eng.teleportForQualification(12.8, 0, 6.0, 90);
        eng.playerYaw = Math.PI / 2;
        eng.camYaw = -Math.PI / 2 + 0.35;
        eng.camPitch = 0.16;
        eng.tacticalCooldown = 0;
        eng.lockedEnemyId = foe.id;
        eng.triggerTacticalAction(); // Triggers Wall Pin against east wall x=18.2!
        eng.stepSimulationForQualification(1 / 60, 18, true);
        const wallPinned = eng.wallPinsCount >= 1 && foe.wallPinnedTimer > 0;
        const companionSep = Number(eng.companionPos.distanceTo(eng.playerPos).toFixed(2));
        return {
          slamLanded,
          dodgeCancelCount,
          parried,
          parryResponseMs,
          wallPinned,
          wallPinsCount: eng.wallPinsCount,
          companionSep,
        };
      })()`
    );
    await sleep(200);
    report.captures.push(await saveScreenshot(cdp, '06_p1m_combat_wall_pin.png'));

    console.log('[P1-M STEP] 1E combatMetrics:', JSON.stringify(combatMetrics));

    // 1F. Two-Button Simultaneous Attack+Ability Chord -> Duo Finisher & Kai-Jax 3-Tail Fusion Continuity
    console.log('[P1-M STEP] Running 1F fusionAndDuo...');
    const fusionAndDuo = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        const foe = eng.enemies.find((e) => e.state !== 'dead');
        foe.pos.set(0, 0, -24.0);
        foe.rig.root.position.copy(foe.pos);
        foe.hp = 400;
        eng.teleportForQualification(0, 0, -21.8, 100);
        eng.attackTimer = 0;
        // Simulate simultaneous Light Attack + Ability 1 chord within chord window!
        eng.triggerLightAttack();
        eng.triggerAbility(1);
        const duoTriggeredByChord = eng.activeFinisher !== null;
        eng.stepSimulationForQualification(1 / 60, 95, false);

        // Now unlock & trigger Kai-Jax Fusion + verify 3 tails + unfuse continuity
        eng.save.fusionUnlocked = true;
        eng.fusionCharge = 100;
        eng.fusionCooldown = 0;
        eng.triggerFusion();
        eng.setTouchSprint(true);
        eng.setTouchMove(0, -1);
        eng.stepSimulationForQualification(1 / 60, 22, true);
        const fusedHero = eng.activeHero;
        const bones = eng.kaiJaxGlb.getSecondaryBoneCounts();
        const clipDuringSprint = eng.kaiJaxGlb.getCurrentClip();
        eng.setTouchMove(0, 0);
        eng.setTouchSprint(false);
        return {
          duoTriggeredByChord,
          duoFinishersUsed: eng.duoFinishersUsed,
          fusedHero,
          tailBones: bones.tailBones,
          physicalTailChains: Math.round(bones.tailBones / 4),
          clipDuringSprint,
        };
      })()`
    );
    await sleep(220);
    report.captures.push(await saveScreenshot(cdp, '07_p1m_kaijax_3tail_deformation.png'));
    const unfusedCheck = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.triggerFusion(); // Unfuse manually back to separate brothers
        eng.stepSimulationForQualification(1 / 60, 8);
        return {
          isFused: eng.isFused,
          activeHeroAfterUnfuse: eng.activeHero,
          kaiVisible: eng.kaiGlb.root.visible,
          jaxVisible: eng.jaxGlb.root.visible,
          kaiJaxHidden: !eng.kaiJaxGlb.root.visible,
        };
      })()`
    );

    console.log('[P1-M STEP] Running Priority 2 Visual captures...');
    report.priority1GameplayFeel = {
      accelBrake,
      jumpFeel,
      swingMetrics: { ...swingMetrics, ...swingRelease },
      zipMetrics: { ...zipMetrics, ...zipArrived },
      combatMetrics,
      fusionAndDuo: { ...fusionAndDuo, unfusedCheck },
    };

    // -------------------------------------------------------------------------
    // PRIORITY 2: VISUAL FIDELITY BEFORE / AFTER CAPTURES
    // -------------------------------------------------------------------------
    // Street Legacy vs P1-M Reconstructed
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('legacy');
        eng.teleportForQualification(0, 0, 13.5, 30);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(240);
    report.captures.push(await saveScreenshot(cdp, '01a_p1m_legacy_street.png'));

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('reconstructed');
        eng.applyGraphicsSettings({ ...eng.settings, graphicsQuality: 'high', environmentMode: 'reconstructed' });
        eng.teleportForQualification(0, 0, 13.5, 30);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.16;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(260);
    report.captures.push(await saveScreenshot(cdp, '01b_p1m_street.png'));

    // Bloodward Loft Sanctuary Framing (Open-sightline stanchions + Boryn mentor)
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.teleportForQualification(13.2, 7.05, -24.8, 30);
        eng.playerYaw = 1.45;
        eng.camYaw = -1.35;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(260);
    report.captures.push(await saveScreenshot(cdp, '02b_p1m_bloodward_dojo.png'));

    // Boss Courtyard Stronghold Arena Before / After (clean Boss sightline + floodlight gantry)
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.clearEnemies();
        eng.save.missionStageIndex = 4;
        eng.respawnStageEnemies(4);
        eng.setEnvironmentMode('legacy');
        eng.teleportForQualification(0, 0, -61.5, 90);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(240);
    report.captures.push(await saveScreenshot(cdp, '03a_p1m_legacy_courtyard.png'));

    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.setEnvironmentMode('reconstructed');
        eng.teleportForQualification(0, 0, -61.5, 90);
        eng.playerYaw = Math.PI;
        eng.camYaw = 0;
        eng.camPitch = 0.17;
        eng.stepSimulationForQualification(1 / 60, 8);
      })()`,
    });
    await sleep(260);
    report.captures.push(await saveScreenshot(cdp, '03b_p1m_stronghold_courtyard.png'));

    const beaconHiddenInArena = await evalJson(
      cdp,
      'window.__KAIJAX_ENGINE__.objectiveBeacon.visible'
    );
    report.priority2VisualFidelity = {
      beaconHiddenCloseToBossArena: beaconHiddenInArena === false,
      all12ModularGlbsLoaded:
        (await evalJson(cdp, 'window.__KAIJAX_ENGINE__.world.modularKitLoadedCount')) === 12,
    };

    // -------------------------------------------------------------------------
    // PRIORITY 3/4: MOBILE 844x390 SIMULTANEOUS MULTI-TOUCH & PERF PROFILING
    // -------------------------------------------------------------------------
    await setViewport(cdp, 844, 390, true, 2);
    await sleep(260);

    // Real Simultaneous Multi-Touch Test via synthetic multi-pointer PointerEvents (pointerId 101 on joystick + pointerId 202 tapping Attack!)
    const multiTouchResult = await evalJson(
      cdp,
      `(() => {
        const eng = window.__KAIJAX_ENGINE__;
        eng.spawnPatrolSkirmish();
        eng.teleportForQualification(0, 0, -24.0, 80);
        eng.attackTimer = 0;

        const joyEl = document.querySelector('[aria-label="Movement Joystick"]');
        const attackBtn = Array.from(document.querySelectorAll('button')).find((b) =>
          /Attack|Counter/i.test(b.textContent || '')
        );
        if (!joyEl || !attackBtn) return { foundControls: false };

        const jRect = joyEl.getBoundingClientRect();
        const aRect = attackBtn.getBoundingClientRect();
        const jCx = jRect.left + jRect.width / 2;
        const jCy = jRect.top + jRect.height / 2;

        // Pointer 1: Touch down and drag North on Virtual Joystick
        joyEl.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true, pointerId: 101, pointerType: 'touch', clientX: jCx, clientY: jCy
        }));
        joyEl.dispatchEvent(new PointerEvent('pointermove', {
          bubbles: true, pointerId: 101, pointerType: 'touch', clientX: jCx, clientY: jCy - 32
        }));
        const touchMoveWhileHeld = { x: Number(eng.touchMove.x.toFixed(2)), y: Number(eng.touchMove.y.toFixed(2)) };

        // Pointer 2: Simultaneous second thumb tap on Attack button while Pointer 1 remains active!
        attackBtn.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true, pointerId: 202, pointerType: 'touch',
          clientX: aRect.left + aRect.width / 2, clientY: aRect.top + aRect.height / 2
        }));
        const attackTriggeredDuringJoy = eng.attackTimer > 0;
        const moveStillHeld = Math.hypot(eng.touchMove.x, eng.touchMove.y) > 0.5;

        // Release both pointers cleanly
        attackBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 202, pointerType: 'touch' }));
        joyEl.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 101, pointerType: 'touch' }));
        const moveResetAfterRelease = eng.touchMove.x === 0 && eng.touchMove.y === 0;

        const buttons = Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null);
        const outOfBoundsButtons = buttons.filter((b) => {
          const r = b.getBoundingClientRect();
          return r.right > window.innerWidth + 2 || r.bottom > window.innerHeight + 2 || r.left < -2 || r.top < -2;
        }).length;

        return {
          foundControls: true,
          touchMoveWhileHeld,
          attackTriggeredDuringJoy,
          moveStillHeld,
          moveResetAfterRelease,
          outOfBoundsButtons,
          visibleButtons: buttons.length,
        };
      })()`
    );

    const perfTiers = {};
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
      perfTiers[tier] = await evalJson(
        cdp,
        `(() => {
          const eng = window.__KAIJAX_ENGINE__;
          eng.renderer.render(eng.scene, eng.camera);
          const t0 = performance.now();
          eng.stepSimulationForQualification(1 / 60, 12, false);
          const cpuSimAvgMs = Number(((performance.now() - t0) / 12).toFixed(3));
          const r0 = performance.now();
          eng.renderer.render(eng.scene, eng.camera);
          const renderSubmitMs = Number((performance.now() - r0).toFixed(3));
          return { ...eng.getPerformanceMetrics(), cpuSimAvgMs, renderSubmitMs };
        })()`
      );
      console.log('[P1-M PERF]', tier, JSON.stringify(perfTiers[tier]));
    }

    await cdp.send('Runtime.evaluate', {
      expression: `window.__KAIJAX_ENGINE__.applyGraphicsSettings({
        ...window.__KAIJAX_ENGINE__.settings,
        graphicsQuality: 'balanced',
        environmentMode: 'reconstructed'
      })`,
    });
    await sleep(300);
    report.captures.push(await saveScreenshot(cdp, '08_p1m_mobile_844x390_multitouch_hud.png'));

    report.priority3MobileAndPerformance = {
      initialLoadMs,
      multiTouchResult,
      perfTiers,
    };

    // Compose Reference / Before / After Plates
    await setViewport(cdp, 1560, 620, false, 1);
    for (const [m, outName] of [
      ['street_triptych', '01_p1m_street_before_after.png'],
      ['bloodward_pair', '02_p1m_bloodward_ref_comparison.png'],
      ['courtyard_triptych', '03_p1m_courtyard_before_after.png'],
    ]) {
      await cdp.send('Page.navigate', {
        url: `http://127.0.0.1:${activeHarnessPort}/harness.html?mode=${m}`,
      });
      await waitForExpr(cdp, 'window.__HARNESS_READY__');
      await sleep(220);
      report.captures.push(await saveScreenshot(cdp, outName));
    }

    report.runtimeIntegrity = {
      httpFailures: cdp.httpFailures,
      consoleErrors: cdp.consoleErrors,
      pageExceptions: cdp.pageExceptions,
    };

    const jsonDest = path.join(ROOT, 'docs', 'production', 'p1m-qualification.json');
    fs.writeFileSync(jsonDest, JSON.stringify(report, null, 2));
    console.log(`[P1-M JSON] Wrote ${path.relative(ROOT, jsonDest)}`);
    console.log(JSON.stringify(report, null, 2));
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
