// sw.js
const CACHE_NAME = 'e-bill-dynamic-v87';

const urlsToCache = [
  './',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network First: دائماً نحاول الشبكة أولاً، والكاش فقط عند انقطاع الإنترنت
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // إذا نجح الطلب، نحدّث الكاش ونرجع الاستجابة الجديدة
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.method === 'GET' &&
          !event.request.url.startsWith('chrome-extension')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // إذا انقطع الإنترنت، نرجع النسخة المخزنة
        return caches.match(event.request);
      })
  );
});
