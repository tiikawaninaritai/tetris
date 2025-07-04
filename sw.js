const CACHE_NAME = 'tetris-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/images/icon-192.png',
    '/images/icon-512.png'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: serve assets from cache first
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If the request is in the cache, return it
                if (response) {
                    return response;
                }
                // Otherwise, fetch it from the network
                return fetch(event.request);
            })
    );
});

## 4. Unchanged Files
Your original style.css and script.js files do not need any changes. Just place them in the same directory.

## How to Deploy and Run 🚀
File Structure: Organize your files in your project's root directory like this:

/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
└── images/
    ├── icon-192.png
    └── icon-512.png
