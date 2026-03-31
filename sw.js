const CACHE = 'myfinance-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never intercept Firebase/Google API calls
  const url = e.request.url;
  if(url.includes('firestore.googleapis.com') ||
     url.includes('identitytoolkit') ||
     url.includes('securetoken') ||
     url.includes('firebase') ||
     url.includes('gstatic.com/firebasejs')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if(e.request.method === 'GET' && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
