'use strict';

var CACHE_NAME = 'nexusmusic-player-shell-v8';
var SHELL_FILES = [
  './listen.html',
  './player.js',
  './app-ui.js',
  './chat-widget.js',
  './discord-presence.js',
  './firebase-web-config.js',
  './nexus-account.js',
  './nexus-account.css',
  './studio.css',
  './fusion.css',
  './atmosphere.css',
  './obsidian.css',
  './dashboard.css',
  './page-scale.css',
  './assets/Nexus-logo.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(SHELL_FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.indexOf('nexusmusic-player-shell-') === 0 && key !== CACHE_NAME;
      }).map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response.ok) {
          var copy = response.clone();
          return caches.open(CACHE_NAME).then(function (cache) {
            return cache.put(request, copy).then(function () { return response; });
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request, { ignoreSearch: true })
          .then(function (response) {
            if (response) return response;
            return caches.match(new URL('./listen.html', self.registration.scope).href)
              .then(function (fallback) { return fallback || Response.error(); });
          });
      })
    );
    return;
  }

  if (!/\.(css|js|html|png|jpe?g|svg|webp|woff2?)$/i.test(new URL(request.url).pathname)) return;
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (!response.ok) return response;
        var copy = response.clone();
        return caches.open(CACHE_NAME).then(function (cache) {
          return cache.put(request, copy).then(function () { return response; });
        });
      });
    })
  );
});
