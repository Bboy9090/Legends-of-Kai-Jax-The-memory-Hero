/**
 * THE AETERNA COVENANT - SERVICE WORKER
 * Offline Shield - The Aeterna remembers even when disconnected
 */

const CACHE = 'aeterna-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/styles/bronx_grit.css'
];

// Install event - Cache resources
self.addEventListener('install', (e) => {
  console.log('[SW] Installing Aeterna Covenant Service Worker...');
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log('[SW] Caching resources...');
      return cache.addAll(CACHE_URLS).catch((err) => {
        console.warn('[SW] Some resources failed to cache:', err);
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - Clean old caches
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating Aeterna Covenant Service Worker...');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(e.request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Offline fallback
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
