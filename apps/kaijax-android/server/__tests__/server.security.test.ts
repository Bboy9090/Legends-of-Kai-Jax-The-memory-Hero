import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import type { Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { buildApp, type ServerConfig } from '../app.js';
import {
  escapeDriveQueryLiteral,
  isValidDriveId,
  isValidVaultAssetId,
  localUrlToVaultPath,
  pickApproved,
  resolveInside,
  sanitizeFileName,
} from '../security.js';

/* ---------------- harness ---------------- */

interface Harness {
  base: string;
  root: string;
  outside: string;
  close: () => Promise<void>;
}

const open: Harness[] = [];

async function start(overrides: Partial<ServerConfig> = {}): Promise<Harness> {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-sec-'));
  const root = path.join(parent, 'app');
  fs.mkdirSync(path.join(root, 'public', 'canon-drive'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public', 'models', 'characters'), { recursive: true });
  const outside = path.join(parent, 'outside-secret.txt');
  fs.writeFileSync(outside, 'do-not-touch');
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
  const h: Harness = {
    base: `http://127.0.0.1:${addr.port}`,
    root,
    outside,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
  open.push(h);
  return h;
}

afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

function isDriveHost(input: unknown): boolean {
  try {
    return new URL(String(input)).hostname === 'www.googleapis.com';
  } catch {
    return false;
  }
}

const TOKEN = 'unit-test-admin-token';
const adminHeaders = { 'x-kaijax-admin-token': TOKEN, 'content-type': 'application/json' };
const GOOGLE_HEADERS = { authorization: 'Bearer ya29.fake-google-token', 'content-type': 'application/json' };

function writeManifest(h: Harness, assets: unknown[]) {
  fs.writeFileSync(
    path.join(h.root, 'public', 'canon-drive', 'manifest.json'),
    JSON.stringify({ updatedAt: '', sourceAccount: 'test', assets })
  );
}

/* ---------------- pure helpers ---------------- */

describe('escapeDriveQueryLiteral', () => {
  it('escapes apostrophes', () => assert.equal(escapeDriveQueryLiteral("kai's"), "kai\\'s"));
  it('escapes backslashes', () => assert.equal(escapeDriveQueryLiteral('a\\b'), 'a\\\\b'));
  it('escapes backslash before quote in the right order', () =>
    assert.equal(escapeDriveQueryLiteral("\\'"), "\\\\\\'"));
  it('cannot be tricked into closing the literal with a trailing backslash', () => {
    const escaped = escapeDriveQueryLiteral('trail\\');
    assert.equal(escaped, 'trail\\\\');
    // An even number of trailing backslashes means the closing quote stays a real delimiter.
    assert.equal(/(\\+)$/.exec(escaped)![1].length % 2, 0);
  });
  it('leaves ordinary searches untouched', () => assert.equal(escapeDriveQueryLiteral('Kai Jax sheet 02'), 'Kai Jax sheet 02'));
});

describe('identifier validation', () => {
  it('accepts real Drive ids and root', () => {
    assert.ok(isValidDriveId('1AbC_dEf-123'));
    assert.ok(isValidDriveId('root'));
  });
  it('rejects traversal, quotes, spaces and empty ids', () => {
    for (const bad of ['', '../etc', "a'b", 'a b', 'a/b', 'a\\b', 'x'.repeat(200), '%2e%2e', null, 5]) {
      assert.equal(isValidDriveId(bad as unknown), false, String(bad));
    }
  });
  it('accepts synthetic zip ids but rejects ones that climb out', () => {
    assert.ok(isValidVaultAssetId('1abcDEF::sheet/kai front.png'));
    assert.equal(isValidVaultAssetId('1abc::../../x.png'), false);
    assert.equal(isValidVaultAssetId('../x'), false);
  });
  it('pickApproved only returns allow-list members', () => {
    const allowed = ['kai', 'jax'] as const;
    assert.equal(pickApproved(allowed, ' KAI '), 'kai');
    assert.equal(pickApproved(allowed, 'kai/../../x'), null);
    assert.equal(pickApproved(allowed, 'bovar'), null);
    assert.equal(pickApproved(allowed, 7), null);
  });
  it('sanitizeFileName strips separators and leading dots', () => {
    assert.equal(sanitizeFileName('../../etc/passwd'), 'etc_passwd');
    assert.equal(sanitizeFileName('.hidden'), 'hidden');
    assert.equal(sanitizeFileName('///'), 'asset');
  });
});

describe('resolveInside', () => {
  it('allows files inside and blocks lexical traversal', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-ri-'));
    assert.ok(resolveInside(root, 'a', 'b.png'));
    assert.equal(resolveInside(root, '..', 'x'), null);
    assert.equal(resolveInside(root, 'a/../../x'), null);
    assert.equal(resolveInside(root, '/etc/passwd'), null);
  });
  it('blocks symlink escapes', () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-ri-'));
    const root = path.join(parent, 'vault');
    fs.mkdirSync(root);
    fs.mkdirSync(path.join(parent, 'elsewhere'));
    fs.symlinkSync(path.join(parent, 'elsewhere'), path.join(root, 'link'));
    assert.equal(resolveInside(root, 'link', 'new.png'), null);
    assert.equal(resolveInside(root, 'link'), null);
  });
  it('localUrlToVaultPath rejects foreign prefixes, backslashes and traversal', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-ri-'));
    assert.ok(localUrlToVaultPath(root, '/canon-drive/characters/a.png'));
    assert.equal(localUrlToVaultPath(root, '/assets/aistudio/a.png'), null);
    assert.equal(localUrlToVaultPath(root, '/canon-drive/../../etc/passwd'), null);
    assert.equal(localUrlToVaultPath(root, '/canon-drive/a\\..\\b'), null);
    assert.equal(localUrlToVaultPath(root, 42), null);
  });
});

/* ---------------- authentication / authorization ---------------- */

describe('authentication', () => {
  it('rejects protected routes without the admin token', async () => {
    const h = await start({ adminToken: TOKEN });
    for (const [method, url] of [
      ['POST', '/api/canon-drive/clear'],
      ['POST', '/api/canon-drive/import'],
      ['PATCH', '/api/canon-drive/asset/abc'],
      ['DELETE', '/api/canon-drive/asset/abc'],
      ['POST', '/api/character-pipeline/import-glb'],
      ['POST', '/api/character-pipeline/meshy/reconstruct'],
    ] as const) {
      const res = await fetch(h.base + url, { method, headers: { 'content-type': 'application/json' }, body: method === 'DELETE' ? undefined : '{}' });
      assert.equal(res.status, 401, `${method} ${url}`);
    }
  });

  it('rejects a wrong token and accepts the right one', async () => {
    const h = await start({ adminToken: TOKEN });
    const bad = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers: { 'x-kaijax-admin-token': 'nope' } });
    assert.equal(bad.status, 401);
    const good = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers: { 'x-kaijax-admin-token': TOKEN } });
    assert.equal(good.status, 200);
  });

  it('disables protected routes in production when no token is configured', async () => {
    const h = await start({ production: true });
    const res = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST' });
    assert.equal(res.status, 503);
  });

  it('keeps local development working: direct loopback request needs no token', async () => {
    const h = await start();
    const res = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST' });
    assert.equal(res.status, 200);
  });

  it('refuses proxied (forwarded) requests when no token is configured', async () => {
    const h = await start();
    const res = await fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers: { 'x-forwarded-for': '203.0.113.9' } });
    assert.equal(res.status, 403);
  });

  it('read-only status stays public', async () => {
    const h = await start({ adminToken: TOKEN });
    assert.equal((await fetch(h.base + '/api/canon-drive/status')).status, 200);
    assert.equal((await fetch(h.base + '/api/character-pipeline/status')).status, 200);
  });
});

/* ---------------- paths and identifiers ---------------- */

describe('path and identifier hardening', () => {
  it('rejects traversal-shaped asset ids on PATCH and DELETE', async () => {
    const h = await start({ adminToken: TOKEN });
    for (const id of ['..%2F..%2Foutside-secret.txt', '%2e%2e%2fetc', 'a%27b', 'a%5Cb']) {
      const p = await fetch(`${h.base}/api/canon-drive/asset/${id}`, { method: 'PATCH', headers: adminHeaders, body: '{"subjectTag":"x"}' });
      assert.equal(p.status, 400, `PATCH ${id}`);
      const d = await fetch(`${h.base}/api/canon-drive/asset/${id}`, { method: 'DELETE', headers: adminHeaders });
      assert.equal(d.status, 400, `DELETE ${id}`);
    }
    assert.equal(fs.readFileSync(h.outside, 'utf8'), 'do-not-touch');
  });

  it('never deletes files outside the vault even if the manifest was tampered with', async () => {
    const h = await start({ adminToken: TOKEN });
    writeManifest(h, [
      { driveId: 'evil1', name: 'x', mimeType: 'image/png', category: 'character', subjectTag: 'x', folderPath: '', localUrl: '/canon-drive/../../outside-secret.txt', sizeBytes: 1, importedAt: '' },
    ]);
    const res = await fetch(`${h.base}/api/canon-drive/asset/evil1`, { method: 'DELETE', headers: adminHeaders });
    assert.equal(res.status, 200);
    assert.equal(fs.readFileSync(h.outside, 'utf8'), 'do-not-touch');
  });

  it('does not follow a symlink planted inside the vault', async () => {
    const h = await start({ adminToken: TOKEN });
    const dir = path.join(h.root, 'public', 'canon-drive', 'characters');
    fs.mkdirSync(dir, { recursive: true });
    fs.symlinkSync(h.outside, path.join(dir, 'link.png'));
    writeManifest(h, [
      { driveId: 'link1', name: 'x', mimeType: 'image/png', category: 'character', subjectTag: 'x', folderPath: '', localUrl: '/canon-drive/characters/link.png', sizeBytes: 1, importedAt: '' },
    ]);
    await fetch(`${h.base}/api/canon-drive/asset/link1`, { method: 'DELETE', headers: adminHeaders });
    assert.equal(fs.readFileSync(h.outside, 'utf8'), 'do-not-touch');
  });

  it('deletes a normal vault file and removes it from the manifest', async () => {
    const h = await start({ adminToken: TOKEN });
    const dir = path.join(h.root, 'public', 'canon-drive', 'characters');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'ok.png');
    fs.writeFileSync(file, 'png');
    writeManifest(h, [
      { driveId: 'ok1', name: 'x', mimeType: 'image/png', category: 'character', subjectTag: 'x', folderPath: '', localUrl: '/canon-drive/characters/ok.png', sizeBytes: 3, importedAt: '' },
    ]);
    const res = await fetch(`${h.base}/api/canon-drive/asset/ok1`, { method: 'DELETE', headers: adminHeaders });
    assert.equal(res.status, 200);
    assert.equal(fs.existsSync(file), false);
    assert.deepEqual((await res.json()).assets, []);
  });

  it('PATCH validates category and tag, and updates when valid', async () => {
    const h = await start({ adminToken: TOKEN });
    writeManifest(h, [
      { driveId: 'p1', name: 'x', mimeType: 'image/png', category: 'character', subjectTag: 'x', folderPath: '', localUrl: '/canon-drive/characters/p.png', sizeBytes: 1, importedAt: '' },
    ]);
    const badCat = await fetch(`${h.base}/api/canon-drive/asset/p1`, { method: 'PATCH', headers: adminHeaders, body: '{"category":"../../x"}' });
    assert.equal(badCat.status, 400);
    const longTag = await fetch(`${h.base}/api/canon-drive/asset/p1`, { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ subjectTag: 'x'.repeat(500) }) });
    assert.equal(longTag.status, 400);
    const ok = await fetch(`${h.base}/api/canon-drive/asset/p1`, { method: 'PATCH', headers: adminHeaders, body: '{"category":"arena","subjectTag":"zenith"}' });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).assets[0].category, 'arena');
  });

  it('rejects bad Drive ids on import, scan and preview before any network call', async () => {
    const h = await start({ adminToken: TOKEN });
    const realFetch = globalThis.fetch;
    let driveCalls = 0;
    globalThis.fetch = (async (input: unknown, init?: unknown) => {
      if (isDriveHost(input)) {
        driveCalls += 1;
        return new Response(JSON.stringify({ user: { emailAddress: 'a@b.c' }, files: [] }), { status: 200 });
      }
      return realFetch(input as RequestInfo, init as RequestInit);
    }) as typeof fetch;
    try {
      const imp = await fetch(`${h.base}/api/canon-drive/import`, {
        method: 'POST',
        headers: { ...GOOGLE_HEADERS, 'x-kaijax-admin-token': TOKEN },
        body: JSON.stringify({ items: [{ id: "../../x' or '1'='1" }] }),
      });
      assert.equal(imp.status, 400);
      const tooMany = await fetch(`${h.base}/api/canon-drive/import`, {
        method: 'POST',
        headers: { ...GOOGLE_HEADERS, 'x-kaijax-admin-token': TOKEN },
        body: JSON.stringify({ items: Array.from({ length: 80 }, (_, i) => ({ id: `id${i}` })) }),
      });
      assert.equal(tooMany.status, 400);
      const badCat = await fetch(`${h.base}/api/canon-drive/import`, {
        method: 'POST',
        headers: { ...GOOGLE_HEADERS, 'x-kaijax-admin-token': TOKEN },
        body: JSON.stringify({ items: [{ id: 'abc', category: '../x' }] }),
      });
      assert.equal(badCat.status, 400);
      const scan = await fetch(`${h.base}/api/canon-drive/scan?folderId=${encodeURIComponent("x' or name contains 'a")}`, { headers: GOOGLE_HEADERS });
      assert.equal(scan.status, 400);
      const prev = await fetch(`${h.base}/api/canon-drive/preview/${encodeURIComponent("a'b")}`, { headers: GOOGLE_HEADERS });
      assert.equal(prev.status, 400);
      assert.equal(driveCalls <= 1, true, 'invalid ids must not reach the Drive API');
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it('rejects invalid and gated character ids on the pipeline routes', async () => {
    const h = await start({ adminToken: TOKEN });
    for (const id of ['../../etc', 'kai/../jax', 'bovar', '', 'kai\0', 'KAI; rm -rf /']) {
      const res = await fetch(`${h.base}/api/character-pipeline/import-glb`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ characterId: id, fileName: 'a.glb', base64Data: 'AAAA' }),
      });
      assert.equal(res.status, 400, JSON.stringify(id));
    }
    const wrongExt = await fetch(`${h.base}/api/character-pipeline/import-glb`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ characterId: 'kai', fileName: 'a.exe', base64Data: 'AAAA' }),
    });
    assert.equal(wrongExt.status, 400);
  });
});

/* ---------------- Drive query escaping through the real route ---------------- */

describe('Drive search escaping', () => {
  it('sends apostrophes and backslashes escaped in the q parameter', async () => {
    const h = await start();
    const realFetch = globalThis.fetch;
    const queries: string[] = [];
    globalThis.fetch = (async (input: unknown, init?: unknown) => {
      const url = String(input);
      if (isDriveHost(url)) {
        const q = new URL(url).searchParams.get('q');
        if (q) queries.push(q);
        return new Response(JSON.stringify({ user: { emailAddress: 'a@b.c' }, files: [] }), { status: 200 });
      }
      return realFetch(input as RequestInfo, init as RequestInit);
    }) as typeof fetch;
    try {
      const res = await fetch(`${h.base}/api/canon-drive/scan?q=${encodeURIComponent("kai's \\ sheet")}&imagesOnly=false`, { headers: GOOGLE_HEADERS });
      assert.equal(res.status, 200);
      assert.equal(queries.length, 1);
      assert.ok(queries[0].includes("name contains 'kai\\'s \\\\ sheet'"), queries[0]);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

/* ---------------- rate limiting ---------------- */

describe('rate limiting', () => {
  it('throttles vault mutation routes', async () => {
    const h = await start({ adminToken: TOKEN, limits: { mutate: 3, windowMs: 60_000 } });
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) {
      codes.push((await fetch(h.base + '/api/canon-drive/clear', { method: 'POST', headers: adminHeaders })).status);
    }
    assert.deepEqual(codes.slice(0, 3), [200, 200, 200]);
    assert.ok(codes.slice(3).every((c) => c === 429), codes.join(','));
  });

  it('throttles read routes', async () => {
    const h = await start({ limits: { read: 5, windowMs: 60_000 } });
    const codes: number[] = [];
    for (let i = 0; i < 8; i++) codes.push((await fetch(h.base + '/api/canon-drive/status')).status);
    assert.equal(codes.filter((c) => c === 429).length, 3);
  });

  it('applies the stricter heavy limit to reconstruction routes', async () => {
    const h = await start({ adminToken: TOKEN, limits: { heavy: 2, heavyWindowMs: 60_000 } });
    const body = JSON.stringify({ characterId: 'kai', fileName: 'a.glb', base64Data: 'AAAA' });
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) {
      codes.push((await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body })).status);
    }
    assert.deepEqual(codes, [200, 200, 429, 429]);
  });

  it('sets standard RateLimit headers', async () => {
    const h = await start({ limits: { read: 10, windowMs: 60_000 } });
    const res = await fetch(h.base + '/api/canon-drive/status');
    assert.ok(res.headers.get('ratelimit-limit') || res.headers.get('ratelimit'));
  });
});

/* ---------------- concurrency ---------------- */

describe('reconstruction concurrency', () => {
  it('runs one Blender job at a time and rejects the overlap with 429', async () => {
    let started = 0;
    let release!: () => void;
    const hold = new Promise<void>((r) => (release = r));
    const h = await start({
      adminToken: TOKEN,
      runBlender: async () => {
        started += 1;
        await hold;
      },
    });
    const body = JSON.stringify({ characterId: 'jax', fileName: 'a.glb', base64Data: 'AAAA' });
    const first = fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body });
    while (started === 0) await new Promise((r) => setTimeout(r, 10));
    const second = await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body });
    assert.equal(second.status, 429);
    assert.ok(second.headers.get('retry-after'));
    release();
    assert.equal((await first).status, 200);
    assert.equal(started, 1);
    // gate is released afterwards
    const third = await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body });
    assert.equal(third.status, 200);
  });

  it('releases the gate when Blender fails', async () => {
    let calls = 0;
    const h = await start({
      adminToken: TOKEN,
      runBlender: async () => {
        calls += 1;
        if (calls === 1) throw new Error('blender exploded');
      },
    });
    const body = JSON.stringify({ characterId: 'kai', fileName: 'a.glb', base64Data: 'AAAA' });
    const bad = await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body });
    assert.equal(bad.status, 500);
    const good = await fetch(h.base + '/api/character-pipeline/import-glb', { method: 'POST', headers: adminHeaders, body });
    assert.equal(good.status, 200);
  });
});

/* ---------------- normal authorized workflows ---------------- */

describe('authorized workflows', () => {
  it('imports a model through Blender into the meshy output directory only', async () => {
    let args: string[] = [];
    const h = await start({
      adminToken: TOKEN,
      runBlender: async (a) => {
        args = a;
      },
    });
    const res = await fetch(h.base + '/api/character-pipeline/import-glb', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ characterId: ' KaiJax ', fileName: 'sheet.GLB', base64Data: 'data:model/gltf-binary;base64,AAAA' }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.characterId, 'kaijax');
    assert.equal(json.masterGlbUrl, '/models/characters/meshy/kaijax_master.glb');
    const dashDash = args.indexOf('--');
    assert.equal(args[dashDash + 2], 'kaijax');
    const outDir = args[dashDash + 3];
    assert.equal(outDir, path.join(h.root, 'public', 'models', 'characters', 'meshy'));
  });

  it('reports 503 for Meshy reconstruction when no API key is set', async () => {
    const saved = process.env.MESHY_API_KEY;
    delete process.env.MESHY_API_KEY;
    try {
      const h = await start({ adminToken: TOKEN });
      const res = await fetch(h.base + '/api/character-pipeline/meshy/reconstruct', { method: 'POST', headers: adminHeaders, body: '{"characterId":"kai"}' });
      assert.equal(res.status, 503);
    } finally {
      if (saved !== undefined) process.env.MESHY_API_KEY = saved;
    }
  });

  it('imports a Drive zip but ignores symlinks that point outside the archive', async (t) => {
    try {
      execFileSync('zip', ['-v'], { stdio: 'ignore' });
    } catch {
      t.skip('zip not installed');
      return;
    }
    const h = await start({ adminToken: TOKEN });
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-zip-'));
    const pack = path.join(work, 'pack');
    fs.mkdirSync(path.join(pack, 'sheets'), { recursive: true });
    fs.writeFileSync(path.join(pack, 'sheets', 'kai_front.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    fs.symlinkSync(h.outside, path.join(pack, 'sheets', 'stolen.png'));
    const zipPath = path.join(work, 'art.zip');
    execFileSync('zip', ['-r', '-y', '-q', zipPath, 'sheets'], { cwd: pack });
    const zipBytes = fs.readFileSync(zipPath);

    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (input: unknown, init?: unknown) => {
      const url = String(input);
      if (!isDriveHost(url)) return realFetch(input as RequestInfo, init as RequestInit);
      if (url.includes('/about')) return new Response(JSON.stringify({ user: { emailAddress: 'a@b.c' } }), { status: 200 });
      if (url.includes('alt=media')) return new Response(zipBytes, { status: 200 });
      return new Response(JSON.stringify({ id: 'zip123456', name: 'art.zip', mimeType: 'application/zip', size: String(zipBytes.length) }), { status: 200 });
    }) as typeof fetch;
    try {
      const res = await fetch(`${h.base}/api/canon-drive/import`, {
        method: 'POST',
        headers: { ...GOOGLE_HEADERS, 'x-kaijax-admin-token': TOKEN },
        body: JSON.stringify({ items: [{ id: 'zip123456' }] }),
      });
      assert.equal(res.status, 200);
      const manifest = await res.json();
      const names = manifest.assets.map((a: { name: string }) => a.name);
      assert.deepEqual(names, ['kai_front.png']);
      assert.equal(fs.readFileSync(h.outside, 'utf8'), 'do-not-touch');
      const files = fs.readdirSync(path.join(h.root, 'public', 'canon-drive', 'characters'));
      assert.equal(files.length, 1);
      assert.ok(!files.some((f) => f.includes('stolen')));
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
