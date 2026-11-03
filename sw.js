// 離線快取：頁面走網路優先（才拿得到更新），其他資源走快取優先
const CACHE = 'naiwa-v1';
const CORE = [
  './', 'index.html', 'shapes.js', 'manifest.json',
  'assets/dou.png', 'assets/dan.png', 'assets/shu.png', 'assets/mao.png', 'assets/ji.png',
  'assets/cha.png', 'assets/gou.png', 'assets/fen.png', 'assets/wa.png',
  'icons/icon-192.png',
  'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const save = res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  };
  if (req.mode === 'navigate' || req.url.endsWith('shapes.js')) {
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(r => r || caches.match('./'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(save)));
  }
});
