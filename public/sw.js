// Service Worker for PWA and Push Notifications - v4.0.0
// Simplified version - No fetch interception to avoid conflicts

const CACHE_NAME = 'dfk-team-v4';

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker v4.0.0 installing...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker v4.0.0 activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ⚠️ NO FETCH INTERCEPTION - Let all requests go through normally
// This prevents "Failed to fetch" errors caused by Service Worker interference

// Push event - show notification
self.addEventListener('push', (event) => {
    console.log('Push notification received');

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
    console.log('Notification clicked');
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

console.log('Service Worker v4.0.0 loaded successfully');
