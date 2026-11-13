// Kebun Ilmu: simpan berkas yang pernah dibuka supaya tetap jalan saat sinyal lemah.
// Halaman & data selalu dicek ke server dulu (network-first) agar update langsung sampai.
const CACHE = 'kebun-ilmu-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.webmanifest']))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (e.request.headers.has('range')) return; // audio diputar langsung dari server
  const heavy = /\/(buku|audio|icons|fonts)\//.test(u.pathname);
  if (heavy) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })));
  } else {
    e.respondWith(fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match(e.request)));
  }
});
