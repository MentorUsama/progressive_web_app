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
workboxSW.precache([]);
