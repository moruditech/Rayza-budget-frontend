/* Service worker — makes the app installable and lets the shell open offline.
 *
 * Strategy
 *  - Page navigations: network first, falling back to the cached app shell,
 *    so a new deploy is picked up immediately but the app still opens offline.
 *  - Built assets (/assets/*, icons, manifest): cache first (files are
 *    content-hashed, so they never go stale).
 *  - API calls and anything cross-origin (the backend, Google Fonts) are
 *    NEVER touched: budget data must always come live from the server.
 *
 * Bump CACHE_VERSION to force clients to drop old caches.
 */
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `budget-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `budget-assets-${CACHE_VERSION}`;
const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, ASSET_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // backend API, fonts, …
  if (url.pathname.startsWith('/api/')) return;

  // Navigations → network first, cached shell as the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets → cache first, then fill the cache from the network.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
