const CACHE_NAME = 'pocket-host-v1';

// On install - cache nothing, always fetch fresh
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// On activate - clear any old caches and take control immediately
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// On fetch - always go to network first, fall back to cache
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Clone and cache the fresh response
      const clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // If offline, serve from cache
      return caches.match(e.request);
    })
  );
});
