/**
 * LEGENDS OF KAI-JAX - RELEASE SERVICE WORKER
 * Small-shell offline cache only. Large packaged game models are never
 * duplicated into Cache Storage.
 */

const CACHE = 'kai-jax-shell-v2';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/privacy.html',
  '/terms.html'
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(async (cached) => {
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (shouldCache(event.request, response)) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          );
        }
        return response;
      } catch (error) {
        if (event.request.destination === 'document') {
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
        }
        throw error;
      }
    })
  );
});
