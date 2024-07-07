self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('timesheet-cache').then(cache => {
        return cache.addAll([
          '/forms/timesheet/timesheet.html',
          '/forms/timesheet/THSarabun.ttf',
          '/forms/timesheet/timesheetForm-no-sum.pdf',
          '/forms/timesheet/timesheetForm.pdf',
          '/forms/timesheet/icon.png',
          '/forms/timesheet/screenshot-mobile.png',
          '/forms/timesheet/screenshot-desktop.png',
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
  