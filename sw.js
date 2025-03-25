self.addEventListener('install', event => {
    console.log('Service Worker installé');
    event.waitUntil(
      caches.open('crypto-v1').then(cache => {
        return cache.addAll([
          './',
          './index.html',
          './style.css',
          './script.js',
          './assets/logo.svg',
          './manifest.json'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(resp => resp || fetch(event.request))
    );
  });
  