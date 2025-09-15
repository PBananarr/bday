/* sw.js — Globaler Service Worker für Birthday-Quest */

const VERSION = "v1.42.";               // <<< bei jedem Release anpassen
self.VERSION = VERSION;
const STATIC_CACHE = `bq-static-${VERSION}`;
const RUNTIME_CACHE = `bq-runtime-${VERSION}`;

// Passe diese Liste an, wenn du neue, kritische Dateien hinzufügst.
const PRECACHE = [
  "./",
  "./index.html",
  "./core/core.css",
  "./core/main.js",

  // Tag 1
  "./days/tag1-sternbild/picSternbild/thaiMonsteraThemeStars.png",
  "./days/tag1-sternbild/sternbild.js",
  "./days/tag1-sternbild/sternbild.css",
  "./days/tag1-sternbild/sternbild_data.js",
  // Tag 2
  "./days/tag2-survival/survival.js",
  "./days/tag2-survival/survival.css",
  "./days/tag2-survival/survival_data.js",
  // Tag 3
  "./days/tag3-escape/escape.js",
  "./days/tag3-escape/escape.css",
  "./days/tag3-escape/escape_data.js",
  // Tag 4
  "./days/tag4-horror/horror_data.js",
  "./days/tag4-horror/horror.css",
  "./days/tag4-horror/horror.js",
  // Tag 5
  "./days/tag5-sport/sport_data.js",
  "./days/tag5-sport/sport.css",
  "./days/tag5-sport/sport.js",
  // Tag 6
  "./days/tag6-puzzle/puzzle_data.js",
  "./days/tag6-puzzle/puzzle.css",
  "./days/tag6-puzzle/puzzle.js",
  // Tag 7
  "./days/tag7-finale/finale_data.js",
  "./days/tag7-finale/finale.js",
  "./days/tag7-finale/finale.css"
];

// Hilfsfunktion: nur gleiche Origin cachen
const sameOrigin = (url) => new URL(url, self.location).origin === self.location.origin;

// INSTALL: Precache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "GET_VERSION") {
    // robust: an alle Fenster senden (auch uncontrolled)
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => clients.forEach(c => c.postMessage({ type: "VERSION", version: VERSION })));
  }
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// ACTIVATE: Alte Caches löschen, sofort übernehmen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("bq-") && ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: 
// - Navigationsanfragen: network-first (offline Fallback aus Cache)
// - Statische Assets (.js, .css, Bilder): stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Nur GET cachen
  if (req.method !== "GET") return;

  // 1) Navigationsrequests (HTML)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("./index.html")))
    );
    return;
  }

  // 2) Gleiche Origin + statische Dateitypen → SWR
  const url = new URL(req.url);
  const isStatic = /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|json|woff2?)$/i.test(url.pathname);

  if (sameOrigin(req.url) && isStatic) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const networkPromise = fetch(req)
        .then((res) => {
          // Nur erfolgreiche Responses cachen
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);

      // Sofort cached zurückgeben (falls vorhanden), sonst Netz
      return cached || (await networkPromise) || fetch(req);
    })());
  }
});


