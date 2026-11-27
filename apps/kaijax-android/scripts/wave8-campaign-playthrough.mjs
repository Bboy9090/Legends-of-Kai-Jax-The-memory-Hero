#!/usr/bin/env node
/**
 * OPERATION KAI-JAX — WAVE 8: EIGHT-DISTRICT CAMPAIGN PLAYTHROUGH
 *
 * Drives the REAL game engine (window.__KAIJAX_ENGINE__) through its public input methods
 * (movement stick, light/heavy attack, abilities, dodge/parry, hero switch) against live enemy AI,
 * until each district boss is actually defeated by combat. No health is edited and no enemy is killed
 * by script. Works against:
 *   - local headless Chromium (default; launches its own browser), or
 *   - any existing CDP endpoint, e.g. the Android System WebView forwarded with adb:
 *       adb forward tcp:9333 localabstract:webview_devtools_remote_<pid>
 *       node scripts/wave8-campaign-playthrough.mjs --cdp http://127.0.0.1:9333
 *
 * Usage: node scripts/wave8-campaign-playthrough.mjs [--app URL] [--cdp URL] [--out DIR]
 *        [--districts a,b,c] [--max-seconds N] [--label name] [--mobile]
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const next = process.argv[i + 1];
    if (next && !next.startsWith('--')) {
      args.set(a.slice(2), next);
      i++;
    } else args.set(a.slice(2), 'true');
  }
}
const APP_URL = args.get('app') || 'http://127.0.0.1:3000';
const CDP_URL = args.get('cdp') || '';
const LABEL = args.get('label') || (CDP_URL ? 'android' : 'chromium');
const OUT_DIR = path.resolve(args.get('out') || `docs/production/captures/wave8-${LABEL}`);
const MAX_SECONDS = Number(args.get('max-seconds') || 150); // sim seconds per boss attempt
const MOBILE = args.has('mobile');
const ALL = [
  'ashblock-heights',
  'sector-7',
  'neon-ward',
  'iron-market',
  'undercrown',
  'zenith-spires',
  'erasure-fields',
  'memory-nexus',
];
const DISTRICTS = (args.get('districts') || ALL.join(',')).split(',');
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(url) {
    this.url = url;
    this.id = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.exceptions = [];
    this.httpFailures = [];
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(new Error('ws error ' + (e.message || '')));
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        if (m.id && this.pending.has(m.id)) {
          const p = this.pending.get(m.id);
          this.pending.delete(m.id);
          m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
        } else if (m.method === 'Runtime.exceptionThrown') {
          this.exceptions.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
        } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
          this.consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
        } else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
          this.httpFailures.push(`${m.params.response.status} ${m.params.response.url}`);
        }
      };
    });
  }
  send(method, params = {}, timeoutMs = 120000) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => (clearTimeout(t), resolve(v)),
        reject: (e) => (clearTimeout(t), reject(e)),
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  /** Run a function declaration in the page with JSON-serialisable arguments (no string-built code). */
  async call(functionDeclaration, ...args) {
    if (!this.globalId) this.globalId = (await this.send('Runtime.evaluate', { expression: 'globalThis' })).result.objectId;
    const r = await this.send('Runtime.callFunctionOn', {
      objectId: this.globalId,
      functionDeclaration,
      arguments: args.map((value) => ({ value })),
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async eval(expression, timeoutMs = 120000) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, timeoutMs);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
}

async function connect() {
  let proc = null;
  let base = CDP_URL;
  if (!base) {
    const port = 9360 + crypto.randomInt(0, 40);
    const bin =
      process.env.CHROME_BIN ||
      ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/opt/pw-browsers/chromium-1228/chrome-linux64/chrome'].find((p) =>
        fs.existsSync(p),
      );
    proc = spawn(
      bin,
      [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--remote-allow-origins=*',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        'about:blank',
      ],
      { stdio: 'ignore' },
    );
    base = `http://127.0.0.1:${port}`;
  }
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`${base}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && !t.url.startsWith('devtools://'));
      if (page?.webSocketDebuggerUrl) {
        const wsUrl = page.webSocketDebuggerUrl.replace(/^ws:\/\/[^/]+/, base.replace(/^http/, 'ws'));
        const cdp = new CDP(wsUrl);
        await cdp.connect();
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Network.enable');
        return { cdp, proc };
      }
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error('could not reach CDP at ' + base);
}

/* ---------------------------------------------------------------- in-page bot */
const BOT = `
(() => {
  const E = () => window.__KAIJAX_ENGINE__;
  const events = { dialogue: [], rewards: [], saves: [] };
  const wrapped = new WeakSet();
  function hook() {
    const eng = E();
    if (!eng || wrapped.has(eng)) return;
    wrapped.add(eng);
    const cb = eng.callbacks;
    const orig = { r: cb.onGrantRewards, d: cb.onTriggerDialogue, s: cb.onSaveProgress };
    cb.onGrantRewards = (xp, items, shards) => { events.rewards.push({ xp, items, shards }); return orig.r?.(xp, items, shards); };
    cb.onTriggerDialogue = (lines) => { events.dialogue.push(Array.isArray(lines) ? lines.length : 1); return orig.d?.(lines); };
    cb.onSaveProgress = (patch, flag) => { events.saves.push(Object.keys(patch || {})); return orig.s?.(patch, flag); };
  }
  const isBoss = (e) => e.kind === 'boss' || String(e.id).startsWith('boss-');
  const alive = () => E().enemies.filter((e) => e.state !== 'dead');
  function steer(tx, tz, sprint) {
    const eng = E();
    const dx = tx - eng.playerPos.x, dz = tz - eng.playerPos.z, d = Math.hypot(dx, dz) || 1;
    const ux = dx / d, uz = dz / d;
    const fx = -Math.sin(eng.camYaw), fz = -Math.cos(eng.camYaw), rx = Math.cos(eng.camYaw), rz = -Math.sin(eng.camYaw);
    eng.setTouchMove(ux * rx + uz * rz, -(ux * fx + uz * fz));
    eng.setTouchSprint(!!sprint);
    return d;
  }
  function nav(tx, tz, sprint, farThreshold) {
    const eng = E();
    const d0 = Math.hypot(tx - eng.playerPos.x, tz - eng.playerPos.z);
    state.lastPos = state.lastPos || { x: eng.playerPos.x, z: eng.playerPos.z, step: state.step };
    if (state.step - state.lastPos.step >= 45) {
      const moved = Math.hypot(eng.playerPos.x - state.lastPos.x, eng.playerPos.z - state.lastPos.z);
      state.stuck = d0 > farThreshold && moved < 0.6 ? Math.min((state.stuck || 0) + 1, 12) : 0;
      state.lastPos = { x: eng.playerPos.x, z: eng.playerPos.z, step: state.step };
      if (state.stuck >= 2 && state.stuck % 2 === 0 && eng.playerPos.y < 1.2) { eng.triggerJumpOrSwing(); state.jumps = (state.jumps || 0) + 1; }
    }
    let aimX = tx, aimZ = tz;
    if (state.stuck >= 2 && eng.playerPos.y < 1.2) {
      const ang = (state.stuck % 4 < 2 ? 1 : -1) * Math.min(0.9 + 0.35 * state.stuck, 2.4);
      const dx0 = tx - eng.playerPos.x, dz0 = tz - eng.playerPos.z;
      aimX = eng.playerPos.x + dx0 * Math.cos(ang) - dz0 * Math.sin(ang);
      aimZ = eng.playerPos.z + dx0 * Math.sin(ang) + dz0 * Math.cos(ang);
    }
    steer(aimX, aimZ, sprint);
    return d0;
  }
  const state = { handled: new Map(), attackClock: 0, step: 0, deaths: 0, parries: 0, dodges: 0, heroSwitches: 0, maxStageSeen: 0, abilityUses: 0, hits: 0 };
  function snapshot() {
    const eng = E();
    const a = alive();
    const boss = eng.enemies.find(isBoss);
    return {
      step: state.step,
      simSeconds: +(state.step / 60).toFixed(1),
      hero: eng.activeHero,
      pos: [+eng.playerPos.x.toFixed(1), +eng.playerPos.y.toFixed(1), +eng.playerPos.z.toFixed(1)],
      kaiHp: Math.round(eng.kaiHp), jaxHp: Math.round(eng.jaxHp),
      alive: a.length,
      stage: eng.districtStageIndex,
      combo: eng.comboState?.count ?? 0,
      boss: boss ? { id: boss.id, hp: Math.round(boss.hp), maxHp: boss.maxHp, phase: boss.phase, armor: Math.round(boss.armor), state: boss.state } : null,
    };
  }
  function tick() {
    const eng = E();
    state.step++;
    const list = alive();
    if (!list.length) {
      // No enemies left: follow the mission objective (rescue civilians / memory site / alley gate) with real interact presses.
      let goal = null;
      if (eng.activeDistrictId === 'ashblock-heights' && !eng.isVictory) {
        const stage = eng.save.missionStageIndex;
        const civ = eng.world.civilians.find((c) => !c.rescued);
        if (stage === 1 && civ) goal = civ.position;
        else if (stage === 2) goal = eng.world.memorySitePos;
        else if (stage === 3) goal = eng.world.alleyGatePos;
        state.objectiveStage = stage;
      }
      if (goal && goal.y > 1) {
        // Rooftop civilian: climb the stair-step platforms with real run + jump input (route measured from the level colliders).
        const route = [[12, -13.5], [12.4, -17.4], [12.8, -20.8], [13, -24], [14.5, -27], [14.5, -31.5], [14.5, -33]];
        state.wp = state.wp || 0;
        const [wx, wz] = route[Math.min(state.wp, route.length - 1)];
        const dw = steer(wx, wz, false);
        if (state.step % 22 === 0 && eng.playerPos.y < goal.y - 0.2 + 3.5) { eng.triggerJumpOrSwing(); state.jumps = (state.jumps || 0) + 1; }
        if (dw < 1.1 && state.wp < route.length - 1) state.wp++;
        if (state.wp >= route.length - 1 && Math.hypot(goal.x - eng.playerPos.x, goal.y - eng.playerPos.y, goal.z - eng.playerPos.z) < 3.4) {
          eng.setTouchMove(0, 0);
          if (state.step % 20 === 0) { eng.triggerInteract(); state.interacts = (state.interacts || 0) + 1; }
        }
      } else if (goal) {
        const d = nav(goal.x, goal.z, true, 3.4);
        const d3 = Math.hypot(goal.x - eng.playerPos.x, goal.y - eng.playerPos.y, goal.z - eng.playerPos.z);
        if (d < 3.4 && d3 < 3.4) { eng.setTouchMove(0, 0); if (state.step % 20 === 0) { eng.triggerInteract(); state.interacts = (state.interacts || 0) + 1; } }
        else if (d < 1.2 && eng.playerPos.y - goal.y > 1.5) { eng.setTouchMove(0.6, 0.6); }
      } else eng.setTouchMove(0, 0);
      return;
    }
    // Fight the lowest remaining stage first (vanguard before boss), nearest within stage.
    const minStage = Math.min(...list.map((e) => e.stageTag));
    const pool = list.filter((e) => e.stageTag === minStage);
    pool.sort((a, b) => a.pos.distanceTo(eng.playerPos) - b.pos.distanceTo(eng.playerPos));
    const target = pool[0];
    state.maxStageSeen = Math.max(state.maxStageSeen, eng.districtStageIndex);
    const dist = nav(target.pos.x, target.pos.z, target.pos.distanceTo(eng.playerPos) > 7, 3);
    // Defence first: react to any telegraphed strike from enemies that are close.
    for (const e of list) {
      if (e.state !== 'windup' || e.pos.distanceTo(eng.playerPos) > 8) continue;
      const key = e.id + ':' + e.attackCount;
      if (state.handled.has(key)) continue;
      if (e.unblockableWindup ? e.stateTimer < 0.34 : e.stateTimer < 0.11) {
        state.handled.set(key, true);
        eng.triggerDodgeOrParry();
        e.unblockableWindup ? state.dodges++ : state.parries++;
      }
    }
    if (dist >= 6.5 && dist < 14 && state.step % 30 === 0) {
      for (const slot of [1, 2, 3]) {
        if (eng.abilityCooldowns[slot - 1] <= 0) { eng.triggerAbility(slot); state.abilityUses++; break; }
      }
    }
    if (dist < 6.5) {
      // Free-flow: attacks lunge toward the locked target from up to ~9m, so players strike from range and close in.
      if (dist < 2.6) eng.setTouchMove(0, 0);
      state.attackClock -= 1 / 60;
      if (state.attackClock <= 0) {
        for (const slot of [1, 2, 3]) {
          if (eng.abilityCooldowns[slot - 1] <= 0) { eng.triggerAbility(slot); state.abilityUses++; break; }
        }
        (state.step % 5 === 0 ? eng.triggerHeavyAttack : eng.triggerLightAttack).call(eng);
        state.attackClock = 0.28;
      }
    }
    const cur = eng.activeHero === 'jax' ? eng.jaxHp : eng.kaiHp;
    const other = eng.activeHero === 'jax' ? eng.kaiHp : eng.jaxHp;
    if (cur < 28 && other > 60 && state.step - (state.lastSwitch || -999) > 300) { eng.triggerSwitchHero(); state.heroSwitches++; state.lastSwitch = state.step; }
    if (eng.isGameOver) state.dead = true;
  }
  return {
    hook, events, state, snapshot,
    resetCounters() { state.handled.clear(); state.step = 0; state.dead = false; state.attackClock = 0; state.parries = state.dodges = state.abilityUses = state.heroSwitches = 0; state.lastPos = null; state.wp = 0; state.stuck = 0; state.jumps = 0; state.interacts = 0; events.dialogue.length = events.rewards.length = events.saves.length = 0; },
    run(maxSteps, chunk, stopWhenBossDead) {
      const eng = E();
      hook();
      const timeline = [];
      let bossSeen = false;
      for (let i = 0; i < maxSteps; i++) {
        if (eng.paused) return { timeline, bossSeen, dead: !!state.dead, steps: state.step, paused: true };
        tick();
        eng.stepSimulationForQualification(1 / 60, 1, false);
        const boss = eng.enemies.find(isBoss);
        if (boss) bossSeen = true;
        if (state.step % chunk === 0) timeline.push(snapshot());
        if (state.dead) break;
        if (stopWhenBossDead && boss && boss.state === 'dead') break;
        if (!stopWhenBossDead && !alive().length) break;
      }
      eng.setTouchMove(0, 0);
      return { timeline, bossSeen, dead: !!state.dead, steps: state.step, paused: false };
    },
  };
})()
`;

async function waitFor(cdp, expr, timeoutMs = 90000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      if (await cdp.eval(`Boolean(${expr})`, 8000)) return true;
    } catch {
      /* page still loading */
    }
    await sleep(500);
  }
  return false;
}

const CLICK_BTN = (re) => `(() => {
  const b = [...document.querySelectorAll('button')].find((x) => ${re}.test((x.innerText || '').trim()) && x.offsetParent !== null);
  if (!b) return null;
  const card = b.closest('div')?.parentElement?.innerText || '';
  b.click();
  return card.replace(/\\s+/g, ' ').slice(0, 220);
})()`;

/** Click through every visible dialogue box exactly like a player pressing "Next". */
async function pumpDialogue(cdp, transcript, label) {
  let clicked = 0;
  for (let i = 0; i < 60; i++) {
    const text = await cdp.eval(CLICK_BTN('/^(Next|Continue|Begin|Finish|Close)/i'), 15000);
    if (!text) break;
    transcript.push({ at: label, text });
    clicked++;
    await sleep(120);
  }
  return clicked;
}

async function startGameFromTitle(cdp, transcript) {
  const text = await cdp.eval(CLICK_BTN('/^Enter Ashblock/i'), 15000);
  if (text === null) return { startedFromTitle: false };
  await sleep(1500);
  const clicks = await pumpDialogue(cdp, transcript, 'opening');
  return { startedFromTitle: true, openingDialogueClicks: clicks };
}

async function shot(cdp, name) {
  await cdp.eval(`window.__KAIJAX_ENGINE__.stepSimulationForQualification(1/60, 1, true)`);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 78 }, 60000);
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  return path.basename(file);
}

async function main() {
  const { cdp, proc } = await connect();
  const report = {
    operation: 'OPERATION KAI-JAX — WAVE 8 CAMPAIGN PLAYTHROUGH',
    target: LABEL,
    appUrl: CDP_URL ? '(existing page)' : APP_URL,
    startedAt: new Date().toISOString(),
    userAgent: null,
    districts: {},
  };
  try {
    if (!CDP_URL) {
      if (MOBILE) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true });
      } else {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
      }
      await cdp.send('Page.navigate', { url: APP_URL });
    }
    report.userAgent = await cdp.eval('navigator.userAgent', 15000).catch(() => null);
    const ready = await waitFor(
      cdp,
      `window.__KAIJAX_ENGINE__ && Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every(c => c.status === 'ready')`,
      120000,
    );
    report.engineReady = ready;
    if (!ready) throw new Error('engine did not become ready');
    const transcript = [];
    report.dialogueTranscript = transcript;
    report.start = await startGameFromTitle(cdp, transcript);
    await cdp.eval(`window.__w8 = ${BOT}`);

    for (const id of DISTRICTS) {
      const rec = { id, attempts: [] };
      report.districts[id] = rec;
      console.error(`\n=== ${id} ===`);
      for (let attempt = 1; attempt <= 3; attempt++) {
        await cdp.call(`function (districtId) { const e = window.__KAIJAX_ENGINE__; if (districtId === 'ashblock-heights') { e.save = { ...e.save, missionStageIndex: 0, missionCompleted: false }; e.isVictory = false; } window.__w8.staleVictoryOnEntry = !!e.isVictory; e.switchDistrict(districtId); window.__w8.resetCounters(); window.__w8.hook(); }`, id);
        const diag = await cdp.eval(`(() => { const d = window.__KAIJAX_ENGINE__.getQualificationDiagnostics(); return { district: window.__KAIJAX_ENGINE__.activeDistrictId, walkableZones: d.walkableZonesCount, anchors: d.webTraversal.anchorsTotal, anchorsAttached: d.webTraversal.allAnchorsGeometryAttached, civilians: (window.__KAIJAX_ENGINE__.world.civilians || []).map(c => ({ name: c.name, pos: c.position.toArray().map(v => +v.toFixed(1)) })), memorySitePos: window.__KAIJAX_ENGINE__.world.memorySitePos?.toArray?.(), alleyGatePos: window.__KAIJAX_ENGINE__.world.alleyGatePos?.toArray?.(), walkableTops: (window.__KAIJAX_ENGINE__.world.colliders || []).filter(c => c.walkableTop).map(c => [c.minX, c.maxX, c.minZ, c.maxZ, c.maxY].map(v => +v.toFixed(1))), enemies: d.aliveEnemies.map(e => ({id:e.id, kind:e.kind, hp:e.hp})) }; })()`);
        if (attempt === 1) {
          rec.entry = diag;
          rec.screenshots = [await shot(cdp, `${id}-01-entry.jpg`)];
        }
        const start = Date.now();
        const bossIds = diag.enemies.filter((e) => e.kind === 'boss' || e.id.startsWith('boss-')).map((e) => e.id);
        let chunkResult;
        const maxSteps = MAX_SECONDS * 60;
        // run in slices so CDP never times out and we can screenshot the boss phase change
        const timeline = [];
        let done = false;
        let midShot = false;
        let spent = 0;
        let stalls = 0;
        while (spent < maxSteps && !done) {
          chunkResult = await cdp.eval(`window.__w8.run(${Math.min(240, maxSteps - spent)}, 60, true)`, 600000);
          timeline.push(...chunkResult.timeline);
          if (chunkResult.paused) {
            const n = await pumpDialogue(cdp, transcript, `${id}#${attempt}@${chunkResult.steps}`);
            if (!n) {
              // paused for another reason (e.g. command hub): resume like closing the menu
              await cdp.eval(`window.__KAIJAX_ENGINE__.setPaused(false)`);
              if (++stalls > 8) break;
            }
          }
          spent = await cdp.eval('window.__w8.state.step');
          const last = chunkResult.timeline[chunkResult.timeline.length - 1];
          if (!midShot && last?.boss && last.boss.hp < last.boss.maxHp) {
            midShot = true;
            rec.screenshots.push(await shot(cdp, `${id}-02-boss-engaged.jpg`));
          }
          const status = await cdp.eval(`(() => { const e = window.__KAIJAX_ENGINE__; const b = e.enemies.find(x => x.kind === 'boss' || String(x.id).startsWith('boss-')); return { dead: window.__w8.state.dead, bossDead: !!b && b.state === 'dead', steps: window.__w8.state.step, isVictory: !!e.isVictory }; })()`);
          if (status.dead || (status.bossDead && (id !== 'ashblock-heights' || status.isVictory))) done = true;
        }
        const outcome = await cdp.call(`function (districtId) { return (() => {
          const e = window.__KAIJAX_ENGINE__; const w = window.__w8;
          const boss = e.enemies.find(x => x.kind === 'boss' || String(x.id).startsWith('boss-'));
          return {
            aliveEnemies: e.enemies.filter(x => x.state !== 'dead').map(x => ({ id: x.id, kind: x.kind, state: x.state, hp: Math.round(x.hp), pos: [+x.pos.x.toFixed(1), +x.pos.y.toFixed(1), +x.pos.z.toFixed(1)], stageTag: x.stageTag })),
            playerPos: [+e.playerPos.x.toFixed(1), +e.playerPos.y.toFixed(1), +e.playerPos.z.toFixed(1)],
            missionStage: e.save?.missionStageIndex ?? null,
            civiliansRescued: e.world?.civilians ? e.world.civilians.filter(c => c.rescued).length + '/' + e.world.civilians.length : null,
            memorySiteDone: !!e.world?.memorySiteReconstructed, alleyGateOpen: !!e.world?.alleyGateOpen,
            bossDefeated: !!boss && boss.state === 'dead' && (districtId !== 'ashblock-heights' || !!e.isVictory),
            playerDied: !!w.state.dead,
            isVictory: !!e.isVictory,
            stageReached: e.districtStageIndex,
            counters: { interacts: w.state.interacts || 0, jumps: w.state.jumps || 0, parries: w.state.parries, dodges: w.state.dodges, abilityUses: w.state.abilityUses, heroSwitches: w.state.heroSwitches },
            events: { dialogueBlocks: w.events.dialogue, rewards: w.events.rewards, saveKeys: w.events.saves },
            completedDistricts: e.save?.completedDistricts ?? [],
            final: w.snapshot(),
          };
        })(); }`, id);
        const wallSeconds = +((Date.now() - start) / 1000).toFixed(1);
        const phases = [...new Set(timeline.filter((t) => t.boss).map((t) => t.boss.phase))];
        rec.attempts.push({ attempt, wallSeconds, ...outcome, bossPhasesObserved: phases, timeline });
        console.error(
          `[${id}] attempt ${attempt}: bossDefeated=${outcome.bossDefeated} died=${outcome.playerDied} phases=${phases} sim=${outcome.final.simSeconds}s wall=${wallSeconds}s`,
        );
        if (outcome.bossDefeated && outcome.final.simSeconds > 3) {
          await sleep(500);
          await cdp.eval(`window.__KAIJAX_ENGINE__.stepSimulationForQualification(1/60, 90, true)`);
          rec.screenshots.push(await shot(cdp, `${id}-03-boss-defeated.jpg`));
          // The victory dialogue appears after the defeat settles: click through it like a player.
          await sleep(800);
          rec.victoryDialogueClicks = await pumpDialogue(cdp, transcript, `${id}#victory`);
          // rewards / unlock / save evidence after the defeat settle
          rec.afterDefeat = await cdp.eval(`(() => { const e = window.__KAIJAX_ENGINE__; const w = window.__w8; return { completedDistricts: e.save?.completedDistricts ?? [], rewards: w.events.rewards, dialogueBlocks: w.events.dialogue }; })()`);
          break;
        }
        rec.screenshots.push(await shot(cdp, `${id}-attempt${attempt}-${outcome.playerDied ? 'died' : 'timeout'}.jpg`));
      }
      rec.cleared = rec.attempts.some((a) => a.bossDefeated || a.isVictory);
      rec.perf = await cdp.eval('window.__KAIJAX_ENGINE__.getPerformanceMetrics()');
    }

    report.wrongBossDialogue = transcript.filter((t) => /Fang Enforcer/.test(t.text) && !/^ashblock/.test(t.at) && t.at !== 'opening');

    // Regression: stale defeat / victory state must not survive district travel (fixed in switchDistrict).
    report.travelStateRegression = await cdp.eval(`(() => {
      const e = window.__KAIJAX_ENGINE__;
      e.isGameOver = true; e.isVictory = true;
      e.switchDistrict('neon-ward');
      const out = { isGameOverAfterTravel: e.isGameOver, isVictoryAfterTravel: e.isVictory };
      e.switchDistrict('ashblock-heights');
      return out;
    })()`);

    // Save / reload continuity: persist, reload page, and read completed districts back.
    await sleep(2500);
    report.preReload = await cdp.eval(`(() => ({ completed: window.__KAIJAX_ENGINE__.save?.completedDistricts ?? [], storageKeys: Object.keys(localStorage).filter(k => /save|kaijax/i.test(k)) }))()`);
    await cdp.send('Page.reload', { ignoreCache: false });
    const readyAgain = await waitFor(
      cdp,
      `window.__KAIJAX_ENGINE__ && Object.values(window.__KAIJAX_ENGINE__.getQualificationDiagnostics().loadedCharacterGlbs).every(c => c.status === 'ready')`,
      120000,
    );
    report.postReload = readyAgain
      ? await cdp.eval(`(() => ({ completed: window.__KAIJAX_ENGINE__.save?.completedDistricts ?? [], district: window.__KAIJAX_ENGINE__.activeDistrictId }))()`)
      : { error: 'engine not ready after reload' };
    report.saveReloadMatches =
      Array.isArray(report.postReload.completed) &&
      report.preReload.completed.every((d) => report.postReload.completed.includes(d));

    // Return travel to the hub.
    if (readyAgain) {
      report.returnTravel = await cdp.eval(`(() => { const e = window.__KAIJAX_ENGINE__; e.switchDistrict('ashblock-heights'); const d = e.getQualificationDiagnostics(); return { district: e.activeDistrictId, walkableZones: d.walkableZonesCount }; })()`);
      report.returnTravelShot = await shot(cdp, 'return-travel-ashblock.jpg');
    }
  } catch (err) {
    report.fatal = String(err?.stack || err);
    console.error('FATAL', report.fatal);
  } finally {
    report.finishedAt = new Date().toISOString();
    report.runtime = { consoleErrors: cdp.consoleErrors.slice(0, 40), pageExceptions: cdp.exceptions.slice(0, 40), httpFailures: cdp.httpFailures.slice(0, 40) };
    report.summary = Object.fromEntries(
      Object.entries(report.districts).map(([k, v]) => [k, { cleared: !!v.cleared, attempts: v.attempts.length, phases: v.attempts.at(-1)?.bossPhasesObserved }]),
    );
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
    console.error('\nSUMMARY', JSON.stringify(report.summary), 'saveReloadMatches=', report.saveReloadMatches);
    try { cdp.ws.close(); } catch { /* ignore */ }
    if (proc) proc.kill('SIGKILL');
  }
}

main();
