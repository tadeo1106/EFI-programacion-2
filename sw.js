/**
 * BusRío - Service Worker (PWA v2.1)
 * Estrategia de caché local y resiliencia offline para Río Cuarto.
 */

const CACHE_NAME = 'busrio-cache-v2.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/data.js',
  './js/app.js',
  './icons/icon.svg'
];

// Instalación: Precargar recursos críticos de la aplicación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés antiguas
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

// Estrategia Fetch: Network-First con fallback a Caché EXCLUSIVAMENTE para recursos propios
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  // REGLA CRÍTICA: Ignorar dominios externos (OpenStreetMap tiles, FontAwesome, Leaflet CDN, etc.)
  // Permite que el navegador y Leaflet gestionen sus azulejos sin interferencias de caché
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // En segundo plano revalidar si hay red
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }).catch(() => {
          // Sin conexión: uso pacífico del recurso en caché
        });
        return cachedResponse;
      }

      // Si no está en caché, buscar en la red
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback para navegación offline HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
