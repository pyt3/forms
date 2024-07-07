self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('my-cache').then(cache => {
        return cache.addAll([
          '/forms/timesheet/',
          '/forms/timesheet/timesheet.html',
          '/forms/timesheet/THSarabun.ttf',
          '/forms/timesheet/timesheetForm no-sum.pdf',
          '/forms/timesheet/timesheetForm.pdf',
          '/forms/timesheet/icon.png',
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
  