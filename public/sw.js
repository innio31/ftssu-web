const CACHE_NAME = 'ftssu-v2';
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

// Install event - cache assets
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

// Activate event - clean up old caches
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

// Listen for SKIP_WAITING message from UpdatePrompt component
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting, activating new version...');
        self.skipWaiting();
    }
});

// Fetch event - SINGLE listener (merged)
self.addEventListener('fetch', event => {
    // Handle page navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request)
                        .then(cached => cached || caches.match('/offline.html'));
                })
        );
        return;
    }

    // Handle all other requests (assets, API calls, etc.)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Return cached version if available
            if (cachedResponse) {
                return cachedResponse;
            }

            // Otherwise fetch from network
            return fetch(event.request).then(networkResponse => {
                // Don't cache non-basic or error responses
                if (
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type !== 'basic'
                ) {
                    return networkResponse;
                }

                // Cache a clone of the response for future use
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(err => {
                console.warn('[SW] Fetch failed for:', event.request.url, err);
            });
        })
    );
});