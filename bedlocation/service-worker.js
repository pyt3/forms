const CACHE_NAME = 'bedtracker-cache-v1';
const ASSETS_TO_CACHE = [
  '/forms/bedlocation/index.html',
  '/forms/bedlocation/manifest.json',
  '/forms/bedlocation/icon.svg'
];

self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('💾 Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
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
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-First Strategy for main documents
  if (event.request.destination === 'document' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Clone the response
          const responseToCache = networkResponse.clone();

          // Update cache with new version
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
            console.log('✅ Updated cache:', event.request.url);
          });

          return networkResponse;
        })
        .catch(error => {
          console.log('📡 Network failed, using cache:', event.request.url);
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/forms/bedlocation/index.html');
            });
        })
    );
  } else {
    // Cache-First Strategy for other assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }

              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
              return networkResponse;
            })
            .catch(() => {
              // Return offline page if available
              return caches.match('/forms/bedlocation/index.html');
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
self.addEventListener('install', event => {
  // Check for new version every time SW installs
  console.log('🔍 Checking for updates...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url)
            .then(response => {
              if (response && response.status === 200) {
                cache.put(url, response);
                console.log('✨ New version available for:', url);
                
                // Notify all clients about update
                self.clients.matchAll().then(clients => {
                  clients.forEach(client => {
                    client.postMessage({
                      type: 'UPDATE_AVAILABLE',
                      message: 'มีเวอร์ชันใหม่พร้อมใช้'
                    });
                  });
                });
              }
              return response;
            })
            .catch(error => {
              console.log('❌ Failed to fetch:', url, error);
            });
        })
      );
    })
  );
  
  self.skipWaiting();
});
