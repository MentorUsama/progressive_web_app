importScripts("./src/js/idb.js");
importScripts("./src/js/utility.js");
var CACHE_STATIC_NAME = "static-v66";
var CACHE_DYNAMIC_NAME = "dynamic-v66";
const STATIC_FILES_ARRAY = [
  "/",
  "./offline.html",
  "./index.html",
  "./src/js/app.js",
  "./src/js/feed.js",
  "./src/js/idb.js",
  "./src/js/promise.js",
  "./src/js/fetch.js",
  "./src/js/material.min.js",
  "./src/css/app.css",
  "./src/css/feed.css",
  "./src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];
// function trimCache(cacheName,maxItems){
//   caches.open(cacheName)
//     .then(function(cache){
//       return cache.keys().then(function(keys){
//         if(keys.length>maxItems){
//           cache.delete(keys[0]).then(trimCache(cacheName,maxItems))
//         }
//       })
//     })
// }
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
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key != CACHE_STATIC_NAME && key != CACHE_DYNAMIC_NAME) {
            console.log("[service worker] removing cache", key);
            console.log("deleting");
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == string) return true;
  }
  return false;
}
// ============== Cache then network ==============
// Trigger when something is fetched or we manually send fetched event
self.addEventListener("fetch", (event) => {
  const url = "https://practise-c4216-default-rtdb.firebaseio.com/posts.json";
  if (event.request.url.indexOf(url) > -1) {
    // This is for the case where you are providing old data and now fetching new one
    console.log("First if");
    event.respondWith(
      fetch(event.request).then((res) => {
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeDate("posts", data[key]);
            }
          });
        return res;
      })
    );
  } else if (isInArray(STATIC_FILES_ARRAY, event.request)) {
    event.respondWith(caches.match(event.request));
  } // Otherwise you will get data from cache if found then good if not found then send request
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response; // If found in cache
        // if not found in cache return server request and also add in cache
        else
          return fetch(event.request)
            .then((res) => {
              return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                // trimCache(CACHE_DYNAMIC_NAME,3)
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((error) => {
              // If nothing found and the request contain html file then offline file is send
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (event.request.headers.get("accept").includes("text/html"))
                  return cache.match("/offline.html");
              });
            });
      })
    );
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

// ============= Listening To Different Syunc Event =============
self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background syncing", event);
  if (event.tag === "sync-new-posts") {
    console.log("Syncing New Posts", event);
    // Syncing new post
    event.waitUntil(
      readAllData("sync-posts").then(function (data) {
        for (var dt of data) {
          fetch("http://localhost:8080/post", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: dt.id,
              title: dt.title,
              location: dt.location,
              image:
                "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
            }),
          })
            .then(function (res) {
              console.log(res);
              if (res.ok) {
                res.json().then(function (resData) {
                  console.log(resData);
                  deleteItemFromData("sync-posts", resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log("Failed To Delete Data");
            });
        }
      })
    );
  }
});

// ============ Service Worker Listners ============
self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var action = event.action;
  console.log(notification);
  if (action == "confirm") {
    console.log("Confirm Was Choosen");
    notification.close();
  } else {
    console.log("Another action was choosen", action);
    event.waitUntil(
      clients.matchAll().then(function (clis) {
        var client = clis.find(function (c) {
          return c.visibilityState == "visible";
        });
        if (client != undefined) {
          client.navigate("http://127.0.0.1:8081");
          client.focus();
        } else {
          clients.openWindow("http://127.0.0.1:8081");
        }
      })
    );
    notification.close();
  }
});

// self.addEventListener('notificationclose', function(event) {
//   console.log('Notification was closed', event);
// });

self.addEventListener("push", function (event) {
  console.log("Push notification received", event);
  var data = { title: "New!", content: "Something New Happened" };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var option = {
    content: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
  };
  event.waitUntil(self.registration.showNotification(data.title, option));
});
