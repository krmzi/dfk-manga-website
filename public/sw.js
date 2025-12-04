// Service Worker for PWA and Push Notifications - v3.0.0
const CACHE_NAME = 'dfk-team-v3';

// Install event - skip caching to avoid errors
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network only (no caching to avoid errors)
self.addEventListener('fetch', (event) => {
    // Skip non-http(s) requests (chrome-extension, etc.)
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Just pass through to network
    event.respondWith(fetch(event.request));
});

// Push event - show notification
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.data?.url || '/',
        },
        actions: [
            {
                action: 'open',
                title: 'اقرأ الآن',
            },
            {
                action: 'close',
                title: 'إغلاق',
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
