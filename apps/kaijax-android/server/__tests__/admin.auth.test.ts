import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { buildApp, type ServerConfig } from '../app.js';
import { ADMIN_COOKIE, MIN_PRODUCTION_SECRET_LENGTH } from '../admin.js';

const STRONG = 'correct-horse-battery-staple-9f3a1c';
const open: Array<() => Promise<void>> = [];

interface H {
  base: string;
  host: string;
  root: string;
  app: ReturnType<typeof buildApp>;
}

async function start(overrides: Partial<ServerConfig> = {}): Promise<H> {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-adm-'));
  const root = path.join(parent, 'app');
  fs.mkdirSync(path.join(root, 'public', 'canon-drive'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public', 'models', 'characters'), { recursive: true });
  const app = buildApp({
    appRoot: root,
    production: false,
    limits: { read: 1000, mutate: 1000, heavy: 1000 },
    runBlender: async () => {},
    ...overrides,
  });
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const addr = server.address();
  assert.ok(addr && typeof addr === 'object');
  open.push(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  );
  return { base: `http://127.0.0.1:${addr.port}`, host: `127.0.0.1:${addr.port}`, root, app };
}

afterEach(async () => {
  while (open.length) await open.pop()!();
});

async function login(h: H, secret = STRONG, extra: Record<string, string> = {}) {
  const res = await fetch(h.base + '/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...extra },
    body: JSON.stringify({ secret }),
  });
  const setCookie = res.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  const body = await res.json().catch(() => ({}));
  return { res, cookie, setCookie, body };
}

const clear = (h: H, headers: Record<string, string>) => fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers });

describe('admin login workflow', () => {
  it('logs in with the right secret and issues an HttpOnly SameSite=Strict session cookie', async () => {
    const h = await start({ adminToken: STRONG });
    const { res, setCookie, body } = await login(h);
    assert.equal(res.status, 200);
    assert.match(setCookie, new RegExp(`^${ADMIN_COOKIE}=[0-9a-f]{64}`));
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Strict/i);
    assert.match(setCookie, /Path=\/api/);
    assert.doesNotMatch(setCookie, /Secure/i, 'plain-http dev must not set Secure');
    assert.equal(typeof body.csrf, 'string');
    assert.ok(body.csrf.length >= 32);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.ok(!JSON.stringify(body).includes(STRONG), 'the secret must never be echoed');
  });

  it('marks the cookie Secure in production', async () => {
    const h = await start({ adminToken: STRONG, production: true });
    const { setCookie } = await login(h);
    assert.match(setCookie, /Secure/i);
  });

  it('rejects wrong, empty and oversized secrets without revealing anything', async () => {
    const h = await start({ adminToken: STRONG });
    for (const bad of ['', 'nope', STRONG + 'x', 'x'.repeat(600)]) {
      const { res, setCookie, body } = await login(h, bad);
      assert.equal(res.status, 401, JSON.stringify(bad.slice(0, 10)));
      assert.equal(setCookie, '');
      assert.equal(body.code, 'admin_bad_credentials');
    }
    const nonString = await fetch(h.base + '/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: { $ne: 'x' } }),
    });
    assert.equal(nonString.status, 401);
  });

  it('throttles repeated failed logins but not successful ones', async () => {
    const h = await start({ adminToken: STRONG, adminTuning: { loginLimit: 3, loginWindowMs: 60_000 } });
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await login(h, 'wrong-' + i)).res.status);
    assert.deepEqual(codes, [401, 401, 401, 429, 429]);
    // Even the right secret is refused while throttled: the window is per client, not per secret.
    assert.equal((await login(h)).res.status, 429);
  });

  it('does not throttle a stream of successful logins', async () => {
    const h = await start({ adminToken: STRONG, adminTuning: { loginLimit: 2, loginWindowMs: 60_000 } });
    for (let i = 0; i < 4; i++) assert.equal((await login(h)).res.status, 200);
  });

  it('refuses a cross-origin login attempt', async () => {
    const h = await start({ adminToken: STRONG });
    const { res } = await login(h, STRONG, { origin: 'https://evil.example' });
    assert.equal(res.status, 403);
  });

  it('is unavailable when no secret is configured', async () => {
    const dev = await start();
    assert.equal((await login(dev)).res.status, 400);
    const prod = await start({ production: true });
    assert.equal((await login(prod)).res.status, 503);
  });

  it('refuses to enable admin in production with a weak secret', async () => {
    const h = await start({ adminToken: 'short-secret', production: true });
    assert.equal(h.app.admin.mode, 'disabled');
    assert.equal((await login(h, 'short-secret')).res.status, 503);
    const res = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers: { 'x-kaijax-admin-token': 'short-secret' } });
    assert.equal(res.status, 503);
    assert.ok('x'.repeat(MIN_PRODUCTION_SECRET_LENGTH).length === MIN_PRODUCTION_SECRET_LENGTH);
  });
});

describe('session-authorized admin routes', () => {
  it('rejects mutation without a session', async () => {
    const h = await start({ adminToken: STRONG });
    assert.equal((await clear(h, {})).status, 401);
  });

  it('allows mutation with session cookie + CSRF token', async () => {
    const h = await start({ adminToken: STRONG });
    const { cookie, body } = await login(h);
    const res = await clear(h, { cookie, 'x-kaijax-csrf': body.csrf });
    assert.equal(res.status, 200);
  });

  it('rejects a valid session when the CSRF token is missing or wrong', async () => {
    const h = await start({ adminToken: STRONG });
    const { cookie } = await login(h);
    assert.equal((await clear(h, { cookie })).status, 403);
    assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': 'f'.repeat(48) })).status, 403);
  });

  it('rejects a session-authorized mutation whose Origin is foreign', async () => {
    const h = await start({ adminToken: STRONG });
    const { cookie, body } = await login(h);
    const res = await clear(h, { cookie, 'x-kaijax-csrf': body.csrf, origin: 'https://evil.example' });
    assert.equal(res.status, 403);
    const same = await clear(h, { cookie, 'x-kaijax-csrf': body.csrf, origin: `http://${h.host}` });
    assert.equal(same.status, 200);
  });

  it('rejects forged or tampered session cookies', async () => {
    const h = await start({ adminToken: STRONG });
    const { body } = await login(h);
    for (const cookie of [`${ADMIN_COOKIE}=${'0'.repeat(64)}`, `${ADMIN_COOKIE}=`, `${ADMIN_COOKIE}=../../etc`, `other=1`]) {
      assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 401, cookie);
    }
  });

  it('expires idle sessions', async () => {
    let t = 1_000_000;
    const h = await start({ adminToken: STRONG, adminTuning: { now: () => t, idleTtlMs: 60_000, absoluteTtlMs: 600_000 } });
    const { cookie, body } = await login(h);
    t += 30_000;
    assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 200, 'activity keeps it alive');
    t += 61_000;
    assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 401);
  });

  it('enforces an absolute session lifetime even with constant activity', async () => {
    let t = 5_000_000;
    const h = await start({ adminToken: STRONG, adminTuning: { now: () => t, idleTtlMs: 60_000, absoluteTtlMs: 150_000 } });
    const { cookie, body } = await login(h);
    for (let i = 0; i < 2; i++) {
      t += 50_000;
      assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 200);
    }
    t += 51_000;
    assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 401);
  });

  it('logout invalidates the session and requires the CSRF token', async () => {
    const h = await start({ adminToken: STRONG });
    const { cookie, body } = await login(h);
    const noCsrf = await fetch(h.base + '/api/admin/logout', { method: 'POST', headers: { cookie } });
    assert.equal(noCsrf.status, 403);
    const out = await fetch(h.base + '/api/admin/logout', { method: 'POST', headers: { cookie, 'x-kaijax-csrf': body.csrf } });
    assert.equal(out.status, 200);
    assert.match(out.headers.get('set-cookie') || '', /Max-Age=0/);
    assert.equal((await clear(h, { cookie, 'x-kaijax-csrf': body.csrf })).status, 401);
  });

  it('caps concurrent sessions by evicting the least recently used', async () => {
    const h = await start({ adminToken: STRONG, adminTuning: { maxSessions: 2 } });
    const a = await login(h);
    const b = await login(h);
    const c = await login(h);
    assert.equal(h.app.admin.sessionCount(), 2);
    assert.equal((await clear(h, { cookie: a.cookie, 'x-kaijax-csrf': a.body.csrf })).status, 401);
    assert.equal((await clear(h, { cookie: b.cookie, 'x-kaijax-csrf': b.body.csrf })).status, 200);
    assert.equal((await clear(h, { cookie: c.cookie, 'x-kaijax-csrf': c.body.csrf })).status, 200);
  });

  it('still honors the CLI header token and refuses a wrong one', async () => {
    const h = await start({ adminToken: STRONG });
    assert.equal((await clear(h, { 'x-kaijax-admin-token': STRONG })).status, 200);
    assert.equal((await clear(h, { 'x-kaijax-admin-token': STRONG + '!' })).status, 401);
  });

  it('works for character reconstruction routes too, and gates them the same way', async () => {
    const h = await start({ adminToken: STRONG });
    const body = JSON.stringify({ characterId: 'kai', fileName: 'a.glb', base64Data: 'AAAA' });
    const headers = { 'content-type': 'application/json' };
    assert.equal((await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers, body })).status, 401);
    const { cookie, body: login1 } = await login(h);
    const ok = await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: { ...headers, cookie, 'x-kaijax-csrf': login1.csrf }, body });
    assert.equal(ok.status, 200);
  });
});

describe('status endpoint', () => {
  it('reveals the CSRF token only to the cookie holder', async () => {
    const h = await start({ adminToken: STRONG });
    const anon = await (await fetch(h.base + '/api/admin/status')).json();
    assert.equal(anon.authenticated, false);
    assert.equal(anon.csrf, undefined);
    assert.equal(anon.mode, 'token');
    const { cookie, body } = await login(h);
    const authed = await (await fetch(h.base + '/api/admin/status', { headers: { cookie } })).json();
    assert.equal(authed.authenticated, true);
    assert.equal(authed.csrf, body.csrf);
  });

  it('reports disabled / dev modes honestly', async () => {
    const prod = await start({ production: true });
    assert.deepEqual(
      (({ mode, enabled, authenticated }) => ({ mode, enabled, authenticated }))(await (await fetch(prod.base + '/api/admin/status')).json()),
      { mode: 'disabled', enabled: false, authenticated: false },
    );
    const dev = await start();
    const s = await (await fetch(dev.base + '/api/admin/status')).json();
    assert.equal(s.mode, 'dev-loopback');
    assert.equal(s.authenticated, true);
  });
});

describe('audit trail', () => {
  it('records logins, denials and allowed actions without secrets', async () => {
    const auditLogPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-audit-')), 'logs', 'admin-audit.log');
    const h = await start({ adminToken: STRONG, auditLogPath });
    await login(h, 'wrong-guess-123');
    const ok = await login(h);
    await clear(h, {});
    await clear(h, { cookie: ok.cookie, 'x-kaijax-csrf': ok.body.csrf });
    const events = h.app.admin.auditTrail().map((e) => e.event);
    assert.deepEqual(events, ['login-failed', 'login-ok', 'denied-unauthenticated', 'allowed']);
    const file = fs.readFileSync(auditLogPath, 'utf8');
    assert.equal(file.trim().split('\n').length, 4);
    assert.ok(!file.includes(STRONG) && !file.includes('wrong-guess-123') && !file.includes(ok.cookie.split('=')[1]) && !file.includes(ok.body.csrf));
    if (process.platform !== 'win32') assert.equal(fs.statSync(auditLogPath).mode & 0o077, 0, 'audit file is owner-only');
  });
});

describe('secret never reaches client artifacts', () => {
  const appRoot = path.resolve(import.meta.dirname, '..', '..');
  const walk = (dir: string, out: string[] = []): string[] => {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (e.isFile() && /\.(ts|tsx|js|mjs|html|json|css|map)$/.test(e.name)) out.push(full);
    }
    return out;
  };

  it('client source and build config never reference the admin token variable', () => {
    const files = [...walk(path.join(appRoot, 'src')), path.join(appRoot, 'vite.config.ts'), path.join(appRoot, 'capacitor.config.ts')].filter((f) => fs.existsSync(f));
    assert.ok(files.length > 20);
    const offenders = files.filter((f) => /KAIJAX_ADMIN_TOKEN/.test(fs.readFileSync(f, 'utf8')));
    assert.deepEqual(offenders, []);
  });

  it('built web bundle and Android assets (when present) contain no admin secret variable', (t) => {
    const roots = [path.join(appRoot, 'dist'), path.join(appRoot, 'android', 'app', 'src', 'main', 'assets', 'public')].filter((d) => fs.existsSync(d));
    if (!roots.length) {
      t.skip('no build output present');
      return;
    }
    for (const r of roots) {
      for (const f of walk(r)) {
        const text = fs.readFileSync(f, 'utf8');
        assert.ok(!/KAIJAX_ADMIN_TOKEN/.test(text), `${path.relative(appRoot, f)} references the admin token variable`);
        assert.ok(!text.includes(STRONG), `${path.relative(appRoot, f)} contains a test secret`);
      }
    }
  });
});
