/// <reference lib="webworker" />

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

// Static assets to pre-cache
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/pwa/icon-192x192.svg",
  "/pwa/icon-512x512.svg",
];

// Patterns that should NEVER be cached (auth, API, sensitive data)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,          // All API routes (including Next.js API routes)
  /\/auth\//,         // Auth endpoints
  /\/_next\/data\//,  // Next.js server-side data fetches (may contain auth state)
  /\/dashboard/,      // Protected routes - never serve stale
];

// Patterns for static assets that are safe to cache
const CACHEABLE_STATIC_PATTERNS = [
  /\/_next\/static\//,  // Next.js static bundles (JS, CSS)
  /\/pwa\//,            // PWA icons
  /\/static\//,         // Public static assets
  /\/icons\//,          // Public icons
  /\/images\//,         // Public images
  /\/lang\//,           // Language files
  /\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot)$/i, // Static file types
];

// ─── Install ─────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  // Activate immediately without waiting for old SW to release
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old cache versions
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("static-") && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
      // Take control of all open clients immediately
      await self.clients.claim();
    })()
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Never cache sensitive/authenticated requests
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request).catch(() => {
        // If it's a navigation request and we're offline, show offline page
        if (request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
        return new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Cache-first for static assets
  if (CACHEABLE_STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for navigation (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
});

// ─── Messages from client ────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Clear all caches on logout or tenant switch
  if (event.data === "CLEAR_CACHES") {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
    // Re-precache essentials after clearing
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS));
  }
});
