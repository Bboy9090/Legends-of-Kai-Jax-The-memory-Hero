#!/usr/bin/env node
/**
 * Real-browser check of the admin sign-in workflow (server/admin.ts + src/services/adminSession.ts + AdminLoginDialog).
 * Starts its own server with a throwaway admin secret and a headless Chromium, then:
 *  - confirms an unauthenticated vault mutation is refused,
 *  - triggers the real sign-in dialog through adminFetch, rejects a wrong secret, accepts the right one,
 *  - confirms the retried mutation succeeds, the session cookie is HttpOnly (invisible to JS), and the secret
 *    never appears in page storage, DOM or the served bundle.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const SECRET = 'wave8-throwaway-secret-' + Math.random().toString(36).slice(2) + 'abcdef';
const PORT = 3150 + Math.floor(Math.random() * 40);
const CDP_PORT = 9420 + Math.floor(Math.random() * 40);
const OUT = path.resolve(process.argv[2] || 'docs/production/captures/wave8-admin');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = { secretLength: SECRET.length, checks: {} };

const server = spawn('npx', ['tsx', 'server.ts'], { env: { ...process.env, PORT: String(PORT), KAIJAX_ADMIN_TOKEN: SECRET, NODE_ENV: 'development', KAIJAX_ADMIN_AUDIT_LOG: path.join(OUT, 'admin-audit.sample.log') }, stdio: 'ignore' });
const chromeBin = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/opt/pw-browsers/chromium-1228/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
const chrome = spawn(chromeBin, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--remote-allow-origins=*', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage', 'about:blank'], { stdio: 'ignore' });
const cleanup = () => { try { chrome.kill('SIGKILL'); } catch {} try { server.kill('SIGKILL'); } catch {} };
process.on('exit', cleanup);

async function until(fn, ms = 60000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = await fn(); if (v) return v; } catch {} await sleep(300); } throw new Error('timeout'); }

await until(async () => (await fetch(`http://127.0.0.1:${PORT}/api/admin/status`)).ok);
const page = await until(async () => (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()).find((t) => t.type === 'page'));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((resolve) => { const i = id++; pend.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };

await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
await until(() => ev(`Boolean(document.querySelector('button'))`));
await sleep(1500);
await ev(`window.__admin = import('/src/services/adminSession.ts').then(m => (window.__m = m, true))`);

report.checks.status = await ev(`window.__m.fetchAdminStatus().then(s => ({ mode: s.mode, authenticated: s.authenticated, hasCsrf: !!s.csrf }))`);
report.checks.unauthenticatedMutationRefused = await ev(`fetch('/api/canon-drive/clear', { method: 'POST', credentials: 'same-origin' }).then(async r => ({ status: r.status, code: (await r.json()).code }))`);

// Kick off a mutation through adminFetch: the real dialog must appear.
await ev(`window.__pending = window.__m.adminFetch('/api/canon-drive/clear', { method: 'POST' }).then(r => r.status); true`);
await until(() => ev(`Boolean(document.querySelector('[data-testid="admin-login"]'))`), 15000);
report.checks.dialogShown = true;
report.checks.dialogFocusedInput = await ev(`document.activeElement?.id === 'admin-secret'`);
const shot = async (name) => { const { result } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(path.join(OUT, name), Buffer.from(result.data, 'base64')); };
await shot('admin-01-dialog.jpg');

const type = (value) => ev(`(() => { const i = document.getElementById('admin-secret'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, ${JSON.stringify(value)}); i.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
await type('definitely-wrong');
await ev(`document.querySelector('[data-testid="admin-login"] button[type=submit]').click()`);
await until(() => ev(`Boolean(document.querySelector('[data-testid="admin-login"] [role=alert]'))`), 15000);
report.checks.wrongSecretMessage = await ev(`document.querySelector('[data-testid="admin-login"] [role=alert]').textContent`);
report.checks.dialogStillOpenAfterWrong = await ev(`Boolean(document.querySelector('[data-testid="admin-login"]'))`);
await shot('admin-02-wrong-secret.jpg');

await type(SECRET);
await ev(`document.querySelector('[data-testid="admin-login"] button[type=submit]').click()`);
report.checks.retriedMutationStatus = await until(() => ev(`window.__pending`), 20000);
report.checks.dialogClosedAfterLogin = !(await ev(`Boolean(document.querySelector('[data-testid="admin-login"]'))`));
report.checks.cookieVisibleToJs = await ev(`document.cookie.includes('kj_admin')`);
const cookies = (await send('Network.getCookies', { urls: [`http://127.0.0.1:${PORT}/api/admin/status`] })).result.cookies;
const c = cookies.find((x) => x.name === 'kj_admin');
report.checks.cookieFlags = c ? { httpOnly: c.httpOnly, sameSite: c.sameSite, path: c.path, secure: c.secure } : null;
report.checks.statusAfterLogin = await ev(`window.__m.fetchAdminStatus().then(s => ({ authenticated: s.authenticated, hasCsrf: !!s.csrf }))`);
report.checks.mutationWithoutCsrfRefused = await ev(`fetch('/api/canon-drive/clear', { method: 'POST', credentials: 'same-origin' }).then(r => r.status)`);
report.checks.secretNotInBrowserStorage = await ev(`!JSON.stringify([localStorage, sessionStorage, document.documentElement.outerHTML]).includes(${JSON.stringify(SECRET)})`);
const bundleText = await (await fetch(`http://127.0.0.1:${PORT}/src/services/adminSession.ts`)).text();
const appText = await (await fetch(`http://127.0.0.1:${PORT}/src/App.tsx`)).text();
report.checks.secretNotInServedClientCode = !bundleText.includes(SECRET) && !appText.includes(SECRET) && !/KAIJAX_ADMIN_TOKEN/.test(bundleText + appText);
await ev(`window.__m.adminLogout().then(() => true)`);
report.checks.afterLogoutRefused = await ev(`fetch('/api/canon-drive/clear', { method: 'POST', credentials: 'same-origin' }).then(r => r.status)`);

const c1 = report.checks;
report.pass = c1.status.mode === 'token' && c1.unauthenticatedMutationRefused.status === 401 && c1.dialogShown && c1.dialogFocusedInput && c1.dialogStillOpenAfterWrong && c1.retriedMutationStatus === 200 && c1.dialogClosedAfterLogin && c1.cookieVisibleToJs === false && c1.cookieFlags?.httpOnly === true && c1.cookieFlags?.sameSite === 'Strict' && c1.mutationWithoutCsrfRefused === 403 && c1.secretNotInBrowserStorage && c1.secretNotInServedClientCode && c1.afterLogoutRefused === 401;
fs.writeFileSync(path.join(OUT, 'admin-ui-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
cleanup();
process.exit(report.pass ? 0 : 1);
