self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('outsource-cache').then(cache => {
        return cache.addAll([
          '/forms/teamcm/sendoutsourceform.html',
          '/forms/teampm/THSarabun.ttf',
          '/forms/teamcm/outsourceForm.pdf',
          '/forms/teamcm/icons/outsource-icon.png',
          '/forms/teamcm/screenshots/Screenshot-outsourceform-mobile.png',
          '/forms/teamcm/screenshots/Screenshot-outsourceform-desktop.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
        .catch(error => {
          console.error('Error fetching from cache:', error);
          return fetch(event.request);
        })
    );
  });
  