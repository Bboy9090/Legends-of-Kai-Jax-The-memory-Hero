import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';

/**
 * Escape a value for use inside a single-quoted Google Drive `q` string literal.
 * Backslashes MUST be escaped first, otherwise an input ending in `\` would escape
 * the closing quote added by the caller (and `\'` typed by a user would be
 * turned into `\\'` which terminates the literal early).
 */
export function escapeDriveQueryLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Google Drive file/folder ids are url-safe base64-ish tokens. `root` is the My Drive alias. */
const DRIVE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
export function isValidDriveId(value: unknown): value is string {
  return typeof value === 'string' && DRIVE_ID_RE.test(value);
}

/** Synthetic ids created for zip entries look like `<driveId>::<relative/path/file.png>`. */
const SYNTHETIC_ID_RE = /^[A-Za-z0-9_-]{1,128}(::[^\0\\]{1,400})?$/;
export function isValidVaultAssetId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    SYNTHETIC_ID_RE.test(value) &&
    !value.split('::').some((p) => p.split('/').includes('..'))
  );
}

/** Return the matching element of the allow-list (never the caller's string). */
export function pickApproved<T extends string>(allowed: readonly T[], raw: unknown): T | null {
  if (typeof raw !== 'string') return null;
  const needle = raw.toLowerCase().trim();
  return allowed.find((candidate) => candidate === needle) ?? null;
}

export function sanitizeFileName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^[._]+/, '').replace(/_+$/, '').slice(0, 96) || 'asset';
}

/** True when `candidate` is `root` itself or lives underneath it (lexically). */
export function isInside(root: string, candidate: string): boolean {
  const r = path.resolve(root);
  const c = path.resolve(candidate);
  return c === r || c.startsWith(r + path.sep);
}

/**
 * Resolve `segments` under `root` and prove the result (after following symlinks on the
 * deepest existing ancestor) is still inside `root`. Returns null on any escape.
 */
export function resolveInside(root: string, ...segments: string[]): string | null {
  const resolved = path.resolve(root, ...segments);
  if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.resolve(root)) {
    return null;
  }
  let probe = resolved;
  while (!fs.existsSync(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) return null;
    probe = parent;
  }
  let realRoot: string;
  let realProbe: string;
  try {
    realRoot = fs.realpathSync(root);
    realProbe = fs.realpathSync(probe);
  } catch {
    return null;
  }
  if (realProbe !== realRoot && !realProbe.startsWith(realRoot + path.sep)) return null;
  return resolved;
}

/** Map a `/canon-drive/...` manifest url to a file inside the vault, or null. */
export function localUrlToVaultPath(vaultRoot: string, localUrl: unknown): string | null {
  if (typeof localUrl !== 'string' || !localUrl.startsWith('/canon-drive/')) return null;
  const rel = localUrl.slice('/canon-drive/'.length);
  if (!rel || rel.includes('\0') || rel.includes('\\')) return null;
  return resolveInside(vaultRoot, rel);
}

/** Regular file, not a symlink. */
export function isPlainFile(p: string): boolean {
  try {
    return fs.lstatSync(p).isFile();
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export interface AuthOptions {
  /** Shared secret expected in the `x-kaijax-admin-token` header. */
  adminToken?: string;
  /** When true (production) a missing token disables protected routes instead of allowing loopback. */
  production: boolean;
}

function safeEqual(a: string, b: string): boolean {
  const ab = crypto.createHash('sha256').update(a).digest();
  const bb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ab, bb);
}

function isLoopbackRequest(req: Request): boolean {
  if (req.headers['x-forwarded-for'] || req.headers['forwarded']) return false; // came through a proxy
  const addr = req.socket.remoteAddress || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

/**
 * Guards routes that mutate the local vault or run local tooling (Blender, unzip, Meshy).
 *  - With KAIJAX_ADMIN_TOKEN set: the header token is required everywhere.
 *  - Without a token, development (NODE_ENV !== production): only direct loopback requests are allowed,
 *    which keeps `npm run dev` working with zero setup.
 *  - Without a token in production: the routes are disabled (503).
 */
export function requireLocalAdmin(options: AuthOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const expected = options.adminToken?.trim();
    if (expected) {
      const provided = req.header('x-kaijax-admin-token') || '';
      if (provided && safeEqual(provided, expected)) {
        next();
        return;
      }
      res.status(401).json({ error: 'Admin token required for this route.' });
      return;
    }
    if (options.production) {
      res.status(503).json({ error: 'This route is disabled: set KAIJAX_ADMIN_TOKEN to enable it in production.' });
      return;
    }
    if (isLoopbackRequest(req)) {
      next();
      return;
    }
    res.status(403).json({ error: 'This route only accepts local requests unless KAIJAX_ADMIN_TOKEN is configured.' });
  };
}

/* ------------------------------------------------------------------ */
/* Concurrency                                                         */
/* ------------------------------------------------------------------ */

/** Allows at most `limit` simultaneous holders; extra callers are rejected, not queued. */
export class ConcurrencyGate {
  private active = 0;
  constructor(private readonly limit: number) {}
  tryEnter(): (() => void) | null {
    if (this.active >= this.limit) return null;
    this.active += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active -= 1;
    };
  }
  get inFlight(): number {
    return this.active;
  }
}

export function gateMiddleware(gate: ConcurrencyGate, message: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const release = gate.tryEnter();
    if (!release) {
      res.setHeader('Retry-After', '30');
      res.status(429).json({ error: message });
      return;
    }
    res.on('close', release);
    res.on('finish', release);
    next();
  };
}
