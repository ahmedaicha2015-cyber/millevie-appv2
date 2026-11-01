const CACHE_NAME = 'millevie-cache-v2026-3';
const ASSETS = [
  './', './index.html', './manifest.json',
  './data/recipes_1.json',
  './data/recipes_2.json',
  './data/recipes_3.json',
  './data/recipes_4.json',
  './data/who_growth.json',
  './data/activities.json',
  './data/quiz.json',
  './data/danger_signs.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
