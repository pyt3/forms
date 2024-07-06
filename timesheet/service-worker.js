self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('my-cache').then(cache => {
        return cache.addAll([
          './',
          './timesheet.html',
          './THSarabun.ttf',
          './timesheetForm no-sum.pdf',
          './timesheetForm.pdf',
          './icon.png',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  