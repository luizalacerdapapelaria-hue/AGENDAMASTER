const CACHE_NAME = 'agendamaster-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("[PWA SW] Erro ao carregar cache inicial (esperado em desenvolvimento):", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[PWA SW] Removendo cache antigo:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora chamadas que não sâo de leitura simples (ex: POST, PUT, DELETE)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar consultas da API do Supabase, requisições de hot-reload ou control plane interno do AI Studio
  if (
    url.pathname.startsWith('/api') || 
    url.pathname.includes('__aistudio') || 
    url.host.includes('supabase.co') || 
    event.request.url.includes('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Estratégia Stale-While-Revalidate: serve do cache rápido e atualiza por trás
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Erro de rede em segundo plano silencioso
        });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // se falhar offline completo para navegação SPA, entrega a casca principal
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
