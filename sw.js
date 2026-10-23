// 受付スキャナ: 画面の部品を端末に保存して、すぐ開けるようにする (入場処理の通信は保存しない)
const CACHE = 'ls-scanner-v4';
const FILES = ['./', './index.html', './jsQR.min.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // 公演ポータルへの通信はそのまま
  // まず保存した物を出し、裏で新しい物に入れ替える (次に開いた時に反映)
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((hit) => {
    const net = fetch(e.request).then((res) => { if (res && res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
