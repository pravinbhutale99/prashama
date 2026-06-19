// Prashama service worker — v1
// Purpose: lets us call registration.showNotification() so notifications
// can carry actions/icon consistently across Android/iOS PWA contexts.
// This does NOT implement push from a server — see app.js NOTIF module
// for the local foreground-check scheduling approach used in V1.

const CACHE_NAME = 'prashama-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Allow the page to ask the SW to show a notification (so it can include
// icon/badge consistently, and so it still shows if the tab is backgrounded
// but the SW is alive).
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = data.payload || {};
    self.registration.showNotification(title || 'Prashama', {
      body: body || '',
      tag: tag || 'prashama-notif',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      silent: false,
      renotify: false,
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
