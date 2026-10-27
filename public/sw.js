// Service Worker leve (Network-Only) — mantém compatibilidade de instalação PWA
// sem armazenar HTML/JS antigos em cache, evitando que alunas precisem limpar cache manualmente.
const SW_VERSION = 'agendamaster-sw-v2.0.3-network-only';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => caches.delete(name)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

// Pass-through: nunca intercepta nem retém HTML/JS/API antigos em cache
self.addEventListener('fetch', () => {
  return;
});
