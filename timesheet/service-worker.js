self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('my-cache').then(cache => {
            return cache.addAll([
                '/forms/timesheet',
                '/forms/timesheet/icon.png',
                '/forms/timesheet/THSarabun.ttf',
                '/forms/timesheet/timesheetForm.pdf',
                '/forms/timesheet/timesheetForm no-sum.pdf',
                '/forms/timesheet/timesheet.html'
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
