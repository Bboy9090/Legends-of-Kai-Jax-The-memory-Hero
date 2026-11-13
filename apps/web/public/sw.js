/**
 * LEGENDS OF KAI-JAX - RELEASE SERVICE WORKER
 * Small-shell offline cache only. Large packaged game models are never
 * duplicated into Cache Storage.
 */

const CACHE = 'kai-jax-shell-v4';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/privacy.html',
  '/terms.html',
  // Move data is fetched at battle start; keep it available with no network.
  '/moves/jax_dash_strike.json',
  '/moves/jax_flash_grab.json',
  '/moves/jax_quick_jab.json',
  '/moves/jax_spin_kick.json',
  '/moves/kai_combo_chain.json',
  '/moves/kai_grab.json',
  '/moves/kai_heavy_punch.json',
  '/moves/kai_light_jab.json',
  '/moves/kai_sweep.json',
  '/moves/kai_tail_whip.json',
  '/moves/kai_uppercut.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Cache entries independently so one optional path cannot invalidate
      // the entire offline shell.
      await Promise.all(
        CACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn('[SW] Shell cache miss:', url, error);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => name === CACHE ? undefined : caches.delete(name)))
    )
  );
  return self.clients.claim();
});

function shouldCache(request, response) {
  if (request.method !== 'GET') return false;
  if (!response || response.status !== 200) return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  // GLBs are already packaged with the native application. Caching them
  // again can duplicate hundreds of MB in WebView storage.
  if (url.pathname.toLowerCase().endsWith('.glb')) return false;

  return true;
}

async function put(request, response) {
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the dev server's modules/HMR: a cache-first dev build serves stale code.
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@') || url.pathname.startsWith('/node_modules/')) return;

  // Page loads: network first so a new deploy is picked up, cached shell when offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (shouldCache(request, response)) event.waitUntil(put('/index.html', response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || Response.error())
    );
    return;
  }

  // Everything else (hashed JS/CSS, icons, move data): cache first, fill on miss.
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      const response = await fetch(request);
      if (shouldCache(request, response)) event.waitUntil(put(request, response.clone()));
      return response;
    })
  );
});
