// Service Worker cho StudyWatch
// Cho phép ứng dụng chạy HOÀN TOÀN OFFLINE

const CACHE_NAME = 'studywatch-v1.0.0';
const urlsToCache = [
  '/index.html',
  '/model/model.json',
  '/model/metadata.json',
  '/model/weights.bin',        // ← QUAN TRỌNG: Model weights!
  '/manifest.json',
  '/favicon.svg',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// Cài đặt Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Đang cài đặt...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Đang cache files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Kích hoạt Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Đã kích hoạt');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Xóa cache cũ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Xử lý fetch requests - Offline First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - trả về response từ cache
        if (response) {
          console.log('💾 Cache hit:', event.request.url);
          return response;
        }
        
        // Không có trong cache - fetch từ network
        return fetch(event.request).then(response => {
          // Không cache nếu không phải response hợp lệ
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response để cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Offline và không có cache - trả về trang offline
        console.log('❌ Offline và không có cache');
      })
  );
});
