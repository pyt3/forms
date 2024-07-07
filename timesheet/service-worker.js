self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('timesheet-cache').then(cache => {
        return cache.addAll([
          './',
          './timesheet.html',
          './THSarabun.ttf',
          './timesheetForm-no-sum.pdf',
          './timesheetForm.pdf',
          './icon.png',
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
  
