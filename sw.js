/*
 * OriginScan — Service Worker
 * Copyright (C) 2025 Samin Yasar [https://github.com/Samin-yasar]
 *
 * This file is part of OriginScan and is free software licensed under
 * the GNU General Public License v3. See LICENSE for details.
 *
 * Strategy:
 *   - App shell (HTML, CSS, JS, manifest): cache-first — fast loads, offline-capable.
 *   - CDN resources (Leaflet, Font Awesome, html5-qrcode): stale-while-revalidate.
 *   - External APIs (Open Food Facts, REST Countries): network-first, no caching
 *     (live data should always be fresh; network failure degrades gracefully).
 */

const CACHE_NAME    = 'originscan-v1.1';
const SHELL_ASSETS  = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './js/core/validator.js',
  './js/core/gs1-registry.js',
  './js/core/product-api.js',
  './js/core/engine.js'
];

// CDN hosts whose resources we should cache on first fetch
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// External API origins that should NEVER be cached
const LIVE_API_HOSTS = [
  'world.openfoodfacts.org',
  'world.openbeautyfacts.org',
  'world.openproductsfacts.org',
  'openlibrary.org',
  'restcountries.com'
];

// ── Install — pre-cache the application shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can; don't let a single miss block the install
      return Promise.allSettled(
        SHELL_ASSETS.map(asset =>
          cache.add(asset).catch(err => {
            console.warn(`[SW] Failed to pre-cache ${asset}:`, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate — delete stale caches from older versions ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch — route requests by strategy ────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // Live API calls — always go to network, never serve from cache
  if (LIVE_API_HOSTS.some(host => url.hostname === host)) {
    return; // Let the browser handle it normally
  }

  // CDN resources — stale-while-revalidate
  if (CDN_HOSTS.some(host => url.hostname === host)) {
    event.respondWith(_staleWhileRevalidate(request));
    return;
  }

  // App shell and local assets — cache-first
  event.respondWith(_cacheFirst(request));
});

// ── Strategies ─────────────────────────────────────────────────────────────

/**
 * Cache-first: serve from cache immediately; fall back to network if not cached.
 * Used for the app shell so the app loads instantly and works offline.
 */
async function _cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    // If we're offline and the resource isn't cached, return a minimal offline page
    // only for document requests (navigations)
    if (request.destination === 'document') {
      const offlinePage = await caches.match('./index.html');
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline — resource unavailable', { status: 503 });
  }
}

/**
 * Stale-while-revalidate: serve from cache while updating it in the background.
 * Used for CDN resources that change infrequently.
 */
async function _staleWhileRevalidate(request) {
  const cache   = await caches.open(CACHE_NAME);
  const cached  = await cache.match(request);

  // Kick off a background fetch to keep the cache warm
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Return cached version immediately (or wait for network if nothing cached yet)
  return cached || fetchPromise;
}
