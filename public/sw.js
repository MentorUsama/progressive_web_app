self.addEventListener("install", (event) => {
  console.log("[Service worker] Installing service worker ...", event);
  event.waitUntill(
    caches.open("static").then((cache) => {
      console.log("[service worker] pre caching");
      cache.addAll([
        "/",
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
            if(key!='static-v2' && key!='dynamic')
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
      if (response) return response;
      else
        return fetch(event.request).then((res) => {
          return caches.open("dynamic").then((res) => {
            cache.put(event.request.url, res.clone());
            return res;
          });
        }).catch(error=>{

        });
    })
  ); // Overwrite data that is get back
});
