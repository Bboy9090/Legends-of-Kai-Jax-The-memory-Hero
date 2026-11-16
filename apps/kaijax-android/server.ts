import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { buildApp } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === 'production';
/**
 * Loopback by default so a dev machine never exposes the vault/Blender routes to the LAN.
 * Container / cloud deployments set HOST=0.0.0.0 together with KAIJAX_ADMIN_TOKEN.
 */
const HOST = process.env.HOST?.trim() || '127.0.0.1';

async function createServer() {
  const app = buildApp({
    appRoot: __dirname,
    adminToken: process.env.KAIJAX_ADMIN_TOKEN,
    production,
  });

  // Mount Vite middleware in dev (with HMR & WebSocket server disabled for Cloud Run / iframe stability), or serve static dist/ in production
  if (process.env.NODE_ENV !== 'production') {
    const VITE_NO_WS_CLIENT_SHIM = `
const sheetsMap = new Map();
export class ErrorOverlay extends HTMLElement {}
if (typeof customElements !== 'undefined' && !customElements.get('vite-error-overlay')) {
  customElements.define('vite-error-overlay', ErrorOverlay);
}
export function updateStyle(id, content) {
  if (typeof document === 'undefined') return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
  sheetsMap.delete(id);
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    invalidate() {},
    decline() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (!queryToInject || (url[0] !== '.' && url[0] !== '/')) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return \`\${pathname}?\${queryToInject}\${search ? '&' + search.slice(1) : ''}\${hash || ''}\`;
}
`;
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(VITE_NO_WS_CLIENT_SHIM);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false, forwardConsole: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    // Static files and the SPA fallback touch the filesystem on every request: cap them per client.
    const staticLimiter = rateLimit({ windowMs: 60_000, limit: 600, standardHeaders: true, legacyHeaders: false, validate: { xForwardedForHeader: false } });
    app.use(staticLimiter);
    app.use(express.static(distDir));
    app.get('*', staticLimiter, (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Kai-Jax Server] Running on http://${HOST}:${PORT}`);
  });
}

createServer();
