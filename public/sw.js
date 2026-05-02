const CACHE_NAME = 'ftssu-v3';
const urlsToCache = [
    '/',
    '/dashboard/',
    '/store/',
    '/cart/',
    '/orders/',
    '/profile/',
    '/attendance/',
    '/announcements/',
    '/manifest.json'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Cache addAll failed:', err))
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim());
});

// Listen for SKIP_WAITING from UpdatePrompt
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting, activating new version...');
        self.skipWaiting();
    }
});

// -------------------------------------------------------
// PUSH NOTIFICATION HANDLER
// -------------------------------------------------------
self.addEventListener('push', event => {
    console.log('[SW] Push received');

    let data = {
        title: 'FTSSU',
        body: 'You have a new notification',
        icon: '/icons/manifest-icon-192.png',
        badge: '/icons/manifest-icon-192.png',
        url: '/dashboard'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: { url: data.url },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'close', title: 'Dismiss' }
        ],
        requireInteraction: false,
        tag: 'ftssu-notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(url);
                        return;
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// -------------------------------------------------------
// FETCH - Updated to only handle GET requests
// -------------------------------------------------------
self.addEventListener('fetch', (event) => {
    // Only handle GET requests - skip POST, PUT, DELETE, etc.
    if (event.request.method !== 'GET') {
        return; // Let non-GET requests go through without caching
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request)
                    .then(cached => cached || caches.match('/offline.html'));
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // Only cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(err => {
                console.warn('[SW] Fetch failed:', event.request.url, err);
            });
        })
    );
});