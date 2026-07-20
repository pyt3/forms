const CACHE_NAME = 'bedtracker-cache-v2';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './equipment_list.xlsx',
  'https://cdn.tailwindcss.com',
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/vconsole@latest/dist/vconsole.min.js',
  'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm',
  'https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;900&family=Inter:wght@400;500;700;900&family=Sarabun:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('💾 Caching app shell');
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(new Request(url, { mode: 'no-cors' }))
            .then(response => cache.put(url, response))
            .catch(err => console.warn('Pre-cache failed for:', url, err));
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('🗑️ Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-First for HTML, Cache-First for assets and CDNs
  const isDoc = event.request.destination === 'document' || event.request.url.includes('index.html');
  if (isDoc) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('./index.html'));
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }

              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
              return networkResponse;
            })
            .catch(() => {
              return caches.match('./index.html');
            });
        })
    );
  }
});

// Message handler for update control
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Skipping waiting and activating immediately');
    self.skipWaiting();
  }
});

// Periodically check for updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
    console.log('🔍 Checking for updates...');
    // Standard update checks can be performed by the browser naturally
  }
});
