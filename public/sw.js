var CACHE_STATIC_NAME = "static-v11"
var CACHE_DYNAMIC_NAME = "dynamic-v2"

self.addEventListener("install", (event) => {
  console.log("[Service worker] Installing service worker ...", event);
  event.waitUntill(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[service worker] pre caching");
      cache.addAll([
        "/",
        "./offline.html",
        "./index.html",
        "./src/js/app.js",
        "./src/js/feed.js",
        "./src/js/promise.js",
        "./src/js/fetch.js",
        "./src/js/material.min.js",
        "./src/css/app.css",
        "./src/css/feed.css",
        "./src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntill(
    caches.keys()
      .then((keyList)=>{
        return Promise.all(
          keyList.map((key)=>{
            if(key!=CACHE_STATIC_NAME && key!=CACHE_DYNAMIC_NAME)
            {
              console.log('[service worker] removing cache',key)
              return caches.delete(key)
            }
          })
        )
      })
  )
  return self.clients.claim();
});

// Trigger when something is fetched or we manually send fetched event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response; // If found in cache
      else
        return fetch(event.request).then((res) => {
          return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
            cache.put(event.request.url, res.clone());
            return res;
          });
        }).catch(error=>{ // if neither found in cache and neither did fetch request success
          return caches.open(CACHE_STATIC_NAME).then((cache)=>{
            return cache.match("/offline.html")
          })
        });
    })
  ); // Overwrite data that is get back
});
