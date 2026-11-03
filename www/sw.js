const CACHE_NAME = 'millevie-v3.3-final'; // Nom changé pour forcer la mise à jour
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './js/data.js',       // Nouveau module données
  './js/app.js',        // Nouveau module logique
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Vos fichiers data externes sont aussi cachés si présents
  './data/recipes_1.json',
  './data/who_growth.json',
  './data/danger_signs.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Ouverture du cache...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.warn('Erreur pré-cache (fichier manquant ?):', err))
  );
  self.skipWaiting(); // Force l'activation immédiate
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName); // Supprime les anciennes versions
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve depuis le cache (Hors ligne OK)
        }
        
        // Sinon, va chercher sur le réseau
        return fetch(event.request).then(networkResponse => {
          // Vérifie si la réponse est valide avant de la cacher dynamiquement
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          
          return networkResponse;
        }).catch(error => {
          console.error('Échec réseau:', error);
          // Optionnel : page de secours si tout échoue
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
