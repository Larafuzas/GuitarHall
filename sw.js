const CACHE_NAME = 'guitarhall-v16';
const ASSETS = [
  './',
  './index.html',
  './reference.html',
  './manifest.json',
  './icono.png',
  './telecaster.jpeg',
  './stratocaster.jpeg',
  './lespaul.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Estrategia Network-First (Busca en internet primero, si falla o estás sin conexión, carga la caché)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Excluir las peticiones de las APIs de búsqueda para que no se bloqueen por CORS local
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet y el archivo carga bien, lo guardamos/actualizamos en caché
        if (networkResponse && networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        }
        return networkResponse;
      })
      .catch(() => {
        // Si falla (ej. Modo Avión o sin cobertura), devolvemos el archivo guardado en caché
        return caches.match(event.request);
      })
  );
});
