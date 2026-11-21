import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response, Router } from 'express';
import express from 'express';
import { rateLimit } from 'express-rate-limit';

/**
 * Administrative access for the local vault / Blender / Meshy routes.
 *
 * Threat model: the web bundle and the Android APK are public artifacts, so no secret may ever be compiled in.
 * The operator secret (KAIJAX_ADMIN_TOKEN) lives only in the server environment. An operator proves knowledge of it
 * at runtime (`POST /api/admin/login`) and receives a short-lived server-side session carried by an HttpOnly,
 * SameSite=Strict cookie plus a CSRF token that must be echoed on every mutating request. CLI tooling may still send
 * the secret in the `x-kaijax-admin-token` header. In production without a strong secret the routes stay disabled.
 */

export const ADMIN_COOKIE = 'kj_admin';
export const MIN_PRODUCTION_SECRET_LENGTH = 24;

export interface AdminOptions {
  adminToken?: string;
  production: boolean;
  /** Where to append audit lines (JSON per line). Skipped when undefined. */
  auditLogPath?: string;
  idleTtlMs?: number;
  absoluteTtlMs?: number;
  maxSessions?: number;
  now?: () => number;
  loginLimit?: number;
  loginWindowMs?: number;
}

interface Session {
  csrf: string;
  createdAt: number;
  lastSeen: number;
}

export type AdminMode = 'token' | 'dev-loopback' | 'disabled';

function sha256(value: string): Buffer {
  return crypto.createHash('sha256').update(value).digest();
}

export function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256(a), sha256(b));
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key && !(key in out)) out[key] = decodeURIComponent(value);
  }
  return out;
}

function isLoopback(req: Request): boolean {
  if (req.headers['x-forwarded-for'] || req.headers['forwarded']) return false;
  const addr = req.socket.remoteAddress || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

export function createAdmin(options: AdminOptions) {
  const now = options.now ?? (() => Date.now());
  const idleTtl = options.idleTtlMs ?? 15 * 60_000;
  const absoluteTtl = options.absoluteTtlMs ?? 2 * 60 * 60_000;
  const maxSessions = options.maxSessions ?? 5;
  const secret = options.adminToken?.trim() || '';
  const sessions = new Map<string, Session>();
  const audit: Array<Record<string, unknown>> = [];

  const secretUsable = secret.length > 0 && (!options.production || secret.length >= MIN_PRODUCTION_SECRET_LENGTH);

  const mode: AdminMode = secretUsable ? 'token' : options.production ? 'disabled' : 'dev-loopback';

  function record(event: string, req: Request, extra: Record<string, unknown> = {}) {
    const line = {
      at: new Date(now()).toISOString(),
      event,
      method: req.method,
      path: req.path,
      // Coarse client identity only: never log secrets, cookies or request bodies.
      client: (req.socket.remoteAddress || 'unknown').replace(/\d+$/, 'x'),
      ...extra,
    };
    audit.push(line);
    if (audit.length > 500) audit.shift();
    if (options.auditLogPath) {
      try {
        fs.mkdirSync(path.dirname(options.auditLogPath), { recursive: true });
        fs.appendFileSync(options.auditLogPath, JSON.stringify(line) + '\n', { mode: 0o600 });
      } catch {
        // auditing must never take the server down
      }
    }
  }

  function purge() {
    const t = now();
    for (const [sid, s] of sessions) {
      if (t - s.lastSeen > idleTtl || t - s.createdAt > absoluteTtl) sessions.delete(sid);
    }
  }

  function sessionFor(req: Request): { sid: string; session: Session } | null {
    purge();
    const sid = parseCookies(req.headers.cookie)[ADMIN_COOKIE];
    if (!sid) return null;
    const session = sessions.get(sid);
    if (!session) return null;
    session.lastSeen = now();
    return { sid, session };
  }

  function sameOrigin(req: Request): boolean {
    const origin = req.headers.origin;
    if (!origin) return true; // non-browser clients and same-origin GETs do not send Origin
    try {
      return new URL(origin).host === req.headers.host;
    } catch {
      return false;
    }
  }

  function cookieFlags(maxAgeMs: number): string {
    return `; Path=/api; HttpOnly; SameSite=Strict${options.production ? '; Secure' : ''}; Max-Age=${Math.floor(maxAgeMs / 1000)}`;
  }

  /** Guards routes that mutate the vault or run local tooling. */
  function guard(req: Request, res: Response, next: NextFunction) {
    if (mode === 'disabled') {
      record('denied-disabled', req);
      res.status(503).json({
        error: secret
          ? `Admin routes are disabled: KAIJAX_ADMIN_TOKEN must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production.`
          : 'Admin routes are disabled in production until KAIJAX_ADMIN_TOKEN is configured.',
        code: 'admin_disabled',
      });
      return;
    }
    if (mode === 'dev-loopback') {
      if (isLoopback(req)) {
        next();
        return;
      }
      record('denied-nonlocal', req);
      res.status(403).json({ error: 'Admin routes only accept direct local requests unless KAIJAX_ADMIN_TOKEN is set.', code: 'admin_local_only' });
      return;
    }
    // token mode: CLI header, or session cookie + CSRF + same-origin.
    const header = req.header('x-kaijax-admin-token');
    if (header && safeEqual(header, secret)) {
      next();
      return;
    }
    const found = sessionFor(req);
    if (found) {
      const mutating = req.method !== 'GET' && req.method !== 'HEAD';
      if (!sameOrigin(req)) {
        record('denied-origin', req);
        res.status(403).json({ error: 'Cross-origin admin request refused.', code: 'admin_origin' });
        return;
      }
      if (mutating) {
        const csrf = req.header('x-kaijax-csrf') || '';
        if (!csrf || !safeEqual(csrf, found.session.csrf)) {
          record('denied-csrf', req);
          res.status(403).json({ error: 'Missing or invalid CSRF token.', code: 'admin_csrf' });
          return;
        }
      }
      record('allowed', req, { via: 'session' });
      next();
      return;
    }
    record('denied-unauthenticated', req);
    res.status(401).json({ error: 'Admin authentication required.', code: 'admin_auth_required' });
  }

  const loginLimiter = rateLimit({
    windowMs: options.loginWindowMs ?? 15 * 60_000,
    limit: options.loginLimit ?? 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    // Count only failures so a legitimate operator is not locked out by successful logins.
    skipSuccessfulRequests: true,
    message: { error: 'Too many failed admin login attempts. Try again later.', code: 'admin_login_throttled' },
  });
  const statusLimiter = rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });

  const router: Router = express.Router();
  const json = express.json({ limit: '4kb' });

  router.get('/status', statusLimiter, (req, res) => {
    const found = sessionFor(req);
    res.json({
      mode,
      enabled: mode !== 'disabled',
      authenticated: mode === 'dev-loopback' ? isLoopback(req) : Boolean(found),
      // The CSRF token is only revealed to a holder of the session cookie.
      csrf: found ? found.session.csrf : undefined,
      idleTimeoutSeconds: Math.floor(idleTtl / 1000),
    });
  });

  router.post('/login', loginLimiter, json, async (req, res) => {
    if (mode !== 'token') {
      record('login-unavailable', req);
      res.status(mode === 'disabled' ? 503 : 400).json({
        error: mode === 'disabled' ? 'Admin login is disabled until a strong KAIJAX_ADMIN_TOKEN is configured.' : 'Admin login is not required in local development.',
        code: mode === 'disabled' ? 'admin_disabled' : 'admin_login_not_needed',
      });
      return;
    }
    if (!sameOrigin(req)) {
      record('login-origin', req);
      res.status(403).json({ error: 'Cross-origin admin login refused.', code: 'admin_origin' });
      return;
    }
    const supplied = typeof req.body?.secret === 'string' ? req.body.secret : '';
    if (!supplied || supplied.length > 512 || !safeEqual(supplied, secret)) {
      record('login-failed', req);
      await new Promise((r) => setTimeout(r, 250)); // blunt online guessing without blocking the loop
      res.status(401).json({ error: 'Invalid admin credentials.', code: 'admin_bad_credentials' });
      return;
    }
    purge();
    while (sessions.size >= maxSessions) {
      const oldest = [...sessions.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
      sessions.delete(oldest[0]);
    }
    const sid = crypto.randomBytes(32).toString('hex');
    const csrf = crypto.randomBytes(24).toString('hex');
    sessions.set(sid, { csrf, createdAt: now(), lastSeen: now() });
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${sid}${cookieFlags(idleTtl)}`);
    res.setHeader('Cache-Control', 'no-store');
    record('login-ok', req);
    res.json({ authenticated: true, csrf, idleTimeoutSeconds: Math.floor(idleTtl / 1000) });
  });

  router.post('/logout', statusLimiter, (req, res) => {
    const found = sessionFor(req);
    if (found) {
      const csrf = req.header('x-kaijax-csrf') || '';
      if (!csrf || !safeEqual(csrf, found.session.csrf) || !sameOrigin(req)) {
        res.status(403).json({ error: 'Missing or invalid CSRF token.', code: 'admin_csrf' });
        return;
      }
      sessions.delete(found.sid);
      record('logout', req);
    }
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/api; HttpOnly; SameSite=Strict${options.production ? '; Secure' : ''}; Max-Age=0`);
    res.json({ authenticated: false });
  });

  return {
    mode,
    guard,
    router,
    auditTrail: () => audit.slice(),
    sessionCount: () => sessions.size,
  };
}
