const CACHE_NAME = "choi-app-shell-v1";
const PRECACHE_URLS = [
  "/",
  "/search",
  "/offline",
  "/logo.svg",
  "/mascot.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/images/choi-teapot.png",
  "/images/listings/apartment.png",
  "/images/listings/coat.png",
  "/images/listings/cobalt.png",
  "/images/listings/courier.png",
  "/images/listings/iphone.png",
  "/images/listings/repair.png"
];

function isPrivateOrLiveRequest(request) {
  const url = new URL(request.url);

  if (url.hostname.includes("supabase.co")) {
    return true;
  }

  if (
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/chat/") ||
    url.pathname.startsWith("/profile/") ||
    url.pathname.startsWith("/listing/")
  ) {
    return true;
  }

  return request.headers.get("upgrade") === "websocket";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || isPrivateOrLiveRequest(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request, { ignoreSearch: true })
          .then((response) => response || caches.match("/offline"))
          .then((response) => response || Response.error())
      )
    );
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCacheableAsset =
    isSameOrigin &&
    ["image", "style", "script", "font", "manifest"].includes(request.destination);

  if (!isCacheableAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const responseCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        return networkResponse;
      });
    })
  );
});
