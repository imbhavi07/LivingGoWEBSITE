const CACHE_NAME = 'livinggo-cache-v1';

// These are the core pages we want to save to the user's phone
const PRECACHE_ASSETS = [
  '/',
  '/listings',
  '/manifest.json'
];

// 1. Install Event: Save the core files to the user's phone
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up any old caches if you update the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: "Network-First" strategy
// Tries to get fresh data from your server. If the user loses internet connection, 
// it falls back to the saved cache so the screen doesn't go white.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});