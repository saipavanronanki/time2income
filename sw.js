'use strict';

const CACHE_NAME = 'time2income-static-v5';
const OFFLINE_ASSETS = ['/offline.html', '/assets/time2income-mark.png'];
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/redesign.css',
  '/localization.js',
  '/currency.js',
  '/pwa.js',
  '/payment.js',
  '/payment.css',
  '/assets/time2income-mark.png',
  '/assets/time2income-app-icon.svg',
  '/assets/time2income-180.png',
  '/assets/time2income-192.png',
  '/assets/time2income-512.png',
  '/assets/time2income-180.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(OFFLINE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter(name => name.startsWith('time2income-static-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        return await fetch(request, { signal: controller.signal });
      } catch {
        const offlinePage = await caches.match('/offline.html');
        return offlinePage || Response.error();
      } finally {
        clearTimeout(timeout);
      }
    })());
    return;
  }

  if (!STATIC_ASSETS.includes(url.pathname)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(url.pathname, response.clone());
      }
      return response;
    } catch {
      return caches.match(url.pathname);
    }
  })());
});