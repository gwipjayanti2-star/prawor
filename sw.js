const CACHE_NAME = 'variance-pro-cache-v3';
const ASSETS_TO_CACHE = [
'./',
'./index.html',
'./manifest.json',
// Ikon bebas yang di-cache di service worker sesuai permintaan
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Progressive_Web_Apps_Logo.svg/192px-Progressive_Web_Apps_Logo.svg.png',
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Progressive_Web_Apps_Logo.svg/512px-Progressive_Web_Apps_Logo.svg.png'
];

// Event Install: Menyimpan aset statis ke dalam cache
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log('[Service Worker] Caching app shell & icons');
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

// Event Fetch: Strategi Network First dengan Fallback Cache yang Lebih Pintar
self.addEventListener('fetch', (event) => {
// Abaikan caching untuk request ke Google Apps Script (API)
if (event.request.url.includes('script.google.com')) {
return;
}

event.respondWith(
    fetch(event.request)
        .catch(() => {
            // Jika network gagal (offline), ambil dari cache
            return caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                // Jika path persis tidak ketemu (misal '/' padahal yang di cache './index.html')
                // Coba arahkan kembali navigasi HTML ke index.html cache
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
);


});
