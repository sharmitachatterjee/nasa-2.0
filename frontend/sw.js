// ABNF Service Worker - Offline Shell & Deep Space Cache
const CACHE_NAME = "abnf-v1-shell";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/signal.html",
  "/then-now.html",
  "/ask.html",
  "/lander.html",
  "/farewell.html",
  "/teachers.html",
  "/ar.html",
  "/mission.html",
  "/explore.html",
  "/quiz.html",
  "/login.html",
  "/signup.html",
  "/css/auth.css",
  "/css/tools.css",
  "/css/story.css",
  "/css/map.css",
  "/css/quiz.css",
  "/js/i18n.js",
  "/js/pwa.js",
  "/js/signal.js",
  "/js/then-now.js",
  "/js/ask.js",
  "/js/lander.js",
  "/js/farewell.js",
  "/js/ar.js",
  "/data/stories.json",
  "/data/sites.json",
  "/data/quiz.json",
  "/assets/icon-192.svg",
  "/assets/icon-512.svg",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("Pre-caching partial failure, proceeding:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // For API endpoints, prefer network, fall back to offline friendly JSON
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline mode. Remote telemetry unavailable." }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for static files
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
