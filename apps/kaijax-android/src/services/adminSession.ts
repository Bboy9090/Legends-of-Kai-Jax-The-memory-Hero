/**
 * Client side of the administrative workflow (see server/admin.ts).
 *
 * The operator secret is typed into AdminLoginDialog at runtime and sent once to POST /api/admin/login.
 * It is never stored, never compiled into the bundle and never read from the environment here. What the
 * client keeps is only the CSRF token (in memory); the session itself is an HttpOnly cookie the page cannot read.
 */

export interface AdminStatus {
  mode: 'token' | 'dev-loopback' | 'disabled';
  enabled: boolean;
  authenticated: boolean;
  csrf?: string;
  idleTimeoutSeconds?: number;
}

let csrfToken: string | null = null;
let promptHandler: (() => Promise<boolean>) | null = null;
let pendingPrompt: Promise<boolean> | null = null;

export function registerAdminPrompt(handler: (() => Promise<boolean>) | null): void {
  promptHandler = handler;
}

export async function fetchAdminStatus(): Promise<AdminStatus | null> {
  try {
    const res = await fetch('/api/admin/status', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const status = (await res.json()) as AdminStatus;
    if (status.csrf) csrfToken = status.csrf;
    return status;
  } catch {
    return null; // static / offline build: no server
  }
}

export async function adminLogin(secret: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        res.status === 429
          ? 'Too many failed attempts. Wait a few minutes and try again.'
          : res.status === 503
            ? 'Admin tools are disabled on this server.'
            : body.error || 'Login failed.';
      return { ok: false, error: message };
    }
    csrfToken = typeof body.csrf === 'string' ? body.csrf : null;
    return { ok: true };
  } catch {
    return { ok: false, error: 'The admin server is unreachable.' };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: csrfToken ? { 'x-kaijax-csrf': csrfToken } : {},
    });
  } finally {
    csrfToken = null;
  }
}

async function errorCode(res: Response): Promise<string | null> {
  try {
    const body = await res.clone().json();
    return typeof body?.code === 'string' ? body.code : null;
  } catch {
    return null;
  }
}

/** True when the server refused the call for admin reasons (as opposed to e.g. Google Drive auth). */
export async function isAdminDenial(res: Response): Promise<boolean> {
  if (res.status !== 401 && res.status !== 403 && res.status !== 503) return false;
  const code = await errorCode(res);
  return code !== null && code.startsWith('admin_');
}

/** fetch() for admin routes: attaches the CSRF token, refreshes it if stale, and prompts for login once if needed. */
export async function adminFetch(input: string, init: RequestInit = {}, allowPrompt = true): Promise<Response> {
  const headers = new Headers(init.headers);
  if (csrfToken) headers.set('x-kaijax-csrf', csrfToken);
  const res = await fetch(input, { ...init, headers, credentials: 'same-origin' });
  if (!allowPrompt || (res.status !== 401 && res.status !== 403)) return res;
  const code = await errorCode(res);
  if (code === 'admin_csrf') {
    const status = await fetchAdminStatus(); // cookie still valid, csrf token was only lost on reload
    if (status?.authenticated && status.csrf) return adminFetch(input, init, false);
  }
  if (code === 'admin_auth_required' || code === 'admin_csrf') {
    if (!promptHandler) return res;
    pendingPrompt = pendingPrompt ?? promptHandler().finally(() => (pendingPrompt = null));
    if (await pendingPrompt) return adminFetch(input, init, false);
  }
  return res;
}
