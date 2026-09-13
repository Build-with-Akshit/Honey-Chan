/* HoneyChain service worker — offline-first for verify flows.
 *
 * Strategy:
 *  - /api/verify/*  → network-first; every success is cached; offline serves
 *    the last cached verdict; never-cached batches get an honest 503 JSON.
 *  - Navigations (esp. /verify/*) → network-first, cache fallback, then
 *    a self-contained offline.html.
 *  - Static assets → cache-first.
 *  - POSTs are never intercepted: the harvest outbox lives in the page
 *    (lib/offline.ts) and flushes when connectivity returns.
 */
const VERIFY_API_CACHE = "hc-verify-api-v1";
const PAGES_CACHE = "hc-pages-v1";
const STATIC_CACHE = "hc-static-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(["/offline.html", "/scan"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = [VERIFY_API_CACHE, PAGES_CACHE, STATIC_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheable(res) {
  return res && res.ok && res.type === "basic";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1. Verify API — network-first with cache fallback.
  if (url.pathname.startsWith("/api/verify/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(VERIFY_API_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (hit) =>
              hit ||
              new Response(
                JSON.stringify({
                  offline: true,
                  error:
                    "No internet, and this batch was never scanned on this phone. Find signal or use the SMS code printed on the label.",
                }),
                { status: 503, headers: { "Content-Type": "application/json" } }
              )
          )
        )
    );
    return;
  }

  // 2. Page navigations — network-first, page cache, offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(PAGES_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match("/offline.html"))
        )
    );
    return;
  }

  // 3. Static assets — cache-first.
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons") || url.pathname === "/favicon.png") {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
