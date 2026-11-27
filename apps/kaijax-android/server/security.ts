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
