var CACHE_STATIC_NAME = "static-v39"
var CACHE_DYNAMIC_NAME = "dynamic-v39"
const STATIC_FILES_ARRAY=[
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
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
]

function trimCache(cacheName,maxItems){
  caches.open(cacheName)
    .then(function(cache){
      return cache.keys().then(function(keys){
        if(keys.length>maxItems){
          cache.delete(keys[0]).then(trimCache(cacheName,maxItems))
        }
      })
    })
}
self.addEventListener("install", (event) => {
  console.log("[Service worker] Installing service worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[service worker] pre caching");
      cache.addAll(STATIC_FILES_ARRAY);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keyList)=>{
        return Promise.all(
          keyList.map((key)=>{
            if(key!=CACHE_STATIC_NAME && key!=CACHE_DYNAMIC_NAME)
            {
              console.log('[service worker] removing cache',key)
              console.log("deleting")
              return caches.delete(key)
            }
          })
        )
      })
  )
  return self.clients.claim();
});

function isInArray(string,array){
  for(var i=0;i<array.length;i++)
  {
    if(array[i]==string)
      return true
  }
  return false
}
// ============== Cache then network ==============
// Trigger when something is fetched or we manually send fetched event
self.addEventListener("fetch", (event) => {
  const url="https://httpbin.org/get"
  if(event.request.url.indexOf(url)>-1) // This is for the case where you are providing old data and now fetching new one
  {
    console.log("First if")
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then((cache)=>{
        return fetch(event.request).then((res) => {
          trimCache(CACHE_DYNAMIC_NAME,3)
          cache.put(event.request,res.clone())
          return res
        })
      })
    );
  }
  else if (isInArray(STATIC_FILES_ARRAY,event.request)) {
    event.respondWith(
      caches.match(event.request)
    );
  }
  else // Otherwise you will get data from cache if found then good if not found then send request
  {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response; // If found in cache
        else // if not found in cache return server request and also add in cache
          return fetch(event.request).then((res) => {
            return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              trimCache(CACHE_DYNAMIC_NAME,3)
              cache.put(event.request.url, res.clone());
              return res;
            });
          }).catch(error=>{ // If nothing found and the request contain html file then offline file is send
            return caches.open(CACHE_STATIC_NAME).then((cache)=>{
              if(event.request.headers.get('accept').includes('text/html'))
                return cache.match("/offline.html")
            })
          });
      })
    )
  }
});


// ============== Caching with network fallback and dynamic caching ==============
// Trigger when something is fetched or we manually send fetched event
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) return response; // If found in cache
//       else
//         return fetch(event.request).then((res) => {
//           return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//             cache.put(event.request.url, res.clone());
//             return res;
//           });
//         }).catch(error=>{ // if neither found in cache and neither did fetch request success
//           return caches.open(CACHE_STATIC_NAME).then((cache)=>{
//             return cache.match("/offline.html")
//           })
//         });
//     })
//   ); // Overwrite data that is get back
// });


// ============== Network with caching fallback with dynamic caching ==============
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });


// ============== Cache-only ==============
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });


// ============== Network-only ==============
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
