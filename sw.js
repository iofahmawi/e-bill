const CACHE_NAME = 'e-bill-calculator-v1';
const urlsToCache = [
    '/',
    'index.html',
    'icon-1024.png'
];

// عند تثبيت الـ Service Worker، قم بتخزين الملفات
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// عند طلب أي ملف، ابحث عنه في الكاش أولاً
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وُجد في الكاش، أرجعه
                if (response) {
                    return response;
                }
                // إذا لم يوجد، اطلبه من الشبكة
                return fetch(event.request);
            })
    );

});
