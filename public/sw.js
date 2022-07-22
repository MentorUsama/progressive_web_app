self.addEventListener("install", (event) => {
  console.log("[Service worker] Installing service worker ...", event);
  event.waitUntill(
    caches.open("static").then((cache) => {
      console.log("[service worker] pre caching");
      cache.add("./src/js/app.js");
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service worker] activating service worker ...", event);
  return self.clients.claim();
});

// Trigger when something is fetched or we manually send fetched event
self.addEventListener("fetch", (event) => {
  console.log("[Service worker] fetching....", event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      else return fetch(event.request);
    })
  ); // Overwrite data that is get back
});
