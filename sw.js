const CACHE_NAME = 'variance-pro-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Event Install: Menyimpan aset statis ke dalam cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Event Activate: Membersihkan cache lama jika versi diperbarui
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Menghapus cache lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Event Fetch: Strategi Network First (fallback ke Cache jika offline)
self.addEventListener('fetch', (event) => {
    // Abaikan caching untuk request ke Google Apps Script (API)
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Jika network gagal (offline), ambil dari cache
                return caches.match(event.request);
            })
    );
});
