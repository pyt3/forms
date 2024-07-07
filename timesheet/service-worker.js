self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('timesheet-cache').then(cache => {
        return cache.addAll([
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
          // Cache hit - return response
          if (response) {
            return response;
          }
  
          // Clone the request to avoid consuming it
          let fetchRequest = event.request.clone();
  
          return fetch(fetchRequest)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
  
              // Clone the response to put it in the cache
              let responseToCache = response.clone();
  
              caches.open('timesheet-cache')
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
  
              return response;
            })
            .catch(error => {
              console.error('Error fetching:', error);
              // You might want to customize the error response here
              return new Response('Service unavailable', {
                status: 503,
                statusText: 'Service unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
        .catch(error => {
          console.error('Error fetching from cache:', error);
          // Handle errors from caches.match() if needed
          return new Response('Not found in cache', {
            status: 404,
            statusText: 'Not found in cache',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        })
    );
  });
  
  
