// sw.js

// 1. تغيير اسم الكاش وتحديث الإصدار
const CACHE_NAME = 'e-bill-dynamic-v5';

// 2. نخزن فقط الملفات الأساسية جداً لضمان نجاح التثبيت
const urlsToCache = [
  './',
  'index.html',
  'manifest.json'
  // أزلنا الصور والخطوط من هنا لتجنب فشل التثبيت إذا لم تكن موجودة
];

self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل التحديث فوراً
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الكاش القديم
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة الفورية على الصفحات المفتوحة
  );
});

self.addEventListener('fetch', event => {
  // استراتيجية: Cache First, then Network, then Save to Cache
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 1. إذا وجدنا الملف في الكاش، نرجعه فوراً
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. إذا لم نجده، نطلبه من الإنترنت
        return fetch(event.request).then(networkResponse => {
          // التحقق من صحة الاستجابة
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // 3. نسخ الاستجابة وتخزينها في الكاش للمستقبل
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            // نتأكد أننا لا نخزن طلبات غير مدعومة (مثل طلبات POST أو chrome-extension)
            if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension')) {
                 cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        });
      }).catch(() => {
        // في حالة عدم وجود انترنت ولم نجد الملف في الكاش
        // (يمكن هنا إرجاع صفحة "أنت غير متصل" مخصصة إذا أردت)
      })
  );
});