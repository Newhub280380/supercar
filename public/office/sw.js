/* Оффлайн-оболочка дома: страницы и ассеты кешируются после первого визита,
   поэтому установленное приложение открывается даже без сети. */

const CACHE = 'house-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()),
));

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request).then(hit => hit ?? Response.error())),
  );
});
