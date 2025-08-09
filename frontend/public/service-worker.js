// self.addEventListener required for push notifications and custom events
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', event => {
  clients.claim();
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Handle web push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/icon.png'
    });
  }
});