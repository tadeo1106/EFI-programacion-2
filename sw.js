/**
 * BusRío - Service Worker (PWA v2.2)
 * Estrategia de caché Network-First con fallback a Caché Local.
 * Requisito E.F.I.: Network-First real con caché versionado.
 */

const CACHE_NAME = 'busrio-cache-v2.2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/data.js',
  './js/simulation.js',
  './js/app.js',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no HTTP (ej. extensiones, chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  // Ignorar peticiones externas (Leaflet, mapas) para no saturar la caché offline
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      // 1. Intentar descargar de la red (Network)
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // 2. Si falla (Offline), buscar en caché (First)
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback genérico para HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
