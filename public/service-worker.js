importScripts("./src/js/idb.js");
importScripts("./src/js/utility.js");

importScripts("workbox-sw.prod.v2.1.3.js");
const workboxSW = new self.WorkboxSW();
// ============= Listening To post sync event =============
self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background syncing", event);
  if (event.tag === "sync-new-posts") {
    console.log("Syncing New Posts", event);
    event.waitUntil(
      readAllData("sync-posts").then(function (data) {
        for (var dt of data) {
          var postData = new FormData();
          console.log("syncing");
          postData.append("id", dt.id);
          postData.append("title", dt.title);
          postData.append("location", dt.location);
          postData.append("rawLocationLat", dt.rawLocation.lat);
          postData.append("rawLocationLng", dt.rawLocation.lng);
          console.log("syncing soon");
          const myFile = new File([dt.file], "image.png", {
            type: dt.file.type,
          });
          console.log(myFile);
          postData.append("file", myFile);
          fetch("http://localhost:8080/post", {
            method: "POST",
            body: postData,
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

// ============ Notification Click Listeners ============
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
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
      })
    );
    notification.close();
  }
});
// ============ Push Notification Listners ============
self.addEventListener("push", function (event) {
  console.log("Push notification received", event);
  var data = { title: "New!", content: "Something New Happened", openUrl: "/" };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var option = {
    content: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl,
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, option));
});

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-font",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
  })
);
workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
);
workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "post-images",
  })
);
workboxSW.router.registerRoute(
  "https://practise-c4216-default-rtdb.firebaseio.com/posts.json",
  function (args) {
    return fetch(args.event.request).then((res) => {
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
    });
  }
);
workboxSW.router.registerRoute(
  function (routeData) {
    return routeData.event.request.headers.get("accept").includes("text/html");
  },
  function (args) {
    return caches.match(args.event.request).then((response) => {
      if (response) return response; // If found in cache
      // if not found in cache return server request and also add in cache
      else
        return fetch(args.event.request)
          .then((res) => {
            return caches.open("dynamic").then((cache) => {
              cache.put(args.event.request.url, res.clone());
              return res;
            });
          })
          .catch((error) => {
            // If nothing found and the request contain html file then offline file is send
            return caches.match("/offline.html").then((response) => {
              return response;
            });
          });
    });
  }
);
workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "bcd6576d9dad76b70c74f629e38d4b0a"
  },
  {
    "url": "manifest.json",
    "revision": "442b7e9dbfd256ccf34df2869bd0e1d5"
  },
  {
    "url": "offline.html",
    "revision": "f17d802579bfd82b575131665881e829"
  },
  {
    "url": "service-worker.js",
    "revision": "36c248e26316b780665586215af9c45d"
  },
  {
    "url": "src/css/app.css",
    "revision": "6d09f74487baae2843eb6b8983064f6f"
  },
  {
    "url": "src/css/feed.css",
    "revision": "28a96e88dbdc5b72ff593a483fb4b014"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "0d56f6cbdc0791ceb62c86e88663281c"
  },
  {
    "url": "src/js/feed.js",
    "revision": "1bdd757369d7b4a711f80ab9cdc62b2c"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "2714964b1bcde7ce3e249c8ccbc12c9b"
  },
  {
    "url": "sw-base.js",
    "revision": "dd8ef5f79706ff6049c6c75b3983ebfb"
  },
  {
    "url": "sw.js",
    "revision": "022111720286ed9fedbdae35b48c8f9d"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);
