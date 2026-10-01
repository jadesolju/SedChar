// SedChar.AI Progressive Web App (PWA) Service Worker v1.4.0
// Features: High-efficiency Cache-First for static assets, minimal pre-cache payload, and bulletproof offline fallback

const CACHE_NAME = 'sedchar-pwa-v1.4.0';

// Core essential assets to pre-cache immediately upon installation
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/scripts/theme-init.js',
];

// Install Event - Pre-cache core shell & skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[PWA SW] Pre-cache note:', err);
      })
  );
});

// Activate Event - Clean up all previous caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log('[PWA SW] Clearing obsolete cache:', key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Smart offline routing & Zero-Redundant transfer caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. Pass through API routes & external third-party endpoints directly to network
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('r2.cloudflarestorage.com')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'คุณกำลังออฟไลน์ (Offline Mode)' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          }
        );
      })
    );
    return;
  }

  // 3. Navigation Requests (HTML Pages) -> Network First, fallback to cached HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const shellResponse = await caches.match('/');
          if (shellResponse) {
            return shellResponse;
          }
          return new Response(
            '<!DOCTYPE html><html lang="th"><head><meta charset="utf-8"/><title>SedChar.AI - Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#09090b;color:#fff;"><h2>คุณกำลังอยู่ในโหมดออฟไลน์</h2><p>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:12px;background:#7c3aed;color:#fff;border:none;cursor:pointer;font-weight:bold;">โหลดใหม่</button></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 4. Static Assets & Media (/_next/static/*, fonts, CSS, JS, images)
  // Strategy: Cache-First (Serves from local cache instantly, fetches from network only if missing)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
    );
    return;
  }

  // 5. Default Strategy for general requests -> Stale-While-Revalidate with guaranteed Response
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (cachedResponse) return cachedResponse;
          return new Response('', { status: 504, statusText: 'Offline' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
