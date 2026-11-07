'use strict';

const CACHE_NAME = 'time2income-static-v80-t2i-click-handler';
const OFFLINE_ASSETS = ['/offline.html', '/assets/time2income-mark.png'];
const STATIC_ASSETS = [
  '/pricing-estimate.html',
  '/pricing-config.js',
  '/pricing-estimate.js',
  '/checkout-quote.js',
  '/checkout-quote.css',
  '/payment.css',
  '/offline.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/redesign.css',
  '/location-gateway.css',
  '/t2i-wallet.css',
  '/explore.css',
  '/location-gateway.js',
  '/explore-tour.js',
  '/explore-demo.js',
  '/experience.js',
  '/country-directory.js',
  '/localization.js',
  '/currency.js',
  '/pwa.js',
  '/browser-check.js',
  '/messages.html',
  '/messages.css',
  '/messages.js',
  '/push-config.js',
  '/payment.js',
  '/payment.css',
  '/assets/time2income-mark.png',
  '/assets/time2income-app-icon.svg',
  '/assets/time2income-180.png',
  '/assets/time2income-192.png',
  '/assets/time2income-512.png',
  '/assets/time2income-180.png',
  '/assets/help-center-banner-no-book.png',
  '/assets/help-page-star-background.png',
  '/assets/pricing-estimate-green-background.png',
  '/assets/terms-page-background.webp',
  '/assets/terms-page-background-green.png',
  '/assets/terms-page-background-frame.png',
  '/assets/terms-page-background-dark-green.png',
  '/assets/privacy-page-background.png',
  '/assets/privacy-page-background-alt.avif'
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

self.addEventListener('push', event => {
  let payload = {};
  const raw = event.data?.text() || '';
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { body: raw };
    }
  }
  event.waitUntil(self.registration.showNotification(payload.title || 'TIME2INCOME', {
    body: payload.body || 'There is a new nearby marketplace alert.',
    icon: '/assets/time2income-192.png',
    badge: '/assets/time2income-mark.png',
    tag: payload.tag || 'time2income-nearby-alert',
    data: { url: payload.url || '/index.html?page=tasks' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    let target;
    try {
      target = new URL(event.notification.data?.url || '/index.html?page=tasks', self.location.origin);
      if (target.origin !== self.location.origin) throw new Error('Notification target must be same-origin.');
    } catch {
      target = new URL('/index.html?page=tasks', self.location.origin);
    }
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
        await client.navigate(target.href);
        return await client.focus();
      }
    }
    return self.clients.openWindow(target.href);
  })());
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