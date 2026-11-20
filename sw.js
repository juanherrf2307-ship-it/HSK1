// Service worker: permite instalar la app y abrirla sin conexión.
// Estrategia "red primero": siempre intenta la versión más nueva y usa la caché solo si no hay internet,
// así las actualizaciones de contenido llegan sin reinstalar.
const CACHE = 'huohuo-v1';
const CORE = ['./', './index.html', './styles.css', './manifest.webmanifest', './js/app.js', './js/data.js', './js/extras.js', './js/mascot.js', './js/firebase-config.js', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r }).catch(() => caches.match(e.request)));
});
